/**
 * File: gl-model-loader.ts
 * Source: Quake II original / ref_gl/gl_model.c
 * Purpose: Port the original GL refresh model loader runtime, registration flow and BSP/alias/sprite loading helpers.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Replaces C globals with an explicit runtime object.
 * - Uses arrays and typed byte buffers instead of raw pointers.
 *
 * Notes:
 * - This file is the principal attachment point for `ref_gl/gl_model.c`.
 * - It now covers the explicit runtime state, model registry/registration flow, BSP brush loading,
 *   sprite loading and alias MD2 loading used by the original GL refresh module.
 * - Renderer/image side-effects that belong to later files (`gl_image.c`, `gl_rsurf.c`, `gl_warp.c`) stay behind hooks.
 */

import {
  BSPVERSION,
  HEADER_LUMPS,
  IDALIASHEADER,
  IDBSPHEADER,
  IDSPRITEHEADER,
  LUMP_EDGES,
  LUMP_FACES,
  LUMP_LEAFFACES,
  LUMP_LEAFS,
  LUMP_LIGHTING,
  LUMP_MODELS,
  LUMP_NODES,
  LUMP_PLANES,
  LUMP_SURFEDGES,
  LUMP_TEXINFO,
  LUMP_VERTEXES,
  LUMP_VISIBILITY,
  MAXLIGHTMAPS,
  MAX_MAP_SURFEDGES,
  SURF_SKY,
  SURF_TRANS33,
  SURF_TRANS66,
  SURF_WARP,
  ALIAS_VERSION,
  MAX_MD2SKINS,
  SPRITE_VERSION,
  parseMd2,
  parseSp2,
  type Md2Model,
  type dsprite_t,
  type dheader_t,
  type lump_t
} from "../../formats/src/index.js";
import { MAX_MAP_LEAFS } from "../../formats/src/index.js";
import { getLittleFloat, getLittleLong, getLittleShort } from "../../memory/src/binary-io.js";
import { Com_sprintf, DotProduct, type byte, VectorLength, type cplane_t, type vec3_t } from "../../qcommon/src/index.js";
import {
  createModel,
  createMSurface,
  createMTexinfo,
  modtype_t,
  SURF_DRAWTURB,
  SURF_PLANEBACK,
  type image_t,
  type medge_t,
  type mleaf_t,
  type mmodel_t,
  type model_t,
  type mnode_child_t,
  type mnode_t,
  type msurface_t,
  type mtexinfo_t,
  type mvertex_t
} from "./gl-model.js";

const MAX_MOD_KNOWN = 512;
const MAX_MAP_LEAFS_BYTES = MAX_MAP_LEAFS >> 3;
const DMODEL_SIZE = 48;
const DVERTEX_SIZE = 12;
const DEDGE_SIZE = 4;
const DNODE_SIZE = 28;
const DLEAF_SIZE = 28;
const DPLANE_SIZE = 20;
const MARKSURFACE_INDEX_SIZE = 2;
const SURFEDGE_SIZE = 4;
const TEXINFO_SIZE = 76;
const DFACE_SIZE = 20;

export interface GlModelHooks {
  loadFile?: (path: string) => Uint8Array | null;
  freeFile?: (buffer: Uint8Array) => void;
  findImage?: (name: string, type: "wall" | "sprite" | "skin") => image_t | null;
  notextureImage?: image_t | null;
  print?: (message: string) => void;
  getFlushMap?: () => boolean;
  beginBuildingLightmaps?: (model: model_t) => void;
  endBuildingLightmaps?: () => void;
  subdivideSurface?: (surface: msurface_t) => void;
  createSurfaceLightmap?: (surface: msurface_t) => void;
  buildPolygonFromSurface?: (surface: msurface_t) => void;
  loadAliasModel?: (runtime: GlModelRuntime, mod: model_t, buffer: Uint8Array) => void;
  loadSpriteModel?: (runtime: GlModelRuntime, mod: model_t, buffer: Uint8Array) => void;
  freeUnusedImages?: () => void;
  setImageRegistration?: (image: image_t, registrationSequence: number) => void;
}

/**
 * Original name: create renderer model runtime
 * Source: ref_gl/gl_model.c
 * Category: NewTooling
 * Fidelity level: Close
 *
 * Behavior:
 * - Holds the mutable state that the original file stored in globals.
 */
export interface GlModelRuntime {
  loadmodel: model_t | null;
  r_worldmodel: model_t | null;
  r_viewcluster: number;
  r_oldviewcluster: number;
  modfilelen: number;
  mod_novis: Uint8Array;
  mod_known: model_t[];
  mod_numknown: number;
  mod_inline: model_t[];
  registration_sequence: number;
  hooks: GlModelHooks;
}

/**
 * Category: New
 * Purpose: Create the explicit runtime replacing the original `gl_model.c` globals.
 */
export function createGlModelRuntime(hooks: GlModelHooks = {}): GlModelRuntime {
  return {
    loadmodel: null,
    r_worldmodel: null,
    r_viewcluster: -1,
    r_oldviewcluster: -1,
    modfilelen: 0,
    mod_novis: new Uint8Array(MAX_MAP_LEAFS_BYTES),
    mod_known: Array.from({ length: MAX_MOD_KNOWN }, () => createModel()),
    mod_numknown: 0,
    mod_inline: Array.from({ length: MAX_MOD_KNOWN }, () => createModel()),
    registration_sequence: 0,
    hooks
  };
}

/**
 * Original name: Mod_Init
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Initializes the fallback PVS buffer so maps without vis data appear fully visible.
 */
export function Mod_Init(runtime: GlModelRuntime): void {
  runtime.mod_novis.fill(0xff);
}

/**
 * Original name: Mod_Modellist_f
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Enumerates the loaded model registry and reports resident extra-data sizes.
 */
export function Mod_Modellist_f(runtime: GlModelRuntime): { lines: string[]; total: number } {
  const lines: string[] = ["Loaded models:"];
  let total = 0;

  for (let index = 0; index < runtime.mod_numknown; index += 1) {
    const mod = runtime.mod_known[index];
    if (!mod.name) {
      continue;
    }

    lines.push(`${mod.extradatasize.toString().padStart(8, " ")} : ${mod.name}`);
    total += mod.extradatasize;
  }

  lines.push(`Total resident: ${total}`);
  for (const line of lines) {
    runtime.hooks.print?.(`${line}\n`);
  }

  return { lines, total };
}

/**
 * Original name: R_BeginRegistration
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts one renderer registration pass and loads the world BSP model.
 */
export function R_BeginRegistration(runtime: GlModelRuntime, model: string): model_t {
  runtime.registration_sequence += 1;
  runtime.r_oldviewcluster = -1;

  const fullname = Com_sprintf(64, `maps/${model}.bsp`);
  const flushmap = runtime.hooks.getFlushMap?.() ?? false;
  if (runtime.mod_known[0].name !== fullname || flushmap) {
    Mod_Free(runtime, runtime.mod_known[0]);
  }

  const worldmodel = Mod_ForName(runtime, fullname, true, runtime.r_worldmodel);
  if (!worldmodel) {
    throw new Error(`R_BeginRegistration: failed to load ${fullname}`);
  }

  runtime.r_worldmodel = worldmodel;
  runtime.r_viewcluster = -1;
  return worldmodel;
}

/**
 * Original name: R_RegisterModel
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Resolves one renderer model and marks it live for the current registration sequence.
 *
 * Porting notes:
 * - Brush-model image registration is implemented now; alias and sprite image re-registration stays deferred
 *   until those payload branches are ported.
 */
export function R_RegisterModel(runtime: GlModelRuntime, name: string): model_t | null {
  const mod = Mod_ForName(runtime, name, false, runtime.r_worldmodel);
  if (!mod) {
    return null;
  }

  mod.registration_sequence = runtime.registration_sequence;

  if (mod.type === modtype_t.mod_brush) {
    for (let index = 0; index < mod.numtexinfo; index += 1) {
      const image = mod.texinfo[index].image;
      if (image) {
        runtime.hooks.setImageRegistration?.(image, runtime.registration_sequence);
      }
    }
  } else if (mod.type === modtype_t.mod_alias) {
    const alias = mod.extradata as Md2Model | null;
    if (alias) {
      for (let index = 0; index < alias.header.num_skins; index += 1) {
        mod.skins[index] = runtime.hooks.findImage?.(alias.skins[index], "skin") ?? null;
      }

      mod.numframes = alias.header.num_frames;
    }
  } else if (mod.type === modtype_t.mod_sprite) {
    const sprite = mod.extradata as dsprite_t | null;
    if (sprite) {
      for (let index = 0; index < sprite.numframes; index += 1) {
        mod.skins[index] = runtime.hooks.findImage?.(sprite.frames[index].name, "sprite") ?? null;
      }
    }
  }

  return mod;
}

/**
 * Original name: R_EndRegistration
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Frees models not touched during the current registration pass and asks the image system to trim unused textures.
 */
export function R_EndRegistration(runtime: GlModelRuntime): void {
  for (let index = 0; index < runtime.mod_numknown; index += 1) {
    const mod = runtime.mod_known[index];
    if (!mod.name) {
      continue;
    }

    if (mod.registration_sequence !== runtime.registration_sequence) {
      Mod_Free(runtime, mod);
    }
  }

  runtime.hooks.freeUnusedImages?.();
}

/**
 * Original name: Mod_Free
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Releases one model payload and resets the slot to an empty model record.
 */
export function Mod_Free(runtime: GlModelRuntime, mod: model_t): void {
  const reset = createModel();
  Object.assign(mod, reset);

  if (runtime.loadmodel === mod) {
    runtime.loadmodel = null;
  }
  if (runtime.r_worldmodel === mod) {
    runtime.r_worldmodel = null;
  }
}

/**
 * Original name: Mod_FreeAll
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Releases every populated known-model slot.
 */
export function Mod_FreeAll(runtime: GlModelRuntime): void {
  for (let index = 0; index < runtime.mod_numknown; index += 1) {
    if (runtime.mod_known[index].extradatasize) {
      Mod_Free(runtime, runtime.mod_known[index]);
    }
  }
}

/**
 * Original name: Mod_PointInLeaf
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Walks the BSP node tree and returns the leaf containing the given point.
 *
 * Porting notes:
 * - Uses a type guard instead of pointer casting to distinguish renderer nodes from leaves.
 */
export function Mod_PointInLeaf(point: vec3_t, model: model_t | null): mleaf_t {
  if (!model || model.nodes.length === 0) {
    throw new Error("Mod_PointInLeaf: bad model");
  }

  let node: mnode_child_t = model.nodes[0];

  while (isMNode(node)) {
    const plane: cplane_t | null = node.plane;
    if (!plane) {
      throw new Error("Mod_PointInLeaf: node missing plane");
    }

    const distance: number = DotProduct(point, plane.normal) - plane.dist;
    const nextNode: mnode_child_t | null = distance > 0 ? node.children[0] : node.children[1];
    if (!nextNode) {
      throw new Error("Mod_PointInLeaf: node missing child");
    }

    node = nextNode;
  }

  return node;
}

/**
 * Original name: Mod_DecompressVis
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Expands one Quake II run-length encoded PVS row into a reusable byte buffer.
 */
export function Mod_DecompressVis(inBuffer: Uint8Array | null, model: model_t): Uint8Array {
  const row = ((model.vis?.numclusters ?? 0) + 7) >> 3;
  const decompressed = new Uint8Array(MAX_MAP_LEAFS_BYTES);

  if (!inBuffer) {
    decompressed.fill(0xff, 0, row);
    return decompressed;
  }

  let inOffset = 0;
  let outOffset = 0;
  while (outOffset < row && inOffset < inBuffer.length) {
    const value = inBuffer[inOffset];
    inOffset += 1;

    if (value !== 0) {
      decompressed[outOffset] = value;
      outOffset += 1;
      continue;
    }

    const zeroCount = inOffset < inBuffer.length ? inBuffer[inOffset] : 0;
    inOffset += 1;
    const clampedCount = Math.min(zeroCount, row - outOffset);
    outOffset += clampedCount;
  }

  return decompressed;
}

/**
 * Original name: Mod_ClusterPVS
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Returns the decompressed PVS bitfield for one cluster, or the all-visible fallback.
 */
export function Mod_ClusterPVS(runtime: GlModelRuntime, cluster: number, model: model_t): Uint8Array {
  if (cluster === -1 || !model.vis) {
    return runtime.mod_novis;
  }

  const bitofs = model.vis.bitofs[cluster];
  if (!bitofs) {
    return runtime.mod_novis;
  }

  const offset = bitofs[0];
  const visibilityBytes = asVisibilityBytes(model.vis);
  if (offset < 0 || offset >= visibilityBytes.length) {
    return runtime.mod_novis;
  }

  return Mod_DecompressVis(visibilityBytes.subarray(offset), model);
}

/**
 * Original name: RadiusFromBounds
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Computes the radius of the farthest corner implied by the given mins/maxs bounds.
 */
export function RadiusFromBounds(mins: vec3_t, maxs: vec3_t): number {
  const corner: vec3_t = [0, 0, 0];

  for (let index = 0; index < 3; index += 1) {
    corner[index] = Math.abs(mins[index]) > Math.abs(maxs[index]) ? Math.abs(mins[index]) : Math.abs(maxs[index]);
  }

  return VectorLength(corner);
}

/**
 * Original name: Mod_LoadLighting
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Copies the raw BSP lighting lump into the active renderer model.
 */
export function Mod_LoadLighting(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (!lump.filelen) {
    model.lightdata = null;
    return;
  }

  model.lightdata = modBase.slice(lump.fileofs, lump.fileofs + lump.filelen);
}

/**
 * Original name: Mod_LoadVisibility
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Copies the BSP visibility lump and converts its little-endian header/offset pairs.
 */
export function Mod_LoadVisibility(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (!lump.filelen) {
    model.vis = null;
    return;
  }

  const raw = modBase.slice(lump.fileofs, lump.fileofs + lump.filelen);
  const numclusters = getLittleLong(raw, 0);
  const bitofs: Array<[number, number]> = [];
  for (let clusterIndex = 0; clusterIndex < numclusters; clusterIndex += 1) {
    const offset = 4 + clusterIndex * 8;
    bitofs.push([getLittleLong(raw, offset), getLittleLong(raw, offset + 4)]);
  }

  model.vis = createRendererVisData(numclusters, bitofs, raw);
}

/**
 * Original name: Mod_LoadVertexes
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Converts the BSP vertex lump into renderer `mvertex_t` entries.
 */
export function Mod_LoadVertexes(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % DVERTEX_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / DVERTEX_SIZE;
  const vertexes: mvertex_t[] = [];
  for (let index = 0; index < count; index += 1) {
    const offset = lump.fileofs + index * DVERTEX_SIZE;
    vertexes.push({
      position: [
        getLittleFloat(modBase, offset),
        getLittleFloat(modBase, offset + 4),
        getLittleFloat(modBase, offset + 8)
      ]
    });
  }

  model.vertexes = vertexes;
  model.numvertexes = count;
}

/**
 * Original name: Mod_LoadSubmodels
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Converts BSP submodels into renderer `mmodel_t` entries while spreading mins/maxs by one unit.
 */
export function Mod_LoadSubmodels(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % DMODEL_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / DMODEL_SIZE;
  const submodels: mmodel_t[] = [];
  for (let index = 0; index < count; index += 1) {
    const offset = lump.fileofs + index * DMODEL_SIZE;
    const mins: vec3_t = [
      getLittleFloat(modBase, offset) - 1,
      getLittleFloat(modBase, offset + 4) - 1,
      getLittleFloat(modBase, offset + 8) - 1
    ];
    const maxs: vec3_t = [
      getLittleFloat(modBase, offset + 12) + 1,
      getLittleFloat(modBase, offset + 16) + 1,
      getLittleFloat(modBase, offset + 20) + 1
    ];
    const origin: vec3_t = [
      getLittleFloat(modBase, offset + 24),
      getLittleFloat(modBase, offset + 28),
      getLittleFloat(modBase, offset + 32)
    ];

    submodels.push({
      mins,
      maxs,
      origin,
      radius: RadiusFromBounds(mins, maxs),
      headnode: getLittleLong(modBase, offset + 36),
      visleafs: 0,
      firstface: getLittleLong(modBase, offset + 40),
      numfaces: getLittleLong(modBase, offset + 44)
    });
  }

  model.submodels = submodels;
  model.numsubmodels = count;
}

/**
 * Original name: Mod_LoadEdges
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Converts BSP edges into renderer `medge_t` entries and preserves the extra sentinel slot.
 */
export function Mod_LoadEdges(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % DEDGE_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / DEDGE_SIZE;
  const edges: medge_t[] = [];
  for (let index = 0; index < count; index += 1) {
    const offset = lump.fileofs + index * DEDGE_SIZE;
    edges.push({
      v: [getLittleShort(modBase, offset) & 0xffff, getLittleShort(modBase, offset + 2) & 0xffff],
      cachededgeoffset: 0
    });
  }

  edges.push({
    v: [0, 0],
    cachededgeoffset: 0
  });

  model.edges = edges;
  model.numedges = count;
}

/**
 * Original name: Mod_LoadTexinfo
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Converts BSP texinfo entries, resolves wall textures and computes animation chain lengths.
 */
export function Mod_LoadTexinfo(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % TEXINFO_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / TEXINFO_SIZE;
  const texinfo: mtexinfo_t[] = Array.from({ length: count }, () => createMTexinfo());
  model.texinfo = texinfo;
  model.numtexinfo = count;

  for (let index = 0; index < count; index += 1) {
    const offset = lump.fileofs + index * TEXINFO_SIZE;
    const out = texinfo[index];

    out.vecs = [
      [
        getLittleFloat(modBase, offset),
        getLittleFloat(modBase, offset + 4),
        getLittleFloat(modBase, offset + 8),
        getLittleFloat(modBase, offset + 12)
      ],
      [
        getLittleFloat(modBase, offset + 16),
        getLittleFloat(modBase, offset + 20),
        getLittleFloat(modBase, offset + 24),
        getLittleFloat(modBase, offset + 28)
      ]
    ];
    out.flags = getLittleLong(modBase, offset + 32);

    const next = getLittleLong(modBase, offset + 72);
    out.next = next > 0 && next < count ? texinfo[next] : null;

    const textureName = readCString(modBase, offset + 40, 32);
    const walPath = Com_sprintf(64, `textures/${textureName}.wal`);
    out.image = runtime.hooks.findImage?.(walPath, "wall") ?? null;
    if (!out.image) {
      runtime.hooks.print?.(`Couldn't load ${walPath}\n`);
      out.image = runtime.hooks.notextureImage ?? null;
    }
  }

  for (let index = 0; index < count; index += 1) {
    const out = texinfo[index];
    out.numframes = 1;
    for (let step = out.next; step && step !== out; step = step.next) {
      out.numframes += 1;
    }
  }
}

/**
 * Original name: CalcSurfaceExtents
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Fills `texturemins` and `extents` from the owning face edges and texinfo vectors.
 */
export function CalcSurfaceExtents(runtime: GlModelRuntime, surface: msurface_t): void {
  const model = requireLoadModel(runtime);
  const tex = surface.texinfo;
  if (!tex) {
    throw new Error("CalcSurfaceExtents: surface missing texinfo");
  }

  const mins: [number, number] = [999999, 999999];
  const maxs: [number, number] = [-99999, -99999];

  for (let index = 0; index < surface.numedges; index += 1) {
    const surfedge = model.surfedges[surface.firstedge + index];
    if (surfedge === undefined) {
      throw new Error("CalcSurfaceExtents: bad surfedge");
    }

    const vertex = surfedge >= 0
      ? model.vertexes[model.edges[surfedge].v[0]]
      : model.vertexes[model.edges[-surfedge].v[1]];
    if (!vertex) {
      throw new Error("CalcSurfaceExtents: missing vertex");
    }

    for (let axis = 0; axis < 2; axis += 1) {
      const val =
        (vertex.position[0] * tex.vecs[axis][0]) +
        (vertex.position[1] * tex.vecs[axis][1]) +
        (vertex.position[2] * tex.vecs[axis][2]) +
        tex.vecs[axis][3];
      if (val < mins[axis]) {
        mins[axis] = val;
      }
      if (val > maxs[axis]) {
        maxs[axis] = val;
      }
    }
  }

  for (let axis = 0; axis < 2; axis += 1) {
    const bmins = Math.floor(mins[axis] / 16);
    const bmaxs = Math.ceil(maxs[axis] / 16);
    surface.texturemins[axis] = bmins * 16;
    surface.extents[axis] = (bmaxs - bmins) * 16;
  }
}

/**
 * Original name: Mod_LoadFaces
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Converts BSP faces into renderer surfaces and runs the early lightmap/polygon build hooks.
 */
export function Mod_LoadFaces(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % DFACE_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / DFACE_SIZE;
  const surfaces: msurface_t[] = Array.from({ length: count }, () => createMSurface());
  model.surfaces = surfaces;
  model.numsurfaces = count;

  runtime.hooks.beginBuildingLightmaps?.(model);

  for (let surfnum = 0; surfnum < count; surfnum += 1) {
    const offset = lump.fileofs + surfnum * DFACE_SIZE;
    const out = surfaces[surfnum];

    out.firstedge = getLittleLong(modBase, offset + 4);
    out.numedges = getLittleShort(modBase, offset + 8);
    out.flags = 0;
    out.polys = null;

    const planenum = getLittleShort(modBase, offset);
    const side = getLittleShort(modBase, offset + 2);
    if (side) {
      out.flags |= SURF_PLANEBACK;
    }

    out.plane = model.planes[planenum] ?? null;

    const texinfoIndex = getLittleShort(modBase, offset + 10);
    if (texinfoIndex < 0 || texinfoIndex >= model.numtexinfo) {
      throw new Error("MOD_LoadBmodel: bad texinfo number");
    }
    out.texinfo = model.texinfo[texinfoIndex];

    CalcSurfaceExtents(runtime, out);

    out.styles = [
      modBase[offset + 12] as byte,
      modBase[offset + 13] as byte,
      modBase[offset + 14] as byte,
      modBase[offset + 15] as byte
    ];

    const lightofs = getLittleLong(modBase, offset + 16);
    out.samples = lightofs === -1 || !model.lightdata ? null : model.lightdata.subarray(lightofs);

    if (out.texinfo.flags & SURF_WARP) {
      out.flags |= SURF_DRAWTURB;
      out.extents = [16384, 16384];
      out.texturemins = [-8192, -8192];
      runtime.hooks.subdivideSurface?.(out);
    }

    if (!(out.texinfo.flags & (SURF_SKY | SURF_TRANS33 | SURF_TRANS66 | SURF_WARP))) {
      runtime.hooks.createSurfaceLightmap?.(out);
    }

    if (!(out.texinfo.flags & SURF_WARP)) {
      runtime.hooks.buildPolygonFromSurface?.(out);
    }
  }

  runtime.hooks.endBuildingLightmaps?.();
}

/**
 * Original name: Mod_SetParent
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Propagates parent pointers through the mixed node/leaf BSP tree.
 */
export function Mod_SetParent(node: mnode_child_t, parent: mnode_t | null): void {
  node.parent = parent;
  if (!isMNode(node)) {
    return;
  }

  const child0 = node.children[0];
  const child1 = node.children[1];
  if (!child0 || !child1) {
    throw new Error("Mod_SetParent: node missing child");
  }

  Mod_SetParent(child0, node);
  Mod_SetParent(child1, node);
}

/**
 * Original name: Mod_LoadMarksurfaces
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Converts the leaf-face index table into direct surface references.
 */
export function Mod_LoadMarksurfaces(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % MARKSURFACE_INDEX_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / MARKSURFACE_INDEX_SIZE;
  const marksurfaces: msurface_t[] = [];
  for (let index = 0; index < count; index += 1) {
    const surfaceIndex = getLittleShort(modBase, lump.fileofs + index * MARKSURFACE_INDEX_SIZE);
    if (surfaceIndex < 0 || surfaceIndex >= model.numsurfaces) {
      throw new Error("Mod_ParseMarksurfaces: bad surface number");
    }

    marksurfaces.push(model.surfaces[surfaceIndex]);
  }

  model.marksurfaces = marksurfaces;
  model.nummarksurfaces = count;
}

/**
 * Original name: Mod_LoadSurfedges
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Converts the signed surface-edge table used by face winding reconstruction.
 */
export function Mod_LoadSurfedges(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % SURFEDGE_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / SURFEDGE_SIZE;
  if (count < 1 || count >= MAX_MAP_SURFEDGES) {
    throw new Error(`MOD_LoadBmodel: bad surfedges count in ${model.name}: ${count}`);
  }

  const surfedges: number[] = [];
  for (let index = 0; index < count; index += 1) {
    surfedges.push(getLittleLong(modBase, lump.fileofs + index * SURFEDGE_SIZE));
  }

  model.surfedges = surfedges;
  model.numsurfedges = count;
}

/**
 * Original name: Mod_LoadLeafs
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Converts BSP leaves and resolves their mark-surface slices.
 */
export function Mod_LoadLeafs(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % DLEAF_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / DLEAF_SIZE;
  model.leafs = Array.from({ length: count }, () => createLeafRecord());
  model.numleafs = count;

  for (let index = 0; index < count; index += 1) {
    const offset = lump.fileofs + index * DLEAF_SIZE;
    const out = model.leafs[index];

    out.minmaxs = [
      getLittleShort(modBase, offset + 8),
      getLittleShort(modBase, offset + 10),
      getLittleShort(modBase, offset + 12),
      getLittleShort(modBase, offset + 14),
      getLittleShort(modBase, offset + 16),
      getLittleShort(modBase, offset + 18)
    ];
    out.contents = getLittleLong(modBase, offset);
    out.cluster = getLittleShort(modBase, offset + 4);
    out.area = getLittleShort(modBase, offset + 6);

    const firstleafface = getLittleShort(modBase, offset + 20);
    out.nummarksurfaces = getLittleShort(modBase, offset + 22);
    out.firstmarksurface = model.marksurfaces.slice(firstleafface, firstleafface + out.nummarksurfaces);
  }
}

/**
 * Original name: Mod_LoadNodes
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Converts BSP nodes and stitches their children to previously loaded nodes and leaves.
 */
export function Mod_LoadNodes(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % DNODE_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / DNODE_SIZE;
  model.nodes = Array.from({ length: count }, () => createNodeRecord());
  model.numnodes = count;

  for (let index = 0; index < count; index += 1) {
    const offset = lump.fileofs + index * DNODE_SIZE;
    const out = model.nodes[index];

    out.minmaxs = [
      getLittleShort(modBase, offset + 12),
      getLittleShort(modBase, offset + 14),
      getLittleShort(modBase, offset + 16),
      getLittleShort(modBase, offset + 18),
      getLittleShort(modBase, offset + 20),
      getLittleShort(modBase, offset + 22)
    ];

    const planeIndex = getLittleLong(modBase, offset);
    out.plane = model.planes[planeIndex] ?? null;
    out.firstsurface = getLittleShort(modBase, offset + 24);
    out.numsurfaces = getLittleShort(modBase, offset + 26);
    out.contents = -1;

    for (let childIndex = 0; childIndex < 2; childIndex += 1) {
      const childPointer = getLittleLong(modBase, offset + 4 + childIndex * 4);
      out.children[childIndex] = childPointer >= 0
        ? (model.nodes[childPointer] ?? null)
        : (model.leafs[-1 - childPointer] ?? null);
    }
  }

  if (model.nodes[0]) {
    Mod_SetParent(model.nodes[0], null);
  }
}

/**
 * Original name: Mod_LoadPlanes
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Converts BSP planes into renderer `cplane_t` entries and computes Quake-style signbits.
 */
export function Mod_LoadPlanes(runtime: GlModelRuntime, lump: lump_t, modBase: Uint8Array): void {
  const model = requireLoadModel(runtime);
  if (lump.filelen % DPLANE_SIZE) {
    throw createFunnyLumpSizeError(model.name);
  }

  const count = lump.filelen / DPLANE_SIZE;
  const planes: cplane_t[] = [];
  for (let index = 0; index < count; index += 1) {
    const offset = lump.fileofs + index * DPLANE_SIZE;
    const normal: vec3_t = [
      getLittleFloat(modBase, offset),
      getLittleFloat(modBase, offset + 4),
      getLittleFloat(modBase, offset + 8)
    ];
    planes.push({
      normal,
      dist: getLittleFloat(modBase, offset + 12),
      type: getLittleLong(modBase, offset + 16),
      signbits: computePlaneSignbits(normal),
      pad: [0, 0]
    });
  }

  model.planes = planes;
  model.numplanes = count;
}

/**
 * Original name: Mod_LoadBrushModel
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Orchestrates BSP lump loading for the renderer world model and populates inline `*N` brush submodels.
 *
 * Porting notes:
 * - Preserves the original load order and submodel wiring while using structured header reads instead of in-place byte swapping.
 */
export function Mod_LoadBrushModel(runtime: GlModelRuntime, mod: model_t, buffer: Uint8Array): void {
  const loadmodel = requireLoadModel(runtime);
  loadmodel.type = modtype_t.mod_brush;
  if (loadmodel !== runtime.mod_known[0]) {
    throw new Error("Loaded a brush model after the world");
  }

  const header = readBrushHeader(buffer);
  if (header.ident !== IDBSPHEADER) {
    throw new Error(`Mod_LoadBrushModel: ${mod.name} has wrong ident`);
  }

  if (header.version !== BSPVERSION) {
    throw new Error(`Mod_LoadBrushModel: ${mod.name} has wrong version number (${header.version} should be ${BSPVERSION})`);
  }

  Mod_LoadVertexes(runtime, header.lumps[LUMP_VERTEXES], buffer);
  Mod_LoadEdges(runtime, header.lumps[LUMP_EDGES], buffer);
  Mod_LoadSurfedges(runtime, header.lumps[LUMP_SURFEDGES], buffer);
  Mod_LoadLighting(runtime, header.lumps[LUMP_LIGHTING], buffer);
  Mod_LoadPlanes(runtime, header.lumps[LUMP_PLANES], buffer);
  Mod_LoadTexinfo(runtime, header.lumps[LUMP_TEXINFO], buffer);
  Mod_LoadFaces(runtime, header.lumps[LUMP_FACES], buffer);
  Mod_LoadMarksurfaces(runtime, header.lumps[LUMP_LEAFFACES], buffer);
  Mod_LoadVisibility(runtime, header.lumps[LUMP_VISIBILITY], buffer);
  Mod_LoadLeafs(runtime, header.lumps[LUMP_LEAFS], buffer);
  Mod_LoadNodes(runtime, header.lumps[LUMP_NODES], buffer);
  Mod_LoadSubmodels(runtime, header.lumps[LUMP_MODELS], buffer);
  mod.numframes = 2;

  for (let index = 0; index < mod.numsubmodels; index += 1) {
    const bm = mod.submodels[index];
    const starmod = runtime.mod_inline[index];
    copyModelShallow(starmod, loadmodel);

    starmod.firstmodelsurface = bm.firstface;
    starmod.nummodelsurfaces = bm.numfaces;
    starmod.firstnode = bm.headnode;
    if (starmod.firstnode >= loadmodel.numnodes) {
      throw new Error(`Inline model ${index} has bad firstnode`);
    }

    starmod.maxs = [...bm.maxs];
    starmod.mins = [...bm.mins];
    starmod.radius = bm.radius;

    if (index === 0) {
      copyModelShallow(loadmodel, starmod);
    }

    starmod.numleafs = bm.visleafs;
  }
}

/**
 * Original name: Mod_LoadAliasModel
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Validates and loads one MD2 alias model, registers its skins and applies the fixed legacy bounds used by Quake II.
 *
 * Porting notes:
 * - Reuses the existing structured MD2 parser instead of mirroring the original in-place hunk copy byte-for-byte.
 */
export function Mod_LoadAliasModel(runtime: GlModelRuntime, mod: model_t, buffer: Uint8Array): void {
  const alias = parseMd2(buffer, mod.name);
  if (alias.header.version !== ALIAS_VERSION) {
    throw new Error(`${mod.name} has wrong version number (${alias.header.version} should be ${ALIAS_VERSION})`);
  }

  for (let index = 0; index < alias.header.num_skins; index += 1) {
    mod.skins[index] = runtime.hooks.findImage?.(alias.skins[index], "skin") ?? null;
  }

  mod.extradata = alias;
  mod.type = modtype_t.mod_alias;
  mod.mins = [-32, -32, -32];
  mod.maxs = [32, 32, 32];
}

/**
 * Original name: Mod_LoadSpriteModel
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Validates and loads one SP2 sprite model, then resolves its frame images.
 *
 * Porting notes:
 * - Stores structured `dsprite_t` metadata in `extradata` instead of a hunk-backed raw C blob.
 */
export function Mod_LoadSpriteModel(runtime: GlModelRuntime, mod: model_t, buffer: Uint8Array): void {
  const sprite = parseSp2(buffer, mod.name);
  if (sprite.version !== SPRITE_VERSION) {
    throw new Error(`${mod.name} has wrong version number (${sprite.version} should be ${SPRITE_VERSION})`);
  }

  if (sprite.numframes > MAX_MD2SKINS) {
    throw new Error(`${mod.name} has too many frames (${sprite.numframes} > ${MAX_MD2SKINS})`);
  }

  for (let index = 0; index < sprite.numframes; index += 1) {
    mod.skins[index] = runtime.hooks.findImage?.(sprite.frames[index].name, "sprite") ?? null;
  }

  mod.extradata = sprite;
  mod.type = modtype_t.mod_sprite;
}

/**
 * Original name: Mod_ForName
 * Source: ref_gl/gl_model.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Resolves one model by name through inline lookup, cache lookup or filesystem loading.
 *
 * Porting notes:
 * - Alias and sprite dispatch are exposed through hooks until those branches are fully ported.
 */
export function Mod_ForName(runtime: GlModelRuntime, name: string, crash: boolean, worldModel: model_t | null): model_t | null {
  if (!name.length) {
    throw new Error("Mod_ForName: NULL name");
  }

  if (name.startsWith("*")) {
    const index = Number.parseInt(name.slice(1), 10);
    if (!Number.isFinite(index) || index < 1 || !worldModel || index >= worldModel.numsubmodels) {
      throw new Error("bad inline model number");
    }

    return runtime.mod_inline[index];
  }

  const known = findKnownModel(runtime, name);
  if (known) {
    return known;
  }

  const mod = allocateKnownModel(runtime);
  mod.name = name;

  const file = runtime.hooks.loadFile?.(mod.name) ?? null;
  runtime.modfilelen = file?.byteLength ?? 0;
  if (!file) {
    if (crash) {
      throw new Error(`Mod_NumForName: ${mod.name} not found`);
    }

    mod.name = "";
    return null;
  }

  runtime.loadmodel = mod;
  try {
    const fileId = getLittleLong(file, 0);
    switch (fileId) {
      case IDBSPHEADER:
        mod.extradata = file;
        Mod_LoadBrushModel(runtime, mod, file);
        break;
      case IDALIASHEADER:
        if (runtime.hooks.loadAliasModel) {
          runtime.hooks.loadAliasModel(runtime, mod, file);
        } else {
          Mod_LoadAliasModel(runtime, mod, file);
        }
        break;
      case IDSPRITEHEADER:
        if (runtime.hooks.loadSpriteModel) {
          runtime.hooks.loadSpriteModel(runtime, mod, file);
        } else {
          Mod_LoadSpriteModel(runtime, mod, file);
        }
        break;
      default:
        throw new Error(`Mod_NumForName: unknown fileid for ${mod.name}`);
    }

    mod.extradatasize = file.byteLength;
    return mod;
  } finally {
    runtime.hooks.freeFile?.(file);
  }
}

/**
 * Category: New
 * Purpose: Attach the raw packed visibility bytes needed by `Mod_ClusterPVS` to one parsed `dvis_t`.
 *
 * Constraints:
 * - Keeps the structured `numclusters` and `bitofs` fields intact.
 */
export interface RendererVisData {
  numclusters: number;
  bitofs: Array<[number, number]>;
  raw: Uint8Array;
}

/**
 * Category: New
 * Purpose: Create one renderer visibility payload combining parsed offsets with the original raw bytes.
 */
export function createRendererVisData(numclusters: number, bitofs: Array<[number, number]>, raw: Uint8Array): RendererVisData {
  return {
    numclusters,
    bitofs,
    raw
  };
}

/**
 * Category: New
 * Purpose: Narrow one model visibility payload to the renderer variant that still carries the raw bytes.
 */
function asVisibilityBytes(vis: model_t["vis"]): Uint8Array {
  if (vis && "raw" in vis && vis.raw instanceof Uint8Array) {
    return vis.raw;
  }

  return new Uint8Array(0);
}

/**
 * Category: New
 * Purpose: Distinguish renderer BSP nodes from leaves through the original `contents == -1` convention.
 */
function isMNode(node: mnode_child_t): node is mnode_t {
  return node.contents === -1;
}

function createNodeRecord(): mnode_t {
  return {
    contents: -1,
    visframe: 0,
    minmaxs: [0, 0, 0, 0, 0, 0],
    parent: null,
    plane: null,
    children: [null, null],
    firstsurface: 0,
    numsurfaces: 0
  };
}

function createLeafRecord(): mleaf_t {
  return {
    contents: 0,
    visframe: 0,
    minmaxs: [0, 0, 0, 0, 0, 0],
    parent: null,
    cluster: 0,
    area: 0,
    firstmarksurface: [],
    nummarksurfaces: 0
  };
}

/**
 * Category: New
 * Purpose: Require an active `loadmodel` exactly like the original file-global workflow.
 */
function requireLoadModel(runtime: GlModelRuntime): model_t {
  if (!runtime.loadmodel) {
    throw new Error("gl_model loadmodel is null");
  }

  return runtime.loadmodel;
}

/**
 * Category: New
 * Purpose: Keep the original `MOD_LoadBmodel: funny lump size in %s` failure wording.
 */
function createFunnyLumpSizeError(modelName: string): Error {
  return new Error(`MOD_LoadBmodel: funny lump size in ${modelName}`);
}

function readCString(buffer: Uint8Array, offset: number, maxLength: number): string {
  const end = offset + maxLength;
  let cursor = offset;
  while (cursor < end && buffer[cursor] !== 0) {
    cursor += 1;
  }

  return new TextDecoder("ascii").decode(buffer.subarray(offset, cursor));
}

function computePlaneSignbits(normal: vec3_t): number {
  let bits = 0;
  if (normal[0] < 0) {
    bits |= 1;
  }
  if (normal[1] < 0) {
    bits |= 2;
  }
  if (normal[2] < 0) {
    bits |= 4;
  }

  return bits;
}

function findKnownModel(runtime: GlModelRuntime, name: string): model_t | null {
  for (let index = 0; index < runtime.mod_numknown; index += 1) {
    const mod = runtime.mod_known[index];
    if (!mod.name) {
      continue;
    }

    if (mod.name === name) {
      return mod;
    }
  }

  return null;
}

function allocateKnownModel(runtime: GlModelRuntime): model_t {
  for (let index = 0; index < runtime.mod_numknown; index += 1) {
    const mod = runtime.mod_known[index];
    if (!mod.name) {
      return mod;
    }
  }

  if (runtime.mod_numknown === MAX_MOD_KNOWN) {
    throw new Error("mod_numknown == MAX_MOD_KNOWN");
  }

  const mod = runtime.mod_known[runtime.mod_numknown];
  runtime.mod_numknown += 1;
  return mod;
}

function readBrushHeader(buffer: Uint8Array): dheader_t {
  const lumps: lump_t[] = [];
  for (let index = 0; index < HEADER_LUMPS; index += 1) {
    const offset = 8 + index * 8;
    lumps.push({
      fileofs: getLittleLong(buffer, offset),
      filelen: getLittleLong(buffer, offset + 4)
    });
  }

  return {
    ident: getLittleLong(buffer, 0),
    version: getLittleLong(buffer, 4),
    lumps
  };
}

function copyModelShallow(target: model_t, source: model_t): void {
  target.name = source.name;
  target.registration_sequence = source.registration_sequence;
  target.type = source.type;
  target.numframes = source.numframes;
  target.flags = source.flags;
  target.mins = [...source.mins];
  target.maxs = [...source.maxs];
  target.radius = source.radius;
  target.clipbox = source.clipbox;
  target.clipmins = [...source.clipmins];
  target.clipmaxs = [...source.clipmaxs];
  target.firstmodelsurface = source.firstmodelsurface;
  target.nummodelsurfaces = source.nummodelsurfaces;
  target.lightmap = source.lightmap;
  target.numsubmodels = source.numsubmodels;
  target.submodels = source.submodels;
  target.numplanes = source.numplanes;
  target.planes = source.planes;
  target.numleafs = source.numleafs;
  target.leafs = source.leafs;
  target.numvertexes = source.numvertexes;
  target.vertexes = source.vertexes;
  target.numedges = source.numedges;
  target.edges = source.edges;
  target.numnodes = source.numnodes;
  target.firstnode = source.firstnode;
  target.nodes = source.nodes;
  target.numtexinfo = source.numtexinfo;
  target.texinfo = source.texinfo;
  target.numsurfaces = source.numsurfaces;
  target.surfaces = source.surfaces;
  target.numsurfedges = source.numsurfedges;
  target.surfedges = source.surfedges;
  target.nummarksurfaces = source.nummarksurfaces;
  target.marksurfaces = source.marksurfaces;
  target.vis = source.vis;
  target.lightdata = source.lightdata;
  target.skins = source.skins.slice();
  target.extradatasize = source.extradatasize;
  target.extradata = source.extradata;
}

export type renderer_dvis_t = RendererVisData;
