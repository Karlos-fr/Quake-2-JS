/**
 * File: quake2-gl-model-loader-phase1.ts
 * Purpose: Verify the early TypeScript port of the traversal and visibility portion of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the explicit renderer model runtime.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import type { cplane_t } from "../../packages/qcommon/src/index.js";
import { createMLeaf, createMNode, createModel } from "../../packages/renderer-three/src/gl-model.js";
import {
  Mod_ClusterPVS,
  Mod_DecompressVis,
  Mod_Init,
  Mod_PointInLeaf,
  RadiusFromBounds,
  createGlModelRuntime,
  createRendererVisData
} from "../../packages/renderer-three/src/index.js";

const runtime = createGlModelRuntime();
Mod_Init(runtime);

assert.equal(runtime.mod_novis.length, 8192, "mod_novis byte length mismatch");
assert.equal(runtime.mod_novis[0], 0xff, "mod_novis initialization mismatch");
assert.equal(runtime.mod_novis[17], 0xff, "mod_novis fill mismatch");

const plane: cplane_t = {
  normal: [1, 0, 0],
  dist: 0,
  type: 0,
  signbits: 0,
  pad: [0, 0]
};

const frontLeaf = createMLeaf();
frontLeaf.contents = -3;
frontLeaf.cluster = 1;

const backLeaf = createMLeaf();
backLeaf.contents = -4;
backLeaf.cluster = 2;

const rootNode = createMNode();
rootNode.plane = plane;
rootNode.children = [frontLeaf, backLeaf];

const model = createModel();
model.nodes = [rootNode];
model.numnodes = 1;

assert.equal(Mod_PointInLeaf([10, 0, 0], model), frontLeaf, "front leaf selection mismatch");
assert.equal(Mod_PointInLeaf([-1, 0, 0], model), backLeaf, "back leaf selection mismatch");

const noVisModel = createModel();
noVisModel.vis = createRendererVisData(10, [], new Uint8Array(0));
const allVisible = Mod_DecompressVis(null, noVisModel);
assert.deepEqual(Array.from(allVisible.subarray(0, 2)), [0xff, 0xff], "null vis fallback mismatch");

const compressedModel = createModel();
compressedModel.vis = createRendererVisData(16, [[0, 0]], new Uint8Array([0x12, 0x00, 0x01]));
const decompressed = Mod_DecompressVis(new Uint8Array([0x12, 0x00, 0x01]), compressedModel);
assert.deepEqual(Array.from(decompressed.subarray(0, 2)), [0x12, 0x00], "RLE decompression mismatch");

const clusterModel = createModel();
clusterModel.vis = createRendererVisData(16, [[0, 0], [2, 0]], new Uint8Array([0xaa, 0xbb, 0xcc, 0x00, 0x01]));
assert.deepEqual(Array.from(Mod_ClusterPVS(runtime, 0, clusterModel).subarray(0, 2)), [0xaa, 0xbb], "cluster 0 PVS mismatch");
assert.deepEqual(Array.from(Mod_ClusterPVS(runtime, 1, clusterModel).subarray(0, 2)), [0xcc, 0x00], "cluster 1 PVS mismatch");
assert.equal(Mod_ClusterPVS(runtime, -1, clusterModel), runtime.mod_novis, "cluster -1 fallback mismatch");

assert.equal(RadiusFromBounds([-16, -32, -8], [24, 10, 12]), Math.sqrt((24 * 24) + (32 * 32) + (12 * 12)), "RadiusFromBounds mismatch");

console.log("quake2-gl-model-loader-phase1: ok");
