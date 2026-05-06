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
  DAMAGE_RADIUS,
  FL_IMMUNE_LASER,
  MOD_BFG_BLAST,
  MOD_BFG_EFFECT,
  MOD_BFG_LASER,
  MOD_BLASTER,
  MOD_GRENADE,
  MOD_G_SPLASH,
  MOD_HANDGRENADE,
  MOD_HELD_GRENADE,
  MOD_HG_SPLASH,
  MOD_HIT,
  MOD_HYPERBLASTER,
  MOD_R_SPLASH,
  MOD_RAILGUN,
  MOD_ROCKET,
  MOVETYPE_BOUNCE,
  MOVETYPE_FLYMISSILE,
  SOLID_BBOX,
  SOLID_NOT,
  SPLASH_BROWN_WATER,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/runtime.js";
import { damage_t } from "../../packages/game/src/g_local.js";
import { bfg_explode, bfg_think, bfg_touch, blaster_touch, fire_bfg, fire_blaster, fire_bullet, fire_grenade, fire_grenade2, fire_hit, fire_rail, fire_rocket, fire_shotgun, Grenade_Explode, Grenade_Touch, rocket_touch } from "../../packages/game/src/g_weapon.js";
import { MASK_SHOT, MASK_WATER, temp_event_t, type cplane_t, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import { CONTENTS_DEADMONSTER, CONTENTS_LAVA, CONTENTS_MONSTER, CONTENTS_SLIME, CONTENTS_SOLID, CONTENTS_WATER, EF_ANIM_ALLFAST, EF_BFG, EF_GRENADE, EF_ROCKET, SURF_SKY, SURF_WARP } from "../../packages/qcommon/src/q_shared.js";

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
  verifyGrenadeExplodeDirectDamageSplashAndTempEntity();
  verifyGrenadeExplodeSplashModsAndTempEntityVariants();
  verifyGrenadeTouchOwnerSkyBounceAndDamage();
  verifyFireGrenadeSpawnStateAndRuntimeTouch();
  verifyFireGrenade2SpawnStateTimerBranchesAndRuntimeTouch();
  verifyRocketTouchDamageSplashAndVisibleExplosion();
  verifyRocketTouchSkyAndDebrisBranches();
  verifyFireRocketSpawnStateAndDodgeOrder();
  verifyFireRocketUsesSharedVectoanglesPort();
  verifyFireRocketRuntimeTouchForwardsCollisionContext();
  verifyFireRailDamageModAndVisibleTrail();
  verifyBfgDamageModsAndVisibleEffects();

  console.log("Verification g_weapon - check_dodge, lead weapons, projectile impacts, grenades and MOD weapon lots OK");
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
  withMathRandom([0.2499], () => {
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
  assert.ok(Math.abs((traces[1]?.end[0] ?? 0) - 8192) < 1e-9, "fire_lead must extend the lead trace 8192 units forward");
  assert.ok(Math.abs(traces[1]?.end[1] ?? 0) < 0.01, "fire_lead near-midpoint crandom must keep horizontal spread close to zero");
  assert.ok(Math.abs(traces[1]?.end[2] ?? 0) < 0.01, "fire_lead near-midpoint crandom must keep vertical spread close to zero");
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

function verifyGrenadeExplodeDirectDamageSplashAndTempEntity(): void {
  const runtime = createHarnessRuntime();
  const owner = createPlayer(runtime, 1);
  const grenade = createRuntimeEntity({ classname: "grenade" }, 2);
  const enemy = createRuntimeEntity({ classname: "monster_target" }, 3);
  const ground = createRuntimeEntity({ classname: "ground" }, 4);
  runtime.entities[2] = grenade;
  runtime.entities[3] = enemy;
  runtime.entities[4] = ground;

  grenade.owner = owner;
  grenade.enemy = enemy;
  grenade.s.origin = [100, 50, 20];
  grenade.origin = [...grenade.s.origin];
  grenade.velocity = [10, -20, 30];
  grenade.dmg = 120;
  grenade.dmg_radius = 160;
  grenade.spawnflags = 1;
  grenade.waterlevel = 0;
  grenade.groundentity = ground;

  enemy.s.origin = [90, 50, 0];
  enemy.origin = [...enemy.s.origin];
  enemy.mins = [-10, -20, -5];
  enemy.maxs = [10, 20, 35];

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
  const radiusCalls: Array<{
    inflictor: GameEntity;
    attacker: GameEntity;
    damage: number;
    ignore: GameEntity | null;
    radius: number;
    mod: number;
  }> = [];
  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  const freed: GameEntity[] = [];

  Grenade_Explode(grenade, runtime, {
    T_Damage: (target, inflictor, attacker, dir, point, normal, damage, knockback, dflags, mod) => {
      damageCalls.push({
        target,
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
    T_RadiusDamage: (inflictor, attacker, damage, ignore, radius, mod) => {
      radiusCalls.push({ inflictor, attacker, damage, ignore, radius, mod });
    },
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    },
    G_FreeEdict: (ent) => {
      freed.push(ent);
    }
  });

  assert.equal(damageCalls.length, 1, "Grenade_Explode must apply direct impact damage when enemy is set");
  assert.equal(damageCalls[0]?.target, enemy, "Grenade_Explode direct damage target must be ent.enemy");
  assert.equal(damageCalls[0]?.inflictor, grenade, "Grenade_Explode direct damage inflictor must be the grenade");
  assert.equal(damageCalls[0]?.attacker, owner, "Grenade_Explode direct damage attacker must be the grenade owner");
  assert.deepEqual(damageCalls[0]?.dir, [-10, 0, -20], "Grenade_Explode direct damage dir must be enemy origin minus grenade origin");
  assert.deepEqual(damageCalls[0]?.point, [100, 50, 20], "Grenade_Explode direct damage point must be grenade origin");
  assert.deepEqual(damageCalls[0]?.normal, [0, 0, 0], "Grenade_Explode direct damage normal must be vec3_origin");
  assert.equal(damageCalls[0]?.damage, 114, "Grenade_Explode must truncate original points calculation for damage");
  assert.equal(damageCalls[0]?.knockback, 114, "Grenade_Explode must reuse points as knockback");
  assert.equal(damageCalls[0]?.dflags, DAMAGE_RADIUS, "Grenade_Explode direct damage must use DAMAGE_RADIUS");
  assert.equal(damageCalls[0]?.mod, MOD_HANDGRENADE, "spawnflag 1 must select MOD_HANDGRENADE for direct damage");

  assert.equal(radiusCalls.length, 1, "Grenade_Explode must apply splash damage exactly once");
  assert.equal(radiusCalls[0]?.inflictor, grenade, "Grenade_Explode splash inflictor must be the grenade");
  assert.equal(radiusCalls[0]?.attacker, owner, "Grenade_Explode splash attacker must be the grenade owner");
  assert.equal(radiusCalls[0]?.damage, 120, "Grenade_Explode splash damage must use ent.dmg");
  assert.equal(radiusCalls[0]?.ignore, enemy, "Grenade_Explode splash ignore must be ent.enemy");
  assert.equal(radiusCalls[0]?.radius, 160, "Grenade_Explode splash radius must use ent.dmg_radius");
  assert.equal(radiusCalls[0]?.mod, MOD_HG_SPLASH, "spawnflag 1 must select MOD_HG_SPLASH for splash damage");

  assert.equal(tempEvents[0]?.type, temp_event_t.TE_GRENADE_EXPLOSION, "grounded dry grenades must emit TE_GRENADE_EXPLOSION");
  assert.deepEqual(tempEvents[0]?.payload.origin, [99.8, 50.4, 19.4], "Grenade_Explode temp origin must be origin - velocity * 0.02");
  assert.equal(freed[0], grenade, "Grenade_Explode must free the grenade");
  assert.equal(runtime.sound2_entity, owner.mynoise2, "client-owned grenade explosions must emit PNOISE_IMPACT");
  assert.deepEqual(owner.mynoise2?.s.origin, [100, 50, 20], "PNOISE_IMPACT origin must be grenade origin");
}

function verifyGrenadeExplodeSplashModsAndTempEntityVariants(): void {
  const cases: Array<{
    spawnflags: number;
    waterlevel: number;
    grounded: boolean;
    expectedMod: number;
    expectedType: temp_event_t;
  }> = [
    { spawnflags: 0, waterlevel: 0, grounded: false, expectedMod: MOD_G_SPLASH, expectedType: temp_event_t.TE_ROCKET_EXPLOSION },
    { spawnflags: 2, waterlevel: 0, grounded: false, expectedMod: MOD_HELD_GRENADE, expectedType: temp_event_t.TE_ROCKET_EXPLOSION },
    { spawnflags: 0, waterlevel: 1, grounded: false, expectedMod: MOD_G_SPLASH, expectedType: temp_event_t.TE_ROCKET_EXPLOSION_WATER },
    { spawnflags: 0, waterlevel: 1, grounded: true, expectedMod: MOD_G_SPLASH, expectedType: temp_event_t.TE_GRENADE_EXPLOSION_WATER }
  ];

  for (const [index, testCase] of cases.entries()) {
    const runtime = createHarnessRuntime();
    const owner = createRuntimeEntity({ classname: "monster_owner" }, 1);
    const grenade = createRuntimeEntity({ classname: "grenade" }, 2);
    const ground = createRuntimeEntity({ classname: "ground" }, 3);
    runtime.entities[1] = owner;
    runtime.entities[2] = grenade;
    runtime.entities[3] = ground;

    grenade.owner = owner;
    grenade.s.origin = [index, index + 1, index + 2];
    grenade.origin = [...grenade.s.origin];
    grenade.velocity = [0, 0, 50];
    grenade.dmg = 80;
    grenade.dmg_radius = 120;
    grenade.spawnflags = testCase.spawnflags;
    grenade.waterlevel = testCase.waterlevel;
    grenade.groundentity = testCase.grounded ? ground : null;

    let directDamageCalled = false;
    let splashMod = -1;
    let tempType: temp_event_t | null = null;

    Grenade_Explode(grenade, runtime, {
      T_Damage: () => {
        directDamageCalled = true;
      },
      T_RadiusDamage: (_inflictor, _attacker, _damage, _ignore, _radius, mod) => {
        splashMod = mod;
      },
      emitTempEntity: (type) => {
        tempType = type;
      },
      G_FreeEdict: () => undefined
    });

    assert.equal(directDamageCalled, false, "Grenade_Explode must skip direct damage when enemy is absent");
    assert.equal(splashMod, testCase.expectedMod, "Grenade_Explode splash mod variant mismatch");
    assert.equal(tempType, testCase.expectedType, "Grenade_Explode temp entity variant mismatch");
  }

  const runtime = createHarnessRuntime();
  const owner = createRuntimeEntity({ classname: "monster_owner" }, 1);
  const enemy = createRuntimeEntity({ classname: "monster_target" }, 2);
  const grenade = createRuntimeEntity({ classname: "grenade" }, 3);
  runtime.entities[1] = owner;
  runtime.entities[2] = enemy;
  runtime.entities[3] = grenade;
  grenade.owner = owner;
  grenade.enemy = enemy;
  grenade.s.origin = [0, 0, 0];
  grenade.origin = [...grenade.s.origin];
  grenade.dmg = 10;
  grenade.dmg_radius = 20;

  let directMod = -1;
  Grenade_Explode(grenade, runtime, {
    T_Damage: (_target, _inflictor, _attacker, _dir, _point, _normal, _damage, _knockback, _dflags, mod) => {
      directMod = mod;
    },
    T_RadiusDamage: () => undefined,
    emitTempEntity: () => undefined,
    G_FreeEdict: () => undefined
  });
  assert.equal(directMod, MOD_GRENADE, "missing spawnflag 1 must select MOD_GRENADE for direct damage");
}

function verifyRocketTouchDamageSplashAndVisibleExplosion(): void {
  const runtime = createHarnessRuntime();
  const owner = createPlayer(runtime, 1);
  const rocket = createRuntimeEntity({ classname: "rocket" }, 2);
  const target = createRuntimeEntity({ classname: "monster_target" }, 3);
  const plane = makePlane([0, 0, 1]);
  runtime.entities[2] = rocket;
  runtime.entities[3] = target;
  rocket.owner = owner;
  rocket.velocity = [100, 0, 0];
  rocket.s.origin = [10, 20, 30];
  rocket.origin = [...rocket.s.origin];
  rocket.dmg = 120;
  rocket.radius_dmg = 90;
  rocket.dmg_radius = 140;
  target.takedamage = damage_t.DAMAGE_AIM;

  const damageMods: number[] = [];
  const radiusMods: number[] = [];
  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  rocket_touch(rocket, target, runtime, {
    T_Damage: (_target, _inflictor, _attacker, _dir, _point, _normal, _damage, _knockback, _dflags, mod) => {
      damageMods.push(mod);
    },
    T_RadiusDamage: (_inflictor, _attacker, _damage, _ignore, _radius, mod) => {
      radiusMods.push(mod);
    },
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    },
    G_FreeEdict: () => undefined
  }, plane, null);

  assert.deepEqual(damageMods, [MOD_ROCKET], "rocket_touch direct damage must use MOD_ROCKET");
  assert.deepEqual(radiusMods, [MOD_R_SPLASH], "rocket_touch splash damage must use MOD_R_SPLASH");
  assert.equal(tempEvents[0]?.type, temp_event_t.TE_ROCKET_EXPLOSION, "dry rocket impacts must emit TE_ROCKET_EXPLOSION");
  assert.deepEqual(tempEvents[0]?.payload.origin, [8, 20, 30], "rocket explosion origin must be origin - velocity * 0.02");
}

function verifyRocketTouchSkyAndDebrisBranches(): void {
  const skyRuntime = createHarnessRuntime();
  const skyOwner = createRuntimeEntity({ classname: "rocket_owner" }, 1);
  const skyRocket = createRuntimeEntity({ classname: "rocket" }, 2);
  const skyWall = createRuntimeEntity({ classname: "world_wall" }, 3);
  skyRocket.owner = skyOwner;

  let freedSky = false;
  let skyTempEvents = 0;
  rocket_touch(skyRocket, skyWall, skyRuntime, {
    emitTempEntity: () => {
      skyTempEvents += 1;
    },
    G_FreeEdict: () => {
      freedSky = true;
    }
  }, makePlane([0, 0, 1]), { name: "sky", flags: SURF_SKY, value: 0 });
  assert.equal(freedSky, true, "rocket_touch must free rockets touching sky surfaces");
  assert.equal(skyTempEvents, 0, "rocket_touch must not emit visible explosions on sky surfaces");

  const debrisRuntime = createHarnessRuntime();
  const owner = createRuntimeEntity({ classname: "rocket_owner" }, 1);
  const rocket = createRuntimeEntity({ classname: "rocket" }, 2);
  const wall = createRuntimeEntity({ classname: "world_wall" }, 3);
  debrisRuntime.entities[1] = owner;
  debrisRuntime.entities[2] = rocket;
  debrisRuntime.entities[3] = wall;
  rocket.owner = owner;
  rocket.velocity = [100, 0, 0];
  rocket.s.origin = [10, 20, 30];
  rocket.origin = [...rocket.s.origin];
  rocket.dmg = 120;
  rocket.radius_dmg = 90;
  rocket.dmg_radius = 140;

  const originalRandom = Math.random;
  Math.random = () => 0.9;
  try {
    rocket_touch(rocket, wall, debrisRuntime, {
      T_RadiusDamage: () => undefined,
      emitTempEntity: () => undefined,
      G_FreeEdict: () => undefined
    }, makePlane([0, 0, 1]), { name: "stone", flags: 0, value: 0 });
  } finally {
    Math.random = originalRandom;
  }
  const debris = debrisRuntime.entities.filter((entity) => entity?.classname === "debris");
  assert.equal(debris.length, 4, "rocket_touch must mirror rand()%5 debris count for plain non-damageable surfaces");
  assert.ok(debris.every((entity) => entity?.model === "models/objects/debris2/tris.md2"), "rocket debris must use debris2/tris.md2");

  const suppressedRuntime = createHarnessRuntime();
  const suppressedOwner = createRuntimeEntity({ classname: "rocket_owner" }, 1);
  const suppressedRocket = createRuntimeEntity({ classname: "rocket" }, 2);
  const suppressedWall = createRuntimeEntity({ classname: "warp_wall" }, 3);
  suppressedRuntime.entities[1] = suppressedOwner;
  suppressedRuntime.entities[2] = suppressedRocket;
  suppressedRuntime.entities[3] = suppressedWall;
  suppressedRocket.owner = suppressedOwner;
  suppressedRocket.velocity = [100, 0, 0];
  suppressedRocket.s.origin = [10, 20, 30];
  suppressedRocket.origin = [...suppressedRocket.s.origin];
  suppressedRocket.dmg = 120;
  suppressedRocket.radius_dmg = 90;
  suppressedRocket.dmg_radius = 140;
  rocket_touch(suppressedRocket, suppressedWall, suppressedRuntime, {
    T_RadiusDamage: () => undefined,
    emitTempEntity: () => undefined,
    G_FreeEdict: () => undefined
  }, makePlane([0, 0, 1]), { name: "warp", flags: SURF_WARP, value: 0 });
  assert.equal(
    suppressedRuntime.entities.filter((entity) => entity?.classname === "debris").length,
    0,
    "rocket_touch must suppress debris on warp/translucent/flowing surfaces"
  );
}

function verifyFireRocketRuntimeTouchForwardsCollisionContext(): void {
  const runtime = createHarnessRuntime();
  const owner = createRuntimeEntity({ classname: "rocket_owner" }, 1);
  const wall = createRuntimeEntity({ classname: "world_wall" }, 2);
  runtime.entities[1] = owner;
  runtime.entities[2] = wall;

  const plane = makePlane([0, 1, 0]);
  const surface = { name: "stone", flags: 0, value: 0 };
  let forwardedPlane: cplane_t | null = null;
  let forwardedSurface: trace_t["surface"] = null;
  const rocket = fire_rocket(owner, [0, 0, 0], [1, 0, 0], 100, 650, 120, 100, runtime, {
    rocket_touch: (_self, _other, _runtime, touchPlane, touchSurface) => {
      forwardedPlane = touchPlane ?? null;
      forwardedSurface = touchSurface ?? null;
    }
  });

  rocket.touch?.(rocket, wall, runtime, plane, surface);
  assert.equal(forwardedPlane, plane, "fire_rocket runtime touch callback must forward collision plane to rocket_touch");
  assert.equal(forwardedSurface, surface, "fire_rocket runtime touch callback must forward collision surface to rocket_touch");
}

function verifyFireRocketUsesSharedVectoanglesPort(): void {
  const runtime = createHarnessRuntime();
  const owner = createRuntimeEntity({ classname: "monster_soldier" }, 1);
  runtime.entities[1] = owner;

  const rocket = fire_rocket(owner, [0, 0, 0], [2, -1, 1], 90, 500, 140, 80, runtime);

  assert.deepEqual(
    rocket.s.angles,
    [-24, 334, 0],
    "fire_rocket must consume g_utils.vectoangles with C truncation and yaw wrapping"
  );
}

function verifyFireRocketSpawnStateAndDodgeOrder(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 3;
  const owner = createPlayer(runtime, 1);
  const order: string[] = [];
  runtime.engineLinkEntity = (entity) => {
    if (entity.classname === "rocket") {
      order.push("link");
    }
  };

  let dodgeStart: vec3_t | null = null;
  let dodgeDir: vec3_t | null = null;
  let dodgeSpeed = 0;
  let dodgeSawLinked = true;
  const rocket = fire_rocket(owner, [10, 20, 30], [0, 2, 0], 90, 500, 140, 80, runtime, {
    check_dodge: (_self, start, dir, speed) => {
      order.push("check_dodge");
      dodgeStart = [...start];
      dodgeDir = [...dir];
      dodgeSpeed = speed;
      dodgeSawLinked = runtime.linkedSolidEntities.some((entity) => entity.classname === "rocket");
    }
  });

  assert.equal(rocket.classname, "rocket", "fire_rocket must name the projectile rocket");
  assert.deepEqual(rocket.s.origin, [10, 20, 30], "fire_rocket must copy start into s.origin");
  assert.deepEqual(rocket.origin, [10, 20, 30], "fire_rocket must mirror start into runtime origin");
  assert.deepEqual(rocket.movedir, [0, 2, 0], "fire_rocket must preserve raw dir in movedir like VectorCopy");
  assert.deepEqual(rocket.velocity, [0, 1000, 0], "fire_rocket must scale the raw dir by speed like VectorScale");
  assert.deepEqual(rocket.s.angles.map((value) => Object.is(value, -0) ? 0 : value), [0, 90, 0], "fire_rocket must derive projectile angles from dir");
  assert.equal(rocket.movetype, MOVETYPE_FLYMISSILE, "fire_rocket movetype mismatch");
  assert.equal(rocket.clipmask, MASK_SHOT, "fire_rocket clipmask mismatch");
  assert.equal(rocket.solid, SOLID_BBOX, "fire_rocket solid mismatch");
  assert.equal(rocket.s.effects & EF_ROCKET, EF_ROCKET, "fire_rocket must set EF_ROCKET");
  assert.deepEqual(rocket.mins, [0, 0, 0], "fire_rocket must clear mins");
  assert.deepEqual(rocket.maxs, [0, 0, 0], "fire_rocket must clear maxs");
  assert.equal(runtime.assets.modelPaths[rocket.s.modelindex - 1], "models/objects/rocket/tris.md2", "fire_rocket modelindex mismatch");
  assert.equal(runtime.assets.soundPaths[rocket.s.sound - 1], "weapons/rockfly.wav", "fire_rocket soundindex mismatch");
  assert.equal(rocket.owner, owner, "fire_rocket must retain owner");
  assert.equal(rocket.nextthink, 19, "fire_rocket must schedule cleanup at level.time + 8000/speed");
  assert.equal(rocket.dmg, 90, "fire_rocket damage mismatch");
  assert.equal(rocket.radius_dmg, 80, "fire_rocket radius damage mismatch");
  assert.equal(rocket.dmg_radius, 140, "fire_rocket damage radius mismatch");
  assert.equal(rocket.linked, true, "fire_rocket must link the projectile");
  assert.equal(runtime.linkedSolidEntities.includes(rocket), true, "fire_rocket must expose the rocket to solid touch runtime");
  assert.deepEqual(dodgeStart, [10, 20, 30], "fire_rocket must pass rocket origin to check_dodge");
  assert.deepEqual(dodgeDir, [0, 2, 0], "fire_rocket must pass raw dir to check_dodge");
  assert.equal(dodgeSpeed, 500, "fire_rocket must pass speed to check_dodge");
  assert.equal(dodgeSawLinked, false, "fire_rocket must run check_dodge before linkentity");
  assert.deepEqual(order, ["check_dodge", "link"], "fire_rocket must preserve check_dodge/linkentity order");
}

function verifyFireRailDamageModAndVisibleTrail(): void {
  const runtime = createHarnessRuntime();
  const shooter = createPlayer(runtime, 1);
  const monster = createRuntimeEntity({ classname: "monster_target" }, 2);
  const wall = createRuntimeEntity({ classname: "func_wall" }, 3);
  monster.svflags = SVF_MONSTER;
  monster.takedamage = damage_t.DAMAGE_AIM;
  runtime.entities[2] = monster;
  runtime.entities[3] = wall;

  const traces: Array<{ start: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];
  let traceIndex = 0;
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], passent: passent as GameEntity | null, mask });
      traceIndex += 1;
      if (traceIndex === 1) {
        return makeTrace(0.1, [16, 0, 0], null, null, CONTENTS_SLIME);
      }
      return traceIndex === 2 ? makeTrace(0.25, [64, 0, 0], monster) : makeTrace(0.5, [128, 0, 0], wall);
    },
    pointcontents: () => 0
  };

  const damages: Array<{
    target: GameEntity;
    inflictor: GameEntity;
    attacker: GameEntity;
    dir: vec3_t;
    point: vec3_t;
    normal: vec3_t;
    damage: number;
    knockback: number;
    mod: number;
  }> = [];
  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  fire_rail(shooter, [4, 5, 6], [1, 0, 0], 100, 200, runtime, {
    T_Damage: (target, inflictor, attacker, dir, point, normal, damage, knockback, _dflags, mod) => {
      damages.push({
        target,
        inflictor,
        attacker,
        dir: [...dir],
        point: [...point],
        normal: [...normal],
        damage,
        knockback,
        mod
      });
    },
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    }
  });

  const initialMask = MASK_SHOT | CONTENTS_SLIME | CONTENTS_LAVA;
  assert.equal(traces.length, 3, "fire_rail must keep tracing through slime/lava and one pierceable monster");
  assert.deepEqual(traces[0]?.start, [4, 5, 6], "fire_rail local from must start as a copy of start");
  assert.deepEqual(traces[0]?.end, [8196, 5, 6], "fire_rail local end must be start + 8192 * aimdir");
  assert.equal(traces[0]?.passent, shooter, "fire_rail first ignore must be self");
  assert.equal(traces[0]?.mask, initialMask, "fire_rail initial mask must include MASK_SHOT, CONTENTS_SLIME and CONTENTS_LAVA");
  assert.deepEqual(traces[1]?.start, [16, 0, 0], "fire_rail must advance local from to tr.endpos after water/slime trace");
  assert.equal(traces[1]?.passent, shooter, "fire_rail must keep ignoring self when the trace only hit slime/lava contents");
  assert.equal(traces[1]?.mask, MASK_SHOT, "fire_rail must drop slime/lava from mask after detecting those contents");
  assert.deepEqual(traces[2]?.start, [64, 0, 0], "fire_rail must advance local from to the pierced monster endpos");
  assert.equal(traces[2]?.passent, monster, "fire_rail must ignore the pierced monster on the next trace");
  assert.equal(traces[2]?.mask, MASK_SHOT, "fire_rail must keep the reduced mask after water/slime detection");
  assert.equal(damages.length, 1, "fire_rail must damage the pierceable monster once");
  assert.equal(damages[0]?.target, monster, "fire_rail damage target mismatch");
  assert.equal(damages[0]?.inflictor, shooter, "fire_rail damage inflictor must be self");
  assert.equal(damages[0]?.attacker, shooter, "fire_rail damage attacker must be self");
  assert.deepEqual(damages[0]?.dir, [1, 0, 0], "fire_rail damage direction must use aimdir");
  assert.deepEqual(damages[0]?.point, [64, 0, 0], "fire_rail damage point must use tr.endpos");
  assert.deepEqual(damages[0]?.normal, [0, 0, 1], "fire_rail damage normal must use tr.plane.normal");
  assert.equal(damages[0]?.damage, 100, "fire_rail damage amount mismatch");
  assert.equal(damages[0]?.knockback, 200, "fire_rail kick mismatch");
  assert.equal(damages[0]?.mod, MOD_RAILGUN, "fire_rail damage must use MOD_RAILGUN");
  assert.equal(tempEvents.length, 2, "fire_rail must emit a second rail trail after passing through slime/lava");
  assert.equal(tempEvents[0]?.type, temp_event_t.TE_RAILTRAIL, "fire_rail must emit a rail trail temp entity");
  assert.equal(tempEvents[1]?.type, temp_event_t.TE_RAILTRAIL, "fire_rail water/slime branch must emit a rail trail temp entity");
  assert.deepEqual(tempEvents[0]?.payload.start, [4, 5, 6], "rail trail start mismatch");
  assert.deepEqual(tempEvents[0]?.payload.end, [128, 0, 0], "rail trail end must use the last trace end");
  assert.deepEqual(tempEvents[1]?.payload.start, [4, 5, 6], "water/slime rail trail start mismatch");
  assert.deepEqual(tempEvents[1]?.payload.end, [128, 0, 0], "water/slime rail trail end must use the last trace end");
}

function verifyBfgDamageModsAndVisibleEffects(): void {
  const runtime = createHarnessRuntime();
  const owner = createPlayer(runtime, 1);
  const bfg = createRuntimeEntity({ classname: "bfg blast" }, 2);
  const target = createRuntimeEntity({ classname: "monster_target" }, 3);
  const wall = createRuntimeEntity({ classname: "func_wall" }, 4);
  runtime.entities[2] = bfg;
  runtime.entities[3] = target;
  runtime.entities[4] = wall;
  bfg.owner = owner;
  bfg.velocity = [50, 0, 0];
  bfg.s.origin = [100, 0, 0];
  bfg.origin = [...bfg.s.origin];
  bfg.radius_dmg = 200;
  bfg.dmg_radius = 256;
  bfg.inuse = true;
  bfg.solid = SOLID_BBOX;
  target.takedamage = damage_t.DAMAGE_AIM;
  target.inuse = true;
  target.solid = SOLID_BBOX;
  target.svflags = SVF_MONSTER;
  target.s.origin = [120, 0, 0];
  target.origin = [...target.s.origin];
  target.mins = [-16, -16, -16];
  target.maxs = [16, 16, 16];
  target.absmin = [104, -16, -16];
  target.size = [32, 32, 32];

  const damageMods: number[] = [];
  const radiusMods: number[] = [];
  const directNormals: vec3_t[] = [];
  const tempEvents: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];
  bfg_touch(bfg, target, runtime, {
    T_Damage: (_target, _inflictor, _attacker, _dir, _point, normal, _damage, _knockback, _dflags, mod) => {
      damageMods.push(mod);
      directNormals.push([...normal]);
    },
    T_RadiusDamage: (_inflictor, _attacker, _damage, _ignore, _radius, mod) => {
      radiusMods.push(mod);
    },
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    },
    G_FreeEdict: () => undefined
  }, makePlane([0, 1, 0]), null);
  assert.equal(damageMods[0], MOD_BFG_BLAST, "bfg_touch direct damage must use MOD_BFG_BLAST");
  assert.deepEqual(directNormals[0], [0, 1, 0], "bfg_touch direct damage must use the impact plane normal");
  assert.equal(radiusMods[0], MOD_BFG_BLAST, "bfg_touch splash damage must use MOD_BFG_BLAST");
  assert.equal(tempEvents[0]?.type, temp_event_t.TE_BFG_BIGEXPLOSION, "bfg_touch must emit the visible big explosion");
  assert.equal(bfg.solid, SOLID_NOT, "bfg_touch must make the projectile non-solid before staged explosion frames");
  assert.equal(bfg.touch, undefined, "bfg_touch must clear the touch callback after impact");
  assert.deepEqual(bfg.s.origin, [95, 0, 0], "bfg_touch must back up the explosion origin by one FRAMETIME of velocity");
  assert.deepEqual(bfg.velocity, [0, 0, 0], "bfg_touch must stop the projectile after impact");
  assert.equal(runtime.assets.modelPaths[bfg.s.modelindex - 1], "sprites/s_bfg3.sp2", "bfg_touch must switch to the BFG explosion sprite model");
  assert.equal(bfg.s.frame, 0, "bfg_touch must reset the staged explosion frame");
  assert.equal(bfg.s.sound, 0, "bfg_touch must stop the flight sound");
  assert.equal((bfg.s.effects & EF_ANIM_ALLFAST), 0, "bfg_touch must clear EF_ANIM_ALLFAST");
  assert.equal(typeof bfg.think, "function", "bfg_touch must install bfg_explode as the next thinker");
  assert.equal(bfg.nextthink, runtime.time + 0.1, "bfg_touch must schedule bfg_explode after FRAMETIME");
  assert.equal(bfg.enemy, target, "bfg_touch must retain the touched entity as enemy");

  const skyBfg = createRuntimeEntity({ classname: "bfg blast" }, 5);
  skyBfg.owner = owner;
  skyBfg.inuse = true;
  let freedSky = false;
  const skyEvents: temp_event_t[] = [];
  bfg_touch(skyBfg, wall, runtime, {
    G_FreeEdict: (ent) => {
      freedSky = ent === skyBfg;
    },
    emitTempEntity: (type) => {
      skyEvents.push(type);
    }
  }, makePlane([0, 0, 1]), { name: "sky", flags: SURF_SKY, value: 0 });
  assert.equal(freedSky, true, "bfg_touch must free BFG projectiles touching sky surfaces");
  assert.equal(skyEvents.length, 0, "bfg_touch sky branch must not emit the big explosion temp entity");

  const collisionPlane = makePlane([-1, 0, 0]);
  const collisionSurface = { name: "stone", flags: 0, value: 0 };
  const callbackNormals: vec3_t[] = [];
  const callbackEvents: temp_event_t[] = [];
  const bfgOrder: string[] = [];
  runtime.engineLinkEntity = (entity) => {
    if (entity.classname === "bfg blast") {
      bfgOrder.push("link");
    }
  };
  let bfgDodgeStart: vec3_t | null = null;
  let bfgDodgeDir: vec3_t | null = null;
  let bfgDodgeSpeed = 0;
  let bfgDodgeSawLinked = true;
  const spawnedBfg = fire_bfg(owner, [8, 9, 10], [0, 2, 0], 175, 400, 300, runtime, {
    T_Damage: (_target, _inflictor, _attacker, _dir, _point, normal) => {
      callbackNormals.push([...normal]);
    },
    T_RadiusDamage: () => undefined,
    emitTempEntity: (type) => {
      callbackEvents.push(type);
    },
    check_dodge: (_self, start, dir, speed) => {
      bfgOrder.push("check_dodge");
      bfgDodgeStart = [...start];
      bfgDodgeDir = [...dir];
      bfgDodgeSpeed = speed;
      bfgDodgeSawLinked = runtime.linkedSolidEntities.some((entity) => entity.classname === "bfg blast");
    }
  });
  assert.equal(spawnedBfg.classname, "bfg blast", "fire_bfg must name the projectile bfg blast");
  assert.deepEqual(spawnedBfg.s.origin, [8, 9, 10], "fire_bfg local bfg must copy start into s.origin");
  assert.deepEqual(spawnedBfg.origin, [8, 9, 10], "fire_bfg local bfg must mirror start into runtime origin");
  assert.deepEqual(spawnedBfg.movedir, [0, 2, 0], "fire_bfg must preserve raw dir in movedir like VectorCopy");
  assert.deepEqual(spawnedBfg.velocity, [0, 800, 0], "fire_bfg must scale raw dir by speed like VectorScale");
  assert.deepEqual(spawnedBfg.s.angles.map((value) => Object.is(value, -0) ? 0 : value), [0, 90, 0], "fire_bfg must derive projectile angles from raw dir");
  assert.equal(spawnedBfg.movetype, MOVETYPE_FLYMISSILE, "fire_bfg movetype mismatch");
  assert.equal(spawnedBfg.clipmask, MASK_SHOT, "fire_bfg clipmask mismatch");
  assert.equal(spawnedBfg.solid, SOLID_BBOX, "fire_bfg solid mismatch");
  assert.equal(spawnedBfg.s.effects & EF_BFG, EF_BFG, "fire_bfg must set EF_BFG");
  assert.equal(spawnedBfg.s.effects & EF_ANIM_ALLFAST, EF_ANIM_ALLFAST, "fire_bfg must set EF_ANIM_ALLFAST");
  assert.deepEqual(spawnedBfg.mins, [0, 0, 0], "fire_bfg must clear mins");
  assert.deepEqual(spawnedBfg.maxs, [0, 0, 0], "fire_bfg must clear maxs");
  assert.equal(runtime.assets.modelPaths[spawnedBfg.s.modelindex - 1], "sprites/s_bfg1.sp2", "fire_bfg modelindex mismatch");
  assert.equal(runtime.assets.soundPaths[spawnedBfg.s.sound - 1], "weapons/bfg__l1a.wav", "fire_bfg soundindex mismatch");
  assert.equal(spawnedBfg.owner, owner, "fire_bfg must retain owner");
  assert.equal(spawnedBfg.radius_dmg, 175, "fire_bfg must initialize radius_dmg for the later bfg_explode frame-0 effect");
  assert.equal(spawnedBfg.dmg_radius, 300, "fire_bfg must preserve the radius searched by bfg_explode");
  assert.equal(spawnedBfg.teammaster, spawnedBfg, "fire_bfg must set teammaster to the local bfg projectile");
  assert.equal(spawnedBfg.teamchain, null, "fire_bfg must clear teamchain");
  assert.equal(spawnedBfg.linked, true, "fire_bfg must link the projectile");
  assert.equal(runtime.linkedSolidEntities.includes(spawnedBfg), true, "fire_bfg must expose the BFG projectile to solid touch runtime");
  assert.deepEqual(bfgDodgeStart, [8, 9, 10], "fire_bfg must pass bfg origin to check_dodge");
  assert.deepEqual(bfgDodgeDir, [0, 2, 0], "fire_bfg must pass raw dir to check_dodge");
  assert.equal(bfgDodgeSpeed, 400, "fire_bfg must pass speed to check_dodge");
  assert.equal(bfgDodgeSawLinked, false, "fire_bfg must run check_dodge before linkentity");
  assert.deepEqual(bfgOrder, ["check_dodge", "link"], "fire_bfg must preserve check_dodge/linkentity order");
  assert.equal(typeof spawnedBfg.think, "function", "fire_bfg must install the BFG thinker runtime branch");
  wall.takedamage = damage_t.DAMAGE_AIM;
  spawnedBfg.touch?.(spawnedBfg, wall, runtime, collisionPlane, collisionSurface);
  assert.deepEqual(callbackNormals[0], [-1, 0, 0], "fire_bfg default runtime touch callback must forward collision plane to bfg_touch");
  assert.equal(callbackEvents[0], temp_event_t.TE_BFG_BIGEXPLOSION, "fire_bfg default runtime touch callback must forward non-sky surfaces to bfg_touch");
  wall.takedamage = damage_t.DAMAGE_NO;

  bfg.s.frame = 0;
  bfg.s.origin = [100, 0, 0];
  bfg.origin = [...bfg.s.origin];
  bfg.velocity = [50, 0, 0];
  bfg.radius_dmg = 175;
  target.s.origin = [132, 0, 0];
  target.origin = [...target.s.origin];
  target.mins = [-16, -16, -16];
  target.maxs = [16, 16, 16];
  const filtered = createRuntimeEntity({ classname: "monster_filtered" }, 5);
  runtime.entities[5] = filtered;
  filtered.takedamage = damage_t.DAMAGE_AIM;
  filtered.inuse = true;
  filtered.solid = SOLID_BBOX;
  filtered.svflags = SVF_MONSTER;
  filtered.s.origin = [140, 0, 0];
  filtered.origin = [...filtered.s.origin];
  filtered.mins = [-16, -16, -16];
  filtered.maxs = [16, 16, 16];
  damageMods.length = 0;
  tempEvents.length = 0;
  const bfgEffectDamages: Array<{
    target: GameEntity;
    attacker: GameEntity;
    dir: vec3_t;
    point: vec3_t;
    normal: vec3_t;
    damage: number;
    knockback: number;
    dflags: number;
    mod: number;
  }> = [];
  const canDamageChecks: Array<{ target: GameEntity; inflictor: GameEntity }> = [];
  bfg_explode(bfg, runtime, {
    canDamage: (checkTarget, checkInflictor) => {
      canDamageChecks.push({ target: checkTarget, inflictor: checkInflictor });
      return checkTarget !== filtered;
    },
    T_Damage: (damageTarget, _inflictor, attacker, dir, point, normal, damage, knockback, dflags, mod) => {
      damageMods.push(mod);
      bfgEffectDamages.push({
        target: damageTarget,
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
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    },
    G_FreeEdict: () => undefined
  });
  assert.deepEqual(damageMods, [MOD_BFG_EFFECT], "bfg_explode effect damage must use MOD_BFG_EFFECT");
  assert.equal(tempEvents[0]?.type, temp_event_t.TE_BFG_EXPLOSION, "bfg_explode must emit visible BFG explosion sprites");
  assert.equal(bfgEffectDamages.length, 1, "bfg_explode must damage only entities passing takedamage, owner and CanDamage filters");
  assert.equal(bfgEffectDamages[0]?.target, target, "bfg_explode local ent must be the findradius target that passed filters");
  assert.equal(bfgEffectDamages[0]?.attacker, owner, "bfg_explode attacker must be self->owner");
  assert.deepEqual(bfgEffectDamages[0]?.dir, [50, 0, 0], "bfg_explode damage direction must use self->velocity");
  assert.deepEqual(bfgEffectDamages[0]?.point, target.s.origin, "bfg_explode damage point must use ent->s.origin");
  assert.deepEqual(bfgEffectDamages[0]?.normal, [0, 0, 0], "bfg_explode damage normal must be vec3_origin");
  assert.equal(bfgEffectDamages[0]?.damage, 113, "bfg_explode local v/dist/points calculation must match truncated C damage");
  assert.equal(bfgEffectDamages[0]?.knockback, 0, "bfg_explode knockback must be zero");
  assert.equal(bfgEffectDamages[0]?.dflags, DAMAGE_ENERGY, "bfg_explode must apply DAMAGE_ENERGY");
  assert.deepEqual(tempEvents[0]?.payload.origin, target.s.origin, "bfg_explode TE_BFG_EXPLOSION origin must use ent->s.origin");
  assert.equal(canDamageChecks.some((check) => check.target === target && check.inflictor === bfg), true, "bfg_explode must check CanDamage(ent, self)");
  assert.equal(canDamageChecks.some((check) => check.target === target && check.inflictor === owner), true, "bfg_explode must check CanDamage(ent, self->owner)");
  assert.equal(canDamageChecks.some((check) => check.target === filtered), true, "bfg_explode must evaluate CanDamage filters for radius candidates");
  assert.equal(bfg.s.frame, 1, "bfg_explode must advance frame after the frame-0 area effect");
  assert.equal(bfg.nextthink, runtime.time + 0.1, "bfg_explode must reschedule by FRAMETIME");

  bfg.s.frame = 4;
  bfg_explode(bfg, runtime, {
    G_FreeEdict: () => undefined
  });
  assert.equal(bfg.s.frame, 5, "bfg_explode must advance to frame 5");
  assert.equal(typeof bfg.think, "function", "bfg_explode frame 5 must install G_FreeEdict for cleanup");

  damageMods.length = 0;
  tempEvents.length = 0;
  filtered.inuse = false;
  spawnedBfg.inuse = false;
  runtime.deathmatch = true;
  bfg.s.skinnum = 0xd2;
  target.s.origin = [148, 0, 0];
  target.origin = [...target.s.origin];
  target.absmin = [132, -16, -16];
  target.size = [32, 32, 32];
  const immuneMonster = createRuntimeEntity({ classname: "monster_immune" }, 6);
  runtime.entities[6] = immuneMonster;
  immuneMonster.inuse = true;
  immuneMonster.solid = SOLID_BBOX;
  immuneMonster.takedamage = damage_t.DAMAGE_AIM;
  immuneMonster.svflags = SVF_MONSTER;
  immuneMonster.flags = FL_IMMUNE_LASER;
  immuneMonster.s.origin = [152, 0, 0];
  immuneMonster.origin = [...immuneMonster.s.origin];
  immuneMonster.mins = [-16, -16, -16];
  immuneMonster.maxs = [16, 16, 16];
  immuneMonster.absmin = [136, -16, -16];
  immuneMonster.size = [32, 32, 32];
  const explobox = createRuntimeEntity({ classname: "misc_explobox" }, 7);
  runtime.entities[7] = explobox;
  explobox.inuse = true;
  explobox.solid = SOLID_BBOX;
  explobox.takedamage = damage_t.DAMAGE_AIM;
  explobox.s.origin = [156, 0, 0];
  explobox.origin = [...explobox.s.origin];
  explobox.mins = [-16, -16, -16];
  explobox.maxs = [16, 16, 16];
  explobox.absmin = [140, -16, -16];
  explobox.size = [32, 32, 32];
  const ignoredCrate = createRuntimeEntity({ classname: "crate" }, 8);
  runtime.entities[8] = ignoredCrate;
  ignoredCrate.inuse = true;
  ignoredCrate.solid = SOLID_BBOX;
  ignoredCrate.takedamage = damage_t.DAMAGE_AIM;
  ignoredCrate.s.origin = [160, 0, 0];
  ignoredCrate.origin = [...ignoredCrate.s.origin];
  ignoredCrate.mins = [-16, -16, -16];
  ignoredCrate.maxs = [16, 16, 16];
  ignoredCrate.absmin = [144, -16, -16];
  ignoredCrate.size = [32, 32, 32];
  const traceCalls: Array<{ start: vec3_t; end: vec3_t; ignore: GameEntity | null; mask: number }> = [];
  const bfgThinkDamages: Array<{ target: GameEntity; damage: number; dir: vec3_t; point: vec3_t; normal: vec3_t; mod: number }> = [];
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, ignore, mask) => {
      traceCalls.push({ start: [...start], end: [...end], ignore: ignore as GameEntity | null, mask });
      if (traceCalls.length === 1) {
        return makeTrace(0.2, [120, 0, 0], target);
      }
      if (traceCalls.length === 2) {
        return makeTrace(0.4, [160, 0, 0], wall);
      }
      if (traceCalls.length === 3) {
        return makeTrace(0.3, [132, 0, 0], immuneMonster);
      }
      if (traceCalls.length === 4) {
        return makeTrace(1, [180, 0, 0], null);
      }
      if (traceCalls.length === 5) {
        return makeTrace(0.25, [136, 0, 0], explobox);
      }
      return makeTrace(1, end, null);
    },
    pointcontents: () => 0
  };
  bfg_think(bfg, runtime, {
    T_Damage: (damageTarget, _inflictor, _attacker, dir, point, normal, damage, _knockback, _dflags, mod) => {
      damageMods.push(mod);
      bfgThinkDamages.push({
        target: damageTarget,
        damage,
        dir: [...dir],
        point: [...point],
        normal: [...normal],
        mod
      });
    },
    emitTempEntity: (type, payload) => {
      tempEvents.push({ type, payload });
    }
  });
  assert.deepEqual(damageMods, [MOD_BFG_LASER, MOD_BFG_LASER], "bfg_think laser damage must use MOD_BFG_LASER for damageable non-immune hits");
  assert.equal(bfgThinkDamages[0]?.target, target, "bfg_think local ent/ignore trace must damage the first monster candidate");
  assert.equal(bfgThinkDamages[0]?.damage, 5, "bfg_think deathmatch branch must use 5 laser damage");
  assert.deepEqual(bfgThinkDamages[0]?.dir, [1, 0, 0], "bfg_think local point/dir must aim from BFG origin toward target center");
  assert.deepEqual(bfgThinkDamages[0]?.point, [120, 0, 0], "bfg_think damage point must use tr.endpos");
  assert.deepEqual(bfgThinkDamages[0]?.normal, [0, 0, 0], "bfg_think laser damage normal must be vec3_origin");
  assert.equal(bfgThinkDamages[1]?.target, explobox, "bfg_think must include misc_explobox despite it not being a monster/client");
  assert.equal(traceCalls[0]?.ignore, bfg, "bfg_think first trace must ignore the BFG projectile itself");
  assert.equal(traceCalls[1]?.ignore, target, "bfg_think must continue tracing through monsters/clients by updating ignore");
  assert.equal(traceCalls[0]?.mask, CONTENTS_SOLID | CONTENTS_MONSTER | CONTENTS_DEADMONSTER, "bfg_think trace mask must match the C CONTENTS mask");
  assert.deepEqual(traceCalls[0]?.start, bfg.s.origin, "bfg_think local start must begin at self->s.origin");
  assert.deepEqual(traceCalls[0]?.end, [2148, 0, 0], "bfg_think local end must extend 2048 units along dir");
  assert.deepEqual(traceCalls[1]?.start, [120, 0, 0], "bfg_think must copy tr.endpos back into start after a monster hit");
  const sparks = tempEvents.find((event) => event.type === temp_event_t.TE_LASER_SPARKS);
  assert.equal(sparks?.payload.count, 4, "bfg_think wall hit must emit four laser sparks");
  assert.deepEqual(sparks?.payload.origin, [160, 0, 0], "bfg_think laser sparks must use wall trace endpos");
  assert.deepEqual(sparks?.payload.dir, [0, 0, 1], "bfg_think laser sparks must use tr.plane.normal");
  assert.equal(sparks?.payload.color, 0xd2, "bfg_think laser sparks must use self->s.skinnum color");
  const lasers = tempEvents.filter((event) => event.type === temp_event_t.TE_BFG_LASER);
  assert.equal(lasers.length, 3, "bfg_think must emit one visible BFG laser per accepted radius candidate");
  assert.deepEqual(lasers[0]?.payload.start, bfg.s.origin, "bfg_think BFG laser must start at self->s.origin");
  assert.deepEqual(lasers[0]?.payload.end, [160, 0, 0], "bfg_think BFG laser must end at the last trace endpos");
  assert.deepEqual(lasers[1]?.payload.end, [180, 0, 0], "bfg_think immune monster branch must still emit the visible beam without damage");
  assert.deepEqual(lasers[2]?.payload.end, [136, 0, 0], "bfg_think misc_explobox beam must use its final trace endpos");
  assert.equal(bfg.nextthink, runtime.time + 0.1, "bfg_think must reschedule itself by FRAMETIME");
}

function verifyGrenadeTouchOwnerSkyBounceAndDamage(): void {
  const runtime = createHarnessRuntime();
  const owner = createPlayer(runtime, 1);
  const grenade = createRuntimeEntity({ classname: "grenade" }, 2);
  const wall = createRuntimeEntity({ classname: "func_wall" }, 3);
  const target = createRuntimeEntity({ classname: "monster_target" }, 4);
  runtime.entities[2] = grenade;
  runtime.entities[3] = wall;
  runtime.entities[4] = target;
  grenade.owner = owner;
  grenade.s.origin = [12, 8, 4];
  grenade.origin = [...grenade.s.origin];
  grenade.velocity = [10, 0, 0];
  grenade.dmg = 80;
  grenade.dmg_radius = 120;
  target.takedamage = damage_t.DAMAGE_AIM;

  let freed: GameEntity | null = null;
  let exploded = false;
  Grenade_Touch(grenade, owner, runtime, {
    G_FreeEdict: (ent) => {
      freed = ent;
    },
    T_RadiusDamage: () => {
      exploded = true;
    }
  });
  assert.equal(freed, null, "Grenade_Touch must ignore the owner");
  assert.equal(exploded, false, "Grenade_Touch owner branch must not explode");

  Grenade_Touch(grenade, wall, runtime, {
    G_FreeEdict: (ent) => {
      freed = ent;
    }
  }, null, { name: "sky", flags: SURF_SKY, value: 0 });
  assert.equal(freed, grenade, "Grenade_Touch must free grenades touching sky surfaces");

  const playedSounds: string[] = [];
  grenade.spawnflags = 1;
  withMathRandom([0.75], () => {
    Grenade_Touch(grenade, wall, runtime, {
      playEntitySound: (_ent, soundPath) => {
        playedSounds.push(soundPath);
      }
    });
  });
  assert.equal(playedSounds.at(-1), "weapons/hgrenb1a.wav", "held grenade bounce sound high random branch mismatch");

  grenade.spawnflags = 0;
  Grenade_Touch(grenade, wall, runtime, {
    playEntitySound: (_ent, soundPath) => {
      playedSounds.push(soundPath);
    }
  });
  assert.equal(playedSounds.at(-1), "weapons/grenlb1b.wav", "launched grenade bounce sound mismatch");

  const tempEvents: temp_event_t[] = [];
  freed = null;
  Grenade_Touch(grenade, target, runtime, {
    T_Damage: () => undefined,
    T_RadiusDamage: () => undefined,
    emitTempEntity: (type) => {
      tempEvents.push(type);
    },
    G_FreeEdict: (ent) => {
      freed = ent;
    }
  });
  assert.equal(grenade.enemy, target, "Grenade_Touch must arm ent.enemy with the damageable impact target");
  assert.equal(tempEvents[0], temp_event_t.TE_ROCKET_EXPLOSION, "Grenade_Touch damageable impact must route to Grenade_Explode visible temp entity");
  assert.equal(freed, grenade, "Grenade_Touch damageable impact must free through Grenade_Explode");
}

function verifyFireGrenadeSpawnStateAndRuntimeTouch(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 10.5;
  const owner = createPlayer(runtime, 1);
  const target = createRuntimeEntity({ classname: "monster_target" }, 2);
  runtime.entities[2] = target;
  target.takedamage = damage_t.DAMAGE_AIM;

  let grenade: GameEntity;
  const tempEvents: temp_event_t[] = [];
  let freed: GameEntity | null = null;
  withMathRandom([0.5, 0.5], () => {
    grenade = fire_grenade(owner, [10, 20, 30], [1, 0, 0], 100, 600, 2.5, 140, runtime, {
      T_Damage: () => undefined,
      T_RadiusDamage: () => undefined,
      emitTempEntity: (type) => {
        tempEvents.push(type);
      },
      G_FreeEdict: (ent) => {
        freed = ent;
        ent.inuse = false;
      }
    });
  });

  assert.equal(grenade!.classname, "grenade", "fire_grenade classname mismatch");
  assert.deepEqual(grenade!.s.origin, [10, 20, 30], "fire_grenade origin mismatch");
  assert.deepEqual(grenade!.origin, [10, 20, 30], "fire_grenade runtime origin mismatch");
  assertVec3Close(grenade!.velocity, [600, -10 / 32767, 200 + 10 / 32767], "fire_grenade velocity must include aim speed and C-style crandom jitter");
  assert.deepEqual(grenade!.avelocity, [300, 300, 300], "fire_grenade angular velocity mismatch");
  assert.equal(grenade!.movetype, MOVETYPE_BOUNCE, "fire_grenade movetype mismatch");
  assert.equal(grenade!.clipmask, MASK_SHOT, "fire_grenade clipmask mismatch");
  assert.equal(grenade!.solid, SOLID_BBOX, "fire_grenade solid mismatch");
  assert.equal((grenade!.s.effects & EF_GRENADE) !== 0, true, "fire_grenade must set EF_GRENADE");
  assert.deepEqual(grenade!.mins, [0, 0, 0], "fire_grenade mins must be cleared");
  assert.deepEqual(grenade!.maxs, [0, 0, 0], "fire_grenade maxs must be cleared");
  assert.equal(runtime.assets.modelPaths[grenade!.s.modelindex - 1], "models/objects/grenade/tris.md2", "fire_grenade modelindex mismatch");
  assert.equal(grenade!.owner, owner, "fire_grenade owner mismatch");
  assert.equal(typeof grenade!.touch, "function", "fire_grenade must install Grenade_Touch callback");
  assert.equal(typeof grenade!.think, "function", "fire_grenade must install Grenade_Explode think callback");
  assert.equal(grenade!.nextthink, 13, "fire_grenade nextthink must use runtime time plus timer");
  assert.equal(grenade!.dmg, 100, "fire_grenade damage mismatch");
  assert.equal(grenade!.dmg_radius, 140, "fire_grenade damage radius mismatch");
  assert.equal(grenade!.linked, true, "fire_grenade must link the projectile");
  assert.equal(runtime.linkedSolidEntities.includes(grenade!), true, "fire_grenade must be reachable by solid touch runtime");

  grenade!.touch?.(grenade!, target, runtime, null, null);
  assert.equal(freed, grenade!, "fire_grenade touch callback must free through Grenade_Explode");
  assert.equal(grenade!.inuse, false, "fire_grenade touch callback must reach Grenade_Explode and free the projectile");
  assert.equal(tempEvents.at(-1), temp_event_t.TE_ROCKET_EXPLOSION, "fire_grenade touch callback must emit the explosion temp entity");

  const hookedRuntime = createHarnessRuntime();
  const hookedOwner = createPlayer(hookedRuntime, 1);
  let hookedTouchCalled = false;
  const hookedGrenade = fire_grenade(hookedOwner, [0, 0, 0], [1, 0, 0], 1, 1, 1, 1, hookedRuntime, {
    Grenade_Touch: () => {
      hookedTouchCalled = true;
    }
  });
  hookedGrenade.touch?.(hookedGrenade, target, hookedRuntime);
  assert.equal(hookedTouchCalled, true, "fire_grenade must preserve explicit Grenade_Touch hook injection");
}

function verifyFireGrenade2SpawnStateTimerBranchesAndRuntimeTouch(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 20;
  const owner = createPlayer(runtime, 1);
  const target = createRuntimeEntity({ classname: "monster_target" }, 2);
  runtime.entities[2] = target;
  target.takedamage = damage_t.DAMAGE_AIM;

  const tempEvents: temp_event_t[] = [];
  const playedSounds: string[] = [];
  let freed: GameEntity | null = null;
  let grenade: GameEntity;
  withMathRandom([0.5, 0.5], () => {
    grenade = fire_grenade2(owner, [4, 5, 6], [1, 0, 0], 125, 400, 2.25, 165, true, runtime, {
      T_Damage: () => undefined,
      T_RadiusDamage: () => undefined,
      emitTempEntity: (type) => {
        tempEvents.push(type);
      },
      playEntitySound: (_ent, soundPath) => {
        playedSounds.push(soundPath);
      },
      G_FreeEdict: (ent) => {
        freed = ent;
        ent.inuse = false;
      }
    });
  });

  assert.equal(grenade!.classname, "hgrenade", "fire_grenade2 classname mismatch");
  assert.deepEqual(grenade!.s.origin, [4, 5, 6], "fire_grenade2 origin mismatch");
  assert.deepEqual(grenade!.origin, [4, 5, 6], "fire_grenade2 runtime origin mismatch");
  assertVec3Close(grenade!.velocity, [400, -10 / 32767, 200 + 10 / 32767], "fire_grenade2 velocity must include aim speed and C-style crandom jitter");
  assert.deepEqual(grenade!.avelocity, [300, 300, 300], "fire_grenade2 angular velocity mismatch");
  assert.equal(grenade!.movetype, MOVETYPE_BOUNCE, "fire_grenade2 movetype mismatch");
  assert.equal(grenade!.clipmask, MASK_SHOT, "fire_grenade2 clipmask mismatch");
  assert.equal(grenade!.solid, SOLID_BBOX, "fire_grenade2 solid mismatch");
  assert.equal((grenade!.s.effects & EF_GRENADE) !== 0, true, "fire_grenade2 must set EF_GRENADE");
  assert.deepEqual(grenade!.mins, [0, 0, 0], "fire_grenade2 mins must be cleared");
  assert.deepEqual(grenade!.maxs, [0, 0, 0], "fire_grenade2 maxs must be cleared");
  assert.equal(runtime.assets.modelPaths[grenade!.s.modelindex - 1], "models/objects/grenade2/tris.md2", "fire_grenade2 modelindex mismatch");
  assert.equal(runtime.assets.soundPaths[grenade!.s.sound - 1], "weapons/hgrenc1b.wav", "fire_grenade2 flight sound mismatch");
  assert.equal(grenade!.owner, owner, "fire_grenade2 owner mismatch");
  assert.equal(typeof grenade!.touch, "function", "fire_grenade2 must install Grenade_Touch callback");
  assert.equal(typeof grenade!.think, "function", "fire_grenade2 must install Grenade_Explode think callback");
  assert.equal(grenade!.nextthink, 22.25, "fire_grenade2 nextthink must use runtime time plus timer");
  assert.equal(grenade!.dmg, 125, "fire_grenade2 damage mismatch");
  assert.equal(grenade!.dmg_radius, 165, "fire_grenade2 damage radius mismatch");
  assert.equal(grenade!.spawnflags, 3, "fire_grenade2 held branch must set spawnflags 3");
  assert.equal(grenade!.linked, true, "fire_grenade2 positive timer must link the projectile");
  assert.equal(runtime.linkedSolidEntities.includes(grenade!), true, "fire_grenade2 must be reachable by solid touch runtime");
  assert.deepEqual(playedSounds, ["weapons/hgrent1a.wav"], "fire_grenade2 positive timer must play the throw sound");

  grenade!.touch?.(grenade!, target, runtime, null, null);
  assert.equal(freed, grenade!, "fire_grenade2 touch callback must free through Grenade_Explode");
  assert.equal(tempEvents.at(-1), temp_event_t.TE_ROCKET_EXPLOSION, "fire_grenade2 touch callback must emit the explosion temp entity");

  const immediateRuntime = createHarnessRuntime();
  immediateRuntime.time = 30;
  const immediateOwner = createPlayer(immediateRuntime, 1);
  const immediateTempEvents: temp_event_t[] = [];
  const immediateSounds: string[] = [];
  let immediateFreed: GameEntity | null = null;
  const immediateGrenade = fire_grenade2(immediateOwner, [1, 2, 3], [1, 0, 0], 50, 250, 0, 90, false, immediateRuntime, {
    T_Damage: () => undefined,
    T_RadiusDamage: () => undefined,
    emitTempEntity: (type) => {
      immediateTempEvents.push(type);
    },
    playEntitySound: (_ent, soundPath) => {
      immediateSounds.push(soundPath);
    },
    G_FreeEdict: (ent) => {
      immediateFreed = ent;
      ent.inuse = false;
    }
  });

  assert.equal(immediateGrenade.spawnflags, 1, "fire_grenade2 non-held branch must set spawnflags 1");
  assert.equal(immediateGrenade.linked, false, "fire_grenade2 zero timer must explode before linking");
  assert.equal(immediateRuntime.linkedSolidEntities.includes(immediateGrenade), false, "fire_grenade2 zero timer must not leave a linked projectile");
  assert.equal(immediateFreed, immediateGrenade, "fire_grenade2 zero timer must call Grenade_Explode immediately");
  assert.equal(immediateTempEvents.at(-1), temp_event_t.TE_ROCKET_EXPLOSION, "fire_grenade2 zero timer must emit the explosion temp entity");
  assert.deepEqual(immediateSounds, [], "fire_grenade2 zero timer must skip the throw sound");
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

function assertVec3Close(actual: vec3_t, expected: vec3_t, message: string, epsilon = 1e-9): void {
  assert.ok(
    actual.every((value, index) => Math.abs(value - expected[index]) <= epsilon),
    `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
  );
}
