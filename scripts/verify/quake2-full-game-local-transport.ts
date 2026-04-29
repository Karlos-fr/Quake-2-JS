/**
 * File: quake2-full-game-local-transport.ts
 * Purpose: Verify the in-memory qcommon transport used by the browser full-game host.
 *
 * It checks the first local client/server handshake leg: client `connect` reaches
 * the server, and the server response reaches the client as `client_connect`.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CL_CheckForResend,
  CL_InitInput,
  CL_InitLocal,
  CL_ReadPackets,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  connstate_t
} from "../../packages/client/src/index.js";
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
import { createFullGameLocalTransport } from "../../apps/web/src/full-game-local-transport.js";
import { createFullGameServerHost } from "../../apps/web/src/full-game-server-host.js";

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game local transport verification");

let now = 1000;
const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const prints: string[] = [];
const transport = createFullGameLocalTransport({
  now: () => now,
  onPrint: (message) => {
    prints.push(message);
  }
});

Cmd_Init(cmd);
Cvar_Init(cvar, cmd);

const mainContext = createClientMainContext(client, cmd, cvar);
const inputContext = createClientInputContext(client, cmd, cvar, {
  qnet: transport.clientQnet
});

const serverHost = createFullGameServerHost({
  cmd,
  cvar,
  filesystem,
  getGameDir: () => FS_Gamedir(filesystem),
  qnet: transport.serverQnet,
  onPrint: (message) => {
    prints.push(message);
  },
  onBeginLoading: () => undefined
});

CL_InitLocal(mainContext, {
  getMilliseconds: () => now,
  qnet: transport.clientQnet,
  serverRunning: () => serverHost.hasActiveGameMap(),
  onPrint: (line) => {
    prints.push(line);
  }
});
CL_InitInput(inputContext);

Cbuf_AddText(cmd, "gamemap \"*base1$start\"\n");
Cbuf_Execute(cmd);
assert.equal(serverHost.hasActiveGameMap(), true, "server host should have an active map before local connect");
assert.equal(client.cls.state, connstate_t.ca_disconnected, "client should start disconnected");

CL_CheckForResend(mainContext, {
  qnet: transport.clientQnet,
  serverRunning: () => serverHost.hasActiveGameMap(),
  onPrint: (line) => {
    prints.push(line);
  }
});

assert.equal(client.cls.state, connstate_t.ca_connecting, "client should enter connecting state");
assert.equal(transport.queuedClientToServer, 1, "client connect packet should be queued for the server");

now += 100;
serverHost.frame(100);
assert.equal(transport.queuedClientToServer, 0, "server frame should consume the client connect packet");
assert.equal(transport.queuedServerToClient > 0, true, "server should queue client_connect for the client");

const processed = CL_ReadPackets(mainContext, {
  qnet: transport.clientQnet,
  onPrint: (line) => {
    prints.push(line);
  }
});

assert.equal(processed > 0, true, "client should process the server client_connect packet");
assert.equal(client.cls.state, connstate_t.ca_connected, "client_connect should move the client to connected");
assert.equal(client.cls.netchan.message.cursize > 0, true, "client_connect should queue the source-style new command");
assert.equal(transport.queuedServerToClient, 0, "client should drain the server response packet");

console.log("quake2-full-game-local-transport: ok");
