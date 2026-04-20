/**
 * File: refresh-entity-sync.ts
 * Purpose: Synchronize Quake II client refresh entities into Three.js MD2 scene objects.
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

import { Group, MathUtils, type Camera, type Object3D } from "three";
import type { ClientRefreshFrame, ClientRenderEntity, ClientRuntime } from "../../client/src/index.js";
import { CS_MODELS, RF_DEPTHHACK, RF_FRAMELERP, RF_GLOW, RF_TRANSLUCENT, RF_WEAPONMODEL } from "../../qcommon/src/index.js";
import type { VirtualFilesystem } from "../../filesystem/src/index.js";
import { applyMd2Frame, applyMd2LerpedFrame, buildMd2Mesh, loadMd2Model, type Md2MeshInstance } from "./md2-mesh-builder.js";

const MD2_MODEL_EXTENSION = ".md2";
const RF_GLOW_SCALE = 0.1;
const RF_GLOW_RATE = 7;
const RF_GLOW_MIN_FACTOR = 0.8;

/**
 * Category: New
 * Purpose: Hold one renderable MD2 instance bound to a client refresh entity key.
 *
 * Constraints:
 * - Must preserve the current model path so runtime model swaps can rebuild the instance cleanly.
 */
interface RefreshEntityInstance {
  key: string;
  modelPath: string;
  skinnum: number;
  root: Group;
  md2: Md2MeshInstance;
}

/**
 * Category: New
 * Purpose: Report the visible and rendered entity counts produced by the sync step.
 *
 * Constraints:
 * - Must describe only the entities processed through this MD2 adapter.
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
  apply: (runtime: ClientRuntime, refreshFrame: ClientRefreshFrame | null) => RefreshEntitySyncStats;
}

/**
 * Category: New
 * Purpose: Build one Three.js adapter that renders client refresh entities backed by MD2 models.
 *
 * Constraints:
 * - Must resolve model paths through client configstrings.
 * - Must skip non-MD2 models such as brush models or sprites.
 * - Must keep one stable scene node per `entityNumber` and linked-model slot.
 */
export function createThreeRefreshEntitySync(filesystem: VirtualFilesystem): ThreeRefreshEntitySync {
  const root = new Group();
  root.name = "refresh-entities";
  const viewWeaponRoot = new Group();
  viewWeaponRoot.name = "refresh-view-weapon";

  const modelCache = new Map<string, ReturnType<typeof loadMd2Model>>();
  const instances = new Map<string, RefreshEntityInstance>();

  return {
    root,
    viewWeaponRoot,
    attachToCamera: (camera) => {
      if (viewWeaponRoot.parent !== camera) {
        viewWeaponRoot.removeFromParent();
        camera.add(viewWeaponRoot);
      }
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
          instance = createRefreshEntityInstance(filesystem, modelCache, key, modelPath, entity.skinnum);
          if (!instance) {
            missingMd2AssetCount += 1;
            continue;
          }

          instances.set(key, instance);
          getRefreshEntityParent(entity, root, viewWeaponRoot).add(instance.root);
        }

        updateRefreshEntityInstance(runtime, refreshFrame, instance, entity);
        renderedEntities += 1;
      }

      for (const [key] of instances) {
        if (!activeKeys.has(key)) {
          removeRefreshEntityInstance(instances, key);
        }
      }

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

/**
 * Category: New
 * Purpose: Resolve the current model path for one refresh entity through the client model configstrings.
 */
function resolveRefreshModelPath(runtime: ClientRuntime, entity: ClientRenderEntity): string | null {
  if (entity.modelindex <= 0) {
    return null;
  }

  const modelPath = runtime.cl.configstrings[CS_MODELS + entity.modelindex] ?? "";
  if (!modelPath || !modelPath.endsWith(MD2_MODEL_EXTENSION) || modelPath.startsWith("*")) {
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
  if (entity.modelindex <= 0) {
    return "no-modelindex";
  }

  const modelPath = runtime.cl.configstrings[CS_MODELS + entity.modelindex] ?? "";
  if (!modelPath) {
    return "missing-configstring";
  }

  if (modelPath.startsWith("*")) {
    return "inline-or-brush";
  }

  if (!modelPath.endsWith(MD2_MODEL_EXTENSION)) {
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
  key: string,
  modelPath: string,
  skinnum: number
): RefreshEntityInstance | null {
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
  const root = new Group();
  root.name = `refresh-entity:${key}`;

  root.add(md2.mesh);

  return {
    key,
    modelPath,
    skinnum,
    root,
    md2
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
  entity: ClientRenderEntity
): void {
  if ((entity.flags & RF_WEAPONMODEL) !== 0) {
    const vieworg = refreshFrame?.view.vieworg ?? [0, 0, 0];
    const viewangles = refreshFrame?.view.viewangles ?? [0, 0, 0];
    instance.root.position.set(
      entity.origin[0] - vieworg[0],
      entity.origin[1] - vieworg[1],
      entity.origin[2] - vieworg[2]
    );
    applyAliasEntityRotation(instance.root, {
      ...entity,
      angles: [
        entity.angles[0] - viewangles[0],
        entity.angles[1] - viewangles[1],
        entity.angles[2] - viewangles[2]
      ]
    });
  } else {
    instance.root.position.set(entity.origin[0], entity.origin[1], entity.origin[2]);
    applyAliasEntityRotation(instance.root, entity);
  }
  instance.root.visible = true;

  if ((entity.flags & RF_FRAMELERP) !== 0) {
    applyMd2LerpedFrame(instance.md2, entity.frame, entity.oldframe, entity.backlerp);
  } else {
    applyMd2Frame(instance.md2, entity.frame);
  }

  instance.md2.mesh.material.transparent = entity.alpha < 1 || (entity.flags & RF_TRANSLUCENT) !== 0;
  instance.md2.mesh.material.opacity = entity.alpha;
  instance.md2.mesh.material.depthTest = (entity.flags & RF_DEPTHHACK) === 0;
  instance.md2.mesh.material.depthWrite = (entity.flags & RF_DEPTHHACK) === 0;
  instance.md2.mesh.renderOrder = (entity.flags & RF_DEPTHHACK) !== 0 ? 1000 : 0;
  applyRefreshEntityGlow(runtime, instance, entity);
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
 * Purpose: Apply the original `RF_GLOW` bonus-item pulse from `ref_gl/gl_mesh.c` onto the current MD2 material state.
 *
 * Constraints:
 * - Must preserve the original sine frequency and minimum factor semantics.
 * - Must fall back to neutral white modulation when `RF_GLOW` is absent.
 */
function applyRefreshEntityGlow(runtime: ClientRuntime, instance: RefreshEntityInstance, entity: ClientRenderEntity): void {
  let colorScale = 1;

  if ((entity.flags & RF_GLOW) !== 0) {
    const pulse = RF_GLOW_SCALE * Math.sin((runtime.cl.time / 1000) * RF_GLOW_RATE);
    colorScale = Math.max(1 + pulse, RF_GLOW_MIN_FACTOR);
  }

  instance.md2.mesh.material.color.setRGB(colorScale, colorScale, colorScale);
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
