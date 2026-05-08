/**
 * File: quake2-cl-scrn.ts
 * Purpose: Verify the currently closed `client/cl_scrn.c` behavior anchored in `packages/client/src/cl_scrn.ts`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the client screen module.
 *
 * Dependencies:
 * - packages/client/src/cl_scrn.ts
 * - packages/client/src/client.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/cvar.ts
 */

import { strict as assert } from "node:assert";

import {
  CL_AddNetgraph,
  createClientScreenContext,
  SCR_BeginLoadingPlaque,
  SCR_DrawConsole,
  SCR_DrawLoading,
  SCR_Init,
  SCR_TileClear,
  SCR_TimeRefresh_f,
  SCR_UpdateScreen
} from "../../packages/client/src/cl_scrn.js";
import { createRefDef, type refdef_t } from "../../packages/client/src/ref.js";
import { createClientRuntime, connstate_t } from "../../packages/client/src/client.js";
import { Cmd_ExecuteString, Cmd_Exists, createCommandRuntime } from "../../packages/qcommon/src/cmd.js";
import { createCvarRuntime } from "../../packages/qcommon/src/cvar.js";

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const context = createClientScreenContext(client, cmd, cvar);

SCR_Init(context);

assert.equal(context.scr_showturtle?.value, 0, "SCR_Init scr_showturtle cvar mismatch");
assert.equal(context.scr_printspeed?.value, 8, "SCR_Init scr_printspeed cvar mismatch");
assert.equal(context.scr_netgraph?.value, 0, "SCR_Init scr_netgraph cvar mismatch");
assert.equal(Cmd_Exists(cmd, "loading"), true, "SCR_Init should register loading");
assert.equal(Cmd_Exists(cmd, "timerefresh"), true, "SCR_Init should register timerefresh");
assert.equal(Cmd_Exists(cmd, "sky"), true, "SCR_Init should register sky");

Cmd_ExecuteString(cmd, "sky unit1_ 45 1 2 3");
assert.equal(client.cl.sky.name, "unit1_", "SCR_Sky_f name mismatch");
assert.equal(client.cl.sky.rotate, 45, "SCR_Sky_f rotate mismatch");
assert.deepEqual(client.cl.sky.axis, [1, 2, 3], "SCR_Sky_f axis mismatch");

client.cls.state = connstate_t.ca_active;
client.cls.realtime = 1234;
Cmd_ExecuteString(cmd, "loading");
assert.equal(client.cl.screen.scr_draw_loading, 1, "SCR_Loading_f draw flag mismatch");
assert.equal(client.cls.disable_screen, 1234, "SCR_Loading_f disable_screen mismatch");

client.cl.screen.scr_draw_loading = 1;
const loadingPicture = SCR_DrawLoading(client);
assert.equal(loadingPicture?.pic, "loading", "SCR_DrawLoading picture mismatch");
assert.equal(client.cl.screen.scr_draw_loading, 0, "SCR_DrawLoading should consume draw flag");

client.cl.cinematic.cinematictime = 1;
client.cl.screen.scr_draw_loading = 0;
client.cls.disable_screen = 0;
client.cls.realtime = 2000;
let stoppedSounds = 0;
let stoppedCd = 0;
let flushedScreen = 0;
SCR_BeginLoadingPlaque(client, {
  onStopAllSounds: () => {
    stoppedSounds += 1;
  },
  onCDAudioStop: () => {
    stoppedCd += 1;
  },
  onUpdateScreen: () => {
    flushedScreen += 1;
  }
});
assert.equal(client.cl.screen.scr_draw_loading, 2, "SCR_BeginLoadingPlaque cinematic draw flag mismatch");
assert.equal(client.cls.disable_screen, 2000, "SCR_BeginLoadingPlaque cinematic disable_screen mismatch");
assert.equal(client.cl.sound_prepped, false, "SCR_BeginLoadingPlaque should suppress ambient sounds");
assert.equal(stoppedSounds, 1, "SCR_BeginLoadingPlaque should stop sounds before drawing");
assert.equal(stoppedCd, 1, "SCR_BeginLoadingPlaque should stop CDAudio before drawing");
assert.equal(flushedScreen, 1, "SCR_BeginLoadingPlaque should flush one loading frame before disabling");

const loadingFrame = SCR_UpdateScreen(context, {
  viewportWidth: 640,
  viewportHeight: 480,
  currentTimeMs: 2000
});
assert.ok(loadingFrame, "SCR_UpdateScreen should emit a loading frame for draw flag 2");
assert.deepEqual(
  loadingFrame?.commands,
  [{
    type: "picture",
    x: -1,
    y: -1,
    pic: "loading",
    bounds: { x: -1, y: -1, width: 0, height: 0 }
  }],
  "SCR_UpdateScreen loading-plaque command mismatch"
);
assert.equal(loadingFrame?.cinematic, null, "SCR_UpdateScreen should suppress cinematic draw while loading");
assert.equal(client.cl.screen.scr_draw_loading, 0, "SCR_UpdateScreen should consume draw flag 2");

const blockedFrame = SCR_UpdateScreen(context, {
  viewportWidth: 640,
  viewportHeight: 480,
  currentTimeMs: 2001
});
assert.equal(blockedFrame, null, "SCR_UpdateScreen should remain blocked while disable_screen is active");

client.cls.disable_screen = 0;
client.cl.screen.scr_draw_loading = 0;
client.cls.state = connstate_t.ca_disconnected;
client.cl.sound_prepped = true;
SCR_BeginLoadingPlaque(client);
assert.equal(client.cl.sound_prepped, false, "SCR_BeginLoadingPlaque should stop sounds even when disconnected");
assert.equal(client.cl.screen.scr_draw_loading, 0, "SCR_BeginLoadingPlaque should not draw while disconnected");
assert.equal(client.cls.disable_screen, 0, "SCR_BeginLoadingPlaque should not disable screen while disconnected");

client.cls.state = connstate_t.ca_active;
SCR_BeginLoadingPlaque(client, { keyDest: "console" });
assert.equal(client.cl.screen.scr_draw_loading, 0, "SCR_BeginLoadingPlaque should not draw over console");

SCR_BeginLoadingPlaque(client, { developer: true });
assert.equal(client.cl.screen.scr_draw_loading, 0, "SCR_BeginLoadingPlaque should respect developer guard");

client.cl.screen.graph_current = 0;
client.cls.netchan.dropped = 2;
client.cl.surpressCount = 1;
client.cls.realtime = 300;
client.cls.netchan.incoming_acknowledged = 5;
client.cl.cmd_time[5] = 0;
CL_AddNetgraph(context);
assert.equal(client.cl.screen.graph_current, 4, "CL_AddNetgraph sample count mismatch");
assert.deepEqual(
  client.cl.screen.graph_values.slice(0, 4),
  [
    { value: 30, color: 0x40 },
    { value: 30, color: 0x40 },
    { value: 30, color: 0xdf },
    { value: 10, color: 0xd0 }
  ],
  "CL_AddNetgraph samples mismatch"
);

client.cl.screen.scr_vrect = { x: 160, y: 120, width: 320, height: 240 };
client.cl.screen.scr_dirty = { x1: 0, y1: 0, x2: 639, y2: 479 };
client.cl.screen.scr_old_dirty = [
  { x1: 9999, y1: 9999, x2: -9999, y2: -9999 },
  { x1: 9999, y1: 9999, x2: -9999, y2: -9999 }
];
client.cl.screen.scr_con_current = 0;
client.cl.cinematic.cinematictime = 0;
const tileClears = SCR_TileClear(client, {
  viewportWidth: 640,
  viewportHeight: 480,
  scr_viewsize: 80
});
assert.deepEqual(
  tileClears,
  [
    { type: "tileClear", x: 0, y: 0, width: 640, height: 120, pic: "backtile", bounds: { x: 0, y: 0, width: 640, height: 120 } },
    { type: "tileClear", x: 0, y: 360, width: 640, height: 120, pic: "backtile", bounds: { x: 0, y: 360, width: 640, height: 120 } },
    { type: "tileClear", x: 0, y: 120, width: 160, height: 240, pic: "backtile", bounds: { x: 0, y: 120, width: 160, height: 240 } },
    { type: "tileClear", x: 480, y: 120, width: 160, height: 240, pic: "backtile", bounds: { x: 480, y: 120, width: 160, height: 240 } }
  ],
  "SCR_TileClear backtile rectangles mismatch"
);
assert.deepEqual(client.cl.screen.scr_dirty, { x1: 9999, y1: 9999, x2: -9999, y2: -9999 }, "SCR_TileClear dirty reset mismatch");

client.cls.state = connstate_t.ca_connected;
client.cl.refresh_prepped = false;
assert.equal(SCR_DrawConsole(client, { viewportWidth: 640, viewportHeight: 480 }).mode, "half", "SCR_DrawConsole connected fallback mismatch");
client.cls.state = connstate_t.ca_active;
client.cl.refresh_prepped = true;
client.cl.screen.scr_con_current = 0.25;
assert.equal(SCR_DrawConsole(client, { keyDest: "game" }).frac, 0.25, "SCR_DrawConsole scroll frac mismatch");
client.cl.screen.scr_con_current = 0;
assert.equal(SCR_DrawConsole(client, { keyDest: "message" }).drawNotify, true, "SCR_DrawConsole notify branch mismatch");

const refCalls: string[] = [];
const renderedYaws: number[] = [];
const ref = {
  api_version: 3,
  Init: () => true,
  Shutdown: () => {},
  BeginRegistration: () => {},
  RegisterModel: () => null,
  RegisterSkin: () => null,
  RegisterPic: () => null,
  SetSky: () => {},
  EndRegistration: () => {},
  RenderFrame: (fd: refdef_t) => {
    refCalls.push("render");
    renderedYaws.push(fd.viewangles[1]);
  },
  DrawGetPicSize: () => ({ width: 0, height: 0 }),
  DrawPic: () => {},
  DrawStretchPic: () => {},
  DrawChar: () => {},
  DrawTileClear: () => {},
  DrawFill: () => {},
  DrawFadeScreen: () => {},
  DrawStretchRaw: () => {},
  CinematicSetPalette: () => {},
  BeginFrame: (cameraSeparation: number) => {
    refCalls.push(`begin:${cameraSeparation}`);
  },
  EndFrame: () => {
    refCalls.push("end");
  },
  AppActivate: () => {}
};

client.cls.state = connstate_t.ca_active;
let fakeNow = 1000;
const timeRefresh = SCR_TimeRefresh_f(context, {
  ref,
  nowMs: () => {
    const value = fakeNow;
    fakeNow += 500;
    return value;
  }
});
assert.equal(timeRefresh?.seconds, 0.5, "SCR_TimeRefresh_f timing mismatch");
assert.equal(timeRefresh?.fps, 256, "SCR_TimeRefresh_f fps mismatch");
assert.equal(refCalls.filter((call) => call === "render").length, 128, "SCR_TimeRefresh_f render sweep count mismatch");
assert.equal(refCalls.filter((call) => call === "begin:0").length, 128, "SCR_TimeRefresh_f BeginFrame count mismatch");
assert.equal(refCalls.filter((call) => call === "end").length, 128, "SCR_TimeRefresh_f EndFrame count mismatch");
assert.equal(renderedYaws[0], 0, "SCR_TimeRefresh_f first yaw mismatch");
assert.equal(renderedYaws[127], 127 / 128 * 360, "SCR_TimeRefresh_f last yaw mismatch");

client.cl.screen.scr_initialized = false;
assert.equal(SCR_UpdateScreen(context, { consoleInitialized: true }), null, "SCR_UpdateScreen scr_initialized guard mismatch");
client.cl.screen.scr_initialized = true;
assert.equal(SCR_UpdateScreen(context, { consoleInitialized: false }), null, "SCR_UpdateScreen console initialized guard mismatch");

const stereoCalls: string[] = [];
client.cl.refresh_prepped = true;
client.cl.screen.scr_dirty = { x1: 0, y1: 0, x2: 639, y2: 479 };
context.scr_viewsize!.value = 80;
SCR_UpdateScreen(context, {
  viewportWidth: 640,
  viewportHeight: 480,
  keyDest: "game",
  cl_stereo: 1,
  cl_stereo_separation: 1.5,
  consoleInitialized: true,
  ref: {
    ...ref,
    BeginFrame: (cameraSeparation: number) => {
      stereoCalls.push(`begin:${cameraSeparation}`);
    },
    EndFrame: () => {
      stereoCalls.push("end");
    },
    RenderFrame: () => {
      stereoCalls.push("render");
    },
    DrawTileClear: (x, y, w, h, name) => {
      stereoCalls.push(`tile:${x}:${y}:${w}:${h}:${name}`);
    }
  },
  renderFrame: () => createRefDef()
});
assert.equal(stereoCalls[0], "begin:-0.5", "SCR_UpdateScreen stereo left BeginFrame mismatch");
assert.equal(stereoCalls.includes("begin:0.5"), true, "SCR_UpdateScreen stereo right BeginFrame mismatch");
assert.equal(stereoCalls.filter((call) => call === "render").length, 2, "SCR_UpdateScreen stereo render count mismatch");
assert.equal(stereoCalls.at(-1), "end", "SCR_UpdateScreen EndFrame ordering mismatch");
assert.equal(stereoCalls.some((call) => call.startsWith("tile:")), true, "SCR_UpdateScreen should tile clear through ref");

console.log("quake2-cl-scrn: ok");
