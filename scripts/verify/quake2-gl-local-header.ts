/**
 * File: quake2-gl-local-header.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_local.h` preserves the shared renderer declarations and state layout.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a mixed renderer header port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-local.ts
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
  MAX_LBM_HEIGHT,
  PITCH,
  REF_VERSION,
  ROLL,
  YAW,
  createGlConfig,
  createGlLocalContext,
  createGlState,
  createGlVert,
  createRendererVidDef,
  hasValidFrustum,
  hasValidWorldMatrix,
  isGlImageNameWithinQPath,
  rserr_t
} from "../../packages/renderer-three/src/index.js";

assert.equal(REF_VERSION, "GL 0.01", "REF_VERSION mismatch");
assert.equal(PITCH, 0, "PITCH mismatch");
assert.equal(YAW, 1, "YAW mismatch");
assert.equal(ROLL, 2, "ROLL mismatch");
assert.equal(MAX_LBM_HEIGHT, 480, "MAX_LBM_HEIGHT mismatch");
assert.equal(BACKFACE_EPSILON, 0.01, "BACKFACE_EPSILON mismatch");

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
assert.equal(hasValidFrustum(context), true, "hasValidFrustum mismatch");
assert.equal(hasValidWorldMatrix(context), true, "hasValidWorldMatrix mismatch");

assert.equal(isGlImageNameWithinQPath("env/unit1_.pcx"), true, "short image name mismatch");
assert.equal(isGlImageNameWithinQPath("x".repeat(64)), false, "MAX_QPATH overflow mismatch");

console.log("quake2-gl-local-header: ok");
