/**
 * File: quake2-gl-image.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_image.c` preserves image registration, scrap packing, palette init and filter logic.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a close renderer port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-image.ts
 * - packages/renderer-three/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  Draw_GetPalette,
  GL_Bind,
  GL_EnableMultitexture,
  GL_FindImage,
  GL_SetTexturePalette,
  GL_InitImages,
  GL_MBind,
  GL_MipMap,
  GL_ResampleTexture,
  GL_LightScaleTexture,
  GL_BuildPalettedTexture,
  GL_Upload8,
  GL_Upload32,
  GL_ShutdownImages,
  GL_TexEnv,
  GL_TEXTURE0_SGIS,
  GL_TEXTURE1_SGIS,
  GL_TextureAlphaMode,
  GL_TextureMode,
  GL_TextureSolidMode,
  GL_FreeUnusedImages,
  GL_ImageList_f,
  GL_LoadPic,
  R_RegisterSkin,
  R_FloodFillSkin,
  Scrap_AllocBlock,
  Scrap_Upload,
  TEXNUM_IMAGES,
  TEXNUM_SCRAPS,
  createGlImage,
  createGlImageRuntime,
  imagetype_t,
  setDrawCharsImage,
  setImageRendererFlags,
  setIntensityValue,
  setNoBindEnabled,
  setPaletteExtensionState,
  setProtectedImages,
  setRoundDownEnabled,
  setVidGammaValue
} from "../../packages/renderer-three/src/index.js";
import { BLOCK_HEIGHT, BLOCK_WIDTH, GL_RENDERER_VOODOO, setPicmipValue } from "../../packages/renderer-three/src/gl-image.js";

const calls: string[] = [];
const deleted: number[] = [];
const uploadedScraps: Array<{ texnum: number; width: number; height: number; size: number }> = [];
const uploadedImages: string[] = [];
const printed: string[] = [];
const sharedPalettes: Uint8Array[] = [];

const fileMap = new Map<string, Uint8Array>();

const runtime = createGlImageRuntime({
  loadFile: (path) => fileMap.get(path) ?? null,
  bindTexture: (texnum, tmu) => {
    calls.push(`bind:${tmu}:${texnum}`);
  },
  selectTexture: (texture) => {
    calls.push(`select:${texture}`);
  },
  setTexture2DEnabled: (tmu, enabled) => {
    calls.push(`texture2d:${tmu}:${enabled}`);
  },
  texEnv: (tmu, mode) => {
    calls.push(`texenv:${tmu}:${mode}`);
  },
  setTextureFilter: (texnum, minFilter, magFilter) => {
    calls.push(`filter:${texnum}:${minFilter}:${magFilter}`);
  },
  deleteTexture: (texnum) => {
    deleted.push(texnum);
  },
  uploadScrapTexture: (texnum, width, height, data) => {
    uploadedScraps.push({ texnum, width, height, size: data.length });
  },
  uploadImage: (image, source) => {
    uploadedImages.push(`${image.name}:${source.bits}:${source.width}x${source.height}:${source.mipmap}:${source.is_sky}`);
    return {
      upload_width: source.width,
      upload_height: source.height,
      has_alpha: source.bits === 8 ? (source.pixels as Uint8Array).includes(255) : false,
      paletted: false
    };
  },
  setSharedTexturePalette: (paletteRgb) => {
    sharedPalettes.push(paletteRgb.slice());
  },
  Con_Printf: (_level, message) => {
    printed.push(message);
  },
  Sys_Error: (errLevel, message) => {
    throw new Error(`${errLevel}:${message}`);
  }
});

fileMap.set("pics/colormap.pcx", createPcxFile(1, 1, Uint8Array.from([0]), createTestPalette()));
fileMap.set("pics/test.pcx", createPcxFile(2, 2, Uint8Array.from([0, 1, 2, 255]), createTestPalette()));
fileMap.set("textures/test.wal", createWalFile("test", 2, 2, Uint8Array.from([0, 1, 2, 3])));
fileMap.set("pics/test.tga", createTgaFile(1, 1, Uint8Array.from([10, 20, 30, 255])));
fileMap.set("pics/16to8.dat", Uint8Array.from({ length: 65536 }, (_, index) => index & 0xff));

setVidGammaValue(runtime, 1.4);
setIntensityValue(runtime, 2);
setRoundDownEnabled(runtime, true);
setPicmipValue(runtime, 1);
setImageRendererFlags(runtime, GL_RENDERER_VOODOO);
setPaletteExtensionState(runtime, true, true);

assert.equal(Draw_GetPalette(runtime), 0, "Draw_GetPalette return mismatch");
assert.equal(runtime.d_8to24table[1], (((255 << 24) >>> 0) + (1 << 0) + (2 << 8) + (3 << 16)) >>> 0, "Draw_GetPalette color mismatch");
assert.equal(runtime.d_8to24table[255] >>> 24, 0, "transparent palette alpha mismatch");

GL_InitImages(runtime);
assert.equal(runtime.registration_sequence, 1, "GL_InitImages registration mismatch");
assert.equal(runtime.intensity_value, 2, "GL_InitImages intensity mismatch");
assert.equal(runtime.inverse_intensity, 0.5, "GL_InitImages inverse intensity mismatch");
assert.equal(runtime.d_16to8table?.length, 65536, "GL_InitImages 16to8 mismatch");
assert.equal(runtime.gammatable[64], 64, "voodoo gamma override mismatch");
assert.deepEqual(
  Array.from(sharedPalettes.at(-1)?.slice(3, 6) ?? []),
  [1, 2, 3],
  "GL_InitImages shared palette upload mismatch"
);

const drawChars = createGlImage({ texnum: 999, registration_sequence: 1 });
setDrawCharsImage(runtime, drawChars);
setNoBindEnabled(runtime, true);
GL_Bind(runtime, 123);
assert.equal(calls.at(-1), "bind:0:999", "GL_Bind nobind mismatch");
setNoBindEnabled(runtime, false);

GL_MBind(runtime, GL_TEXTURE1_SGIS, 50);
assert.equal(runtime.currenttmu, 1, "GL_MBind currenttmu mismatch");
assert.equal(calls.includes(`select:${GL_TEXTURE1_SGIS}`), true, "GL_MBind select mismatch");
assert.equal(calls.includes("bind:1:50"), true, "GL_MBind bind mismatch");

runtime.texEnvModes = [-1, -1];
calls.length = 0;
runtime.currenttmu = 1;
GL_TexEnv(runtime, 7681);
GL_TexEnv(runtime, 7681);
assert.equal(calls.filter((call) => call === "texenv:1:7681").length, 1, "GL_TexEnv cache mismatch");

calls.length = 0;
runtime.currenttmu = 0;
runtime.texEnvModes = [-1, -1];
GL_EnableMultitexture(runtime, true);
assert.equal(calls.includes("texture2d:1:true"), true, "GL_EnableMultitexture enable mismatch");
GL_EnableMultitexture(runtime, false);
assert.equal(calls.includes("texture2d:1:false"), true, "GL_EnableMultitexture disable mismatch");

const scrap = GL_LoadPic(runtime, "pics/smallpic.pcx", Uint8Array.from([1, 2, 3, 4]), 2, 2, imagetype_t.it_pic, 8);
assert.equal(scrap.scrap, true, "GL_LoadPic scrap mismatch");
assert.equal(scrap.texnum, TEXNUM_SCRAPS, "GL_LoadPic scrap texnum mismatch");
assert.equal(runtime.scrap_dirty, true, "GL_LoadPic scrap dirty mismatch");

Scrap_Upload(runtime);
assert.equal(runtime.scrap_dirty, false, "Scrap_Upload dirty reset mismatch");
assert.deepEqual(uploadedScraps.at(-1), { texnum: TEXNUM_SCRAPS, width: BLOCK_WIDTH, height: BLOCK_HEIGHT, size: BLOCK_WIDTH * BLOCK_HEIGHT }, "Scrap_Upload payload mismatch");

const wall = GL_LoadPic(runtime, "textures/directwall.wal", Uint8Array.from([0, 1, 2, 3]), 2, 2, imagetype_t.it_wall, 8);
assert.equal(wall.scrap, false, "GL_LoadPic non-scrap mismatch");
assert.equal(wall.texnum, TEXNUM_IMAGES + 1, "GL_LoadPic texnum mismatch");
assert.equal(uploadedImages.at(-1), "textures/directwall.wal:8:2x2:true:false", "GL_LoadPic upload call mismatch");

const foundPcx = GL_FindImage(runtime, "pics/test.pcx", imagetype_t.it_pic);
assert.equal(foundPcx?.name, "pics/test.pcx", "GL_FindImage pcx mismatch");
const foundPcxAgain = GL_FindImage(runtime, "pics/test.pcx", imagetype_t.it_pic);
assert.equal(foundPcxAgain, foundPcx, "GL_FindImage reuse mismatch");

const foundWal = GL_FindImage(runtime, "textures/test.wal", imagetype_t.it_wall);
assert.equal(foundWal?.type, imagetype_t.it_wall, "GL_FindImage wal mismatch");

const foundTga = GL_FindImage(runtime, "pics/test.tga", imagetype_t.it_pic);
assert.equal(foundTga?.width, 1, "GL_FindImage tga mismatch");

const registeredSkin = R_RegisterSkin(runtime, "pics/test.pcx");
assert.equal(registeredSkin, foundPcx, "R_RegisterSkin mismatch");

GL_TextureMode(runtime, "GL_NEAREST");
assert.equal(runtime.gl_filter_min, 0x2600, "GL_TextureMode min mismatch");
assert.equal(runtime.gl_filter_max, 0x2600, "GL_TextureMode max mismatch");

GL_TextureAlphaMode(runtime, "GL_RGBA8");
assert.equal(runtime.gl_tex_alpha_format, 0x8058, "GL_TextureAlphaMode mismatch");
GL_TextureSolidMode(runtime, "GL_RGB8");
assert.equal(runtime.gl_tex_solid_format, 0x8051, "GL_TextureSolidMode mismatch");

GL_ImageList_f(runtime);
assert.equal(printed.some((line) => line.includes("Total texel count")), true, "GL_ImageList_f summary mismatch");

runtime.registration_sequence = 5;
const notexture = createGlImage({ name: "notexture", texnum: 700, registration_sequence: 0, type: imagetype_t.it_wall });
const particle = createGlImage({ name: "particle", texnum: 701, registration_sequence: 0, type: imagetype_t.it_sprite });
setProtectedImages(runtime, notexture, particle);
runtime.gltextures[0] = notexture;
runtime.gltextures[1] = particle;
runtime.gltextures[2] = createGlImage({ name: "oldwall", texnum: 702, registration_sequence: 4, type: imagetype_t.it_wall });
runtime.gltextures[3] = createGlImage({ name: "oldpic", texnum: 703, registration_sequence: 4, type: imagetype_t.it_pic });
runtime.numgltextures = Math.max(runtime.numgltextures, 4);

GL_FreeUnusedImages(runtime);
assert.equal(deleted.includes(702), true, "GL_FreeUnusedImages delete mismatch");
assert.equal(runtime.gltextures[2].texnum, 0, "GL_FreeUnusedImages reset mismatch");
assert.equal(runtime.gltextures[3].texnum, 703, "GL_FreeUnusedImages pic preservation mismatch");

GL_ShutdownImages(runtime);
assert.equal(deleted.includes(703), true, "GL_ShutdownImages delete mismatch");
assert.equal(runtime.gltextures[3].texnum, 0, "GL_ShutdownImages reset mismatch");

assert.deepEqual(Scrap_AllocBlock(createGlImageRuntime(), 8, 8), { texnum: 0, x: 0, y: 0 }, "Scrap_AllocBlock initial mismatch");

const paletteRuntime = createGlImageRuntime({
  setSharedTexturePalette: (paletteRgb) => {
    sharedPalettes.push(paletteRgb.slice());
  }
});
setPaletteExtensionState(paletteRuntime, true, true);
paletteRuntime.d_8to24table[0] = 0x00112233;
paletteRuntime.d_8to24table[1] = 0x00445566;
GL_SetTexturePalette(paletteRuntime, paletteRuntime.d_8to24table);

const uploadEvents: Array<{ level: number; width: number; height: number; format: number; bytes: number }> = [];
const uploadFilterEvents: Array<{ texnum: number; minFilter: number; magFilter: number }> = [];
const uploadRuntime = createGlImageRuntime({
  uploadTextureData: (upload) => {
    uploadEvents.push({
      level: upload.level,
      width: upload.width,
      height: upload.height,
      format: upload.format,
      bytes: upload.data.length
    });
  },
  setTextureFilter: (texnum, minFilter, magFilter) => {
    uploadFilterEvents.push({ texnum, minFilter, magFilter });
  }
});
uploadRuntime.currenttextures[0] = 1234;
for (let i = 0; i < 256; i += 1) {
  uploadRuntime.gammatable[i] = i;
  uploadRuntime.intensitytable[i] = i;
  uploadRuntime.d_8to24table[i] = (((255 << 24) >>> 0) | (i << 16) | (i << 8) | i) >>> 0;
}
uploadRuntime.d_8to24table[255] = 0x00000000;
uploadRuntime.d_16to8table = Uint8Array.from({ length: 65536 }, (_, index) => index & 0xff);

const upload8HasAlpha = GL_Upload8(uploadRuntime, Uint8Array.from([255, 1, 2, 3]), 2, 2, false, false);
assert.equal(upload8HasAlpha, true, "GL_Upload8 alpha mismatch");
assert.equal(uploadRuntime.upload_width, 2, "GL_Upload8 upload width mismatch");
assert.equal(uploadRuntime.upload_height, 2, "GL_Upload8 upload height mismatch");
assert.equal(uploadEvents.at(-1)?.level, 0, "GL_Upload8 level mismatch");
assert.equal(uploadEvents.at(-1)?.bytes, 4, "GL_Upload8 payload size mismatch");

const upload32HasAlpha = GL_Upload32(
  uploadRuntime,
  Uint32Array.from([0xff0000ff, 0xff00ff00, 0xffff0000, 0xff112233]),
  2,
  2,
  true
);
assert.equal(upload32HasAlpha, false, "GL_Upload32 alpha mismatch");
assert.equal(uploadEvents.some((event) => event.level === 1 && event.width === 1 && event.height === 1), true, "GL_Upload32 mip upload mismatch");
assert.equal(uploadFilterEvents.at(-1)?.minFilter !== undefined, true, "GL_Upload32 filter call mismatch");

const floodRuntime = createGlImageRuntime();
floodRuntime.d_8to24table[0] = 255;
const skin = Uint8Array.from([
  1, 1, 2,
  1, 1, 2,
  2, 2, 2
]);
R_FloodFillSkin(floodRuntime, skin, 3, 3);
assert.equal(skin[0], 0, "R_FloodFillSkin center fill mismatch");
assert.equal(skin[1] !== 1, true, "R_FloodFillSkin spread mismatch");

const resampleIn = Uint32Array.from([0xff000000, 0xff0000ff, 0xff00ff00, 0xffff0000]);
const resampleOut = new Uint32Array(1);
GL_ResampleTexture(resampleIn, 2, 2, resampleOut, 1, 1);
assert.equal(resampleOut[0] !== 0, true, "GL_ResampleTexture output mismatch");

const lightScaleRuntime = createGlImageRuntime();
for (let i = 0; i < 256; i += 1) {
  lightScaleRuntime.gammatable[i] = i;
  lightScaleRuntime.intensitytable[i] = i;
}
const lit = Uint32Array.from([0xff010203]);
GL_LightScaleTexture(lightScaleRuntime, lit, 1, 1, true);
assert.equal(lit[0], 0xff010203, "GL_LightScaleTexture gamma-only mismatch");

const mip = Uint32Array.from([
  0xff000000, 0xff000004,
  0xff000008, 0xff00000c
]);
GL_MipMap(mip, 2, 2);
assert.equal(mip[0] & 0xff, 6, "GL_MipMap output mismatch");

const paletted = new Uint8Array(4);
GL_BuildPalettedTexture(uploadRuntime, paletted, Uint32Array.from([0xff000000, 0xff112233, 0xff445566, 0xff778899]), 2, 2);
assert.equal(paletted.length, 4, "GL_BuildPalettedTexture size mismatch");

assert.equal(
  GL_FindImage(createGlImageRuntime(), "abc.tga", imagetype_t.it_pic),
  null,
  "GL_FindImage short-name guard mismatch"
);

console.log("quake2-gl-image: ok");

function createPcxFile(width: number, height: number, indices: Uint8Array, paletteRgb: Uint8Array): Uint8Array {
  const header = new Uint8Array(128);
  header[0] = 0x0a;
  header[1] = 5;
  header[2] = 1;
  header[3] = 8;
  writeShort(header, 4, 0);
  writeShort(header, 6, 0);
  writeShort(header, 8, width - 1);
  writeShort(header, 10, height - 1);
  writeShort(header, 12, width);
  writeShort(header, 14, height);
  header[65] = 1;
  writeShort(header, 66, width);
  writeShort(header, 68, 1);

  const encoded: number[] = [];
  for (const value of indices) {
    if ((value & 0xc0) === 0xc0) {
      encoded.push(0xc1, value);
    } else {
      encoded.push(value);
    }
  }

  const bytes = new Uint8Array(128 + encoded.length + 1 + 768);
  bytes.set(header, 0);
  bytes.set(encoded, 128);
  bytes[128 + encoded.length] = 0x0c;
  bytes.set(paletteRgb, 128 + encoded.length + 1);
  return bytes;
}

function createWalFile(name: string, width: number, height: number, mip0: Uint8Array): Uint8Array {
  const mip1 = new Uint8Array([mip0[0]]);
  const mip2 = new Uint8Array([mip0[0]]);
  const mip3 = new Uint8Array([mip0[0]]);
  const headerSize = 100;
  const offset0 = headerSize;
  const offset1 = offset0 + mip0.length;
  const offset2 = offset1 + mip1.length;
  const offset3 = offset2 + mip2.length;
  const bytes = new Uint8Array(offset3 + mip3.length);

  writeCString(bytes, 0, 32, name);
  writeLong(bytes, 32, width);
  writeLong(bytes, 36, height);
  writeLong(bytes, 40, offset0);
  writeLong(bytes, 44, offset1);
  writeLong(bytes, 48, offset2);
  writeLong(bytes, 52, offset3);
  bytes.set(mip0, offset0);
  bytes.set(mip1, offset1);
  bytes.set(mip2, offset2);
  bytes.set(mip3, offset3);
  return bytes;
}

function createTgaFile(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(18 + width * height * 4);
  bytes[2] = 2;
  writeShort(bytes, 12, width);
  writeShort(bytes, 14, height);
  bytes[16] = 32;
  for (let index = 0; index < width * height; index += 1) {
    const src = index * 4;
    const dst = 18 + src;
    bytes[dst] = rgba[src + 2];
    bytes[dst + 1] = rgba[src + 1];
    bytes[dst + 2] = rgba[src];
    bytes[dst + 3] = rgba[src + 3];
  }
  return bytes;
}

function createTestPalette(): Uint8Array {
  const palette = new Uint8Array(768);
  for (let i = 0; i < 256; i += 1) {
    palette[i * 3] = i & 0xff;
    palette[i * 3 + 1] = (i * 2) & 0xff;
    palette[i * 3 + 2] = (i * 3) & 0xff;
  }
  return palette;
}

function writeShort(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >> 8) & 0xff;
}

function writeLong(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >> 8) & 0xff;
  target[offset + 2] = (value >> 16) & 0xff;
  target[offset + 3] = (value >> 24) & 0xff;
}

function writeCString(target: Uint8Array, offset: number, length: number, value: string): void {
  for (let i = 0; i < value.length && i < length - 1; i += 1) {
    target[offset + i] = value.charCodeAt(i);
  }
}
