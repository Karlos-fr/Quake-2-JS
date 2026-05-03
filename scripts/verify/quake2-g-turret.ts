/**
 * File: quake2-g-turret.ts
 * Purpose: Verify the Quake II `game/g_turret.c` port against the current gameplay runtime.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `packages/game/src/g_turret.ts`.
 *
 * Dependencies:
 * - packages/game
 */

import { strict as assert } from "node:assert";

import { RF_FRAMELERP } from "../../packages/qcommon/src/index.js";
import {
  FRAMETIME,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  linkGameEntity,
  runPendingThinks,
  spawnGameEntity
} from "../../packages/game/src/index.js";
import {
  AI_DUCKED,
  AI_LOST_SIGHT,
  AI_STAND_GROUND,
  DEAD_DEAD,
  FL_NO_KNOCKBACK,
  FL_TEAMSLAVE,
  MOD_CRUSH,
  MOVETYPE_PUSH,
  SOLID_BSP,
  SVF_MONSTER,
  damage_t
} from "../../packages/game/src/g_local.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import {
  SP_turret_base,
  SP_turret_breach,
  turret_blocked,
  SP_turret_driver,
  turret_breach_think,
  turret_driver_die,
  turret_driver_think
} from "../../packages/game/src/g_turret.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";

main();

function main(): void {
  verifyTurretBreachFinishInitAndSpawnRegistry();
  verifyTurretBlocked();
  verifyTurretDriverLinkAndThink();
  verifyTurretBreachThinkFiresRocket();

  console.log("quake2-g-turret: ok");
}

function verifyTurretBreachFinishInitAndSpawnRegistry(): void {
  const runtime = createRuntime();

  const base = spawnGameEntity(runtime);
  base.classname = "turret_base";
  base.model = "*1";
  ED_CallSpawn(base, runtime);

  const muzzle = spawnGameEntity(runtime);
  muzzle.classname = "info_notnull";
  muzzle.targetname = "turret_muzzle";
  muzzle.s.origin = [128, 16, 8];
  muzzle.origin = [128, 16, 8];
  linkGameEntity(runtime, muzzle);

  const breach = spawnGameEntity(runtime);
  breach.classname = "turret_breach";
  breach.model = "*2";
  breach.target = "turret_muzzle";
  breach.s.origin = [64, 0, 0];
  breach.origin = [64, 0, 0];
  breach.s.angles = [0, 90, 0];
  breach.angles = [0, 90, 0];
  breach.properties.minpitch = "-20";
  breach.properties.maxpitch = "35";
  breach.properties.minyaw = "10";
  breach.properties.maxyaw = "120";
  breach.teammaster = base;
  base.teamchain = breach;

  ED_CallSpawn(breach, runtime);
  assert.equal(base.solid, SOLID_BSP, "SP_turret_base must use brush solidity");
  assert.equal(base.movetype, MOVETYPE_PUSH, "SP_turret_base must use pusher movement");
  assert.equal(breach.solid !== 0, true, "SP_turret_breach must initialize brush solidity");
  assert.equal(base.blocked, turret_blocked, "SP_turret_base must arm turret_blocked");
  assert.equal(breach.blocked, turret_blocked, "SP_turret_breach must arm turret_blocked");
  assert.equal(base.s.modelindex, 2, "SP_turret_base must apply gi.setmodel-style inline modelindex");
  assert.equal(breach.s.modelindex, 3, "SP_turret_breach must apply gi.setmodel-style inline modelindex");
  assert.equal(breach.speed, 50, "SP_turret_breach default speed mismatch");
  assert.equal(breach.dmg, 10, "SP_turret_breach default damage mismatch");
  assert.equal(breach.pos1[0], 20, "SP_turret_breach minpitch clamp mismatch");
  assert.equal(breach.pos2[0], -35, "SP_turret_breach maxpitch clamp mismatch");
  assert.equal(breach.pos1[1], 10, "SP_turret_breach minyaw clamp mismatch");
  assert.equal(breach.pos2[1], 120, "SP_turret_breach maxyaw clamp mismatch");

  runPendingThinks(runtime, runtime.time + FRAMETIME);

  assert.deepEqual(breach.move_origin, [64, 16, 8], "turret_breach_finish_init muzzle offset mismatch");
  assert.equal(base.dmg, breach.dmg, "turret_breach_finish_init must copy damage to teammaster");
  assert.equal(typeof breach.think, "function", "turret_breach_finish_init must arm the regular think loop");
}

function verifyTurretBlocked(): void {
  const runtime = createRuntime();

  const base = spawnGameEntity(runtime);
  base.classname = "turret_base";
  base.dmg = 7;
  const breach = spawnGameEntity(runtime);
  breach.classname = "turret_breach";
  breach.teammaster = base;

  const driver = spawnGameEntity(runtime);
  driver.classname = "turret_driver";
  attachGameClient(driver);
  base.owner = driver;

  const monsterBlocker = spawnGameEntity(runtime);
  monsterBlocker.classname = "monster_blocker";
  monsterBlocker.takedamage = damage_t.DAMAGE_YES;
  monsterBlocker.svflags |= SVF_MONSTER;
  monsterBlocker.health = 100;

  turret_blocked(breach, monsterBlocker, runtime);

  assert.equal(monsterBlocker.health, 86, "turret_blocked must use teammaster damage and owner attacker");
  assert.equal(monsterBlocker.enemy, driver, "turret_blocked must credit the turret owner as attacker");
  assert.equal(runtime.meansOfDeath, MOD_CRUSH, "turret_blocked damage mod mismatch");

  base.owner = null;
  const crateBlocker = spawnGameEntity(runtime);
  crateBlocker.classname = "crate_blocker";
  crateBlocker.takedamage = damage_t.DAMAGE_YES;
  crateBlocker.health = 50;

  turret_blocked(breach, crateBlocker, runtime);

  assert.equal(crateBlocker.health, 43, "turret_blocked must fall back to teammaster attacker");
  assert.equal(runtime.meansOfDeath, MOD_CRUSH, "turret_blocked fallback damage mod mismatch");

  const inertBlocker = spawnGameEntity(runtime);
  inertBlocker.classname = "inert_blocker";
  inertBlocker.takedamage = damage_t.DAMAGE_NO;
  inertBlocker.health = 25;
  runtime.meansOfDeath = 0;

  turret_blocked(breach, inertBlocker, runtime);

  assert.equal(inertBlocker.health, 25, "turret_blocked must ignore non-damageable blockers");
  assert.equal(runtime.meansOfDeath, 0, "turret_blocked must not emit damage for non-damageable blockers");
}

function verifyTurretDriverLinkAndThink(): void {
  const runtime = createRuntime();
  runtime.collision = {
    world: {} as never,
    trace: () => ({
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [0, 0, 0],
      plane: { normal: [0, 0, 0], dist: 0, type: 0, signbits: 0, pad: [0, 0] },
      surface: null,
      contents: 0,
      ent: null
    }),
    pointcontents: () => 0
  };

  const base = spawnGameEntity(runtime);
  base.classname = "turret_base";
  SP_turret_base(base, runtime);

  const breach = spawnGameEntity(runtime);
  breach.classname = "turret_breach";
  breach.targetname = "breach_target";
  breach.s.origin = [128, 0, 32];
  breach.origin = [128, 0, 32];
  breach.s.angles = [0, 45, 0];
  breach.angles = [0, 45, 0];
  breach.teammaster = base;
  base.teamchain = breach;
  SP_turret_breach(breach, runtime);

  const driver = spawnGameEntity(runtime);
  driver.classname = "turret_driver";
  driver.target = "breach_target";
  driver.s.origin = [64, -64, 48];
  driver.origin = [64, -64, 48];
  SP_turret_driver(driver, runtime);

  runPendingThinks(runtime, runtime.time + FRAMETIME);

  assert.equal(driver.target_ent, breach, "turret_driver_link target_ent mismatch");
  assert.equal(breach.owner, driver, "turret_driver_link must own the breach");
  assert.equal(base.owner, driver, "turret_driver_link must own the teammaster");
  assert.equal(base.teamchain, breach, "turret team chain head mismatch");
  assert.equal(breach.teamchain, driver, "turret_driver_link must append driver to team chain");
  assert.equal(driver.teammaster, base, "turret_driver_link teammaster mismatch");
  assert.equal((driver.flags & FL_TEAMSLAVE) !== 0, true, "turret_driver_link must set FL_TEAMSLAVE");
  assert.equal(driver.move_origin[0] > 0, true, "turret_driver_link mount distance mismatch");

  const enemy = spawnGameEntity(runtime);
  enemy.classname = "player";
  attachGameClient(enemy);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.viewheight = 24;
  enemy.s.origin = [256, 32, 64];
  enemy.origin = [256, 32, 64];

  driver.enemy = enemy;
  driver.monsterinfo.trail_time = 0;
  runtime.time = 5;
  runtime.skill = 1;

  turret_driver_think(driver, runtime);

  assert.notDeepEqual(breach.move_angles, [0, 0, 0], "turret_driver_think must steer the breach");
  assert.equal((breach.spawnflags & 65536) !== 0, true, "turret_driver_think must arm the fire flag");
  assert.equal(driver.monsterinfo.attack_finished, 8, "turret_driver_think attack cooldown must include reaction_time + 1");

  breach.spawnflags &= ~65536;
  driver.monsterinfo.trail_time = runtime.time - 1.5;
  driver.monsterinfo.attack_finished = 0;
  turret_driver_think(driver, runtime);
  assert.equal((breach.spawnflags & 65536) === 0, true, "turret_driver_think must wait for reaction_time before firing");
  assert.equal(driver.monsterinfo.attack_finished, 0, "turret_driver_think must not start cooldown before reaction_time");

  driver.monsterinfo.trail_time = 0;
  driver.monsterinfo.attack_finished = runtime.time + 1;
  turret_driver_think(driver, runtime);
  assert.equal((breach.spawnflags & 65536) === 0, true, "turret_driver_think must honor existing attack cooldown");

  runtime.collision.trace = () => ({
    allsolid: false,
    startsolid: false,
    fraction: 0.5,
    endpos: [0, 0, 0],
    plane: { normal: [0, 0, 0], dist: 0, type: 0, signbits: 0, pad: [0, 0] },
    surface: null,
    contents: 0,
    ent: null
  });
  driver.monsterinfo.aiflags &= ~AI_LOST_SIGHT;
  driver.monsterinfo.attack_finished = 0;
  breach.spawnflags &= ~65536;
  turret_driver_think(driver, runtime);
  assert.equal((driver.monsterinfo.aiflags & AI_LOST_SIGHT) !== 0, true, "turret_driver_think must mark lost sight and return");
  assert.equal((breach.spawnflags & 65536) === 0, true, "turret_driver_think must not fire when enemy is not visible");

  enemy.health = 0;
  turret_driver_think(driver, runtime);
  assert.equal(driver.enemy, null, "turret_driver_think must clear dead enemies");

  breach.move_angles[0] = 25;
  turret_driver_die(driver, null, enemy, 25, runtime);
  assert.equal(breach.move_angles[0], 0, "turret_driver_die must level the turret pitch");
  assert.equal(breach.owner, null, "turret_driver_die must clear breach owner");
  assert.equal(base.owner, null, "turret_driver_die must clear teammaster owner");
  assert.equal(breach.teamchain, null, "turret_driver_die must unlink driver from team chain");
  assert.equal((driver.flags & FL_TEAMSLAVE) === 0, true, "turret_driver_die must clear FL_TEAMSLAVE");
  assert.equal(driver.deadflag, DEAD_DEAD, "turret_driver_die must delegate to infantry_die");
  assert.ok(driver.monsterinfo.currentmove, "turret_driver_die must select an infantry death move");
  assert.equal(runtime.soundEvents.at(-1)?.soundPath.startsWith("infantry/inf"), true, "turret_driver_die infantry death sound mismatch");
}

function verifyTurretBreachThinkFiresRocket(): void {
  const runtime = createRuntime();
  runtime.skill = 2;

  const base = spawnGameEntity(runtime);
  base.classname = "turret_base";
  SP_turret_base(base, runtime);

  const breach = spawnGameEntity(runtime);
  breach.classname = "turret_breach";
  breach.teammaster = base;
  base.teamchain = breach;
  breach.owner = createDriver(runtime);
  base.owner = breach.owner;
  breach.speed = 50;
  breach.s.origin = [100, 200, 300];
  breach.origin = [100, 200, 300];
  breach.s.angles = [0, 90, 0];
  breach.angles = [0, 90, 0];
  breach.move_origin = [32, 0, 8];
  breach.move_angles = [5, 100, 0];
  breach.pos1 = [30, 0, 0];
  breach.pos2 = [-30, 180, 0];
  breach.spawnflags |= 65536;

  const driver = breach.owner!;
  driver.s.origin = [80, 180, 320];
  driver.origin = [80, 180, 320];
  driver.move_origin = [24, 45, 12];
  driver.velocity = [0, 0, 0];
  driver.avelocity = [0, 0, 0];

  turret_breach_think(breach, runtime);

  const rocket = runtime.entities.find((entity) => entity.classname === "rocket");
  assert.ok(rocket, "turret_breach_think must spawn a rocket when the fire flag is armed");
  assert.equal((breach.spawnflags & 65536) === 0, true, "turret_breach_think must clear the fire flag after firing");
  assert.equal(base.avelocity[1], breach.avelocity[1], "turret_breach_think must propagate yaw angular velocity to the base");
  assert.equal(driver.velocity.some((value) => value !== 0), true, "turret_breach_think must update driver mount velocity");
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "weapons/rocklf1a.wav", "turret_breach_think fire sound mismatch");
}

function createRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 4;
  return runtime;
}

function createDriver(runtime: GameRuntime): GameEntity {
  const driver = spawnGameEntity(runtime);
  driver.classname = "turret_driver";
  driver.health = 100;
  driver.takedamage = damage_t.DAMAGE_AIM;
  driver.svflags |= SVF_MONSTER;
  driver.flags |= FL_NO_KNOCKBACK;
  driver.monsterinfo.aiflags |= AI_STAND_GROUND | AI_DUCKED;
  driver.s.renderfx |= RF_FRAMELERP;
  return driver;
}
