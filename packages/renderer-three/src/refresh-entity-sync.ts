/**
 * File: refresh-entity-sync.ts
 * Purpose: Synchronize Quake II client refresh entities into Three.js scene objects using the ported alias and sprite renderer conventions.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the client refresh frame and the Three.js backend.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/qcommon
 * - three
 */

import {
  BufferAttribute,
  BufferGeometry,
  Euler,
  Frustum,
  DataTexture,
  Group,
  Matrix4,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Raycaster,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  Vector3,
  type Camera,
  type Object3D,
  type Texture
} from "three";
import type { ClientRefreshFrame, ClientRenderEntity, ClientRuntime } from "../../client/src/index.js";
import { createEntity, createRefDef, type entity_t } from "../../client/src/ref.js";
import {
  AngleVectors,
  CS_MODELS,
  DotProduct,
  RF_DEPTHHACK,
  RF_FRAMELERP,
  RF_TRANSLUCENT,
  RF_WEAPONMODEL,
  type cplane_t
} from "../../qcommon/src/index.js";
import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parsePcx, parseSp2, type dsprite_t } from "../../formats/src/index.js";
import { applyMd2AliasFrameLerp, applyMd2Frame, buildMd2Mesh, loadMd2Model, type Md2MeshInstance } from "./md2-mesh-builder.js";
import {
  R_DrawEntitiesOnList,
  R_DrawSpriteModel,
  createGlRmainRuntime,
  type GlRmainRuntime,
  type GlRmainSpriteVertex
} from "./gl-rmain.js";
import { createModel, modtype_t, type image_t, type model_t } from "./gl-model.js";
import {
  GL_DrawAliasShadow,
  R_CullAliasModel,
  aliasEntityHasShell,
  buildAliasShadeVector,
  buildAliasVertexColors,
  computeAliasShadeLight,
  sanitizeAliasFramePair
} from "./gl-mesh.js";

const MD2_MODEL_EXTENSION = ".md2";
const SPRITE_MODEL_EXTENSION = ".sp2";
/**
 * Category: New
 * Purpose: Hold one renderable MD2 instance bound to a client refresh entity key.
 *
 * Constraints:
 * - Must preserve the current model path so runtime model swaps can rebuild the instance cleanly.
 */
interface RefreshEntityMd2Instance {
  kind: "md2";
  key: string;
  modelPath: string;
  skinnum: number;
  root: Group;
  md2: Md2MeshInstance;
  shadowMesh: Mesh<BufferGeometry, MeshBasicMaterial>;
}

interface RefreshEntitySpriteInstance {
  kind: "sprite";
  key: string;
  modelPath: string;
  skinnum: number;
  root: Group;
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  model: model_t;
  spriteRuntime: GlRmainRuntime;
}

interface RefreshEntityInlineBrushInstance {
  kind: "inline-brush";
  key: string;
  modelPath: string;
  skinnum: number;
  root: Group;
}

type RefreshEntityInstance = RefreshEntityMd2Instance | RefreshEntitySpriteInstance | RefreshEntityInlineBrushInstance;

interface ThreeSpriteImageHandle {
  texture: Texture;
}

type QueuedRefreshEntity = entity_t & {
  userData: {
    source: ClientRenderEntity;
    instance: RefreshEntityInstance;
    framePair: { frame: number; oldframe: number } | null;
  };
};

interface RefreshEntityDrawContext {
  runtime: ClientRuntime;
  refreshFrame: ClientRefreshFrame | null;
  aliasShadowsEnabled: boolean;
  shadowReceiverRoot: Object3D | null;
  shadowRaycaster: Raycaster;
  attachedCamera: Camera | null;
}

/**
 * Category: New
 * Purpose: Report the visible and rendered entity counts produced by the sync step.
 *
 * Constraints:
 * - Must describe only the entities processed through this entity adapter.
 */
export interface RefreshEntitySyncStats {
  visibleEntities: number;
  renderedEntities: number;
  skippedNoModelIndex: number;
  skippedMissingConfigstring: number;
  skippedNonMd2Model: number;
  skippedInlineOrBrushModel: number;
  missingMd2AssetCount: number;
}

/**
 * Category: New
 * Purpose: Hold the imperative sync hook used by the browser renderer to mirror the current client refresh frame.
 */
export interface ThreeRefreshEntitySync {
  root: Group;
  viewWeaponRoot: Group;
  attachToCamera: (camera: Camera) => void;
  setAliasShadowsEnabled: (enabled: boolean) => void;
  setShadowReceiverRoot: (root: Object3D | null) => void;
  apply: (runtime: ClientRuntime, refreshFrame: ClientRefreshFrame | null) => RefreshEntitySyncStats;
}

/**
 * Category: New
 * Purpose: Build one Three.js adapter that renders client refresh entities backed by MD2 alias models and SP2 sprites.
 *
 * Constraints:
 * - Must resolve model paths through client configstrings.
 * - Must account for inline brush models that are drawn by the world-scene brush path.
 * - Must keep one stable scene node per `entityNumber` and linked-model slot.
 */
export function createThreeRefreshEntitySync(filesystem: VirtualFilesystem): ThreeRefreshEntitySync {
  const root = new Group();
  root.name = "refresh-entities";
  const viewWeaponRoot = new Group();
  viewWeaponRoot.name = "refresh-view-weapon";
  let attachedCamera: Camera | null = null;
  let aliasShadowsEnabled = false;
  let shadowReceiverRoot: Object3D | null = null;
  const shadowRaycaster = new Raycaster();

  const modelCache = new Map<string, ReturnType<typeof loadMd2Model>>();
  const spriteCache = new Map<string, model_t | null>();
  const spriteTextureCache = new Map<string, Texture | null>();
  const instances = new Map<string, RefreshEntityInstance>();
  let drawContext: RefreshEntityDrawContext | null = null;
  const entityRuntime = createGlRmainRuntime({
    drawAliasModel: (entity) => {
      const queued = entity as QueuedRefreshEntity;
      const context = requireEntityDrawContext(drawContext);
      updateRefreshEntityInstance(
        context.runtime,
        context.refreshFrame,
        queued.userData.instance,
        queued.userData.source,
        queued.userData.framePair,
        context.aliasShadowsEnabled,
        context.shadowReceiverRoot,
        context.shadowRaycaster,
        context.attachedCamera
      );
    },
    drawBrushModel: (entity) => {
      const queued = entity as QueuedRefreshEntity;
      updateRefreshInlineBrushInstance(queued.userData.instance as RefreshEntityInlineBrushInstance, queued.userData.source);
    },
    onDrawSpriteModel: (entity, texture, alpha, vertices) => {
      const queued = entity as QueuedRefreshEntity;
      const instance = queued.userData.instance;
      if (instance.kind !== "sprite") {
        return;
      }
      instance.mesh.userData.refGl = {
        translucent: (queued.userData.source.flags & RF_TRANSLUCENT) !== 0
      };
      applySpriteQuad(instance.mesh, texture, alpha, vertices);
      instance.root.position.set(0, 0, 0);
      instance.root.rotation.set(0, 0, 0);
      instance.root.visible = true;
      instance.mesh.material.depthTest = (queued.userData.source.flags & RF_DEPTHHACK) === 0;
      instance.mesh.material.depthWrite = (queued.userData.source.flags & RF_DEPTHHACK) === 0;
      instance.mesh.renderOrder = (queued.userData.source.flags & RF_DEPTHHACK) !== 0 ? 1000 : 0;
    },
    onDepthMaskChange: (enabled) => {
      root.userData.refGl = {
        ...root.userData.refGl,
        depthMask: enabled
      };
    }
  });
  entityRuntime.r_drawentities = createRuntimeCvar("r_drawentities", 1);

  return {
    root,
    viewWeaponRoot,
    attachToCamera: (camera) => {
      attachedCamera = camera;
      if (viewWeaponRoot.parent !== camera) {
        viewWeaponRoot.removeFromParent();
        camera.add(viewWeaponRoot);
      }
    },
    setAliasShadowsEnabled: (enabled) => {
      aliasShadowsEnabled = enabled;
    },
    setShadowReceiverRoot: (rootNode) => {
      shadowReceiverRoot = rootNode;
    },
    apply: (runtime, refreshFrame) => {
      const activeKeys = new Set<string>();
      let visibleEntities = 0;
      let renderedEntities = 0;
      let skippedNoModelIndex = 0;
      let skippedMissingConfigstring = 0;
      let skippedNonMd2Model = 0;
      let skippedInlineOrBrushModel = 0;
      let missingMd2AssetCount = 0;
      const aliasCullFrustum = attachedCamera ? buildAliasCullFrustum(attachedCamera) : null;
      const drawEntities: QueuedRefreshEntity[] = [];

      for (const entity of refreshFrame?.entities ?? []) {
        visibleEntities += 1;

        const skipReason = classifyRefreshModelSkipReason(runtime, entity);
        if (skipReason === "no-modelindex") {
          skippedNoModelIndex += 1;
          continue;
        }
        if (skipReason === "missing-configstring") {
          skippedMissingConfigstring += 1;
          continue;
        }
        if (skipReason === "inline-or-brush") {
          skippedInlineOrBrushModel += 1;
          continue;
        }
        if (skipReason === "non-md2") {
          skippedNonMd2Model += 1;
          continue;
        }

        const modelPath = resolveRefreshModelPath(runtime, entity);
        if (!modelPath) {
          continue;
        }

        const key = buildRefreshEntityKey(entity);
        activeKeys.add(key);

        let instance = instances.get(key) ?? null;
        if (instance && (instance.modelPath !== modelPath || instance.skinnum !== entity.skinnum)) {
          removeRefreshEntityInstance(instances, key);
          instance = null;
        }

        if (!instance) {
          instance = createRefreshEntityInstance(filesystem, modelCache, spriteCache, spriteTextureCache, key, modelPath, entity.skinnum);
          if (!instance) {
            missingMd2AssetCount += 1;
            continue;
          }

          instances.set(key, instance);
          getRefreshEntityParent(entity, root, viewWeaponRoot).add(instance.root);
        }

        const framePair = instance.kind === "md2"
          ? sanitizeAliasFramePair(entity.frame, entity.oldframe, instance.md2.model.frames.length)
          : null;

        if (
          instance.kind === "md2" &&
          (entity.flags & RF_WEAPONMODEL) === 0 &&
          aliasCullFrustum &&
          R_CullAliasModel(instance.md2.model, {
            origin: [...entity.origin],
            angles: [...entity.angles],
            frame: entity.frame,
            oldframe: entity.oldframe
          }, aliasCullFrustum).culled
        ) {
          instance.root.visible = false;
          continue;
        }

        drawEntities.push(createQueuedRefreshEntity(entity, instance, framePair));
        renderedEntities += 1;
      }

      for (const [key] of instances) {
        if (!activeKeys.has(key)) {
          removeRefreshEntityInstance(instances, key);
        }
      }

      drawContext = {
        runtime,
        refreshFrame,
        aliasShadowsEnabled,
        shadowReceiverRoot,
        shadowRaycaster,
        attachedCamera
      };
      const refdef = createRefDef();
      refdef.num_entities = drawEntities.length;
      refdef.entities = drawEntities;
      entityRuntime.r_newrefdef = refdef;
      const vectors = refreshFrame ? AngleVectors(refreshFrame.view.viewangles) : null;
      entityRuntime.vup = vectors ? [...vectors.up] : [0, 0, 1];
      entityRuntime.vright = vectors ? [...vectors.right] : [1, 0, 0];
      entityRuntime.vpn = vectors ? [...vectors.forward] : [1, 0, 0];
      R_DrawEntitiesOnList(entityRuntime);
      drawContext = null;

      root.userData.refGl = {
        ...root.userData.refGl,
        source: "R_DrawEntitiesOnList",
        queuedEntities: drawEntities.length
      };

      return {
        visibleEntities,
        renderedEntities,
        skippedNoModelIndex,
        skippedMissingConfigstring,
        skippedNonMd2Model,
        skippedInlineOrBrushModel,
        missingMd2AssetCount
      };
    }
  };
}

function createQueuedRefreshEntity(
  source: ClientRenderEntity,
  instance: RefreshEntityInstance,
  framePair: { frame: number; oldframe: number } | null
): QueuedRefreshEntity {
  const entity = createEntity() as QueuedRefreshEntity;
  entity.model = instance.kind === "md2"
    ? createQueuedModel(modtype_t.mod_alias)
    : instance.kind === "sprite"
      ? instance.model
      : createQueuedModel(modtype_t.mod_brush);
  entity.angles = [...source.angles];
  entity.origin = [...source.origin];
  entity.frame = source.frame;
  entity.oldorigin = [...source.oldorigin];
  entity.oldframe = source.oldframe;
  entity.backlerp = source.backlerp;
  entity.skinnum = source.skinnum;
  entity.lightstyle = 0;
  entity.alpha = source.alpha;
  entity.skin = null;
  entity.flags = source.flags;
  entity.userData = {
    source,
    instance,
    framePair
  };
  return entity;
}

function createQueuedModel(type: modtype_t): model_t {
  const model = createModel();
  model.type = type;
  return model;
}

function requireEntityDrawContext(context: RefreshEntityDrawContext | null): RefreshEntityDrawContext {
  if (!context) {
    throw new Error("refresh-entity-sync: missing R_DrawEntitiesOnList draw context");
  }
  return context;
}

function createRuntimeCvar(name: string, value: number) {
  return {
    name,
    string: String(value),
    latched_string: null,
    flags: 0,
    modified: false,
    value
  };
}

function buildAliasCullFrustum(camera: Camera): [cplane_t, cplane_t, cplane_t, cplane_t] | null {
  if (!("projectionMatrix" in camera) || !("matrixWorldInverse" in camera)) {
    return null;
  }

  const clipMatrix = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const frustum = new Frustum().setFromProjectionMatrix(clipMatrix);

  if (frustum.planes.length < 4) {
    return null;
  }

  return [
    convertThreePlaneToQ2Plane(frustum.planes[0]),
    convertThreePlaneToQ2Plane(frustum.planes[1]),
    convertThreePlaneToQ2Plane(frustum.planes[2]),
    convertThreePlaneToQ2Plane(frustum.planes[3])
  ];
}

function convertThreePlaneToQ2Plane(plane: Frustum["planes"][number]): cplane_t {
  return {
    normal: [plane.normal.x, plane.normal.y, plane.normal.z],
    dist: -plane.constant,
    type: 5,
    signbits: 0,
    pad: [0, 0]
  };
}

/**
 * Category: New
 * Purpose: Resolve the current model path for one refresh entity through the client model configstrings.
 */
function resolveRefreshModelPath(runtime: ClientRuntime, entity: ClientRenderEntity): string | null {
  if (entity.resolvedModelPath) {
    return entity.resolvedModelPath;
  }

  if (entity.modelindex <= 0) {
    return null;
  }

  const modelPath = runtime.cl.configstrings[CS_MODELS + entity.modelindex] ?? "";
  if (!modelPath) {
    return null;
  }

  if (modelPath.startsWith("*")) {
    return modelPath;
  }

  if (!modelPath.endsWith(MD2_MODEL_EXTENSION) && !modelPath.endsWith(SPRITE_MODEL_EXTENSION)) {
    return null;
  }

  return modelPath;
}

/**
 * Category: New
 * Purpose: Classify why one refresh entity is outside the current MD2 world-object adapter scope.
 *
 * Constraints:
 * - Must distinguish missing model metadata from unsupported asset families.
 */
function classifyRefreshModelSkipReason(
  runtime: ClientRuntime,
  entity: ClientRenderEntity
): "no-modelindex" | "missing-configstring" | "inline-or-brush" | "non-md2" | null {
  if (entity.resolvedModelPath) {
    if (!entity.resolvedModelPath.endsWith(MD2_MODEL_EXTENSION) && !entity.resolvedModelPath.endsWith(SPRITE_MODEL_EXTENSION)) {
      return "non-md2";
    }

    return null;
  }

  if (entity.modelindex <= 0) {
    return "no-modelindex";
  }

  const modelPath = runtime.cl.configstrings[CS_MODELS + entity.modelindex] ?? "";
  if (!modelPath) {
    return "missing-configstring";
  }

  if (modelPath.startsWith("*")) {
    return null;
  }

  if (!modelPath.endsWith(MD2_MODEL_EXTENSION) && !modelPath.endsWith(SPRITE_MODEL_EXTENSION)) {
    return "non-md2";
  }

  return null;
}

/**
 * Category: New
 * Purpose: Build the stable key used to pair one refresh entity with its linked-model slot.
 */
function buildRefreshEntityKey(entity: ClientRenderEntity): string {
  return `${entity.entityNumber}:${entity.linkedModelSlot}`;
}

/**
 * Category: New
 * Purpose: Create one MD2-backed scene instance for the requested refresh entity model path.
 */
function createRefreshEntityInstance(
  filesystem: VirtualFilesystem,
  modelCache: Map<string, ReturnType<typeof loadMd2Model>>,
  spriteCache: Map<string, model_t | null>,
  spriteTextureCache: Map<string, Texture | null>,
  key: string,
  modelPath: string,
  skinnum: number
): RefreshEntityInstance | null {
  if (modelPath.startsWith("*")) {
    return createRefreshInlineBrushInstance(key, modelPath, skinnum);
  }

  if (modelPath.endsWith(SPRITE_MODEL_EXTENSION)) {
    return createRefreshSpriteInstance(filesystem, spriteCache, spriteTextureCache, key, modelPath, skinnum);
  }

  let model = modelCache.get(modelPath);
  if (model === undefined) {
    model = loadMd2Model(filesystem, modelPath);
    modelCache.set(modelPath, model);
  }

  if (!model) {
    return null;
  }

  const skinPath = resolveMd2SkinPath(model, skinnum);
  const md2 = skinPath
    ? buildMd2Mesh(filesystem, model, { skinPath })
    : buildMd2Mesh(filesystem, model);
  const shadowMesh = createMd2ShadowMesh(md2);
  const root = new Group();
  root.name = `refresh-entity:${key}`;

  root.add(md2.mesh);
  root.add(shadowMesh);

  return {
    kind: "md2",
    key,
    modelPath,
    skinnum,
    root,
    md2,
    shadowMesh
  };
}

/**
 * Category: New
 * Purpose: Apply the current refresh-entity transform and frame state onto one existing MD2 scene instance.
 */
function updateRefreshEntityInstance(
  runtime: ClientRuntime,
  refreshFrame: ClientRefreshFrame | null,
  instance: RefreshEntityInstance,
  entity: ClientRenderEntity,
  framePair: { frame: number; oldframe: number } | null,
  aliasShadowsEnabled: boolean,
  shadowReceiverRoot: Object3D | null,
  shadowRaycaster: Raycaster,
  attachedCamera: Camera | null
): void {
  if (instance.kind === "inline-brush") {
    updateRefreshInlineBrushInstance(instance, entity);
    return;
  }

  if (instance.kind === "sprite") {
    updateRefreshSpriteInstance(refreshFrame, instance, entity, attachedCamera);
    return;
  }

  if ((entity.flags & RF_WEAPONMODEL) !== 0) {
    const localPose = buildViewWeaponLocalPose(attachedCamera, refreshFrame, entity);
    instance.root.position.copy(localPose.position);
    instance.root.quaternion.copy(localPose.quaternion);
  } else {
    instance.root.position.set(entity.origin[0], entity.origin[1], entity.origin[2]);
    applyAliasEntityRotation(instance.root, entity);
  }
  instance.root.visible = true;

  const frame = framePair?.frame ?? entity.frame;
  const oldframe = framePair?.oldframe ?? entity.oldframe;

  if ((entity.flags & RF_FRAMELERP) !== 0 || aliasEntityHasShell(entity.flags)) {
    applyMd2AliasFrameLerp(instance.md2, {
      frame,
      oldframe,
      backlerp: entity.backlerp,
      flags: entity.flags,
      origin: [...entity.origin],
      oldorigin: [...entity.oldorigin],
      angles: [...entity.angles]
    });
  } else {
    applyMd2Frame(instance.md2, frame);
  }

  const shell = aliasEntityHasShell(entity.flags);
  const targetMap = shell ? null : instance.md2.skinTexture;
  if (instance.md2.mesh.material.map !== targetMap) {
    instance.md2.mesh.material.map = targetMap;
    instance.md2.mesh.material.needsUpdate = true;
  }

  const shadelight = computeAliasShadeLight({
    flags: entity.flags,
    rdflags: runtime.cl.frame.playerstate.rdflags,
    timeSeconds: runtime.cl.time / 1000,
    baseShadeLight: computeRefreshAliasLight(refreshFrame, entity.origin)
  });
  if (shell) {
    instance.md2.mesh.material.vertexColors = false;
    instance.md2.mesh.material.color.setRGB(shadelight[0], shadelight[1], shadelight[2]);
  } else {
    applyAliasVertexColorAttribute(instance, frame, entity.angles[1], shadelight);
    instance.md2.mesh.material.vertexColors = true;
    instance.md2.mesh.material.color.setRGB(1, 1, 1);
  }
  instance.md2.mesh.material.transparent = entity.alpha < 1 || (entity.flags & RF_TRANSLUCENT) !== 0;
  instance.md2.mesh.material.opacity = entity.alpha;
  instance.md2.mesh.material.depthTest = (entity.flags & RF_DEPTHHACK) === 0;
  instance.md2.mesh.material.depthWrite = (entity.flags & RF_DEPTHHACK) === 0;
  instance.md2.mesh.renderOrder = (entity.flags & RF_DEPTHHACK) !== 0 ? 1000 : 0;
  instance.md2.mesh.material.needsUpdate = true;
  updateRefreshAliasShadow(instance, entity, aliasShadowsEnabled, shadowReceiverRoot, shadowRaycaster);
}

/**
 * Category: New
 * Purpose: Represent one inline BSP model already handled by the world brush renderer.
 *
 * Constraints:
 * - Must keep the refresh entity accounted for so map audits do not treat brush models as dropped.
 */
function createRefreshInlineBrushInstance(
  key: string,
  modelPath: string,
  skinnum: number
): RefreshEntityInlineBrushInstance {
  const root = new Group();
  root.name = `refresh-inline-brush:${key}:${modelPath}`;
  return {
    kind: "inline-brush",
    key,
    modelPath,
    skinnum,
    root
  };
}

/**
 * Category: New
 * Purpose: Keep the placeholder transform synchronized with the client refresh entity.
 */
function updateRefreshInlineBrushInstance(
  instance: RefreshEntityInlineBrushInstance,
  entity: ClientRenderEntity
): void {
  instance.root.position.set(entity.origin[0], entity.origin[1], entity.origin[2]);
  applyAliasEntityRotation(instance.root, entity);
  instance.root.visible = true;
}

function computeRefreshAliasLight(
  refreshFrame: ClientRefreshFrame | null,
  origin: readonly [number, number, number]
): [number, number, number] {
  const shadelight: [number, number, number] = [1, 1, 1];
  if (!refreshFrame) {
    return shadelight;
  }

  for (const light of refreshFrame.lights) {
    const dx = origin[0] - light.origin[0];
    const dy = origin[1] - light.origin[1];
    const dz = origin[2] - light.origin[2];
    const add = (light.intensity - Math.sqrt(dx * dx + dy * dy + dz * dz)) * (1 / 256);
    if (add <= 0) {
      continue;
    }

    shadelight[0] += add * light.color[0];
    shadelight[1] += add * light.color[1];
    shadelight[2] += add * light.color[2];
  }

  return shadelight;
}

function applyAliasVertexColorAttribute(
  instance: RefreshEntityMd2Instance,
  frameIndex: number,
  yawDegrees: number,
  shadelight: [number, number, number]
): void {
  const geometry = instance.md2.mesh.geometry;
  const existing = geometry.getAttribute("color") as BufferAttribute | undefined;
  const expectedLength = instance.md2.vertexIndices.length * 3;

  let colorAttribute: BufferAttribute;
  if (!existing || (existing.array as Float32Array).length !== expectedLength) {
    colorAttribute = new BufferAttribute(new Float32Array(expectedLength), 3);
    geometry.setAttribute("color", colorAttribute);
  } else {
    colorAttribute = existing;
  }

  buildAliasVertexColors(
    instance.md2.model,
    frameIndex,
    instance.md2.vertexIndices,
    yawDegrees,
    shadelight,
    colorAttribute.array as Float32Array
  );
  colorAttribute.needsUpdate = true;
}

/**
 * Category: New
 * Purpose: Route refresh entities either to the world root or to the camera-bound first-person weapon root.
 *
 * Constraints:
 * - Must keep `RF_WEAPONMODEL` entities out of the world scene hierarchy.
 */
function getRefreshEntityParent(entity: ClientRenderEntity, worldRoot: Group, viewWeaponRoot: Group): Group {
  return (entity.flags & RF_WEAPONMODEL) !== 0 ? viewWeaponRoot : worldRoot;
}

/**
 * Category: New
 * Purpose: Apply the canonical Quake II alias-model rotation convention extracted from `R_DrawAliasModel` and `R_RotateForEntity`.
 *
 * Constraints:
 * - Must preserve the original yaw-around-Z, pitch-around-Y and roll-around-X semantics.
 * - Must preserve the alias-model special-case where pitch is inverted before `R_RotateForEntity`.
 * - Must apply rotations in the original effective order `Z -> Y -> X`.
 */
function applyAliasEntityRotation(root: Group, entity: ClientRenderEntity): void {
  const pitchRadians = MathUtils.degToRad(entity.angles[0]);
  const yawRadians = MathUtils.degToRad(entity.angles[1]);
  const rollRadians = MathUtils.degToRad(entity.angles[2]);

  root.rotation.set(-rollRadians, pitchRadians, yawRadians, "ZYX");
}

/**
 * Category: New
 * Purpose: Resolve the Quake II MD2 skin path selected by one entity `skinnum`.
 *
 * Constraints:
 * - Must fall back to the first skin when the requested index is missing.
 */
function resolveMd2SkinPath(
  model: NonNullable<ReturnType<typeof loadMd2Model>>,
  skinnum: number
): string | undefined {
  return model.skins[skinnum] ?? model.skins[0];
}

/**
 * Category: New
 * Purpose: Remove one scene instance that is no longer referenced by the current refresh frame.
 */
function removeRefreshEntityInstance(instances: Map<string, RefreshEntityInstance>, key: string): void {
  const instance = instances.get(key);
  if (!instance) {
    return;
  }

  instance.root.removeFromParent();
  disposeObject3D(instance.root);
  instances.delete(key);
}

function createRefreshSpriteInstance(
  filesystem: VirtualFilesystem,
  spriteCache: Map<string, model_t | null>,
  spriteTextureCache: Map<string, Texture | null>,
  key: string,
  modelPath: string,
  skinnum: number
): RefreshEntitySpriteInstance | null {
  let model = spriteCache.get(modelPath);
  if (model === undefined) {
    model = loadSpriteModel(filesystem, modelPath, spriteTextureCache);
    spriteCache.set(modelPath, model);
  }

  if (!model) {
    return null;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(12), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(8), 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);

  const material = new MeshBasicMaterial({
    transparent: true,
    depthWrite: true,
    color: 0xffffff
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;

  const root = new Group();
  root.name = `refresh-entity:${key}`;
  root.add(mesh);

  const spriteRuntime = createGlRmainRuntime({
    onDrawSpriteModel: (_entity, texture, alpha, vertices) => {
      applySpriteQuad(mesh, texture, alpha, vertices);
    }
  });

  return {
    kind: "sprite",
    key,
    modelPath,
    skinnum,
    root,
    mesh,
    model,
    spriteRuntime
  };
}

function updateRefreshSpriteInstance(
  refreshFrame: ClientRefreshFrame | null,
  instance: RefreshEntitySpriteInstance,
  entity: ClientRenderEntity,
  attachedCamera: Camera | null
): void {
  const viewangles = refreshFrame?.view.viewangles ?? [0, 0, 0];
  const vectors = AngleVectors(viewangles);

  const runtime = instance.spriteRuntime;
  runtime.currentmodel = instance.model;
  runtime.vup = [...vectors.up];
  runtime.vright = [...vectors.right];
  runtime.vpn = [...vectors.forward];

  const drawEntity: ClientRenderEntity = (entity.flags & RF_WEAPONMODEL) !== 0
    ? {
        ...entity,
        origin: buildViewWeaponLocalOrigin(attachedCamera, refreshFrame, entity.origin)
      }
    : entity;

  instance.mesh.userData.refGl = {
    translucent: (entity.flags & RF_TRANSLUCENT) !== 0
  };
  R_DrawSpriteModel(runtime, drawEntity as never);
  instance.root.position.set(0, 0, 0);
  instance.root.rotation.set(0, 0, 0);
  instance.root.visible = true;
  instance.mesh.material.depthTest = (entity.flags & RF_DEPTHHACK) === 0;
  instance.mesh.material.depthWrite = (entity.flags & RF_DEPTHHACK) === 0;
  instance.mesh.renderOrder = (entity.flags & RF_DEPTHHACK) !== 0 ? 1000 : 0;
}

function applySpriteQuad(
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>,
  texture: image_t | null,
  alpha: number,
  vertices: GlRmainSpriteVertex[]
): void {
  const position = mesh.geometry.getAttribute("position") as BufferAttribute;
  const uv = mesh.geometry.getAttribute("uv") as BufferAttribute;
  for (let index = 0; index < 4; index += 1) {
    const vertex = vertices[index];
    position.setXYZ(index, vertex.position[0], vertex.position[1], vertex.position[2]);
    uv.setXY(index, vertex.uv[0], vertex.uv[1]);
  }
  position.needsUpdate = true;
  uv.needsUpdate = true;
  mesh.geometry.computeBoundingSphere();

  mesh.material.map = asSpriteTexture(texture);
  mesh.material.opacity = alpha;
  mesh.material.transparent = alpha < 1 || Boolean(mesh.userData.refGl?.translucent);
  mesh.material.needsUpdate = true;
}

function loadSpriteModel(
  filesystem: VirtualFilesystem,
  modelPath: string,
  spriteTextureCache: Map<string, Texture | null>
): model_t | null {
  const file = readMountedFile(filesystem, modelPath);
  if (!file) {
    return null;
  }

  try {
    const sprite = parseSp2(file.bytes, file.path);
    const model = createModel();
    model.name = modelPath;
    model.type = modtype_t.mod_sprite;
    model.extradata = sprite;
    model.skins = sprite.frames.map((frame) => {
      const texture = loadSpriteTexture(filesystem, frame.name, spriteTextureCache);
      return texture ? ({ texture } as ThreeSpriteImageHandle as image_t) : null;
    });
    return model;
  } catch {
    return null;
  }
}

function loadSpriteTexture(
  filesystem: VirtualFilesystem,
  path: string,
  spriteTextureCache: Map<string, Texture | null>
): Texture | null {
  const cached = spriteTextureCache.get(path);
  if (cached !== undefined) {
    return cached;
  }

  const file = readMountedFile(filesystem, path);
  if (!file) {
    spriteTextureCache.set(path, null);
    return null;
  }

  try {
    const image = parsePcx(file.bytes, file.path);
    const texture = new DataTexture(image.rgba, image.width, image.height, RGBAFormat, UnsignedByteType);
    texture.flipY = false;
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    spriteTextureCache.set(path, texture);
    return texture;
  } catch {
    spriteTextureCache.set(path, null);
    return null;
  }
}

function createMd2ShadowMesh(md2: Md2MeshInstance): Mesh<BufferGeometry, MeshBasicMaterial> {
  const sourcePosition = md2.mesh.geometry.getAttribute("position") as BufferAttribute;
  const shadowGeometry = new BufferGeometry();
  shadowGeometry.setAttribute("position", new BufferAttribute(new Float32Array(sourcePosition.array.length), 3));

  const shadowMaterial = new MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });
  const shadowMesh = new Mesh(shadowGeometry, shadowMaterial);
  shadowMesh.visible = false;
  shadowMesh.renderOrder = -1;
  return shadowMesh;
}

function updateRefreshAliasShadow(
  instance: RefreshEntityMd2Instance,
  entity: ClientRenderEntity,
  enabled: boolean,
  shadowReceiverRoot: Object3D | null,
  shadowRaycaster: Raycaster
): void {
  const shouldDrawShadow =
    enabled &&
    (entity.flags & (RF_TRANSLUCENT | RF_WEAPONMODEL)) === 0 &&
    instance.root.visible;

  instance.shadowMesh.visible = shouldDrawShadow;
  if (!shouldDrawShadow) {
    return;
  }

  const sourcePosition = instance.md2.mesh.geometry.getAttribute("position") as BufferAttribute;
  const shadowPosition = instance.shadowMesh.geometry.getAttribute("position") as BufferAttribute;
  const sourceArray = sourcePosition.array as Float32Array;
  const targetArray = shadowPosition.array as Float32Array;

  const shadevector = buildAliasShadeVector(entity.angles[1]);
  // Deviation from original `lightspot`: approximate the downward world hit via Three.js raycast
  // against the registered world receiver root.
  const lheight = resolveAliasShadowLheight(entity, shadowReceiverRoot, shadowRaycaster);
  GL_DrawAliasShadow(sourceArray, shadevector, lheight, targetArray);

  shadowPosition.needsUpdate = true;
  instance.shadowMesh.geometry.computeBoundingSphere();
}

function resolveAliasShadowLheight(
  entity: ClientRenderEntity,
  shadowReceiverRoot: Object3D | null,
  shadowRaycaster: Raycaster
): number {
  if (!shadowReceiverRoot) {
    return entity.origin[2];
  }

  shadowRaycaster.set(
    new Vector3(entity.origin[0], entity.origin[1], entity.origin[2]),
    new Vector3(0, 0, -1)
  );
  shadowRaycaster.near = 0;
  shadowRaycaster.far = 2048;

  const hits = shadowRaycaster.intersectObject(shadowReceiverRoot, true);
  if (hits.length === 0) {
    return entity.origin[2];
  }

  return entity.origin[2] - hits[0].point.z;
}

function asSpriteTexture(image: image_t | null): Texture | null {
  if (!image || typeof image !== "object") {
    return null;
  }

  const candidate = image as Partial<ThreeSpriteImageHandle>;
  return candidate.texture ?? null;
}

function projectViewWeaponToCameraLocal(
  refreshFrame: ClientRefreshFrame | null,
  worldOrigin: [number, number, number]
): [number, number, number] {
  const view = refreshFrame?.view;
  if (!view) {
    return [...worldOrigin];
  }

  const relative: [number, number, number] = [
    worldOrigin[0] - view.vieworg[0],
    worldOrigin[1] - view.vieworg[1],
    worldOrigin[2] - view.vieworg[2]
  ];

  return [
    DotProduct(relative, view.right),
    DotProduct(relative, view.up),
    -DotProduct(relative, view.forward)
  ];
}

function buildViewWeaponLocalOrigin(
  attachedCamera: Camera | null,
  refreshFrame: ClientRefreshFrame | null,
  worldOrigin: [number, number, number]
): [number, number, number] {
  if (!attachedCamera || !attachedCamera.parent) {
    return projectViewWeaponToCameraLocal(refreshFrame, worldOrigin);
  }

  attachedCamera.updateMatrixWorld(true);
  const localOrigin = attachedCamera.worldToLocal(new Vector3(worldOrigin[0], worldOrigin[1], worldOrigin[2]));
  return [localOrigin.x, localOrigin.y, localOrigin.z];
}

function buildViewWeaponLocalPose(
  attachedCamera: Camera | null,
  refreshFrame: ClientRefreshFrame | null,
  entity: ClientRenderEntity
): { position: Vector3; quaternion: Quaternion } {
  const position = new Vector3(...buildViewWeaponLocalOrigin(attachedCamera, refreshFrame, entity.origin));
  if (!attachedCamera || !attachedCamera.parent) {
    return {
      position,
      quaternion: buildAliasEntityQuaternion(entity)
    };
  }

  attachedCamera.updateMatrixWorld(true);
  const worldQuaternion = buildAliasEntityQuaternion(entity);
  const cameraQuaternion = attachedCamera.getWorldQuaternion(new Quaternion());
  const localQuaternion = cameraQuaternion.invert().multiply(worldQuaternion);
  return {
    position,
    quaternion: localQuaternion
  };
}

function buildAliasEntityQuaternion(entity: ClientRenderEntity): Quaternion {
  const pitchRadians = MathUtils.degToRad(entity.angles[0]);
  const yawRadians = MathUtils.degToRad(entity.angles[1]);
  const rollRadians = MathUtils.degToRad(entity.angles[2]);
  return new Quaternion().setFromEuler(new Euler(-rollRadians, pitchRadians, yawRadians, "ZYX"));
}

/**
 * Category: New
 * Purpose: Dispose one detached scene subtree so temporary MD2 replacements do not leak GPU resources.
 */
function disposeObject3D(object: Object3D): void {
  object.traverse((child) => {
    const geometry = (child as { geometry?: { dispose?: () => void } }).geometry;
    geometry?.dispose?.();

    const material = (child as { material?: { dispose?: () => void } | Array<{ dispose?: () => void }> }).material;
    if (Array.isArray(material)) {
      for (const entry of material) {
        entry.dispose?.();
      }
      return;
    }

    material?.dispose?.();
  });
}
