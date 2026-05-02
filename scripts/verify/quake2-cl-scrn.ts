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
  SCR_DrawLoading,
  SCR_Init,
  SCR_UpdateScreen
} from "../../packages/client/src/cl_scrn.js";
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
SCR_BeginLoadingPlaque(client);
assert.equal(client.cl.screen.scr_draw_loading, 2, "SCR_BeginLoadingPlaque cinematic draw flag mismatch");
assert.equal(client.cls.disable_screen, 2000, "SCR_BeginLoadingPlaque cinematic disable_screen mismatch");

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

console.log("quake2-cl-scrn: ok");
