/**
 * File: quake2-gl-warp.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_warp.c` preserves sky bounds, warp subdivision, turbulent UVs and sky texture selection.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a partial renderer-warp port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-warp.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import { Cvar_Get, createCvarRuntime } from "../../packages/qcommon/src/cvar.js";
import { ERR_DROP } from "../../packages/qcommon/src/index.js";
import { SURF_FLOWING } from "../../packages/formats/src/index.js";
import {
  BoundPoly,
  ClipSkyPolygon,
  DrawSkyPolygon,
  EmitWaterPolys,
  GL_SubdivideSurface,
  MakeSkyVec,
  R_AddSkySurface,
  R_ClearSkyBox,
  R_DrawSkyBox,
  R_SetSky,
  SKY_SUFFIXES,
  SUBDIVIDE_SIZE,
  TURBSCALE,
  createGlWarpRuntime,
  setWarpFallbackTexture,
  setWarpHooks,
  setWarpModel,
  setWarpPaletteExtensionState,
  setWarpRefdefTime,
  setWarpSkyCvars,
  setWarpViewOrigin
} from "../../packages/renderer-three/src/index.js";
import { createGlPoly, createMSurface, createModel } from "../../packages/renderer-three/src/gl-model.js";

const cvarRuntime = createCvarRuntime();
const loadedPaths: string[] = [];
const runtime = createGlWarpRuntime();

setWarpHooks(runtime, {
  findImage: (path) => {
    loadedPaths.push(path);
    return { name: path } as never;
  },
  sysError: (_level, message) => {
    throw new Error(message);
  }
});

const mins: [number, number, number] = [0, 0, 0];
const maxs: [number, number, number] = [0, 0, 0];
BoundPoly(3, [[-4, 2, 8], [6, -3, 1], [5, 7, -2]], mins, maxs);
assert.deepEqual(mins, [-4, -3, -2], "BoundPoly mins mismatch");
assert.deepEqual(maxs, [6, 7, 8], "BoundPoly maxs mismatch");

const waterSurface = createMSurface();
waterSurface.texinfo = {
  vecs: [[1, 0, 0, 0], [0, 1, 0, 0]],
  flags: SURF_FLOWING,
  numframes: 1,
  next: null,
  image: null
};
const waterPoly = createGlPoly();
waterPoly.numverts = 3;
waterPoly.verts = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 8, 16, 0, 0],
  [4, 4, 0, 16, 24, 0, 0]
];
waterSurface.polys = waterPoly;
setWarpRefdefTime(runtime, 1.5);
const emitted = EmitWaterPolys(runtime, waterSurface);
assert.equal(emitted.length, 1, "EmitWaterPolys chain length mismatch");
assert.equal(emitted[0]?.vertices.length, 3, "EmitWaterPolys vertex count mismatch");
assert.equal(emitted[0]!.vertices[0]!.uv[0] < 0, true, "EmitWaterPolys flowing scroll mismatch");

const model = createModel();
model.surfedges = [1, 2, 3, 4];
model.edges = [
  { v: [0, 0], cachededgeoffset: 0 },
  { v: [0, 1], cachededgeoffset: 0 },
  { v: [1, 2], cachededgeoffset: 0 },
  { v: [2, 3], cachededgeoffset: 0 },
  { v: [3, 0], cachededgeoffset: 0 }
];
model.vertexes = [
  { position: [0, 0, 0] },
  { position: [128, 0, 0] },
  { position: [128, 128, 0] },
  { position: [0, 128, 0] }
];
setWarpModel(runtime, model);
const subdividedSurface = createMSurface();
subdividedSurface.firstedge = 0;
subdividedSurface.numedges = 4;
subdividedSurface.texinfo = {
  vecs: [[1, 0, 0, 0], [0, 1, 0, 0]],
  flags: 0,
  numframes: 1,
  next: null,
  image: null
};
const polys = GL_SubdivideSurface(runtime, subdividedSurface);
assert.equal(polys.length > 1, true, "GL_SubdivideSurface split mismatch");
assert.equal(subdividedSurface.polys !== null, true, "GL_SubdivideSurface surface chain mismatch");
assert.equal(polys[0]!.numverts >= 3, true, "GL_SubdivideSurface poly verts mismatch");

R_ClearSkyBox(runtime);
assert.equal(runtime.skymins[0][0], 9999, "R_ClearSkyBox mins mismatch");
assert.equal(runtime.skymaxs[1][5], -9999, "R_ClearSkyBox maxs mismatch");

const axis = DrawSkyPolygon(runtime, 4, [
  [10, 2, 1],
  [10, -2, 1],
  [10, -2, -1],
  [10, 2, -1]
]);
assert.equal(axis, 0, "DrawSkyPolygon axis mismatch");
assert.equal(runtime.skymins[0][0] < runtime.skymaxs[0][0], true, "DrawSkyPolygon bounds mismatch");

R_ClearSkyBox(runtime);
ClipSkyPolygon(runtime, 4, [
  [1, 1, 1],
  [1, -1, 1],
  [1, -1, -1],
  [1, 1, -1]
], 0);
assert.equal(runtime.c_sky > 0, true, "ClipSkyPolygon count mismatch");

R_ClearSkyBox(runtime);
const skySurface = createMSurface();
const skyPoly = createGlPoly();
skyPoly.numverts = 4;
skyPoly.verts = [
  [20, 1, 1, 0, 0, 0, 0],
  [20, -1, 1, 0, 0, 0, 0],
  [20, -1, -1, 0, 0, 0, 0],
  [20, 1, -1, 0, 0, 0, 0]
];
skySurface.polys = skyPoly;
setWarpViewOrigin(runtime, [0, 0, 0]);
R_AddSkySurface(runtime, skySurface);
assert.equal(runtime.skymins[0][0] < runtime.skymaxs[0][0], true, "R_AddSkySurface bounds mismatch");

runtime.sky_min = 1 / 512;
runtime.sky_max = 511 / 512;
const skyVertex = MakeSkyVec(runtime, -2, 2, 0);
assert.equal(skyVertex.position[0], 2300, "MakeSkyVec position mismatch");
assert.equal(skyVertex.uv[0] >= runtime.sky_min, true, "MakeSkyVec clamp mismatch");

runtime.sky_images = Array.from({ length: 6 }, (_, index) => ({ name: `face-${index}` } as never));
runtime.skymins[0][0] = -0.5;
runtime.skymins[1][0] = -0.25;
runtime.skymaxs[0][0] = 0.5;
runtime.skymaxs[1][0] = 0.25;
runtime.skyrotate = 0;
const drawnFaces = R_DrawSkyBox(runtime);
assert.equal(drawnFaces.length, 1, "R_DrawSkyBox visible face mismatch");
assert.equal((drawnFaces[0]?.image as { name: string }).name, "face-0", "R_DrawSkyBox face order mismatch");

runtime.skyrotate = 45;
R_ClearSkyBox(runtime);
runtime.skymins[0][2] = -0.2;
runtime.skymins[1][2] = -0.3;
runtime.skymaxs[0][2] = 0.2;
runtime.skymaxs[1][2] = 0.3;
const rotatingFaces = R_DrawSkyBox(runtime);
assert.equal(rotatingFaces.length, 6, "R_DrawSkyBox rotating full sky mismatch");

setWarpSkyCvars(runtime, {
  gl_skymip: Cvar_Get(cvarRuntime, "gl_skymip", "1", 0),
  gl_picmip: Cvar_Get(cvarRuntime, "gl_picmip", "0", 0),
  gl_ext_palettedtexture: Cvar_Get(cvarRuntime, "gl_ext_palettedtexture", "1", 0)
});
setWarpPaletteExtensionState(runtime, true);
setWarpFallbackTexture(runtime, { name: "***r_notexture***" } as never);
loadedPaths.length = 0;
R_SetSky(runtime, "space", 0, [0, 0, 1]);
assert.deepEqual(
  loadedPaths,
  SKY_SUFFIXES.map((suffix) => `env/space${suffix}.pcx`),
  "R_SetSky paletted path mismatch"
);
assert.equal(runtime.sky_min, 1 / 256, "R_SetSky sky min mismatch");
assert.equal(runtime.sky_max, 255 / 256, "R_SetSky sky max mismatch");

setWarpPaletteExtensionState(runtime, false);
runtime.gl_skymip!.value = 0;
loadedPaths.length = 0;
R_SetSky(runtime, "cloud", 30, [1, 0, 0]);
assert.deepEqual(
  loadedPaths,
  SKY_SUFFIXES.map((suffix) => `env/cloud${suffix}.tga`),
  "R_SetSky truecolor path mismatch"
);
assert.equal(runtime.skyaxis[0], 1, "R_SetSky axis mismatch");

assert.equal(SUBDIVIDE_SIZE, 64, "SUBDIVIDE_SIZE mismatch");
assert.equal(Math.round(TURBSCALE), 41, "TURBSCALE mismatch");

let failed = false;
try {
  ClipSkyPolygon(runtime, 63, Array.from({ length: 63 }, () => [0, 0, 0] as [number, number, number]), 0);
} catch (error) {
  failed = error instanceof Error && error.message.includes("MAX_CLIP_VERTS");
}
assert.equal(failed, true, "ClipSkyPolygon overflow mismatch");

let failSys = false;
try {
  setWarpHooks(runtime, {
    sysError: (level, message) => {
      assert.equal(level, ERR_DROP, "sysError level mismatch");
      throw new Error(message);
    }
  });
  const overflowModel = createModel();
  setWarpModel(runtime, overflowModel);
  GL_SubdivideSurface(runtime, subdividedSurface);
} catch {
  failSys = true;
}
assert.equal(failSys, true, "GL_SubdivideSurface sysError path mismatch");

console.log("quake2-gl-warp: ok");
