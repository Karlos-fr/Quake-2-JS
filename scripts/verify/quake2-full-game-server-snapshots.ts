/**
 * File: quake2-full-game-server-snapshots.ts
 * Purpose: Verify that full-game can feed local server snapshots directly into the client parser without real networking.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCR_Init,
  createClientScreenContext
} from "../../packages/client/src/cl_scrn.js";
import { connstate_t, createClientRuntime } from "../../packages/client/src/client.js";
import {
  createVirtualFilesystem,
  FS_Gamedir,
  mountPak
} from "../../packages/filesystem/src/index.js";
import {
  Cbuf_AddText,
  Cbuf_Execute,
  Cmd_Init,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import { createFullGameCommandBridgeState, registerFullGameCommandBridge, syncFullGameLoadingState } from "../../apps/web/src/full-game-command-bridge.js";
import { createFullGameServerHost } from "../../apps/web/src/full-game-server-host.js";

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game server snapshot verification");

const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const prints: string[] = [];
let parsedFrames = 0;

Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
SCR_Init(createClientScreenContext(client, cmd, cvar));

const serverHost = createFullGameServerHost({
  cmd,
  cvar,
  filesystem,
  getGameDir: () => FS_Gamedir(filesystem),
  onPrint: (message) => {
    prints.push(message);
  },
  onBeginLoading: () => {
    client.cl.screen.scr_draw_loading = 1;
  }
});

const bridge = createFullGameCommandBridgeState();
registerFullGameCommandBridge(cmd, cvar, client, bridge, {
  onPrint: (message) => {
    prints.push(message);
  }
});

Cbuf_AddText(cmd, "loading ; killserver ; wait ; newgame\n");
Cbuf_Execute(cmd);
syncFullGameLoadingState(client, bridge);
Cbuf_Execute(cmd);
assert.equal(serverHost.hasActiveGameMap(), true, "newgame should activate a local server map");

serverHost.frame(100);
const consumed = serverHost.writeLocalClientFrame(client, {
  onFrameParsed: () => {
    parsedFrames += 1;
  },
  onPrint: (message) => {
    prints.push(message);
  },
  registerModel: (path) => path,
  registerPic: (path) => path,
  registerSkin: (path) => path,
  registerSound: (path) => path
});

assert.equal(consumed, true, "local client should consume a valid server snapshot");
assert.equal(parsedFrames, 1, "client parser should parse one server frame");
assert.equal(client.cls.state, connstate_t.ca_active, "client should become active after parsing a valid frame");
assert.equal(client.cl.frame.valid, true, "parsed server frame should be valid");
assert.ok(client.cl.frame.serverframe >= 0, "parsed frame should carry a server frame number");
assert.ok(client.cl.frame.num_entities >= 0, "server snapshot should carry a packet-entities section");
assert.equal(
  prints.some((line) => line.includes("frame gameplay ignoree")),
  false,
  "server gameplay RunFrame should not be ignored while producing snapshots"
);

console.log("quake2-full-game-server-snapshots: ok");
