/**
 * File: gl-world-scene-adapter.ts
 * Purpose: Bridge the ported `gl_model.c` / `gl_rsurf.c` brush-world data into renderable Three.js scene objects.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the ported renderer-side Quake II model graph and the Three.js backend.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/formats
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-rsurf.ts
 * - three
 */

import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parsePcx, parseWal, SURF_FLOWING, SURF_TRANS33, SURF_TRANS66 } from "../../formats/src/index.js";
import { createRefDef } from "../../client/src/ref.js";
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  DataTexture,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  UnsignedByteType,
} from "three";
import type { BrushModelSnapshot } from "../../client/src/local-brush-models.js";
import type { GlModelRuntime } from "./gl-model-loader.js";
import { Mod_ForName, Mod_Init, Mod_PointInLeaf, createGlModelRuntime } from "./gl-model-loader.js";
import type { GlRsurfRuntime } from "./gl-rsurf.js";
import {
  createGlLightRsurfHooks,
  createGlLightRuntime,
  setGlLightRefdef,
  setGlLightWorldModel,
  setGlModulate,
  setGlMonolightmapMode
} from "./gl-light.js";
import {
  R_DrawAlphaSurfaces,
  R_DrawBrushModel,
  R_DrawWorld,
  R_MarkLeaves,
  R_TextureAnimation,
  createGlRsurfModelHooks,
  createGlRsurfRuntime,
  setCurrentModel,
  setCurrentTime,
  setFrameCount,
  setMultitextureEnabled,
  setRefdefState,
  setViewClusters,
  setViewOrigin,
  setWorldDrawFlags,
  setWorldModel
} from "./gl-rsurf.js";
import { buildNoTextureRgba } from "./gl-rmisc.js";
import {
  EmitWaterPolys,
  GL_SubdivideSurface,
  R_AddSkySurface,
  R_ClearSkyBox,
  R_DrawSkyBox,
  createGlWarpRuntime,
  setWarpModel,
  setWarpRefdefTime,
  setWarpViewOrigin,
  type GlWarpSkyFace
} from "./gl-warp.js";
import { SURF_DRAWTURB, type glpoly_t, type image_t, type model_t, type msurface_t } from "./gl-model.js";

const SHARED_PALETTE_PATH = "pics/colormap.pcx";

interface ThreeGlImageHandle {
  width: number;
  height: number;
  texture: Texture;
  registration_sequence: number;
  texturechain: msurface_t | null;
}

interface FlowingMaterialBinding {
  texture: Texture;
}

interface SurfaceMeshBinding {
  mesh: Mesh<BufferGeometry, MeshPhongMaterial | MeshBasicMaterial>;
  modelIndex: number;
  baseOpacity: number;
  surface: msurface_t;
  uvAttribute: BufferAttribute;
  warp: boolean;
  flowing: boolean;
  currentMapSource: Texture | null;
}

interface InlineModelBinding {
  group: Group;
  model: model_t;
}

interface SkyState {
  queuedSurfaceCount: number;
  faces: GlWarpSkyFace[];
}

interface AlphaDrawState {
  nextRenderOrder: number;
}

export interface ThreeGlWorldSceneAdapter {
  root: Group;
  worldmodel: model_t;
  glModelRuntime: GlModelRuntime;
  glRsurfRuntime: GlRsurfRuntime;
  readonly skyFaces: readonly GlWarpSkyFace[];
  update: (
    timeSeconds: number,
    vieworg?: readonly [number, number, number],
    brushModels?: readonly BrushModelSnapshot[]
  ) => void;
}

const ORIGINAL_DEFAULT_INVERSE_INTENSITY = 0.5;

/**
 * Category: New
 * Purpose: Build a Three.js scene adapter from the ported GL brush-world loading pipeline.
 *
 * Constraints:
 * - Must load the BSP through `gl_model.c` / `gl_rsurf.c` ports rather than the legacy adapter triangulator.
 * - Must preserve inline model grouping via `bsp-model:N`.
 */
export function createThreeGlWorldSceneAdapter(
  filesystem: VirtualFilesystem,
  mapPath: string
): ThreeGlWorldSceneAdapter {
  const root = new Group();
  root.name = "gl-world-root";

  const imageCache = new Map<string, ThreeGlImageHandle | null>();
  const flowingMaterials: FlowingMaterialBinding[] = [];
  const lightmapTextures = new Map<number, DataTexture>();
  const surfaceMeshes = new Map<msurface_t, SurfaceMeshBinding>();
  const inlineModels = new Map<number, InlineModelBinding>();
  const inlineModelsByModel = new Map<model_t, InlineModelBinding>();
  const skyState: SkyState = { queuedSurfaceCount: 0, faces: [] };
  const alphaDrawState: AlphaDrawState = { nextRenderOrder: 1000 };
  const sharedPalette = loadSharedPalette(filesystem);
  const whiteLightmapTexture = createSolidTexture(255, 255, 255, 255, false);
  const notextureImage = createCheckerImageHandle();
  const glLightRuntime = createGlLightRuntime();
  const glWarpRuntime = createGlWarpRuntime();
  const bootstrapRefdef = createRefDef();
  for (const lightstyle of bootstrapRefdef.lightstyles) {
    lightstyle.rgb = [1, 1, 1];
    lightstyle.white = 3;
  }
  setGlLightRefdef(glLightRuntime, bootstrapRefdef);
  setGlModulate(glLightRuntime, 1);
  setGlMonolightmapMode(glLightRuntime, "0");

  const glRsurfRuntime = createGlRsurfRuntime({
    ...createGlLightRsurfHooks(glLightRuntime),
    uploadLightmapBlock: (dynamic, textureIndex, buffer) => {
      if (dynamic) {
        return;
      }

      const texture = ensureLightmapTexture(lightmapTextures, textureIndex);
      const textureData = texture.image.data;
      if (!(textureData instanceof Uint8Array)) {
        throw new Error("Lightmap texture data is not writable");
      }
      textureData.set(buffer);
      texture.needsUpdate = true;
    },
    initializeDynamicLightmap: (textureIndex, width, height, _internalFormat, buffer) => {
      const texture = ensureLightmapTexture(lightmapTextures, textureIndex, width, height);
      const textureData = texture.image.data;
      if (!(textureData instanceof Uint8Array)) {
        throw new Error("Dynamic lightmap texture data is not writable");
      }
      textureData.set(buffer);
      texture.needsUpdate = true;
    },
    beginLightmapBuild: () => {
      // The source renderer switches to the lightmap texture unit here.
      // The Three.js bridge has no matching mutable GL unit state to prepare.
    },
    endLightmapBuild: () => {
      // The source renderer exits multitexture mode after static lightmap construction.
      // No explicit backend state unwind is needed with material-based rendering.
    },
    uploadSurfaceLightmap: (surface, textureIndex, smax, tmax, buffer) => {
      const texture = ensureLightmapTexture(lightmapTextures, textureIndex);
      blitLightmapRect(texture.image.data as Uint8Array, surface.light_s, surface.light_t, smax, tmax, buffer);
      texture.needsUpdate = true;
    },
    renderBrushPoly: (surface) => {
      surfaceMeshes.get(surface)?.mesh && markSurfaceVisible(glRsurfRuntime, surfaceMeshes, surface);
    },
    renderFlowingPoly: (surface) => {
      surfaceMeshes.get(surface)?.mesh && markSurfaceVisible(glRsurfRuntime, surfaceMeshes, surface);
    },
    renderWaterPoly: (surface) => {
      surfaceMeshes.get(surface)?.mesh && markSurfaceVisible(glRsurfRuntime, surfaceMeshes, surface);
    },
    renderAlphaSurface: (surface) => {
      surfaceMeshes.get(surface)?.mesh
        && markSurfaceVisible(glRsurfRuntime, surfaceMeshes, surface, alphaDrawState.nextRenderOrder++);
    },
    renderLightmappedPolyChain: (surface) => {
      surfaceMeshes.get(surface)?.mesh && markSurfaceVisible(glRsurfRuntime, surfaceMeshes, surface);
    },
    renderLightmapChainSurface: (surface) => {
      surfaceMeshes.get(surface)?.mesh && markSurfaceVisible(glRsurfRuntime, surfaceMeshes, surface);
    },
    resetTextureBindings: () => {
      // Three.js materials are stateful objects, so there is no direct texture binding cache to clear here.
    },
    beginWorldMultitexture: (_lightmapOnly) => {
      // The current Three.js bridge folds base texture + lightmap into one material, so this is structural only.
    },
    endWorldMultitexture: () => {
      // No explicit state unwind is needed with material-driven rendering.
    },
    beginBrushModelMultitexture: () => {
      // Brush-model multitexture is likewise expressed through the bound material.
    },
    endBrushModelMultitexture: () => {
      // No-op placeholder kept to mirror the ported renderer flow.
    },
    suspendMultitexture: () => {
      // Three.js does not expose the old GL multitexture switch directly; materials already encode both layers.
    },
    resumeMultitexture: () => {
      // No-op counterpart kept to preserve the original renderer flow in the ported runtime.
    },
    beginAlphaSurfaces: () => {
      alphaDrawState.nextRenderOrder = 1000;
    },
    endAlphaSurfaces: () => {
      // No explicit GL-style state restore is needed with material-driven rendering.
    },
    resetDrawColor: () => {
      // Mesh materials already carry their own color state; there is no shared immediate-mode color to reset.
    },
    clearSkyBox: () => {
      skyState.queuedSurfaceCount = 0;
      skyState.faces = [];
      R_ClearSkyBox(glWarpRuntime);
    },
    addSkySurface: (surface) => {
      skyState.queuedSurfaceCount += 1;
      R_AddSkySurface(glWarpRuntime, surface);
    },
    drawSkyBox: () => {
      skyState.faces = R_DrawSkyBox(glWarpRuntime);
    },
    beginBrushModelDraw: (entity, model) => {
      const binding = inlineModelsByModel.get(model);
      if (!binding || !entity.origin || !entity.angles) {
        return;
      }

      applyBrushModelTransform(binding.group, {
        model: undefined,
        origin: [entity.origin[0], entity.origin[1], entity.origin[2]],
        angles: [entity.angles[0], entity.angles[1], entity.angles[2]]
      });
    }
  });

  const glRsurfModelHooks = createGlRsurfModelHooks(glRsurfRuntime);

  const glModelRuntime = createGlModelRuntime({
    loadFile: (path) => {
      const file = readMountedFile(filesystem, path);
      return file?.bytes ?? null;
    },
    freeFile: () => {
      // Mounted files are immutable views and do not require explicit release.
    },
    findImage: (name) => resolveImage(filesystem, name, sharedPalette, imageCache),
    notextureImage,
    print: () => {
      // The web adapter currently suppresses renderer console chatter.
    },
    ...glRsurfModelHooks,
    beginBuildingLightmaps: (model) => {
      glRsurfModelHooks.beginBuildingLightmaps(model);
      setWarpModel(glWarpRuntime, model);
    },
    subdivideSurface: (surface) => {
      GL_SubdivideSurface(glWarpRuntime, surface);
    }
  });

  Mod_Init(glModelRuntime);
  const worldmodel = Mod_ForName(glModelRuntime, mapPath, true, null);
  if (!worldmodel) {
    throw new Error(`Failed to load brush world ${mapPath}`);
  }

  setWorldModel(glRsurfRuntime, worldmodel);
  setGlLightWorldModel(glLightRuntime, worldmodel);
  setMultitextureEnabled(glRsurfRuntime, true);
  setWorldDrawFlags(glRsurfRuntime, { drawworld: true, novis: false, lockpvs: false });
  setRefdefState(glRsurfRuntime, null, 0);

  buildWorldGroup(
    root,
    worldmodel,
    glModelRuntime,
    lightmapTextures,
    whiteLightmapTexture,
    flowingMaterials,
    surfaceMeshes,
    inlineModels,
    inlineModelsByModel
  );
  const imageHandles = collectImageHandles(worldmodel);

  return {
    root,
    worldmodel,
    glModelRuntime,
    glRsurfRuntime,
    get skyFaces() {
      return skyState.faces;
    },
    update: (timeSeconds, vieworg, brushModels) => {
      const scroll = computeFlowingScroll(timeSeconds);
      for (const binding of flowingMaterials) {
        binding.texture.offset.x = scroll;
      }
      setWarpRefdefTime(glWarpRuntime, timeSeconds);
      updateWarpSurfaceUvs(glWarpRuntime, surfaceMeshes);

      hideAllSurfaces(surfaceMeshes);

      if (vieworg) {
        setCurrentTime(glRsurfRuntime, timeSeconds);
        setViewOrigin(glRsurfRuntime, [vieworg[0], vieworg[1], vieworg[2]]);
        setWarpViewOrigin(glWarpRuntime, [vieworg[0], vieworg[1], vieworg[2]]);
        setFrameCount(glRsurfRuntime, glRsurfRuntime.r_framecount + 1);

        const leaf = Mod_PointInLeaf([vieworg[0], vieworg[1], vieworg[2]], worldmodel);
        setViewClusters(glRsurfRuntime, leaf.cluster, leaf.cluster);
        R_MarkLeaves(glRsurfRuntime);
        R_DrawWorld(glRsurfRuntime, imageHandles);
        if (brushModels) {
          drawInlineBrushModels(glRsurfRuntime, brushModels, inlineModels);
        }
        R_DrawAlphaSurfaces(glRsurfRuntime);
      }
    }
  };
}

function buildWorldGroup(
  root: Group,
  worldmodel: model_t,
  glModelRuntime: GlModelRuntime,
  lightmapTextures: Map<number, DataTexture>,
  whiteLightmapTexture: Texture,
  flowingMaterials: FlowingMaterialBinding[],
  surfaceMeshes: Map<msurface_t, SurfaceMeshBinding>,
  inlineModels: Map<number, InlineModelBinding>,
  inlineModelsByModel: Map<model_t, InlineModelBinding>
): void {
  for (let modelIndex = 0; modelIndex < worldmodel.numsubmodels; modelIndex += 1) {
    const model = modelIndex === 0 ? worldmodel : glModelRuntime.mod_inline[modelIndex];
    if (!model) {
      continue;
    }

    const modelGroup = new Group();
    modelGroup.name = `bsp-model:${modelIndex}`;
    modelGroup.userData.modelIndex = modelIndex;

    const origin: [number, number, number] = modelIndex === 0
      ? [0, 0, 0]
      : (worldmodel.submodels[modelIndex]?.origin ?? [0, 0, 0]);
    modelGroup.position.set(origin[0], origin[1], origin[2]);
    if (modelIndex > 0) {
      const binding = { group: modelGroup, model };
      inlineModels.set(modelIndex, binding);
      inlineModelsByModel.set(model, binding);
    }

    const firstSurface = model.firstmodelsurface;
    const lastSurface = firstSurface + model.nummodelsurfaces;
    for (let surfaceIndex = firstSurface; surfaceIndex < lastSurface && surfaceIndex < worldmodel.surfaces.length; surfaceIndex += 1) {
      const surface = worldmodel.surfaces[surfaceIndex];
      const mesh = buildSurfaceMesh(surface, origin, lightmapTextures, whiteLightmapTexture, flowingMaterials);
      if (mesh) {
        mesh.visible = false;
        surfaceMeshes.set(surface, {
          mesh,
          modelIndex,
          baseOpacity: alphaForSurface(surface),
          surface,
          uvAttribute: mesh.geometry.getAttribute("uv") as BufferAttribute,
          warp: (surface.flags & SURF_DRAWTURB) !== 0,
          flowing: ((surface.texinfo?.flags ?? 0) & SURF_FLOWING) !== 0,
          currentMapSource: null
        });
        modelGroup.add(mesh);
      }
    }

    root.add(modelGroup);
  }
}

function buildSurfaceMesh(
  surface: msurface_t,
  modelOrigin: readonly [number, number, number],
  lightmapTextures: Map<number, DataTexture>,
  whiteLightmapTexture: Texture,
  flowingMaterials: FlowingMaterialBinding[]
): Mesh<BufferGeometry, MeshPhongMaterial | MeshBasicMaterial> | null {
  const polygons = collectPolygons(surface.polys);
  if (polygons.length === 0 || !surface.texinfo) {
    return null;
  }

  let totalVertexCount = 0;
  let totalIndexCount = 0;
  for (const poly of polygons) {
    totalVertexCount += poly.numverts;
    totalIndexCount += Math.max(0, poly.numverts - 2) * 3;
  }

  if (totalVertexCount < 3 || totalIndexCount < 3) {
    return null;
  }

  const positions = new Float32Array(totalVertexCount * 3);
  const uvs = new Float32Array(totalVertexCount * 2);
  const uv2s = new Float32Array(totalVertexCount * 2);
  const indices = new Uint32Array(totalIndexCount);

  let vertexOffset = 0;
  let indexOffset = 0;
  let baseVertex = 0;

  for (const poly of polygons) {
    for (let vertexIndex = 0; vertexIndex < poly.numverts; vertexIndex += 1) {
      const vertex = poly.verts[vertexIndex];
      const positionOffset = vertexOffset * 3;
      const uvOffset = vertexOffset * 2;

      positions[positionOffset] = vertex[0] - modelOrigin[0];
      positions[positionOffset + 1] = vertex[1] - modelOrigin[1];
      positions[positionOffset + 2] = vertex[2] - modelOrigin[2];
      uvs[uvOffset] = vertex[3];
      uvs[uvOffset + 1] = vertex[4];
      uv2s[uvOffset] = vertex[5];
      uv2s[uvOffset + 1] = vertex[6];
      vertexOffset += 1;
    }

    for (let triangle = 0; triangle < poly.numverts - 2; triangle += 1) {
      indices[indexOffset] = baseVertex;
      indices[indexOffset + 1] = baseVertex + triangle + 1;
      indices[indexOffset + 2] = baseVertex + triangle + 2;
      indexOffset += 3;
    }

    baseVertex += poly.numverts;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setAttribute("uv2", new BufferAttribute(uv2s, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  const baseImage = asThreeGlImageHandle(surface.texinfo.image) ?? createCheckerImageHandle();
  const lightmapTexture = lightmapTextures.get(surface.lightmaptexturenum) ?? whiteLightmapTexture;
  const alpha = alphaForSurface(surface);
  const warp = (surface.flags & SURF_DRAWTURB) !== 0;
  const flowing = (surface.texinfo.flags & SURF_FLOWING) !== 0;
  const material = createSurfaceMaterial(baseImage.texture, lightmapTexture, alpha, {
    flowing,
    warp
  });

  if (flowing && !warp && material.map) {
    flowingMaterials.push({ texture: material.map });
  }

  const mesh = new Mesh(geometry, material);
  mesh.name = `gl-surface:${surface.lightmaptexturenum}`;
  mesh.renderOrder = alpha < 1 ? 1 : 0;
  return mesh;
}

function collectPolygons(head: glpoly_t | null): glpoly_t[] {
  const polygons: glpoly_t[] = [];
  const pending: glpoly_t[] = head ? [head] : [];
  const seen = new Set<glpoly_t>();

  while (pending.length > 0) {
    const poly = pending.shift() ?? null;
    if (!poly || seen.has(poly)) {
      continue;
    }

    seen.add(poly);
    polygons.push(poly);

    if (poly.chain && !seen.has(poly.chain)) {
      pending.push(poly.chain);
    }
    if (poly.next && !seen.has(poly.next)) {
      pending.push(poly.next);
    }
  }

  return polygons;
}

function createSurfaceMaterial(
  baseTexture: Texture,
  lightmapTexture: Texture,
  alpha: number,
  options: {
    flowing: boolean;
    warp: boolean;
  }
): MeshPhongMaterial | MeshBasicMaterial {
  const { flowing, warp } = options;
  const map = createMaterialTexture(baseTexture, flowing && !warp);
  map.needsUpdate = true;

  if (warp || alpha < 1) {
    const material = new MeshBasicMaterial({
      map,
      side: BackSide,
      transparent: alpha < 1,
      opacity: alpha,
      depthWrite: alpha >= 1
    });
    material.color.setScalar(ORIGINAL_DEFAULT_INVERSE_INTENSITY);
    return material;
  }

  return new MeshPhongMaterial({
    map,
    lightMap: lightmapTexture,
    lightMapIntensity: 1,
    side: BackSide,
    transparent: alpha < 1,
    opacity: alpha,
    depthWrite: alpha >= 1
  });
}

function createMaterialTexture(texture: Texture, clone: boolean): Texture {
  const map = clone ? texture.clone() : texture;
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.needsUpdate = true;
  return map;
}

function ensureLightmapTexture(
  textures: Map<number, DataTexture>,
  textureIndex: number,
  width = 128,
  height = 128
): DataTexture {
  const existing = textures.get(textureIndex);
  if (existing) {
    return existing;
  }

  const data = new Uint8Array(width * height * 4);
  fillWhiteLightmap(data);
  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.flipY = false;
  texture.needsUpdate = true;
  textures.set(textureIndex, texture);
  return texture;
}

function resolveImage(
  filesystem: VirtualFilesystem,
  name: string,
  sharedPalette: Uint8Array | null,
  cache: Map<string, ThreeGlImageHandle | null>
): ThreeGlImageHandle | null {
  if (cache.has(name)) {
    return cache.get(name) ?? null;
  }

  let image: ThreeGlImageHandle | null = null;
  if (name.endsWith(".wal") && sharedPalette) {
    image = loadWalImage(filesystem, name, sharedPalette);
  } else if (name.endsWith(".pcx")) {
    image = loadPcxImage(filesystem, name);
  }

  cache.set(name, image);
  return image;
}

function loadWalImage(filesystem: VirtualFilesystem, path: string, paletteRgb: Uint8Array): ThreeGlImageHandle | null {
  const file = readMountedFile(filesystem, path);
  if (!file) {
    return null;
  }

  try {
    const wal = parseWal(file.bytes, file.path);
    const texture = createIndexedTexture(wal.header.width, wal.header.height, wal.mipmaps[0], paletteRgb, true);
    return {
      width: wal.header.width,
      height: wal.header.height,
      texture,
      registration_sequence: 0,
      texturechain: null
    };
  } catch {
    return null;
  }
}

function loadPcxImage(filesystem: VirtualFilesystem, path: string): ThreeGlImageHandle | null {
  const file = readMountedFile(filesystem, path);
  if (!file) {
    return null;
  }

  try {
    const image = parsePcx(file.bytes, file.path);
    const texture = new DataTexture(image.rgba, image.width, image.height, RGBAFormat, UnsignedByteType);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.flipY = false;
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return {
      width: image.width,
      height: image.height,
      texture,
      registration_sequence: 0,
      texturechain: null
    };
  } catch {
    return null;
  }
}

function createIndexedTexture(
  width: number,
  height: number,
  indices: Uint8Array,
  paletteRgb: Uint8Array,
  repeating: boolean
): DataTexture {
  const rgba = new Uint8Array(width * height * 4);
  for (let index = 0; index < indices.length; index += 1) {
    const paletteIndex = indices[index] * 3;
    const rgbaIndex = index * 4;
    rgba[rgbaIndex] = paletteRgb[paletteIndex];
    rgba[rgbaIndex + 1] = paletteRgb[paletteIndex + 1];
    rgba[rgbaIndex + 2] = paletteRgb[paletteIndex + 2];
    rgba[rgbaIndex + 3] = 255;
  }

  const texture = new DataTexture(rgba, width, height, RGBAFormat, UnsignedByteType);
  texture.wrapS = repeating ? RepeatWrapping : ClampToEdgeWrapping;
  texture.wrapT = repeating ? RepeatWrapping : ClampToEdgeWrapping;
  texture.flipY = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function loadSharedPalette(filesystem: VirtualFilesystem): Uint8Array | null {
  const paletteFile = readMountedFile(filesystem, SHARED_PALETTE_PATH);
  if (!paletteFile) {
    return null;
  }

  try {
    return parsePcx(paletteFile.bytes, paletteFile.path).paletteRgb;
  } catch {
    return null;
  }
}

function createCheckerImageHandle(): ThreeGlImageHandle {
  const texture = createNoTextureTexture();
  return {
    width: 8,
    height: 8,
    texture,
    registration_sequence: 0,
    texturechain: null
  };
}

function createNoTextureTexture(): DataTexture {
  const data = buildNoTextureRgba();
  const texture = new DataTexture(data, 8, 8, RGBAFormat, UnsignedByteType);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

function createSolidTexture(r: number, g: number, b: number, a: number, srgb: boolean): DataTexture {
  const data = new Uint8Array([r, g, b, a]);
  const texture = new DataTexture(data, 1, 1, RGBAFormat, UnsignedByteType);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.flipY = false;
  if (srgb) {
    texture.colorSpace = SRGBColorSpace;
  }
  texture.needsUpdate = true;
  return texture;
}

function fillWhiteLightmap(target: Uint8Array): void {
  for (let index = 0; index < target.length; index += 4) {
    target[index] = 255;
    target[index + 1] = 255;
    target[index + 2] = 255;
    target[index + 3] = 255;
  }
}

function blitLightmapRect(
  atlas: Uint8Array,
  x: number,
  y: number,
  width: number,
  height: number,
  source: Uint8Array
): void {
  const atlasWidth = 128;
  for (let row = 0; row < height; row += 1) {
    const srcOffset = row * width * 4;
    const dstOffset = ((y + row) * atlasWidth + x) * 4;
    atlas.set(source.subarray(srcOffset, srcOffset + width * 4), dstOffset);
  }
}

function alphaForSurface(surface: msurface_t): number {
  const flags = surface.texinfo?.flags ?? 0;
  if ((flags & SURF_TRANS33) !== 0) {
    return 0.33;
  }
  if ((flags & SURF_TRANS66) !== 0) {
    return 0.66;
  }

  return 1;
}

function computeFlowingScroll(timeSeconds: number): number {
  const scroll = -64 * (timeSeconds / 40.0 - Math.trunc(timeSeconds / 40.0));
  return scroll === 0 ? -64 : scroll;
}

function asThreeGlImageHandle(image: image_t | null): ThreeGlImageHandle | null {
  if (!image || typeof image !== "object") {
    return null;
  }

  const candidate = image as Partial<ThreeGlImageHandle>;
  return candidate.texture instanceof Texture
    ? candidate as ThreeGlImageHandle
    : null;
}

function collectImageHandles(worldmodel: model_t): image_t[] {
  const images: image_t[] = [];
  const seen = new Set<object>();

  for (const texinfo of worldmodel.texinfo) {
    if (!texinfo.image || typeof texinfo.image !== "object") {
      continue;
    }

    const imageObject = texinfo.image as object;
    if (seen.has(imageObject)) {
      continue;
    }

    seen.add(imageObject);
    images.push(texinfo.image);
  }

  return images;
}

function hideAllSurfaces(surfaceMeshes: Map<msurface_t, SurfaceMeshBinding>): void {
  for (const binding of surfaceMeshes.values()) {
    binding.mesh.visible = false;
  }
}

function updateWarpSurfaceUvs(
  runtime: ReturnType<typeof createGlWarpRuntime>,
  surfaceMeshes: Map<msurface_t, SurfaceMeshBinding>
): void {
  for (const binding of surfaceMeshes.values()) {
    if (!binding.warp) {
      continue;
    }

    const polys = EmitWaterPolys(runtime, binding.surface);
    let uvOffset = 0;
    for (const poly of polys) {
      for (const vertex of poly.vertices) {
        if (uvOffset >= binding.uvAttribute.count) {
          break;
        }
        binding.uvAttribute.setXY(uvOffset, vertex.uv[0], vertex.uv[1]);
        uvOffset += 1;
      }
    }
    binding.uvAttribute.needsUpdate = true;
  }
}

function markSurfaceVisible(
  runtime: GlRsurfRuntime,
  surfaceMeshes: Map<msurface_t, SurfaceMeshBinding>,
  surface: msurface_t,
  renderOrder?: number
): void {
  const binding = surfaceMeshes.get(surface);
  if (!binding) {
    return;
  }

  syncSurfaceTexture(runtime, binding);
  const entityAlpha = binding.modelIndex > 0 ? runtime.currentEntityAlpha : null;
  const opacity = entityAlpha ?? binding.baseOpacity;
  binding.mesh.material.transparent = opacity < 1;
  binding.mesh.material.opacity = opacity;
  binding.mesh.material.depthWrite = opacity >= 1;
  binding.mesh.renderOrder = renderOrder ?? (opacity < 1 ? 1 : 0);
  binding.mesh.visible = true;
}

function syncSurfaceTexture(runtime: GlRsurfRuntime, binding: SurfaceMeshBinding): void {
  const texinfo = binding.surface.texinfo;
  if (!texinfo) {
    return;
  }

  const image = R_TextureAnimation(runtime, texinfo);
  const handle = asThreeGlImageHandle(image);
  if (!handle) {
    return;
  }

  const currentMap = binding.mesh.material.map;
  if (binding.currentMapSource === handle.texture && currentMap) {
    currentMap.wrapS = RepeatWrapping;
    currentMap.wrapT = RepeatWrapping;
    currentMap.needsUpdate = true;
    return;
  }

  const nextMap = createMaterialTexture(handle.texture, binding.flowing && !binding.warp);
  binding.mesh.material.map = nextMap;
  binding.mesh.material.needsUpdate = true;
  binding.currentMapSource = handle.texture;
}

function drawInlineBrushModels(
  runtime: GlRsurfRuntime,
  brushModels: readonly BrushModelSnapshot[],
  inlineModels: Map<number, InlineModelBinding>
): void {
  for (const snapshot of brushModels) {
    const modelIndex = parseInlineModelIndex(snapshot.model);
    if (modelIndex === null || modelIndex === 0) {
      continue;
    }

    const binding = inlineModels.get(modelIndex);
    if (!binding) {
      continue;
    }

    setCurrentModel(runtime, binding.model);
    R_DrawBrushModel(runtime, {
      frame: 0,
      origin: [snapshot.origin[0], snapshot.origin[1], snapshot.origin[2]],
      angles: [snapshot.angles[0], snapshot.angles[1], snapshot.angles[2]],
      flags: 0
    });
  }
}

function applyBrushModelTransform(group: Group, snapshot: BrushModelSnapshot): void {
  group.position.set(snapshot.origin[0], snapshot.origin[1], snapshot.origin[2]);
  group.rotation.set(
    MathUtils.degToRad(snapshot.angles[2]),
    MathUtils.degToRad(snapshot.angles[0]),
    MathUtils.degToRad(snapshot.angles[1]),
    "ZYX"
  );
}

function parseInlineModelIndex(model: string | undefined): number | null {
  if (!model || !model.startsWith("*")) {
    return null;
  }

  const modelIndex = Number.parseInt(model.slice(1), 10);
  return Number.isFinite(modelIndex) ? modelIndex : null;
}
