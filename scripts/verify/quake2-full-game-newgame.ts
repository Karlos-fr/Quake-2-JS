/**
 * File: quake2-full-game-newgame.ts
 * Purpose: Verify the legacy local-session harness still resolves full-game `newgame/gamemap` targets.
 *
 * It is kept for transitional demo/tests only; active full-game uses the local authoritative server path.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CL_InitInput,
  CL_InitLocal,
  V_Init,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  createClientViewContext,
  connstate_t
} from "../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  mountPak
} from "../../packages/filesystem/src/index.js";
import {
  Cmd_Init,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  createFullGameLocalSession,
  resolveFullGameMapTarget
} from "../../apps/web/src/full-game-local-session.js";

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game newgame verification");

const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
CL_InitLocal(createClientMainContext(client, cmd, cvar));
V_Init(createClientViewContext(client, cmd, cvar));
const inputContext = createClientInputContext(client, cmd, cvar);
CL_InitInput(inputContext);

const target = resolveFullGameMapTarget("*base1$start");
assert.deepEqual(target, {
  mapName: "base1",
  mapPath: "maps/base1.bsp",
  spawnpoint: "start"
}, "newgame map target mismatch");

const session = createFullGameLocalSession({
  filesystem,
  client,
  inputContext,
  cvar,
  mapRequest: "*base1$start"
});

assert.equal(session.mapName, "base1", "session map name mismatch");
assert.equal(session.mapPath, "maps/base1.bsp", "session map path mismatch");
assert.equal(session.spawnpoint, "start", "session spawnpoint mismatch");
assert.ok(session.spawn, "session should resolve an info_player_start");
assert.equal(client.cls.state, connstate_t.ca_active, "legacy local session should activate the client");
assert.equal(client.cl.frame.valid, true, "legacy local session should produce a valid client frame");
assert.ok(session.refreshFrame.entities.length > 0, "legacy local session should expose render entities");

const firstServerFrame = client.cl.frame.serverframe;
session.update(0.1);
assert.ok(client.cl.frame.serverframe > firstServerFrame, "legacy local session should advance client frames");
assert.ok(session.getBrushModelSnapshots().length >= 0, "brush model snapshots should be available");

console.log("quake2-full-game-newgame: ok");
