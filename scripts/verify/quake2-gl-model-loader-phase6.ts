/**
 * File: quake2-gl-model-loader-phase6.ts
 * Purpose: Verify the model registry and name-resolution portion of the TypeScript port of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `Mod_Modellist_f` and `Mod_ForName`.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import {
  BSPVERSION,
  HEADER_LUMPS,
  IDBSPHEADER,
  LUMP_EDGES,
  LUMP_FACES,
  LUMP_LEAFFACES,
  LUMP_LEAFS,
  LUMP_LIGHTING,
  LUMP_MODELS,
  LUMP_NODES,
  LUMP_PLANES,
  LUMP_SURFEDGES,
  LUMP_TEXINFO,
  LUMP_VERTEXES,
  LUMP_VISIBILITY
} from "../../packages/formats/src/index.js";
import { setLittleFloat, setLittleLong, setLittleShort, setUnsignedByte } from "../../packages/memory/src/binary-io.js";
import { createModel } from "../../packages/renderer-three/src/gl-model.js";
import {
  Mod_ForName,
  Mod_Modellist_f,
  createGlModelRuntime
} from "../../packages/renderer-three/src/index.js";

const printed: string[] = [];
const freed: Uint8Array[] = [];
const files = new Map<string, Uint8Array>();

const runtime = createGlModelRuntime({
  loadFile: (path) => files.get(path) ?? null,
  freeFile: (buffer) => {
    freed.push(buffer);
  },
  findImage: (name) => ({ name }),
  notextureImage: { name: "***r_notexture***" },
  print: (message) => {
    printed.push(message);
  }
});

runtime.mod_known[0].name = "maps/test.bsp";
runtime.mod_known[0].extradatasize = 100;
runtime.mod_known[1].name = "models/items/ammo/tris.md2";
runtime.mod_known[1].extradatasize = 50;
runtime.mod_numknown = 2;

const list = Mod_Modellist_f(runtime);
assert.equal(list.total, 150, "Mod_Modellist_f total mismatch");
assert.equal(list.lines[0], "Loaded models:", "Mod_Modellist_f header mismatch");
assert.equal(list.lines[3], "Total resident: 150", "Mod_Modellist_f footer mismatch");

const cached = Mod_ForName(runtime, "maps/test.bsp", true, null);
assert.equal(cached, runtime.mod_known[0], "Mod_ForName cache hit mismatch");

const worldModel = createModel();
worldModel.numsubmodels = 3;
runtime.mod_inline[2].name = "*2";
const inlineModel = Mod_ForName(runtime, "*2", true, worldModel);
assert.equal(inlineModel, runtime.mod_inline[2], "Mod_ForName inline model mismatch");

const missing = Mod_ForName(runtime, "maps/missing.bsp", false, null);
assert.equal(missing, null, "Mod_ForName missing non-crash mismatch");

const bsp = createMinimalBrushModelBuffer();
files.set("maps/loaded.bsp", bsp);
const loadRuntime = createGlModelRuntime({
  loadFile: (path) => files.get(path) ?? null,
  freeFile: (buffer) => {
    freed.push(buffer);
  },
  findImage: (name) => ({ name }),
  notextureImage: { name: "***r_notexture***" }
});
const loaded = Mod_ForName(loadRuntime, "maps/loaded.bsp", true, null);
assert.ok(loaded, "Mod_ForName loaded model missing");
assert.equal(loaded?.name, "maps/loaded.bsp", "Mod_ForName loaded name mismatch");
assert.equal(loaded?.type, 1, "Mod_ForName loaded type mismatch");
assert.equal(loaded?.numsubmodels, 1, "Mod_ForName loaded submodels mismatch");
assert.equal(loaded?.extradatasize, bsp.byteLength, "Mod_ForName extradata size mismatch");
assert.equal(loadRuntime.mod_numknown, 1, "Mod_ForName mod_numknown mismatch");
assert.equal(freed.includes(bsp), true, "Mod_ForName freeFile mismatch");

console.log("quake2-gl-model-loader-phase6: ok");

function createMinimalBrushModelBuffer(): Uint8Array {
  const buffer = new Uint8Array(1024);
  setLittleLong(buffer, 0, IDBSPHEADER);
  setLittleLong(buffer, 4, BSPVERSION);

  const lumps = [
    { index: LUMP_PLANES, fileofs: 200, filelen: 20 },
    { index: LUMP_VERTEXES, fileofs: 220, filelen: 48 },
    { index: LUMP_VISIBILITY, fileofs: 268, filelen: 12 },
    { index: LUMP_NODES, fileofs: 280, filelen: 28 },
    { index: LUMP_TEXINFO, fileofs: 308, filelen: 76 },
    { index: LUMP_FACES, fileofs: 384, filelen: 20 },
    { index: LUMP_LIGHTING, fileofs: 404, filelen: 4 },
    { index: LUMP_LEAFS, fileofs: 408, filelen: 28 },
    { index: LUMP_LEAFFACES, fileofs: 436, filelen: 2 },
    { index: LUMP_EDGES, fileofs: 438, filelen: 8 },
    { index: LUMP_SURFEDGES, fileofs: 446, filelen: 16 },
    { index: LUMP_MODELS, fileofs: 462, filelen: 48 }
  ];

  for (let index = 0; index < HEADER_LUMPS; index += 1) {
    const lump = lumps.find((entry) => entry.index === index);
    const headerOffset = 8 + index * 8;
    setLittleLong(buffer, headerOffset, lump?.fileofs ?? 0);
    setLittleLong(buffer, headerOffset + 4, lump?.filelen ?? 0);
  }

  setLittleFloat(buffer, 200, 0);
  setLittleFloat(buffer, 204, 0);
  setLittleFloat(buffer, 208, 1);
  setLittleFloat(buffer, 212, 0);
  setLittleLong(buffer, 216, 2);

  const vertices = [
    [0, 0, 0],
    [16, 0, 0],
    [16, 16, 0],
    [0, 16, 0]
  ];
  for (let index = 0; index < vertices.length; index += 1) {
    const offset = 220 + index * 12;
    setLittleFloat(buffer, offset, vertices[index][0]);
    setLittleFloat(buffer, offset + 4, vertices[index][1]);
    setLittleFloat(buffer, offset + 8, vertices[index][2]);
  }

  setLittleLong(buffer, 268, 1);
  setLittleLong(buffer, 272, 12);
  setLittleLong(buffer, 276, 12);

  setLittleLong(buffer, 280, 0);
  setLittleLong(buffer, 284, -1);
  setLittleLong(buffer, 288, -1);
  setLittleShort(buffer, 292, -16);
  setLittleShort(buffer, 294, -16);
  setLittleShort(buffer, 296, -1);
  setLittleShort(buffer, 298, 16);
  setLittleShort(buffer, 300, 16);
  setLittleShort(buffer, 302, 1);
  setLittleShort(buffer, 304, 0);
  setLittleShort(buffer, 306, 1);

  setLittleFloat(buffer, 308, 1);
  setLittleFloat(buffer, 312, 0);
  setLittleFloat(buffer, 316, 0);
  setLittleFloat(buffer, 320, 0);
  setLittleFloat(buffer, 324, 0);
  setLittleFloat(buffer, 328, 1);
  setLittleFloat(buffer, 332, 0);
  setLittleFloat(buffer, 336, 0);
  setLittleLong(buffer, 340, 0);
  setLittleLong(buffer, 344, 0);
  writeCString(buffer, 348, 32, "test");
  setLittleLong(buffer, 380, 0);

  setLittleShort(buffer, 384, 0);
  setLittleShort(buffer, 386, 0);
  setLittleLong(buffer, 388, 0);
  setLittleShort(buffer, 392, 4);
  setLittleShort(buffer, 394, 0);
  setUnsignedByte(buffer, 396, 1);
  setUnsignedByte(buffer, 397, 0);
  setUnsignedByte(buffer, 398, 0);
  setUnsignedByte(buffer, 399, 0);
  setLittleLong(buffer, 400, 0);

  buffer.set([1, 2, 3, 4], 404);

  setLittleLong(buffer, 408, -2);
  setLittleShort(buffer, 412, 0);
  setLittleShort(buffer, 414, 0);
  setLittleShort(buffer, 416, -16);
  setLittleShort(buffer, 418, -16);
  setLittleShort(buffer, 420, -1);
  setLittleShort(buffer, 422, 16);
  setLittleShort(buffer, 424, 16);
  setLittleShort(buffer, 426, 1);
  setLittleShort(buffer, 428, 0);
  setLittleShort(buffer, 430, 1);
  setLittleShort(buffer, 432, 0);
  setLittleShort(buffer, 434, 0);

  setLittleShort(buffer, 436, 0);

  setLittleShort(buffer, 438, 0);
  setLittleShort(buffer, 440, 1);
  setLittleShort(buffer, 442, 1);
  setLittleShort(buffer, 444, 2);

  setLittleLong(buffer, 446, 0);
  setLittleLong(buffer, 450, 1);
  setLittleLong(buffer, 454, -2);
  setLittleLong(buffer, 458, -1);

  setLittleFloat(buffer, 462, -16);
  setLittleFloat(buffer, 466, -16);
  setLittleFloat(buffer, 470, -1);
  setLittleFloat(buffer, 474, 16);
  setLittleFloat(buffer, 478, 16);
  setLittleFloat(buffer, 482, 1);
  setLittleFloat(buffer, 486, 0);
  setLittleFloat(buffer, 490, 0);
  setLittleFloat(buffer, 494, 0);
  setLittleLong(buffer, 498, 0);
  setLittleLong(buffer, 502, 0);
  setLittleLong(buffer, 506, 1);

  return buffer;
}

function writeCString(buffer: Uint8Array, offset: number, maxLength: number, value: string): void {
  for (let index = 0; index < maxLength; index += 1) {
    buffer[offset + index] = 0;
  }

  for (let index = 0; index < value.length && index < maxLength - 1; index += 1) {
    buffer[offset + index] = value.charCodeAt(index);
  }
}
