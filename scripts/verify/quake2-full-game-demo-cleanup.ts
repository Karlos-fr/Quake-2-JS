/**
 * File: quake2-full-game-demo-cleanup.ts
 * Purpose: Verify full-game keeps demo/local-session shortcuts out of the authoritative path.
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
  createClientViewContext
} from "../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  mountPak
} from "../../packages/filesystem/src/index.js";
import {
  CS_MODELS,
  DF_INFINITE_AMMO,
  STAT_LAYOUTS,
  Cmd_Init,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import { FindItem } from "../../packages/game/src/index.js";
import { createFullGameLocalSession } from "../../apps/web/src/full-game-local-session.js";

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game demo cleanup verification");

const fullGameLocalSessionSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "full-game-local-session.ts"),
  "utf8"
);
const fullGameSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "full-game.ts"),
  "utf8"
);
const renderLoopSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "full-game-render-loop.ts"),
  "utf8"
);
const webDemoLoopSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "web-demo-loop.ts"),
  "utf8"
);
assert.equal(
  fullGameSource.includes("full-game-local-session"),
  false,
  "authoritative full-game must not import the legacy local-session harness"
);
assert.equal(
  fullGameSource.includes("createFullGameLocalSession"),
  false,
  "authoritative full-game must not create the legacy local-session harness"
);
assert.equal(
  fullGameLocalSessionSource.includes("./local-client-controller.js"),
  false,
  "legacy local-session harness must not import the standalone demo controller"
);
assert.equal(
  fullGameLocalSessionSource.includes("demoInventory: false"),
  true,
  "legacy local-session harness must opt out of demo inventory grants"
);
assert.equal(
  fullGameLocalSessionSource.includes("ghostMode: false"),
  true,
  "legacy local-session harness must opt out of demo ghost movement"
);
assert.equal(
  renderLoopSource.includes("hudBindings = {}"),
  true,
  "shared full-game render loop must not default to demo HUD hotkeys"
);
assert.equal(
  webDemoLoopSource.includes("hudBindings: LOCAL_DEMO_HUD_WEAPON_BINDINGS"),
  true,
  "standalone web demo must opt in to demo HUD hotkeys explicitly"
);

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

const session = createFullGameLocalSession({
  filesystem,
  client,
  inputContext,
  cvar,
  mapRequest: "*base1$start"
});

const gameplayClient = session.gameplayRuntime.entities.find((entity) => entity.classname === "player")?.client;
assert.ok(gameplayClient, "legacy local-session player should have a gameplay client");
assert.equal(session.gameplayRuntime.dmflags & DF_INFINITE_AMMO, 0, "legacy local-session harness must not enable demo infinite ammo");

const blaster = FindItem("Blaster");
const shotgun = FindItem("Shotgun");
assert.ok(blaster, "Blaster item should exist");
assert.ok(shotgun, "Shotgun item should exist");
assert.equal(gameplayClient!.pers.inventory[blaster!.index], 1, "legacy local-session harness should keep source default Blaster");
assert.equal(gameplayClient!.pers.inventory[shotgun!.index] ?? 0, 0, "legacy local-session harness should not grant demo Shotgun");

session.setScoreboardVisible(true);
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 1) !== 0, true, "Tab should expose the scoreboard layout bit");
session.setScoreboardVisible(false);
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 1) !== 0, false, "Tab release should clear the scoreboard layout bit");
session.toggleInventory();
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 2) !== 0, true, "I should toggle the inventory layout bit");
session.toggleInventory();
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 2) !== 0, false, "I should toggle inventory off");

session.update(0.1);
assert.equal(session.gameplayRuntime.dmflags & DF_INFINITE_AMMO, 0, "legacy local-session update must not refill demo infinite ammo");
assert.equal(gameplayClient!.pers.inventory[shotgun!.index] ?? 0, 0, "legacy local-session update must not refill demo weapons");
assert.ok(client.cl.frame.playerstate.gunindex > 0, "legacy local-session update should preserve the Blaster view model");
assert.equal(
  client.cl.configstrings[CS_MODELS + client.cl.frame.playerstate.gunindex],
  "models/weapons/v_blast/tris.md2",
  "legacy local-session Blaster view model configstring mismatch"
);

console.log("quake2-full-game-demo-cleanup: ok");
