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
  CONTENTS_AREAPORTAL,
  CONTENTS_AUX,
  CONTENTS_CURRENT_0,
  CONTENTS_CURRENT_90,
  CONTENTS_CURRENT_180,
  CONTENTS_CURRENT_270,
  CONTENTS_CURRENT_DOWN,
  CONTENTS_CURRENT_UP,
  CONTENTS_DEADMONSTER,
  CONTENTS_DETAIL,
  CONTENTS_LADDER,
  CONTENTS_LAVA,
  CONTENTS_MIST,
  CONTENTS_MONSTER,
  CONTENTS_MONSTERCLIP,
  CONTENTS_ORIGIN,
  CONTENTS_PLAYERCLIP,
  CONTENTS_SLIME,
  CONTENTS_SOLID,
  CONTENTS_TRANSLUCENT,
  CONTENTS_WATER,
  CONTENTS_WINDOW,
  DTRIVERTX_LNI,
  DTRIVERTX_SIZE,
  DTRIVERTX_V0,
  DTRIVERTX_V1,
  DTRIVERTX_V2,
  DVIS_PHS,
  DVIS_PVS,
  HEADER_LUMPS,
  IDALIASHEADER,
  IDBSPHEADER,
  IDPAKHEADER,
  IDSPRITEHEADER,
  LAST_VISIBLE_CONTENTS,
  LUMP_AREAPORTALS,
  LUMP_AREAS,
  LUMP_BRUSHES,
  LUMP_BRUSHSIDES,
  LUMP_EDGES,
  LUMP_ENTITIES,
  LUMP_FACES,
  LUMP_LEAFBRUSHES,
  LUMP_LEAFFACES,
  LUMP_LEAFS,
  LUMP_LIGHTING,
  LUMP_MODELS,
  LUMP_NODES,
  LUMP_PLANES,
  LUMP_POP,
  LUMP_SURFEDGES,
  LUMP_TEXINFO,
  LUMP_VERTEXES,
  LUMP_VISIBILITY,
  MAX_FRAMES,
  MAX_FILES_IN_PACK,
  MAX_KEY,
  MAX_MAP_AREAPORTALS,
  MAX_MAP_AREAS,
  MAX_MAP_BRUSHES,
  MAX_MAP_BRUSHSIDES,
  MAX_MAP_EDGES,
  MAX_MAP_ENTITIES,
  MAX_MAP_ENTSTRING,
  MAX_MAP_FACES,
  MAX_MAP_LEAFBRUSHES,
  MAX_MAP_LEAFFACES,
  MAX_MAP_LEAFS,
  MAX_MAP_LIGHTING,
  MAX_MAP_MODELS,
  MAX_MAP_NODES,
  MAX_MAP_PLANES,
  MAX_MAP_PORTALS,
  MAX_MAP_SURFEDGES,
  MAX_MAP_TEXINFO,
  MAX_MAP_VERTS,
  MAX_MAP_VISIBILITY,
  MAX_VALUE,
  MAX_MD2SKINS,
  MAX_SKINNAME,
  MAX_TRIANGLES,
  MAX_VERTS,
  MIPLEVELS,
  parseMd2,
  parsePak,
  parseBsp,
  parsePcx,
  parseSp2,
  parseWal,
  PLANE_ANYX,
  PLANE_ANYY,
  PLANE_ANYZ,
  PLANE_X,
  PLANE_Y,
  PLANE_Z,
  SPRITE_VERSION,
  SURF_FLOWING,
  SURF_LIGHT,
  SURF_NODRAW,
  SURF_SKY,
  SURF_SLICK,
  SURF_TRANS33,
  SURF_TRANS66,
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

function writeLittleLong(target: Uint8Array, offset: number, value: number): void {
  target.set(createLittleLong(value), offset);
}

function writeLittleShort(target: Uint8Array, offset: number, value: number): void {
  target.set(createLittleShort(value), offset);
}

function writeLittleFloat(target: Uint8Array, offset: number, value: number): void {
  new DataView(target.buffer, target.byteOffset, target.byteLength).setFloat32(offset, value, true);
}

function writeLump(target: Uint8Array, lumpIndex: number, fileofs: number, filelen: number): void {
  const offset = 8 + lumpIndex * 8;
  writeLittleLong(target, offset, fileofs);
  writeLittleLong(target, offset + 4, filelen);
}

assert.equal(IDPAKHEADER, (("K".charCodeAt(0) << 24) + ("C".charCodeAt(0) << 16) + ("A".charCodeAt(0) << 8) + "P".charCodeAt(0)) | 0, "IDPAKHEADER mismatch");
assert.equal(IDBSPHEADER, (("P".charCodeAt(0) << 24) + ("S".charCodeAt(0) << 16) + ("B".charCodeAt(0) << 8) + "I".charCodeAt(0)) | 0, "IDBSPHEADER mismatch");
assert.equal(IDALIASHEADER, (("2".charCodeAt(0) << 24) + ("P".charCodeAt(0) << 16) + ("D".charCodeAt(0) << 8) + "I".charCodeAt(0)) | 0, "IDALIASHEADER mismatch");
assert.equal(IDSPRITEHEADER, (("2".charCodeAt(0) << 24) + ("S".charCodeAt(0) << 16) + ("D".charCodeAt(0) << 8) + "I".charCodeAt(0)) | 0, "IDSPRITEHEADER mismatch");
assert.equal(BSPVERSION, 38, "BSPVERSION mismatch");
assert.equal(ALIAS_VERSION, 8, "ALIAS_VERSION mismatch");
assert.equal(SPRITE_VERSION, 2, "SPRITE_VERSION mismatch");
assert.equal(MAX_FILES_IN_PACK, 4096, "MAX_FILES_IN_PACK mismatch");
assert.equal(MAX_TRIANGLES, 4096, "MAX_TRIANGLES mismatch");
assert.equal(MAX_VERTS, 2048, "MAX_VERTS mismatch");
assert.equal(MAX_FRAMES, 512, "MAX_FRAMES mismatch");
assert.equal(MAX_MD2SKINS, 32, "MAX_MD2SKINS mismatch");
assert.equal(MAX_SKINNAME, 64, "MAX_SKINNAME mismatch");
assert.equal(DTRIVERTX_V0, 0, "DTRIVERTX_V0 mismatch");
assert.equal(DTRIVERTX_V1, 1, "DTRIVERTX_V1 mismatch");
assert.equal(DTRIVERTX_V2, 2, "DTRIVERTX_V2 mismatch");
assert.equal(DTRIVERTX_LNI, 3, "DTRIVERTX_LNI mismatch");
assert.equal(DTRIVERTX_SIZE, 4, "DTRIVERTX_SIZE mismatch");
assert.equal(MIPLEVELS, 4, "MIPLEVELS mismatch");
assert.equal(MAX_MAP_MODELS, 1024, "MAX_MAP_MODELS mismatch");
assert.equal(MAX_MAP_BRUSHES, 8192, "MAX_MAP_BRUSHES mismatch");
assert.equal(MAX_MAP_ENTITIES, 2048, "MAX_MAP_ENTITIES mismatch");
assert.equal(MAX_MAP_ENTSTRING, 0x40000, "MAX_MAP_ENTSTRING mismatch");
assert.equal(MAX_MAP_TEXINFO, 8192, "MAX_MAP_TEXINFO mismatch");
assert.equal(MAX_MAP_AREAS, 256, "MAX_MAP_AREAS mismatch");
assert.equal(MAX_MAP_AREAPORTALS, 1024, "MAX_MAP_AREAPORTALS mismatch");
assert.equal(MAX_MAP_PLANES, 65536, "MAX_MAP_PLANES mismatch");
assert.equal(MAX_MAP_NODES, 65536, "MAX_MAP_NODES mismatch");
assert.equal(MAX_MAP_BRUSHSIDES, 65536, "MAX_MAP_BRUSHSIDES mismatch");
assert.equal(MAX_MAP_LEAFS, 65536, "MAX_MAP_LEAFS mismatch");
assert.equal(MAX_MAP_VERTS, 65536, "MAX_MAP_VERTS mismatch");
assert.equal(MAX_MAP_FACES, 65536, "MAX_MAP_FACES mismatch");
assert.equal(MAX_MAP_LEAFFACES, 65536, "MAX_MAP_LEAFFACES mismatch");
assert.equal(MAX_MAP_LEAFBRUSHES, 65536, "MAX_MAP_LEAFBRUSHES mismatch");
assert.equal(MAX_MAP_PORTALS, 65536, "MAX_MAP_PORTALS mismatch");
assert.equal(MAX_MAP_EDGES, 128000, "MAX_MAP_EDGES mismatch");
assert.equal(MAX_MAP_SURFEDGES, 256000, "MAX_MAP_SURFEDGES mismatch");
assert.equal(MAX_MAP_LIGHTING, 0x200000, "MAX_MAP_LIGHTING mismatch");
assert.equal(MAX_MAP_VISIBILITY, 0x100000, "MAX_MAP_VISIBILITY mismatch");
assert.equal(MAX_KEY, 32, "MAX_KEY mismatch");
assert.equal(MAX_VALUE, 1024, "MAX_VALUE mismatch");
assert.equal(HEADER_LUMPS, 19, "HEADER_LUMPS mismatch");
assert.equal(LUMP_ENTITIES, 0, "LUMP_ENTITIES mismatch");
assert.equal(LUMP_PLANES, 1, "LUMP_PLANES mismatch");
assert.equal(LUMP_VERTEXES, 2, "LUMP_VERTEXES mismatch");
assert.equal(LUMP_VISIBILITY, 3, "LUMP_VISIBILITY mismatch");
assert.equal(LUMP_NODES, 4, "LUMP_NODES mismatch");
assert.equal(LUMP_TEXINFO, 5, "LUMP_TEXINFO mismatch");
assert.equal(LUMP_FACES, 6, "LUMP_FACES mismatch");
assert.equal(LUMP_LIGHTING, 7, "LUMP_LIGHTING mismatch");
assert.equal(LUMP_LEAFS, 8, "LUMP_LEAFS mismatch");
assert.equal(LUMP_LEAFFACES, 9, "LUMP_LEAFFACES mismatch");
assert.equal(LUMP_LEAFBRUSHES, 10, "LUMP_LEAFBRUSHES mismatch");
assert.equal(LUMP_EDGES, 11, "LUMP_EDGES mismatch");
assert.equal(LUMP_SURFEDGES, 12, "LUMP_SURFEDGES mismatch");
assert.equal(LUMP_MODELS, 13, "LUMP_MODELS mismatch");
assert.equal(LUMP_BRUSHES, 14, "LUMP_BRUSHES mismatch");
assert.equal(LUMP_BRUSHSIDES, 15, "LUMP_BRUSHSIDES mismatch");
assert.equal(LUMP_POP, 16, "LUMP_POP mismatch");
assert.equal(LUMP_AREAS, 17, "LUMP_AREAS mismatch");
assert.equal(LUMP_AREAPORTALS, 18, "LUMP_AREAPORTALS mismatch");
assert.equal(PLANE_X, 0, "PLANE_X mismatch");
assert.equal(PLANE_Y, 1, "PLANE_Y mismatch");
assert.equal(PLANE_Z, 2, "PLANE_Z mismatch");
assert.equal(PLANE_ANYX, 3, "PLANE_ANYX mismatch");
assert.equal(PLANE_ANYY, 4, "PLANE_ANYY mismatch");
assert.equal(PLANE_ANYZ, 5, "PLANE_ANYZ mismatch");
assert.equal(DVIS_PVS, 0, "DVIS_PVS mismatch");
assert.equal(DVIS_PHS, 1, "DVIS_PHS mismatch");
assert.equal(ANGLE_UP, -1, "ANGLE_UP mismatch");
assert.equal(ANGLE_DOWN, -2, "ANGLE_DOWN mismatch");
assert.equal(CONTENTS_SOLID, 1, "CONTENTS_SOLID mismatch");
assert.equal(CONTENTS_WINDOW, 2, "CONTENTS_WINDOW mismatch");
assert.equal(CONTENTS_AUX, 4, "CONTENTS_AUX mismatch");
assert.equal(CONTENTS_LAVA, 8, "CONTENTS_LAVA mismatch");
assert.equal(CONTENTS_SLIME, 16, "CONTENTS_SLIME mismatch");
assert.equal(CONTENTS_WATER, 32, "CONTENTS_WATER mismatch");
assert.equal(CONTENTS_MIST, 64, "CONTENTS_MIST mismatch");
assert.equal(LAST_VISIBLE_CONTENTS, 64, "LAST_VISIBLE_CONTENTS mismatch");
assert.equal(CONTENTS_AREAPORTAL, 0x8000, "CONTENTS_AREAPORTAL mismatch");
assert.equal(CONTENTS_PLAYERCLIP, 0x10000, "CONTENTS_PLAYERCLIP mismatch");
assert.equal(CONTENTS_MONSTERCLIP, 0x20000, "CONTENTS_MONSTERCLIP mismatch");
assert.equal(CONTENTS_CURRENT_0, 0x40000, "CONTENTS_CURRENT_0 mismatch");
assert.equal(CONTENTS_CURRENT_90, 0x80000, "CONTENTS_CURRENT_90 mismatch");
assert.equal(CONTENTS_CURRENT_180, 0x100000, "CONTENTS_CURRENT_180 mismatch");
assert.equal(CONTENTS_CURRENT_270, 0x200000, "CONTENTS_CURRENT_270 mismatch");
assert.equal(CONTENTS_CURRENT_UP, 0x400000, "CONTENTS_CURRENT_UP mismatch");
assert.equal(CONTENTS_CURRENT_DOWN, 0x800000, "CONTENTS_CURRENT_DOWN mismatch");
assert.equal(CONTENTS_ORIGIN, 0x1000000, "CONTENTS_ORIGIN mismatch");
assert.equal(CONTENTS_MONSTER, 0x2000000, "CONTENTS_MONSTER mismatch");
assert.equal(CONTENTS_DEADMONSTER, 0x4000000, "CONTENTS_DEADMONSTER mismatch");
assert.equal(CONTENTS_DETAIL, 0x8000000, "CONTENTS_DETAIL mismatch");
assert.equal(CONTENTS_TRANSLUCENT, 0x10000000, "CONTENTS_TRANSLUCENT mismatch");
assert.equal(CONTENTS_LADDER, 0x20000000, "CONTENTS_LADDER mismatch");
assert.equal(SURF_LIGHT, 0x1, "SURF_LIGHT mismatch");
assert.equal(SURF_SLICK, 0x2, "SURF_SLICK mismatch");
assert.equal(SURF_SKY, 0x4, "SURF_SKY mismatch");
assert.equal(SURF_WARP, 0x8, "SURF_WARP mismatch");
assert.equal(SURF_TRANS33, 0x10, "SURF_TRANS33 mismatch");
assert.equal(SURF_TRANS66, 0x20, "SURF_TRANS66 mismatch");
assert.equal(SURF_FLOWING, 0x40, "SURF_FLOWING mismatch");
assert.equal(SURF_NODRAW, 0x80, "SURF_NODRAW mismatch");

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
assert.deepEqual(md2.header, {
  ident: IDALIASHEADER,
  version: ALIAS_VERSION,
  skinwidth: 64,
  skinheight: 64,
  framesize: 44,
  num_skins: 1,
  num_xyz: 1,
  num_st: 1,
  num_tris: 1,
  num_glcmds: 1,
  num_frames: 1,
  ofs_skins: 68,
  ofs_st: 132,
  ofs_tris: 136,
  ofs_frames: 148,
  ofs_glcmds: 192,
  ofs_end: 196
}, "parseMd2 dmdl_t header mismatch");
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

const bspBytes = new Uint8Array(512);
writeLittleLong(bspBytes, 0, IDBSPHEADER);
writeLittleLong(bspBytes, 4, BSPVERSION);
writeLump(bspBytes, LUMP_ENTITIES, 160, 29);
writeLump(bspBytes, LUMP_PLANES, 192, 20);
writeLump(bspBytes, LUMP_VERTEXES, 212, 12);
writeLump(bspBytes, LUMP_VISIBILITY, 224, 4);
writeLump(bspBytes, LUMP_NODES, 228, 28);
writeLump(bspBytes, LUMP_TEXINFO, 256, 76);
writeLump(bspBytes, LUMP_MODELS, 332, 48);
writeAscii(bspBytes, 160, "{\"classname\" \"worldspawn\"}\0");
writeLittleFloat(bspBytes, 192, 1);
writeLittleFloat(bspBytes, 196, 0);
writeLittleFloat(bspBytes, 200, 0);
writeLittleFloat(bspBytes, 204, 64);
writeLittleLong(bspBytes, 208, PLANE_X);
writeLittleFloat(bspBytes, 212, 10);
writeLittleFloat(bspBytes, 216, 20);
writeLittleFloat(bspBytes, 220, 30);
bspBytes[224] = 0x55;
bspBytes[225] = 0xaa;
writeLittleLong(bspBytes, 228, 0);
writeLittleLong(bspBytes, 232, -1);
writeLittleLong(bspBytes, 236, -2);
writeLittleShort(bspBytes, 240, -16);
writeLittleShort(bspBytes, 242, -24);
writeLittleShort(bspBytes, 244, -32);
writeLittleShort(bspBytes, 246, 16);
writeLittleShort(bspBytes, 248, 24);
writeLittleShort(bspBytes, 250, 32);
writeLittleShort(bspBytes, 252, 3);
writeLittleShort(bspBytes, 254, 4);
writeLittleFloat(bspBytes, 256, 1);
writeLittleFloat(bspBytes, 260, 0);
writeLittleFloat(bspBytes, 264, 0);
writeLittleFloat(bspBytes, 268, 2);
writeLittleFloat(bspBytes, 272, 0);
writeLittleFloat(bspBytes, 276, 1);
writeLittleFloat(bspBytes, 280, 0);
writeLittleFloat(bspBytes, 284, 4);
writeLittleLong(bspBytes, 288, SURF_WARP | SURF_FLOWING);
writeLittleLong(bspBytes, 292, 123);
writeAscii(bspBytes, 296, "e1u1/water1");
writeLittleLong(bspBytes, 328, -1);
writeLittleFloat(bspBytes, 332, -1);
writeLittleFloat(bspBytes, 336, -2);
writeLittleFloat(bspBytes, 340, -3);
writeLittleFloat(bspBytes, 344, 64);
writeLittleFloat(bspBytes, 348, 65);
writeLittleFloat(bspBytes, 352, 66);
writeLittleFloat(bspBytes, 356, 1);
writeLittleFloat(bspBytes, 360, 2);
writeLittleFloat(bspBytes, 364, 3);
writeLittleLong(bspBytes, 368, 7);
writeLittleLong(bspBytes, 372, 11);
writeLittleLong(bspBytes, 376, 13);
const bsp = parseBsp(bspBytes, "test.bsp");
assert.equal(bsp.header.ident, IDBSPHEADER, "parseBsp dheader_t ident mismatch");
assert.equal(bsp.header.version, BSPVERSION, "parseBsp dheader_t version mismatch");
assert.equal(bsp.header.lumps.length, HEADER_LUMPS, "parseBsp dheader_t lumps count mismatch");
assert.deepEqual(bsp.header.lumps[LUMP_ENTITIES], { fileofs: 160, filelen: 29 }, "parseBsp lump_t mismatch");
assert.equal(bsp.entities, "{\"classname\" \"worldspawn\"}", "parseBsp entity lump mismatch");
assert.equal(bsp.parsedEntities[0].properties.classname, "worldspawn", "parseBsp parsed entity mismatch");
assert.deepEqual(bsp.planes[0], { normal: [1, 0, 0], dist: 64, type: PLANE_X }, "parseBsp dplane_t mismatch");
assert.deepEqual(bsp.vertexes[0], { point: [10, 20, 30] }, "parseBsp dvertex_t mismatch");
assert.deepEqual(Array.from(bsp.visibility), [0x55, 0xaa, 0, 0], "parseBsp visibility lump mismatch");
assert.deepEqual(bsp.nodes[0], {
  planenum: 0,
  children: [-1, -2],
  mins: [-16, -24, -32],
  maxs: [16, 24, 32],
  firstface: 3,
  numfaces: 4
}, "parseBsp dnode_t mismatch");
assert.deepEqual(bsp.texinfo[0], {
  vecs: [[1, 0, 0, 2], [0, 1, 0, 4]],
  flags: SURF_WARP | SURF_FLOWING,
  value: 123,
  texture: "e1u1/water1",
  nexttexinfo: -1
}, "parseBsp texinfo_t mismatch");
assert.deepEqual(bsp.models[0], {
  mins: [-1, -2, -3],
  maxs: [64, 65, 66],
  origin: [1, 2, 3],
  headnode: 7,
  firstface: 11,
  numfaces: 13
}, "parseBsp dmodel_t mismatch");

console.log("quake2-qfiles: ok");
