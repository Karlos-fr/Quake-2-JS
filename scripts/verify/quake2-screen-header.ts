/**
 * File: quake2-screen-header.ts
 * Purpose: Verify the currently closed `client/screen.h` declarations ported into `packages/client/src/screen.ts`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the currently ported screen header subset.
 *
 * Dependencies:
 * - packages/client/src/screen.ts
 * - packages/client/src/types.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/cvar.ts
 */

import { strict as assert } from "node:assert";

import {
  createClientScreenContext,
  SCR_AddDirtyPoint,
  SCR_BeginLoadingPlaque,
  SCR_DrawCinematic,
  SCR_DrawDebugGraph,
  SCR_DebugGraph,
  SCR_DirtyScreen,
  SCR_EndLoadingPlaque,
  SCR_FinishCinematic,
  SCR_Init,
  SCR_PlayCinematic,
  SCR_RunCinematic,
  SCR_StopCinematic,
  SCR_RunConsole,
  SCR_SizeDown,
  SCR_SizeUp,
  SCR_TouchPics,
  SCR_UpdateScreen
} from "../../packages/client/src/screen.js";
import { CL_ParseInventory } from "../../packages/client/src/parse.js";
import { createClientRuntime, connstate_t } from "../../packages/client/src/types.js";
import { createCommandRuntime } from "../../packages/qcommon/src/cmd.js";
import { createCvarRuntime } from "../../packages/qcommon/src/cvar.js";
import { MSG_WriteShort } from "../../packages/qcommon/src/messages.js";
import { CS_ITEMS, STAT_LAYOUTS, STAT_SELECTED_ITEM } from "../../packages/qcommon/src/index.js";

function createLittleShort(value: number): number[] {
  const normalized = value & 0xffff;
  return [
    normalized & 0xff,
    (normalized >>> 8) & 0xff
  ];
}

function createLittleLong(value: number): number[] {
  const normalized = value >>> 0;
  return [
    normalized & 0xff,
    (normalized >>> 8) & 0xff,
    (normalized >>> 16) & 0xff,
    (normalized >>> 24) & 0xff
  ];
}

function createTestPcx(): Uint8Array {
  const pcxBytes = new Uint8Array(128 + 1 + 769);
  pcxBytes[0] = 0x0a;
  pcxBytes[1] = 5;
  pcxBytes[2] = 1;
  pcxBytes[3] = 8;
  pcxBytes.set(createLittleShort(0), 4);
  pcxBytes.set(createLittleShort(0), 6);
  pcxBytes.set(createLittleShort(0), 8);
  pcxBytes.set(createLittleShort(0), 10);
  pcxBytes.set(createLittleShort(1), 12);
  pcxBytes.set(createLittleShort(1), 14);
  pcxBytes[65] = 1;
  pcxBytes.set(createLittleShort(1), 66);
  pcxBytes[128] = 7;
  pcxBytes[129] = 0x0c;
  pcxBytes[130 + 21] = 45;
  pcxBytes[130 + 22] = 123;
  pcxBytes[130 + 23] = 200;
  return pcxBytes;
}

function createTestCin(): Uint8Array {
  const bytes: number[] = [];
  const pushLong = (value: number): void => {
    bytes.push(...createLittleLong(value));
  };

  pushLong(1);
  pushLong(1);
  pushLong(14000);
  pushLong(1);
  pushLong(1);

  for (let prev = 0; prev < 256; prev += 1) {
    const counts = new Uint8Array(256);
    if (prev === 0) {
      counts[7] = 1;
      counts[8] = 1;
    }
    bytes.push(...counts);
  }

  pushLong(1);
  const palette = new Uint8Array(768);
  palette[21] = 45;
  palette[22] = 123;
  palette[23] = 200;
  bytes.push(...palette);
  pushLong(5);
  bytes.push(1, 0, 0, 0, 0);
  bytes.push(11, ...new Array<number>(999).fill(0));
  pushLong(2);

  return Uint8Array.from(bytes);
}

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const context = createClientScreenContext(client, cmd, cvar);

SCR_Init(context);

assert.equal(context.scr_viewsize?.value, 100, "SCR_Init viewsize cvar mismatch");
assert.equal(context.crosshair?.value, 0, "SCR_Init crosshair cvar mismatch");

SCR_SizeDown(context);
assert.equal(context.scr_viewsize?.value, 90, "SCR_SizeDown mismatch");
SCR_SizeUp(context);
assert.equal(context.scr_viewsize?.value, 100, "SCR_SizeUp mismatch");

client.cls.frametime = 0.1;
SCR_RunConsole(client, { keyDest: "console", scr_conspeed: 3 });
assert.equal(client.cl.screen.scr_conlines, 0.5, "SCR_RunConsole target mismatch");
assert.ok(client.cl.screen.scr_con_current > 0, "SCR_RunConsole current mismatch");

SCR_AddDirtyPoint(client, 20, 30);
SCR_AddDirtyPoint(client, 5, 12);
assert.deepEqual(client.cl.screen.scr_dirty, { x1: 5, y1: 12, x2: 20, y2: 30 }, "SCR_AddDirtyPoint mismatch");

client.cl.screen.scr_dirty = { x1: 9999, y1: 9999, x2: -9999, y2: -9999 };
SCR_DirtyScreen(client, 320, 240);
assert.deepEqual(client.cl.screen.scr_dirty, { x1: 0, y1: 0, x2: 319, y2: 239 }, "SCR_DirtyScreen mismatch");

const pics = SCR_TouchPics(2, {
  runtime: client,
  getPicSize: (pic) => pic === "ch2" ? { width: 24, height: 24 } : { width: 0, height: 0 }
});
assert.ok(pics.includes("ch2"), "SCR_TouchPics crosshair registration mismatch");
assert.equal(client.cl.screen.crosshair_pic, "ch2", "SCR_TouchPics crosshair state mismatch");
assert.equal(client.cl.screen.crosshair_width, 24, "SCR_TouchPics crosshair width mismatch");
assert.equal(client.cl.screen.crosshair_height, 24, "SCR_TouchPics crosshair height mismatch");

SCR_BeginLoadingPlaque(client);
assert.equal(client.cl.screen.scr_draw_loading, 1, "SCR_BeginLoadingPlaque draw flag mismatch");
assert.equal(client.cls.disable_servercount, client.cl.servercount, "SCR_BeginLoadingPlaque servercount mismatch");
SCR_EndLoadingPlaque(client);
assert.equal(client.cl.screen.scr_draw_loading, 0, "SCR_EndLoadingPlaque draw flag mismatch");
assert.equal(client.cls.disable_screen, 0, "SCR_EndLoadingPlaque disable_screen mismatch");

client.cls.state = connstate_t.ca_active;
client.cl.refresh_prepped = true;
client.cl.screen.scr_draw_loading = 1;
client.cl.screen.scr_centertime_off = 500;
client.cl.screen.scr_centerstring = "test";
client.cl.screen.scr_center_lines = 1;
const frame = SCR_UpdateScreen(context, {
  viewportWidth: 640,
  viewportHeight: 480,
  keyDest: "game",
  currentTimeMs: 0
});
assert.ok(frame, "SCR_UpdateScreen should produce one frame snapshot");
assert.deepEqual(frame?.vrect, { x: 0, y: 0, width: 640, height: 480 }, "SCR_UpdateScreen vrect mismatch");
assert.equal(client.cl.screen.sb_lines, 0, "SCR_UpdateScreen sb_lines mismatch");
assert.ok(frame?.commands.some((command) => command.type === "picture" && command.pic === "loading"), "SCR_UpdateScreen loading overlay mismatch");
assert.ok(frame?.commands.some((command) => command.type === "text" && command.text === "test"), "SCR_UpdateScreen centerprint mismatch");
assert.equal(frame?.cinematic, null, "SCR_UpdateScreen cinematic snapshot mismatch");

client.net_message.cursize = 0;
client.net_message.readcount = 0;
for (let index = 0; index < client.cl.inventory.length; index += 1) {
  MSG_WriteShort(client.net_message, index === 0 ? 5 : index === 3 ? 2 : 0);
}
CL_ParseInventory(client);
assert.equal(client.cl.inventory[0], 5, "CL_ParseInventory first slot mismatch");
assert.equal(client.cl.inventory[3], 2, "CL_ParseInventory populated slot mismatch");
assert.equal(client.cl.inventory[4], 0, "CL_ParseInventory empty slot mismatch");

client.cl.frame.playerstate.stats[STAT_LAYOUTS] = 2;
client.cl.frame.playerstate.stats[STAT_SELECTED_ITEM] = 3;
client.cl.configstrings[CS_ITEMS + 0] = "Blaster";
client.cl.configstrings[CS_ITEMS + 3] = "Shotgun";
client.cls.realtime = 0;
const inventoryFrame = SCR_UpdateScreen(context, {
  viewportWidth: 640,
  viewportHeight: 480,
  keyDest: "game",
  currentTimeMs: 0
}, {
  getCurrentSoundKhz: () => 11
});
assert.ok(inventoryFrame, "SCR_UpdateScreen inventory frame mismatch");
const inventoryPicture = inventoryFrame?.commands.find((command) => command.type === "picture" && command.pic === "inventory");
assert.ok(inventoryPicture, "CL_DrawInventory picture mismatch");
assert.ok(inventoryFrame?.commands.some((command) => command.type === "text" && command.text === "hotkey ### item"), "CL_DrawInventory header mismatch");
assert.ok(inventoryFrame?.commands.some((command) => command.type === "text" && command.text.includes("Shotgun")), "CL_DrawInventory selected item mismatch");
assert.ok(
  inventoryFrame?.commands.some(
    (command) => command.type === "text"
      && command.text.length > 0
      && [...command.text].some((char) => char.charCodeAt(0) >= 128)
  ),
  "CL_DrawInventory high-bit line mismatch"
);

SCR_DebugGraph(client, 10, 3);
const graphCommands = SCR_DrawDebugGraph(client, {
  graphheight: 32,
  graphscale: 1,
  graphshift: 0
});
assert.ok(graphCommands.length >= 2, "SCR_DrawDebugGraph command count mismatch");
assert.equal(graphCommands[0].type, "fill", "SCR_DrawDebugGraph background command mismatch");

let cdAudioStops = 0;
const playedPcx = SCR_PlayCinematic(client, "test.pcx", {
  loadBinaryFile: (path) => path === "pics/test.pcx" ? createTestPcx() : null,
  onCDAudioStop: () => {
    cdAudioStops += 1;
  }
});
assert.equal(playedPcx, true, "SCR_PlayCinematic pcx result mismatch");
assert.equal(cdAudioStops, 1, "SCR_PlayCinematic pcx CDAudio stop mismatch");
assert.equal(client.cl.cinematic.kind, "pcx-static", "SCR_PlayCinematic pcx kind mismatch");
assert.equal(client.cl.cinematic.cinematictime, 1, "SCR_PlayCinematic pcx time mismatch");
assert.equal(client.cl.cinematic.cinematicframe, -1, "SCR_PlayCinematic pcx frame mismatch");
assert.equal(client.cl.cinematic.width, 1, "SCR_PlayCinematic pcx width mismatch");
assert.equal(client.cl.cinematic.height, 1, "SCR_PlayCinematic pcx height mismatch");
assert.equal(client.cl.cinematic.name, "pics/test.pcx", "SCR_PlayCinematic pcx name mismatch");
assert.equal(client.cl.cinematic.cinematicpalette[21], 45, "SCR_PlayCinematic pcx palette red mismatch");
assert.equal(client.cl.cinematic.cinematicpalette[22], 123, "SCR_PlayCinematic pcx palette green mismatch");
assert.equal(client.cl.cinematic.cinematicpalette[23], 200, "SCR_PlayCinematic pcx palette blue mismatch");

const cinematicDraw = SCR_DrawCinematic(client, {
  viewportWidth: 640,
  viewportHeight: 480
});
assert.equal(cinematicDraw.active, true, "SCR_DrawCinematic active mismatch");
assert.equal(client.cl.cinematic.cinematicpalette_active, true, "SCR_DrawCinematic palette activation mismatch");
assert.equal(cinematicDraw.cinematic?.kind, "pcx-static", "SCR_DrawCinematic pcx snapshot kind mismatch");
assert.equal(cinematicDraw.cinematic?.pixels[0], 7, "SCR_DrawCinematic pcx snapshot pixel mismatch");
assert.deepEqual(cinematicDraw.commands, [{
  type: "picture",
  x: 0,
  y: 0,
  pic: "pics/test.pcx",
  bounds: {
    x: 0,
    y: 0,
    width: 640,
    height: 480
  }
}], "SCR_DrawCinematic command mismatch");

const cinematicMenuDraw = SCR_DrawCinematic(client, {
  viewportWidth: 640,
  viewportHeight: 480,
  keyDest: "menu"
});
assert.equal(cinematicMenuDraw.active, true, "SCR_DrawCinematic menu active mismatch");
assert.deepEqual(cinematicMenuDraw.commands, [], "SCR_DrawCinematic menu command mismatch");
assert.equal(client.cl.cinematic.cinematicpalette_active, false, "SCR_DrawCinematic menu palette mismatch");

SCR_StopCinematic(client);
assert.equal(client.cl.cinematic.cinematictime, 0, "SCR_StopCinematic time mismatch");
assert.equal(client.cl.cinematic.pic, null, "SCR_StopCinematic pic mismatch");
assert.equal(client.cl.cinematic.kind, "none", "SCR_StopCinematic kind mismatch");
assert.equal(client.cl.cinematic.name, "", "SCR_StopCinematic name mismatch");
assert.equal(client.cl.cinematic.file, null, "SCR_StopCinematic file mismatch");

const rawAudio: number[] = [];
const soundRestarts: Array<number | undefined> = [];
const playedVideo = SCR_PlayCinematic(client, "intro.cin", {
  loadBinaryFile: (path) => path === "video/intro.cin" ? createTestCin() : null,
  onCDAudioStop: () => {
    cdAudioStops += 1;
  },
  getCurrentSoundKhz: () => 11,
  onCinematicSoundRestart: (targetKhz) => {
    soundRestarts.push(targetKhz);
  },
  onCinematicRawSamples: (_count, _rate, _width, _channels, samples) => {
    rawAudio.push(...samples);
  }
});
assert.equal(playedVideo, true, "SCR_PlayCinematic video result mismatch");
assert.equal(cdAudioStops, 2, "SCR_PlayCinematic video CDAudio stop mismatch");
assert.deepEqual(soundRestarts, [14], "SCR_PlayCinematic video sound restart mismatch");
assert.equal(client.cl.cinematic.kind, "cinematic", "SCR_PlayCinematic video kind mismatch");
assert.equal(client.cl.cinematic.cinematictime, 1, "SCR_PlayCinematic video start time mismatch");
assert.equal(client.cl.cinematic.name, "video/intro.cin", "SCR_PlayCinematic video name mismatch");
assert.equal(client.cl.cinematic.width, 1, "SCR_PlayCinematic video width mismatch");
assert.equal(client.cl.cinematic.height, 1, "SCR_PlayCinematic video height mismatch");
assert.equal(client.cl.cinematic.pic?.[0], 7, "SCR_PlayCinematic video pixel mismatch");
assert.equal(rawAudio.length, 1000, "SCR_PlayCinematic video audio length mismatch");
assert.equal(rawAudio[0], 11, "SCR_PlayCinematic video audio first sample mismatch");

const videoDraw = SCR_DrawCinematic(client, {
  viewportWidth: 320,
  viewportHeight: 200
});
assert.equal(videoDraw.active, true, "SCR_DrawCinematic video active mismatch");
assert.deepEqual(videoDraw.commands, [], "SCR_DrawCinematic video command mismatch");
assert.equal(videoDraw.cinematic?.kind, "cinematic", "SCR_DrawCinematic video snapshot kind mismatch");
assert.equal(videoDraw.cinematic?.paletteRgb[21], 45, "SCR_DrawCinematic video palette mismatch");

client.cls.realtime = 150;
SCR_RunCinematic(client, { currentTimeMs: 150, keyDest: "game" }, {
  onCinematicSoundRestart: (targetKhz) => {
    soundRestarts.push(targetKhz);
  }
});
assert.equal(client.cl.cinematic.cinematictime, 0, "SCR_RunCinematic should finish the synthetic stream");
assert.equal(client.cl.screen.scr_draw_loading, 1, "SCR_RunCinematic loading plaque mismatch");
assert.deepEqual(soundRestarts, [14, undefined], "SCR_RunCinematic sound restore mismatch");

const finishOffset = client.net_message.cursize;
SCR_FinishCinematic(client);
assert.ok(client.net_message.cursize > finishOffset, "SCR_FinishCinematic should append one command");

console.log("quake2-screen-header: ok");
