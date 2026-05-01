/**
 * File: quake2-g-combat.ts
 * Purpose: Verify the gameplay-side combat helpers ported from `game/g_combat.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for `g_combat.ts`.
 *
 * Dependencies:
 * - packages/game
 */

import {
  AI_GOOD_GUY,
  AI_DUCKED,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity
} from "../../packages/game/src/index.js";
import { CheckPowerArmor, Killed, M_ReactToDamage, T_Damage, T_RadiusDamage } from "../../packages/game/src/g_combat.js";
import { temp_event_t } from "../../packages/qcommon/src/index.js";
import { MOVETYPE_BOUNCE, MOVETYPE_STEP, MOVETYPE_WALK, POWER_ARMOR_SHIELD, SOLID_BBOX, SVF_MONSTER } from "../../packages/game/src/runtime.js";
import {
  DAMAGE_BULLET,
  DAMAGE_NO_KNOCKBACK,
  DAMAGE_NO_PROTECTION,
  DAMAGE_RADIUS,
  DF_NO_FRIENDLY_FIRE,
  DF_SKINTEAMS,
  FL_GODMODE,
  FL_NO_KNOCKBACK,
  MOD_FRIENDLY_FIRE,
  MOD_BLASTER
} from "../../packages/game/src/runtime.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";

main();

function main(): void {
  verifyMonsterPowerArmorUsesMonsterinfo();
  verifyKilledUpdatesMonsterBookkeeping();
  verifyKilledMarksMedicOwnership();
  verifyReactToClientDamagePreservesVisibleEnemy();
  verifyTDamageAppliesNightmarePainDebounce();
  verifyTDamagePainCallbacksAndFinalClientAccumulation();
  verifyFriendlyFireUsesSkinTeams();
  verifyTDamageAccountingAndMeansOfDeath();
  verifyTDamageSparksAndMassKnockback();
  verifyTDamageTakeHealthAndKilled();
  verifyRadiusDamageFalloffFilteringAndForwarding();
  verifyRadiusDamageUsesDefaultDamageCore();

  console.log("Verification g_combat - damage/combat gameplay OK");
}

function verifyMonsterPowerArmorUsesMonsterinfo(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(10);

  monster.monsterinfo.power_armor_type = POWER_ARMOR_SHIELD;
  monster.monsterinfo.power_armor_power = 10;

  const saved = CheckPowerArmor(monster, [16, 0, 0], [0, 0, 1], 9, 0, runtime);
  assertNumber(saved, 6, "CheckPowerArmor absorbs the original shield fraction");
  assertNumber(monster.monsterinfo.power_armor_power, 7, "CheckPowerArmor spends monsterinfo cells");
}

function verifyKilledUpdatesMonsterBookkeeping(): void {
  const runtime = createHarnessRuntime();
  runtime.coop = true;

  const target = createMonster(11);
  const attacker = createPlayer(12);
  target.health = -25;

  Killed(target, attacker, attacker, 25, [0, 0, 0], runtime);

  const bookkeepingRuntime = runtime as GameRuntime & { killed_monsters?: number };
  assertNumber(bookkeepingRuntime.killed_monsters ?? 0, 1, "Killed increments killed_monsters for hostile monsters");
  assertNumber(attacker.client!.resp.score, 1, "Killed awards the coop frag to the attacking client");
}

function verifyKilledMarksMedicOwnership(): void {
  const runtime = createHarnessRuntime();
  const target = createMonster(13);
  const medic = createMonster(14, "monster_medic");

  Killed(target, medic, medic, 40, [0, 0, 0], runtime);
  assertEntity(target.owner, medic, "Killed preserves medic ownership so other medics ignore the corpse");
}

function verifyReactToClientDamagePreservesVisibleEnemy(): void {
  const runtime = createHarnessRuntime();
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => ({
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: {
        normal: [0, 0, 1],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: 0,
      ent: null
    }),
    pointcontents: () => 0
  };

  const target = createMonster(15);
  const currentEnemy = createPlayer(16);
  const attacker = createPlayer(17);

  target.enemy = currentEnemy;
  currentEnemy.viewheight = 22;
  attacker.viewheight = 22;

  M_ReactToDamage(target, attacker, runtime);

  assertEntity(target.enemy, currentEnemy, "M_ReactToDamage keeps the visible current client enemy");
  assertEntity(target.oldenemy, attacker, "M_ReactToDamage stores the new attacker in oldenemy");
}

function verifyTDamageAppliesNightmarePainDebounce(): void {
  const runtime = createHarnessRuntime();
  runtime.skill = 3;
  runtime.time = 12;

  const target = createMonster(18);
  const attacker = createPlayer(19);

  let painCalls = 0;
  target.pain = () => {
    painCalls += 1;
  };

  T_Damage(target, attacker, attacker, [1, 0, 0], [0, 0, 0], [0, 0, 1], 15, 0, 0, MOD_BLASTER, runtime, {
    M_ReactToDamage: () => {
      return;
    }
  });

  assertNumber(painCalls, 1, "T_Damage calls pain once on nightmare monsters that are not ducked");
  assertNumber(target.pain_debounce_time, 17, "T_Damage extends the nightmare pain debounce by five seconds");

  target.monsterinfo.aiflags |= AI_DUCKED;
  target.pain_debounce_time = 0;
  painCalls = 0;
  T_Damage(target, attacker, attacker, [1, 0, 0], [0, 0, 0], [0, 0, 1], 5, 0, 0, MOD_BLASTER, runtime, {
    M_ReactToDamage: () => {
      return;
    }
  });
  assertNumber(painCalls, 0, "T_Damage suppresses pain callbacks for ducked monsters");
}

function verifyTDamagePainCallbacksAndFinalClientAccumulation(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 21;
  const attacker = createPlayer(40);

  const monster = createMonster(41);
  monster.enemy = attacker;
  const monsterOrder: string[] = [];
  monster.pain = (_self, _other, knockback, damage) => {
    monsterOrder.push(`pain:${knockback}:${damage}`);
  };

  T_Damage(monster, attacker, attacker, [1, 0, 0], [1, 2, 3], [0, 0, 1], 9, 4, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false,
    M_ReactToDamage: () => {
      monsterOrder.push("react");
    }
  });

  assertString(monsterOrder.join(","), "react,pain:4:9", "T_Damage reacts before monster pain and forwards knockback/take");
  assertNumber(monster.pain_debounce_time, 0, "T_Damage does not apply the nightmare pain debounce outside nightmare skill");

  const player = createPlayer(42);
  const playerPainOrder: string[] = [];
  player.pain = (_self, _other, knockback, damage) => {
    playerPainOrder.push(`pain:${knockback}:${damage}`);
    assertNumber(player.client!.damage_parmor, 0, "T_Damage accumulates client power armor feedback after pain");
    assertNumber(player.client!.damage_armor, 0, "T_Damage accumulates client armor feedback after pain");
    assertNumber(player.client!.damage_blood, 0, "T_Damage accumulates client blood feedback after pain");
  };

  T_Damage(player, attacker, attacker, [1, 0, 0], [4, 5, 6], [0, 0, 1], 20, 7, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 2,
    CheckArmor: () => 3,
    CheckTeamDamage: () => false
  });

  assertString(playerPainOrder.join(","), "pain:7:15", "T_Damage calls client pain with final take");
  assertNumber(player.client!.damage_parmor, 2, "T_Damage accumulates final psave after client pain");
  assertNumber(player.client!.damage_armor, 3, "T_Damage accumulates final asave after client pain");
  assertNumber(player.client!.damage_blood, 15, "T_Damage accumulates final take after client pain");
  assertNumber(player.client!.damage_knockback, 7, "T_Damage accumulates final knockback after client pain");
  assertVec3(player.client!.damage_from, [4, 5, 6], "T_Damage copies the final damage origin after client pain");

  player.flags |= FL_GODMODE;
  let godmodePainCalls = 0;
  player.pain = () => {
    godmodePainCalls += 1;
  };
  T_Damage(player, attacker, attacker, [1, 0, 0], [7, 8, 9], [0, 0, 1], 10, 0, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });
  assertNumber(godmodePainCalls, 0, "T_Damage suppresses client pain while godmode saved all damage");

  const crate = createRuntimeEntity({ classname: "func_breakable" }, 43);
  crate.inuse = true;
  crate.movetype = MOVETYPE_WALK;
  crate.takedamage = 1;
  crate.health = 100;
  crate.mass = 200;
  let cratePain = "";
  crate.pain = (_self, _other, knockback, damage) => {
    cratePain = `${knockback}:${damage}`;
  };

  T_Damage(crate, attacker, attacker, [1, 0, 0], [2, 3, 4], [0, 0, 1], 6, 1, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });

  assertString(cratePain, "1:6", "T_Damage calls non-client non-monster pain only when take remains");
}

function verifyFriendlyFireUsesSkinTeams(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.dmflags = DF_SKINTEAMS | DF_NO_FRIENDLY_FIRE;

  const target = createPlayer(20);
  const attacker = createPlayer(21);
  target.client!.pers.userinfo = "\\skin\\male/grunt";
  attacker.client!.pers.userinfo = "\\skin\\female/grunt";

  T_Damage(target, attacker, attacker, [1, 0, 0], [0, 0, 0], [0, 0, 1], 20, 0, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });

  assertNumber(target.health, 100, "T_Damage cancels same-team friendly fire damage");

  T_Damage(target, attacker, attacker, [1, 0, 0], [0, 0, 0], [0, 0, 1], 20, 0, DAMAGE_NO_PROTECTION, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });
  assertNumber(target.health, 100, "T_Damage keeps friendly-fire cancellation ahead of no-protection handling");
}

function verifyTDamageAccountingAndMeansOfDeath(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.dmflags = DF_SKINTEAMS;

  const target = createPlayer(24);
  const attacker = createPlayer(25);
  target.client!.pers.userinfo = "\\skin\\male/grunt";
  attacker.client!.pers.userinfo = "\\skin\\female/grunt";

  let armorSawDamage = 0;
  T_Damage(target, attacker, attacker, [1, 0, 0], [4, 5, 6], [0, 0, 1], 20, 7, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 3,
    CheckArmor: (_ent, _point, _normal, damage) => {
      armorSawDamage = damage;
      return 5;
    },
    CheckTeamDamage: () => false
  });

  assertNumber(runtime.meansOfDeath, MOD_BLASTER | MOD_FRIENDLY_FIRE, "T_Damage records the friendly-fire death modifier after team checks");
  assertNumber(armorSawDamage, 17, "T_Damage feeds CheckArmor with damage remaining after power armor");
  assertNumber(target.health, 88, "T_Damage subtracts the take value left after protection saves");
  assertNumber(target.client!.damage_parmor, 3, "T_Damage accumulates psave into client power armor feedback");
  assertNumber(target.client!.damage_armor, 5, "T_Damage accumulates asave into client armor feedback");
  assertNumber(target.client!.damage_blood, 12, "T_Damage accumulates take into client blood feedback");

  target.flags |= FL_GODMODE;
  target.client!.damage_parmor = 0;
  target.client!.damage_armor = 0;
  target.client!.damage_blood = 0;
  T_Damage(target, attacker, attacker, [1, 0, 0], [4, 5, 6], [0, 0, 1], 20, 0, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });

  assertNumber(target.health, 88, "T_Damage keeps godmode save out of health damage");
  assertNumber(target.client!.damage_armor, 20, "T_Damage folds godmode save into client armor feedback");
  assertNumber(target.client!.damage_blood, 0, "T_Damage leaves no take value after godmode save");
}

function verifyTDamageSparksAndMassKnockback(): void {
  const runtime = createHarnessRuntime();
  const target = createPlayer(26);
  const attacker = createPlayer(27);
  const emittedTypes: temp_event_t[] = [];

  T_Damage(target, attacker, attacker, [10, 0, 0], [4, 5, 6], [0, 0, 1], 1, 10, DAMAGE_BULLET, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false,
    emitTempEntity: (type) => {
      emittedTypes.push(type);
    }
  });

  assertNumber(emittedTypes[0], temp_event_t.TE_BLOOD, "T_Damage uses blood temp entities for damaged clients");

  const crate = createRuntimeEntity({ classname: "func_breakable" }, 28);
  crate.inuse = true;
  crate.movetype = MOVETYPE_WALK;
  crate.takedamage = 1;
  crate.health = 100;
  crate.mass = 25;
  crate.velocity = [1, 2, 3];

  emittedTypes.length = 0;
  T_Damage(crate, attacker, attacker, [10, 0, 0], [4, 5, 6], [0, 0, 1], 6, 10, DAMAGE_BULLET, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false,
    emitTempEntity: (type) => {
      emittedTypes.push(type);
    }
  });

  assertNumber(emittedTypes[0], temp_event_t.TE_BULLET_SPARKS, "T_Damage selects bullet sparks for DAMAGE_BULLET");
  assertApprox(crate.velocity[0], 101, 0.0001, "T_Damage clamps mass below 50 before applying knockback");
  assertApprox(crate.velocity[1], 2, 0.0001, "T_Damage preserves perpendicular velocity during knockback");

  emittedTypes.length = 0;
  T_Damage(crate, attacker, attacker, [0, 10, 0], [4, 5, 6], [0, 0, 1], 6, 10, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false,
    emitTempEntity: (type) => {
      emittedTypes.push(type);
    }
  });
  assertNumber(emittedTypes[0], temp_event_t.TE_SPARKS, "T_Damage selects regular sparks without DAMAGE_BULLET");

  const rocketJumper = createPlayer(29);
  rocketJumper.mass = 200;
  T_Damage(rocketJumper, rocketJumper, rocketJumper, [0, 0, 5], [4, 5, 6], [0, 0, 1], 1, 10, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });
  assertApprox(rocketJumper.velocity[2], 80, 0.0001, "T_Damage uses the client self-damage rocket jump scale");

  const noKnockback = createPlayer(30);
  noKnockback.flags |= FL_NO_KNOCKBACK;
  T_Damage(noKnockback, attacker, attacker, [1, 0, 0], [4, 5, 6], [0, 0, 1], 1, 10, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });
  assertApprox(noKnockback.velocity[0], 0, 0.0001, "T_Damage honors FL_NO_KNOCKBACK before momentum add");

  const dflagNoKnockback = createPlayer(31);
  T_Damage(dflagNoKnockback, attacker, attacker, [1, 0, 0], [4, 5, 6], [0, 0, 1], 1, 10, DAMAGE_NO_KNOCKBACK, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });
  assertApprox(dflagNoKnockback.velocity[0], 0, 0.0001, "T_Damage honors DAMAGE_NO_KNOCKBACK");

  const bounce = createPlayer(32);
  bounce.movetype = MOVETYPE_BOUNCE;
  T_Damage(bounce, attacker, attacker, [1, 0, 0], [4, 5, 6], [0, 0, 1], 1, 10, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });
  assertApprox(bounce.velocity[0], 0, 0.0001, "T_Damage skips momentum for MOVETYPE_BOUNCE");
}

function verifyTDamageTakeHealthAndKilled(): void {
  const runtime = createHarnessRuntime();
  const attacker = createPlayer(33);

  const monster = createMonster(34);
  monster.health = 18;
  let monsterPainCalls = 0;
  monster.pain = () => {
    monsterPainCalls += 1;
  };

  const emittedMonsterTypes: temp_event_t[] = [];
  let killedDamage = 0;
  let killedPoint: [number, number, number] | null = null;
  T_Damage(monster, attacker, attacker, [1, 0, 0], [7, 8, 9], [0, 0, 1], 10, 5, 0, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false,
    emitTempEntity: (type) => {
      emittedMonsterTypes.push(type);
    },
    Killed: (_targ, _inflictor, _attacker, damage, point) => {
      killedDamage = damage;
      killedPoint = [...point];
    },
    M_ReactToDamage: () => {
      throw new Error("T_Damage must return immediately after Killed");
    }
  });

  assertNumber(emittedMonsterTypes[0], temp_event_t.TE_BLOOD, "T_Damage emits blood for monster take damage");
  assertNumber(monster.health, -2, "T_Damage subtracts take from health before Killed");
  assertNumber(monster.flags & FL_NO_KNOCKBACK, FL_NO_KNOCKBACK, "T_Damage sets FL_NO_KNOCKBACK on monster/client death");
  assertNumber(killedDamage, 20, "T_Damage forwards the final take value to Killed");
  assertVec3(killedPoint, [7, 8, 9], "T_Damage forwards the damage point to Killed");
  assertNumber(monsterPainCalls, 0, "T_Damage does not call pain after a lethal hit");

  const crate = createRuntimeEntity({ classname: "func_breakable" }, 35);
  crate.inuse = true;
  crate.movetype = MOVETYPE_WALK;
  crate.takedamage = 1;
  crate.health = 12;
  crate.mass = 200;

  const emittedCrateTypes: temp_event_t[] = [];
  let crateKilledDamage = 0;
  T_Damage(crate, attacker, attacker, [1, 0, 0], [1, 2, 3], [0, 0, 1], 13, 0, DAMAGE_BULLET, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false,
    emitTempEntity: (type) => {
      emittedCrateTypes.push(type);
    },
    Killed: (_targ, _inflictor, _attacker, damage) => {
      crateKilledDamage = damage;
    }
  });

  assertNumber(emittedCrateTypes[0], temp_event_t.TE_BULLET_SPARKS, "T_Damage emits sparks for non-monster non-client take damage");
  assertNumber(crate.health, -1, "T_Damage subtracts lethal take from non-client health");
  assertNumber(crate.flags & FL_NO_KNOCKBACK, 0, "T_Damage leaves FL_NO_KNOCKBACK unchanged for non-monster non-client death");
  assertNumber(crateKilledDamage, 13, "T_Damage kills non-client entities with the take value");
}

function verifyRadiusDamageFalloffFilteringAndForwarding(): void {
  const runtime = createHarnessRuntime();
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => ({
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: {
        normal: [0, 0, 1],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: 0,
      ent: null
    }),
    pointcontents: () => 0
  };

  const inflictor = createRuntimeEntity({ classname: "rocket" }, 50);
  inflictor.inuse = true;
  inflictor.solid = SOLID_BBOX;
  inflictor.s.origin = [0, 0, 0];
  runtime.entities[50] = inflictor;

  const attacker = createPlayer(51);
  attacker.solid = SOLID_BBOX;
  attacker.s.origin = [20, 0, 0];
  attacker.mins = [0, 0, 0];
  attacker.maxs = [0, 0, 0];
  runtime.entities[51] = attacker;

  const target = createPlayer(52);
  target.solid = SOLID_BBOX;
  target.s.origin = [30, 0, 0];
  target.mins = [0, 0, 0];
  target.maxs = [0, 0, 0];
  runtime.entities[52] = target;

  const ignored = createPlayer(53);
  ignored.solid = SOLID_BBOX;
  ignored.s.origin = [10, 0, 0];
  ignored.mins = [0, 0, 0];
  ignored.maxs = [0, 0, 0];
  runtime.entities[53] = ignored;

  const noDamage = createPlayer(54);
  noDamage.solid = SOLID_BBOX;
  noDamage.s.origin = [12, 0, 0];
  noDamage.mins = [0, 0, 0];
  noDamage.maxs = [0, 0, 0];
  noDamage.takedamage = 0;
  runtime.entities[54] = noDamage;

  const outside = createPlayer(55);
  outside.solid = SOLID_BBOX;
  outside.s.origin = [300, 0, 0];
  outside.mins = [0, 0, 0];
  outside.maxs = [0, 0, 0];
  runtime.entities[55] = outside;

  const calls: Array<{ ent: GameEntity; dir: [number, number, number]; damage: number; knockback: number; dflags: number; mod: number }> = [];
  T_RadiusDamage(inflictor, attacker, 100, ignored, 128, MOD_BLASTER, runtime, {
    T_Damage: (ent, _inflictor, _attacker, dir, point, normal, damage, knockback, dflags, mod) => {
      calls.push({ ent, dir: [...dir], damage, knockback, dflags, mod });
      assertVec3(point, [0, 0, 0], "T_RadiusDamage forwards the inflictor origin as point");
      assertVec3(normal, [0, 0, 0], "T_RadiusDamage forwards vec3_origin as normal");
    }
  });

  assertNumber(calls.length, 2, "T_RadiusDamage filters ignored, non-damageable and out-of-radius entities");
  assertEntity(calls[0].ent, attacker, "T_RadiusDamage preserves findradius iteration for the attacker entity");
  assertNumber(calls[0].damage, 45, "T_RadiusDamage halves radius points when the target is the attacker");
  assertNumber(calls[0].knockback, 45, "T_RadiusDamage mirrors radius points into knockback");
  assertVec3(calls[0].dir, [20, 0, 0], "T_RadiusDamage forwards ent origin minus inflictor origin as dir");
  assertEntity(calls[1].ent, target, "T_RadiusDamage continues with the next eligible entity");
  assertNumber(calls[1].damage, 85, "T_RadiusDamage applies the original distance falloff before truncation");
  assertNumber(calls[1].dflags, DAMAGE_RADIUS, "T_RadiusDamage sets DAMAGE_RADIUS");
  assertNumber(calls[1].mod, MOD_BLASTER, "T_RadiusDamage forwards the damage mod");
}

function verifyRadiusDamageUsesDefaultDamageCore(): void {
  const runtime = createHarnessRuntime();
  const inflictor = createRuntimeEntity({ classname: "explosion" }, 22);
  inflictor.inuse = true;
  inflictor.s.origin = [0, 0, 0];
  inflictor.origin = [0, 0, 0];
  inflictor.solid = SOLID_BBOX;
  runtime.entities[22] = inflictor;

  const target = createPlayer(23);
  target.s.origin = [0, 0, 0];
  target.origin = [0, 0, 0];
  target.solid = SOLID_BBOX;
  runtime.entities[23] = target;

  T_RadiusDamage(inflictor, inflictor, 40, null, 64, MOD_BLASTER, runtime, {
    CheckPowerArmor: () => 0,
    CheckArmor: () => 0,
    CheckTeamDamage: () => false
  });

  assertNumber(target.health, 60, "T_RadiusDamage must dispatch into T_Damage when no T_Damage hook is supplied");
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

function createMonster(index: number, classname = "monster_soldier"): GameEntity {
  const monster = createRuntimeEntity({ classname }, index);
  monster.inuse = true;
  monster.classname = classname;
  monster.movetype = MOVETYPE_STEP;
  monster.svflags |= SVF_MONSTER;
  monster.health = 100;
  monster.takedamage = 1;
  monster.mass = 200;
  monster.viewheight = 24;
  return monster;
}

function createPlayer(index: number): GameEntity {
  const player = createRuntimeEntity({ classname: "player" }, index);
  player.inuse = true;
  player.classname = "player";
  player.movetype = MOVETYPE_WALK;
  player.health = 100;
  player.takedamage = 1;
  player.mass = 200;
  player.viewheight = 22;
  attachGameClient(player);
  return player;
}

function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertString(actual: string, expected: string, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertApprox(actual: number, expected: number, epsilon: number, label: string): void {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertEntity(actual: GameEntity | null, expected: GameEntity | null, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: entite inattendue`);
  }
}

function assertVec3(actual: [number, number, number] | null, expected: [number, number, number], label: string): void {
  if (!actual || actual[0] !== expected[0] || actual[1] !== expected[1] || actual[2] !== expected[2]) {
    throw new Error(`${label}: attendu [${expected.join(", ")}], recu ${actual ? `[${actual.join(", ")}]` : "null"}`);
  }
}

void AI_GOOD_GUY;
