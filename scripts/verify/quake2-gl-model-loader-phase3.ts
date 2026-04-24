/**
 * File: quake2-gl-model-loader-phase3.ts
 * Purpose: Verify the texinfo and face-loading portion of the TypeScript port of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the early brush surface pipeline.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import { SURF_WARP } from "../../packages/formats/src/index.js";
import { setLittleFloat, setLittleLong, setLittleShort, setUnsignedByte } from "../../packages/memory/src/binary-io.js";
import { createMSurface, createModel } from "../../packages/renderer-three/src/gl-model.js";
import {
  CalcSurfaceExtents,
  Mod_LoadFaces,
  Mod_LoadTexinfo,
  createGlModelRuntime
} from "../../packages/renderer-three/src/index.js";

const missingMessages: string[] = [];
const builtPolygons: number[] = [];
const createdLightmaps: number[] = [];
const subdividedSurfaces: number[] = [];
let beginLightmaps = 0;
let endLightmaps = 0;

const runtime = createGlModelRuntime({
  findImage: (name) => (name === "textures/test0.wal" ? { name } : null),
  notextureImage: { name: "***r_notexture***" },
  print: (message) => missingMessages.push(message),
  beginBuildingLightmaps: () => {
    beginLightmaps += 1;
  },
  endBuildingLightmaps: () => {
    endLightmaps += 1;
  },
  createSurfaceLightmap: (surface) => {
    createdLightmaps.push(surface.firstedge);
  },
  buildPolygonFromSurface: (surface) => {
    builtPolygons.push(surface.firstedge);
  },
  subdivideSurface: (surface) => {
    subdividedSurfaces.push(surface.firstedge);
  }
});

runtime.loadmodel = createModel();
runtime.loadmodel.name = "maps/test.bsp";
runtime.loadmodel.planes = [
  { normal: [0, 0, 1], dist: 0, type: 2, signbits: 0, pad: [0, 0] }
];
runtime.loadmodel.numplanes = 1;
runtime.loadmodel.vertexes = [
  { position: [0, 0, 0] },
  { position: [16, 0, 0] },
  { position: [16, 16, 0] },
  { position: [0, 16, 0] }
];
runtime.loadmodel.numvertexes = 4;
runtime.loadmodel.edges = [
  { v: [0, 1], cachededgeoffset: 0 },
  { v: [1, 2], cachededgeoffset: 0 },
  { v: [2, 3], cachededgeoffset: 0 },
  { v: [3, 0], cachededgeoffset: 0 },
  { v: [0, 0], cachededgeoffset: 0 }
];
runtime.loadmodel.numedges = 4;
runtime.loadmodel.surfedges = [0, 1, 2, 3, 0, 1, 2, 3];
runtime.loadmodel.numsurfedges = 8;
runtime.loadmodel.lightdata = new Uint8Array([10, 20, 30, 40, 50, 60]);

const modBase = new Uint8Array(512);

const texinfoLump = { fileofs: 0, filelen: 76 * 2 };
setLittleFloat(modBase, 0, 1);
setLittleFloat(modBase, 4, 0);
setLittleFloat(modBase, 8, 0);
setLittleFloat(modBase, 12, 0);
setLittleFloat(modBase, 16, 0);
setLittleFloat(modBase, 20, 1);
setLittleFloat(modBase, 24, 0);
setLittleFloat(modBase, 28, 0);
setLittleLong(modBase, 32, 0);
setLittleLong(modBase, 36, 0);
writeCString(modBase, 40, 32, "test0");
setLittleLong(modBase, 72, 1);

const tex1 = 76;
setLittleFloat(modBase, tex1 + 0, 1);
setLittleFloat(modBase, tex1 + 4, 0);
setLittleFloat(modBase, tex1 + 8, 0);
setLittleFloat(modBase, tex1 + 12, 0);
setLittleFloat(modBase, tex1 + 16, 0);
setLittleFloat(modBase, tex1 + 20, 1);
setLittleFloat(modBase, tex1 + 24, 0);
setLittleFloat(modBase, tex1 + 28, 0);
setLittleLong(modBase, tex1 + 32, SURF_WARP);
setLittleLong(modBase, tex1 + 36, 0);
writeCString(modBase, tex1 + 40, 32, "test1");
setLittleLong(modBase, tex1 + 72, 0);

Mod_LoadTexinfo(runtime, texinfoLump, modBase);
assert.equal(runtime.loadmodel.numtexinfo, 2, "Mod_LoadTexinfo count mismatch");
assert.deepEqual(runtime.loadmodel.texinfo[0].vecs[0], [1, 0, 0, 0], "Mod_LoadTexinfo vecs mismatch");
assert.equal(runtime.loadmodel.texinfo[0].next, runtime.loadmodel.texinfo[1], "Mod_LoadTexinfo next mismatch");
assert.equal(runtime.loadmodel.texinfo[0].numframes, 2, "Mod_LoadTexinfo numframes mismatch");
assert.deepEqual(runtime.loadmodel.texinfo[0].image, { name: "textures/test0.wal" }, "Mod_LoadTexinfo image mismatch");
assert.deepEqual(runtime.loadmodel.texinfo[1].image, { name: "***r_notexture***" }, "Mod_LoadTexinfo fallback image mismatch");
assert.equal(missingMessages.length, 1, "Mod_LoadTexinfo missing image print mismatch");

const surface = createMSurface();
surface.firstedge = 0;
surface.numedges = 4;
surface.texinfo = runtime.loadmodel.texinfo[0];
CalcSurfaceExtents(runtime, surface);
assert.deepEqual(surface.texturemins, [0, 0], "CalcSurfaceExtents texturemins mismatch");
assert.deepEqual(surface.extents, [16, 16], "CalcSurfaceExtents extents mismatch");

const facesLump = { fileofs: 200, filelen: 40 };
setLittleShort(modBase, 200, 0);
setLittleShort(modBase, 202, 0);
setLittleLong(modBase, 204, 0);
setLittleShort(modBase, 208, 4);
setLittleShort(modBase, 210, 0);
setUnsignedByte(modBase, 212, 1);
setUnsignedByte(modBase, 213, 2);
setUnsignedByte(modBase, 214, 3);
setUnsignedByte(modBase, 215, 4);
setLittleLong(modBase, 216, 2);

setLittleShort(modBase, 220, 0);
setLittleShort(modBase, 222, 1);
setLittleLong(modBase, 224, 4);
setLittleShort(modBase, 228, 4);
setLittleShort(modBase, 230, 1);
setUnsignedByte(modBase, 232, 5);
setUnsignedByte(modBase, 233, 6);
setUnsignedByte(modBase, 234, 7);
setUnsignedByte(modBase, 235, 8);
setLittleLong(modBase, 236, -1);

Mod_LoadFaces(runtime, facesLump, modBase);

assert.equal(beginLightmaps, 1, "Mod_LoadFaces begin lightmaps mismatch");
assert.equal(endLightmaps, 1, "Mod_LoadFaces end lightmaps mismatch");
assert.equal(runtime.loadmodel.numsurfaces, 2, "Mod_LoadFaces count mismatch");

assert.deepEqual(runtime.loadmodel.surfaces[0].texturemins, [0, 0], "Mod_LoadFaces first surface texturemins mismatch");
assert.deepEqual(runtime.loadmodel.surfaces[0].extents, [16, 16], "Mod_LoadFaces first surface extents mismatch");
assert.deepEqual(runtime.loadmodel.surfaces[0].styles, [1, 2, 3, 4], "Mod_LoadFaces styles mismatch");
assert.deepEqual(Array.from(runtime.loadmodel.surfaces[0].samples ?? []).slice(0, 4), [30, 40, 50, 60], "Mod_LoadFaces samples mismatch");

assert.equal(runtime.loadmodel.surfaces[1].flags & 2, 2, "Mod_LoadFaces plane backflag mismatch");
assert.equal(runtime.loadmodel.surfaces[1].flags & 0x10, 0x10, "Mod_LoadFaces warp flag mismatch");
assert.deepEqual(runtime.loadmodel.surfaces[1].texturemins, [-8192, -8192], "Mod_LoadFaces warp texturemins mismatch");
assert.deepEqual(runtime.loadmodel.surfaces[1].extents, [16384, 16384], "Mod_LoadFaces warp extents mismatch");
assert.equal(runtime.loadmodel.surfaces[1].samples, null, "Mod_LoadFaces warp samples mismatch");

assert.deepEqual(createdLightmaps, [0], "Mod_LoadFaces lightmap hook mismatch");
assert.deepEqual(builtPolygons, [0], "Mod_LoadFaces polygon hook mismatch");
assert.deepEqual(subdividedSurfaces, [4], "Mod_LoadFaces subdivide hook mismatch");

console.log("quake2-gl-model-loader-phase3: ok");

function writeCString(buffer: Uint8Array, offset: number, maxLength: number, value: string): void {
  for (let index = 0; index < maxLength; index += 1) {
    buffer[offset + index] = 0;
  }

  for (let index = 0; index < value.length && index < maxLength - 1; index += 1) {
    buffer[offset + index] = value.charCodeAt(index);
  }
}
