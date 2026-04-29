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
import { MOVETYPE_STEP, MOVETYPE_WALK, POWER_ARMOR_SHIELD, SOLID_BBOX, SVF_MONSTER } from "../../packages/game/src/runtime.js";
import {
  DAMAGE_NO_PROTECTION,
  DF_NO_FRIENDLY_FIRE,
  DF_SKINTEAMS,
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
  verifyFriendlyFireUsesSkinTeams();
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

function assertEntity(actual: GameEntity | null, expected: GameEntity | null, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: entite inattendue`);
  }
}

void AI_GOOD_GUY;
