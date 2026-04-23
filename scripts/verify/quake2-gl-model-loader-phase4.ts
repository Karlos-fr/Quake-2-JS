/**
 * File: quake2-gl-model-loader-phase4.ts
 * Purpose: Verify the BSP tree wiring portion of the TypeScript port of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for surfedges, marksurfaces, leafs, nodes and parent propagation.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import { setLittleLong, setLittleShort } from "../../packages/memory/src/binary-io.js";
import { createMSurface, createModel } from "../../packages/renderer-three/src/gl-model.js";
import {
  Mod_LoadLeafs,
  Mod_LoadMarksurfaces,
  Mod_LoadNodes,
  Mod_LoadSurfedges,
  createGlModelRuntime
} from "../../packages/renderer-three/src/index.js";

const runtime = createGlModelRuntime();
runtime.loadmodel = createModel();
runtime.loadmodel.name = "maps/test.bsp";
runtime.loadmodel.surfaces = [createMSurface(), createMSurface(), createMSurface()];
runtime.loadmodel.numsurfaces = 3;
runtime.loadmodel.planes = [
  { normal: [1, 0, 0], dist: 0, type: 0, signbits: 0, pad: [0, 0] }
];
runtime.loadmodel.numplanes = 1;

const modBase = new Uint8Array(256);

const surfedgesLump = { fileofs: 0, filelen: 12 };
setLittleLong(modBase, 0, 4);
setLittleLong(modBase, 4, -7);
setLittleLong(modBase, 8, 9);
Mod_LoadSurfedges(runtime, surfedgesLump, modBase);
assert.deepEqual(runtime.loadmodel.surfedges, [4, -7, 9], "Mod_LoadSurfedges mismatch");
assert.equal(runtime.loadmodel.numsurfedges, 3, "Mod_LoadSurfedges count mismatch");

const marksurfacesLump = { fileofs: 16, filelen: 6 };
setLittleShort(modBase, 16, 2);
setLittleShort(modBase, 18, 0);
setLittleShort(modBase, 20, 1);
Mod_LoadMarksurfaces(runtime, marksurfacesLump, modBase);
assert.equal(runtime.loadmodel.nummarksurfaces, 3, "Mod_LoadMarksurfaces count mismatch");
assert.equal(runtime.loadmodel.marksurfaces[0], runtime.loadmodel.surfaces[2], "Mod_LoadMarksurfaces first reference mismatch");
assert.equal(runtime.loadmodel.marksurfaces[1], runtime.loadmodel.surfaces[0], "Mod_LoadMarksurfaces second reference mismatch");
assert.equal(runtime.loadmodel.marksurfaces[2], runtime.loadmodel.surfaces[1], "Mod_LoadMarksurfaces third reference mismatch");

const leafsLump = { fileofs: 32, filelen: 56 };
setLittleLong(modBase, 32, -3);
setLittleShort(modBase, 36, 4);
setLittleShort(modBase, 38, 5);
setLittleShort(modBase, 40, -16);
setLittleShort(modBase, 42, -8);
setLittleShort(modBase, 44, -4);
setLittleShort(modBase, 46, 16);
setLittleShort(modBase, 48, 8);
setLittleShort(modBase, 50, 4);
setLittleShort(modBase, 52, 1);
setLittleShort(modBase, 54, 2);
setLittleShort(modBase, 56, 0);
setLittleShort(modBase, 58, 0);

setLittleLong(modBase, 60, -5);
setLittleShort(modBase, 64, 6);
setLittleShort(modBase, 66, 7);
setLittleShort(modBase, 68, -32);
setLittleShort(modBase, 70, -16);
setLittleShort(modBase, 72, -8);
setLittleShort(modBase, 74, 32);
setLittleShort(modBase, 76, 16);
setLittleShort(modBase, 78, 8);
setLittleShort(modBase, 80, 1);
setLittleShort(modBase, 82, 1);
setLittleShort(modBase, 84, 0);
setLittleShort(modBase, 86, 0);

Mod_LoadLeafs(runtime, leafsLump, modBase);
assert.equal(runtime.loadmodel.numleafs, 2, "Mod_LoadLeafs count mismatch");
assert.equal(runtime.loadmodel.leafs[0].contents, -3, "Mod_LoadLeafs first contents mismatch");
assert.equal(runtime.loadmodel.leafs[0].cluster, 4, "Mod_LoadLeafs first cluster mismatch");
assert.equal(runtime.loadmodel.leafs[0].area, 5, "Mod_LoadLeafs first area mismatch");
assert.deepEqual(runtime.loadmodel.leafs[0].minmaxs, [-16, -8, -4, 16, 8, 4], "Mod_LoadLeafs first bounds mismatch");
assert.deepEqual(runtime.loadmodel.leafs[0].firstmarksurface, [runtime.loadmodel.surfaces[0], runtime.loadmodel.surfaces[1]], "Mod_LoadLeafs marksurface slice mismatch");
assert.equal(runtime.loadmodel.leafs[1].contents, -5, "Mod_LoadLeafs second contents mismatch");
assert.deepEqual(runtime.loadmodel.leafs[1].firstmarksurface, [runtime.loadmodel.surfaces[0]], "Mod_LoadLeafs second marksurface slice mismatch");

const nodesLump = { fileofs: 96, filelen: 28 };
setLittleLong(modBase, 96, 0);
setLittleLong(modBase, 100, -1);
setLittleLong(modBase, 104, -2);
setLittleShort(modBase, 108, -64);
setLittleShort(modBase, 110, -32);
setLittleShort(modBase, 112, -16);
setLittleShort(modBase, 114, 64);
setLittleShort(modBase, 116, 32);
setLittleShort(modBase, 118, 16);
setLittleShort(modBase, 120, 9);
setLittleShort(modBase, 122, 3);

Mod_LoadNodes(runtime, nodesLump, modBase);
assert.equal(runtime.loadmodel.numnodes, 1, "Mod_LoadNodes count mismatch");
assert.equal(runtime.loadmodel.nodes[0].plane, runtime.loadmodel.planes[0], "Mod_LoadNodes plane mismatch");
assert.deepEqual(runtime.loadmodel.nodes[0].minmaxs, [-64, -32, -16, 64, 32, 16], "Mod_LoadNodes bounds mismatch");
assert.equal(runtime.loadmodel.nodes[0].firstsurface, 9, "Mod_LoadNodes firstsurface mismatch");
assert.equal(runtime.loadmodel.nodes[0].numsurfaces, 3, "Mod_LoadNodes numsurfaces mismatch");
assert.equal(runtime.loadmodel.nodes[0].children[0], runtime.loadmodel.leafs[0], "Mod_LoadNodes first child mismatch");
assert.equal(runtime.loadmodel.nodes[0].children[1], runtime.loadmodel.leafs[1], "Mod_LoadNodes second child mismatch");
assert.equal(runtime.loadmodel.leafs[0].parent, runtime.loadmodel.nodes[0], "Mod_SetParent first leaf mismatch");
assert.equal(runtime.loadmodel.leafs[1].parent, runtime.loadmodel.nodes[0], "Mod_SetParent second leaf mismatch");
assert.equal(runtime.loadmodel.nodes[0].parent, null, "Mod_SetParent root mismatch");

console.log("quake2-gl-model-loader-phase4: ok");
