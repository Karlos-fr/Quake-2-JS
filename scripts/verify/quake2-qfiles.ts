/**
 * File: quake2-qfiles.ts
 * Purpose: Verify the primary TypeScript targets for `qcommon/qfiles.h`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the split Quake II binary format declarations.
 *
 * Dependencies:
 * - packages/formats/src/bsp.ts
 * - packages/formats/src/pak.ts
 * - packages/formats/src/pcx.ts
 * - packages/formats/src/wal.ts
 * - packages/formats/src/md2.ts
 * - packages/formats/src/sp2.ts
 */

import { strict as assert } from "node:assert";

import {
  ALIAS_VERSION,
  ANGLE_DOWN,
  ANGLE_UP,
  BSPVERSION,
  CONTENTS_SOLID,
  DVIS_PHS,
  DVIS_PVS,
  HEADER_LUMPS,
  IDALIASHEADER,
  IDBSPHEADER,
  IDPAKHEADER,
  IDSPRITEHEADER,
  LUMP_MODELS,
  LUMP_PLANES,
  MAX_FILES_IN_PACK,
  parseMd2,
  parsePak,
  parsePcx,
  parseSp2,
  parseWal,
  PLANE_ANYZ,
  PLANE_X,
  SPRITE_VERSION,
  SURF_WARP
} from "../../packages/formats/src/index.js";

function createLittleLong(value: number): number[] {
  const normalized = value >>> 0;
  return [
    normalized & 0xff,
    (normalized >>> 8) & 0xff,
    (normalized >>> 16) & 0xff,
    (normalized >>> 24) & 0xff
  ];
}

function createLittleShort(value: number): number[] {
  const normalized = value & 0xffff;
  return [
    normalized & 0xff,
    (normalized >>> 8) & 0xff
  ];
}

function writeAscii(target: Uint8Array, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    target[offset + index] = text.charCodeAt(index);
  }
}

assert.equal(IDPAKHEADER, (("K".charCodeAt(0) << 24) + ("C".charCodeAt(0) << 16) + ("A".charCodeAt(0) << 8) + "P".charCodeAt(0)) | 0, "IDPAKHEADER mismatch");
assert.equal(IDBSPHEADER, (("P".charCodeAt(0) << 24) + ("S".charCodeAt(0) << 16) + ("B".charCodeAt(0) << 8) + "I".charCodeAt(0)) | 0, "IDBSPHEADER mismatch");
assert.equal(IDALIASHEADER, (("2".charCodeAt(0) << 24) + ("P".charCodeAt(0) << 16) + ("D".charCodeAt(0) << 8) + "I".charCodeAt(0)) | 0, "IDALIASHEADER mismatch");
assert.equal(IDSPRITEHEADER, (("2".charCodeAt(0) << 24) + ("S".charCodeAt(0) << 16) + ("D".charCodeAt(0) << 8) + "I".charCodeAt(0)) | 0, "IDSPRITEHEADER mismatch");
assert.equal(BSPVERSION, 38, "BSPVERSION mismatch");
assert.equal(ALIAS_VERSION, 8, "ALIAS_VERSION mismatch");
assert.equal(SPRITE_VERSION, 2, "SPRITE_VERSION mismatch");
assert.equal(MAX_FILES_IN_PACK, 4096, "MAX_FILES_IN_PACK mismatch");
assert.equal(HEADER_LUMPS, 19, "HEADER_LUMPS mismatch");
assert.equal(LUMP_PLANES, 1, "LUMP_PLANES mismatch");
assert.equal(LUMP_MODELS, 13, "LUMP_MODELS mismatch");
assert.equal(PLANE_X, 0, "PLANE_X mismatch");
assert.equal(PLANE_ANYZ, 5, "PLANE_ANYZ mismatch");
assert.equal(DVIS_PVS, 0, "DVIS_PVS mismatch");
assert.equal(DVIS_PHS, 1, "DVIS_PHS mismatch");
assert.equal(ANGLE_UP, -1, "ANGLE_UP mismatch");
assert.equal(ANGLE_DOWN, -2, "ANGLE_DOWN mismatch");
assert.equal(CONTENTS_SOLID, 1, "CONTENTS_SOLID mismatch");
assert.equal(SURF_WARP, 0x8, "SURF_WARP mismatch");

const pakBytes = new Uint8Array(12 + 5 + 64);
pakBytes.set(createLittleLong(IDPAKHEADER), 0);
pakBytes.set(createLittleLong(17), 4);
pakBytes.set(createLittleLong(64), 8);
writeAscii(pakBytes, 12, "HELLO");
writeAscii(pakBytes, 17, "maps/test.bsp");
pakBytes.set(createLittleLong(12), 17 + 56);
pakBytes.set(createLittleLong(5), 17 + 60);
const pak = parsePak(pakBytes, "test.pak");
assert.deepEqual(pak.header, {
  ident: IDPAKHEADER,
  dirofs: 17,
  dirlen: 64
}, "parsePak dpackheader_t mismatch");
assert.equal(pak.entries.length, 1, "parsePak entry count mismatch");
assert.equal(pak.entries[0].name, "maps/test.bsp", "parsePak name mismatch");
assert.equal(pak.entries[0].filepos, 12, "parsePak filepos mismatch");
assert.equal(pak.entries[0].filelen, 5, "parsePak filelen mismatch");
assert.equal(pak.entries[0].normalizedName, "maps/test.bsp", "parsePak normalized name mismatch");

const pcxBytes = new Uint8Array(128 + 1 + 769);
pcxBytes[0] = 0x0a;
pcxBytes[1] = 5;
pcxBytes[2] = 1;
pcxBytes[3] = 8;
pcxBytes.set(createLittleShort(0), 4);
pcxBytes.set(createLittleShort(0), 6);
pcxBytes.set(createLittleShort(0), 8);
pcxBytes.set(createLittleShort(0), 10);
pcxBytes.set(createLittleShort(1), 12);
pcxBytes.set(createLittleShort(1), 14);
pcxBytes[16] = 31;
pcxBytes[64] = 0;
pcxBytes[65] = 1;
pcxBytes.set(createLittleShort(1), 66);
pcxBytes.set(createLittleShort(1), 68);
pcxBytes[70] = 222;
pcxBytes[128] = 7;
pcxBytes[129] = 0x0c;
pcxBytes[130 + 22] = 123;
const pcx = parsePcx(pcxBytes, "test.pcx");
assert.equal(pcx.header.manufacturer, 0x0a, "pcx_t manufacturer mismatch");
assert.equal(pcx.header.version, 5, "pcx_t version mismatch");
assert.equal(pcx.header.encoding, 1, "pcx_t encoding mismatch");
assert.equal(pcx.header.bits_per_pixel, 8, "pcx_t bits_per_pixel mismatch");
assert.equal(pcx.header.palette[0], 31, "pcx_t palette mismatch");
assert.equal(pcx.header.reserved, 0, "pcx_t reserved mismatch");
assert.equal(pcx.header.color_planes, 1, "pcx_t color_planes mismatch");
assert.equal(pcx.header.bytes_per_line, 1, "pcx_t bytes_per_line mismatch");
assert.equal(pcx.header.palette_type, 1, "pcx_t palette_type mismatch");
assert.equal(pcx.header.filler[0], 222, "pcx_t filler mismatch");
assert.equal(pcx.header.data[0], 7, "pcx_t data mismatch");
assert.equal(pcx.width, 1, "parsePcx width mismatch");
assert.equal(pcx.height, 1, "parsePcx height mismatch");
assert.equal(pcx.indices[0], 7, "parsePcx pixel index mismatch");
assert.equal(pcx.rgba[1], 123, "parsePcx palette expansion mismatch");

const walBytes = new Uint8Array(100 + 16 + 4 + 1 + 1);
writeAscii(walBytes, 0, "stone/test");
walBytes.set(createLittleLong(4), 32);
walBytes.set(createLittleLong(4), 36);
walBytes.set(createLittleLong(100), 40);
walBytes.set(createLittleLong(116), 44);
walBytes.set(createLittleLong(120), 48);
walBytes.set(createLittleLong(121), 52);
writeAscii(walBytes, 56, "stone/anim");
walBytes.set(createLittleLong(3), 88);
walBytes.set(createLittleLong(5), 92);
walBytes.set(createLittleLong(7), 96);
for (let index = 0; index < 16; index += 1) {
  walBytes[100 + index] = index;
}
walBytes[116] = 21;
walBytes[120] = 22;
walBytes[121] = 23;
const wal = parseWal(walBytes, "test.wal");
assert.equal(wal.header.name, "stone/test", "parseWal name mismatch");
assert.equal(wal.header.animname, "stone/anim", "parseWal animname mismatch");
assert.deepEqual(wal.header.offsets, [100, 116, 120, 121], "parseWal offsets mismatch");
assert.equal(wal.mipmaps.length, 4, "parseWal mip count mismatch");
assert.equal(wal.mipmaps[0][15], 15, "parseWal mip0 mismatch");
assert.equal(wal.mipmaps[3][0], 23, "parseWal mip3 mismatch");

const md2Bytes = new Uint8Array(68 + 64 + 4 + 12 + 44 + 4);
md2Bytes.set(createLittleLong(IDALIASHEADER), 0);
md2Bytes.set(createLittleLong(ALIAS_VERSION), 4);
md2Bytes.set(createLittleLong(64), 8);
md2Bytes.set(createLittleLong(64), 12);
md2Bytes.set(createLittleLong(44), 16);
md2Bytes.set(createLittleLong(1), 20);
md2Bytes.set(createLittleLong(1), 24);
md2Bytes.set(createLittleLong(1), 28);
md2Bytes.set(createLittleLong(1), 32);
md2Bytes.set(createLittleLong(1), 36);
md2Bytes.set(createLittleLong(1), 40);
md2Bytes.set(createLittleLong(68), 44);
md2Bytes.set(createLittleLong(132), 48);
md2Bytes.set(createLittleLong(136), 52);
md2Bytes.set(createLittleLong(148), 56);
md2Bytes.set(createLittleLong(192), 60);
md2Bytes.set(createLittleLong(196), 64);
writeAscii(md2Bytes, 68, "players/test.pcx");
md2Bytes.set(createLittleShort(2), 132);
md2Bytes.set(createLittleShort(3), 134);
md2Bytes.set(createLittleShort(0), 136);
md2Bytes.set(createLittleShort(0), 138);
md2Bytes.set(createLittleShort(0), 140);
md2Bytes.set(createLittleShort(0), 142);
md2Bytes.set(createLittleShort(0), 144);
md2Bytes.set(createLittleShort(0), 146);
new DataView(md2Bytes.buffer).setFloat32(148, 1, true);
new DataView(md2Bytes.buffer).setFloat32(152, 2, true);
new DataView(md2Bytes.buffer).setFloat32(156, 3, true);
new DataView(md2Bytes.buffer).setFloat32(160, 10, true);
new DataView(md2Bytes.buffer).setFloat32(164, 20, true);
new DataView(md2Bytes.buffer).setFloat32(168, 30, true);
writeAscii(md2Bytes, 172, "idle");
md2Bytes[188] = 4;
md2Bytes[189] = 5;
md2Bytes[190] = 6;
md2Bytes[191] = 7;
md2Bytes.set(createLittleLong(0), 192);
const md2 = parseMd2(md2Bytes, "test.md2");
assert.equal(md2.skins[0], "players/test.pcx", "parseMd2 skin mismatch");
assert.deepEqual(md2.st[0], { s: 2, t: 3 }, "parseMd2 st mismatch");
assert.deepEqual(md2.triangles[0], { index_xyz: [0, 0, 0], index_st: [0, 0, 0] }, "parseMd2 triangle mismatch");
assert.equal(md2.frames[0].name, "idle", "parseMd2 frame name mismatch");
assert.deepEqual(md2.frames[0].verts[0], { v: [4, 5, 6], lightnormalindex: 7 }, "parseMd2 compressed vertex mismatch");
assert.deepEqual(Array.from(md2.frames[0].positions), [14, 30, 48], "parseMd2 decoded position mismatch");
assert.equal(md2.glcmds[0], 0, "parseMd2 glcmd mismatch");

const sp2Bytes = new Uint8Array(12 + 80);
sp2Bytes.set(createLittleLong(IDSPRITEHEADER), 0);
sp2Bytes.set(createLittleLong(SPRITE_VERSION), 4);
sp2Bytes.set(createLittleLong(1), 8);
sp2Bytes.set(createLittleLong(32), 12);
sp2Bytes.set(createLittleLong(48), 16);
sp2Bytes.set(createLittleLong(4), 20);
sp2Bytes.set(createLittleLong(5), 24);
writeAscii(sp2Bytes, 28, "sprites/test.pcx");
const sp2 = parseSp2(sp2Bytes, "test.sp2");
assert.equal(sp2.numframes, 1, "parseSp2 frame count mismatch");
assert.deepEqual(sp2.frames[0], {
  width: 32,
  height: 48,
  origin_x: 4,
  origin_y: 5,
  name: "sprites/test.pcx"
}, "parseSp2 frame mismatch");

console.log("quake2-qfiles: ok");
