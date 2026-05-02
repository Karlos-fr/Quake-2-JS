/**
 * File: quake2-g-weapon.ts
 * Purpose: Verify focused world weapon behavior ported from `game/g_weapon.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for `g_weapon.ts`.
 */

import { strict as assert } from "node:assert";

import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  DAMAGE_NO_KNOCKBACK,
  damage_t,
  MOD_HIT,
  SVF_MONSTER,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { fire_blaster, fire_hit } from "../../packages/game/src/g_weapon.js";
import { MASK_SHOT, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyCheckDodgeRuntimeBranch();
  verifyCheckDodgeEasySkillGate();
  verifyCheckDodgeRequiresClientProjectile();
  verifyFireHitFrontRangeDamageAndKnockback();
  verifyFireHitSideAimAdjustmentAndRangeGate();
  verifyFireHitBlocksOnNonDamageableTrace();

  console.log("Verification g_weapon - check_dodge and fire_hit lots OK");
}

function verifyCheckDodgeRuntimeBranch(): void {
  const runtime = createHarnessRuntime();
  runtime.skill = 1;

  const shooter = createPlayer(runtime, 1);
  shooter.s.origin = [0, 0, 0];
  shooter.origin = [...shooter.s.origin];

  const dodger = createDodgingMonster(runtime, 2);
  dodger.s.origin = [110, 0, 0];
  dodger.origin = [...dodger.s.origin];
  dodger.s.angles = [0, 180, 0];
  dodger.maxs = [16, 16, 32];

  const dodgeCalls: Array<{ attacker: GameEntity | null; eta: number }> = [];
  dodger.monsterinfo.dodge = (_self, attacker, eta) => {
    dodgeCalls.push({ attacker, eta });
  };

  const traces: Array<{ start: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
      if (passent === shooter && mask === MASK_SHOT) {
        return makeTrace(0.5, [110, 0, 0], dodger);
      }
      return makeTrace(1, end, null);
    },
    pointcontents: () => 0
  };

  fire_blaster(shooter, [10, 0, 0], [1, 0, 0], 15, 200, 0, false, runtime);

  assert.equal(dodgeCalls.length, 1, "check_dodge must call monsterinfo.dodge for a live monster in front");
  assert.equal(dodgeCalls[0]?.attacker, shooter, "check_dodge must pass the projectile owner as attacker");
  assert.equal(dodgeCalls[0]?.eta, (100 - 16) / 200, "check_dodge eta must match (distance - maxs[0]) / speed");
  assert.deepEqual(traces[0]?.start, [10, 0, 0], "check_dodge trace must start at projectile origin");
  assert.deepEqual(traces[0]?.end, [8202, 0, 0], "check_dodge trace must extend 8192 units along dir");
  assert.equal(traces[0]?.passent, shooter, "check_dodge trace must ignore the firing entity");
  assert.equal(traces[0]?.mask, MASK_SHOT, "check_dodge trace mask must be MASK_SHOT");
}

function verifyCheckDodgeEasySkillGate(): void {
  const runtime = createHarnessRuntime();
  runtime.skill = 0;

  const shooter = createPlayer(runtime, 1);
  const dodger = createDodgingMonster(runtime, 2);
  dodger.s.origin = [110, 0, 0];
  dodger.s.angles = [0, 180, 0];

  let traceCount = 0;
  let dodgeCount = 0;
  dodger.monsterinfo.dodge = () => {
    dodgeCount += 1;
  };
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end, passent, mask) => {
      traceCount += 1;
      if (passent === shooter && mask === MASK_SHOT) {
        return makeTrace(0.5, [110, 0, 0], dodger);
      }
      return makeTrace(1, end, null);
    },
    pointcontents: () => 0
  };

  withMathRandom([0.26], () => {
    fire_blaster(shooter, [10, 0, 0], [1, 0, 0], 15, 200, 0, false, runtime);
  });
  assert.equal(traceCount, 1, "easy skill random > 0.25 must skip the dodge trace before projectile backtrace");
  assert.equal(dodgeCount, 0, "easy skill random > 0.25 must not dodge");

  traceCount = 0;
  withMathRandom([0.25], () => {
    fire_blaster(shooter, [10, 0, 0], [1, 0, 0], 15, 200, 0, false, runtime);
  });
  assert.equal(traceCount, 2, "easy skill random <= 0.25 must run the dodge trace plus projectile backtrace");
  assert.equal(dodgeCount, 1, "easy skill random <= 0.25 may dodge");
}

function verifyCheckDodgeRequiresClientProjectile(): void {
  const runtime = createHarnessRuntime();
  const monsterShooter = createRuntimeEntity({ classname: "monster_soldier" }, 1);
  monsterShooter.s.origin = [0, 0, 0];
  monsterShooter.origin = [...monsterShooter.s.origin];
  runtime.entities[1] = monsterShooter;

  let traceCount = 0;
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => {
      traceCount += 1;
      return makeTrace(1, end, null);
    },
    pointcontents: () => 0
  };

  fire_blaster(monsterShooter, [10, 0, 0], [1, 0, 0], 15, 200, 0, false, runtime);

  assert.equal(traceCount, 1, "check_dodge must be reached only for client-fired non-instant attacks");
}

function verifyFireHitFrontRangeDamageAndKnockback(): void {
  const runtime = createHarnessRuntime();
  const attacker = createMeleeMonster(runtime, 1);
  const enemy = createMeleeMonster(runtime, 2);
  attacker.s.origin = [0, 0, 0];
  attacker.origin = [...attacker.s.origin];
  attacker.s.angles = [0, 0, 0];
  attacker.mins = [-16, -16, -24];
  attacker.maxs = [16, 16, 32];
  attacker.enemy = enemy;
  enemy.s.origin = [50, 0, 0];
  enemy.origin = [...enemy.s.origin];
  enemy.mins = [-16, -16, -24];
  enemy.maxs = [16, 16, 32];
  enemy.absmin = [34, -16, -24];
  enemy.size = [32, 32, 56];
  enemy.groundentity = createRuntimeEntity({ classname: "ground" }, 3);

  const traces: Array<{ start: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
      return makeTrace(0.5, end, enemy);
    },
    pointcontents: () => 0
  };

  const damageCalls: Array<{
    target: GameEntity;
    dir: vec3_t;
    point: vec3_t;
    damage: number;
    knockback: number;
    dflags: number;
    mod: number;
  }> = [];
  const hit = fire_hit(attacker, [80, 0, 0], 20, 100, runtime, {
    T_Damage: (target, _inflictor, _attacker, dir, point, _normal, damage, knockback, dflags, mod) => {
      damageCalls.push({ target, dir: [...dir], point: [...point], damage, knockback, dflags, mod });
    }
  });

  assert.equal(hit, true, "fire_hit must report true after damaging a client/monster target");
  assert.deepEqual(traces[0]?.start, [0, 0, 0], "fire_hit trace must start at attacker origin");
  assert.deepEqual(traces[0]?.end, [1700, 0, 0], "front fire_hit trace must use range backed up by enemy bbox");
  assert.equal(traces[0]?.passent, attacker, "fire_hit trace must ignore the attacker");
  assert.equal(traces[0]?.mask, MASK_SHOT, "fire_hit trace mask must be MASK_SHOT");
  assert.equal(damageCalls.length, 1, "fire_hit must call T_Damage exactly once");
  assert.equal(damageCalls[0]?.target, enemy, "fire_hit must damage the traced enemy");
  assert.deepEqual(damageCalls[0]?.point, [34, 0, 0], "front fire_hit damage point must use backed-up range");
  assert.deepEqual(damageCalls[0]?.dir, [-16, 0, 0], "fire_hit damage dir must point from enemy origin to impact point");
  assert.equal(damageCalls[0]?.damage, 20, "fire_hit must preserve damage");
  assert.equal(damageCalls[0]?.knockback, 50, "fire_hit must pass kick / 2 to T_Damage");
  assert.equal(damageCalls[0]?.dflags, DAMAGE_NO_KNOCKBACK, "fire_hit must suppress normal T_Damage knockback");
  assert.equal(damageCalls[0]?.mod, MOD_HIT, "fire_hit damage mode must be MOD_HIT");
  assert.ok(enemy.velocity[0] > 0, "fire_hit must apply its special knockback to the intended enemy");
  assert.equal(enemy.groundentity, null, "upward special knockback must clear groundentity");
}

function verifyFireHitSideAimAdjustmentAndRangeGate(): void {
  const runtime = createHarnessRuntime();
  const attacker = createMeleeMonster(runtime, 1);
  const enemy = createMeleeMonster(runtime, 2);
  attacker.enemy = enemy;
  attacker.s.origin = [0, 0, 0];
  attacker.origin = [...attacker.s.origin];
  attacker.s.angles = [0, 0, 0];
  attacker.mins = [-16, -16, -24];
  attacker.maxs = [16, 16, 32];
  enemy.s.origin = [50, 0, 0];
  enemy.origin = [...enemy.s.origin];
  enemy.mins = [-24, -24, -24];
  enemy.maxs = [24, 24, 32];
  enemy.absmin = [26, -24, -24];
  enemy.size = [48, 48, 56];

  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => makeTrace(0.5, end, enemy),
    pointcontents: () => 0
  };

  const sideAim: vec3_t = [80, -20, 8];
  assert.equal(fire_hit(attacker, sideAim, 10, 0, runtime, { T_Damage: () => undefined }), true);
  assert.equal(sideAim[1], enemy.mins[0], "side fire_hit must mutate aim[1] to the enemy bbox edge like the C source");

  const farAim: vec3_t = [40, 0, 0];
  assert.equal(fire_hit(attacker, farAim, 10, 0, runtime, { T_Damage: () => undefined }), false, "fire_hit must fail before tracing when enemy is out of range");
}

function verifyFireHitBlocksOnNonDamageableTrace(): void {
  const runtime = createHarnessRuntime();
  const attacker = createMeleeMonster(runtime, 1);
  const enemy = createMeleeMonster(runtime, 2);
  const wall = createRuntimeEntity({ classname: "func_wall" }, 3);
  attacker.enemy = enemy;
  enemy.s.origin = [20, 0, 0];
  enemy.origin = [...enemy.s.origin];
  wall.takedamage = damage_t.DAMAGE_NO;

  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => makeTrace(0.25, end, wall),
    pointcontents: () => 0
  };

  let damageCount = 0;
  assert.equal(
    fire_hit(attacker, [80, 0, 0], 10, 50, runtime, { T_Damage: () => { damageCount += 1; } }),
    false,
    "fire_hit must fail when the melee trace hits a non-damageable blocker"
  );
  assert.equal(damageCount, 0, "fire_hit must not damage through non-damageable blockers");
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

function createPlayer(runtime: GameRuntime, index: number): GameEntity {
  const player = createRuntimeEntity({ classname: "player" }, index);
  player.inuse = true;
  player.classname = "player";
  player.health = 100;
  player.s.origin = [0, 0, 0];
  player.origin = [...player.s.origin];
  attachGameClient(player);
  runtime.entities[index] = player;
  return player;
}

function createDodgingMonster(runtime: GameRuntime, index: number): GameEntity {
  const monster = createRuntimeEntity({ classname: "monster_soldier" }, index);
  monster.inuse = true;
  monster.classname = "monster_soldier";
  monster.svflags |= SVF_MONSTER;
  monster.health = 100;
  monster.maxs = [16, 16, 32];
  runtime.entities[index] = monster;
  return monster;
}

function createMeleeMonster(runtime: GameRuntime, index: number): GameEntity {
  const monster = createRuntimeEntity({ classname: "monster_melee" }, index);
  monster.inuse = true;
  monster.classname = "monster_melee";
  monster.svflags |= SVF_MONSTER;
  monster.health = 100;
  monster.takedamage = damage_t.DAMAGE_AIM;
  monster.mins = [-16, -16, -24];
  monster.maxs = [16, 16, 32];
  monster.absmin = [-16, -16, -24];
  monster.size = [32, 32, 56];
  runtime.entities[index] = monster;
  return monster;
}

function makeTrace(fraction: number, endpos: vec3_t, ent: GameEntity | null): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction,
    endpos: [...endpos],
    plane: {
      normal: [0, 0, 1],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent
  };
}

function withMathRandom(values: number[], callback: () => void): void {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[index++] ?? values[values.length - 1] ?? 0;
  try {
    callback();
  } finally {
    Math.random = original;
  }
}
