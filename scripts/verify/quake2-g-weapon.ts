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
  DAMAGE_BULLET,
  DAMAGE_ENERGY,
  DAMAGE_NO_KNOCKBACK,
  MOD_BLASTER,
  MOD_HIT,
  MOD_HYPERBLASTER,
  MOVETYPE_FLYMISSILE,
  SOLID_BBOX,
  SPLASH_BROWN_WATER,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/runtime.js";
import { damage_t } from "../../packages/game/src/g_local.js";
import { blaster_touch, fire_blaster, fire_bullet, fire_hit, fire_shotgun } from "../../packages/game/src/g_weapon.js";
import { MASK_SHOT, MASK_WATER, temp_event_t, type cplane_t, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import { CONTENTS_WATER, SURF_SKY } from "../../packages/qcommon/src/q_shared.js";

main();

function main(): void {
  verifyCheckDodgeRuntimeBranch();
  verifyCheckDodgeEasySkillGate();
  verifyCheckDodgeRequiresClientProjectile();
  verifyFireHitFrontRangeDamageAndKnockback();
  verifyFireHitSideAimAdjustmentAndRangeGate();
  verifyFireHitBlocksOnNonDamageableTrace();
  verifyFireLeadBulletImpactAndDamage();
  verifyFireLeadWaterSplashAndBubbleTrail();
  verifyFireShotgunWrapperPelletCount();
  verifyFireBlasterSpawnStateAndImmediateBacktrace();
  verifyFireBlasterTouchCallbackForwardsPlane();
  verifyBlasterTouchDamageAndHyperMod();
  verifyBlasterTouchOwnerSkyAndWorldImpact();

  console.log("Verification g_weapon - check_dodge, fire_hit, fire_lead, fire_bullet, fire_shotgun, fire_blaster and blaster_touch lots OK");
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

function verifyFireLeadBulletImpactAndDamage(): void {
  const runtime = createHarnessRuntime();
  const shooter = createPlayer(runtime, 1);
  const target = createRuntimeEntity({ classname: "monster_target" }, 2);
  const wall = createRuntimeEntity({ classname: "wall" }, 3);
  target.takedamage = damage_t.DAMAGE_AIM;
  target.health = 100;
  runtime.entities[2] = target;
  runtime.entities[3] = wall;

  const traces: Array<{ start: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
      if (traces.length === 1) {
        return makeTrace(1, end, null);
      }
      return makeTrace(0.5, [128, 0, 0], target);
    },
    pointcontents: () => 0
  };

  const damageCalls: Array<{ target: GameEntity; point: vec3_t; dflags: number; mod: number }> = [];
  withMathRandom([0.5, 0.5], () => {
    fire_bullet(shooter, [0, 0, 0], [1, 0, 0], 7, 3, 100, 50, 42, runtime, {
      T_Damage: (ent, _inflictor, _attacker, _dir, point, _normal, _damage, _kick, dflags, mod) => {
        damageCalls.push({ target: ent, point: [...point], dflags, mod });
      }
    });
  });

  assert.deepEqual(traces[0]?.start, shooter.s.origin, "fire_lead must first trace from shooter origin to muzzle start");
  assert.equal(traces[0]?.mask, MASK_SHOT, "fire_lead muzzle trace must use MASK_SHOT");
  assert.equal(traces[1]?.mask, MASK_SHOT | MASK_WATER, "fire_lead dry bullet trace must include water");
  assert.deepEqual(traces[1]?.end, [8192, 0, 0], "fire_lead must extend the lead trace 8192 units with zero spread");
  assert.equal(damageCalls.length, 1, "fire_lead must damage a damageable traced entity");
  assert.equal(damageCalls[0]?.target, target, "fire_lead must damage the traced target");
  assert.deepEqual(damageCalls[0]?.point, [128, 0, 0], "fire_lead damage point must be trace endpos");
  assert.equal(damageCalls[0]?.dflags, DAMAGE_BULLET, "fire_lead must pass DAMAGE_BULLET");
  assert.equal(damageCalls[0]?.mod, 42, "fire_lead must preserve the damage mode");

  runtime.collision.trace = (start, _mins, _maxs, end, passent, mask) => {
    traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
    if (traces.length === 3) {
      return makeTrace(1, end, null);
    }
    return makeTrace(0.25, [64, 0, 0], wall, { name: "stone", flags: 0 });
  };

  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  withMathRandom([0.5, 0.5], () => {
    fire_bullet(shooter, [0, 0, 0], [1, 0, 0], 7, 3, 100, 50, 42, runtime, {
      emitTempEntity: (type, payload) => {
        tempEvents.push({ type, payload });
      },
      isDamageable: (ent) => ent.takedamage !== damage_t.DAMAGE_NO
    });
  });

  assert.equal(tempEvents.length, 1, "fire_lead must emit one impact temp entity for a non-damageable non-sky hit");
  assert.equal(tempEvents[0]?.type, temp_event_t.TE_GUNSHOT, "fire_bullet must use TE_GUNSHOT impacts");
  assert.deepEqual(tempEvents[0]?.payload.origin, [64, 0, 0], "fire_lead impact temp entity origin mismatch");
  assert.deepEqual(tempEvents[0]?.payload.dir, [0, 0, 1], "fire_lead impact temp entity direction mismatch");
}

function verifyFireLeadWaterSplashAndBubbleTrail(): void {
  const runtime = createHarnessRuntime();
  const shooter = createPlayer(runtime, 1);
  const traces: Array<{ start: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];

  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
      if (traces.length === 1) {
        return makeTrace(1, end, null);
      }
      if (traces.length === 2) {
        return makeTrace(0.25, [64, 0, 0], null, { name: "*brwater", flags: 0 }, CONTENTS_WATER);
      }
      return makeTrace(1, [200, 0, 0], null);
    },
    pointcontents: (point) => point[0] > 100 ? CONTENTS_WATER : 0
  };

  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  withMathRandom([0.5, 0.5, 0.5, 0.5], () => {
    fire_bullet(shooter, [0, 0, 0], [1, 0, 0], 7, 3, 100, 50, 42, runtime, {
      emitTempEntity: (type, payload) => {
        tempEvents.push({ type, payload });
      }
    });
  });

  assert.equal(traces[1]?.mask, MASK_SHOT | MASK_WATER, "fire_lead first water trace must include MASK_WATER");
  assert.deepEqual(traces[2]?.start, [64, 0, 0], "fire_lead must retrace from water_start after water entry");
  assert.equal(traces[2]?.mask, MASK_SHOT, "fire_lead water retrace must ignore water");
  assert.equal(tempEvents[0]?.type, temp_event_t.TE_SPLASH, "fire_lead must emit TE_SPLASH when entering known water");
  assert.equal(tempEvents[0]?.payload.count, 8, "fire_lead water splash count mismatch");
  assert.equal(tempEvents[0]?.payload.color, SPLASH_BROWN_WATER, "fire_lead must map *brwater to brown splash");
  assert.deepEqual(tempEvents[0]?.payload.origin, [64, 0, 0], "fire_lead water splash origin mismatch");
  assert.equal(tempEvents[1]?.type, temp_event_t.TE_BUBBLETRAIL, "fire_lead must emit a bubble trail after passing through water");
  assert.deepEqual(tempEvents[1]?.payload.start, [64, 0, 0], "fire_lead bubble trail start mismatch");
  assert.deepEqual(tempEvents[1]?.payload.end, [198, 0, 0], "fire_lead bubble trail end must be backed up two units in water");
}

function verifyFireShotgunWrapperPelletCount(): void {
  const runtime = createHarnessRuntime();
  const shooter = createPlayer(runtime, 1);
  const wall = createRuntimeEntity({ classname: "wall" }, 2);
  runtime.entities[2] = wall;

  const traces: Array<{ start: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
      if ((traces.length % 2) === 1) {
        return makeTrace(1, end, null);
      }
      return makeTrace(0.25, [64, 0, 0], wall, { name: "stone", flags: 0 });
    },
    pointcontents: () => 0
  };

  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  withMathRandom([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], () => {
    fire_shotgun(shooter, [0, 0, 0], [1, 0, 0], 4, 8, 500, 500, 3, 7, runtime, {
      emitTempEntity: (type, payload) => {
        tempEvents.push({ type, payload });
      },
      isDamageable: () => false
    });
  });

  assert.equal(tempEvents.length, 3, "fire_shotgun must call fire_lead once per pellet");
  assert.equal(traces.length, 6, "fire_shotgun must run the fire_lead trace pair for each pellet");
  assert.ok(tempEvents.every((event) => event.type === temp_event_t.TE_SHOTGUN), "fire_shotgun must use TE_SHOTGUN impacts");
  assert.deepEqual(tempEvents[0]?.payload.origin, [64, 0, 0], "fire_shotgun impact origin must come from fire_lead");
}

function verifyFireBlasterTouchCallbackForwardsPlane(): void {
  const runtime = createHarnessRuntime();
  const shooter = createPlayer(runtime, 1);
  const wall = createRuntimeEntity({ classname: "func_wall" }, 2);
  const plane = makePlane([0, -1, 0]);
  wall.takedamage = damage_t.DAMAGE_NO;
  wall.health = 0;
  runtime.entities[2] = wall;

  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  const bolt = fire_blaster(shooter, [10, 0, 0], [1, 0, 0], 15, 200, 0, false, runtime, {
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    }
  });
  bolt.s.origin = [32, 0, 0];
  bolt.origin = [...bolt.s.origin];
  bolt.touch?.(bolt, wall, runtime, plane, null);

  assert.equal(tempEvents[0]?.type, temp_event_t.TE_BLASTER, "fire_blaster must wire blaster_touch as the bolt touch callback");
  assert.deepEqual(tempEvents[0]?.payload.dir, [0, -1, 0], "fire_blaster touch callback must forward physics plane normals");
}

function verifyFireBlasterSpawnStateAndImmediateBacktrace(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 12.5;
  const shooter = createPlayer(runtime, 1);
  shooter.s.origin = [0, 0, 0];
  shooter.origin = [...shooter.s.origin];
  const blocker = createRuntimeEntity({ classname: "func_door" }, 2);
  runtime.entities[2] = blocker;

  const traces: Array<{ start: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];
  const touched: Array<{ self: GameEntity; other: GameEntity; origin: vec3_t; plane: cplane_t | null; surface: trace_t["surface"] | null }> = [];
  runtime.collision = {
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
      return makeTrace(0.5, [5, 0, 0], blocker);
    },
    pointcontents: () => 0
  };

  const bolt = fire_blaster(shooter, [10, 0, 0], [2, 0, 0], 15, 600, 0x40, true, runtime, {
    check_dodge: () => undefined,
    blaster_touch: (touchSelf, other, _localRuntime, plane, surface) => {
      touched.push({
        self: touchSelf,
        other,
        origin: [...touchSelf.s.origin],
        plane: plane ?? null,
        surface: surface ?? null
      });
    }
  });

  assert.equal(bolt.svflags, SVF_DEADMONSTER, "fire_blaster must mark the projectile SVF_DEADMONSTER");
  assert.deepEqual(bolt.s.origin, [0, 0, 0], "immediate collision must move the bolt back 10 units along normalized dir");
  assert.deepEqual(bolt.origin, [0, 0, 0], "runtime origin mirror must follow the backed-up projectile origin");
  assert.deepEqual(bolt.s.old_origin, [10, 0, 0], "fire_blaster must preserve start as old_origin");
  assert.deepEqual(bolt.velocity, [600, 0, 0], "fire_blaster must normalize dir before applying speed");
  assert.equal(bolt.movetype, MOVETYPE_FLYMISSILE, "fire_blaster must use MOVETYPE_FLYMISSILE");
  assert.equal(bolt.clipmask, MASK_SHOT, "fire_blaster must use MASK_SHOT clipmask");
  assert.equal(bolt.solid, SOLID_BBOX, "fire_blaster must use SOLID_BBOX");
  assert.equal(bolt.s.effects & 0x40, 0x40, "fire_blaster must OR the requested effect into entity state");
  assert.deepEqual(bolt.mins, [0, 0, 0], "fire_blaster must clear projectile mins");
  assert.deepEqual(bolt.maxs, [0, 0, 0], "fire_blaster must clear projectile maxs");
  assert.equal(runtime.assets.modelPaths[bolt.s.modelindex - 1], "models/objects/laser/tris.md2", "fire_blaster must register the laser model");
  assert.equal(runtime.assets.soundPaths[bolt.s.sound - 1], "misc/lasfly.wav", "fire_blaster must register the flight sound");
  assert.equal(bolt.owner, shooter, "fire_blaster must retain the firing entity as owner");
  assert.equal(bolt.nextthink, 14.5, "fire_blaster must schedule projectile cleanup two seconds later");
  assert.equal(bolt.dmg, 15, "fire_blaster must preserve damage");
  assert.equal(bolt.classname, "bolt", "fire_blaster must name the projectile bolt");
  assert.equal(bolt.spawnflags, 1, "hyper blaster projectiles must set spawnflag 1");
  assert.equal(bolt.linked, true, "fire_blaster must link the projectile into the runtime world");
  assert.equal(traces.length, 1, "fire_blaster must run one immediate backtrace when dodge is hooked out");
  assert.deepEqual(traces[0]?.start, [0, 0, 0], "fire_blaster backtrace must start at the shooter origin");
  assert.deepEqual(traces[0]?.end, [10, 0, 0], "fire_blaster backtrace must end at the projectile origin");
  assert.equal(traces[0]?.passent, bolt, "fire_blaster backtrace must ignore the projectile");
  assert.equal(traces[0]?.mask, MASK_SHOT, "fire_blaster backtrace must use MASK_SHOT");
  assert.equal(touched.length, 1, "fire_blaster must immediately touch a blocker found by the backtrace");
  assert.equal(touched[0]?.self, bolt, "fire_blaster immediate touch must use the bolt as self");
  assert.equal(touched[0]?.other, blocker, "fire_blaster immediate touch must pass the traced entity");
  assert.deepEqual(touched[0]?.origin, [0, 0, 0], "fire_blaster immediate touch must see the backed-up origin");
  assert.equal(touched[0]?.plane, null, "fire_blaster immediate touch must match the C NULL plane argument");
  assert.equal(touched[0]?.surface, null, "fire_blaster immediate touch must match the C NULL surface argument");
}

function verifyBlasterTouchDamageAndHyperMod(): void {
  const runtime = createHarnessRuntime();
  const owner = createPlayer(runtime, 1);
  const bolt = createRuntimeEntity({ classname: "bolt" }, 2);
  const target = createRuntimeEntity({ classname: "monster_target" }, 3);
  const plane = makePlane([0, 0, 1]);
  bolt.owner = owner;
  bolt.velocity = [900, 0, 0];
  bolt.s.origin = [40, 8, 16];
  bolt.origin = [...bolt.s.origin];
  bolt.dmg = 15;
  bolt.spawnflags = 1;
  target.takedamage = damage_t.DAMAGE_AIM;
  runtime.entities[2] = bolt;
  runtime.entities[3] = target;

  const damageCalls: Array<{
    target: GameEntity;
    inflictor: GameEntity;
    attacker: GameEntity;
    dir: vec3_t;
    point: vec3_t;
    normal: vec3_t;
    damage: number;
    knockback: number;
    dflags: number;
    mod: number;
  }> = [];
  const freed: GameEntity[] = [];

  blaster_touch(bolt, target, runtime, {
    T_Damage: (ent, inflictor, attacker, dir, point, normal, damage, knockback, dflags, mod) => {
      damageCalls.push({
        target: ent,
        inflictor,
        attacker,
        dir: [...dir],
        point: [...point],
        normal: [...normal],
        damage,
        knockback,
        dflags,
        mod
      });
    },
    G_FreeEdict: (ent) => {
      freed.push(ent);
    }
  }, plane, null);

  assert.equal(damageCalls.length, 1, "blaster_touch must damage a damageable target exactly once");
  assert.equal(damageCalls[0]?.target, target, "blaster_touch must damage the touched entity");
  assert.equal(damageCalls[0]?.inflictor, bolt, "blaster_touch must use the bolt as inflictor");
  assert.equal(damageCalls[0]?.attacker, owner, "blaster_touch must use the bolt owner as attacker");
  assert.deepEqual(damageCalls[0]?.dir, [900, 0, 0], "blaster_touch damage dir must be the bolt velocity");
  assert.deepEqual(damageCalls[0]?.point, [40, 8, 16], "blaster_touch damage point must be the bolt origin");
  assert.deepEqual(damageCalls[0]?.normal, [0, 0, 1], "blaster_touch must forward the impact plane normal");
  assert.equal(damageCalls[0]?.damage, 15, "blaster_touch must preserve bolt damage");
  assert.equal(damageCalls[0]?.knockback, 1, "blaster_touch must preserve the C knockback value");
  assert.equal(damageCalls[0]?.dflags, DAMAGE_ENERGY, "blaster_touch must mark blaster damage as energy damage");
  assert.equal(damageCalls[0]?.mod, MOD_HYPERBLASTER, "spawnflag 1 must select MOD_HYPERBLASTER");
  assert.equal(freed[0], bolt, "blaster_touch must free the bolt after damage");
  assert.equal(runtime.sound2_entity, owner.mynoise2, "client-owned blaster impacts must emit PNOISE_IMPACT");
  assert.deepEqual(owner.mynoise2?.s.origin, [40, 8, 16], "PNOISE_IMPACT origin must be the bolt origin");
}

function verifyBlasterTouchOwnerSkyAndWorldImpact(): void {
  const runtime = createHarnessRuntime();
  const owner = createPlayer(runtime, 1);
  const wall = createRuntimeEntity({ classname: "func_wall" }, 2);
  const plane = makePlane([0, 1, 0]);
  wall.takedamage = damage_t.DAMAGE_NO;
  wall.health = 0;
  runtime.entities[2] = wall;

  const ownerBolt = createRuntimeEntity({ classname: "bolt" }, 3);
  ownerBolt.owner = owner;
  let ownerBranchFreed = false;
  let ownerBranchDamaged = false;
  let ownerBranchTempEvent = false;
  blaster_touch(ownerBolt, owner, runtime, {
    G_FreeEdict: () => {
      ownerBranchFreed = true;
    },
    T_Damage: () => {
      ownerBranchDamaged = true;
    },
    emitTempEntity: () => {
      ownerBranchTempEvent = true;
    }
  }, plane, null);
  assert.equal(ownerBranchFreed, false, "blaster_touch must ignore impacts on the owner without freeing");
  assert.equal(ownerBranchDamaged, false, "blaster_touch must ignore impacts on the owner without damage");
  assert.equal(ownerBranchTempEvent, false, "blaster_touch must ignore impacts on the owner without temp entities");

  const skyBolt = createRuntimeEntity({ classname: "bolt" }, 4);
  skyBolt.owner = owner;
  const freed: GameEntity[] = [];
  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  blaster_touch(skyBolt, wall, runtime, {
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    },
    G_FreeEdict: (ent) => {
      freed.push(ent);
    }
  }, plane, { name: "sky", flags: SURF_SKY, value: 0 });
  assert.equal(freed[0], skyBolt, "blaster_touch must free sky impacts");
  assert.equal(tempEvents.length, 0, "blaster_touch must not emit TE_BLASTER for sky surfaces");

  const worldBolt = createRuntimeEntity({ classname: "bolt" }, 5);
  worldBolt.owner = owner;
  worldBolt.spawnflags = 0;
  worldBolt.s.origin = [12, 24, 36];
  worldBolt.origin = [...worldBolt.s.origin];
  blaster_touch(worldBolt, wall, runtime, {
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    },
    T_Damage: () => assert.fail("blaster_touch must not damage non-damageable world geometry"),
    G_FreeEdict: (ent) => {
      freed.push(ent);
    }
  }, plane, null);
  assert.equal(tempEvents.at(-1)?.type, temp_event_t.TE_BLASTER, "blaster_touch must emit TE_BLASTER on non-damageable impacts");
  assert.deepEqual(tempEvents.at(-1)?.payload.origin, [12, 24, 36], "TE_BLASTER origin must be the bolt origin");
  assert.deepEqual(tempEvents.at(-1)?.payload.dir, [0, 1, 0], "TE_BLASTER dir must be the impact plane normal");
  assert.equal(freed.at(-1), worldBolt, "blaster_touch must free the bolt after world impact");

  const normalBolt = createRuntimeEntity({ classname: "bolt" }, 6);
  const target = createRuntimeEntity({ classname: "monster_target" }, 7);
  normalBolt.owner = owner;
  normalBolt.velocity = [1, 0, 0];
  normalBolt.dmg = 1;
  target.takedamage = damage_t.DAMAGE_AIM;
  let mod = 0;
  blaster_touch(normalBolt, target, runtime, {
    T_Damage: (_ent, _inflictor, _attacker, _dir, _point, _normal, _damage, _knockback, _dflags, damageMod) => {
      mod = damageMod;
    },
    G_FreeEdict: () => undefined
  }, plane, null);
  assert.equal(mod, MOD_BLASTER, "missing spawnflag 1 must select MOD_BLASTER");
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

function makeTrace(
  fraction: number,
  endpos: vec3_t,
  ent: GameEntity | null,
  surface: trace_t["surface"] = null,
  contents = 0
): trace_t {
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
    surface,
    contents,
    ent
  };
}

function makePlane(normal: vec3_t): cplane_t {
  return {
    normal: [...normal],
    dist: 0,
    type: 0,
    signbits: 0,
    pad: [0, 0]
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
