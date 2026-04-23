/**
 * File: quake2-gl-model-loader-phase5.ts
 * Purpose: Verify the BSP plane loading and brush-model orchestration portion of the TypeScript port of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `Mod_LoadPlanes` and `Mod_LoadBrushModel`.
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
  LUMP_VISIBILITY,
  SURF_WARP
} from "../../packages/formats/src/index.js";
import { setLittleFloat, setLittleLong, setLittleShort, setUnsignedByte } from "../../packages/memory/src/binary-io.js";
import { createModel } from "../../packages/renderer-three/src/gl-model.js";
import {
  Mod_LoadBrushModel,
  Mod_LoadPlanes,
  createGlModelRuntime
} from "../../packages/renderer-three/src/index.js";

const runtime = createGlModelRuntime({
  findImage: (name) => ({ name }),
  notextureImage: { name: "***r_notexture***" }
});

runtime.mod_known[0].name = "maps/test.bsp";
runtime.loadmodel = runtime.mod_known[0];

const planeBytes = new Uint8Array(20);
setLittleFloat(planeBytes, 0, -1);
setLittleFloat(planeBytes, 4, 2);
setLittleFloat(planeBytes, 8, -3);
setLittleFloat(planeBytes, 12, 64);
setLittleLong(planeBytes, 16, 5);
Mod_LoadPlanes(runtime, { fileofs: 0, filelen: 20 }, planeBytes);
assert.equal(runtime.loadmodel.numplanes, 1, "Mod_LoadPlanes count mismatch");
assert.deepEqual(runtime.loadmodel.planes[0].normal, [-1, 2, -3], "Mod_LoadPlanes normal mismatch");
assert.equal(runtime.loadmodel.planes[0].dist, 64, "Mod_LoadPlanes dist mismatch");
assert.equal(runtime.loadmodel.planes[0].type, 5, "Mod_LoadPlanes type mismatch");
assert.equal(runtime.loadmodel.planes[0].signbits, 5, "Mod_LoadPlanes signbits mismatch");

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

for (const lump of lumps) {
  const headerOffset = 8 + lump.index * 8;
  setLittleLong(buffer, headerOffset, lump.fileofs);
  setLittleLong(buffer, headerOffset + 4, lump.filelen);
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
writeCString(buffer, 344, 32, "test");
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

buffer.set([9, 8, 7, 6], 404);

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

Mod_LoadBrushModel(runtime, runtime.loadmodel, buffer);

assert.equal(runtime.loadmodel.type, 1, "Mod_LoadBrushModel type mismatch");
assert.equal(runtime.loadmodel.numframes, 2, "Mod_LoadBrushModel numframes mismatch");
assert.equal(runtime.loadmodel.numvertexes, 4, "Mod_LoadBrushModel vertex count mismatch");
assert.equal(runtime.loadmodel.numedges, 2, "Mod_LoadBrushModel edge count mismatch");
assert.equal(runtime.loadmodel.numsurfedges, 4, "Mod_LoadBrushModel surfedge count mismatch");
assert.equal(runtime.loadmodel.numplanes, 1, "Mod_LoadBrushModel plane count mismatch");
assert.equal(runtime.loadmodel.numtexinfo, 1, "Mod_LoadBrushModel texinfo count mismatch");
assert.equal(runtime.loadmodel.numsurfaces, 1, "Mod_LoadBrushModel surface count mismatch");
assert.equal(runtime.loadmodel.nummarksurfaces, 1, "Mod_LoadBrushModel marksurface count mismatch");
assert.equal(runtime.loadmodel.numleafs, 1, "Mod_LoadBrushModel world numleafs mismatch");
assert.equal(runtime.loadmodel.numnodes, 1, "Mod_LoadBrushModel node count mismatch");
assert.equal(runtime.loadmodel.numsubmodels, 1, "Mod_LoadBrushModel submodel count mismatch");
assert.deepEqual(runtime.loadmodel.lightdata && Array.from(runtime.loadmodel.lightdata), [9, 8, 7, 6], "Mod_LoadBrushModel lightdata mismatch");
assert.deepEqual(runtime.loadmodel.surfaces[0].texturemins, [0, 0], "Mod_LoadBrushModel surface texturemins mismatch");
assert.deepEqual(runtime.loadmodel.surfaces[0].extents, [16, 16], "Mod_LoadBrushModel surface extents mismatch");
assert.equal(runtime.loadmodel.firstmodelsurface, 0, "Mod_LoadBrushModel world firstmodelsurface mismatch");
assert.equal(runtime.loadmodel.nummodelsurfaces, 1, "Mod_LoadBrushModel world nummodelsurfaces mismatch");
assert.equal(runtime.loadmodel.firstnode, 0, "Mod_LoadBrushModel world firstnode mismatch");
assert.deepEqual(runtime.mod_inline[0].mins, [-17, -17, -2], "Mod_LoadBrushModel inline mins mismatch");
assert.deepEqual(runtime.mod_inline[0].maxs, [17, 17, 2], "Mod_LoadBrushModel inline maxs mismatch");
assert.equal(runtime.mod_inline[0].firstnode, 0, "Mod_LoadBrushModel inline firstnode mismatch");
assert.equal(runtime.mod_inline[0].nummodelsurfaces, 1, "Mod_LoadBrushModel inline nummodelsurfaces mismatch");
assert.equal(runtime.loadmodel.surfaces[0].texinfo?.flags ?? 0, 0, "Mod_LoadBrushModel texinfo flags mismatch");
assert.equal(runtime.loadmodel.surfaces[0].flags & SURF_WARP, 0, "Mod_LoadBrushModel surface warp mismatch");

console.log("quake2-gl-model-loader-phase5: ok");

function writeCString(buffer: Uint8Array, offset: number, maxLength: number, value: string): void {
  for (let index = 0; index < maxLength; index += 1) {
    buffer[offset + index] = 0;
  }

  for (let index = 0; index < value.length && index < maxLength - 1; index += 1) {
    buffer[offset + index] = value.charCodeAt(index);
  }
}
