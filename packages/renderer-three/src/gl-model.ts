/**
 * File: gl-model.ts
 * Source: Quake II original / ref_gl/gl_model.h
 * Purpose: Port the renderer-side in-memory model declarations used by the original GL refresh module.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses TypeScript interfaces, tuples and arrays instead of C pointers and flexible array members.
 * - Represents renderer-owned opaque image handles as `unknown`.
 * - Replaces pointer-to-first-element fields with typed slices while preserving explicit count fields.
 *
 * Notes:
 * - This file is the principal attachment point for `ref_gl/gl_model.h`.
 * - It describes the in-memory renderer model graph consumed by later `gl_model.c`, `gl_rsurf.c` and `gl_light.c` ports.
 */

import type { dvis_t } from "../../formats/src/index.js";
import { MAXLIGHTMAPS, MAX_MD2SKINS } from "../../formats/src/index.js";
import type { byte, cplane_t, qboolean, vec3_t } from "../../qcommon/src/index.js";
import { MAX_QPATH } from "../../qcommon/src/index.js";

export { MAX_MD2SKINS };

/**
 * Original name: image_t
 * Source: ref_gl/gl_model.h
 * Category: Adapter
 * Purpose: Keep the renderer model graph independent from the concrete image manager shape.
 */
export type image_t = unknown;

/**
 * Original name: model_s
 * Source: ref_gl/gl_model.h
 * Category: Adapter
 * Purpose: Preserve the C forward-struct spelling used by refresh/client contracts.
 */
export type model_s = model_t;

/**
 * Original name: SIDE_FRONT
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SIDE_FRONT = 0;

/**
 * Original name: SIDE_BACK
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SIDE_BACK = 1;

/**
 * Original name: SIDE_ON
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SIDE_ON = 2;

/**
 * Original name: SURF_PLANEBACK
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SURF_PLANEBACK = 2;

/**
 * Original name: SURF_DRAWSKY
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SURF_DRAWSKY = 4;

/**
 * Original name: SURF_DRAWTURB
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SURF_DRAWTURB = 0x10;

/**
 * Original name: SURF_DRAWBACKGROUND
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SURF_DRAWBACKGROUND = 0x40;

/**
 * Original name: SURF_UNDERWATER
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const SURF_UNDERWATER = 0x80;

/**
 * Original name: VERTEXSIZE
 * Source: ref_gl/gl_model.h
 * Category: Ported
 */
export const VERTEXSIZE = 7;

/**
 * Original name: mvertex_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Strict
 */
export interface mvertex_t {
  position: vec3_t;
}

/**
 * Original name: mmodel_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Strict
 */
export interface mmodel_t {
  mins: vec3_t;
  maxs: vec3_t;
  origin: vec3_t;
  radius: number;
  headnode: number;
  visleafs: number;
  firstface: number;
  numfaces: number;
}

/**
 * Original name: medge_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Strict
 */
export interface medge_t {
  v: [number, number];
  cachededgeoffset: number;
}

/**
 * Original name: mtexinfo_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Preserves the linked animation chain shape with `next`.
 */
export interface mtexinfo_t {
  vecs: [[number, number, number, number], [number, number, number, number]];
  flags: number;
  numframes: number;
  next: mtexinfo_t | null;
  image: image_t | null;
}

/**
 * Original name: glpoly_s.verts element
 * Source: ref_gl/gl_model.h
 * Category: Adapter
 * Purpose: Represent one `VERTEXSIZE` tuple from the original flexible vertex payload.
 */
export type glpoly_vertex_t = [number, number, number, number, number, number, number];

/**
 * Original name: glpoly_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - The original flexible array member becomes a dynamic array of `VERTEXSIZE` tuples.
 */
export interface glpoly_t {
  next: glpoly_t | null;
  chain: glpoly_t | null;
  numverts: number;
  flags: number;
  verts: glpoly_vertex_t[];
}

/**
 * Original name: msurface_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Close
 */
export interface msurface_t {
  visframe: number;
  plane: cplane_t | null;
  flags: number;
  firstedge: number;
  numedges: number;
  texturemins: [number, number];
  extents: [number, number];
  light_s: number;
  light_t: number;
  dlight_s: number;
  dlight_t: number;
  polys: glpoly_t | null;
  texturechain: msurface_t | null;
  lightmapchain: msurface_t | null;
  texinfo: mtexinfo_t | null;
  dlightframe: number;
  dlightbits: number;
  lightmaptexturenum: number;
  styles: [byte, byte, byte, byte];
  cached_light: [number, number, number, number];
  samples: Uint8Array | null;
}

/**
 * Original name: mnode_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Child pointers accept either another node or a leaf, matching the shared node/leaf header in the source.
 */
export interface mnode_t {
  contents: number;
  visframe: number;
  minmaxs: [number, number, number, number, number, number];
  parent: mnode_t | null;
  plane: cplane_t | null;
  children: [mnode_child_t | null, mnode_child_t | null];
  firstsurface: number;
  numsurfaces: number;
}

/**
 * Original name: mleaf_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - `firstmarksurface` is represented as the logical slice of marksurfaces referenced by the original pointer.
 */
export interface mleaf_t {
  contents: number;
  visframe: number;
  minmaxs: [number, number, number, number, number, number];
  parent: mnode_t | null;
  cluster: number;
  area: number;
  firstmarksurface: msurface_t[];
  nummarksurfaces: number;
}

/**
 * Original name: mnode_s.children
 * Source: ref_gl/gl_model.h
 * Category: Adapter
 * Purpose: Model the shared node/leaf child pointer shape in TypeScript.
 */
export type mnode_child_t = mnode_t | mleaf_t;

/**
 * Original name: modtype_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Strict
 */
export enum modtype_t {
  mod_bad,
  mod_brush,
  mod_sprite,
  mod_alias
}

/**
 * Original name: model_t
 * Source: ref_gl/gl_model.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Keeps all brush-model arrays explicit and preserves alias/sprite payload storage through `extradata`.
 */
export interface model_t {
  name: string;
  registration_sequence: number;
  type: modtype_t;
  numframes: number;
  flags: number;
  mins: vec3_t;
  maxs: vec3_t;
  radius: number;
  clipbox: qboolean;
  clipmins: vec3_t;
  clipmaxs: vec3_t;
  firstmodelsurface: number;
  nummodelsurfaces: number;
  lightmap: number;
  numsubmodels: number;
  submodels: mmodel_t[];
  numplanes: number;
  planes: cplane_t[];
  numleafs: number;
  leafs: mleaf_t[];
  numvertexes: number;
  vertexes: mvertex_t[];
  numedges: number;
  edges: medge_t[];
  numnodes: number;
  firstnode: number;
  nodes: mnode_t[];
  numtexinfo: number;
  texinfo: mtexinfo_t[];
  numsurfaces: number;
  surfaces: msurface_t[];
  numsurfedges: number;
  surfedges: number[];
  nummarksurfaces: number;
  marksurfaces: msurface_t[];
  vis: dvis_t | null;
  lightdata: Uint8Array | null;
  skins: Array<image_t | null>;
  extradatasize: number;
  extradata: unknown;
}

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `mvertex_t` with the canonical Quake II tuple shape.
 */
export function createMVertex(): mvertex_t {
  return {
    position: [0, 0, 0]
  };
}

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `mmodel_t` aligned with the original in-memory brush submodel shape.
 */
export function createMModel(): mmodel_t {
  return {
    mins: [0, 0, 0],
    maxs: [0, 0, 0],
    origin: [0, 0, 0],
    radius: 0,
    headnode: 0,
    visleafs: 0,
    firstface: 0,
    numfaces: 0
  };
}

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `medge_t`.
 */
export function createMEdge(): medge_t {
  return {
    v: [0, 0],
    cachededgeoffset: 0
  };
}

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `mtexinfo_t`.
 */
export function createMTexinfo(): mtexinfo_t {
  return {
    vecs: [
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    flags: 0,
    numframes: 0,
    next: null,
    image: null
  };
}

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `glpoly_t`.
 */
export function createGlPoly(): glpoly_t {
  return {
    next: null,
    chain: null,
    numverts: 0,
    flags: 0,
    verts: []
  };
}

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `msurface_t`.
 */
export function createMSurface(): msurface_t {
  return {
    visframe: 0,
    plane: null,
    flags: 0,
    firstedge: 0,
    numedges: 0,
    texturemins: [0, 0],
    extents: [0, 0],
    light_s: 0,
    light_t: 0,
    dlight_s: 0,
    dlight_t: 0,
    polys: null,
    texturechain: null,
    lightmapchain: null,
    texinfo: null,
    dlightframe: 0,
    dlightbits: 0,
    lightmaptexturenum: 0,
    styles: [0, 0, 0, 0],
    cached_light: [0, 0, 0, 0],
    samples: null
  };
}

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `mnode_t`.
 */
export function createMNode(): mnode_t {
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

/**
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty `mleaf_t`.
 */
export function createMLeaf(): mleaf_t {
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
 * Original name: N/A
 * Source: N/A (renderer model factory)
 * Category: New
 * Purpose: Create one empty renderer `model_t` ready to be populated by later `gl_model.c` loading logic.
 */
export function createModel(): model_t {
  return {
    name: "",
    registration_sequence: 0,
    type: modtype_t.mod_bad,
    numframes: 0,
    flags: 0,
    mins: [0, 0, 0],
    maxs: [0, 0, 0],
    radius: 0,
    clipbox: false,
    clipmins: [0, 0, 0],
    clipmaxs: [0, 0, 0],
    firstmodelsurface: 0,
    nummodelsurfaces: 0,
    lightmap: 0,
    numsubmodels: 0,
    submodels: [],
    numplanes: 0,
    planes: [],
    numleafs: 0,
    leafs: [],
    numvertexes: 0,
    vertexes: [],
    numedges: 0,
    edges: [],
    numnodes: 0,
    firstnode: 0,
    nodes: [],
    numtexinfo: 0,
    texinfo: [],
    numsurfaces: 0,
    surfaces: [],
    numsurfedges: 0,
    surfedges: [],
    nummarksurfaces: 0,
    marksurfaces: [],
    vis: null,
    lightdata: null,
    skins: Array.from({ length: MAX_MD2SKINS }, () => null),
    extradatasize: 0,
    extradata: null
  };
}

/**
 * Original name: N/A
 * Source: N/A (renderer model helper)
 * Category: New
 * Purpose: Mirror the original fixed-size `name[MAX_QPATH]` contract in one guard helper.
 *
 * Constraints:
 * - Must reject strings longer than the original `MAX_QPATH - 1` payload budget.
 */
export function isModelNameWithinQPath(name: string): boolean {
  return name.length < MAX_QPATH;
}

/**
 * Original name: N/A
 * Source: N/A (renderer model helper)
 * Category: New
 * Purpose: Check whether a surface carries any baked or dynamic lightmap style payload.
 */
export function hasSurfaceSamples(surface: msurface_t): boolean {
  return surface.samples !== null && surface.samples.length > 0;
}

/**
 * Original name: N/A
 * Source: N/A (renderer model helper)
 * Category: New
 * Purpose: Check whether a polygon vertex conforms to the original `VERTEXSIZE` payload.
 */
export function isValidGlPolyVertex(vertex: readonly number[]): vertex is glpoly_vertex_t {
  return vertex.length === VERTEXSIZE;
}

/**
 * Original name: N/A
 * Source: N/A (renderer model helper)
 * Category: New
 * Purpose: Check whether a polygon payload is internally consistent with `numverts`.
 */
export function isValidGlPoly(poly: glpoly_t): boolean {
  return poly.numverts === poly.verts.length && poly.verts.every((vertex) => isValidGlPolyVertex(vertex));
}

/**
 * Original name: N/A
 * Source: N/A (renderer model helper)
 * Category: New
 * Purpose: Validate one model skin table against the original `MAX_MD2SKINS` fixed width.
 */
export function hasValidModelSkinCount(model: model_t): boolean {
  return model.skins.length === MAX_MD2SKINS;
}

/**
 * Original name: N/A
 * Source: N/A (renderer model helper)
 * Category: New
 * Purpose: Expose the original lightstyle slot count used by `msurface_t`.
 */
export function getSurfaceStyleCapacity(): number {
  return MAXLIGHTMAPS;
}
