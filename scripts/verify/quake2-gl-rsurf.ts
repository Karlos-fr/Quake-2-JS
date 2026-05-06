/**
 * File: quake2-gl-rsurf.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_rsurf.c` preserves texture animation, lightmap allocation/build and brush-surface polygon reconstruction.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the renderer-surface port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-rsurf.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import {
  GL_BuildPolygonFromSurface,
  GL_CreateSurfaceLightmap,
  GL_LIGHTMAP_FORMAT,
  GL_RenderLightmappedPoly,
  LM_AllocBlock,
  LM_InitBlock,
  LM_UploadBlock,
  R_BlendLightmaps,
  R_RenderBrushPoly,
  R_TextureAnimation,
  createGlRsurfRuntime,
  setCurrentEntity,
  setCurrentModel,
  setDynamicLightmapsEnabled,
  setFullbrightEnabled,
  setFrameCount,
  setLightstyles,
  syncRsurfMultitextureFromRmain,
  setWorldModel
} from "../../packages/renderer-three/src/index.js";
import { createCvarRuntime, Cvar_Get } from "../../packages/qcommon/src/cvar.js";
import { SURF_DRAWSKY, SURF_DRAWTURB, createMEdge, createMSurface, createMTexinfo, createModel } from "../../packages/renderer-three/src/gl-model.js";

const hookLog = {
  setCacheStateCalls: 0,
  buildLightMapCalls: 0,
  renderLightmapChainSurfaceCalls: [] as Array<{ textureIndex: number; sOffset: number; tOffset: number }>,
  uploadLightmapBlockCalls: [] as Array<{ dynamic: boolean; textureIndex: number }>,
  uploadSurfaceLightmapCalls: [] as Array<{ textureIndex: number; smax: number; tmax: number }>,
  renderLightmappedPolyChainCalls: [] as Array<{ textureIndex: number }>,
  renderBrushPolyCalls: 0
};
const cvarRuntime = createCvarRuntime();

assert.equal(GL_LIGHTMAP_FORMAT, "GL_RGBA", "GL_LIGHTMAP_FORMAT macro parity mismatch");

const runtime = createGlRsurfRuntime({
  setCacheState: () => {
    hookLog.setCacheStateCalls += 1;
  },
  buildLightMap: (_surface, dest, _stride) => {
    hookLog.buildLightMapCalls += 1;
    if (dest.length > 0) {
      dest[0] = 255;
    }
  },
  uploadLightmapBlock: (_dynamic, textureIndex) => {
    hookLog.uploadLightmapBlockCalls.push({ dynamic: _dynamic, textureIndex });
  },
  uploadSurfaceLightmap: (_surface, textureIndex, smax, tmax) => {
    hookLog.uploadSurfaceLightmapCalls.push({ textureIndex, smax, tmax });
  },
  renderBrushPoly: () => {
    hookLog.renderBrushPolyCalls += 1;
  },
  renderLightmappedPolyChain: (_surface, _image, lightmapTextureIndex) => {
    hookLog.renderLightmappedPolyChainCalls.push({ textureIndex: lightmapTextureIndex });
  },
  renderLightmapChainSurface: (_surface, textureIndex, sOffset, tOffset) => {
    hookLog.renderLightmapChainSurfaceCalls.push({ textureIndex, sOffset, tOffset });
  }
});

const glExtMultitexture = Cvar_Get(cvarRuntime, "gl_ext_multitexture", "1", 0)!;
syncRsurfMultitextureFromRmain(runtime, {
  gl_ext_multitexture: glExtMultitexture,
  qglMTexCoord2fSGIS: true,
  qglSelectTextureSGIS: false
} as never);
assert.equal(runtime.multitextureEnabled, false, "syncRsurfMultitextureFromRmain partial proc mismatch");
syncRsurfMultitextureFromRmain(runtime, {
  gl_ext_multitexture: glExtMultitexture,
  qglMTexCoord2fSGIS: true,
  qglSelectTextureSGIS: true
} as never);
assert.equal(runtime.multitextureEnabled, true, "syncRsurfMultitextureFromRmain complete proc mismatch");

const texA = createMTexinfo();
const texB = createMTexinfo();
const texC = createMTexinfo();
texA.image = { name: "a" } as never;
texB.image = { name: "b" } as never;
texC.image = { name: "c" } as never;
texA.numframes = 3;
texA.next = texB;
texB.next = texC;
setCurrentEntity(runtime, { frame: 4 });
assert.equal((R_TextureAnimation(runtime, texA) as { name?: string } | null)?.name, "b", "R_TextureAnimation mismatch");

LM_InitBlock(runtime);
const firstAlloc = LM_AllocBlock(runtime, 8, 8);
const secondAlloc = LM_AllocBlock(runtime, 8, 8);
assert.deepEqual(firstAlloc, { x: 0, y: 0 }, "LM_AllocBlock first slot mismatch");
assert.deepEqual(secondAlloc, { x: 8, y: 0 }, "LM_AllocBlock second slot mismatch");
LM_UploadBlock(runtime, true);
assert.deepEqual(
  hookLog.uploadLightmapBlockCalls.at(-1),
  { dynamic: true, textureIndex: 0 },
  "LM_UploadBlock dynamic texture index mismatch"
);

const skySurface = createMSurface();
skySurface.flags = SURF_DRAWSKY;
skySurface.extents = [16, 16];
GL_CreateSurfaceLightmap(runtime, skySurface);
assert.equal(hookLog.setCacheStateCalls, 0, "GL_CreateSurfaceLightmap sky skip mismatch");

const turbSurface = createMSurface();
turbSurface.flags = SURF_DRAWTURB;
turbSurface.extents = [16, 16];
GL_CreateSurfaceLightmap(runtime, turbSurface);
assert.equal(hookLog.buildLightMapCalls, 0, "GL_CreateSurfaceLightmap turb skip mismatch");

const litSurface = createMSurface();
litSurface.extents = [16, 16];
litSurface.styles = [0, 255, 255, 255];
litSurface.texinfo = createMTexinfo();
litSurface.texinfo.image = { width: 64, height: 64 } as never;
GL_CreateSurfaceLightmap(runtime, litSurface);
assert.equal(litSurface.lightmaptexturenum, 1, "GL_CreateSurfaceLightmap texture index mismatch");
assert.equal(hookLog.setCacheStateCalls, 1, "GL_CreateSurfaceLightmap cache call mismatch");
assert.equal(hookLog.buildLightMapCalls, 1, "GL_CreateSurfaceLightmap build call mismatch");

const dynamicSurface = createMSurface();
dynamicSurface.texinfo = createMTexinfo();
dynamicSurface.texinfo.image = { name: "dynamic", width: 64, height: 64 } as never;
dynamicSurface.extents = [16, 16];
dynamicSurface.styles = [0, 255, 255, 255];
dynamicSurface.cached_light = [1, 0, 0, 0];
dynamicSurface.lightmaptexturenum = 3;
dynamicSurface.light_s = 4;
dynamicSurface.light_t = 5;
setDynamicLightmapsEnabled(runtime, true);
setFrameCount(runtime, 9);
setLightstyles(runtime, [{ white: 3 }]);
hookLog.uploadSurfaceLightmapCalls.length = 0;
R_RenderBrushPoly(runtime, dynamicSurface);
assert.equal(hookLog.renderBrushPolyCalls, 1, "R_RenderBrushPoly base render hook mismatch");
assert.deepEqual(
  hookLog.uploadSurfaceLightmapCalls.at(-1),
  { textureIndex: 3, smax: 2, tmax: 2 },
  "R_RenderBrushPoly dynamic static-texture update mismatch"
);
assert.equal(runtime.gl_lms.lightmap_surfaces[3], dynamicSurface, "R_RenderBrushPoly dynamic static chain mismatch");

const dynamicFrameSurface = createMSurface();
dynamicFrameSurface.texinfo = createMTexinfo();
dynamicFrameSurface.texinfo.image = { name: "dynamic-frame", width: 64, height: 64 } as never;
dynamicFrameSurface.extents = [16, 16];
dynamicFrameSurface.styles = [0, 255, 255, 255];
dynamicFrameSurface.cached_light = [3, 0, 0, 0];
dynamicFrameSurface.lightmaptexturenum = 4;
dynamicFrameSurface.dlightframe = 9;
R_RenderBrushPoly(runtime, dynamicFrameSurface);
assert.equal(runtime.gl_lms.lightmap_surfaces[0], dynamicFrameSurface, "R_RenderBrushPoly dynamic block chain mismatch");

hookLog.uploadSurfaceLightmapCalls.length = 0;
hookLog.renderLightmappedPolyChainCalls.length = 0;
GL_RenderLightmappedPoly(runtime, dynamicFrameSurface);
assert.deepEqual(
  hookLog.uploadSurfaceLightmapCalls.at(-1),
  { textureIndex: 0, smax: 2, tmax: 2 },
  "GL_RenderLightmappedPoly current-frame dlight upload texture mismatch"
);
assert.deepEqual(
  hookLog.renderLightmappedPolyChainCalls.at(-1),
  { textureIndex: 0 },
  "GL_RenderLightmappedPoly current-frame dlight render texture mismatch"
);

const model = createModel();
model.vertexes = [
  { position: [0, 0, 0] },
  { position: [16, 0, 0] },
  { position: [0, 16, 0] }
];
model.edges = [createMEdge(), createMEdge(), createMEdge(), createMEdge()];
model.edges[1]!.v = [0, 1];
model.edges[2]!.v = [1, 2];
model.edges[3]!.v = [2, 0];
model.surfedges = [1, 2, 3];

const polySurface = createMSurface();
polySurface.firstedge = 0;
polySurface.numedges = 3;
polySurface.texinfo = createMTexinfo();
polySurface.texinfo.image = { width: 64, height: 64 } as never;
polySurface.texinfo.vecs = [
  [1, 0, 0, 0],
  [0, 1, 0, 0]
];
polySurface.texturemins = [0, 0];
polySurface.extents = [16, 16];
polySurface.light_s = 0;
polySurface.light_t = 0;
setCurrentModel(runtime, model);
const poly = GL_BuildPolygonFromSurface(runtime, polySurface);
assert.equal(poly.numverts, 3, "GL_BuildPolygonFromSurface vertex count mismatch");
assert.equal(polySurface.polys === poly, true, "GL_BuildPolygonFromSurface surface bind mismatch");
assert.equal(poly.verts[1]?.[3], 0.25, "GL_BuildPolygonFromSurface base UV mismatch");

const blendWorld = createModel();
blendWorld.lightdata = new Uint8Array([1]);
const blendSurface = createMSurface();
blendSurface.polys = {
  next: null,
  chain: null,
  numverts: 3,
  flags: 0,
  verts: [
    [0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0]
  ]
};
runtime.gl_lms.lightmap_surfaces[1] = blendSurface;
setWorldModel(runtime, blendWorld);
setCurrentModel(runtime, blendWorld);

setFullbrightEnabled(runtime, true);
R_BlendLightmaps(runtime);
assert.equal(hookLog.renderLightmapChainSurfaceCalls.length, 0, "R_BlendLightmaps fullbright short-circuit mismatch");

setFullbrightEnabled(runtime, false);
R_BlendLightmaps(runtime);
assert.equal(hookLog.renderLightmapChainSurfaceCalls.length, 1, "R_BlendLightmaps static chain mismatch");
assert.deepEqual(
  hookLog.renderLightmapChainSurfaceCalls.at(-1),
  { textureIndex: 1, sOffset: 0, tOffset: 0 },
  "R_BlendLightmaps static lightmap offset mismatch"
);

runtime.gl_lms.lightmap_surfaces.fill(null);
hookLog.renderLightmapChainSurfaceCalls.length = 0;
const dynamicBlendSurface = createMSurface();
dynamicBlendSurface.polys = blendSurface.polys;
dynamicBlendSurface.extents = [16, 16];
dynamicBlendSurface.light_s = 12;
dynamicBlendSurface.light_t = 20;
runtime.gl_lms.lightmap_surfaces[0] = dynamicBlendSurface;
R_BlendLightmaps(runtime);
assert.deepEqual(
  hookLog.renderLightmapChainSurfaceCalls.at(-1),
  { textureIndex: 0, sOffset: 12 / 128, tOffset: 20 / 128 },
  "R_BlendLightmaps dynamic lightmap offset mismatch"
);

console.log("quake2-gl-rsurf: ok");
