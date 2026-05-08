/**
 * File: quake2-full-game-server-host.ts
 * Purpose: Verify that full-game routes `newgame -> gamemap` through the ported server commands.
 *
 * The playable full-game path continues through the loopback client/server handshake in the
 * authoritative handoff verifiers.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCR_Init,
  createClientRuntime,
  createClientScreenContext,
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
  Cmd_Exists,
  Cmd_Init,
  AREA_SOLID,
  AREA_TRIGGERS,
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

assert.ok(pakPath, "pak0.pak must be available for full-game server host verification");

const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const prints: string[] = [];

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

assert.equal(Cmd_Exists(cmd, "gamemap"), true, "server host should register gamemap");
assert.equal(Cmd_Exists(cmd, "map"), true, "server host should register map");
assert.equal(Cmd_Exists(cmd, "killserver"), true, "server host should register killserver");

const bridge = createFullGameCommandBridgeState();
registerFullGameCommandBridge(cmd, cvar, client, bridge, {
  onPrint: (message) => {
    prints.push(message);
  }
});

assert.equal(Cmd_Exists(cmd, "newgame"), true, "command bridge should still register newgame");

client.cls.state = connstate_t.ca_connected;
client.cl.screen.scr_draw_loading = 0;
Cbuf_AddText(cmd, "loading ; killserver ; wait ; newgame\n");

Cbuf_Execute(cmd);
syncFullGameLoadingState(client, bridge);
assert.equal(client.cl.screen.scr_draw_loading, 1, "loading should still activate before wait");
assert.equal(serverHost.hasActiveGameMap(), false, "server map should not run before wait is released");

Cbuf_Execute(cmd);
assert.equal(bridge.requestedMap, "*base1", "newgame should record the source base1 map");
assert.equal(serverHost.hasActiveGameMap(), true, "server host should map into an active game state");
assert.equal(serverHost.currentMapRequest, "base1", "server host should expose the active server map name");

serverHost.frame(100);
assert.equal(serverHost.hasActiveGameMap(), true, "server frame should preserve the active game map");
assert.equal(serverHost.currentMapRequest, "base1", "server frame should keep exposing the active server map name");
const linkedSolids = new Array(2048).fill(null);
const linkedSolidCount = serverHost.facade.world.SV_AreaEdicts(
  [-99999, -99999, -99999],
  [99999, 99999, 99999],
  linkedSolids,
  linkedSolids.length,
  AREA_SOLID
);
const linkedInlineBrushes = linkedSolids
  .slice(0, linkedSolidCount)
  .filter((entity) => entity?.model?.startsWith("*"));
assert.equal(linkedInlineBrushes.length > 0, true, "server-backed brush entities should be linked into SV_AreaEdicts");
assert.equal(
  linkedInlineBrushes.some((entity) => entity?.classname === "func_door" && (entity.s.modelindex ?? 0) > 0),
  true,
  "server-backed func_door should expose an inline modelindex"
);

const linkedTriggers = new Array(2048).fill(null);
const linkedTriggerCount = serverHost.facade.world.SV_AreaEdicts(
  [-99999, -99999, -99999],
  [99999, 99999, 99999],
  linkedTriggers,
  linkedTriggers.length,
  AREA_TRIGGERS
);
const inlineTriggers = linkedTriggers
  .slice(0, linkedTriggerCount)
  .filter((entity) => entity?.model?.startsWith("*") && entity.classname?.startsWith("trigger_"));
assert.equal(inlineTriggers.length > 0, true, "base1 should link hidden inline trigger brushes");

assert.equal(serverHost.writeLocalClientFrame(client), true, "server host should write a local client frame");
assert.equal(client.cl.model_draw.includes("models/objects/barrels/tris.md2"), true, "server-backed explobox barrel model should be server-precached");
assert.equal(client.cl.model_draw.includes("models/objects/debris1/tris.md2"), true, "server-backed explosion debris model should be server-precached");
assert.equal(client.cl.sound_precache.includes("doors/dr1_strt.wav"), true, "door start sound should be server-precached");
assert.equal(client.cl.sound_precache.includes("doors/dr1_mid.wav"), true, "door loop sound should be server-precached");
assert.equal(client.cl.sound_precache.includes("doors/dr1_end.wav"), true, "door end sound should be server-precached");
const hiddenTriggerModelIndices = new Set(inlineTriggers.map((entity) => entity.s.modelindex));
const frameEntityModelIndices = new Set<number>();
for (let index = 0; index < client.cl.frame.num_entities; index += 1) {
  const parseIndex = (client.cl.frame.parse_entities + index) & (client.cl_parse_entities.length - 1);
  const entity = client.cl_parse_entities[parseIndex];
  if (entity.modelindex > 0) {
    frameEntityModelIndices.add(entity.modelindex);
  }
}
for (const modelIndex of hiddenTriggerModelIndices) {
  assert.equal(frameEntityModelIndices.has(modelIndex), false, "SVF_NOCLIENT trigger brush must not be sent to the client frame");
}
assert.ok(prints.some((line) => line.includes("==== InitGame ====")), "server game init should run through game exports");
assert.equal(
  prints.some((line) => line.includes("frame gameplay ignoree")),
  false,
  "server gameplay RunFrame should have a collision bridge"
);

Cbuf_AddText(cmd, "gamemap \"base2$base1\"\n");
Cbuf_Execute(cmd);
serverHost.frame(100);
assert.equal(serverHost.currentMapRequest, "base2", "server host should update currentMapRequest after automatic gamemap changes");
assert.equal(serverHost.hasActiveGameMap(), true, "automatic gamemap should leave the server in an active game state");

console.log("quake2-full-game-server-host: ok");
