/**
 * File: quake2-gl-rmisc.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_rmisc.c` preserves fallback-texture setup, screenshot naming/encoding, GL strings and default-state orchestration.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a partial renderer-misc port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-rmisc.ts
 * - packages/renderer-three/src/gl-image.ts
 */

import { strict as assert } from "node:assert";

import { createCvarRuntime, Cvar_Get } from "../../packages/qcommon/src/cvar.js";
import {
  GL_ALPHA_TEST,
  GL_BLEND,
  GL_CULL_FACE,
  GL_DEPTH_TEST,
  GL_DISTANCE_ATTENUATION_EXT,
  GL_FRONT,
  GL_FRONT_AND_BACK,
  GL_GREATER,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_POINT_SIZE_MAX_EXT,
  GL_POINT_SIZE_MIN_EXT,
  GL_POINT_SMOOTH,
  GL_REPEAT,
  GL_RGB,
  GL_SHARED_TEXTURE_PALETTE_EXT,
  GL_SRC_ALPHA,
  GL_TEXTURE_2D,
  GL_TEXTURE_MAG_FILTER,
  GL_TEXTURE_MIN_FILTER,
  GL_TEXTURE_WRAP_S,
  GL_TEXTURE_WRAP_T,
  GL_UNSIGNED_BYTE,
  GL_ScreenShot_f,
  GL_SetDefaultState,
  GL_Strings_f,
  GL_UpdateSwapInterval,
  R_InitParticleTexture,
  buildNoTextureRgba,
  buildParticleTextureRgba,
  buildTgaHeader,
  createGlImageRuntime,
  createGlRmiscRuntime,
  findScreenshotName,
  setPaletteExtensionState,
  setRmiscCvars,
  setRmiscExtensionState,
  setRmiscGlConfig,
  setRmiscImageRuntime,
  setRmiscVid,
  swapRgbToBgr
} from "../../packages/renderer-three/src/index.js";

const cvarRuntime = createCvarRuntime();
const printLog: string[] = [];
const stateLog: string[] = [];
const textureParamLog: Array<[number, number, number]> = [];
const pointParamLog: Array<[number, number]> = [];
const pointAttenuationLog: Array<[number, number[]]> = [];
const loadedPics: Array<{ name: string; alphaBytes: number[] }> = [];
let screenshotBytes: Uint8Array | null = null;
let screenshotPath = "";
let swapIntervalValue = -1;

const imageRuntime = createGlImageRuntime({
  uploadImage: (_image, source) => ({
    upload_width: source.width,
    upload_height: source.height,
    has_alpha: true,
    paletted: false
  }),
  setSharedTexturePalette: (palette) => {
    stateLog.push(`sharedPalette:${palette.length}`);
  }
});

setPaletteExtensionState(imageRuntime, true, true);
imageRuntime.d_8to24table[1] = 0x11223344;

const runtime = createGlRmiscRuntime({
  loadPic: (name, pic) => {
    const alphaBytes: number[] = [];
    for (let index = 3; index < pic.length; index += 4) {
      alphaBytes.push(pic[index] ?? 0);
    }
    loadedPics.push({ name, alphaBytes });
    return {
      name,
      type: 0,
      width: 8,
      height: 8,
      upload_width: 8,
      upload_height: 8,
      registration_sequence: 1,
      texturechain: null,
      texnum: loadedPics.length,
      sl: 0,
      tl: 0,
      sh: 1,
      th: 1,
      scrap: false,
      has_alpha: true,
      paletted: false
    };
  },
  setProtectedImages: (notexture, particletexture) => {
    stateLog.push(`protected:${notexture?.name ?? "null"}:${particletexture?.name ?? "null"}`);
  },
  print: (_level, message) => {
    printLog.push(message.trimEnd());
  },
  readPixels: () => Uint8Array.from([1, 2, 3, 4, 5, 6]),
  listFiles: () => ["scrnshot/quake00.tga", "scrnshot/quake01.tga"],
  writeFile: (path, bytes) => {
    screenshotPath = path;
    screenshotBytes = bytes;
  },
  ensureDirectory: (directory) => {
    stateLog.push(`mkdir:${directory}`);
  },
  clearColor: (r, g, b, a) => stateLog.push(`clearColor:${r},${g},${b},${a}`),
  cullFace: (mode) => stateLog.push(`cullFace:${mode}`),
  enable: (cap) => stateLog.push(`enable:${cap}`),
  disable: (cap) => stateLog.push(`disable:${cap}`),
  alphaFunc: (func, ref) => stateLog.push(`alphaFunc:${func},${ref}`),
  color4f: (r, g, b, a) => stateLog.push(`color4f:${r},${g},${b},${a}`),
  polygonMode: (face, mode) => stateLog.push(`polygonMode:${face},${mode}`),
  shadeModel: (mode) => stateLog.push(`shadeModel:${mode}`),
  texParameterf: (target, pname, value) => textureParamLog.push([target, pname, value]),
  blendFunc: (sfactor, dfactor) => stateLog.push(`blendFunc:${sfactor},${dfactor}`),
  pointParameterfEXT: (pname, value) => pointParamLog.push([pname, value]),
  pointParameterfvEXT: (pname, values) => pointAttenuationLog.push([pname, [...values]]),
  updateSwapInterval: (value) => {
    swapIntervalValue = value;
  }
});

setRmiscVid(runtime, 1, 2);
setRmiscGlConfig(runtime, {
  vendor_string: "vendor",
  renderer_string: "renderer",
  version_string: "1.2.3",
  extensions_string: "GL_EXT_a GL_EXT_b"
});
setRmiscImageRuntime(runtime, imageRuntime);
setRmiscExtensionState(runtime, { pointParameters: true, colorTable: true });
setRmiscCvars(runtime, {
  gl_texturemode: Cvar_Get(cvarRuntime, "gl_texturemode", "GL_LINEAR", 0),
  gl_texturealphamode: Cvar_Get(cvarRuntime, "gl_texturealphamode", "default", 0),
  gl_texturesolidmode: Cvar_Get(cvarRuntime, "gl_texturesolidmode", "default", 0),
  gl_particle_att_a: Cvar_Get(cvarRuntime, "gl_particle_att_a", "0.01", 0),
  gl_particle_att_b: Cvar_Get(cvarRuntime, "gl_particle_att_b", "0.0", 0),
  gl_particle_att_c: Cvar_Get(cvarRuntime, "gl_particle_att_c", "0.01", 0),
  gl_particle_min_size: Cvar_Get(cvarRuntime, "gl_particle_min_size", "2", 0),
  gl_particle_max_size: Cvar_Get(cvarRuntime, "gl_particle_max_size", "40", 0),
  gl_ext_palettedtexture: Cvar_Get(cvarRuntime, "gl_ext_palettedtexture", "1", 0),
  gl_swapinterval: Cvar_Get(cvarRuntime, "gl_swapinterval", "1", 0)
});

const protectedImages = R_InitParticleTexture(runtime);
assert.equal(protectedImages.particletexture?.name, "***particle***", "R_InitParticleTexture particle name mismatch");
assert.equal(protectedImages.notexture?.name, "***r_notexture***", "R_InitParticleTexture fallback name mismatch");
assert.equal(loadedPics.length, 2, "R_InitParticleTexture count mismatch");
assert.equal(loadedPics[0]?.alphaBytes.some((value) => value === 255), true, "R_InitParticleTexture particle alpha mismatch");
assert.equal(loadedPics[1]?.alphaBytes.every((value) => value === 255), true, "R_InitParticleTexture fallback alpha mismatch");

const particleRgba = buildParticleTextureRgba();
assert.equal(particleRgba.length, 8 * 8 * 4, "buildParticleTextureRgba size mismatch");
assert.equal(particleRgba[3], 0, "buildParticleTextureRgba transparent corner mismatch");
assert.equal(particleRgba[(2 * 8 + 2) * 4 + 3], 255, "buildParticleTextureRgba solid core mismatch");

const noTextureRgba = buildNoTextureRgba();
assert.equal(noTextureRgba.length, 8 * 8 * 4, "buildNoTextureRgba size mismatch");
assert.equal(noTextureRgba[0], 0, "buildNoTextureRgba dark texel mismatch");
assert.equal(noTextureRgba[(1 * 8 + 2) * 4], 255, "buildNoTextureRgba bright texel mismatch");
assert.equal(noTextureRgba[(1 * 8 + 2) * 4 + 3], 255, "buildNoTextureRgba alpha mismatch");

assert.equal(findScreenshotName(["scrnshot/quake00.tga", "scrnshot/quake01.tga"]), "quake02.tga", "findScreenshotName mismatch");
assert.equal(findScreenshotName(Array.from({ length: 100 }, (_, index) => `scrnshot/quake${Math.trunc(index / 10)}${index % 10}.tga`)), null, "findScreenshotName saturation mismatch");

const header = buildTgaHeader(320, 200);
assert.equal(header[2], 2, "buildTgaHeader image type mismatch");
assert.equal(header[12], 64, "buildTgaHeader width low mismatch");
assert.equal(header[15], 0, "buildTgaHeader height high mismatch");

assert.deepEqual([...swapRgbToBgr(Uint8Array.from([1, 2, 3, 4, 5, 6]))], [3, 2, 1, 6, 5, 4], "swapRgbToBgr mismatch");

const screenshot = GL_ScreenShot_f(runtime, "baseq2");
assert.equal(screenshot?.path, "baseq2/scrnshot/quake02.tga", "GL_ScreenShot_f path mismatch");
assert.equal(screenshotPath, "baseq2/scrnshot/quake02.tga", "GL_ScreenShot_f write path mismatch");
assert.equal(screenshotBytes?.length, 24, "GL_ScreenShot_f byte length mismatch");
assert.deepEqual([...screenshotBytes!.subarray(18, 24)], [3, 2, 1, 6, 5, 4], "GL_ScreenShot_f pixel swap mismatch");

printLog.length = 0;
GL_Strings_f(runtime);
assert.deepEqual(printLog, [
  "GL_VENDOR: vendor",
  "GL_RENDERER: renderer",
  "GL_VERSION: 1.2.3",
  "GL_EXTENSIONS: GL_EXT_a GL_EXT_b"
], "GL_Strings_f mismatch");

stateLog.length = 0;
textureParamLog.length = 0;
pointParamLog.length = 0;
pointAttenuationLog.length = 0;
runtime.gl_swapinterval!.modified = true;
GL_SetDefaultState(runtime);
assert.deepEqual(stateLog.slice(0, 8), [
  "clearColor:1,0,0.5,0.5",
  `cullFace:${GL_FRONT}`,
  `enable:${GL_TEXTURE_2D}`,
  `enable:${GL_ALPHA_TEST}`,
  `alphaFunc:${GL_GREATER},0.666`,
  `disable:${GL_DEPTH_TEST}`,
  `disable:${GL_CULL_FACE}`,
  `disable:${GL_BLEND}`
], "GL_SetDefaultState fixed state mismatch");
assert.deepEqual(textureParamLog, [
  [GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, imageRuntime.gl_filter_min],
  [GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, imageRuntime.gl_filter_max],
  [GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT],
  [GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT]
], "GL_SetDefaultState texture params mismatch");
assert.deepEqual(pointParamLog, [
  [GL_POINT_SIZE_MIN_EXT, 2],
  [GL_POINT_SIZE_MAX_EXT, 40]
], "GL_SetDefaultState point params mismatch");
assert.deepEqual(pointAttenuationLog, [
  [GL_DISTANCE_ATTENUATION_EXT, [0.01, 0, 0.01]]
], "GL_SetDefaultState attenuation mismatch");
assert.equal(stateLog.includes(`enable:${GL_POINT_SMOOTH}`), true, "GL_SetDefaultState point smooth mismatch");
assert.equal(stateLog.includes(`enable:${GL_SHARED_TEXTURE_PALETTE_EXT}`), true, "GL_SetDefaultState shared palette mismatch");
assert.equal(stateLog.includes(`blendFunc:${GL_SRC_ALPHA},${GL_ONE_MINUS_SRC_ALPHA}`), true, "GL_SetDefaultState blend func mismatch");
assert.equal(stateLog.includes("sharedPalette:768"), true, "GL_SetDefaultState palette upload mismatch");
assert.equal(swapIntervalValue, 1, "GL_SetDefaultState swap interval mismatch");
assert.equal(runtime.gl_swapinterval?.modified, false, "GL_SetDefaultState swap interval flag mismatch");

runtime.gl_swapinterval!.modified = true;
runtime.gl_state.stereo_enabled = true;
swapIntervalValue = -1;
GL_UpdateSwapInterval(runtime);
assert.equal(swapIntervalValue, -1, "GL_UpdateSwapInterval stereo mismatch");
assert.equal(runtime.gl_swapinterval?.modified, false, "GL_UpdateSwapInterval modified reset mismatch");

assert.equal(GL_RGB, 0x1907, "GL_RGB constant mismatch");
assert.equal(GL_UNSIGNED_BYTE, 0x1401, "GL_UNSIGNED_BYTE constant mismatch");
assert.equal(GL_FRONT_AND_BACK, 0x0408, "GL_FRONT_AND_BACK constant mismatch");

console.log("quake2-gl-rmisc: ok");
