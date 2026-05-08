/**
 * File: quake2-gl-light.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_light.c` preserves dynamic-light marking, point sampling and lightmap building behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict renderer-lighting port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-light.ts
 * - packages/renderer-three/src/gl-model.ts
 * - packages/client/src/ref.ts
 */

import { strict as assert } from "node:assert";

import { createLightstyle, createRefDef } from "../../packages/client/src/ref.js";
import {
  DLIGHT_CUTOFF,
  R_BuildLightMap,
  R_AddDynamicLights,
  R_LightPoint,
  R_MarkModelLights,
  R_PushDlights,
  R_RenderDlights,
  R_SetCacheState,
  createGlLightRmainHooks,
  createGlLightRuntime,
  setGlFlashblendEnabled,
  setGlLightCurrentEntity,
  setGlLightFrameCount,
  setGlLightRefdef,
  setGlLightViewVectors,
  setGlLightWorldModel,
  setGlModulate,
  setGlMonolightmapMode
} from "../../packages/renderer-three/src/index.js";
import { createMLeaf, createMNode, createMSurface, createMTexinfo, createModel } from "../../packages/renderer-three/src/gl-model.js";
import { createEntity } from "../../packages/client/src/ref.js";

assert.equal(DLIGHT_CUTOFF, 64, "DLIGHT_CUTOFF mismatch");

const renderCalls: Array<{ radius: number; center: readonly number[]; ringCount: number }> = [];
const runtime = createGlLightRuntime({
  beginFlashblendDlights: () => {
    renderCalls.push({ radius: -1, center: [], ringCount: -1 });
  },
  renderDlight: (_light, center, ring, radius) => {
    renderCalls.push({ radius, center, ringCount: ring.length });
  },
  endFlashblendDlights: () => {
    renderCalls.push({ radius: -2, center: [], ringCount: -2 });
  }
});

const worldmodel = createModel();
const rootNode = createMNode();
rootNode.plane = {
  normal: [0, 0, 1],
  dist: 0,
  type: 2,
  signbits: 0,
  pad: [0, 0]
};
rootNode.firstsurface = 0;
rootNode.numsurfaces = 1;
rootNode.children = [createMLeaf(), createMLeaf()];

const surface = createMSurface();
surface.plane = rootNode.plane;
surface.texturemins = [0, 0];
surface.extents = [16, 16];
surface.styles = [0, 255, 255, 255];
surface.texinfo = createMTexinfo();
surface.texinfo.vecs = [
  [1, 0, 0, 0],
  [0, 1, 0, 0]
];
surface.samples = new Uint8Array([
  100, 150, 200,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0
]);

worldmodel.nodes = [rootNode];
worldmodel.surfaces = [surface];
worldmodel.lightdata = new Uint8Array([1]);

const refdef = createRefDef();
refdef.lightstyles[0] = createLightstyle();
refdef.lightstyles[0].rgb = [1, 1, 1];
refdef.lightstyles[0].white = 3;
refdef.num_dlights = 1;
refdef.dlights = [{
  origin: [0, 0, 0],
  color: [1, 0.5, 0.25],
  intensity: 100
}];

setGlLightWorldModel(runtime, worldmodel);
setGlLightRefdef(runtime, refdef);
setGlLightFrameCount(runtime, 10);
setGlLightViewVectors(runtime, {
  origin: [0, 0, 16],
  vpn: [0, 0, 1],
  vright: [1, 0, 0],
  vup: [0, 1, 0]
});
setGlModulate(runtime, 1);
setGlMonolightmapMode(runtime, "0");

R_SetCacheState(runtime, surface);
assert.equal(surface.cached_light[0], 3, "R_SetCacheState mismatch");

R_PushDlights(runtime);
assert.equal(surface.dlightframe, 11, "R_PushDlights frame mismatch");
assert.equal(surface.dlightbits, 1, "R_PushDlights bit mismatch");

const currentEntity = createEntity();
currentEntity.origin = [0, 0, 10];
setGlLightCurrentEntity(runtime, currentEntity);

const color: [number, number, number] = [0, 0, 0];
R_LightPoint(runtime, [0, 0, 10], color);
assert.equal(color[0] > 0.39, true, "R_LightPoint red mismatch");
assert.equal(color[1] > 0.58, true, "R_LightPoint green mismatch");
assert.equal(color[2] > 0.78, true, "R_LightPoint blue mismatch");

const dest = new Uint8Array(16);
setGlLightFrameCount(runtime, 11);
assert.equal(surface.dlightframe, runtime.r_framecount, "R_PushDlights frame should match the later lightmap build frame");
R_BuildLightMap(runtime, surface, dest, 8);
assert.equal(dest[0] > 100, true, "R_BuildLightMap red accumulation mismatch");
assert.equal(dest[1] > 150, true, "R_BuildLightMap green accumulation mismatch");
assert.equal(dest[2] > 200, true, "R_BuildLightMap blue accumulation mismatch");
assert.equal(dest[3] >= dest[2], true, "R_BuildLightMap alpha mismatch");

const monoDest = new Uint8Array(16);
setGlMonolightmapMode(runtime, "A");
R_BuildLightMap(runtime, surface, monoDest, 8);
assert.equal(monoDest[0], 0, "monolightmap red mismatch");
assert.equal(monoDest[1], 0, "monolightmap green mismatch");
assert.equal(monoDest[2], 0, "monolightmap blue mismatch");
assert.equal(monoDest[3] < 255, true, "monolightmap alpha mismatch");

setGlFlashblendEnabled(runtime, true);
R_RenderDlights(runtime);
assert.equal(renderCalls.length, 3, "R_RenderDlights hook count mismatch");
assert.equal(renderCalls[1]?.ringCount, 17, "R_RenderDlight ring mismatch");
assert.equal(renderCalls[1]?.radius, 35, "R_RenderDlight radius mismatch");

setGlFlashblendEnabled(runtime, false);
R_RenderDlights(runtime);
assert.equal(renderCalls.length, 3, "R_RenderDlights flashblend-off mismatch");

const pushSkipRuntime = createGlLightRuntime();
setGlLightWorldModel(pushSkipRuntime, worldmodel);
setGlLightRefdef(pushSkipRuntime, refdef);
setGlFlashblendEnabled(pushSkipRuntime, true);
surface.dlightbits = 0;
surface.dlightframe = 0;
R_PushDlights(pushSkipRuntime);
assert.equal(surface.dlightbits, 0, "R_PushDlights flashblend skip mismatch");

const unlitRuntime = createGlLightRuntime();
const unlitModel = createModel();
unlitModel.nodes = [rootNode];
unlitModel.surfaces = [surface];
unlitModel.lightdata = null;
setGlLightWorldModel(unlitRuntime, unlitModel);
setGlLightRefdef(unlitRuntime, refdef);
const unlitColor: [number, number, number] = [0, 0, 0];
R_LightPoint(unlitRuntime, [0, 0, 10], unlitColor);
assert.deepEqual(unlitColor, [1, 1, 1], "R_LightPoint unlit fallback mismatch");

const monolRuntime = createGlLightRuntime();
setGlLightWorldModel(monolRuntime, worldmodel);
setGlLightRefdef(monolRuntime, refdef);
setGlModulate(monolRuntime, 1);
surface.dlightframe = -1;
surface.dlightbits = 0;

const monoLDest = new Uint8Array(16);
setGlMonolightmapMode(monolRuntime, "L");
R_BuildLightMap(monolRuntime, surface, monoLDest, 8);
assert.equal(monoLDest[1], 0, "monolightmap L green mismatch");
assert.equal(monoLDest[2], 0, "monolightmap L blue mismatch");

const monoCDest = new Uint8Array(16);
setGlMonolightmapMode(monolRuntime, "C");
R_BuildLightMap(monolRuntime, surface, monoCDest, 8);
assert.equal(monoCDest[0] > 0 || monoCDest[1] > 0 || monoCDest[2] > 0, true, "monolightmap C rgb mismatch");
assert.equal(monoCDest[3] <= 255, true, "monolightmap C alpha mismatch");

const rmainHooks = createGlLightRmainHooks(runtime);
const hookColor = rmainHooks.lightPoint([0, 0, 10]);
assert.equal(Array.isArray(hookColor) && hookColor.length === 3, true, "createGlLightRmainHooks lightPoint mismatch");
rmainHooks.pushDlights();
rmainHooks.renderDlights();

const fractionalSurface = createMSurface();
fractionalSurface.plane = rootNode.plane;
fractionalSurface.texturemins = [0, 0];
fractionalSurface.extents = [16, 16];
fractionalSurface.dlightbits = 1;
fractionalSurface.texinfo = createMTexinfo();
fractionalSurface.texinfo.vecs = [
  [1, 0, 0, 0],
  [0, 1, 0, 0]
];
runtime.s_blocklights.fill(0);
refdef.dlights[0].origin = [2.9, 2.9, 0];
refdef.dlights[0].intensity = 100;
R_AddDynamicLights(runtime, fractionalSurface);
assert.equal(runtime.s_blocklights[0], 97, "R_AddDynamicLights must truncate td like the C int path");

const brushModel = createModel();
const brushNode = createMNode();
brushNode.plane = rootNode.plane;
brushNode.firstsurface = 0;
brushNode.numsurfaces = 1;
brushNode.children = [createMLeaf(), createMLeaf()];
const brushSurface = createMSurface();
brushModel.nodes = [brushNode];
brushModel.surfaces = [brushSurface];
brushModel.firstnode = 0;
runtime.r_dlightframecount = 22;
R_MarkModelLights(runtime, brushModel);
assert.equal(brushSurface.dlightframe, 22, "R_MarkModelLights frame mismatch");
assert.equal(brushSurface.dlightbits, 1, "R_MarkModelLights bit mismatch");
assert.equal(runtime.r_worldmodel, worldmodel, "R_MarkModelLights must restore r_worldmodel");

console.log("quake2-gl-light: ok");
