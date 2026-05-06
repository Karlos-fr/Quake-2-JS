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
  DrawGLFlowingPoly,
  DrawGLPoly,
  DrawGLWaterPoly,
  DrawGLWaterPolyLightmap,
  DrawTextureChains,
  GL_BuildPolygonFromSurface,
  GL_CreateSurfaceLightmap,
  GL_LIGHTMAP_FORMAT,
  GL_RenderLightmappedPoly,
  LM_AllocBlock,
  LM_InitBlock,
  LM_UploadBlock,
  R_BlendLightmaps,
  R_DrawBrushModel,
  R_DrawInlineBModel,
  R_DrawWorld,
  R_MarkLeaves,
  R_RenderBrushPoly,
  R_RecursiveWorldNode,
  R_TextureAnimation,
  createGlRsurfRuntime,
  setCurrentModel,
  setCurrentEntity,
  setCurrentTime,
  setDynamicLightmapsEnabled,
  setFullbrightEnabled,
  setFrameCount,
  setLightstyles,
  setMultitextureEnabled,
  setRefdefState,
  setShowTriangleOutlines,
  setViewClusters,
  setViewOrigin,
  setWorldDrawFlags,
  syncRsurfMultitextureFromRmain,
  setWorldModel
} from "../../packages/renderer-three/src/index.js";
import { createCvarRuntime, Cvar_Get } from "../../packages/qcommon/src/cvar.js";
import { RDF_NOWORLDMODEL } from "../../packages/qcommon/src/index.js";
import { PLANE_X, SURF_SKY, SURF_TRANS33 } from "../../packages/formats/src/index.js";
import {
  SURF_DRAWSKY,
  SURF_DRAWTURB,
  SURF_PLANEBACK,
  createMEdge,
  createMLeaf,
  createMNode,
  createMSurface,
  createMTexinfo,
  createModel
} from "../../packages/renderer-three/src/gl-model.js";

const hookLog = {
  setCacheStateCalls: 0,
  buildLightMapCalls: 0,
  renderLightmapChainSurfaceCalls: [] as Array<{ textureIndex: number; sOffset: number; tOffset: number }>,
  uploadLightmapBlockCalls: [] as Array<{ dynamic: boolean; textureIndex: number }>,
  uploadSurfaceLightmapCalls: [] as Array<{ textureIndex: number; smax: number; tmax: number }>,
  renderLightmappedPolyChainCalls: [] as Array<{ textureIndex: number }>,
  renderBrushPolyCalls: 0,
  renderFlowingPolyCalls: [] as number[],
  renderWaterPolyCalls: 0,
  suspendMultitextureCalls: 0,
  resumeMultitextureCalls: 0,
  markBrushModelLightsCalls: 0,
  cullBoxCalls: [] as Array<{ mins: readonly number[]; maxs: readonly number[] }>,
  addSkySurfaceCalls: 0,
  clearSkyBoxCalls: 0,
  drawSkyBoxCalls: 0,
  renderTriangleOutlineCalls: 0,
  beginWorldMultitextureCalls: 0,
  endWorldMultitextureCalls: 0,
  beginBrushModelDrawCalls: [] as Array<{ rotated: boolean }>,
  beginBrushModelMultitextureCalls: 0,
  endBrushModelMultitextureCalls: 0
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
  renderFlowingPoly: (_surface, _image, scroll) => {
    hookLog.renderFlowingPolyCalls.push(scroll);
  },
  renderWaterPoly: () => {
    hookLog.renderWaterPolyCalls += 1;
  },
  renderLightmappedPolyChain: (_surface, _image, lightmapTextureIndex) => {
    hookLog.renderLightmappedPolyChainCalls.push({ textureIndex: lightmapTextureIndex });
  },
  renderLightmapChainSurface: (_surface, textureIndex, sOffset, tOffset) => {
    hookLog.renderLightmapChainSurfaceCalls.push({ textureIndex, sOffset, tOffset });
  },
  suspendMultitexture: () => {
    hookLog.suspendMultitextureCalls += 1;
  },
  resumeMultitexture: () => {
    hookLog.resumeMultitextureCalls += 1;
  },
  markBrushModelLights: () => {
    hookLog.markBrushModelLightsCalls += 1;
  },
  cullBox: (mins, maxs) => {
    hookLog.cullBoxCalls.push({ mins: [...mins], maxs: [...maxs] });
    return false;
  },
  addSkySurface: () => {
    hookLog.addSkySurfaceCalls += 1;
  },
  clearSkyBox: () => {
    hookLog.clearSkyBoxCalls += 1;
  },
  drawSkyBox: () => {
    hookLog.drawSkyBoxCalls += 1;
  },
  renderTriangleOutline: () => {
    hookLog.renderTriangleOutlineCalls += 1;
  },
  beginWorldMultitexture: () => {
    hookLog.beginWorldMultitextureCalls += 1;
  },
  endWorldMultitexture: () => {
    hookLog.endWorldMultitextureCalls += 1;
  },
  beginBrushModelDraw: (_entity, _model, rotated) => {
    hookLog.beginBrushModelDrawCalls.push({ rotated });
  },
  beginBrushModelMultitexture: () => {
    hookLog.beginBrushModelMultitextureCalls += 1;
  },
  endBrushModelMultitexture: () => {
    hookLog.endBrushModelMultitextureCalls += 1;
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
hookLog.renderBrushPolyCalls = 0;
DrawGLPoly(runtime, dynamicSurface, dynamicSurface.texinfo.image);
assert.equal(hookLog.renderBrushPolyCalls, 1, "DrawGLPoly base render hook mismatch");
R_RenderBrushPoly(runtime, dynamicSurface);
assert.equal(hookLog.renderBrushPolyCalls, 2, "R_RenderBrushPoly base render hook mismatch");
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

const flowingSurface = createMSurface();
flowingSurface.texinfo = createMTexinfo();
flowingSurface.texinfo.flags = 0x40;
flowingSurface.texinfo.image = { name: "flowing", width: 64, height: 64 } as never;
setCurrentTime(runtime, 0);
DrawGLFlowingPoly(runtime, flowingSurface, flowingSurface.texinfo.image);
assert.equal(hookLog.renderFlowingPolyCalls.at(-1), -64, "DrawGLFlowingPoly zero-time scroll mismatch");
setCurrentTime(runtime, 20);
R_RenderBrushPoly(runtime, flowingSurface);
assert.equal(hookLog.renderFlowingPolyCalls.at(-1), -32, "R_RenderBrushPoly flowing scroll mismatch");

const waterSurface = createMSurface();
waterSurface.flags = SURF_DRAWTURB;
waterSurface.texinfo = createMTexinfo();
waterSurface.texinfo.image = { name: "water", width: 64, height: 64 } as never;
DrawGLWaterPoly(runtime, waterSurface, waterSurface.texinfo.image);
R_RenderBrushPoly(runtime, waterSurface);
assert.equal(hookLog.renderWaterPolyCalls, 2, "DrawGLWaterPoly/R_RenderBrushPoly water dispatch mismatch");
dynamicFrameSurface.polys = {
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
DrawGLWaterPolyLightmap(runtime, dynamicFrameSurface, 5);
assert.equal(hookLog.renderLightmapChainSurfaceCalls.at(-1)?.textureIndex, 5, "DrawGLWaterPolyLightmap dispatch mismatch");

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
runtime.gl_lms.lightmap_surfaces.fill(null);
runtime.gl_lms.lightmap_surfaces[1] = blendSurface;
setWorldModel(runtime, blendWorld);
setCurrentModel(runtime, blendWorld);
hookLog.renderLightmapChainSurfaceCalls.length = 0;

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

runtime.gl_lms.lightmap_surfaces.fill(null);
hookLog.renderLightmappedPolyChainCalls.length = 0;
hookLog.renderWaterPolyCalls = 0;
hookLog.suspendMultitextureCalls = 0;
hookLog.resumeMultitextureCalls = 0;
const chainStatic = createMSurface();
chainStatic.texinfo = createMTexinfo();
chainStatic.texinfo.image = { name: "chain-static", width: 64, height: 64 } as never;
chainStatic.extents = [16, 16];
chainStatic.styles = [255, 255, 255, 255];
chainStatic.lightmaptexturenum = 7;
const chainWater = createMSurface();
chainWater.flags = SURF_DRAWTURB;
chainWater.texinfo = createMTexinfo();
chainWater.texinfo.image = { name: "chain-water", width: 64, height: 64 } as never;
chainStatic.texturechain = chainWater;
const chainImage = { name: "chain", registration_sequence: 1, texturechain: chainStatic } as never;
setMultitextureEnabled(runtime, true);
DrawTextureChains(runtime, [chainImage]);
assert.deepEqual(
  hookLog.renderLightmappedPolyChainCalls.at(-1),
  { textureIndex: 7 },
  "DrawTextureChains multitexture non-turb pass mismatch"
);
assert.equal(hookLog.renderWaterPolyCalls, 1, "DrawTextureChains multitexture turb pass mismatch");
assert.equal(hookLog.suspendMultitextureCalls, 1, "DrawTextureChains suspend point mismatch");
assert.equal(hookLog.resumeMultitextureCalls, 1, "DrawTextureChains resume point mismatch");
assert.equal((chainImage as { texturechain?: unknown }).texturechain, null, "DrawTextureChains chain clear mismatch");

runtime.gl_lms.lightmap_surfaces.fill(null);
hookLog.renderBrushPolyCalls = 0;
hookLog.renderLightmappedPolyChainCalls.length = 0;
hookLog.markBrushModelLightsCalls = 0;
const inlineModel = createModel();
inlineModel.firstmodelsurface = 0;
inlineModel.nummodelsurfaces = 3;
const frontSurface = createMSurface();
frontSurface.texinfo = createMTexinfo();
frontSurface.texinfo.image = { name: "inline-front", width: 64, height: 64 } as never;
frontSurface.plane = { normal: [1, 0, 0], dist: 0, type: PLANE_X, signbits: 0, pad: [0, 0] };
frontSurface.flags = 0;
frontSurface.extents = [16, 16];
frontSurface.styles = [255, 255, 255, 255];
frontSurface.lightmaptexturenum = 8;
const backSurface = createMSurface();
backSurface.texinfo = createMTexinfo();
backSurface.texinfo.image = { name: "inline-back", width: 64, height: 64 } as never;
backSurface.plane = frontSurface.plane;
backSurface.flags = SURF_PLANEBACK;
const alphaInlineSurface = createMSurface();
alphaInlineSurface.texinfo = createMTexinfo();
alphaInlineSurface.texinfo.flags = SURF_TRANS33;
alphaInlineSurface.texinfo.image = { name: "inline-alpha", width: 64, height: 64 } as never;
alphaInlineSurface.plane = frontSurface.plane;
inlineModel.surfaces = [frontSurface, backSurface, alphaInlineSurface];
setCurrentModel(runtime, inlineModel);
setCurrentEntity(runtime, { frame: 0, flags: 0 });
runtime.modelorg = [4, 0, 0];
setMultitextureEnabled(runtime, true);
R_DrawInlineBModel(runtime);
assert.equal(hookLog.markBrushModelLightsCalls, 1, "R_DrawInlineBModel dynamic-light marking mismatch");
assert.equal(hookLog.renderLightmappedPolyChainCalls.length, 1, "R_DrawInlineBModel facing surface route mismatch");
assert.equal(runtime.r_alpha_surfaces, alphaInlineSurface, "R_DrawInlineBModel alpha chain mismatch");

runtime.r_alpha_surfaces = null;
hookLog.beginBrushModelDrawCalls.length = 0;
hookLog.beginBrushModelMultitextureCalls = 0;
hookLog.endBrushModelMultitextureCalls = 0;
setCurrentModel(runtime, inlineModel);
inlineModel.radius = 12;
inlineModel.mins = [-2, -3, -4];
inlineModel.maxs = [2, 3, 4];
setViewOrigin(runtime, [10, 5, 0]);
R_DrawBrushModel(runtime, { frame: 0, origin: [4, 5, 0], angles: [0, 90, 0], flags: 0 });
assert.equal(hookLog.beginBrushModelDrawCalls.at(-1)?.rotated, true, "R_DrawBrushModel rotated flag mismatch");
assert.deepEqual(hookLog.cullBoxCalls.at(-1), { mins: [-8, -7, -12], maxs: [16, 17, 12] }, "R_DrawBrushModel rotated bounds mismatch");
assert.ok(Math.abs(runtime.modelorg[1] + 6) < 0.00001, "R_DrawBrushModel rotated modelorg mismatch");
assert.equal(hookLog.beginBrushModelMultitextureCalls, 1, "R_DrawBrushModel multitexture begin mismatch");
assert.equal(hookLog.endBrushModelMultitextureCalls, 1, "R_DrawBrushModel multitexture end mismatch");

const world = createModel();
const worldNode = createMNode();
worldNode.visframe = 1;
worldNode.minmaxs = [-16, -16, -16, 16, 16, 16];
worldNode.plane = { normal: [1, 0, 0], dist: 0, type: PLANE_X, signbits: 0, pad: [0, 0] };
worldNode.firstsurface = 0;
worldNode.numsurfaces = 3;
const visibleLeaf = createMLeaf();
visibleLeaf.parent = worldNode;
visibleLeaf.visframe = 1;
visibleLeaf.area = 0;
const hiddenAreaLeaf = createMLeaf();
hiddenAreaLeaf.parent = worldNode;
hiddenAreaLeaf.visframe = 1;
hiddenAreaLeaf.area = 1;
worldNode.children = [visibleLeaf, hiddenAreaLeaf];
const skyWorldSurface = createMSurface();
skyWorldSurface.visframe = 2;
skyWorldSurface.flags = 0;
skyWorldSurface.texinfo = createMTexinfo();
skyWorldSurface.texinfo.flags = SURF_SKY;
skyWorldSurface.texinfo.image = { name: "world-sky", width: 64, height: 64 } as never;
const alphaWorldSurface = createMSurface();
alphaWorldSurface.visframe = 2;
alphaWorldSurface.flags = 0;
alphaWorldSurface.texinfo = createMTexinfo();
alphaWorldSurface.texinfo.flags = SURF_TRANS33;
alphaWorldSurface.texinfo.image = { name: "world-alpha", width: 64, height: 64 } as never;
const textureWorldSurface = createMSurface();
textureWorldSurface.visframe = 2;
textureWorldSurface.flags = 0;
textureWorldSurface.texinfo = createMTexinfo();
textureWorldSurface.texinfo.image = { name: "world-texture", registration_sequence: 1, texturechain: null, width: 64, height: 64 } as never;
textureWorldSurface.lightmaptexturenum = 9;
textureWorldSurface.polys = {
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
world.surfaces = [skyWorldSurface, alphaWorldSurface, textureWorldSurface];
visibleLeaf.firstmarksurface = [skyWorldSurface, alphaWorldSurface, textureWorldSurface];
visibleLeaf.nummarksurfaces = 3;
world.nodes = [worldNode];
world.numnodes = 1;
world.leafs = [visibleLeaf, hiddenAreaLeaf];
world.numleafs = 2;
world.vis = null;
world.lightdata = new Uint8Array([1]);
setWorldModel(runtime, world);
setViewOrigin(runtime, [4, 0, 0]);
setFrameCount(runtime, 2);
runtime.r_visframecount = 1;
setMultitextureEnabled(runtime, false);
setRefdefState(runtime, new Uint8Array([0b00000001]), 0);
hookLog.addSkySurfaceCalls = 0;
runtime.r_alpha_surfaces = null;
R_RecursiveWorldNode(runtime, worldNode);
assert.equal(hookLog.addSkySurfaceCalls, 1, "R_RecursiveWorldNode sky surface route mismatch");
assert.equal(runtime.r_alpha_surfaces, alphaWorldSurface, "R_RecursiveWorldNode alpha surface route mismatch");
assert.equal((textureWorldSurface.texinfo.image as { texturechain?: unknown }).texturechain, textureWorldSurface, "R_RecursiveWorldNode texture chain route mismatch");
(textureWorldSurface.texinfo.image as { texturechain?: unknown }).texturechain = null;

hookLog.clearSkyBoxCalls = 0;
hookLog.drawSkyBoxCalls = 0;
hookLog.renderTriangleOutlineCalls = 0;
hookLog.renderBrushPolyCalls = 0;
setWorldDrawFlags(runtime, { drawworld: true });
setRefdefState(runtime, null, RDF_NOWORLDMODEL);
R_DrawWorld(runtime, [textureWorldSurface.texinfo.image as never]);
assert.equal(hookLog.clearSkyBoxCalls, 0, "R_DrawWorld noworld short-circuit mismatch");

setRefdefState(runtime, null, 0);
setShowTriangleOutlines(runtime, true);
R_DrawWorld(runtime, [textureWorldSurface.texinfo.image as never]);
assert.equal(runtime.currentmodel, world, "R_DrawWorld currentmodel bind mismatch");
assert.deepEqual(runtime.modelorg, runtime.vieworg, "R_DrawWorld modelorg view copy mismatch");
assert.equal(runtime.currententity?.frame, Math.trunc(runtime.currentTime * 2), "R_DrawWorld texture-animation frame mismatch");
assert.equal(hookLog.clearSkyBoxCalls, 1, "R_DrawWorld clear sky mismatch");
assert.equal(hookLog.drawSkyBoxCalls, 1, "R_DrawWorld draw sky mismatch");
assert.equal(hookLog.renderTriangleOutlineCalls, 1, "R_DrawWorld triangle outline hook mismatch");

world.vis = { numclusters: 2, bitofs: [[0, 0], [0, 0]], raw: new Uint8Array([0b00000001]) } as never;
visibleLeaf.cluster = 0;
hiddenAreaLeaf.cluster = 1;
worldNode.visframe = 0;
visibleLeaf.visframe = 0;
hiddenAreaLeaf.visframe = 0;
runtime.r_oldviewcluster = -2;
runtime.r_oldviewcluster2 = -2;
runtime.r_visframecount = 7;
setWorldDrawFlags(runtime, { novis: true, lockpvs: false });
setViewClusters(runtime, 0, 0);
R_MarkLeaves(runtime);
assert.equal(worldNode.visframe, 8, "R_MarkLeaves novis node mark mismatch");
assert.equal(visibleLeaf.visframe, 8, "R_MarkLeaves novis leaf mark mismatch");
assert.equal(hiddenAreaLeaf.visframe, 8, "R_MarkLeaves novis all-leaf mark mismatch");

console.log("quake2-gl-rsurf: ok");
