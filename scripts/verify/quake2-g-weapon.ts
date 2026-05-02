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
  SVF_MONSTER,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { fire_blaster } from "../../packages/game/src/g_weapon.js";
import { MASK_SHOT, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyCheckDodgeRuntimeBranch();
  verifyCheckDodgeEasySkillGate();
  verifyCheckDodgeRequiresClientProjectile();

  console.log("Verification g_weapon - check_dodge lot OK");
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
