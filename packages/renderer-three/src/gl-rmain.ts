/**
 * File: gl-rmain.ts
 * Source: Quake II original / ref_gl/gl_rmain.c
 * Purpose: Port the main GL refresh frame orchestration helpers and shared view-state routines.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Replaces direct GL state mutation with explicit runtime state and hooks.
 * - Leaves renderer-backend submission behind callbacks while preserving the original call order.
 * - Focuses this tranche on frame setup, frustum state, beam geometry, palette handling and render orchestration.
 *
 * Notes:
 * - This file is the principal attachment point for `ref_gl/gl_rmain.c`.
 * - The remaining bootstrap and API-export portions can build on this runtime once more renderer branches are ported.
 */

import { CONTENTS_SOLID, type dsprite_t } from "../../formats/src/index.js";
import {
  AngleVectors,
  BoxOnPlaneSide,
  DotProduct,
  ERR_DROP,
  M_PI,
  PerpendicularVector,
  PRINT_ALL,
  RDF_NOWORLDMODEL,
  RF_BEAM,
  RF_FULLBRIGHT,
  RF_TRANSLUCENT,
  RotatePointAroundVector,
  VectorAdd,
  VectorCopy,
  VectorMA,
  VectorNormalize,
  VectorScale,
  type cplane_t,
  type vec3_t
} from "../../qcommon/src/index.js";
import type { cvar_t } from "../../qcommon/src/cvar.js";
import type { dlight_t, entity_t, particle_t, refdef_t } from "../../client/src/ref.js";
import type { image_t, model_t, msurface_t } from "./gl-model.js";
import { modtype_t } from "./gl-model.js";

const NUM_BEAM_SEGS = 6;

export interface GlRmainViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GlRmainBeamSegment {
  start: vec3_t;
  end: vec3_t;
}

export interface GlRmainSpriteVertex {
  position: vec3_t;
  uv: [number, number];
}

export interface GlRmainParticleTriangle {
  color: [number, number, number, number];
  vertices: Array<{
    position: vec3_t;
    uv: [number, number];
  }>;
}

export interface GlRmainProjection {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  zNear: number;
  zFar: number;
}

export interface GlRmainGlState {
  camera_separation: number;
  stereo_enabled: boolean;
  current_draw_buffer: "GL_FRONT" | "GL_BACK" | null;
}

export interface GlRmainHooks {
  pointInLeaf?: (point: vec3_t, worldmodel: model_t) => { cluster: number; contents: number } | null;
  onNoworldModelClear?: (viewport: GlRmainViewport) => void;
  onViewportSetup?: (viewport: GlRmainViewport) => void;
  onProjectionSetup?: (projection: GlRmainProjection) => void;
  onModelViewSetup?: (matrix: Float32Array) => void;
  onSetGL2D?: (viewport: GlRmainViewport) => void;
  onClear?: (options: { clearColor: boolean; clearDepth: boolean; gldepthmin: number; gldepthmax: number; depthFunc: "LEQUAL" | "GEQUAL" }) => void;
  onSetTexturePalette?: (palette: Uint32Array) => void;
  onSetDrawBuffer?: (buffer: "GL_FRONT" | "GL_BACK") => void;
  onDrawBeam?: (entity: entity_t, color: [number, number, number], segments: GlRmainBeamSegment[]) => void;
  onDrawSpriteModel?: (entity: entity_t, texture: image_t | null, alpha: number, vertices: GlRmainSpriteVertex[]) => void;
  onDrawNullModel?: (entity: entity_t, shadelight: vec3_t, topFan: vec3_t[], bottomFan: vec3_t[]) => void;
  onDrawParticles?: (texture: image_t | null, triangles: GlRmainParticleTriangle[]) => void;
  onDrawPointParticles?: (particles: Array<{ position: vec3_t; color: [number, number, number, number]; size: number }>) => void;
  drawAliasModel?: (entity: entity_t) => void;
  drawBrushModel?: (entity: entity_t) => void;
  drawSpriteModel?: (entity: entity_t) => void;
  drawNullModel?: (entity: entity_t, shadelight: vec3_t) => void;
  lightPoint?: (origin: vec3_t) => vec3_t;
  pushDlights?: () => void;
  markLeaves?: () => void;
  drawWorld?: () => void;
  renderDlights?: () => void;
  drawParticles?: () => void;
  drawAlphaSurfaces?: () => void;
  polyBlend?: (blend: [number, number, number, number]) => void;
  print?: (printLevel: number, message: string) => void;
  finish?: () => void;
  enableLogging?: (enabled: boolean) => void;
  logNewFrame?: () => void;
  updateSwapInterval?: () => void;
  textureMode?: (mode: string) => void;
  textureAlphaMode?: (mode: string) => void;
  textureSolidMode?: (mode: string) => void;
  sysError?: (level: number, message: string) => never;
}

export interface GlRmainRuntime {
  vid: { width: number; height: number };
  gl_state: GlRmainGlState;
  r_worldmodel: model_t | null;
  currententity: entity_t | null;
  currentmodel: model_t | null;
  frustum: [cplane_t, cplane_t, cplane_t, cplane_t];
  r_visframecount: number;
  r_framecount: number;
  c_brush_polys: number;
  c_alias_polys: number;
  c_visible_lightmaps: number;
  c_visible_textures: number;
  v_blend: [number, number, number, number];
  vup: vec3_t;
  vpn: vec3_t;
  vright: vec3_t;
  r_origin: vec3_t;
  r_world_matrix: Float32Array;
  r_newrefdef: refdef_t | null;
  r_viewcluster: number;
  r_viewcluster2: number;
  r_oldviewcluster: number;
  r_oldviewcluster2: number;
  gldepthmin: number;
  gldepthmax: number;
  trickframe: number;
  rawpalette: Uint32Array;
  d_8to24table: Uint32Array;
  r_particletexture: image_t | null;
  r_norefresh: cvar_t | null;
  r_drawentities: cvar_t | null;
  r_speeds: cvar_t | null;
  r_nocull: cvar_t | null;
  gl_finish: cvar_t | null;
  gl_clear: cvar_t | null;
  gl_ztrick: cvar_t | null;
  gl_polyblend: cvar_t | null;
  gl_log: cvar_t | null;
  gl_drawbuffer: cvar_t | null;
  gl_texturemode: cvar_t | null;
  gl_texturealphamode: cvar_t | null;
  gl_texturesolidmode: cvar_t | null;
  gl_swapinterval: cvar_t | null;
  gl_mode: cvar_t | null;
  gl_ext_pointparameters: cvar_t | null;
  gl_particle_size: cvar_t | null;
  vid_fullscreen: cvar_t | null;
  vid_gamma: cvar_t | null;
  vid_ref: cvar_t | null;
  r_lightlevel: cvar_t | null;
  hooks: GlRmainHooks;
}

/**
 * Category: New
 * Purpose: Create the explicit runtime replacing the mutable `gl_rmain.c` globals used by the current port tranche.
 */
export function createGlRmainRuntime(hooks: GlRmainHooks = {}): GlRmainRuntime {
  return {
    vid: { width: 0, height: 0 },
    gl_state: {
      camera_separation: 0,
      stereo_enabled: false,
      current_draw_buffer: null
    },
    r_worldmodel: null,
    currententity: null,
    currentmodel: null,
    frustum: [createPlane(), createPlane(), createPlane(), createPlane()],
    r_visframecount: 0,
    r_framecount: 0,
    c_brush_polys: 0,
    c_alias_polys: 0,
    c_visible_lightmaps: 0,
    c_visible_textures: 0,
    v_blend: [0, 0, 0, 0],
    vup: [0, 0, 0],
    vpn: [0, 0, 0],
    vright: [0, 0, 0],
    r_origin: [0, 0, 0],
    r_world_matrix: new Float32Array(16),
    r_newrefdef: null,
    r_viewcluster: -1,
    r_viewcluster2: -1,
    r_oldviewcluster: -1,
    r_oldviewcluster2: -1,
    gldepthmin: 0,
    gldepthmax: 1,
    trickframe: 0,
    rawpalette: new Uint32Array(256),
    d_8to24table: new Uint32Array(256),
    r_particletexture: null,
    r_norefresh: null,
    r_drawentities: null,
    r_speeds: null,
    r_nocull: null,
    gl_finish: null,
    gl_clear: null,
    gl_ztrick: null,
    gl_polyblend: null,
    gl_log: null,
    gl_drawbuffer: null,
    gl_texturemode: null,
    gl_texturealphamode: null,
    gl_texturesolidmode: null,
    gl_swapinterval: null,
    gl_mode: null,
    gl_ext_pointparameters: null,
    gl_particle_size: null,
    vid_fullscreen: null,
    vid_gamma: null,
    vid_ref: null,
    r_lightlevel: null,
    hooks
  };
}

/**
 * Original name: V_AddBlend
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function V_AddBlend(r: number, g: number, b: number, a: number, v_blend: [number, number, number, number]): void {
  if (a <= 0) {
    return;
  }

  const a2 = v_blend[3] + (1 - v_blend[3]) * a;
  const a3 = v_blend[3] / a2;

  v_blend[0] = v_blend[0] * a3 + r * (1 - a3);
  v_blend[1] = v_blend[1] * a3 + g * (1 - a3);
  v_blend[2] = v_blend[2] * a3 + b * (1 - a3);
  v_blend[3] = a2;
}

/**
 * Original name: SignbitsForPlane
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function SignbitsForPlane(out: cplane_t): number {
  let bits = 0;
  for (let index = 0; index < 3; index += 1) {
    if (out.normal[index] < 0) {
      bits |= 1 << index;
    }
  }
  return bits;
}

/**
 * Original name: R_CullBox
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function R_CullBox(runtime: GlRmainRuntime, mins: vec3_t, maxs: vec3_t): boolean {
  if (runtime.r_nocull?.value) {
    return false;
  }

  for (let index = 0; index < 4; index += 1) {
    if (BoxOnPlaneSide(mins, maxs, runtime.frustum[index]) === 2) {
      return true;
    }
  }
  return false;
}

/**
 * Original name: R_RotateForEntity
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Exposes the original translation/rotation order used for brush and null-model draws.
 */
export function R_RotateForEntity(entity: entity_t): {
  translate: vec3_t;
  rotate: Array<{ angle: number; axis: vec3_t }>;
} {
  return {
    translate: [entity.origin[0], entity.origin[1], entity.origin[2]],
    rotate: [
      { angle: entity.angles[1], axis: [0, 0, 1] },
      { angle: -entity.angles[0], axis: [0, 1, 0] },
      { angle: -entity.angles[2], axis: [1, 0, 0] }
    ]
  };
}

/**
 * Original name: R_SetFrustum
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function R_SetFrustum(runtime: GlRmainRuntime): void {
  const refdef = runtime.r_newrefdef;
  if (!refdef) {
    throw new Error("R_SetFrustum: r_newrefdef is null");
  }

  RotatePointAroundVector(runtime.frustum[0].normal, runtime.vup, runtime.vpn, -(90 - refdef.fov_x / 2));
  RotatePointAroundVector(runtime.frustum[1].normal, runtime.vup, runtime.vpn, 90 - refdef.fov_x / 2);
  RotatePointAroundVector(runtime.frustum[2].normal, runtime.vright, runtime.vpn, 90 - refdef.fov_y / 2);
  RotatePointAroundVector(runtime.frustum[3].normal, runtime.vright, runtime.vpn, -(90 - refdef.fov_y / 2));

  for (let index = 0; index < 4; index += 1) {
    const plane = runtime.frustum[index];
    plane.type = 5;
    plane.dist = DotProduct(runtime.r_origin, plane.normal);
    plane.signbits = SignbitsForPlane(plane);
  }
}

/**
 * Original name: R_SetupFrame
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Uses a point-in-leaf hook to preserve the original view-cluster behavior without coupling this file to one loader implementation.
 */
export function R_SetupFrame(runtime: GlRmainRuntime): void {
  const refdef = runtime.r_newrefdef;
  if (!refdef) {
    throw new Error("R_SetupFrame: r_newrefdef is null");
  }

  runtime.r_framecount += 1;
  VectorCopy(refdef.vieworg, runtime.r_origin);

  const vectors = AngleVectors(refdef.viewangles);
  VectorCopy(vectors.forward, runtime.vpn);
  VectorCopy(vectors.right, runtime.vright);
  VectorCopy(vectors.up, runtime.vup);

  if ((refdef.rdflags & RDF_NOWORLDMODEL) === 0) {
    const worldmodel = runtime.r_worldmodel;
    if (!worldmodel) {
      throw new Error("R_SetupFrame: r_worldmodel is null");
    }

    runtime.r_oldviewcluster = runtime.r_viewcluster;
    runtime.r_oldviewcluster2 = runtime.r_viewcluster2;

    const leaf = runtime.hooks.pointInLeaf?.(runtime.r_origin, worldmodel) ?? null;
    if (!leaf) {
      throw new Error("R_SetupFrame: pointInLeaf hook is required when drawing a worldmodel");
    }

    runtime.r_viewcluster = leaf.cluster;
    runtime.r_viewcluster2 = leaf.cluster;

    const temp: vec3_t = [runtime.r_origin[0], runtime.r_origin[1], runtime.r_origin[2]];
    if (!leaf.contents) {
      temp[2] -= 16;
    } else {
      temp[2] += 16;
    }

    const probeLeaf = runtime.hooks.pointInLeaf?.(temp, worldmodel) ?? null;
    if (probeLeaf && (probeLeaf.contents & CONTENTS_SOLID) === 0 && probeLeaf.cluster !== runtime.r_viewcluster2) {
      runtime.r_viewcluster2 = probeLeaf.cluster;
    }
  }

  for (let index = 0; index < 4; index += 1) {
    runtime.v_blend[index] = refdef.blend[index];
  }

  runtime.c_brush_polys = 0;
  runtime.c_alias_polys = 0;

  if ((refdef.rdflags & RDF_NOWORLDMODEL) !== 0) {
    runtime.hooks.onNoworldModelClear?.({
      x: refdef.x,
      y: refdef.y,
      width: refdef.width,
      height: refdef.height
    });
  }
}

/**
 * Original name: MYgluPerspective
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function MYgluPerspective(
  gl_state: GlRmainGlState,
  fovy: number,
  aspect: number,
  zNear: number,
  zFar: number
): GlRmainProjection {
  let ymax = zNear * Math.tan((fovy * M_PI) / 360.0);
  let ymin = -ymax;
  let xmin = ymin * aspect;
  let xmax = ymax * aspect;

  xmin += -(2 * gl_state.camera_separation) / zNear;
  xmax += -(2 * gl_state.camera_separation) / zNear;

  return { xmin, xmax, ymin, ymax, zNear, zFar };
}

/**
 * Original name: R_SetupGL
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Builds the logical viewport, projection and modelview matrix payloads and publishes them through hooks.
 */
export function R_SetupGL(runtime: GlRmainRuntime): void {
  const refdef = runtime.r_newrefdef;
  if (!refdef) {
    throw new Error("R_SetupGL: r_newrefdef is null");
  }

  const x = Math.floor(refdef.x * runtime.vid.width / runtime.vid.width);
  const x2 = Math.ceil((refdef.x + refdef.width) * runtime.vid.width / runtime.vid.width);
  const y = Math.floor(runtime.vid.height - refdef.y * runtime.vid.height / runtime.vid.height);
  const y2 = Math.ceil(runtime.vid.height - (refdef.y + refdef.height) * runtime.vid.height / runtime.vid.height);

  const viewport: GlRmainViewport = {
    x,
    y: y2,
    width: x2 - x,
    height: y - y2
  };
  runtime.hooks.onViewportSetup?.(viewport);

  const screenaspect = refdef.width / refdef.height;
  const projection = MYgluPerspective(runtime.gl_state, refdef.fov_y, screenaspect, 4, 4096);
  runtime.hooks.onProjectionSetup?.(projection);

  const worldMatrix = buildWorldMatrix(refdef.vieworg, refdef.viewangles);
  runtime.r_world_matrix.set(worldMatrix);
  runtime.hooks.onModelViewSetup?.(runtime.r_world_matrix);
}

/**
 * Original name: R_Clear
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function R_Clear(runtime: GlRmainRuntime): void {
  if (runtime.gl_ztrick?.value) {
    runtime.trickframe += 1;
    if (runtime.trickframe & 1) {
      runtime.gldepthmin = 0;
      runtime.gldepthmax = 0.49999;
      runtime.hooks.onClear?.({
        clearColor: Boolean(runtime.gl_clear?.value),
        clearDepth: false,
        gldepthmin: runtime.gldepthmin,
        gldepthmax: runtime.gldepthmax,
        depthFunc: "LEQUAL"
      });
    } else {
      runtime.gldepthmin = 1;
      runtime.gldepthmax = 0.5;
      runtime.hooks.onClear?.({
        clearColor: Boolean(runtime.gl_clear?.value),
        clearDepth: false,
        gldepthmin: runtime.gldepthmin,
        gldepthmax: runtime.gldepthmax,
        depthFunc: "GEQUAL"
      });
    }
    return;
  }

  runtime.gldepthmin = 0;
  runtime.gldepthmax = 1;
  runtime.hooks.onClear?.({
    clearColor: Boolean(runtime.gl_clear?.value),
    clearDepth: true,
    gldepthmin: runtime.gldepthmin,
    gldepthmax: runtime.gldepthmax,
    depthFunc: "LEQUAL"
  });
}

/**
 * Original name: R_SetGL2D
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 */
export function R_SetGL2D(runtime: GlRmainRuntime): void {
  runtime.hooks.onSetGL2D?.({
    x: 0,
    y: 0,
    width: runtime.vid.width,
    height: runtime.vid.height
  });
}

/**
 * Original name: R_PolyBlend
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 */
export function R_PolyBlend(runtime: GlRmainRuntime): void {
  if (!runtime.gl_polyblend?.value || runtime.v_blend[3] === 0) {
    return;
  }

  runtime.hooks.polyBlend?.(runtime.v_blend);
}

/**
 * Original name: R_Flash
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 */
export function R_Flash(runtime: GlRmainRuntime): void {
  R_PolyBlend(runtime);
}

/**
 * Original name: R_DrawBeam
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Reconstructs the original beam ring geometry and emits it through a hook.
 */
export function R_DrawBeam(runtime: GlRmainRuntime, e: entity_t): void {
  const oldorigin: vec3_t = [e.oldorigin[0], e.oldorigin[1], e.oldorigin[2]];
  const origin: vec3_t = [e.origin[0], e.origin[1], e.origin[2]];
  const direction: vec3_t = [
    oldorigin[0] - origin[0],
    oldorigin[1] - origin[1],
    oldorigin[2] - origin[2]
  ];
  const normalized_direction: vec3_t = [direction[0], direction[1], direction[2]];

  if (VectorNormalize(normalized_direction) === 0) {
    return;
  }

  const perpvec: vec3_t = [0, 0, 0];
  PerpendicularVector(perpvec, normalized_direction);
  VectorScale(perpvec, e.frame / 2, perpvec);

  const start_points: vec3_t[] = [];
  const end_points: vec3_t[] = [];
  for (let index = 0; index < NUM_BEAM_SEGS; index += 1) {
    const start: vec3_t = [0, 0, 0];
    RotatePointAroundVector(start, normalized_direction, perpvec, (360.0 / NUM_BEAM_SEGS) * index);
    VectorAdd(start, origin, start);
    const end: vec3_t = [0, 0, 0];
    VectorAdd(start, direction, end);
    start_points.push(start);
    end_points.push(end);
  }

  const packed = runtime.d_8to24table[e.skinnum & 0xff] ?? 0;
  const color: [number, number, number] = [
    (packed & 0xff) / 255.0,
    ((packed >> 8) & 0xff) / 255.0,
    ((packed >> 16) & 0xff) / 255.0
  ];
  const segments: GlRmainBeamSegment[] = start_points.map((start, index) => ({
    start,
    end: end_points[index]
  }));

  runtime.hooks.onDrawBeam?.(e, color, segments);
}

/**
 * Original name: R_SetPalette
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function R_SetPalette(runtime: GlRmainRuntime, palette: Uint8Array | null): void {
  for (let index = 0; index < 256; index += 1) {
    if (palette) {
      runtime.rawpalette[index] =
        ((0xff << 24) >>> 0) |
        ((palette[index * 3 + 2] ?? 0) << 16) |
        ((palette[index * 3 + 1] ?? 0) << 8) |
        (palette[index * 3] ?? 0);
    } else {
      const color = runtime.d_8to24table[index] ?? 0;
      runtime.rawpalette[index] =
        ((0xff << 24) >>> 0) |
        ((color >> 16) & 0xff) << 16 |
        ((color >> 8) & 0xff) << 8 |
        (color & 0xff);
    }
  }

  runtime.hooks.onSetTexturePalette?.(runtime.rawpalette);
}

/**
 * Original name: R_DrawSpriteModel
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Preserves sprite frame selection and billboard vertex construction while delegating final submission to hooks.
 */
export function R_DrawSpriteModel(runtime: GlRmainRuntime, e: entity_t): void {
  const currentmodel = runtime.currentmodel;
  if (!currentmodel) {
    throw new Error("R_DrawSpriteModel: currentmodel is null");
  }

  const sprite = currentmodel.extradata as dsprite_t | null;
  if (!sprite || sprite.numframes <= 0) {
    throw new Error("R_DrawSpriteModel: currentmodel missing sprite payload");
  }

  const frameIndex = e.frame % sprite.numframes;
  const frame = sprite.frames[frameIndex];
  if (!frame) {
    throw new Error("R_DrawSpriteModel: missing sprite frame");
  }

  const up = runtime.vup;
  const right = runtime.vright;
  const alpha = (e.flags & RF_TRANSLUCENT) !== 0 ? e.alpha : 1.0;
  const point: vec3_t = [0, 0, 0];
  const vertices: GlRmainSpriteVertex[] = [];

  VectorMA(e.origin, -frame.origin_y, up, point);
  VectorMA(point, -frame.origin_x, right, point);
  vertices.push({ position: [...point], uv: [0, 1] });

  VectorMA(e.origin, frame.height - frame.origin_y, up, point);
  VectorMA(point, -frame.origin_x, right, point);
  vertices.push({ position: [...point], uv: [0, 0] });

  VectorMA(e.origin, frame.height - frame.origin_y, up, point);
  VectorMA(point, frame.width - frame.origin_x, right, point);
  vertices.push({ position: [...point], uv: [1, 0] });

  VectorMA(e.origin, -frame.origin_y, up, point);
  VectorMA(point, frame.width - frame.origin_x, right, point);
  vertices.push({ position: [...point], uv: [1, 1] });

  runtime.hooks.onDrawSpriteModel?.(e, currentmodel.skins[frameIndex] ?? null, alpha, vertices);
  runtime.hooks.drawSpriteModel?.(e);
}

/**
 * Original name: R_DrawNullModel
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 */
export function R_DrawNullModel(runtime: GlRmainRuntime, entity: entity_t): void {
  const shadelight = (entity.flags & RF_FULLBRIGHT) !== 0
    ? ([1, 1, 1] as vec3_t)
    : runtime.hooks.lightPoint?.(entity.origin) ?? ([0, 0, 0] as vec3_t);

  const topFan: vec3_t[] = [[0, 0, -16]];
  for (let index = 0; index <= 4; index += 1) {
    topFan.push([16 * Math.cos(index * M_PI / 2), 16 * Math.sin(index * M_PI / 2), 0]);
  }

  const bottomFan: vec3_t[] = [[0, 0, 16]];
  for (let index = 4; index >= 0; index -= 1) {
    bottomFan.push([16 * Math.cos(index * M_PI / 2), 16 * Math.sin(index * M_PI / 2), 0]);
  }

  runtime.hooks.onDrawNullModel?.(entity, [...shadelight] as vec3_t, topFan, bottomFan);
  runtime.hooks.drawNullModel?.(entity, [...shadelight] as vec3_t);
}

/**
 * Original name: GL_DrawParticles
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_DrawParticles(
  runtime: GlRmainRuntime,
  num_particles: number,
  particles: readonly particle_t[],
  colortable: Uint32Array | readonly number[]
): void {
  const table = colortable instanceof Uint32Array ? colortable : Uint32Array.from(colortable);
  const up: vec3_t = [0, 0, 0];
  const right: vec3_t = [0, 0, 0];
  VectorScale(runtime.vup, 1.5, up);
  VectorScale(runtime.vright, 1.5, right);

  const triangles: GlRmainParticleTriangle[] = [];
  for (let index = 0; index < num_particles; index += 1) {
    const particle = particles[index];
    if (!particle) {
      continue;
    }

    let scale =
      (particle.origin[0] - runtime.r_origin[0]) * runtime.vpn[0] +
      (particle.origin[1] - runtime.r_origin[1]) * runtime.vpn[1] +
      (particle.origin[2] - runtime.r_origin[2]) * runtime.vpn[2];
    scale = scale < 20 ? 1 : 1 + scale * 0.004;

    const packed = table[particle.color] ?? 0;
    const color: [number, number, number, number] = [
      (packed & 0xff) / 255.0,
      ((packed >> 8) & 0xff) / 255.0,
      ((packed >> 16) & 0xff) / 255.0,
      particle.alpha
    ];

    triangles.push({
      color,
      vertices: [
        { position: [...particle.origin], uv: [0.0625, 0.0625] },
        {
          position: [
            particle.origin[0] + up[0] * scale,
            particle.origin[1] + up[1] * scale,
            particle.origin[2] + up[2] * scale
          ],
          uv: [1.0625, 0.0625]
        },
        {
          position: [
            particle.origin[0] + right[0] * scale,
            particle.origin[1] + right[1] * scale,
            particle.origin[2] + right[2] * scale
          ],
          uv: [0.0625, 1.0625]
        }
      ]
    });
  }

  runtime.hooks.onDrawParticles?.(runtime.r_particletexture, triangles);
}

/**
 * Original name: R_DrawParticles
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 */
export function R_DrawParticles(runtime: GlRmainRuntime): void {
  const refdef = runtime.r_newrefdef;
  if (!refdef) {
    return;
  }

  if (runtime.gl_ext_pointparameters?.value) {
    const points = refdef.particles.slice(0, refdef.num_particles).map((particle) => {
      const packed = runtime.d_8to24table[particle.color] ?? 0;
      return {
        position: [...particle.origin] as vec3_t,
        color: [
          (packed & 0xff) / 255.0,
          ((packed >> 8) & 0xff) / 255.0,
          ((packed >> 16) & 0xff) / 255.0,
          particle.alpha
        ] as [number, number, number, number],
        size: runtime.gl_particle_size?.value ?? 1
      };
    });
    runtime.hooks.onDrawPointParticles?.(points);
    runtime.hooks.drawParticles?.();
    return;
  }

  GL_DrawParticles(runtime, refdef.num_particles, refdef.particles, runtime.d_8to24table);
  runtime.hooks.drawParticles?.();
}

/**
 * Original name: R_DrawEntitiesOnList
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Keeps the original draw order and model-type dispatch while delegating the concrete rendering branches through hooks.
 */
export function R_DrawEntitiesOnList(runtime: GlRmainRuntime): void {
  const refdef = runtime.r_newrefdef;
  if (!refdef || runtime.r_drawentities?.value === 0) {
    return;
  }

  for (let pass = 0; pass < 2; pass += 1) {
    const translucentPass = pass === 1;
    for (let index = 0; index < refdef.num_entities; index += 1) {
      const entity = refdef.entities[index];
      const isTranslucent = (entity.flags & RF_TRANSLUCENT) !== 0;
      if (isTranslucent !== translucentPass) {
        continue;
      }

      runtime.currententity = entity;
      if ((entity.flags & RF_BEAM) !== 0) {
        R_DrawBeam(runtime, entity);
        continue;
      }

      runtime.currentmodel = entity.model as model_t | null;
      if (!runtime.currentmodel) {
        R_DrawNullModel(runtime, entity);
        continue;
      }

      switch (runtime.currentmodel.type) {
        case modtype_t.mod_alias:
          runtime.hooks.drawAliasModel?.(entity);
          break;
        case modtype_t.mod_brush:
          runtime.hooks.drawBrushModel?.(entity);
          break;
        case modtype_t.mod_sprite:
          R_DrawSpriteModel(runtime, entity);
          break;
        default:
          failSysError(runtime, ERR_DROP, "Bad modeltype");
      }
    }
  }
}

/**
 * Original name: R_RenderView
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Preserves the original high-level call order while delegating already-portioned sub-branches through hooks.
 */
export function R_RenderView(runtime: GlRmainRuntime, fd: refdef_t): void {
  if (runtime.r_norefresh?.value) {
    return;
  }

  runtime.r_newrefdef = cloneRefdef(fd);
  if (!runtime.r_worldmodel && (fd.rdflags & RDF_NOWORLDMODEL) === 0) {
    failSysError(runtime, ERR_DROP, "R_RenderView: NULL worldmodel");
  }

  if (runtime.r_speeds?.value) {
    runtime.c_brush_polys = 0;
    runtime.c_alias_polys = 0;
  }

  runtime.hooks.pushDlights?.();
  if (runtime.gl_finish?.value) {
    runtime.hooks.finish?.();
  }

  R_SetupFrame(runtime);
  R_SetFrustum(runtime);
  R_SetupGL(runtime);

  runtime.hooks.markLeaves?.();
  runtime.hooks.drawWorld?.();
  R_DrawEntitiesOnList(runtime);
  runtime.hooks.renderDlights?.();
  R_DrawParticles(runtime);
  runtime.hooks.drawAlphaSurfaces?.();
  R_Flash(runtime);

  if (runtime.r_speeds?.value) {
    runtime.hooks.print?.(
      PRINT_ALL,
      `${runtime.c_brush_polys.toString().padStart(4, " ")} wpoly ${runtime.c_alias_polys.toString().padStart(4, " ")} epoly ${runtime.c_visible_textures} tex ${runtime.c_visible_lightmaps} lmaps\n`
    );
  }
}

/**
 * Original name: R_RenderFrame
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 */
export function R_RenderFrame(runtime: GlRmainRuntime, fd: refdef_t): void {
  R_RenderView(runtime, fd);
}

/**
 * Original name: R_BeginFrame
 * Source: ref_gl/gl_rmain.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Porting notes:
 * - Preserves the cvar-driven frame prelude and delegates backend side-effects through hooks.
 */
export function R_BeginFrame(runtime: GlRmainRuntime, camera_separation: number): void {
  runtime.gl_state.camera_separation = camera_separation;

  if (runtime.gl_mode?.modified || runtime.vid_fullscreen?.modified) {
    if (runtime.vid_ref) {
      runtime.vid_ref.modified = true;
    }
  }

  if (runtime.gl_log?.modified) {
    runtime.hooks.enableLogging?.(Boolean(runtime.gl_log.value));
    runtime.gl_log.modified = false;
  }

  if (runtime.gl_log?.value) {
    runtime.hooks.logNewFrame?.();
  }

  if (runtime.vid_gamma?.modified) {
    runtime.vid_gamma.modified = false;
  }

  R_SetGL2D(runtime);

  if (runtime.gl_drawbuffer?.modified) {
    runtime.gl_drawbuffer.modified = false;
    if (runtime.gl_state.camera_separation === 0 || !runtime.gl_state.stereo_enabled) {
      const drawBuffer = runtime.gl_drawbuffer.string.toUpperCase() === "GL_FRONT" ? "GL_FRONT" : "GL_BACK";
      runtime.gl_state.current_draw_buffer = drawBuffer;
      runtime.hooks.onSetDrawBuffer?.(drawBuffer);
    }
  }

  if (runtime.gl_texturemode?.modified) {
    runtime.hooks.textureMode?.(runtime.gl_texturemode.string);
    runtime.gl_texturemode.modified = false;
  }

  if (runtime.gl_texturealphamode?.modified) {
    runtime.hooks.textureAlphaMode?.(runtime.gl_texturealphamode.string);
    runtime.gl_texturealphamode.modified = false;
  }

  if (runtime.gl_texturesolidmode?.modified) {
    runtime.hooks.textureSolidMode?.(runtime.gl_texturesolidmode.string);
    runtime.gl_texturesolidmode.modified = false;
  }

  runtime.hooks.updateSwapInterval?.();
  R_Clear(runtime);
}

/**
 * Category: New
 * Purpose: Bind the current world model used by the frame setup and view render path.
 */
export function setRmainWorldModel(runtime: GlRmainRuntime, model: model_t | null): void {
  runtime.r_worldmodel = model;
}

/**
 * Category: New
 * Purpose: Bind the current renderer-owned 8-to-24 palette table used by beam and raw palette code.
 */
export function setRmainPaletteTable(runtime: GlRmainRuntime, table: Uint32Array | readonly number[]): void {
  runtime.d_8to24table = table instanceof Uint32Array ? Uint32Array.from(table) : Uint32Array.from(table);
}

/**
 * Category: New
 * Purpose: Bind the current particle texture used by the triangle-particle fallback path.
 */
export function setRmainParticleTexture(runtime: GlRmainRuntime, image: image_t | null): void {
  runtime.r_particletexture = image;
}

/**
 * Category: New
 * Purpose: Bind the current video dimensions used by viewport setup.
 */
export function setRmainVid(runtime: GlRmainRuntime, width: number, height: number): void {
  runtime.vid.width = width;
  runtime.vid.height = height;
}

/**
 * Category: New
 * Purpose: Bind the cvars currently consumed by the ported `gl_rmain.c` tranche.
 */
export function setRmainCvars(runtime: GlRmainRuntime, cvars: Partial<Pick<GlRmainRuntime,
  "r_norefresh" | "r_drawentities" | "r_speeds" | "r_nocull" | "gl_finish" | "gl_clear" | "gl_ztrick" | "gl_polyblend" | "gl_log" | "gl_drawbuffer" | "gl_texturemode" | "gl_texturealphamode" | "gl_texturesolidmode" | "gl_swapinterval" | "gl_mode" | "gl_ext_pointparameters" | "gl_particle_size" | "vid_fullscreen" | "vid_gamma" | "vid_ref" | "r_lightlevel"
>>): void {
  Object.assign(runtime, cvars);
}

function buildWorldMatrix(vieworg: vec3_t, viewangles: vec3_t): Float32Array {
  const radians = {
    pitch: (-viewangles[0] * Math.PI) / 180,
    yaw: (-viewangles[1] * Math.PI) / 180,
    roll: (-viewangles[2] * Math.PI) / 180
  };

  const sx = Math.sin(radians.roll);
  const cx = Math.cos(radians.roll);
  const sy = Math.sin(radians.pitch);
  const cy = Math.cos(radians.pitch);
  const sz = Math.sin(radians.yaw);
  const cz = Math.cos(radians.yaw);

  const rx = new Float32Array([
    1, 0, 0, 0,
    0, cx, -sx, 0,
    0, sx, cx, 0,
    0, 0, 0, 1
  ]);
  const ry = new Float32Array([
    cy, 0, sy, 0,
    0, 1, 0, 0,
    -sy, 0, cy, 0,
    0, 0, 0, 1
  ]);
  const rz = new Float32Array([
    cz, -sz, 0, 0,
    sz, cz, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);

  const base = multiplyMat4(multiplyMat4(rz, ry), rx);
  const orientX = rotationMat4((90 * Math.PI) / 180, [1, 0, 0]);
  const orientZ = rotationMat4((90 * Math.PI) / 180, [0, 0, 1]);
  const translated = translationMat4([-vieworg[0], -vieworg[1], -vieworg[2]]);
  return multiplyMat4(multiplyMat4(multiplyMat4(orientX, orientZ), base), translated);
}

function rotationMat4(angle: number, axis: vec3_t): Float32Array {
  const [x, y, z] = axis;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  return new Float32Array([
    t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0,
    0, 0, 0, 1
  ]);
}

function translationMat4(offset: vec3_t): Float32Array {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    offset[0], offset[1], offset[2], 1
  ]);
}

function multiplyMat4(left: Float32Array, right: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      out[row * 4 + column] =
        left[row * 4] * right[column] +
        left[row * 4 + 1] * right[column + 4] +
        left[row * 4 + 2] * right[column + 8] +
        left[row * 4 + 3] * right[column + 12];
    }
  }
  return out;
}

function cloneRefdef(fd: refdef_t): refdef_t {
  return {
    ...fd,
    vieworg: [...fd.vieworg],
    viewangles: [...fd.viewangles],
    blend: [...fd.blend] as [number, number, number, number],
    areabits: fd.areabits ? fd.areabits.slice() : null,
    lightstyles: fd.lightstyles.map((style) => ({ rgb: [...style.rgb] as [number, number, number], white: style.white })),
    entities: fd.entities.map((entity) => ({
      ...entity,
      angles: [...entity.angles],
      origin: [...entity.origin],
      oldorigin: [...entity.oldorigin]
    })),
    dlights: fd.dlights.map((light) => ({
      origin: [...light.origin],
      color: [...light.color],
      intensity: light.intensity
    })),
    particles: fd.particles.map((particle) => ({
      origin: [...particle.origin],
      color: particle.color,
      alpha: particle.alpha
    }))
  };
}

function createPlane(): cplane_t {
  return {
    normal: [0, 0, 0],
    dist: 0,
    type: 0,
    signbits: 0,
    pad: [0, 0]
  };
}

function failSysError(runtime: GlRmainRuntime, level: number, message: string): never {
  if (runtime.hooks.sysError) {
    return runtime.hooks.sysError(level, message);
  }
  throw new Error(message);
}
