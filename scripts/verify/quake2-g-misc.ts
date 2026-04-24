/**
 * File: quake2-g-misc.ts
 * Purpose: Verify the gameplay-side world helper and specialty entity behaviors ported from `game/g_misc.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for `g_misc.ts`.
 *
 * Dependencies:
 * - packages/game
 */

import { strict as assert } from "node:assert";
import { entity_event_t, PMF_TIME_TELEPORT } from "../../packages/qcommon/src/index.js";

import {
  SP_func_clock,
  SP_misc_teleporter,
  SP_misc_teleporter_dest,
  SP_path_corner,
  SP_target_character,
  SP_target_string,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  linkGameEntity,
  path_corner_touch,
  runPendingThinks,
  spawnGameEntity,
  target_string_use,
  useGameEntity
} from "../../packages/game/src/index.js";

main();

function main(): void {
  verifyTeleporterMovesPlayerAndSetsTeleportState();
  verifyPathCornerAdvancesMonsterGoal();
  verifyTargetStringMapsFrames();
  verifyFuncClockBootstrapsTargetStringMessage();

  console.log("quake2-g-misc: ok");
}

function verifyTeleporterMovesPlayerAndSetsTeleportState(): void {
  const runtime = createHarnessRuntime();

  const destination = spawnGameEntity(runtime);
  destination.classname = "misc_teleporter_dest";
  destination.targetname = "exit";
  destination.origin = [100, 200, 300];
  destination.s.origin = [100, 200, 300];
  SP_misc_teleporter_dest(destination, runtime);

  const teleporter = spawnGameEntity(runtime);
  teleporter.classname = "misc_teleporter";
  teleporter.target = "exit";
  teleporter.origin = [0, 0, 0];
  teleporter.s.origin = [0, 0, 0];
  SP_misc_teleporter(teleporter, runtime);

  const trigger = runtime.entities.find((entity) => entity.classname === "teleporter_trigger");
  assert.ok(trigger?.touch, "misc_teleporter must spawn one touch trigger");

  const player = spawnGameEntity(runtime);
  player.classname = "player";
  attachGameClient(player);
  player.client!.resp.cmd_angles = [0, 0, 0];
  player.origin = [10, 20, 30];
  player.s.origin = [10, 20, 30];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  linkGameEntity(runtime, player);

  trigger.touch!(trigger, player, runtime);

  assert.deepEqual(player.origin, [100, 200, 310], "teleporter touch must move player to destination + 10 on Z");
  assert.equal((player.client!.ps.pmove.pm_flags & PMF_TIME_TELEPORT) !== 0, true, "teleporter touch must set PMF_TIME_TELEPORT");
  assert.equal(player.s.event, entity_event_t.EV_PLAYER_TELEPORT, "teleporter touch must emit EV_PLAYER_TELEPORT on the player");
}

function verifyPathCornerAdvancesMonsterGoal(): void {
  const runtime = createHarnessRuntime();

  const nextCorner = spawnGameEntity(runtime);
  nextCorner.classname = "path_corner";
  nextCorner.targetname = "corner_b";
  nextCorner.origin = [128, 0, 0];
  nextCorner.s.origin = [128, 0, 0];
  SP_path_corner(nextCorner, runtime);

  const corner = spawnGameEntity(runtime);
  corner.classname = "path_corner";
  corner.targetname = "corner_a";
  corner.target = "corner_b";
  corner.origin = [0, 0, 0];
  corner.s.origin = [0, 0, 0];
  SP_path_corner(corner, runtime);

  const monster = spawnGameEntity(runtime);
  monster.classname = "monster";
  monster.movetarget = corner;
  monster.s.origin = [0, 0, 0];
  monster.origin = [0, 0, 0];

  path_corner_touch(corner, monster, runtime);

  assert.equal(monster.movetarget, nextCorner, "path_corner touch must advance movetarget to next corner");
  assert.equal(monster.goalentity, nextCorner, "path_corner touch must sync goalentity");
  assert.equal(monster.ideal_yaw, 0, "path_corner touch must compute yaw toward the next goal");
}

function verifyTargetStringMapsFrames(): void {
  const runtime = createHarnessRuntime();

  const display = spawnGameEntity(runtime);
  display.classname = "target_string";
  display.message = "12:-";
  SP_target_string(display, runtime);

  const char1 = spawnGameEntity(runtime);
  char1.classname = "target_character";
  char1.team = "display";
  char1.count = 1;
  SP_target_character(char1, runtime);

  const char2 = spawnGameEntity(runtime);
  char2.classname = "target_character";
  char2.team = "display";
  char2.count = 2;
  SP_target_character(char2, runtime);

  display.teammaster = char1;
  char1.teamchain = char2;

  target_string_use(display, null, null, runtime);

  assert.equal(char1.s.frame, 1, "target_string must map first digit");
  assert.equal(char2.s.frame, 2, "target_string must map second digit");
}

function verifyFuncClockBootstrapsTargetStringMessage(): void {
  const runtime = createHarnessRuntime();

  const stringTarget = spawnGameEntity(runtime);
  stringTarget.classname = "target_string";
  stringTarget.targetname = "clock_display";
  stringTarget.message = "";
  SP_target_string(stringTarget, runtime);

  const clock = spawnGameEntity(runtime);
  clock.classname = "func_clock";
  clock.target = "clock_display";
  clock.spawnflags = 1;
  clock.style = 1;
  clock.count = 3;
  SP_func_clock(clock, runtime);

  useGameEntity(runtime, clock, null, clock);
  runPendingThinks(runtime, runtime.time + 1);

  assert.ok(stringTarget.message && stringTarget.message.length >= 4, "func_clock must write a formatted target_string message");
}

function createHarnessRuntime() {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}
