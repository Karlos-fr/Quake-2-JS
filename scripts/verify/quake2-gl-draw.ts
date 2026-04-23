/**
 * File: quake2-gl-draw.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_draw.c` preserves pic lookup, 2D draw routing and raw upload behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a close renderer port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-draw.ts
 * - packages/renderer-three/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  Draw_Char,
  Draw_FadeScreen,
  Draw_Fill,
  Draw_FindPic,
  Draw_GetPicSize,
  Draw_InitLocal,
  Draw_Pic,
  Draw_StretchPic,
  Draw_StretchRaw,
  Draw_TileClear,
  GL_COLOR_INDEX,
  GL_COLOR_INDEX8_EXT,
  GL_RENDERER_MCD,
  GL_RGBA,
  GL_UNSIGNED_BYTE,
  createGlDrawImage,
  createGlDrawRuntime,
  setColorTableExtensionEnabled,
  setPalette8to24,
  setRawPalette,
  setRendererFlags,
  setScrapDirty,
  setVidState
} from "../../packages/renderer-three/src/index.js";
import { ERR_FATAL } from "../../packages/qcommon/src/index.js";

const calls: string[] = [];
const texturedQuads: Array<Record<string, number>> = [];
const solidQuads: Array<Record<string, number>> = [];
const rawUploads: Array<Record<string, unknown>> = [];
const alphaStates: boolean[] = [];
const colorStates: Array<[number, number, number, number]> = [];

const images = new Map<string, ReturnType<typeof createGlDrawImage>>([
  ["pics/conchars.pcx", createGlDrawImage({ name: "pics/conchars.pcx", width: 128, height: 128, texnum: 11 })],
  ["pics/statusbar.pcx", createGlDrawImage({ name: "pics/statusbar.pcx", width: 320, height: 24, texnum: 42, sl: 0.1, tl: 0.2, sh: 0.7, th: 0.8, has_alpha: false })],
  ["pics/tileback.pcx", createGlDrawImage({ name: "pics/tileback.pcx", width: 64, height: 64, texnum: 77, has_alpha: false })],
  ["pics/absolute.pcx", createGlDrawImage({ name: "pics/absolute.pcx", width: 16, height: 8, texnum: 90 })]
]);

const runtime = createGlDrawRuntime({
  findImage: (name) => images.get(name) ?? null,
  uploadScrap: () => {
    calls.push("uploadScrap");
  },
  bindTexture: (texnum) => {
    calls.push(`bind:${texnum}`);
  },
  setTextureFilter: (texnum, minFilter, magFilter) => {
    calls.push(`filter:${texnum}:${minFilter}:${magFilter}`);
  },
  setAlphaTestEnabled: (enabled) => {
    alphaStates.push(enabled);
  },
  setTextureEnabled: (enabled) => {
    calls.push(`texture:${enabled}`);
  },
  setBlendEnabled: (enabled) => {
    calls.push(`blend:${enabled}`);
  },
  setDrawColor: (r, g, b, a) => {
    colorStates.push([r, g, b, a]);
  },
  drawTexturedQuad: (quad) => {
    texturedQuads.push({ ...quad });
  },
  drawSolidQuad: (x, y, width, height) => {
    solidQuads.push({ x, y, width, height });
  },
  uploadRawTexture: (upload) => {
    rawUploads.push({
      width: upload.width,
      height: upload.height,
      internalFormat: upload.internalFormat,
      format: upload.format,
      type: upload.type,
      data: upload.data
    });
  }
});

setRendererFlags(runtime, GL_RENDERER_MCD);
setVidState(runtime, 640, 480);
setPalette8to24(runtime, Uint32Array.from({ length: 256 }, (_, index) => index === 12 ? 0x00336699 : 0));
setRawPalette(runtime, Uint32Array.from({ length: 256 }, (_, index) => index * 3));

Draw_InitLocal(runtime);
assert.equal(runtime.draw_chars !== null, true, "Draw_InitLocal must populate draw_chars");
assert.equal(calls.includes("bind:11"), true, "Draw_InitLocal bind mismatch");
assert.equal(calls.includes("filter:11:nearest:nearest"), true, "Draw_InitLocal filter mismatch");

assert.equal(Draw_FindPic(runtime, "statusbar"), images.get("pics/statusbar.pcx") ?? null, "relative Draw_FindPic mismatch");
assert.equal(Draw_FindPic(runtime, "/pics/absolute.pcx"), images.get("pics/absolute.pcx") ?? null, "absolute Draw_FindPic mismatch");
assert.deepEqual(Draw_GetPicSize(runtime, "statusbar"), { width: 320, height: 24 }, "Draw_GetPicSize mismatch");
assert.deepEqual(Draw_GetPicSize(runtime, "missing"), { width: -1, height: -1 }, "Draw_GetPicSize missing mismatch");

Draw_Char(runtime, 10, 20, 65);
assert.deepEqual(texturedQuads.at(-1), { x: 10, y: 20, width: 8, height: 8, sl: 0.0625, tl: 0.25, sh: 0.125, th: 0.3125 }, "Draw_Char quad mismatch");

setScrapDirty(runtime, true);
Draw_StretchPic(runtime, 1, 2, 30, 40, "statusbar");
assert.equal(calls.includes("uploadScrap"), true, "Draw_StretchPic scrap upload mismatch");
assert.deepEqual(texturedQuads.at(-1), { x: 1, y: 2, width: 30, height: 40, sl: 0.1, tl: 0.2, sh: 0.7, th: 0.8 }, "Draw_StretchPic quad mismatch");
assert.deepEqual(alphaStates.slice(-2), [false, true], "Draw_StretchPic alpha workaround mismatch");

Draw_Pic(runtime, 5, 6, "statusbar");
assert.deepEqual(texturedQuads.at(-1), { x: 5, y: 6, width: 320, height: 24, sl: 0.1, tl: 0.2, sh: 0.7, th: 0.8 }, "Draw_Pic quad mismatch");

Draw_TileClear(runtime, 4, 8, 32, 64, "tileback");
assert.deepEqual(texturedQuads.at(-1), { x: 4, y: 8, width: 32, height: 64, sl: 4 / 64, tl: 8 / 64, sh: 36 / 64, th: 72 / 64 }, "Draw_TileClear quad mismatch");

Draw_Fill(runtime, 7, 9, 11, 13, 12);
assert.deepEqual(solidQuads.at(-1), { x: 7, y: 9, width: 11, height: 13 }, "Draw_Fill solid quad mismatch");
assert.deepEqual(colorStates.at(-2), [0x99 / 255, 0x66 / 255, 0x33 / 255, 1], "Draw_Fill color mismatch");
assert.deepEqual(colorStates.at(-1), [1, 1, 1, 1], "Draw_Fill reset color mismatch");

Draw_FadeScreen(runtime);
assert.deepEqual(solidQuads.at(-1), { x: 0, y: 0, width: 640, height: 480 }, "Draw_FadeScreen solid quad mismatch");
assert.deepEqual(colorStates.at(-2), [0, 0, 0, 0.8], "Draw_FadeScreen color mismatch");

const rawData = Uint8Array.from([0, 1, 2, 3]);
setColorTableExtensionEnabled(runtime, false);
Draw_StretchRaw(runtime, 0, 0, 100, 50, 2, 2, rawData);
assert.equal(rawUploads.at(-1)?.internalFormat, 3, "Draw_StretchRaw RGBA internal format mismatch");
assert.equal(rawUploads.at(-1)?.format, GL_RGBA, "Draw_StretchRaw RGBA format mismatch");
assert.equal(rawUploads.at(-1)?.type, GL_UNSIGNED_BYTE, "Draw_StretchRaw RGBA type mismatch");
assert.equal((rawUploads.at(-1)?.data as Uint32Array)[0], 0, "Draw_StretchRaw RGBA data mismatch");
assert.equal((rawUploads.at(-1)?.data as Uint32Array)[128], 3, "Draw_StretchRaw RGBA resample mismatch");
assert.deepEqual(texturedQuads.at(-1), { x: 0, y: 0, width: 100, height: 50, sl: 0, tl: 0, sh: 1, th: 2 / 256 }, "Draw_StretchRaw RGBA quad mismatch");

setColorTableExtensionEnabled(runtime, true);
Draw_StretchRaw(runtime, 3, 4, 20, 10, 2, 2, rawData);
assert.equal(rawUploads.at(-1)?.internalFormat, GL_COLOR_INDEX8_EXT, "Draw_StretchRaw color-index internal format mismatch");
assert.equal(rawUploads.at(-1)?.format, GL_COLOR_INDEX, "Draw_StretchRaw color-index format mismatch");
assert.equal(rawUploads.at(-1)?.type, GL_UNSIGNED_BYTE, "Draw_StretchRaw color-index type mismatch");
assert.equal((rawUploads.at(-1)?.data as Uint8Array)[0], 0, "Draw_StretchRaw indexed data mismatch");
assert.equal((rawUploads.at(-1)?.data as Uint8Array)[128], 1, "Draw_StretchRaw indexed resample mismatch");

const failingRuntime = createGlDrawRuntime({
  Sys_Error: (errLevel, message) => {
    throw new Error(`${errLevel}:${message}`);
  }
});

assert.throws(
  () => Draw_Fill(failingRuntime, 0, 0, 1, 1, 300),
  (error: unknown) => error instanceof Error && error.message === `${ERR_FATAL}:Draw_Fill: bad color`,
  "Draw_Fill error mismatch"
);

console.log("quake2-gl-draw: ok");
