/**
 * File: quake2-cl-view.ts
 * Purpose: Verify the `client/cl_view.c` port centered on `packages/client/src/view.ts`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for refresh preparation and renderer-neutral view assembly.
 *
 * Dependencies:
 * - packages/client/src/view.ts
 * - packages/client/src/types.ts
 * - packages/client/src/ref.ts
 * - packages/client/src/console.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/cvar.ts
 */

import { strict as assert } from "node:assert";

import {
  CL_BuildRefreshFrame,
  CL_CalcViewValues,
  CL_PrepRefresh,
  CalcFov,
  V_RenderView,
  createClientRuntime,
  createClientViewContext,
  connstate_t
} from "../../packages/client/src/index.js";
import { createConsoleState } from "../../packages/client/src/console.js";
import { createCommandRuntime } from "../../packages/qcommon/src/cmd.js";
import { createCvarRuntime } from "../../packages/qcommon/src/cvar.js";
import { createRefExport } from "../../packages/client/src/ref.js";
import { CS_CDTRACK, CS_IMAGES, CS_MODELS, CS_PLAYERSKINS, CS_SKY, CS_SKYAXIS, CS_SKYROTATE } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyPrepRefreshRegistersLevelAssets();
  verifyCalcViewValuesInterpolatesWeaponRelevantMotion();
  verifyRenderViewResolvesDefaultEntityModelsAndSkins();
  verifyRenderViewAppliesViewWeaponDebugOverrides();
  verifyRenderViewHidesWeaponForWideFovAndComputesFovY();
  console.log("quake2-cl-view: ok");
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
