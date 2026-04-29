/**
 * File: quake2-full-game-authoritative-handshake.ts
 * Purpose: Verify the full-game server-authoritative startup path without the legacy local-session harness.
 *
 * It drives `newgame -> SV_Map -> local loopback connect -> new/configstrings/baselines/precache/begin`
 * until the client reaches `ca_active` with refresh prepared.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CL_Frame,
  CL_InitInput,
  CL_InitLocal,
  CL_PrepRefresh,
  CL_ReadPackets,
  SCR_Init,
  connstate_t,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  createClientScreenContext,
  createClientSendCmdBridge,
  createRefExport
} from "../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  FS_Gamedir,
  mountPak,
  readMountedFile
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
import { createFullGameLocalTransport } from "../../apps/web/src/full-game-local-transport.js";
import { createFullGameServerHost } from "../../apps/web/src/full-game-server-host.js";

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game authoritative handshake verification");

let now = 1000;
const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const prints: string[] = [];
let prepRefreshCount = 0;

const transport = createFullGameLocalTransport({
  now: () => now,
  onPrint: (message) => {
    prints.push(message);
  }
});

Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
SCR_Init(createClientScreenContext(client, cmd, cvar));

const mainContext = createClientMainContext(client, cmd, cvar);
const inputContext = createClientInputContext(client, cmd, cvar, {
  qnet: transport.clientQnet
});
const sendClientCommand = createClientSendCmdBridge(inputContext);
const ref = createRefExport();

const prepRefresh = (): void => {
  prepRefreshCount += 1;
  const result = CL_PrepRefresh(client, {
    ref,
    viewportWidth: 640,
    viewportHeight: 480,
    crosshairValue: 0,
    onPrint: (message) => {
      prints.push(message);
    },
    onUpdateScreen: () => undefined,
    onPumpEvents: () => undefined
  });
  assert.ok(result, "CL_PrepRefresh should prepare a server-backed world model");
};

CL_InitLocal(mainContext, {
  getMilliseconds: () => now,
  qnet: transport.clientQnet,
  serverRunning: () => serverHost.hasActiveGameMap(),
  allowDownload: false,
  fileExists: (path) => readMountedFile(filesystem, path) !== null,
  loadBinaryFile: (path) => readMountedFile(filesystem, path)?.bytes ?? null,
  onPrepRefresh: prepRefresh,
  onRegisterSounds: () => undefined,
  onBegin: () => undefined,
  onPrint: (message) => {
    prints.push(message);
  }
});
CL_InitInput(inputContext);

const serverHost = createFullGameServerHost({
  cmd,
  cvar,
  filesystem,
  getGameDir: () => FS_Gamedir(filesystem),
  qnet: transport.serverQnet,
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

const createClientHooks = (withReadPackets: boolean) => ({
  getMilliseconds: () => now,
  qnet: transport.clientQnet,
  serverRunning: () => serverHost.hasActiveGameMap(),
  onPrint: (message: string) => {
    prints.push(message);
  },
  onStufftext: (text: string) => {
    Cbuf_AddText(cmd, text);
  },
  onExecuteCommandBuffer: () => {
    Cbuf_Execute(cmd);
  },
  ...(withReadPackets ? {
    onReadPackets: () => {
      CL_ReadPackets(mainContext, createClientHooks(false));
    }
  } : {}),
  onSendCmd: sendClientCommand,
  onPrepRefresh: prepRefresh,
  onRegisterSounds: () => undefined,
  onBegin: () => undefined,
  registerModel: (path: string) => path,
  registerSkin: (path: string) => path,
  registerPic: (path: string) => path,
  registerSound: (path: string) => path
});

Cbuf_AddText(cmd, "loading ; killserver ; wait ; newgame\n");
Cbuf_Execute(cmd);
syncFullGameLoadingState(client, bridge);
Cbuf_Execute(cmd);

assert.equal(bridge.requestedMap, "*base1", "newgame should request the source base1 map");
assert.equal(serverHost.hasActiveGameMap(), true, "newgame should activate the local authoritative server");
assert.equal(client.cls.state, connstate_t.ca_disconnected, "client should still need the loopback handshake");

for (let frame = 0; frame < 80; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  try {
    CL_Frame(mainContext, 100, createClientHooks(true));
    serverHost.frame(100);
    CL_ReadPackets(mainContext, createClientHooks(false));
    Cbuf_Execute(cmd);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    const bytes = Array.from(
      transport.clientQnet.net_message.data.subarray(0, transport.clientQnet.net_message.cursize)
    ).join(",");
    throw new Error(
      `authoritative handshake failed at frame ${frame}, state ${client.cls.state}, `
      + `packet ${transport.clientQnet.net_message.cursize}/${transport.clientQnet.net_message.readcount} `
      + `[${bytes}]: ${message}`
    );
  }

  if (client.cls.state === connstate_t.ca_active && client.cl.refresh_prepped) {
    break;
  }
}

assert.equal(client.cls.state, connstate_t.ca_active, "source handshake should move the client to active");
assert.equal(client.cl.refresh_prepped, true, "client refresh should be prepared before entering game mode");
assert.equal(client.cl.frame.valid, true, "client should parse an authoritative server frame");
assert.equal(prepRefreshCount >= 1, true, "precache should invoke CL_PrepRefresh");
assert.equal(
  prints.some((line) => line.includes("session locale active")),
  false,
  "authoritative startup must not activate the legacy local-session harness"
);

console.log("quake2-full-game-authoritative-handshake: ok");
