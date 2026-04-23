/**
 * File: quake2-gl-model-loader-phase2.ts
 * Purpose: Verify the BSP lump-loading portion of the TypeScript port of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the early brush-model loaders.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import { setLittleFloat, setLittleLong, setLittleShort } from "../../packages/memory/src/binary-io.js";
import { createModel } from "../../packages/renderer-three/src/gl-model.js";
import {
  Mod_LoadEdges,
  Mod_LoadLighting,
  Mod_LoadSubmodels,
  Mod_LoadVertexes,
  Mod_LoadVisibility,
  createGlModelRuntime
} from "../../packages/renderer-three/src/index.js";

const runtime = createGlModelRuntime();
runtime.loadmodel = createModel();
runtime.loadmodel.name = "maps/test.bsp";

const modBase = new Uint8Array(256);

const lightingLump = { fileofs: 0, filelen: 4 };
modBase.set([1, 2, 3, 4], 0);
Mod_LoadLighting(runtime, lightingLump, modBase);
assert.deepEqual(Array.from(runtime.loadmodel.lightdata ?? []), [1, 2, 3, 4], "Mod_LoadLighting mismatch");

const visibilityLump = { fileofs: 16, filelen: 20 };
setLittleLong(modBase, 16, 2);
setLittleLong(modBase, 20, 12);
setLittleLong(modBase, 24, 14);
setLittleLong(modBase, 28, 15);
setLittleLong(modBase, 32, 17);
modBase[28] = 15;
modBase[29] = 0;
modBase[30] = 0;
modBase[31] = 0;
modBase[32] = 17;
modBase[33] = 0;
modBase[34] = 0;
modBase[35] = 0;
Mod_LoadVisibility(runtime, visibilityLump, modBase);
assert.equal(runtime.loadmodel.vis?.numclusters, 2, "Mod_LoadVisibility numclusters mismatch");
assert.deepEqual(runtime.loadmodel.vis?.bitofs, [[12, 14], [15, 17]], "Mod_LoadVisibility bitofs mismatch");
assert.equal(runtime.loadmodel.vis && "raw" in runtime.loadmodel.vis ? runtime.loadmodel.vis.raw.length : 0, 20, "Mod_LoadVisibility raw length mismatch");

const vertexLump = { fileofs: 40, filelen: 24 };
setLittleFloat(modBase, 40, 1.5);
setLittleFloat(modBase, 44, -2.25);
setLittleFloat(modBase, 48, 3.75);
setLittleFloat(modBase, 52, 10);
setLittleFloat(modBase, 56, 20);
setLittleFloat(modBase, 60, 30);
Mod_LoadVertexes(runtime, vertexLump, modBase);
assert.equal(runtime.loadmodel.numvertexes, 2, "Mod_LoadVertexes count mismatch");
assert.deepEqual(runtime.loadmodel.vertexes[0].position, [1.5, -2.25, 3.75], "Mod_LoadVertexes first vertex mismatch");
assert.deepEqual(runtime.loadmodel.vertexes[1].position, [10, 20, 30], "Mod_LoadVertexes second vertex mismatch");

const submodelLump = { fileofs: 72, filelen: 48 };
setLittleFloat(modBase, 72, -16);
setLittleFloat(modBase, 76, -8);
setLittleFloat(modBase, 80, -4);
setLittleFloat(modBase, 84, 32);
setLittleFloat(modBase, 88, 16);
setLittleFloat(modBase, 92, 8);
setLittleFloat(modBase, 96, 4);
setLittleFloat(modBase, 100, 5);
setLittleFloat(modBase, 104, 6);
setLittleLong(modBase, 108, 7);
setLittleLong(modBase, 112, 8);
setLittleLong(modBase, 116, 9);
Mod_LoadSubmodels(runtime, submodelLump, modBase);
assert.equal(runtime.loadmodel.numsubmodels, 1, "Mod_LoadSubmodels count mismatch");
assert.deepEqual(runtime.loadmodel.submodels[0].mins, [-17, -9, -5], "Mod_LoadSubmodels mins mismatch");
assert.deepEqual(runtime.loadmodel.submodels[0].maxs, [33, 17, 9], "Mod_LoadSubmodels maxs mismatch");
assert.deepEqual(runtime.loadmodel.submodels[0].origin, [4, 5, 6], "Mod_LoadSubmodels origin mismatch");
assert.equal(runtime.loadmodel.submodels[0].headnode, 7, "Mod_LoadSubmodels headnode mismatch");
assert.equal(runtime.loadmodel.submodels[0].firstface, 8, "Mod_LoadSubmodels firstface mismatch");
assert.equal(runtime.loadmodel.submodels[0].numfaces, 9, "Mod_LoadSubmodels numfaces mismatch");

const edgeLump = { fileofs: 124, filelen: 8 };
setLittleShort(modBase, 124, 2);
setLittleShort(modBase, 126, 4);
setLittleShort(modBase, 128, 6);
setLittleShort(modBase, 130, 8);
Mod_LoadEdges(runtime, edgeLump, modBase);
assert.equal(runtime.loadmodel.numedges, 2, "Mod_LoadEdges count mismatch");
assert.deepEqual(runtime.loadmodel.edges[0].v, [2, 4], "Mod_LoadEdges first edge mismatch");
assert.deepEqual(runtime.loadmodel.edges[1].v, [6, 8], "Mod_LoadEdges second edge mismatch");
assert.deepEqual(runtime.loadmodel.edges[2].v, [0, 0], "Mod_LoadEdges sentinel mismatch");

console.log("quake2-gl-model-loader-phase2: ok");
