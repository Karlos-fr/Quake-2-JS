/**
 * File: quake2-gl-local-header.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_local.h` preserves the shared renderer declarations and state layout.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a mixed renderer header port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl_local.ts
 * - packages/renderer-three/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  BACKFACE_EPSILON,
  GL_RENDERER_3DFX,
  GL_RENDERER_MCD,
  GL_RENDERER_OTHER,
  GL_RENDERER_RENDITION,
  GL_RENDERER_VOODOO,
  GL_RENDERER_VOODOO2,
  MAX_GLTEXTURES,
  MAX_LBM_HEIGHT,
  PITCH,
  REF_VERSION,
  ROLL,
  TEXNUM_IMAGES,
  TEXNUM_LIGHTMAPS,
  TEXNUM_SCRAPS,
  YAW,
  createGlConfig,
  createGlLocalContext,
  createGlState,
  createGlVert,
  createRendererVidDef,
  hasValidFrustum,
  hasValidWorldMatrix,
  imagetype_t,
  isGlImageNameWithinQPath,
  rserr_t,
  type GL_BeginRendering_t,
  type GL_EndRendering_t,
  type GlimpHooks,
  type R_SwapBuffers_t,
  type R_TranslatePlayerSkin_t
} from "../../packages/renderer-three/src/index.js";

assert.equal(REF_VERSION, "GL 0.01", "REF_VERSION mismatch");
assert.equal(PITCH, 0, "PITCH mismatch");
assert.equal(YAW, 1, "YAW mismatch");
assert.equal(ROLL, 2, "ROLL mismatch");
assert.equal(MAX_LBM_HEIGHT, 480, "MAX_LBM_HEIGHT mismatch");
assert.equal(BACKFACE_EPSILON, 0.01, "BACKFACE_EPSILON mismatch");
assert.equal(TEXNUM_LIGHTMAPS, 1024, "TEXNUM_LIGHTMAPS mismatch");
assert.equal(TEXNUM_SCRAPS, 1152, "TEXNUM_SCRAPS mismatch");
assert.equal(TEXNUM_IMAGES, 1153, "TEXNUM_IMAGES mismatch");
assert.equal(MAX_GLTEXTURES, 1024, "MAX_GLTEXTURES mismatch");

assert.equal(imagetype_t.it_skin, 0, "imagetype_t.it_skin mismatch");
assert.equal(imagetype_t.it_sprite, 1, "imagetype_t.it_sprite mismatch");
assert.equal(imagetype_t.it_wall, 2, "imagetype_t.it_wall mismatch");
assert.equal(imagetype_t.it_pic, 3, "imagetype_t.it_pic mismatch");
assert.equal(imagetype_t.it_sky, 4, "imagetype_t.it_sky mismatch");

assert.equal(GL_RENDERER_VOODOO, 0x00000001, "GL_RENDERER_VOODOO mismatch");
assert.equal(GL_RENDERER_VOODOO2, 0x00000002, "GL_RENDERER_VOODOO2 mismatch");
assert.equal(GL_RENDERER_3DFX, 0x0000000f, "GL_RENDERER_3DFX mismatch");
assert.equal(GL_RENDERER_RENDITION, 0x001c0000, "GL_RENDERER_RENDITION mismatch");
assert.equal(GL_RENDERER_MCD, 0x01000000, "GL_RENDERER_MCD mismatch");
assert.equal(GL_RENDERER_OTHER, 0x80000000, "GL_RENDERER_OTHER mismatch");

assert.equal(rserr_t.rserr_ok, 0, "rserr_ok mismatch");
assert.equal(rserr_t.rserr_invalid_fullscreen, 1, "rserr_invalid_fullscreen mismatch");
assert.equal(rserr_t.rserr_invalid_mode, 2, "rserr_invalid_mode mismatch");
assert.equal(rserr_t.rserr_unknown, 3, "rserr_unknown mismatch");

assert.deepEqual(createRendererVidDef(), { width: 0, height: 0 }, "createRendererVidDef mismatch");
assert.deepEqual(createGlVert(), { x: 0, y: 0, z: 0, s: 0, t: 0, r: 0, g: 0, b: 0 }, "createGlVert mismatch");

const config = createGlConfig();
assert.equal(config.renderer, 0, "createGlConfig renderer mismatch");
assert.equal(config.allow_cds, false, "createGlConfig allow_cds mismatch");

const state = createGlState();
assert.equal(state.fullscreen, false, "createGlState fullscreen mismatch");
assert.equal(state.currenttextures.length, 2, "createGlState currenttextures width mismatch");
assert.equal(state.originalRedGammaTable.length, 256, "createGlState gamma table mismatch");

const context = createGlLocalContext();
assert.equal(context.gltextures.length, 0, "createGlLocalContext gltextures mismatch");
assert.equal(context.numgltextures, 0, "createGlLocalContext numgltextures mismatch");
assert.equal(context.frustum.length, 4, "createGlLocalContext frustum mismatch");
assert.equal(context.d_8to24table.length, 256, "createGlLocalContext d_8to24table mismatch");
assert.equal(context.r_world_matrix.length, 16, "createGlLocalContext r_world_matrix mismatch");
assert.equal(context.gl_state.originalBlueGammaTable.length, 256, "createGlLocalContext gl_state gamma mismatch");
assert.equal(context.gl_config.extensions_string, "", "createGlLocalContext gl_config mismatch");
assert.equal(hasValidFrustum(context), true, "hasValidFrustum mismatch");
assert.equal(hasValidWorldMatrix(context), true, "hasValidWorldMatrix mismatch");

assert.equal(isGlImageNameWithinQPath("env/unit1_.pcx"), true, "short image name mismatch");
assert.equal(isGlImageNameWithinQPath("x".repeat(64)), false, "MAX_QPATH overflow mismatch");

const glimpHooks: GlimpHooks = {
  beginFrame: (cameraSeparation) => {
    assert.equal(cameraSeparation, 0.25, "GLimp_BeginFrame hook arg mismatch");
  },
  endFrame: () => undefined,
  init: () => 1,
  shutdown: () => undefined,
  setMode: (width, height, _mode, _fullscreen) => ({
    err: rserr_t.rserr_ok,
    width,
    height
  })
};
assert.deepEqual(glimpHooks.setMode?.(640, 480, 3, false), {
  err: rserr_t.rserr_ok,
  width: 640,
  height: 480
}, "GLimp_SetMode hook result mismatch");
glimpHooks.beginFrame?.(0.25);
assert.equal(glimpHooks.init?.(null, null), 1, "GLimp_Init hook result mismatch");

const GL_BeginRendering: GL_BeginRendering_t = () => ({ x: 0, y: 0, width: 640, height: 480 });
const GL_EndRendering: GL_EndRendering_t = () => undefined;
const R_SwapBuffers: R_SwapBuffers_t = (v) => {
  assert.equal(v, 1, "R_SwapBuffers arg mismatch");
};
const R_TranslatePlayerSkin: R_TranslatePlayerSkin_t = (playernum) => {
  assert.equal(playernum, 2, "R_TranslatePlayerSkin arg mismatch");
};
assert.deepEqual(GL_BeginRendering(), { x: 0, y: 0, width: 640, height: 480 }, "GL_BeginRendering declaration shape mismatch");
assert.equal(GL_EndRendering(), undefined, "GL_EndRendering declaration shape mismatch");
R_SwapBuffers(1);
R_TranslatePlayerSkin(2);

console.log("quake2-gl-local-header: ok");
