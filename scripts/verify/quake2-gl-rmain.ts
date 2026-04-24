/**
 * File: quake2-gl-rmain.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_rmain.c` preserves frame setup, render orchestration, bootstrap, particles, stereo helpers and API export behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the closed renderer-main port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-rmain.ts
 * - packages/client/src/ref.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import { createEntity, createParticle, createRefDef, createRefImport } from "../../packages/client/src/ref.js";
import { createCvarRuntime, Cvar_Get } from "../../packages/qcommon/src/cvar.js";
import { RF_TRANSLUCENT } from "../../packages/qcommon/src/index.js";
import {
  createRefGlBootstrap,
  GetRefAPI,
  GL_BACK_LEFT,
  GL_DrawColoredStereoLinePair,
  GL_DrawParticles,
  GL_DrawStereoPattern,
  GL_RENDERER_INTERGRAPH,
  MYgluPerspective,
  R_BeginFrame,
  R_Clear,
  R_CullBox,
  R_DrawBeam,
  R_DrawEntitiesOnList,
  R_Init,
  R_DrawNullModel,
  R_DrawParticles,
  R_Register,
  R_SetMode,
  R_Shutdown,
  R_PolyBlend,
  R_RenderFrame,
  R_DrawSpriteModel,
  R_RenderView,
  R_SetGL2D,
  R_SetFrustum,
  R_SetLightLevel,
  R_SetPalette,
  R_SetupFrame,
  SignbitsForPlane,
  V_AddBlend,
  QGL_REQUIRED_PROCEDURES,
  QWGL_WIN32_PROCEDURES,
  createObjectQglProvider,
  setRmainCvars,
  setRmainPaletteTable,
  setRmainParticleTexture,
  setRmainVid,
  setRmainWorldModel
} from "../../packages/renderer-three/src/index.js";
import { createModel, modtype_t } from "../../packages/renderer-three/src/gl-model.js";
import { rserr_t } from "../../packages/renderer-three/src/gl-local.js";
import type { dsprite_t } from "../../packages/formats/src/index.js";

const cvarRuntime = createCvarRuntime();
const runtimeLog: string[] = [];
const removeCommands: string[] = [];
let clearCall: Record<string, unknown> | null = null;
let viewportCall: Record<string, unknown> | null = null;
let projectionCall: Record<string, unknown> | null = null;
let modelViewCalled = false;
let paletteCall: Uint32Array | null = null;
let beamCall: { color: [number, number, number]; count: number } | null = null;
let gl2dCall: Record<string, unknown> | null = null;
let drawBufferCall: string | null = null;
const depthMaskChanges: boolean[] = [];
let spriteCall: { alpha: number; vertexCount: number; texture: unknown } | null = null;
let spriteDrawCount = 0;
let nullModelCall: { shadelight: [number, number, number]; topFanCount: number; bottomFanCount: number } | null = null;
let particleTrianglesCall: { texture: unknown; triangleCount: number; alpha: number } | null = null;
let pointParticlesCall: { count: number; size: number } | null = null;
let stereoPatternCall: { frames: number; lines: number } | null = null;
let qglInitDriver: string | null = null;
let glimpInitCalled = false;
let glimpBeginFrameArg: number | null = null;
let glimpEndFrameCalled = false;
let glimpShutdownCalled = false;
let glimpAppActivateArg: boolean | null = null;
const resolvedBackendProcedures: string[] = [];
const qglBindings: Record<string, unknown> = {};
const qwglBindings: Record<string, unknown> = {};
let turbulenceScale = 1;

for (const name of QGL_REQUIRED_PROCEDURES) {
  qglBindings[name] = () => undefined;
}
qglBindings.qglGetString = (name: number) => {
  switch (name) {
    case 0x1f00:
      return "TestVendor";
    case 0x1f01:
      return "Voodoo";
    case 0x1f02:
      return "1.0";
    case 0x1f03:
      return "GL_EXT_compiled_vertex_array WGL_EXT_swap_control GL_EXT_point_parameters GL_EXT_paletted_texture GL_EXT_shared_texture_palette GL_SGIS_multitexture";
    default:
      return "";
  }
};
qglBindings.qglGetError = () => 0x0501;
for (const name of [
  "qglLockArraysEXT",
  "qglUnlockArraysEXT",
  "qglPointParameterfEXT",
  "qglPointParameterfvEXT",
  "qglColorTableEXT",
  "qglMTexCoord2fSGIS",
  "qglSelectTextureSGIS"
] as const) {
  qglBindings[name] = () => undefined;
}
for (const name of QWGL_WIN32_PROCEDURES) {
  qwglBindings[name] = () => undefined;
}
qwglBindings.qwglGetProcAddress = (name: string) => {
  resolvedBackendProcedures.push(name);
  return () => undefined;
};

const { runtime, qglRuntime, qwglRuntime } = createRefGlBootstrap({
  createQglProvider: (driver) => {
    qglInitDriver = driver;
    return createObjectQglProvider(qglBindings);
  },
  createQwglProvider: () => createObjectQglProvider(qwglBindings),
  hooks: {
  pointInLeaf: (point) => ({
    cluster: point[2] < 0 ? 2 : 1,
    contents: point[2] < 0 ? 0 : 1
  }),
  onNoworldModelClear: (viewport) => {
    runtimeLog.push(`noworld:${viewport.width}x${viewport.height}`);
  },
  onViewportSetup: (viewport) => {
    viewportCall = viewport;
  },
  onProjectionSetup: (projection) => {
    projectionCall = projection;
  },
  onModelViewSetup: () => {
    modelViewCalled = true;
  },
  onSetGL2D: (viewport) => {
    gl2dCall = viewport;
  },
  onClear: (options) => {
    clearCall = options;
  },
  onSetTexturePalette: (palette) => {
    paletteCall = palette;
  },
  onSetDrawBuffer: (buffer) => {
    drawBufferCall = buffer;
  },
  onDepthMaskChange: (enabled) => {
    depthMaskChanges.push(enabled);
  },
  onDrawBeam: (_entity, color, segments) => {
    beamCall = { color, count: segments.length };
  },
  onDrawSpriteModel: (_entity, texture, alpha, vertices) => {
    spriteDrawCount += 1;
    spriteCall = { alpha, vertexCount: vertices.length, texture };
  },
  onDrawNullModel: (_entity, shadelight, topFan, bottomFan) => {
    nullModelCall = {
      shadelight: [...shadelight] as [number, number, number],
      topFanCount: topFan.length,
      bottomFanCount: bottomFan.length
    };
  },
  onDrawParticles: (texture, triangles) => {
    particleTrianglesCall = {
      texture,
      triangleCount: triangles.length,
      alpha: triangles[0]?.color[3] ?? 0
    };
  },
  onDrawPointParticles: (particles) => {
    pointParticlesCall = {
      count: particles.length,
      size: particles[0]?.size ?? 0
    };
  },
  onDrawStereoPattern: (pattern) => {
    stereoPatternCall = {
      frames: pattern.frames.length,
      lines: pattern.frames[0]?.length ?? 0
    };
  },
  lightPoint: () => [0.25, 0.5, 0.75],
  pushDlights: () => runtimeLog.push("pushDlights"),
  markLeaves: () => runtimeLog.push("markLeaves"),
  drawWorld: () => runtimeLog.push("drawWorld"),
  renderDlights: () => runtimeLog.push("renderDlights"),
  drawParticles: () => runtimeLog.push("drawParticles"),
  drawAlphaSurfaces: () => runtimeLog.push("drawAlphaSurfaces"),
  polyBlend: () => runtimeLog.push("polyBlend"),
  print: (_level, message) => runtimeLog.push(message.trimEnd()),
  enableLogging: (enabled) => runtimeLog.push(`enableLogging:${enabled}`),
  logNewFrame: () => runtimeLog.push("logNewFrame"),
  updateSwapInterval: () => runtimeLog.push("updateSwapInterval"),
  textureMode: (mode) => runtimeLog.push(`textureMode:${mode}`),
  textureAlphaMode: (mode) => runtimeLog.push(`textureAlphaMode:${mode}`),
  textureSolidMode: (mode) => runtimeLog.push(`textureSolidMode:${mode}`),
  scaleTurbulence: (scale) => {
    turbulenceScale = scale;
  },
  glimpInit: () => {
    glimpInitCalled = true;
    return true;
  },
  glimpBeginFrame: (cameraSeparation) => {
    glimpBeginFrameArg = cameraSeparation;
  },
  glimpEndFrame: () => {
    glimpEndFrameCalled = true;
  },
  glimpAppActivate: (activate) => {
    glimpAppActivateArg = activate;
  },
  glimpShutdown: () => {
    glimpShutdownCalled = true;
  },
  glimpSetMode: (_width, _height, mode, fullscreen) => ({
    err: (mode === 99 && fullscreen) ? rserr_t.rserr_invalid_fullscreen : (mode === 98 ? rserr_t.rserr_invalid_mode : rserr_t.rserr_ok),
    width: 1024,
    height: 768
  })
  }
});

setRmainVid(runtime, 800, 600);
setRmainWorldModel(runtime, createModel());
setRmainPaletteTable(runtime, Uint32Array.from({ length: 256 }, (_, index) => (((255 << 24) >>> 0) | (index << 16) | (index << 8) | index) >>> 0));

setRmainCvars(runtime, {
  r_norefresh: Cvar_Get(cvarRuntime, "r_norefresh", "0", 0),
  r_drawentities: Cvar_Get(cvarRuntime, "r_drawentities", "1", 0),
  r_speeds: Cvar_Get(cvarRuntime, "r_speeds", "1", 0),
  r_nocull: Cvar_Get(cvarRuntime, "r_nocull", "0", 0),
  gl_finish: Cvar_Get(cvarRuntime, "gl_finish", "0", 0),
  gl_clear: Cvar_Get(cvarRuntime, "gl_clear", "1", 0),
  gl_ztrick: Cvar_Get(cvarRuntime, "gl_ztrick", "0", 0),
  gl_polyblend: Cvar_Get(cvarRuntime, "gl_polyblend", "1", 0),
  gl_log: Cvar_Get(cvarRuntime, "gl_log", "0", 0),
  gl_drawbuffer: Cvar_Get(cvarRuntime, "gl_drawbuffer", "GL_BACK", 0),
  gl_texturemode: Cvar_Get(cvarRuntime, "gl_texturemode", "GL_LINEAR", 0),
  gl_texturealphamode: Cvar_Get(cvarRuntime, "gl_texturealphamode", "default", 0),
  gl_texturesolidmode: Cvar_Get(cvarRuntime, "gl_texturesolidmode", "default", 0),
  gl_swapinterval: Cvar_Get(cvarRuntime, "gl_swapinterval", "1", 0),
  gl_mode: Cvar_Get(cvarRuntime, "gl_mode", "3", 0),
  gl_ext_pointparameters: Cvar_Get(cvarRuntime, "gl_ext_pointparameters", "0", 0),
  gl_particle_size: Cvar_Get(cvarRuntime, "gl_particle_size", "40", 0),
  vid_fullscreen: Cvar_Get(cvarRuntime, "vid_fullscreen", "0", 0),
  vid_gamma: Cvar_Get(cvarRuntime, "vid_gamma", "1.0", 0),
  vid_ref: Cvar_Get(cvarRuntime, "vid_ref", "gl", 0),
  r_lightlevel: Cvar_Get(cvarRuntime, "r_lightlevel", "0", 0)
});

const seededCvars = [
  runtime.r_norefresh,
  runtime.r_drawentities,
  runtime.r_speeds,
  runtime.r_nocull,
  runtime.gl_finish,
  runtime.gl_clear,
  runtime.gl_ztrick,
  runtime.gl_polyblend,
  runtime.gl_log,
  runtime.gl_drawbuffer,
  runtime.gl_texturemode,
  runtime.gl_texturealphamode,
  runtime.gl_texturesolidmode,
  runtime.gl_swapinterval,
  runtime.gl_mode,
  runtime.gl_ext_pointparameters,
  runtime.gl_particle_size,
  runtime.vid_fullscreen,
  runtime.vid_gamma,
  runtime.vid_ref,
  runtime.r_lightlevel
];

const plane = runtime.frustum[0];
plane.normal = [-1, 2, -3];
assert.equal(SignbitsForPlane(plane), 0b101, "SignbitsForPlane mismatch");

const blend: [number, number, number, number] = [0, 0, 0, 0];
V_AddBlend(1, 0.5, 0.25, 0.4, blend);
assert.deepEqual(blend, [1, 0.5, 0.25, 0.4], "V_AddBlend initial mismatch");
V_AddBlend(0, 1, 0, 0.5, blend);
assert.equal(blend[3] > 0.69, true, "V_AddBlend alpha accumulation mismatch");

const projection = MYgluPerspective({ camera_separation: 2, stereo_enabled: false }, 90, 4 / 3, 4, 4096);
assert.equal(projection.zNear, 4, "MYgluPerspective zNear mismatch");
assert.equal(projection.xmin < projection.xmax, true, "MYgluPerspective bounds mismatch");

const refdef = createRefDef();
refdef.width = 400;
refdef.height = 300;
refdef.fov_x = 90;
refdef.fov_y = 75;
refdef.vieworg = [10, 20, 30];
refdef.viewangles = [15, 25, 35];
refdef.blend = [0.1, 0.2, 0.3, 0.4];

runtime.r_newrefdef = refdef;
R_SetupFrame(runtime);
assert.equal(runtime.r_framecount, 1, "R_SetupFrame framecount mismatch");
assert.deepEqual(runtime.r_origin, [10, 20, 30], "R_SetupFrame origin mismatch");
assert.equal(runtime.r_viewcluster, 1, "R_SetupFrame cluster mismatch");
assert.equal(runtime.r_viewcluster2, 1, "R_SetupFrame cluster2 mismatch");

R_SetFrustum(runtime);
assert.equal(runtime.frustum[0].dist !== 0, true, "R_SetFrustum dist mismatch");
assert.equal(runtime.frustum[0].signbits >= 0, true, "R_SetFrustum signbits mismatch");

runtime.frustum[0].normal = [1, 0, 0];
runtime.frustum[0].dist = 100;
runtime.frustum[0].type = 0;
runtime.frustum[1].normal = [0, 1, 0];
runtime.frustum[1].dist = 1000;
runtime.frustum[1].type = 1;
runtime.frustum[2].normal = [0, 0, 1];
runtime.frustum[2].dist = 1000;
runtime.frustum[2].type = 2;
runtime.frustum[3].normal = [1, 1, 1];
runtime.frustum[3].dist = 1000;
runtime.frustum[3].type = 5;
runtime.frustum[3].signbits = SignbitsForPlane(runtime.frustum[3]);
assert.equal(R_CullBox(runtime, [-10, -10, -10], [10, 10, 10]), true, "R_CullBox outside mismatch");
runtime.frustum[0].dist = -100;
runtime.frustum[1].dist = -100;
runtime.frustum[2].dist = -100;
runtime.frustum[3].dist = -1000;
assert.equal(R_CullBox(runtime, [120, 120, 120], [130, 130, 130]), false, "R_CullBox inside mismatch");

R_Clear(runtime);
assert.deepEqual(clearCall, {
  clearColor: true,
  clearDepth: true,
  gldepthmin: 0,
  gldepthmax: 1,
  depthFunc: "LEQUAL"
}, "R_Clear standard mismatch");

runtime.gl_ztrick!.value = 1;
R_Clear(runtime);
assert.equal((clearCall?.depthFunc), "LEQUAL", "R_Clear ztrick first mismatch");
R_Clear(runtime);
assert.equal((clearCall?.depthFunc), "GEQUAL", "R_Clear ztrick second mismatch");

runtimeLog.length = 0;
runtime.v_blend = [0.2, 0.3, 0.4, 0.5];
runtime.gl_polyblend!.value = 1;
R_PolyBlend(runtime);
assert.deepEqual(runtimeLog, ["polyBlend"], "R_PolyBlend mismatch");

R_SetGL2D(runtime);
assert.deepEqual(gl2dCall, { x: 0, y: 0, width: 800, height: 600 }, "R_SetGL2D mismatch");

const stereoPair = GL_DrawColoredStereoLinePair(runtime, 1, 0, 0, 4);
assert.deepEqual(stereoPair, [
  { color: [1, 0, 0], start: [0, 4], end: [800, 4] },
  { color: [0, 0, 0], start: [0, 5], end: [800, 5] }
], "GL_DrawColoredStereoLinePair mismatch");
assert.equal(GL_DrawStereoPattern(runtime), null, "GL_DrawStereoPattern should skip non-Intergraph renderers");
runtime.gl_renderer = GL_RENDERER_INTERGRAPH;
runtime.gl_state.stereo_enabled = true;
stereoPatternCall = null;
const stereoPattern = GL_DrawStereoPattern(runtime);
assert.equal(stereoPattern?.drawBuffer, GL_BACK_LEFT, "GL_DrawStereoPattern draw buffer mismatch");
assert.equal(stereoPattern?.frames.length, 20, "GL_DrawStereoPattern frame count mismatch");
assert.equal(stereoPattern?.frames[0]?.length, 16, "GL_DrawStereoPattern line count mismatch");
assert.deepEqual(stereoPattern?.frames[0]?.[8], { color: [0, 1, 0], start: [0, 8], end: [800, 8] }, "GL_DrawStereoPattern green line mismatch");
assert.deepEqual(stereoPatternCall, { frames: 20, lines: 16 }, "GL_DrawStereoPattern hook mismatch");
runtime.gl_renderer = 0;
runtime.gl_state.stereo_enabled = false;

R_SetPalette(runtime, null);
assert.equal(paletteCall?.length, 256, "R_SetPalette palette length mismatch");
assert.equal((paletteCall?.[3] >>> 24), 0xff, "R_SetPalette alpha mismatch");

const beamEntity = createEntity();
beamEntity.origin = [0, 0, 0];
beamEntity.oldorigin = [0, 0, 12];
beamEntity.frame = 8;
beamEntity.skinnum = 16;
beamEntity.alpha = 0.5;
R_DrawBeam(runtime, beamEntity);
assert.equal(beamCall?.count, 6, "R_DrawBeam segment count mismatch");
assert.equal((beamCall?.color[0] ?? 0) > 0, true, "R_DrawBeam color mismatch");

const spriteModel = createModel();
const spriteData: dsprite_t = {
  ident: 0,
  version: 2,
  numframes: 1,
  frames: [{
    width: 32,
    height: 48,
    origin_x: 8,
    origin_y: 12,
    name: "sprites/test.sp2"
  }]
};
spriteModel.type = modtype_t.mod_sprite;
spriteModel.extradata = spriteData;
spriteModel.skins = [{ name: "sprites/test.pcx" } as never];
runtime.currentmodel = spriteModel;
runtime.vup = [0, 0, 1];
runtime.vright = [1, 0, 0];
const spriteEntity = createEntity();
spriteEntity.origin = [4, 5, 6];
spriteEntity.frame = 0;
spriteEntity.alpha = 0.25;
spriteEntity.flags = RF_TRANSLUCENT;
R_DrawSpriteModel(runtime, spriteEntity);
assert.equal(spriteCall?.vertexCount, 4, "R_DrawSpriteModel vertex count mismatch");
assert.equal(spriteCall?.alpha, 0.25, "R_DrawSpriteModel alpha mismatch");
assert.equal(Boolean(spriteCall?.texture), true, "R_DrawSpriteModel texture mismatch");

const opaqueSpriteEntity = createEntity();
opaqueSpriteEntity.origin = [4, 5, 6];
opaqueSpriteEntity.frame = 0;
opaqueSpriteEntity.flags = 0;
opaqueSpriteEntity.model = spriteModel as never;
const translucentSpriteEntity = createEntity();
translucentSpriteEntity.origin = [4, 5, 6];
translucentSpriteEntity.frame = 0;
translucentSpriteEntity.alpha = 0.5;
translucentSpriteEntity.flags = RF_TRANSLUCENT;
translucentSpriteEntity.model = spriteModel as never;
const drawListRefdef = createRefDef();
drawListRefdef.num_entities = 2;
drawListRefdef.entities = [opaqueSpriteEntity, translucentSpriteEntity];
runtime.r_newrefdef = drawListRefdef;
depthMaskChanges.length = 0;
spriteDrawCount = 0;
R_DrawEntitiesOnList(runtime);
assert.deepEqual(depthMaskChanges, [false, true], "R_DrawEntitiesOnList depth-mask mismatch");
assert.equal(spriteDrawCount, 2, "R_DrawEntitiesOnList pass order mismatch");

const nullEntity = createEntity();
nullEntity.origin = [1, 2, 3];
R_DrawNullModel(runtime, nullEntity);
assert.deepEqual(nullModelCall?.shadelight, [0.25, 0.5, 0.75], "R_DrawNullModel shadelight mismatch");
assert.equal(nullModelCall?.topFanCount, 6, "R_DrawNullModel top fan mismatch");
assert.equal(nullModelCall?.bottomFanCount, 6, "R_DrawNullModel bottom fan mismatch");

runtime.r_origin = [0, 0, 0];
runtime.vpn = [0, 0, 1];
runtime.vup = [0, 1, 0];
runtime.vright = [1, 0, 0];
const triangleParticle = createParticle();
triangleParticle.origin = [10, 20, 40];
triangleParticle.color = 5;
triangleParticle.alpha = 0.6;
setRmainParticleTexture(runtime, { name: "particles/particle.pcx" } as never);
GL_DrawParticles(runtime, 1, [triangleParticle], runtime.d_8to24table);
assert.equal(particleTrianglesCall?.triangleCount, 1, "GL_DrawParticles triangle count mismatch");
assert.equal(particleTrianglesCall?.texture !== null, true, "GL_DrawParticles texture mismatch");
assert.equal(particleTrianglesCall?.alpha, 0.6, "GL_DrawParticles alpha mismatch");

const particleRefdef = createRefDef();
particleRefdef.num_particles = 1;
particleRefdef.particles = [triangleParticle];
runtime.r_newrefdef = particleRefdef;
runtime.gl_ext_pointparameters!.value = 0;
particleTrianglesCall = null;
R_DrawParticles(runtime);
assert.equal(particleTrianglesCall?.triangleCount, 1, "R_DrawParticles triangle fallback mismatch");

runtime.gl_ext_pointparameters!.value = 1;
runtime.qglPointParameterfEXT = true;
pointParticlesCall = null;
R_DrawParticles(runtime);
assert.equal(pointParticlesCall?.count, 1, "R_DrawParticles point count mismatch");
assert.equal(pointParticlesCall?.size, 40, "R_DrawParticles point size mismatch");

runtime.qglPointParameterfEXT = false;
particleTrianglesCall = null;
pointParticlesCall = null;
R_DrawParticles(runtime);
assert.equal(particleTrianglesCall?.triangleCount, 1, "R_DrawParticles should fall back when point-parameter proc is unavailable");
assert.equal(pointParticlesCall, null, "R_DrawParticles should not emit point particles without point-parameter proc");
runtime.qglPointParameterfEXT = true;

runtimeLog.length = 0;
runtime.gl_log!.modified = true;
runtime.gl_log!.value = 1;
runtime.gl_drawbuffer!.modified = true;
runtime.gl_drawbuffer!.string = "GL_FRONT";
runtime.gl_texturemode!.modified = true;
runtime.gl_texturealphamode!.modified = true;
runtime.gl_texturesolidmode!.modified = true;
R_BeginFrame(runtime, 0);
assert.deepEqual(runtimeLog.slice(0, 6), [
  "enableLogging:true",
  "logNewFrame",
  "textureMode:GL_LINEAR",
  "textureAlphaMode:default",
  "textureSolidMode:default",
  "updateSwapInterval"
], "R_BeginFrame control flow mismatch");
assert.equal(glimpBeginFrameArg, 0, "R_BeginFrame GLimp_BeginFrame mismatch");
assert.equal(drawBufferCall, "GL_FRONT", "R_BeginFrame draw buffer mismatch");
assert.equal(gl2dCall?.width, 800, "R_BeginFrame 2D viewport mismatch");

runtimeLog.length = 0;
runtime.gl_log!.modified = true;
runtime.gl_log!.value = 1;
runtime.gl_drawbuffer!.modified = true;
runtime.gl_drawbuffer!.string = "GL_FRONT";
runtime.gl_texturemode!.modified = true;
runtime.gl_texturealphamode!.modified = true;
runtime.gl_texturesolidmode!.modified = true;
R_BeginFrame(runtime, 0);
assert.deepEqual(runtimeLog.slice(0, 6), [
  "enableLogging:true",
  "logNewFrame",
  "textureMode:GL_LINEAR",
  "textureAlphaMode:default",
  "textureSolidMode:default",
  "updateSwapInterval"
], "R_BeginFrame control flow mismatch");
assert.equal(glimpBeginFrameArg, 0, "R_BeginFrame GLimp_BeginFrame mismatch");
assert.equal(drawBufferCall, "GL_FRONT", "R_BeginFrame draw buffer mismatch");
assert.equal(gl2dCall?.width, 800, "R_BeginFrame 2D viewport mismatch");

runtimeLog.length = 0;
runtime.gl_ztrick!.value = 0;
const fullRenderRefdef = createRefDef();
fullRenderRefdef.width = 320;
fullRenderRefdef.height = 200;
fullRenderRefdef.fov_x = 90;
fullRenderRefdef.fov_y = 75;
fullRenderRefdef.vieworg = [1, 2, 3];
fullRenderRefdef.viewangles = [4, 5, 6];
runtime.r_newrefdef = fullRenderRefdef;
R_SetLightLevel(runtime);
assert.equal(runtime.r_lightlevel!.value, 112.5, "R_SetLightLevel mismatch");
R_RenderView(runtime, fullRenderRefdef);
assert.deepEqual(runtimeLog.slice(0, 6), [
  "pushDlights",
  "markLeaves",
  "drawWorld",
  "renderDlights",
  "drawParticles",
  "drawAlphaSurfaces"
], "R_RenderView order mismatch");
assert.equal(runtimeLog.at(-1)?.includes("wpoly"), true, "R_RenderView speeds mismatch");
assert.equal(Boolean(viewportCall), true, "R_SetupGL viewport hook mismatch");
assert.equal(Boolean(projectionCall), true, "R_SetupGL projection hook mismatch");
assert.equal(modelViewCalled, true, "R_SetupGL modelview hook mismatch");

gl2dCall = null;
R_RenderFrame(runtime, fullRenderRefdef);
assert.equal(runtime.r_lightlevel!.value, 112.5, "R_RenderFrame lightlevel mismatch");
assert.equal(gl2dCall?.width, 800, "R_RenderFrame 2D reset mismatch");

const refImport = createRefImport();
const cvarByName = new Map<string, ReturnType<typeof Cvar_Get>>();
for (const cvar of seededCvars) {
  if (cvar) {
    cvarByName.set(cvar.name, cvar);
  }
}
refImport.Cvar_Get = (name, value, flags) => {
  const existing = cvarByName.get(name);
  if (existing) {
    return existing;
  }
  const created = Cvar_Get(cvarRuntime, name, value, flags);
  cvarByName.set(name, created);
  return created;
};
refImport.Cvar_SetValue = (name, value) => {
  const target = cvarByName.get(name);
  if (target) {
    target.value = value;
    target.string = String(value);
  }
};
refImport.Cvar_Set = (name, value) => {
  const target = cvarByName.get(name) ?? Cvar_Get(cvarRuntime, name, value, 0);
  target.string = value;
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    target.value = numeric;
  }
  cvarByName.set(name, target);
  return target;
};
refImport.Con_Printf = (_level, message) => {
  runtimeLog.push(message.trimEnd());
};
const addedCommands: string[] = [];
refImport.Cmd_AddCommand = (name) => {
  addedCommands.push(name);
};
refImport.Cmd_RemoveCommand = (name) => {
  removeCommands.push(name);
};

runtime.gl_ext_pointparameters!.value = 0;
runtime.gl_ext_pointparameters!.string = "0";

const initStatus = R_Init(runtime, refImport, null, null);
assert.equal(initStatus, 0, "R_Init status mismatch");
assert.equal(turbulenceScale, 0.5, "R_Init r_turbsin scale hook mismatch");
assert.equal(qglInitDriver, "opengl32", "R_Init qgl init driver mismatch");
assert.equal(glimpInitCalled, true, "R_Init glimp init mismatch");
assert.equal(runtime.qglLockArraysEXT, true, "R_Init compiled vertex array lock proc mismatch");
assert.equal(runtime.qglUnlockArraysEXT, true, "R_Init compiled vertex array unlock proc mismatch");
assert.equal(runtime.qwglSwapIntervalEXT, true, "R_Init swap control proc mismatch");
assert.equal(runtime.qglPointParameterfEXT, false, "R_Init point parameter proc should stay disabled when cvar is off");
assert.equal(runtime.qglPointParameterfvEXT, false, "R_Init point parameterfv proc should stay disabled when cvar is off");
assert.equal(runtime.qglColorTableEXT, true, "R_Init shared texture palette proc mismatch");
assert.equal(runtime.qglMTexCoord2fSGIS, true, "R_Init multitexture texcoord proc mismatch");
assert.equal(runtime.qglSelectTextureSGIS, true, "R_Init multitexture select proc mismatch");
assert.equal(cvarByName.get("scr_drawall")?.string, "0", "R_Init scr_drawall renderer mapping mismatch");
assert.equal(qglRuntime.initialized, true, "R_Init should initialize qgl runtime");
assert.equal(qwglRuntime.initialized, true, "R_Init should initialize qwgl runtime");
assert.equal(runtimeLog.includes("...enabling GL_EXT_compiled_vertex_array"), true, "R_Init compiled vertex array log mismatch");
assert.equal(runtimeLog.includes("...enabling WGL_EXT_swap_control"), true, "R_Init swap control log mismatch");
assert.equal(runtimeLog.includes("...ignoring GL_EXT_point_parameters"), true, "R_Init point parameters log mismatch");
assert.equal(runtimeLog.includes("...using GL_EXT_shared_texture_palette"), true, "R_Init shared texture palette log mismatch");
assert.equal(runtimeLog.includes("...using GL_SGIS_multitexture"), true, "R_Init multitexture log mismatch");
assert.equal(runtimeLog.includes("glGetError() = 0x501"), true, "R_Init glGetError bootstrap check mismatch");

R_Register(runtime, refImport);
assert.equal(addedCommands.includes("imagelist"), true, "R_Register imagelist command mismatch");
assert.equal(Boolean(runtime.gl_mode), true, "R_Register gl_mode cvar mismatch");
assert.equal(Boolean(runtime.r_drawentities), true, "R_Register r_drawentities cvar mismatch");

runtime.gl_allow_cds = false;
if (runtime.vid_fullscreen) {
  runtime.vid_fullscreen.modified = true;
  runtime.vid_fullscreen.value = 1;
}
if (runtime.gl_mode) {
  runtime.gl_mode.value = 99;
}
assert.equal(R_SetMode(runtime, refImport), true, "R_SetMode fullscreen fallback mismatch");
if (runtime.gl_mode) {
  runtime.gl_mode.value = 98;
}
assert.equal(R_SetMode(runtime, refImport), true, "R_SetMode safe fallback mismatch");

let swapInitCalled = false;
let endFrameCalled = false;
let appActivateArg: boolean | null = null;
const api = GetRefAPI(runtime, refImport, {
  beginRegistration: () => runtimeLog.push("beginRegistration"),
  registerModel: () => null,
  registerSkin: () => null,
  registerPic: () => null,
  setSky: () => runtimeLog.push("setSky"),
  endRegistration: () => runtimeLog.push("endRegistration"),
  drawGetPicSize: () => ({ width: 64, height: 32 }),
  drawPic: () => runtimeLog.push("drawPic"),
  drawStretchPic: () => runtimeLog.push("drawStretchPic"),
  drawChar: () => runtimeLog.push("drawChar"),
  drawTileClear: () => runtimeLog.push("drawTileClear"),
  drawFill: () => runtimeLog.push("drawFill"),
  drawFadeScreen: () => runtimeLog.push("drawFadeScreen"),
  drawStretchRaw: () => runtimeLog.push("drawStretchRaw"),
  endFrame: () => {
    endFrameCalled = true;
  },
  appActivate: (activate) => {
    appActivateArg = activate;
  },
  swapInit: () => {
    swapInitCalled = true;
  }
});
assert.equal(api.api_version > 0, true, "GetRefAPI api version mismatch");
assert.equal(swapInitCalled, true, "GetRefAPI swap init mismatch");
assert.equal(api.Init(null, null), true, "GetRefAPI Init mismatch");
assert.deepEqual(api.DrawGetPicSize("pics/test"), { width: 64, height: 32 }, "GetRefAPI DrawGetPicSize mismatch");
api.DrawPic(0, 0, "pics/test");
api.EndFrame();
api.AppActivate(true);
assert.equal(endFrameCalled, true, "GetRefAPI EndFrame mismatch");
assert.equal(appActivateArg, true, "GetRefAPI AppActivate mismatch");
assert.equal(glimpEndFrameCalled, true, "GetRefAPI GLimp_EndFrame mismatch");
assert.equal(glimpAppActivateArg, true, "GetRefAPI GLimp_AppActivate mismatch");

R_Shutdown(runtime, refImport);
assert.deepEqual(removeCommands, ["modellist", "screenshot", "imagelist", "gl_strings"], "R_Shutdown command cleanup mismatch");
assert.equal(glimpShutdownCalled, true, "R_Shutdown glimp shutdown mismatch");
assert.equal(qglRuntime.initialized, false, "R_Shutdown should shut down qgl runtime");
assert.equal(qwglRuntime.initialized, false, "R_Shutdown should shut down qwgl runtime");
assert.equal(runtime.gl_state.camera_separation, 0, "R_Shutdown camera separation reset mismatch");
assert.equal(runtime.gl_state.stereo_enabled, false, "R_Shutdown stereo reset mismatch");
assert.equal(runtime.gl_state.current_draw_buffer, null, "R_Shutdown draw buffer reset mismatch");
assert.equal(runtime.qglLockArraysEXT, false, "R_Shutdown compiled vertex array reset mismatch");
assert.equal(runtime.ri, null, "R_Shutdown refimport reset mismatch");

console.log("quake2-gl-rmain: ok");
