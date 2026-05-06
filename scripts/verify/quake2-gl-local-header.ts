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
  GL_RENDERER_3DLABS,
  GL_RENDERER_3DLABS_MISC,
  GL_RENDERER_3DPRO,
  GL_RENDERER_BANSHEE,
  GL_RENDERER_DYPIC,
  GL_RENDERER_GLINT_MX,
  GL_RENDERER_GLINT_TX,
  GL_RENDERER_IMPACT,
  GL_RENDERER_INTERGRAPH,
  GL_RENDERER_IR,
  GL_RENDERER_MCD,
  GL_RENDERER_O2,
  GL_RENDERER_OTHER,
  GL_RENDERER_PCX1,
  GL_RENDERER_PCX2,
  GL_RENDERER_PERMEDIA2,
  GL_RENDERER_PMX,
  GL_RENDERER_POWERVR,
  GL_RENDERER_RE,
  GL_RENDERER_REAL3D,
  GL_RENDERER_REALIZM,
  GL_RENDERER_REALIZM2,
  GL_RENDERER_RENDITION,
  GL_RENDERER_RIVA128,
  GL_RENDERER_SGI,
  GL_RENDERER_V1000,
  GL_RENDERER_V2100,
  GL_RENDERER_V2200,
  GL_RENDERER_VOODOO,
  GL_RENDERER_VOODOO2,
  GL_RENDERER_VOODOO_RUSH,
  GL_COLOR_INDEX8_EXT,
  MAX_GLTEXTURES,
  MAX_LBM_HEIGHT,
  PITCH,
  REF_VERSION,
  ROLL,
  TEXNUM_IMAGES,
  TEXNUM_LIGHTMAPS,
  TEXNUM_SCRAPS,
  YAW,
  createGlImage,
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
assert.equal(GL_COLOR_INDEX8_EXT, 0x80e5, "GL_COLOR_INDEX8_EXT mismatch");

assert.equal(imagetype_t.it_skin, 0, "imagetype_t.it_skin mismatch");
assert.equal(imagetype_t.it_sprite, 1, "imagetype_t.it_sprite mismatch");
assert.equal(imagetype_t.it_wall, 2, "imagetype_t.it_wall mismatch");
assert.equal(imagetype_t.it_pic, 3, "imagetype_t.it_pic mismatch");
assert.equal(imagetype_t.it_sky, 4, "imagetype_t.it_sky mismatch");

const image = createGlImage({ name: "textures/e1u1/basic.wal", type: imagetype_t.it_wall, width: 64, height: 32 });
assert.equal(image.name, "textures/e1u1/basic.wal", "image_s name mismatch");
assert.equal(image.type, imagetype_t.it_wall, "image_s type mismatch");
assert.equal(image.width, 64, "image_s width mismatch");
assert.equal(image.height, 32, "image_s height mismatch");
assert.equal(image.upload_width, 0, "image_s upload_width default mismatch");
assert.equal(image.upload_height, 0, "image_s upload_height default mismatch");
assert.equal(image.registration_sequence, 0, "image_s registration_sequence default mismatch");
assert.equal(image.texturechain, null, "image_s texturechain default mismatch");
assert.equal(image.texnum, 0, "image_s texnum default mismatch");
assert.equal(image.sl, 0, "image_s sl default mismatch");
assert.equal(image.tl, 0, "image_s tl default mismatch");
assert.equal(image.sh, 1, "image_s sh default mismatch");
assert.equal(image.th, 1, "image_s th default mismatch");
assert.equal(image.scrap, false, "image_s scrap default mismatch");
assert.equal(image.has_alpha, false, "image_s has_alpha default mismatch");
assert.equal(image.paletted, false, "image_s paletted default mismatch");

assert.equal(GL_RENDERER_VOODOO, 0x00000001, "GL_RENDERER_VOODOO mismatch");
assert.equal(GL_RENDERER_VOODOO2, 0x00000002, "GL_RENDERER_VOODOO2 mismatch");
assert.equal(GL_RENDERER_VOODOO_RUSH, 0x00000004, "GL_RENDERER_VOODOO_RUSH mismatch");
assert.equal(GL_RENDERER_BANSHEE, 0x00000008, "GL_RENDERER_BANSHEE mismatch");
assert.equal(GL_RENDERER_3DFX, 0x0000000f, "GL_RENDERER_3DFX mismatch");
assert.equal(GL_RENDERER_PCX1, 0x00000010, "GL_RENDERER_PCX1 mismatch");
assert.equal(GL_RENDERER_PCX2, 0x00000020, "GL_RENDERER_PCX2 mismatch");
assert.equal(GL_RENDERER_PMX, 0x00000040, "GL_RENDERER_PMX mismatch");
assert.equal(GL_RENDERER_POWERVR, 0x00000070, "GL_RENDERER_POWERVR mismatch");
assert.equal(GL_RENDERER_PERMEDIA2, 0x00000100, "GL_RENDERER_PERMEDIA2 mismatch");
assert.equal(GL_RENDERER_GLINT_MX, 0x00000200, "GL_RENDERER_GLINT_MX mismatch");
assert.equal(GL_RENDERER_GLINT_TX, 0x00000400, "GL_RENDERER_GLINT_TX mismatch");
assert.equal(GL_RENDERER_3DLABS_MISC, 0x00000800, "GL_RENDERER_3DLABS_MISC mismatch");
assert.equal(GL_RENDERER_3DLABS, 0x00000f00, "GL_RENDERER_3DLABS mismatch");
assert.equal(GL_RENDERER_REALIZM, 0x00001000, "GL_RENDERER_REALIZM mismatch");
assert.equal(GL_RENDERER_REALIZM2, 0x00002000, "GL_RENDERER_REALIZM2 mismatch");
assert.equal(GL_RENDERER_INTERGRAPH, 0x00003000, "GL_RENDERER_INTERGRAPH mismatch");
assert.equal(GL_RENDERER_3DPRO, 0x00004000, "GL_RENDERER_3DPRO mismatch");
assert.equal(GL_RENDERER_REAL3D, 0x00008000, "GL_RENDERER_REAL3D mismatch");
assert.equal(GL_RENDERER_RIVA128, 0x00010000, "GL_RENDERER_RIVA128 mismatch");
assert.equal(GL_RENDERER_DYPIC, 0x00020000, "GL_RENDERER_DYPIC mismatch");
assert.equal(GL_RENDERER_V1000, 0x00040000, "GL_RENDERER_V1000 mismatch");
assert.equal(GL_RENDERER_V2100, 0x00080000, "GL_RENDERER_V2100 mismatch");
assert.equal(GL_RENDERER_V2200, 0x00100000, "GL_RENDERER_V2200 mismatch");
assert.equal(GL_RENDERER_RENDITION, 0x001c0000, "GL_RENDERER_RENDITION mismatch");
assert.equal(GL_RENDERER_O2, 0x00100000, "GL_RENDERER_O2 mismatch");
assert.equal(GL_RENDERER_IMPACT, 0x00200000, "GL_RENDERER_IMPACT mismatch");
assert.equal(GL_RENDERER_RE, 0x00400000, "GL_RENDERER_RE mismatch");
assert.equal(GL_RENDERER_IR, 0x00800000, "GL_RENDERER_IR mismatch");
assert.equal(GL_RENDERER_SGI, 0x00f00000, "GL_RENDERER_SGI mismatch");
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
assert.equal(config.renderer_string, "", "createGlConfig renderer_string mismatch");
assert.equal(config.vendor_string, "", "createGlConfig vendor_string mismatch");
assert.equal(config.version_string, "", "createGlConfig version_string mismatch");
assert.equal(config.extensions_string, "", "createGlConfig extensions_string mismatch");
assert.equal(config.allow_cds, false, "createGlConfig allow_cds mismatch");

const state = createGlState();
assert.equal(state.inverse_intensity, 1, "createGlState inverse_intensity mismatch");
assert.equal(state.fullscreen, false, "createGlState fullscreen mismatch");
assert.equal(state.prev_mode, 0, "createGlState prev_mode mismatch");
assert.equal(state.d_16to8table, null, "createGlState d_16to8table mismatch");
assert.equal(state.lightmap_textures, 0, "createGlState lightmap_textures mismatch");
assert.equal(state.currenttextures.length, 2, "createGlState currenttextures width mismatch");
assert.equal(state.currenttextures[0], 0, "createGlState currenttextures[0] mismatch");
assert.equal(state.currenttextures[1], 0, "createGlState currenttextures[1] mismatch");
assert.equal(state.currenttmu, 0, "createGlState currenttmu mismatch");
assert.equal(state.camera_separation, 0, "createGlState camera_separation mismatch");
assert.equal(state.stereo_enabled, false, "createGlState stereo_enabled mismatch");
assert.equal(state.originalRedGammaTable.length, 256, "createGlState gamma table mismatch");
assert.equal(state.originalGreenGammaTable.length, 256, "createGlState green gamma table mismatch");
assert.equal(state.originalBlueGammaTable.length, 256, "createGlState blue gamma table mismatch");

const context = createGlLocalContext();
assert.deepEqual(context.vid, { width: 0, height: 0 }, "createGlLocalContext vid mismatch");
assert.equal(context.gltextures.length, 0, "createGlLocalContext gltextures mismatch");
assert.equal(context.numgltextures, 0, "createGlLocalContext numgltextures mismatch");
assert.equal(context.r_notexture, null, "createGlLocalContext r_notexture mismatch");
assert.equal(context.r_particletexture, null, "createGlLocalContext r_particletexture mismatch");
assert.equal(context.currententity, null, "createGlLocalContext currententity mismatch");
assert.equal(context.currentmodel, null, "createGlLocalContext currentmodel mismatch");
assert.equal(context.r_visframecount, 0, "createGlLocalContext r_visframecount mismatch");
assert.equal(context.r_framecount, 0, "createGlLocalContext r_framecount mismatch");
assert.equal(context.frustum.length, 4, "createGlLocalContext frustum mismatch");
assert.equal(context.c_brush_polys, 0, "createGlLocalContext c_brush_polys mismatch");
assert.equal(context.c_alias_polys, 0, "createGlLocalContext c_alias_polys mismatch");
assert.equal(context.gl_filter_min, 0, "createGlLocalContext gl_filter_min mismatch");
assert.equal(context.gl_filter_max, 0, "createGlLocalContext gl_filter_max mismatch");
assert.deepEqual(context.vup, [0, 0, 0], "createGlLocalContext vup mismatch");
assert.deepEqual(context.vpn, [0, 0, 0], "createGlLocalContext vpn mismatch");
assert.deepEqual(context.vright, [0, 0, 0], "createGlLocalContext vright mismatch");
assert.deepEqual(context.r_origin, [0, 0, 0], "createGlLocalContext r_origin mismatch");
assert.equal(context.r_newrefdef, null, "createGlLocalContext r_newrefdef mismatch");
assert.equal(context.gl_lightmap_format, 0, "createGlLocalContext gl_lightmap_format mismatch");
assert.equal(context.gl_solid_format, 0, "createGlLocalContext gl_solid_format mismatch");
assert.equal(context.gl_alpha_format, 0, "createGlLocalContext gl_alpha_format mismatch");
assert.equal(context.gl_tex_solid_format, 0, "createGlLocalContext gl_tex_solid_format mismatch");
assert.equal(context.gl_tex_alpha_format, 0, "createGlLocalContext gl_tex_alpha_format mismatch");
assert.equal(context.c_visible_lightmaps, 0, "createGlLocalContext c_visible_lightmaps mismatch");
assert.equal(context.c_visible_textures, 0, "createGlLocalContext c_visible_textures mismatch");
assert.equal(context.d_8to24table.length, 256, "createGlLocalContext d_8to24table mismatch");
assert.equal(context.registration_sequence, 0, "createGlLocalContext registration_sequence mismatch");
assert.equal(context.r_world_matrix.length, 16, "createGlLocalContext r_world_matrix mismatch");
assert.equal(context.gldepthmin, 0, "createGlLocalContext gldepthmin mismatch");
assert.equal(context.gldepthmax, 1, "createGlLocalContext gldepthmax mismatch");
assert.equal(context.ri, null, "createGlLocalContext ri mismatch");
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
