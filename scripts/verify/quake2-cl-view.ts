/**
 * File: quake2-cl-view.ts
 * Purpose: Verify the `client/cl_view.c` port centered on `packages/client/src/view.ts`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for refresh preparation and renderer-neutral view assembly.
 *
 * Dependencies:
 * - packages/client/src/view.ts
 * - packages/client/src/client.ts
 * - packages/client/src/ref.ts
 * - packages/client/src/console.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/cvar.ts
 */

import { strict as assert } from "node:assert";

import {
  CL_BuildRefreshFrame,
  CL_CalcViewValues,
  CL_GetRefreshEntitySoundOrigin,
  CL_PrepRefresh,
  CalcFov,
  V_AddEntity,
  V_AddLight,
  V_AddLightStyle,
  V_AddParticle,
  V_ClearScene,
  V_RenderView,
  V_TestEntities,
  V_TestLights,
  V_TestParticles,
  createClientRuntime,
  createClientViewContext,
  createClientViewScene,
  connstate_t
} from "../../packages/client/src/index.js";
import { createConsoleState } from "../../packages/client/src/console.js";
import { createCommandRuntime } from "../../packages/qcommon/src/cmd.js";
import { createCvarRuntime } from "../../packages/qcommon/src/cvar.js";
import { MAX_DLIGHTS, MAX_ENTITIES, MAX_PARTICLES, createEntity, createRefExport } from "../../packages/client/src/ref.js";
import { CS_CDTRACK, CS_IMAGES, CS_MODELS, CS_PLAYERSKINS, CS_SKY, CS_SKYAXIS, CS_SKYROTATE, pmtype_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifySceneStagingHelpersMirrorClView();
  verifyPrepRefreshRegistersLevelAssets();
  verifyCalcViewValuesInterpolatesWeaponRelevantMotion();
  verifyCalcViewValuesMatchesDroppedFrameAndTeleportFallbacks();
  verifyBuildRefreshFrameActiveGuardAndSoundOrigin();
  verifyRenderViewResolvesDefaultEntityModelsAndSkins();
  verifyRenderViewAppliesViewWeaponDebugOverrides();
  verifyRenderViewHidesWeaponForWideFovAndComputesFovY();
  console.log("quake2-cl-view: ok");
}

function verifySceneStagingHelpersMirrorClView(): void {
  const scene = createClientViewScene();

  scene.r_numdlights = 7;
  scene.r_numentities = 8;
  scene.r_numparticles = 9;
  V_ClearScene(scene);
  assert.equal(scene.r_numdlights, 0, "V_ClearScene dlight count mismatch");
  assert.equal(scene.r_numentities, 0, "V_ClearScene entity count mismatch");
  assert.equal(scene.r_numparticles, 0, "V_ClearScene particle count mismatch");

  const entity = createEntity();
  entity.model = "model:test";
  entity.origin = [1, 2, 3];
  entity.oldorigin = [4, 5, 6];
  entity.angles = [7, 8, 9];
  entity.frame = 3;
  V_AddEntity(scene, entity);
  entity.origin[0] = 99;
  assert.equal(scene.r_numentities, 1, "V_AddEntity count mismatch");
  assert.deepEqual(scene.r_entities[0].origin, [1, 2, 3], "V_AddEntity should copy entity vectors");
  scene.r_numentities = MAX_ENTITIES;
  V_AddEntity(scene, entity);
  assert.equal(scene.r_numentities, MAX_ENTITIES, "V_AddEntity should clamp at MAX_ENTITIES");

  scene.r_numparticles = 0;
  const particleOrigin: [number, number, number] = [10, 20, 30];
  V_AddParticle(scene, particleOrigin, 8, 0.5);
  particleOrigin[0] = 99;
  assert.equal(scene.r_numparticles, 1, "V_AddParticle count mismatch");
  assert.deepEqual(scene.r_particles[0].origin, [10, 20, 30], "V_AddParticle should copy origin");
  assert.equal(scene.r_particles[0].color, 8, "V_AddParticle color mismatch");
  assert.equal(scene.r_particles[0].alpha, 0.5, "V_AddParticle alpha mismatch");
  scene.r_numparticles = MAX_PARTICLES;
  V_AddParticle(scene, [1, 1, 1], 1, 1);
  assert.equal(scene.r_numparticles, MAX_PARTICLES, "V_AddParticle should clamp at MAX_PARTICLES");

  scene.r_numdlights = 0;
  const lightOrigin: [number, number, number] = [11, 22, 33];
  V_AddLight(scene, lightOrigin, 200, 1, 0.5, 0.25);
  lightOrigin[0] = 99;
  assert.equal(scene.r_numdlights, 1, "V_AddLight count mismatch");
  assert.deepEqual(scene.r_dlights[0].origin, [11, 22, 33], "V_AddLight should copy origin");
  assert.deepEqual(scene.r_dlights[0].color, [1, 0.5, 0.25], "V_AddLight color mismatch");
  assert.equal(scene.r_dlights[0].intensity, 200, "V_AddLight intensity mismatch");
  scene.r_numdlights = MAX_DLIGHTS;
  V_AddLight(scene, [1, 1, 1], 1, 1, 1, 1);
  assert.equal(scene.r_numdlights, MAX_DLIGHTS, "V_AddLight should clamp at MAX_DLIGHTS");

  V_AddLightStyle(scene, 0, 0.2, 0.3, 0.4);
  assert.deepEqual(scene.r_lightstyles[0].rgb, [0.2, 0.3, 0.4], "V_AddLightStyle rgb mismatch");
  assert.equal(scene.r_lightstyles[0].white, 0.9, "V_AddLightStyle white mismatch");
  assert.throws(() => V_AddLightStyle(scene, -1, 0, 0, 0), /Bad light style -1/, "V_AddLightStyle should reject negative styles");

  const runtime = createClientRuntime();
  runtime.cl.baseclientinfo.model = "model:base";
  runtime.cl.baseclientinfo.skin = "skin:base";
  const view = {
    vieworg: [100, 200, 300] as [number, number, number],
    viewangles: [0, 0, 0] as [number, number, number],
    forward: [1, 0, 0] as [number, number, number],
    right: [0, 1, 0] as [number, number, number],
    up: [0, 0, 1] as [number, number, number],
    fov_x: 90,
    blend: [0, 0, 0, 0] as [number, number, number, number]
  };

  V_TestParticles(scene, view, 0.75);
  assert.equal(scene.r_numparticles, MAX_PARTICLES, "V_TestParticles count mismatch");
  assert.deepEqual(scene.r_particles[0].origin, [100, 186, 286], "V_TestParticles first origin mismatch");
  assert.equal(scene.r_particles[0].color, 8, "V_TestParticles color mismatch");
  assert.equal(scene.r_particles[0].alpha, 0.75, "V_TestParticles alpha mismatch");

  scene.r_entities[0].flags = 123;
  scene.r_entities[0].frame = 456;
  scene.r_entities[0].alpha = 0.25;
  V_TestEntities(scene, runtime, view);
  assert.equal(scene.r_numentities, 32, "V_TestEntities count mismatch");
  assert.deepEqual(scene.r_entities[0].origin, [228, 104, 300], "V_TestEntities first origin mismatch");
  assert.equal(scene.r_entities[0].model, "model:base", "V_TestEntities model mismatch");
  assert.equal(scene.r_entities[0].skin, "skin:base", "V_TestEntities skin mismatch");
  assert.equal(scene.r_entities[0].flags, 0, "V_TestEntities should clear stale flags like memset");
  assert.equal(scene.r_entities[0].frame, 0, "V_TestEntities should clear stale frame like memset");
  assert.equal(scene.r_entities[0].alpha, 0, "V_TestEntities should clear stale alpha like memset");

  scene.r_dlights[0].color = [9, 9, 9];
  scene.r_dlights[0].intensity = 999;
  V_TestLights(scene, view);
  assert.equal(scene.r_numdlights, 32, "V_TestLights count mismatch");
  assert.deepEqual(scene.r_dlights[0].origin, [228, 104, 300], "V_TestLights first origin mismatch");
  assert.deepEqual(scene.r_dlights[0].color, [1, 0, 0], "V_TestLights color mismatch");
  assert.equal(scene.r_dlights[0].intensity, 200, "V_TestLights intensity mismatch");
}

function verifyBuildRefreshFrameActiveGuardAndSoundOrigin(): void {
  const inactive = createClientRuntime();
  inactive.cls.state = connstate_t.ca_connected;
  inactive.cl.frame.valid = true;
  inactive.cl.frame.servertime = 800;
  inactive.cl.frame.playerstate.fov = 92;
  inactive.cl.frame.playerstate.blend = [0.1, 0.2, 0.3, 0.4];
  inactive.cl.frame.areabits.set([5, 6, 7]);
  inactive.cl.time = 900;
  inactive.cl.lerpfrac = 0.25;
  inactive.cl.viewangles = [10, 20, 30];

  const inactiveFrame = CL_BuildRefreshFrame(inactive, { predictMovement: false });
  assert.equal(inactive.cl.time, 900, "CL_AddEntities inactive path should not clamp cl.time");
  assert.equal(inactive.cl.lerpfrac, 0.25, "CL_AddEntities inactive path should not recompute lerpfrac");
  assert.equal(inactiveFrame.entities.length, 0, "CL_AddEntities inactive path should not emit entities");
  assert.equal(inactiveFrame.lights.length, 0, "CL_AddEntities inactive path should not emit lights");
  assert.equal(inactiveFrame.particles.length, 0, "CL_AddEntities inactive path should not emit particles");
  assert.equal(inactiveFrame.beams.length, 0, "CL_AddEntities inactive path should not emit beams");
  assert.deepEqual(Array.from(inactiveFrame.areabits.slice(0, 3)), [5, 6, 7], "CL_AddEntities inactive areabits copy mismatch");
  assert.deepEqual(inactiveFrame.view.viewangles, [10, 20, 30], "CL_AddEntities inactive viewangles fallback mismatch");
  assert.deepEqual(inactiveFrame.view.blend, [0.1, 0.2, 0.3, 0.4], "CL_AddEntities inactive blend fallback mismatch");

  const runtime = createClientRuntime();
  runtime.cl_entities[3].lerp_origin = [11, 22, 33];
  const origin = CL_GetRefreshEntitySoundOrigin(runtime, 3);
  assert.deepEqual(origin, [11, 22, 33], "CL_GetEntitySoundOrigin should copy lerp_origin");
  origin[0] = 99;
  assert.deepEqual(runtime.cl_entities[3].lerp_origin, [11, 22, 33], "CL_GetEntitySoundOrigin should return a cloned vector");
  assert.throws(
    () => CL_GetRefreshEntitySoundOrigin(runtime, runtime.cl_entities.length),
    /CL_GetEntitySoundOrigin: bad ent/,
    "CL_GetEntitySoundOrigin should reject out-of-range entities"
  );
}

function verifyPrepRefreshRegistersLevelAssets(): void {
  const runtime = createClientRuntime();
  runtime.cl.screen.scr_vrect = { x: 0, y: 0, width: 640, height: 480 };
  runtime.cl.configstrings[CS_MODELS + 1] = "maps/demo1.bsp";
  runtime.cl.configstrings[CS_MODELS + 2] = "models/items/ammo/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 3] = "*1";
  runtime.cl.configstrings[CS_MODELS + 4] = "#w_blaster.md2";
  runtime.cl.configstrings[CS_IMAGES + 1] = "i_health";
  runtime.cl.configstrings[CS_PLAYERSKINS] = "Bitterman\\male/major";
  runtime.cl.configstrings[CS_SKY] = "space";
  runtime.cl.configstrings[CS_SKYAXIS] = "0 0 1";
  runtime.cl.configstrings[CS_SKYROTATE] = "30";
  runtime.cl.configstrings[CS_CDTRACK] = "3";

  const commandRuntime = createCommandRuntime();
  const cvarRuntime = createCvarRuntime();
  const consoleState = createConsoleState();
  consoleState.times = [100, 200, 300, 400];

  const log: string[] = [];
  const registeredModels: string[] = [];
  const registeredPics: string[] = [];
  const registeredSkins: string[] = [];
  const ref = createRefExport();
  ref.BeginRegistration = (map) => {
    log.push(`begin:${map}`);
  };
  ref.RegisterModel = (name) => {
    registeredModels.push(name);
    return `model:${name}`;
  };
  ref.RegisterSkin = (name) => {
    registeredSkins.push(name);
    return `skin:${name}`;
  };
  ref.RegisterPic = (name) => {
    registeredPics.push(name);
    return `pic:${name}`;
  };
  ref.SetSky = (name, rotate, axis) => {
    log.push(`sky:${name}:${rotate}:${axis.join(",")}`);
  };
  ref.EndRegistration = () => {
    log.push("end");
  };
  ref.DrawGetPicSize = (name) => name === "ch2" ? { width: 24, height: 24 } : { width: 16, height: 16 };

  const playedTracks: Array<[number, boolean]> = [];
  const result = CL_PrepRefresh(runtime, {
    ref,
    console: consoleState,
    crosshairValue: 2,
    onPrint: (line) => {
      log.push(`print:${line}`);
    },
    onUpdateScreen: () => {
      log.push("update");
    },
    onPumpEvents: () => {
      log.push("pump");
    },
    onPlayCdTrack: (track, looping) => {
      playedTracks.push([track, looping]);
    },
    inlineModel: (name) => ({ headnode: name === "*1" ? 17 : 0 } as never)
  });

  assert.deepEqual(result, {
    mapname: "demo1",
    modelCount: 4,
    imageCount: 1,
    clientInfoCount: 1
  }, "CL_PrepRefresh result mismatch");
  assert.equal(runtime.cl.refresh_prepped, true, "CL_PrepRefresh refresh_prepped mismatch");
  assert.equal(runtime.cl.force_refdef, true, "CL_PrepRefresh force_refdef mismatch");
  assert.equal(runtime.cl.screen.crosshair_pic, "ch2", "CL_PrepRefresh crosshair pic mismatch");
  assert.equal(runtime.cl.screen.crosshair_width, 24, "CL_PrepRefresh crosshair width mismatch");
  assert.equal(runtime.cl.model_draw[2], "model:models/items/ammo/tris.md2", "CL_PrepRefresh model_draw mismatch");
  assert.equal((runtime.cl.model_clip[3] as { headnode: number }).headnode, 17, "CL_PrepRefresh inline model mismatch");
  assert.equal(runtime.cl.num_cl_weaponmodels, 2, "CL_PrepRefresh weapon model count mismatch");
  assert.equal(runtime.cl.cl_weaponmodels[1], "w_blaster.md2", "CL_PrepRefresh weapon model path mismatch");
  assert.equal(runtime.cl.image_precache[1], "pic:i_health", "CL_PrepRefresh image_precache mismatch");
  assert.equal(runtime.cl.clientinfo[0].model, "model:players/male/tris.md2", "CL_PrepRefresh client model mismatch");
  assert.equal(runtime.cl.clientinfo[0].skin, "skin:players/male/major.pcx", "CL_PrepRefresh client skin mismatch");
  assert.equal(runtime.cl.baseclientinfo.weaponmodel[0], "model:players/male/weapon.md2", "CL_PrepRefresh base weapon model mismatch");
  assert.deepEqual(runtime.cl.sky.axis, [0, 0, 1], "CL_PrepRefresh sky axis mismatch");
  assert.equal(runtime.cl.sky.rotate, 30, "CL_PrepRefresh sky rotate mismatch");
  assert.deepEqual(playedTracks, [[3, true]], "CL_PrepRefresh cd track mismatch");
  assert.deepEqual(consoleState.times, [0, 0, 0, 0], "CL_PrepRefresh Con_ClearNotify mismatch");
  assert.equal(log[0], "print:Map: demo1\r", "CL_PrepRefresh begin log mismatch");
  assert.ok(log.includes("begin:demo1"), "CL_PrepRefresh BeginRegistration mismatch");
  assert.ok(log.includes("sky:space:30:0,0,1"), "CL_PrepRefresh SetSky mismatch");
  assert.ok(log.includes("end"), "CL_PrepRefresh EndRegistration mismatch");
  assert.ok(log.indexOf("end") < log.lastIndexOf("update"), "CL_PrepRefresh final update ordering mismatch");
  assert.ok(registeredModels.includes("models/objects/explode/tris.md2"), "CL_PrepRefresh tent model registration mismatch");
  assert.ok(registeredPics.includes("w_machinegun"), "CL_PrepRefresh tent pic registration mismatch");
  assert.ok(registeredSkins.includes("players/male/major.pcx"), "CL_PrepRefresh client skin registration mismatch");

  void commandRuntime;
  void cvarRuntime;
}

function verifyRenderViewResolvesDefaultEntityModelsAndSkins(): void {
  const runtime = createClientRuntime();
  const cmd = createCommandRuntime();
  const cvar = createCvarRuntime();
  const context = createClientViewContext(runtime, cmd, cvar);

  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.refresh_prepped = true;
  runtime.cl.force_refdef = true;
  runtime.cl.frame.valid = true;
  runtime.cl.time = 500;
  runtime.cl.screen.scr_vrect = { x: 0, y: 0, width: 320, height: 200 };
  runtime.cl.frame.areabits = new Uint8Array([1, 2, 3]);
  runtime.cl.frame.playerstate.rdflags = 9;
  runtime.cl.model_draw[5] = "model:world";
  runtime.cl.clientinfo[1].model = "model:player";
  runtime.cl.clientinfo[1].skin = "skin:player";
  runtime.cl.clientinfo[1].weaponmodel[1] = "model:weapon1";
  runtime.cl.baseclientinfo.weaponmodel[0] = "model:weapon0";

  const rendered = V_RenderView(context, {
    buildRefreshFrame: () => ({
      view: {
        vieworg: [10, 20, 30],
        viewangles: [0, 90, 0],
        forward: [0, 1, 0],
        right: [1, 0, 0],
        up: [0, 0, 1],
        fov_x: 90,
        blend: [0, 0, 0, 0]
      },
      areabits: new Uint8Array([1, 2, 3]),
      entities: [
        {
          entityNumber: 7,
          modelindex: 5,
          frame: 1,
          oldframe: 0,
          backlerp: 0.25,
          origin: [1, 2, 3],
          oldorigin: [1, 2, 3],
          angles: [0, 0, 0],
          skinnum: 0,
          alpha: 1,
          flags: 0,
          customPlayerSkin: false,
          customWeaponModel: false,
          linkedModelSlot: 0
        },
        {
          entityNumber: 2,
          modelindex: 255,
          frame: 1,
          oldframe: 0,
          backlerp: 0,
          origin: [4, 5, 6],
          oldorigin: [4, 5, 6],
          angles: [0, 0, 0],
          skinnum: 1,
          alpha: 1,
          flags: 0,
          customPlayerSkin: true,
          customWeaponModel: false,
          linkedModelSlot: 0
        },
        {
          entityNumber: 2,
          modelindex: 255,
          frame: 1,
          oldframe: 0,
          backlerp: 0,
          origin: [4, 5, 6],
          oldorigin: [4, 5, 6],
          angles: [0, 0, 0],
          skinnum: 257,
          alpha: 1,
          flags: 0,
          customPlayerSkin: false,
          customWeaponModel: true,
          linkedModelSlot: 2
        }
      ],
      lights: [],
      particles: [],
      lightStyles: Array.from({ length: 1 }, () => ({
        style: 0,
        rgb: [0.2, 0.3, 0.4] as [number, number, number]
      })),
      beams: [],
      explosions: [],
      forceWalls: [],
      sustains: []
    })
  });

  assert.ok(rendered, "V_RenderView should return one refdef");
  assert.equal(rendered?.refdef.num_entities, 3, "V_RenderView entity count mismatch");
  assert.ok(rendered?.refdef.entities.some((entity) => entity.model === "model:player" && entity.skin === "skin:player"), "V_RenderView default player model mismatch");
  assert.ok(rendered?.refdef.entities.some((entity) => entity.model === "model:weapon1"), "V_RenderView default weapon model mismatch");
  assert.ok(rendered?.refdef.entities.some((entity) => entity.model === "model:world"), "V_RenderView default world model mismatch");
  assert.deepEqual(rendered?.refdef.lightstyles[0], {
    rgb: [0.2, 0.3, 0.4],
    white: 0.9
  }, "V_RenderView lightstyle copy mismatch");
  assert.deepEqual(context.scene.r_lightstyles[0].rgb, [0.2, 0.3, 0.4], "V_RenderView scene lightstyle mismatch");
  assert.equal(rendered?.refdef.rdflags, 9, "V_RenderView rdflags mismatch");
  assert.deepEqual(Array.from(rendered?.refdef.areabits ?? []), [1, 2, 3], "V_RenderView areabits mismatch");
}

function verifyRenderViewAppliesViewWeaponDebugOverrides(): void {
  const runtime = createClientRuntime();
  const cmd = createCommandRuntime();
  const cvar = createCvarRuntime();
  const context = createClientViewContext(runtime, cmd, cvar);

  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.refresh_prepped = true;
  runtime.cl.force_refdef = true;
  runtime.cl.frame.valid = true;
  runtime.cl.time = 200;
  runtime.cl.lerpfrac = 0.25;
  runtime.cl.playernum = 0;
  runtime.cl.screen.scr_vrect = { x: 0, y: 0, width: 320, height: 200 };
  runtime.cl.model_draw[3] = "model:stockgun";
  runtime.cl.frame.serverframe = 1;
  runtime.cl.frame.playerstate.fov = 90;
  runtime.cl.frame.playerstate.gunindex = 3;
  runtime.cl.frame.playerstate.gunframe = 7;
  runtime.cl.frame.playerstate.gunoffset = [1, 2, 3];
  runtime.cl.frame.playerstate.gunangles = [4, 5, 6];
  runtime.cl.frame.playerstate.viewoffset = [0, 0, 22];
  runtime.cl.frame.playerstate.viewangles = [0, 90, 0];
  runtime.cl.frame.playerstate.kick_angles = [0, 0, 0];
  runtime.cl.frames[0] = {
    ...runtime.cl.frame,
    valid: true,
    serverframe: 0,
    playerstate: {
      ...runtime.cl.frame.playerstate,
      gunframe: 6,
      gunoffset: [0, 0, 0],
      gunangles: [0, 0, 0]
    }
  };

  context.debug.gun_model = "models/debug/tris.md2";
  context.debug.gun_frame = 11;
  context.cl_gun = { value: 1 } as never;

  const rendered = V_RenderView(context, {
    predictMovement: false,
    buildRefreshFrame: CL_BuildRefreshFrame
  });

  assert.ok(rendered, "V_RenderView debug gun render should succeed");
  assert.equal(rendered?.refdef.num_entities, 1, "V_RenderView debug gun entity count mismatch");
  assert.equal(rendered?.refdef.entities[0]?.model, "models/debug/tris.md2", "V_RenderView gun_model override mismatch");
  assert.equal(rendered?.refdef.entities[0]?.frame, 11, "V_RenderView gun_frame override mismatch");
  assert.equal(rendered?.refdef.entities[0]?.oldframe, 11, "V_RenderView gun_frame oldframe override mismatch");

  runtime.cl.force_refdef = true;
  context.cl_gun = { value: 0 } as never;
  const hidden = V_RenderView(context, {
    predictMovement: false,
    buildRefreshFrame: CL_BuildRefreshFrame
  });
  assert.ok(hidden, "V_RenderView hidden gun render should still return one refdef");
  assert.equal(hidden?.refdef.num_entities, 0, "V_RenderView cl_gun=0 should hide the view weapon");
}

function verifyCalcViewValuesInterpolatesWeaponRelevantMotion(): void {
  const runtime = createClientRuntime();
  runtime.cl.lerpfrac = 0.25;
  runtime.cls.realtime = 1000;
  runtime.cl.predicted_origin = [100, 200, 300];
  runtime.cl.prediction_error = [1, 2, 3];
  runtime.cl.predicted_angles = [10, 20, 30];
  runtime.cl.predicted_step = 16;
  runtime.cl.predicted_step_time = 980;
  runtime.cl.frame.serverframe = 10;
  runtime.cl.frame.valid = true;
  runtime.cl.frame.playerstate.pmove.pm_flags = 0;
  runtime.cl.frame.playerstate.pmove.pm_type = 0 as never;
  runtime.cl.frame.playerstate.viewoffset = [8, 12, 24];
  runtime.cl.frame.playerstate.kick_angles = [4, 8, 12];
  runtime.cl.frame.playerstate.fov = 100;

  runtime.cl.frames[9] = {
    ...runtime.cl.frame,
    valid: true,
    serverframe: 9,
    playerstate: {
      ...runtime.cl.frame.playerstate,
      viewoffset: [4, 8, 20],
      kick_angles: [0, 0, 0],
      fov: 90
    }
  };

  const view = CL_CalcViewValues(runtime, { predictMovement: true });
  assert.equal(view.fov_x, 92.5, "CL_CalcViewValues should lerp playerstate fov");
  assert.ok(Math.abs(view.viewangles[0] - 11) < 1e-6, "CL_CalcViewValues kick pitch interpolation mismatch");
  assert.ok(Math.abs(view.viewangles[1] - 22) < 1e-6, "CL_CalcViewValues kick yaw interpolation mismatch");
  assert.ok(Math.abs(view.viewangles[2] - 33) < 1e-6, "CL_CalcViewValues kick roll interpolation mismatch");
  assert.ok(Math.abs(view.vieworg[0] - 104.25) < 1e-6, "CL_CalcViewValues predicted-origin X mismatch");
  assert.ok(Math.abs(view.vieworg[1] - 207.5) < 1e-6, "CL_CalcViewValues predicted-origin Y mismatch");
  assert.ok(Math.abs(view.vieworg[2] - 305.95) < 1e-6, "CL_CalcViewValues predicted step smoothing mismatch");
}

function verifyCalcViewValuesMatchesDroppedFrameAndTeleportFallbacks(): void {
  const runtime = createClientRuntime();
  runtime.cl.lerpfrac = 0.5;
  runtime.cl.predicted_angles = [0, 0, 0];
  runtime.cl.frame.serverframe = 7;
  runtime.cl.frame.valid = true;
  runtime.cl.frame.playerstate.pmove.pm_type = pmtype_t.PM_DEAD;
  runtime.cl.frame.playerstate.pmove.origin = [160, 320, 480];
  runtime.cl.frame.playerstate.viewoffset = [4, 8, 12];
  runtime.cl.frame.playerstate.viewangles = [20, 40, 60];
  runtime.cl.frame.playerstate.kick_angles = [2, 4, 6];
  runtime.cl.frame.playerstate.fov = 100;
  runtime.cl.frame.playerstate.blend = [0.1, 0.2, 0.3, 0.4];

  runtime.cl.frames[6] = {
    ...runtime.cl.frame,
    valid: false,
    serverframe: 6,
    playerstate: {
      ...runtime.cl.frame.playerstate,
      pmove: {
        ...runtime.cl.frame.playerstate.pmove,
        origin: [0, 0, 0]
      },
      viewoffset: [0, 0, 0],
      viewangles: [0, 0, 0],
      kick_angles: [0, 0, 0],
      fov: 80
    }
  };

  const dropped = CL_CalcViewValues(runtime, { predictMovement: false });
  assert.deepEqual(dropped.vieworg, [24, 48, 72], "CL_CalcViewValues dropped oldframe origin fallback mismatch");
  assert.deepEqual(dropped.viewangles, [22, 44, 66], "CL_CalcViewValues dropped oldframe angle fallback mismatch");
  assert.equal(dropped.fov_x, 100, "CL_CalcViewValues dropped oldframe fov fallback mismatch");
  assert.deepEqual(dropped.blend, [0.1, 0.2, 0.3, 0.4], "CL_CalcViewValues must copy current blend without lerp");

  runtime.cl.frames[6] = {
    ...runtime.cl.frame,
    valid: true,
    serverframe: 6,
    playerstate: {
      ...runtime.cl.frame.playerstate,
      pmove: {
        ...runtime.cl.frame.playerstate.pmove,
        origin: [160 + 256 * 8 + 8, 320, 480]
      },
      viewoffset: [40, 80, 120],
      viewangles: [80, 120, 160],
      kick_angles: [8, 12, 16],
      fov: 60
    }
  };

  const teleported = CL_CalcViewValues(runtime, { predictMovement: false });
  assert.deepEqual(teleported.vieworg, [24, 48, 72], "CL_CalcViewValues teleport origin fallback mismatch");
  assert.deepEqual(teleported.viewangles, [22, 44, 66], "CL_CalcViewValues teleport angle fallback mismatch");
  assert.equal(teleported.fov_x, 100, "CL_CalcViewValues teleport fov fallback mismatch");

  runtime.cl.frames[6] = {
    ...runtime.cl.frame,
    valid: true,
    serverframe: 6,
    playerstate: {
      ...runtime.cl.frame.playerstate,
      pmove: {
        ...runtime.cl.frame.playerstate.pmove,
        origin: [80, 160, 240]
      },
      viewoffset: [0, 0, 0],
      viewangles: [10, 20, 30],
      kick_angles: [0, 0, 0],
      fov: 80
    }
  };

  const interpolated = CL_CalcViewValues(runtime, { predictMovement: false });
  assert.deepEqual(interpolated.vieworg, [17, 34, 51], "CL_CalcViewValues non-predicted origin lerp mismatch");
  assert.deepEqual(interpolated.viewangles, [16, 32, 48], "CL_CalcViewValues non-predicted angle/kick lerp mismatch");
  assert.equal(interpolated.fov_x, 90, "CL_CalcViewValues non-predicted fov lerp mismatch");
}

function verifyRenderViewHidesWeaponForWideFovAndComputesFovY(): void {
  const runtime = createClientRuntime();
  const cmd = createCommandRuntime();
  const cvar = createCvarRuntime();
  const context = createClientViewContext(runtime, cmd, cvar);

  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.refresh_prepped = true;
  runtime.cl.force_refdef = true;
  runtime.cl.frame.valid = true;
  runtime.cl.time = 100;
  runtime.cl.lerpfrac = 1;
  runtime.cl.playernum = 0;
  runtime.cl.screen.scr_vrect = { x: 0, y: 0, width: 320, height: 200 };
  runtime.cl.frame.serverframe = 5;
  runtime.cl.frame.playerstate.fov = 100;
  runtime.cl.frame.playerstate.gunindex = 3;
  runtime.cl.frame.playerstate.gunframe = 2;
  runtime.cl.frame.playerstate.gunoffset = [1, 2, 3];
  runtime.cl.frame.playerstate.gunangles = [0, 0, 0];
  runtime.cl.frame.playerstate.viewoffset = [0, 0, 22];
  runtime.cl.frame.playerstate.viewangles = [0, 0, 0];
  runtime.cl.frame.playerstate.kick_angles = [0, 0, 0];
  runtime.cl.frames[4] = {
    ...runtime.cl.frame,
    valid: true,
    serverframe: 4
  };

  context.cl_gun = { value: 1 } as never;
  const rendered = V_RenderView(context, {
    predictMovement: false,
    buildRefreshFrame: CL_BuildRefreshFrame
  });

  assert.ok(rendered, "V_RenderView wide-FOV render should return one refdef");
  assert.equal(rendered?.refdef.fov_x, 100, "V_RenderView should keep horizontal fov from playerstate");
  assert.ok(Math.abs((rendered?.refdef.fov_y ?? 0) - CalcFov(100, 320, 200)) < 1e-6, "V_RenderView fov_y mismatch");
  assert.equal(rendered?.refdef.num_entities, 0, "V_RenderView should hide first-person weapon when fov > 90");
}
