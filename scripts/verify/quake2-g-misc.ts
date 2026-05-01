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
import { CS_LIGHTS, entity_event_t, PMF_TIME_TELEPORT, temp_event_t } from "../../packages/qcommon/src/index.js";

import {
  SP_func_explosive,
  SP_func_clock,
  SP_light,
  SOLID_BSP,
  GIB_METALLIC,
  GIB_ORGANIC,
  MOVETYPE_BOUNCE,
  MOVETYPE_TOSS,
  SP_misc_explobox,
  SP_misc_teleporter,
  SP_misc_teleporter_dest,
  SP_path_corner,
  SP_target_character,
  SP_target_string,
  attachGameClient,
  barrel_delay,
  createGameRuntimeFromBspEntities,
  damage_t,
  drainGameConfigstringUpdates,
  drainGameTempEntityEvents,
  func_explosive_explode,
  func_explosive_spawn,
  func_explosive_use,
  gib_touch,
  linkGameEntity,
  path_corner_touch,
  runPendingThinks,
  spawnGameEntity,
  target_string_use,
  ThrowGib,
  useGameEntity
} from "../../packages/game/src/index.js";

main();

function main(): void {
  verifyTeleporterMovesPlayerAndSetsTeleportState();
  verifyPathCornerAdvancesMonsterGoal();
  verifyTargetStringMapsFrames();
  verifyFuncClockBootstrapsTargetStringMessage();
  verifyMiscExploboxSpawnsShootableBarrel();
  verifyLightWritesSourceConfigstrings();
  verifyFuncExplosiveSpawnsAndExplodesBrushModel();
  verifyGibTypesSelectMovementAndTouchBehavior();

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

function verifyMiscExploboxSpawnsShootableBarrel(): void {
  const runtime = createHarnessRuntime();

  const barrel = spawnGameEntity(runtime);
  barrel.classname = "misc_explobox";
  barrel.origin = [64, 32, 16];
  barrel.s.origin = [64, 32, 16];
  SP_misc_explobox(barrel, runtime);

  assert.equal(barrel.model, "models/objects/barrels/tris.md2", "misc_explobox must use the barrel MD2 model");
  assert.equal(runtime.assets.modelPaths[barrel.s.modelindex - 1], "models/objects/barrels/tris.md2", "misc_explobox modelindex must resolve to barrels/tris.md2");
  assert.deepEqual(barrel.mins, [-16, -16, 0], "misc_explobox mins mismatch");
  assert.deepEqual(barrel.maxs, [16, 16, 40], "misc_explobox maxs mismatch");
  assert.equal(barrel.mass, 400, "misc_explobox default mass mismatch");
  assert.equal(barrel.health, 10, "misc_explobox default health mismatch");
  assert.equal(barrel.dmg, 150, "misc_explobox default damage mismatch");
  assert.equal(barrel.takedamage, damage_t.DAMAGE_YES, "misc_explobox must be shootable");
  assert.equal(barrel.die, barrel_delay, "misc_explobox must use barrel_delay as die callback");
  assert.ok(barrel.touch, "misc_explobox must expose barrel_touch");
  assert.ok(barrel.think, "misc_explobox must schedule M_droptofloor");
}

function verifyLightWritesSourceConfigstrings(): void {
  const runtime = createHarnessRuntime();

  const light = spawnGameEntity(runtime);
  light.classname = "light";
  light.targetname = "toggle_light";
  light.style = 33;
  light.spawnflags = 1;
  SP_light(light, runtime);

  assert.deepEqual(drainGameConfigstringUpdates(runtime), [{ index: CS_LIGHTS + 33, value: "a" }], "SP_light must initialize the source lightstyle configstring");

  useGameEntity(runtime, light, null, light);
  assert.deepEqual(drainGameConfigstringUpdates(runtime), [{ index: CS_LIGHTS + 33, value: "m" }], "light_use must toggle the lightstyle configstring on");
}

function verifyFuncExplosiveSpawnsAndExplodesBrushModel(): void {
  const runtime = createHarnessRuntime();

  const explosive = spawnGameEntity(runtime);
  explosive.classname = "func_explosive";
  explosive.model = "*1";
  explosive.mins = [-16, -16, 0];
  explosive.maxs = [16, 16, 32];
  explosive.mass = 100;
  explosive.dmg = 120;
  SP_func_explosive(explosive, runtime);

  assert.equal(explosive.solid, SOLID_BSP, "func_explosive must spawn solid when not trigger-spawned");
  assert.equal(explosive.s.modelindex, 2, "func_explosive must apply gi.setmodel-style inline modelindex");
  assert.equal(explosive.takedamage, damage_t.DAMAGE_YES, "untargeted func_explosive must be shootable");
  assert.equal(explosive.die, func_explosive_explode, "untargeted func_explosive must use func_explosive_explode");

  const attacker = spawnGameEntity(runtime);
  attacker.classname = "attacker";
  attacker.s.origin = [128, 0, 0];
  attacker.origin = [128, 0, 0];
  func_explosive_explode(explosive, attacker, attacker, explosive.health, runtime);

  assert.equal(runtime.entities.filter((entity) => entity.classname === "debris").length, 5, "mass 100 func_explosive must throw one large and four small debris chunks");
  assert.equal(drainGameTempEntityEvents(runtime).at(-1)?.type, temp_event_t.TE_EXPLOSION1, "func_explosive with damage must emit TE_EXPLOSION1");

  const triggerSpawned = spawnGameEntity(runtime);
  triggerSpawned.classname = "func_explosive";
  triggerSpawned.model = "*2";
  triggerSpawned.spawnflags = 1;
  SP_func_explosive(triggerSpawned, runtime);

  assert.equal(triggerSpawned.use, func_explosive_spawn, "trigger-spawned func_explosive must first expose func_explosive_spawn");
  useGameEntity(runtime, triggerSpawned, null, triggerSpawned);
  assert.equal(triggerSpawned.solid, SOLID_BSP, "func_explosive_spawn must make the brush solid");

  const targeted = spawnGameEntity(runtime);
  targeted.classname = "func_explosive";
  targeted.model = "*3";
  targeted.targetname = "boom";
  SP_func_explosive(targeted, runtime);

  assert.equal(targeted.use, func_explosive_use, "targeted func_explosive must be trigger-usable instead of shootable");
  assert.equal(targeted.takedamage, damage_t.DAMAGE_NO, "targeted func_explosive must not be shootable");
}

function verifyGibTypesSelectMovementAndTouchBehavior(): void {
  const runtime = createHarnessRuntime();
  const source = spawnGameEntity(runtime);
  source.classname = "gib_source";
  source.absmin = [0, 0, 0];
  source.size = [32, 32, 32];
  source.velocity = [0, 0, 0];

  ThrowGib(source, "models/objects/gibs/sm_meat/tris.md2", 40, GIB_ORGANIC, runtime);
  const organic = runtime.entities.at(-1)!;
  assert.equal(organic.movetype, MOVETYPE_TOSS, "organic gibs must use MOVETYPE_TOSS");
  assert.equal(organic.touch, gib_touch, "organic gibs must install gib_touch");
  assert.equal(organic.model, "models/objects/gibs/sm_meat/tris.md2", "organic gib model mismatch");

  ThrowGib(source, "models/objects/gibs/sm_metal/tris.md2", 40, GIB_METALLIC, runtime);
  const metallic = runtime.entities.at(-1)!;
  assert.equal(metallic.movetype, MOVETYPE_BOUNCE, "metallic gibs must use MOVETYPE_BOUNCE");
  assert.equal(metallic.touch, undefined, "metallic gibs must not install gib_touch");
  assert.equal(metallic.model, "models/objects/gibs/sm_metal/tris.md2", "metallic gib model mismatch");
}

function createHarnessRuntime() {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}
