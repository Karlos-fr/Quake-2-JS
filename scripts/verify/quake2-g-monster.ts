/**
 * File: quake2-g-monster.ts
 * Purpose: Verify the shared monster helpers ported from `game/g_monster.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for `g_monster.ts`.
 *
 * Dependencies:
 * - packages/game
 */

import { strict as assert } from "node:assert";

import {
  AI_HOLD_FRAME,
  AI_GOOD_GUY,
  AI_STAND_GROUND,
  FL_FLY,
  MOD_BLASTER,
  FL_SWIM,
  FRAMETIME,
  SOLID_BBOX,
  SOLID_NOT,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  SVF_NOCLIENT,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainGameSoundEvents,
  drainMonsterMuzzleFlashEvents,
  useGameEntity
} from "../../packages/game/src/index.js";
import {
  EF_COLOR_SHELL,
  EF_FLIES,
  EF_POWERSCREEN,
  MASK_MONSTERSOLID,
  MASK_SHOT,
  RF_FRAMELERP,
  RF_SHELL_BLUE,
  RF_SHELL_GREEN,
  RF_SHELL_RED
} from "../../packages/qcommon/src/index.js";
import { CONTENTS_LAVA, CONTENTS_SLIME, CONTENTS_WATER } from "../../packages/qcommon/src/q_shared.js";
import {
  DAMAGE_NO_ARMOR,
  AI_RESURRECTING,
  DEAD_NO,
  FL_IMMUNE_LAVA,
  FL_IMMUNE_SLIME,
  FL_INWATER,
  FL_NOTARGET,
  MOD_LAVA,
  MOD_SLIME,
  MOD_UNKNOWN,
  MOD_WATER,
  POWER_ARMOR_SCREEN,
  POWER_ARMOR_SHIELD,
  damage_t
} from "../../packages/game/src/g_local.js";
import {
  AttackFinished,
  M_CatagorizePosition,
  M_CheckGround,
  M_droptofloor,
  M_FliesOff,
  M_FliesOn,
  M_FlyCheck,
  M_MoveFrame,
  M_SetEffects,
  M_WorldEffects,
  flymonster_start,
  flymonster_start_go,
  monster_death_use,
  monster_fire_bfg,
  monster_fire_blaster,
  monster_fire_bullet,
  monster_fire_grenade,
  monster_fire_railgun,
  monster_fire_rocket,
  monster_fire_shotgun,
  monster_start,
  monster_start_go,
  monster_think,
  monster_triggered_spawn,
  monster_triggered_spawn_use,
  monster_triggered_start,
  monster_use,
  swimmonster_start_go,
  type GameMonsterHooks,
  walkmonster_start,
  walkmonster_start_go
} from "../../packages/game/src/g_monster.js";
import { T_Damage } from "../../packages/game/src/g_combat.js";
import { MOVETYPE_NONE, MOVETYPE_STEP, type GameMonsterMove } from "../../packages/game/src/runtime.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";
import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyMonsterWeaponWrappers();
  verifyMonsterStartBookkeepingAndDefaults();
  verifyMonsterStartSkipsGoodGuys();
  verifyMonsterStartDeathmatchAndFallbacks();
  verifyMonsterUseHonorsOriginalFilters();
  verifyMonsterDeathUseDropsItemsAndFiresTargets();
  verifyMonsterDeathUseRuntimeDamagePath();
  verifyMonsterStartGoFixesPointCombatTargets();
  verifyMonsterStartGoTargetBranches();
  verifyWalkmonsterStartGoGroundStartup();
  verifyWalkmonsterStartFlymonsterStartAndSwimmonsterStartGo();
  verifyTriggeredSpawnStartupPath();
  verifyCorpseFlyScheduling();
  verifyAttackFinishedCooldown();
  verifyMCheckGroundTraceBranches();
  verifyMCheckGroundRuntimeReachability();
  verifyMCatagorizePositionWaterLevels();
  verifyMCatagorizePositionRuntimeReachability();
  verifyMWorldEffectsDamageAndSounds();
  verifyMDroptofloorTraceAndStateRefresh();
  verifyMSetEffectsShellsAndPowerArmor();
  verifyMMoveFrameSequenceAndCallbacks();
  verifyMonsterThinkSequenceAndOutputs();

  console.log("Verification g_monster - shared monster gameplay OK");
}

function verifyMonsterWeaponWrappers(): void {
  const runtime = createHarnessRuntime();
  runtime.framenum = 77;
  const monster = createMonster(runtime, 20);
  const target = createMonster(runtime, 21);
  target.takedamage = 1;

  runtime.collision = createStraightHitCollision(target);

  const hits: Array<{ damage: number; knockback: number; mod: number }> = [];
  const hooks: GameMonsterHooks = {
    T_Damage: (_targ, _inflictor, _attacker, _dir, _point, _normal, damage, knockback, _dflags, mod) => {
      hits.push({ damage, knockback, mod });
    },
    check_dodge: () => {
      return;
    }
  };

  monster_fire_bullet(monster, [1, 2, 3], [1, 0, 0], 9, 4, 100, 50, 43, runtime, hooks);
  monster_fire_shotgun(monster, [1, 2, 3], [1, 0, 0], 3, 2, 100, 50, 2, 41, runtime, hooks);
  assert.deepEqual(
    hits.map((hit) => ({ damage: hit.damage, knockback: hit.knockback, mod: hit.mod })),
    [
      { damage: 9, knockback: 4, mod: MOD_UNKNOWN },
      { damage: 3, knockback: 2, mod: MOD_UNKNOWN },
      { damage: 3, knockback: 2, mod: MOD_UNKNOWN }
    ],
    "monster bullet/shotgun wrappers should preserve damage, kick, pellet count and MOD_UNKNOWN"
  );

  monster_fire_blaster(monster, [2, 3, 4], [0, 1, 0], 10, 700, 39, 0x20, runtime, hooks);
  monster_fire_grenade(monster, [3, 4, 5], [1, 0, 0], 50, 600, 53, runtime, hooks);
  monster_fire_rocket(monster, [4, 5, 6], [1, 0, 0], 50, 550, 23, runtime, hooks);
  monster_fire_railgun(monster, [5, 6, 7], [1, 0, 0], 60, 120, 61, runtime, hooks);
  monster_fire_bfg(monster, [6, 7, 8], [1, 0, 0], 70, 300, 100, 240, 101, runtime, hooks);

  const entities = runtime.entities.filter((ent): ent is GameEntity => Boolean(ent));
  const blaster = entities.find((ent) => ent.classname === "bolt");
  const grenade = entities.find((ent) => ent.classname === "grenade");
  const rocket = entities.find((ent) => ent.classname === "rocket");
  const bfg = entities.find((ent) => ent.classname === "bfg blast");

  assert.equal(blaster?.dmg, 10, "monster_fire_blaster should pass damage through to fire_blaster");
  assert.deepEqual(blaster?.velocity, [0, 700, 0], "monster_fire_blaster should pass speed and direction through");
  assert.equal(grenade?.dmg, 50, "monster_fire_grenade should pass direct damage through");
  assert.equal(grenade?.dmg_radius, 90, "monster_fire_grenade should pass damage + 40 as radius damage");
  assert.equal(rocket?.dmg, 50, "monster_fire_rocket should pass direct damage through");
  assert.equal(rocket?.radius_dmg, 50, "monster_fire_rocket should pass damage as radius damage");
  assert.equal(rocket?.dmg_radius, 70, "monster_fire_rocket should pass damage + 20 as damage radius");
  assert.equal(bfg?.count, 70, "monster_fire_bfg should pass damage through to fire_bfg");
  assert.equal(bfg?.dmg_radius, 240, "monster_fire_bfg should pass damage_radius and ignore kick like the C helper");

  const flashes = drainMonsterMuzzleFlashEvents(runtime);
  assert.deepEqual(
    flashes.map((flash) => [flash.entityIndex, flash.flashNumber, flash.frame]),
    [
      [monster.index, 43, 77],
      [monster.index, 41, 77],
      [monster.index, 39, 77],
      [monster.index, 53, 77],
      [monster.index, 23, 77],
      [monster.index, 61, 77],
      [monster.index, 101, 77]
    ],
    "each monster weapon wrapper should queue the original svc_muzzleflash2 flash id"
  );
}

function verifyMonsterStartBookkeepingAndDefaults(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 1);
  const customCheckAttack = () => true;
  monster.spawnflags = 4;
  monster.s.origin = [10, 20, 30];
  monster.s.old_origin = [-1, -1, -1];
  monster.s.renderfx = RF_SHELL_BLUE;
  monster.s.skinnum = 7;
  monster.svflags |= SVF_DEADMONSTER;
  monster.deadflag = 2;
  monster.health = 125;
  monster.properties.item = "item_quad";
  monster.monsterinfo.checkattack = customCheckAttack;
  monster.monsterinfo.currentmove = {
    firstframe: 20,
    lastframe: 24,
    frames: [],
    endfunc: undefined
  };
  monster.monsterinfo.scale = 0;

  const originalRandom = Math.random;
  Math.random = () => 0.62;
  const started = monster_start(monster, runtime);
  Math.random = originalRandom;

  assert.equal(started, true, "monster_start should keep monsters outside deathmatch");
  assert.equal(runtime.total_monsters, 1, "monster_start should increment total_monsters for hostile monsters");
  assert.equal(monster.spawnflags, 1, "monster_start should convert ambush-only spawnflag 4 to trigger spawnflag 1 for hostile monsters");
  assert.equal(monster.svflags & SVF_MONSTER, SVF_MONSTER, "monster_start should mark the entity as a monster");
  assert.equal(monster.svflags & SVF_DEADMONSTER, 0, "monster_start should clear SVF_DEADMONSTER");
  assert.equal(monster.s.renderfx & RF_FRAMELERP, RF_FRAMELERP, "monster_start should add RF_FRAMELERP");
  assert.equal(monster.takedamage, damage_t.DAMAGE_AIM, "monster_start should make the monster aim-damageable");
  assert.equal(monster.clipmask, MASK_MONSTERSOLID, "monster_start should use the monster collision mask");
  assert.equal(monster.monsterinfo.checkattack, customCheckAttack, "monster_start should preserve an existing checkattack callback");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "monster_start should arm the first think frame");
  assert.equal(monster.air_finished, runtime.time + 12, "monster_start should initialize the air timer");
  assert.equal(typeof monster.use, "function", "monster_start should install monster_use as the use callback");
  assert.equal(monster.max_health, 125, "monster_start should copy health to max_health");
  assert.equal(monster.s.skinnum, 0, "monster_start should reset the skin number");
  assert.equal(monster.deadflag, DEAD_NO, "monster_start should reset deadflag");
  assert.deepEqual(monster.s.old_origin, [10, 20, 30], "monster_start should copy origin to old_origin");
  assert.equal(monster.item?.classname, "item_quad", "monster_start should resolve st.item through FindItemByClassname");
  assert.equal(monster.s.frame, 23, "monster_start should randomize the first frame within the current move span");
  assert.equal(monster.monsterinfo.scale, 1, "monster_start should default monsterinfo.scale for the TS move-frame runtime");
}

function verifyMonsterStartSkipsGoodGuys(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 2);
  monster.monsterinfo.aiflags |= AI_GOOD_GUY;
  monster.spawnflags = 4;

  monster_start(monster, runtime);

  assert.equal(runtime.total_monsters, 0, "monster_start should not count good-guy monsters");
  assert.equal(monster.spawnflags, 4, "monster_start should not rewrite spawnflag 4 for good-guy monsters");
}

function verifyMonsterStartDeathmatchAndFallbacks(): void {
  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  const deathmatchMonster = createMonster(deathmatchRuntime, 40);

  const started = monster_start(deathmatchMonster, deathmatchRuntime);

  assert.equal(started, false, "monster_start should reject monsters in deathmatch");
  assert.equal(deathmatchMonster.inuse, false, "monster_start should free deathmatch monsters");
  assert.equal(deathmatchRuntime.total_monsters, 0, "monster_start should not count freed deathmatch monsters");

  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 3);
  monster.properties.item = "bad_monster_drop";

  monster_start(monster, runtime);

  assert.equal(typeof monster.monsterinfo.checkattack, "function", "monster_start should install M_CheckAttack when none exists");
  assert.equal(monster.item, null, "monster_start should leave item empty when FindItemByClassname fails");
  assert.equal(
    runtime.logEntries.some((entry) => entry.kind === "warning" && entry.message.includes("bad item: bad_monster_drop")),
    true,
    "monster_start should log the original bad item warning"
  );
}

function verifyMonsterUseHonorsOriginalFilters(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 3);
  const activator = createPlayer(runtime, 4);
  const previousEnemy = createPlayer(runtime, 40);

  let foundTargetCalls = 0;
  monster_use(monster, null, activator, runtime, {
    FoundTarget: () => {
      foundTargetCalls += 1;
    }
  });

  assert.equal(monster.enemy, activator, "monster_use should acquire the activator as enemy");
  assert.equal(foundTargetCalls, 1, "monster_use should call FoundTarget after acquiring an enemy");

  const alreadyAngryMonster = createMonster(runtime, 41);
  alreadyAngryMonster.enemy = previousEnemy;
  monster_use(alreadyAngryMonster, null, activator, runtime, {
    FoundTarget: () => {
      foundTargetCalls += 1;
    }
  });
  assert.equal(alreadyAngryMonster.enemy, previousEnemy, "monster_use should ignore monsters that already have an enemy");
  assert.equal(foundTargetCalls, 1, "monster_use should not call FoundTarget for an existing enemy");

  const deadMonster = createMonster(runtime, 42);
  deadMonster.health = 0;
  monster_use(deadMonster, null, activator, runtime, {
    FoundTarget: () => {
      foundTargetCalls += 1;
    }
  });
  assert.equal(deadMonster.enemy, null, "monster_use should ignore dead monsters");
  assert.equal(foundTargetCalls, 1, "monster_use should not call FoundTarget for dead monsters");

  const notargetMonster = createMonster(runtime, 5);
  activator.flags |= FL_NOTARGET;
  monster_use(notargetMonster, null, activator, runtime);
  assert.equal(notargetMonster.enemy, null, "monster_use should reject notarget activators");
  activator.flags &= ~FL_NOTARGET;

  const standGroundMonster = createMonster(runtime, 6);
  const nonClientActivator = createMonster(runtime, 7);
  monster_use(standGroundMonster, null, nonClientActivator, runtime);
  assert.equal(standGroundMonster.enemy, null, "monster_use should reject hostile non-clients");

  nonClientActivator.monsterinfo.aiflags |= AI_GOOD_GUY;
  monster_use(standGroundMonster, null, nonClientActivator, runtime, {
    FoundTarget: () => {
      foundTargetCalls += 1;
    }
  });
  assert.equal(standGroundMonster.enemy, nonClientActivator, "monster_use should accept good-guy monster activators");

  const runtimeCallbackMonster = createMonster(runtime, 43);
  runtimeCallbackMonster.use = (useSelf, other, useActivator, localRuntime) => {
    monster_use(useSelf, other, useActivator, localRuntime, {
      FoundTarget: () => {
        foundTargetCalls += 1;
      }
    });
  };
  useGameEntity(runtime, runtimeCallbackMonster, null, activator);
  assert.equal(runtimeCallbackMonster.enemy, activator, "monster_use should be reachable through the runtime use callback");
  assert.equal(foundTargetCalls, 3, "monster_use should call FoundTarget through the runtime use callback");
}

function verifyMonsterDeathUseDropsItemsAndFiresTargets(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 8);
  const enemy = createPlayer(runtime, 9);
  const relay = createRuntimeEntity({ classname: "target_relay", targetname: "death-chain" }, 10);
  relay.inuse = true;

  let activatorSeen: GameEntity | null = null;
  relay.use = (_self, _other, activator) => {
    activatorSeen = activator;
  };

  runtime.entities[relay.index] = relay;

  monster.enemy = enemy;
  monster.flags |= FL_FLY | FL_SWIM;
  monster.monsterinfo.aiflags = AI_GOOD_GUY | AI_HOLD_FRAME | AI_STAND_GROUND;
  monster.target = "unused";
  monster.deathtarget = "death-chain";
  monster.item = {
    index: 1,
    classname: "item_armor_body",
    pickupName: "Body Armor",
    worldModel: "models/items/armor/body/tris.md2",
    worldModelFlags: 0,
    viewModel: null,
    icon: null,
    pickup: undefined,
    use: undefined,
    drop: undefined,
    weaponThink: null,
    pickupSound: null,
    countWidth: 0,
    quantity: 0,
    ammo: null,
    flags: 0,
    weapmodel: 0,
    tag: 0,
    precaches: ""
  };

  monster_death_use(monster, runtime);

  assert.equal((monster.flags & (FL_FLY | FL_SWIM)), 0, "monster_death_use should clear fly and swim flags");
  assert.equal(monster.monsterinfo.aiflags, AI_GOOD_GUY, "monster_death_use should keep only AI_GOOD_GUY");
  assert.equal(monster.target, "death-chain", "monster_death_use should replace target with deathtarget");
  assert.equal(monster.item, null, "monster_death_use should clear the dropped item");
  assert.equal(activatorSeen, enemy, "monster_death_use should forward the current enemy as activator");
  assert.equal(runtime.entities.length > 1, true, "monster_death_use should spawn a dropped item entity");

  const noTargetMonster = createMonster(runtime, 11);
  let unexpectedUse = false;
  noTargetMonster.enemy = enemy;
  relay.use = () => {
    unexpectedUse = true;
  };
  monster_death_use(noTargetMonster, runtime);
  assert.equal(unexpectedUse, false, "monster_death_use should return without firing targets when no target remains");
}

function verifyMonsterDeathUseRuntimeDamagePath(): void {
  const runtime = createHarnessRuntime();
  const attacker = createPlayer(runtime, 45);
  const monster = createDamageableMonster(runtime, 46);
  const relay = createRuntimeEntity({ classname: "target_relay", targetname: "death-runtime" }, 47);
  relay.inuse = true;
  runtime.entities[relay.index] = relay;

  let activatorSeen: GameEntity | null = null;
  let dieCalls = 0;
  relay.use = (_self, _other, activator) => {
    activatorSeen = activator;
  };

  monster.health = 5;
  monster.target = "death-runtime";
  monster.touch = () => {
    throw new Error("Killed should clear monster touch before the die callback");
  };
  monster.die = () => {
    dieCalls += 1;
  };

  T_Damage(monster, attacker, attacker, [1, 0, 0], [2, 3, 4], [0, 0, 1], 5, 0, 0, MOD_BLASTER, runtime);

  assert.equal(monster.enemy, attacker, "Killed should store the attacker as the monster enemy");
  assert.equal(monster.touch, undefined, "Killed should clear monster touch before monster_death_use");
  assert.equal(activatorSeen, attacker, "Killed should reach monster_death_use through the default runtime dispatch");
  assert.equal(dieCalls, 1, "Killed should still dispatch the monster die callback after monster_death_use");
}

function verifyMonsterStartGoFixesPointCombatTargets(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 11);
  const pointCombat = createRuntimeEntity({ classname: "point_combat", targetname: "combat-node" }, 12);
  pointCombat.inuse = true;
  runtime.entities[pointCombat.index] = pointCombat;

  let standCalls = 0;
  monster.target = "combat-node";
  monster.monsterinfo.stand = () => {
    standCalls += 1;
  };
  monster.monsterinfo.aiflags |= AI_STAND_GROUND;

  monster_start_go(monster, runtime);

  assert.equal(monster.combattarget, "combat-node", "monster_start_go should retag point_combat targets as combattarget");
  assert.equal(monster.target, undefined, "monster_start_go should clear target after point_combat fixup");
  assert.equal(standCalls, 1, "monster_start_go should enter stand mode when no walk target remains");
  assert.equal(monster.think, monster_think, "monster_start_go should arm the regular monster think callback");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "monster_start_go should schedule the next monster think");

  const mixedMonster = createMonster(runtime, 16);
  const mixedPointCombat = createRuntimeEntity({ classname: "point_combat", targetname: "mixed-node" }, 17);
  mixedPointCombat.inuse = true;
  runtime.entities[mixedPointCombat.index] = mixedPointCombat;
  const mixedPath = createRuntimeEntity({ classname: "path_corner", targetname: "mixed-node" }, 18);
  mixedPath.inuse = true;
  runtime.entities[mixedPath.index] = mixedPath;
  mixedMonster.target = "mixed-node";

  monster_start_go(mixedMonster, runtime);

  assert.equal(mixedMonster.combattarget, "mixed-node", "monster_start_go should still retag mixed point_combat targets");
  assert.ok(
    runtime.logEntries.some((entry) => entry.message.includes("has target with mixed types")),
    "monster_start_go should warn when a targetname mixes point_combat and non-combat targets"
  );
}

function verifyMonsterStartGoTargetBranches(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 7;

  const missingTargetMonster = createMonster(runtime, 30);
  let missingStandCalls = 0;
  missingTargetMonster.target = "missing";
  missingTargetMonster.monsterinfo.stand = () => {
    missingStandCalls += 1;
  };

  monster_start_go(missingTargetMonster, runtime);

  assert.equal(missingTargetMonster.target, undefined, "monster_start_go should clear an unresolved target");
  assert.equal(missingTargetMonster.monsterinfo.pausetime, 100000000, "monster_start_go should use the original long pause sentinel");
  assert.equal(missingStandCalls, 1, "monster_start_go should stand when the target cannot be found");

  const pathMonster = createMonster(runtime, 31);
  const pathCorner = createRuntimeEntity({ classname: "path_corner", targetname: "corner" }, 32);
  pathCorner.inuse = true;
  pathCorner.s.origin = [0, 64, 0];
  runtime.entities[pathCorner.index] = pathCorner;
  let walkCalls = 0;
  pathMonster.target = "corner";
  pathMonster.monsterinfo.walk = () => {
    walkCalls += 1;
  };

  monster_start_go(pathMonster, runtime);

  assert.equal(pathMonster.goalentity, pathCorner, "monster_start_go should choose the path_corner as goalentity");
  assert.equal(pathMonster.movetarget, pathCorner, "monster_start_go should choose the path_corner as movetarget");
  assert.equal(pathMonster.s.angles[1], 90, "monster_start_go should face the first path_corner");
  assert.equal(pathMonster.ideal_yaw, 90, "monster_start_go should copy the path_corner yaw to ideal_yaw");
  assert.equal(walkCalls, 1, "monster_start_go should enter walk mode for a path_corner target");
  assert.equal(pathMonster.target, undefined, "monster_start_go should clear a consumed path_corner target");

  const nonPathMonster = createMonster(runtime, 33);
  const nonPathTarget = createRuntimeEntity({ classname: "target_speaker", targetname: "speaker-node" }, 34);
  nonPathTarget.inuse = true;
  runtime.entities[nonPathTarget.index] = nonPathTarget;
  let nonPathStandCalls = 0;
  nonPathMonster.target = "speaker-node";
  nonPathMonster.monsterinfo.stand = () => {
    nonPathStandCalls += 1;
  };

  monster_start_go(nonPathMonster, runtime);

  assert.equal(nonPathMonster.goalentity, null, "monster_start_go should clear goalentity for non-path targets");
  assert.equal(nonPathMonster.movetarget, null, "monster_start_go should clear movetarget for non-path targets");
  assert.equal(nonPathMonster.monsterinfo.pausetime, 100000000, "monster_start_go should stand forever for non-path targets");
  assert.equal(nonPathStandCalls, 1, "monster_start_go should stand for non-path targets");

  const badCombatMonster = createMonster(runtime, 35);
  const badCombatTarget = createRuntimeEntity({ classname: "path_corner", targetname: "bad-combat" }, 36);
  badCombatTarget.inuse = true;
  badCombatTarget.s.origin = [10, 20, 30];
  runtime.entities[badCombatTarget.index] = badCombatTarget;
  badCombatMonster.combattarget = "bad-combat";

  monster_start_go(badCombatMonster, runtime);

  assert.ok(
    runtime.logEntries.some((entry) => entry.message.includes("has a bad combattarget bad-combat")),
    "monster_start_go should warn when combattarget resolves to a non-point_combat entity"
  );

  const deadMonster = createMonster(runtime, 37);
  deadMonster.health = 0;
  deadMonster.target = "corner";

  monster_start_go(deadMonster, runtime);

  assert.equal(deadMonster.think, undefined, "monster_start_go should return before arming dead monsters");
}

function verifyWalkmonsterStartGoGroundStartup(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 0;
  const ground = createRuntimeEntity({ classname: "worldspawn" }, 1);
  ground.inuse = true;
  ground.linkcount = 3;
  runtime.entities[ground.index] = ground;
  runtime.collision = createGroundingCollision(ground);

  const monster = createMonster(runtime, 38);
  monster.s.origin = [8, 16, 64];
  monster.origin = [8, 16, 64];
  monster.yaw_speed = 0;
  monster.viewheight = 0;

  let standCalls = 0;
  monster.monsterinfo.stand = () => {
    standCalls += 1;
  };

  walkmonster_start_go(monster, runtime);

  assert.equal(monster.groundentity, ground, "walkmonster_start_go should drop normal startup monsters to floor before checking movement");
  assert.equal(monster.yaw_speed, 20, "walkmonster_start_go should install the original default yaw speed");
  assert.equal(monster.viewheight, 25, "walkmonster_start_go should install the original walking monster viewheight");
  assert.equal(standCalls, 1, "walkmonster_start_go should continue through monster_start_go after floor setup");
  assert.equal(monster.think, monster_think, "walkmonster_start_go should leave regular monster thinking armed");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "walkmonster_start_go should schedule regular monster thinking");

  const delayed = createMonster(runtime, 39);
  delayed.spawnflags = 2;
  delayed.s.origin = [4, 4, 4];
  delayed.origin = [4, 4, 4];
  walkmonster_start_go(delayed, runtime);

  assert.deepEqual(delayed.s.origin, [4, 4, 4], "walkmonster_start_go should not drop trigger-spawn monsters during initial level time");
  assert.equal(delayed.solid, SOLID_NOT, "walkmonster_start_go should hide trigger-spawn monsters after shared startup");
  assert.equal(delayed.movetype, MOVETYPE_NONE, "walkmonster_start_go should park trigger-spawn monsters after shared startup");
  assert.equal((delayed.svflags & SVF_NOCLIENT) !== 0, true, "walkmonster_start_go should remove trigger-spawn monsters from snapshots");
}

function verifyWalkmonsterStartFlymonsterStartAndSwimmonsterStartGo(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 2;

  const walking = createMonster(runtime, 23);
  walking.health = 80;
  let walkStandCalls = 0;
  walking.monsterinfo.stand = () => {
    walkStandCalls += 1;
  };

  walkmonster_start(walking, runtime);

  assert.equal(typeof walking.think, "function", "walkmonster_start should arm a delayed walking startup think");
  assert.equal(walking.nextthink, runtime.time + FRAMETIME, "walkmonster_start should keep monster_start scheduling for the delayed startup");
  assert.equal(walking.takedamage, damage_t.DAMAGE_AIM, "walkmonster_start should run the shared monster_start initialization");
  assert.equal(walking.clipmask, MASK_MONSTERSOLID, "walkmonster_start should install the original monster collision mask");

  walking.think!(walking, runtime);

  assert.equal(walkStandCalls, 1, "walkmonster_start delayed think should enter shared monster startup");
  assert.equal(walking.yaw_speed, 20, "walkmonster_start delayed think should use walking yaw speed");
  assert.equal(walking.viewheight, 25, "walkmonster_start delayed think should use walking viewheight");
  assert.equal(walking.think, monster_think, "walkmonster_start delayed think should arm regular monster thinking");

  const flying = createMonster(runtime, 24);
  flying.flags |= FL_FLY;
  flying.yaw_speed = 0;
  flying.viewheight = 0;
  let flyStandCalls = 0;
  flying.monsterinfo.stand = () => {
    flyStandCalls += 1;
  };
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => createClearTrace(end),
    pointcontents: () => 0
  };

  flymonster_start_go(flying, runtime);

  assert.equal(flying.yaw_speed, 10, "flymonster_start_go should install the original flying yaw speed");
  assert.equal(flying.viewheight, 25, "flymonster_start_go should install the original flying viewheight");
  assert.equal(flyStandCalls, 1, "flymonster_start_go should continue through monster_start_go");
  assert.equal(flying.think, monster_think, "flymonster_start_go should arm regular monster thinking");
  assert.equal(flying.nextthink, runtime.time + FRAMETIME, "flymonster_start_go should schedule regular monster thinking");
  assert.equal(runtime.logEntries.some((entry) => entry.message.includes("in solid")), false, "flymonster_start_go should not warn for a clear movement probe");

  const delayedFlying = createMonster(runtime, 25);
  delayedFlying.flags = 0;
  delayedFlying.yaw_speed = 0;
  delayedFlying.viewheight = 0;
  let delayedFlyStandCalls = 0;
  delayedFlying.monsterinfo.stand = () => {
    delayedFlyStandCalls += 1;
  };

  flymonster_start(delayedFlying, runtime);

  assert.equal((delayedFlying.flags & FL_FLY) !== 0, true, "flymonster_start should mark the monster with FL_FLY before delayed startup");
  assert.equal(typeof delayedFlying.think, "function", "flymonster_start should arm a delayed flying startup think");
  assert.equal(delayedFlying.nextthink, runtime.time + FRAMETIME, "flymonster_start should keep monster_start scheduling for delayed startup");
  assert.equal(delayedFlying.takedamage, damage_t.DAMAGE_AIM, "flymonster_start should run the shared monster_start initialization");
  assert.equal(delayedFlying.clipmask, MASK_MONSTERSOLID, "flymonster_start should install the original monster collision mask");

  delayedFlying.think!(delayedFlying, runtime);

  assert.equal(delayedFlyStandCalls, 1, "flymonster_start delayed think should enter shared monster startup");
  assert.equal(delayedFlying.yaw_speed, 10, "flymonster_start delayed think should use flying yaw speed");
  assert.equal(delayedFlying.viewheight, 25, "flymonster_start delayed think should use flying viewheight");
  assert.equal(delayedFlying.think, monster_think, "flymonster_start delayed think should arm regular monster thinking");

  const swimming = createMonster(runtime, 26);
  swimming.flags |= FL_SWIM;
  swimming.yaw_speed = 0;
  swimming.viewheight = 0;
  let swimStandCalls = 0;
  swimming.monsterinfo.stand = () => {
    swimStandCalls += 1;
  };

  swimmonster_start_go(swimming, runtime);

  assert.equal(swimming.yaw_speed, 10, "swimmonster_start_go should install the original swimming yaw speed");
  assert.equal(swimming.viewheight, 10, "swimmonster_start_go should install the original swimming viewheight");
  assert.equal(swimStandCalls, 1, "swimmonster_start_go should continue through monster_start_go");
  assert.equal(swimming.think, monster_think, "swimmonster_start_go should arm regular monster thinking");
  assert.equal(swimming.nextthink, runtime.time + FRAMETIME, "swimmonster_start_go should schedule regular monster thinking");
}

function verifyTriggeredSpawnStartupPath(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 0;
  let killBoxTraceCalls = 0;
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => {
      killBoxTraceCalls += 1;
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0,
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
      };
    },
    pointcontents: () => 0
  };

  const monster = createMonster(runtime, 13);
  const activator = createPlayer(runtime, 14);
  const retainedThink = (): void => {
    return;
  };
  monster.think = retainedThink;
  monster.spawnflags = 2;
  monster.solid = SOLID_BBOX;
  monster.movetype = MOVETYPE_STEP;
  monster.svflags &= ~SVF_NOCLIENT;
  monster.s.origin = [8, 16, 24];
  monster.origin = [8, 16, 24];
  monster.groundentity = createRuntimeEntity({ classname: "ground" }, 15);
  let standCalls = 0;
  monster.monsterinfo.stand = () => {
    standCalls += 1;
    return;
  };

  monster_triggered_start(monster, runtime);

  assert.equal(monster.solid, SOLID_NOT, "monster_triggered_start should hide trigger-spawn monsters");
  assert.equal(monster.movetype, MOVETYPE_NONE, "monster_triggered_start should disable movement until triggered");
  assert.equal((monster.svflags & SVF_NOCLIENT) !== 0, true, "monster_triggered_start should hide the monster from clients");
  assert.equal(monster.nextthink, 0, "monster_triggered_start should cancel the pending startup think");
  assert.equal(monster.think, retainedThink, "monster_triggered_start should preserve the existing think callback like the C code");
  assert.equal(typeof monster.use, "function", "monster_triggered_start should arm trigger-spawn use");

  monster.use!(monster, null, activator, runtime);

  assert.equal(typeof monster.think, "function", "monster_triggered_spawn_use should schedule the delayed spawn think");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "monster_triggered_spawn_use should delay spawn by one frame");
  assert.equal(monster.enemy, activator, "monster_triggered_spawn_use should preserve the activating client as enemy");

  const nonClientActivator = createRuntimeEntity({ classname: "func_button" }, 16);
  const hiddenMonster = createMonster(runtime, 17);
  hiddenMonster.health = 100;
  hiddenMonster.enemy = null;
  let delayedFoundTargetCalls = 0;
  monster_triggered_spawn_use(hiddenMonster, null, nonClientActivator, runtime, {
    FoundTarget: () => {
      delayedFoundTargetCalls += 1;
    }
  });
  assert.equal(hiddenMonster.enemy, null, "monster_triggered_spawn_use should ignore non-client activators as the delayed enemy");
  assert.equal(hiddenMonster.nextthink, runtime.time + FRAMETIME, "monster_triggered_spawn_use should still schedule hidden monsters without a client enemy");
  assert.equal(typeof hiddenMonster.use, "function", "monster_triggered_spawn_use should replace use with the normal monster_use path");
  hiddenMonster.use!(hiddenMonster, null, activator, runtime);
  assert.equal(hiddenMonster.enemy, activator, "monster_triggered_spawn_use should install monster_use for later activations");
  assert.equal(delayedFoundTargetCalls, 1, "monster_triggered_spawn_use should preserve hooks through the installed monster_use callback");

  const walkMonster = createMonster(runtime, 20);
  const flyMonster = createMonster(runtime, 21);
  const swimMonster = createMonster(runtime, 22);
  for (const startupMonster of [walkMonster, flyMonster, swimMonster]) {
    startupMonster.spawnflags = 2;
    startupMonster.solid = SOLID_BBOX;
    startupMonster.movetype = MOVETYPE_STEP;
    startupMonster.svflags &= ~SVF_NOCLIENT;
  }

  walkmonster_start_go(walkMonster, runtime);
  flymonster_start_go(flyMonster, runtime);
  swimmonster_start_go(swimMonster, runtime);

  for (const startupMonster of [walkMonster, flyMonster, swimMonster]) {
    assert.equal(startupMonster.solid, SOLID_NOT, "walk/fly/swim startup should hide trigger-spawn monsters after shared startup");
    assert.equal(startupMonster.movetype, MOVETYPE_NONE, "walk/fly/swim startup should park trigger-spawn monsters");
    assert.equal((startupMonster.svflags & SVF_NOCLIENT) !== 0, true, "walk/fly/swim startup should keep trigger-spawn monsters out of snapshots");
    assert.equal(startupMonster.nextthink, 0, "walk/fly/swim startup should cancel regular monster thinking until triggered");
    assert.equal(typeof startupMonster.use, "function", "walk/fly/swim startup should arm trigger-spawn use");
  }

  let foundTargetCalls = 0;
  monster_triggered_spawn(monster, runtime, {
    FoundTarget: () => {
      foundTargetCalls += 1;
    }
  });

  assert.deepEqual(monster.s.origin, [8, 16, 25], "monster_triggered_spawn should raise the spawn origin by one unit before KillBox");
  assert.deepEqual(monster.origin, [8, 16, 25], "monster_triggered_spawn should keep the runtime origin mirror aligned");
  assert.equal(killBoxTraceCalls >= 1, true, "monster_triggered_spawn should run KillBox before materializing");
  assert.equal(monster.solid, SOLID_BBOX, "monster_triggered_spawn should restore SOLID_BBOX");
  assert.equal(monster.movetype, MOVETYPE_STEP, "monster_triggered_spawn should restore MOVETYPE_STEP");
  assert.equal((monster.svflags & SVF_NOCLIENT) === 0, true, "monster_triggered_spawn should make the monster client-visible");
  assert.equal(monster.air_finished, runtime.time + 12, "monster_triggered_spawn should reset the monster air timer");
  assert.equal(monster.linked, true, "monster_triggered_spawn should relink the monster");
  assert.equal(runtime.linkedSolidEntities.includes(monster), true, "monster_triggered_spawn should expose the monster as a solid runtime entity");
  assert.equal(standCalls >= 1, true, "monster_triggered_spawn should enter monster_start_go");
  assert.equal(monster.think, monster_think, "monster_triggered_spawn should arm the regular monster think callback");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "monster_triggered_spawn should schedule the regular monster think");
  assert.equal(foundTargetCalls, 1, "monster_triggered_spawn should call FoundTarget for a valid activating enemy");
  assert.equal(monster.enemy, activator, "monster_triggered_spawn should keep a valid activating enemy");

  const noAttackSpawn = createMonster(runtime, 18);
  const notargetActivator = createPlayer(runtime, 19);
  notargetActivator.flags |= FL_NOTARGET;
  noAttackSpawn.spawnflags = 2;
  noAttackSpawn.solid = SOLID_NOT;
  noAttackSpawn.movetype = 0;
  noAttackSpawn.svflags |= SVF_NOCLIENT;
  noAttackSpawn.enemy = notargetActivator;
  noAttackSpawn.monsterinfo.stand = () => {
    return;
  };

  monster_triggered_spawn(noAttackSpawn, runtime, {
    FoundTarget: () => {
      throw new Error("monster_triggered_spawn should not call FoundTarget for FL_NOTARGET enemies");
    }
  });

  assert.equal(noAttackSpawn.enemy, null, "monster_triggered_spawn should clear invalid or suppressed activating enemies");
}

function verifyCorpseFlyScheduling(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 12;
  const monster = createMonster(runtime, 16);

  const restoreRandom = replaceMathRandom([0.25, 0.75]);
  try {
    M_FlyCheck(monster, runtime);
  } finally {
    restoreRandom();
  }

  assert.equal(monster.think, M_FliesOn, "M_FlyCheck should schedule M_FliesOn when random allows it");
  assert.equal(monster.nextthink, 24.5, "M_FlyCheck should delay flies by 5 + 10 * random seconds");

  M_FliesOn(monster, runtime);
  assert.equal((monster.s.effects & EF_FLIES) !== 0, true, "M_FliesOn should set EF_FLIES");
  assert.equal(runtime.assets.soundPaths[monster.s.sound - 1], "infantry/inflies1.wav", "M_FliesOn should set the infantry flies loop sound");
  assert.equal(monster.think, M_FliesOff, "M_FliesOn should schedule M_FliesOff");
  assert.equal(monster.nextthink, runtime.time + 60, "M_FliesOn should shut flies off after 60 seconds");

  M_FliesOff(monster);
  assert.equal((monster.s.effects & EF_FLIES) !== 0, false, "M_FliesOff should clear EF_FLIES");
  assert.equal(monster.s.sound, 0, "M_FliesOff should clear the loop sound");

  const underwater = createMonster(runtime, 17);
  underwater.waterlevel = 1;
  M_FlyCheck(underwater, runtime);
  assert.equal(underwater.think, undefined, "M_FlyCheck should not schedule flies underwater");
  M_FliesOn(underwater, runtime);
  assert.equal((underwater.s.effects & EF_FLIES) !== 0, false, "M_FliesOn should not enable flies underwater");
}

function verifyAttackFinishedCooldown(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 42.5;
  const monster = createMonster(runtime, 18);

  AttackFinished(monster, 1.75, runtime);

  assert.equal(
    monster.monsterinfo.attack_finished,
    44.25,
    "AttackFinished should delay the monster attack window by runtime.time + time"
  );
}

function verifyMCheckGroundTraceBranches(): void {
  const runtime = createHarnessRuntime();
  const ground = createRuntimeEntity({ classname: "ground" }, 19);
  ground.linkcount = 7;
  runtime.entities[ground.index] = ground;

  const traced: Array<{ start: vec3_t; end: vec3_t; mask: number; passent: GameEntity | null }> = [];
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traced.push({ start: [...start], end: [...end], mask, passent });
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0.5,
        endpos: [start[0], start[1], start[2] - 0.25],
        plane: {
          normal: [0, 0, 1],
          dist: 0,
          type: 0,
          signbits: 0,
          pad: [0, 0]
        },
        surface: null,
        contents: 0,
        ent: ground
      };
    },
    pointcontents: () => 0
  };

  const monster = createMonster(runtime, 20);
  monster.s.origin = [8, 16, 24];
  monster.origin = [8, 16, 24];
  monster.velocity = [12, 0, -80];

  M_CheckGround(monster, runtime);

  assert.deepEqual(traced[0]?.start, [8, 16, 24], "M_CheckGround should trace from the current s.origin");
  assert.deepEqual(traced[0]?.end, [8, 16, 23.75], "M_CheckGround should trace the original quarter unit down");
  assert.equal(traced[0]?.mask, MASK_MONSTERSOLID, "M_CheckGround should use MASK_MONSTERSOLID");
  assert.equal(traced[0]?.passent, monster, "M_CheckGround should pass the monster as the skipped entity");
  assert.deepEqual(monster.s.origin, [8, 16, 23.75], "M_CheckGround should copy trace.endpos to s.origin");
  assert.equal(monster.groundentity, ground, "M_CheckGround should store trace.ent as groundentity");
  assert.equal(monster.groundentity_linkcount, 7, "M_CheckGround should copy the ground entity linkcount");
  assert.equal(monster.velocity[2], 0, "M_CheckGround should clear vertical velocity when grounded");

  const steep = createMonster(runtime, 21);
  steep.groundentity = ground;
  runtime.collision.trace = (start, _mins, _maxs, end, passent, mask) => {
    traced.push({ start: [...start], end: [...end], mask, passent });
    return {
      allsolid: false,
      startsolid: false,
      fraction: 0.5,
      endpos: [...end],
      plane: {
        normal: [0, 0, 0.5],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: 0,
      ent: ground
    };
  };

  M_CheckGround(steep, runtime);
  assert.equal(steep.groundentity, null, "M_CheckGround should clear groundentity on steep non-solid planes");

  const jumping = createMonster(runtime, 22);
  jumping.groundentity = ground;
  jumping.velocity[2] = 101;
  M_CheckGround(jumping, runtime);
  assert.equal(jumping.groundentity, null, "M_CheckGround should clear groundentity when upward velocity exceeds the C threshold");

  const swimmer = createMonster(runtime, 23);
  swimmer.flags |= FL_SWIM;
  M_CheckGround(swimmer, runtime);
  const flyer = createMonster(runtime, 24);
  flyer.flags |= FL_FLY;
  M_CheckGround(flyer, runtime);
  assert.equal(traced.length, 2, "M_CheckGround should not trace FL_SWIM or FL_FLY monsters");
}

function verifyMCheckGroundRuntimeReachability(): void {
  const runtime = createHarnessRuntime();
  const ground = createRuntimeEntity({ classname: "ground" }, 25);
  ground.linkcount = 3;
  runtime.entities[ground.index] = ground;
  runtime.collision = createGroundingCollision(ground);

  const monster = createMonster(runtime, 26);
  monster.s.origin = [32, 48, 64];
  monster.origin = [32, 48, 64];
  monster.groundentity = ground;
  monster.monsterinfo.linkcount = 0;
  monster.linkcount = 1;
  monster.monsterinfo.currentmove = {
    firstframe: 0,
    lastframe: 0,
    frame: [{ aifunc: undefined, dist: 0, thinkfunc: undefined }],
    endfunc: undefined
  };

  monster_think(monster, runtime);

  assert.deepEqual(monster.s.origin, [32, 48, 63.75], "monster_think should reach M_CheckGround after relink changes");
  assert.equal(monster.groundentity, ground, "monster_think should preserve the traced groundentity");
  assert.equal(monster.groundentity_linkcount, 3, "monster_think should refresh groundentity_linkcount through M_CheckGround");
}

function verifyMCatagorizePositionWaterLevels(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 27);
  monster.s.origin = [10, 20, 30];
  monster.mins = [-16, -16, -24];
  monster.waterlevel = 3;
  monster.watertype = CONTENTS_LAVA;

  const probes: Array<{ point: vec3_t; passent: GameEntity | null | undefined }> = [];
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => createClearTrace(end),
    pointcontents: (point, passent) => {
      probes.push({ point: [...point], passent });
      return 0;
    }
  };

  M_CatagorizePosition(monster, runtime);

  assert.deepEqual(probes.map((probe) => probe.point), [[10, 20, 7]], "M_CatagorizePosition should probe at origin + mins[2] + 1 first");
  assert.equal(probes[0]?.passent, monster, "M_CatagorizePosition should evaluate contents through the runtime adapter for the monster");
  assert.equal(monster.waterlevel, 0, "M_CatagorizePosition should clear waterlevel outside MASK_WATER");
  assert.equal(monster.watertype, 0, "M_CatagorizePosition should clear watertype outside MASK_WATER");

  const levelOne = createMonster(runtime, 28);
  levelOne.s.origin = [10, 20, 30];
  levelOne.mins = [-16, -16, -24];
  const levelOneContents = [CONTENTS_WATER, 0];
  runtime.collision.pointcontents = (point, passent) => {
    probes.push({ point: [...point], passent });
    return levelOneContents.shift() ?? 0;
  };

  probes.length = 0;
  M_CatagorizePosition(levelOne, runtime);

  assert.deepEqual(probes.map((probe) => probe.point), [[10, 20, 7], [10, 20, 33]], "M_CatagorizePosition should stop after the second probe when only feet are in water");
  assert.equal(levelOne.waterlevel, 1, "M_CatagorizePosition should set waterlevel 1 when only the first probe is water");
  assert.equal(levelOne.watertype, CONTENTS_WATER, "M_CatagorizePosition should preserve the first water contents as watertype");

  const levelThree = createMonster(runtime, 29);
  levelThree.s.origin = [10, 20, 30];
  levelThree.mins = [-16, -16, -24];
  const levelThreeContents = [CONTENTS_SLIME, CONTENTS_WATER, CONTENTS_LAVA];
  runtime.collision.pointcontents = (point, passent) => {
    probes.push({ point: [...point], passent });
    return levelThreeContents.shift() ?? 0;
  };

  probes.length = 0;
  M_CatagorizePosition(levelThree, runtime);

  assert.deepEqual(probes.map((probe) => probe.point), [[10, 20, 7], [10, 20, 33], [10, 20, 55]], "M_CatagorizePosition should use the original +26/+22 probe heights");
  assert.equal(levelThree.waterlevel, 3, "M_CatagorizePosition should set waterlevel 3 when all probes are water");
  assert.equal(levelThree.watertype, CONTENTS_SLIME, "M_CatagorizePosition should keep the first water contents even if higher probes differ");
}

function verifyMCatagorizePositionRuntimeReachability(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 30);
  monster.s.origin = [4, 8, 40];
  monster.origin = [4, 8, 40];
  monster.mins = [-16, -16, -24];
  monster.monsterinfo.linkcount = monster.linkcount;
  monster.monsterinfo.currentmove = {
    firstframe: 0,
    lastframe: 0,
    frame: [{ aifunc: undefined, dist: 0, thinkfunc: undefined }],
    endfunc: undefined
  };
  monster.air_finished = 0;
  runtime.time = 2;

  const probes: vec3_t[] = [];
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => createClearTrace(end),
    pointcontents: (point) => {
      probes.push([...point]);
      return probes.length <= 2 ? CONTENTS_WATER : 0;
    }
  };

  monster_think(monster, runtime);

  assert.deepEqual(probes, [[4, 8, 17], [4, 8, 43], [4, 8, 65]], "monster_think should reach M_CatagorizePosition before world water effects");
  assert.equal(monster.waterlevel, 2, "monster_think should refresh monster waterlevel through M_CatagorizePosition");
  assert.equal(monster.watertype, CONTENTS_WATER, "monster_think should refresh monster watertype through M_CatagorizePosition");
  assert.equal(monster.air_finished, runtime.time + 12, "M_WorldEffects should consume the categorized waterlevel for non-swimmers");
  assert.equal((monster.flags & FL_INWATER) !== 0, true, "M_WorldEffects should mark the monster as in water after categorize");
  const sounds = drainGameSoundEvents(runtime);
  assert.equal(sounds.some((sound) => sound.soundPath === "player/watr_in.wav"), true, "water entry sound should be emitted for apps/web audio consumption");
}

function verifyMWorldEffectsDamageAndSounds(): void {
  const runtime = createHarnessRuntime();

  runtime.time = 10;
  const enteringWater = createMonster(runtime, 31);
  enteringWater.waterlevel = 2;
  enteringWater.watertype = CONTENTS_WATER;
  M_WorldEffects(enteringWater, runtime);
  assert.equal(enteringWater.air_finished, 22, "M_WorldEffects should reset non-swimmer air timer below full submersion");
  assert.equal((enteringWater.flags & FL_INWATER) !== 0, true, "M_WorldEffects should mark water entry");
  assert.equal(
    drainGameSoundEvents(runtime).some((sound) => sound.soundPath === "player/watr_in.wav"),
    true,
    "M_WorldEffects should emit water entry sound events for apps/web audio consumption"
  );

  enteringWater.waterlevel = 0;
  M_WorldEffects(enteringWater, runtime);
  assert.equal((enteringWater.flags & FL_INWATER) === 0, true, "M_WorldEffects should clear FL_INWATER after water exit");
  assert.equal(
    drainGameSoundEvents(runtime).some((sound) => sound.soundPath === "player/watr_out.wav"),
    true,
    "M_WorldEffects should emit water exit sound events for apps/web audio consumption"
  );

  runtime.time = 20;
  const drowning = createDamageableMonster(runtime, 32);
  drowning.waterlevel = 3;
  drowning.watertype = CONTENTS_WATER;
  drowning.air_finished = 12;
  M_WorldEffects(drowning, runtime);
  assert.equal(drowning.health, 85, "M_WorldEffects should cap drowning damage at 15");
  assert.equal(drowning.pain_debounce_time, 21, "M_WorldEffects should debounce drowning pain for one second");
  assert.equal(runtime.meansOfDeath, MOD_WATER, "M_WorldEffects drowning should use MOD_WATER");

  runtime.time = 20;
  const suffocating = createDamageableMonster(runtime, 33);
  suffocating.flags |= FL_SWIM;
  suffocating.waterlevel = 0;
  suffocating.air_finished = 16;
  M_WorldEffects(suffocating, runtime);
  assert.equal(suffocating.health, 90, "M_WorldEffects should apply original swimmer suffocation damage formula");
  assert.equal(runtime.meansOfDeath, MOD_WATER, "M_WorldEffects suffocation should use MOD_WATER");

  runtime.time = 30;
  const lava = createDamageableMonster(runtime, 34);
  lava.waterlevel = 2;
  lava.watertype = CONTENTS_LAVA;
  M_WorldEffects(lava, runtime);
  assert.equal(lava.health, 80, "M_WorldEffects should apply 10 damage per lava waterlevel");
  assert.equal(lava.damage_debounce_time, 0, "M_WorldEffects should reset damage debounce after first water entry like the C source");
  assert.equal(runtime.meansOfDeath, MOD_LAVA, "M_WorldEffects lava damage should use MOD_LAVA");
  const lavaSounds = drainGameSoundEvents(runtime).map((sound) => sound.soundPath);
  assert.equal(
    lavaSounds.some((soundPath) => soundPath === "player/lava1.wav" || soundPath === "player/lava2.wav"),
    true,
    "M_WorldEffects should emit one original lava entry sound"
  );

  runtime.time = 40;
  const slime = createDamageableMonster(runtime, 35);
  slime.waterlevel = 3;
  slime.watertype = CONTENTS_SLIME;
  slime.air_finished = runtime.time + 12;
  M_WorldEffects(slime, runtime);
  assert.equal(slime.health, 88, "M_WorldEffects should apply 4 damage per slime waterlevel");
  assert.equal(runtime.meansOfDeath, MOD_SLIME, "M_WorldEffects slime damage should use MOD_SLIME");
  assert.equal(
    drainGameSoundEvents(runtime).some((sound) => sound.soundPath === "player/watr_in.wav"),
    true,
    "M_WorldEffects should emit the original slime entry water sound"
  );

  const immune = createDamageableMonster(runtime, 36);
  immune.flags |= FL_IMMUNE_LAVA | FL_IMMUNE_SLIME;
  immune.waterlevel = 3;
  immune.watertype = CONTENTS_LAVA | CONTENTS_SLIME;
  immune.air_finished = runtime.time + 12;
  M_WorldEffects(immune, runtime);
  assert.equal(immune.health, 100, "M_WorldEffects should honor lava and slime immunity flags");
  assert.equal(DAMAGE_NO_ARMOR, 0x00000002, "M_WorldEffects DAMAGE_NO_ARMOR constant should match the C flag value");
}

function verifyMDroptofloorTraceAndStateRefresh(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 12;
  const ground = createRuntimeEntity({ classname: "floor" }, 37);
  ground.linkcount = 9;
  runtime.entities[ground.index] = ground;

  const traces: Array<{ start: vec3_t; end: vec3_t; mask: number; passent: GameEntity | null }> = [];
  const contentsProbes: vec3_t[] = [];
  runtime.collision = {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      traces.push({ start: [...start], end: [...end], mask, passent });
      if (traces.length === 1) {
        return {
          allsolid: false,
          startsolid: false,
          fraction: 0.5,
          endpos: [start[0], start[1], 40],
          plane: {
            normal: [0, 0, 1],
            dist: 0,
            type: 0,
            signbits: 0,
            pad: [0, 0]
          },
          surface: null,
          contents: 0,
          ent: ground
        };
      }
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0,
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
        ent: ground
      };
    },
    pointcontents: (point) => {
      contentsProbes.push([...point]);
      return CONTENTS_WATER;
    }
  };

  const monster = createMonster(runtime, 38);
  monster.s.origin = [8, 16, 64];
  monster.origin = [8, 16, 64];
  monster.mins = [-16, -16, -24];
  monster.maxs = [16, 16, 32];

  M_droptofloor(monster, runtime);

  assert.deepEqual(traces[0]?.start, [8, 16, 65], "M_droptofloor should raise the monster one unit before tracing");
  assert.deepEqual(traces[0]?.end, [8, 16, -191], "M_droptofloor should trace 256 units down from the raised origin");
  assert.equal(traces[0]?.mask, MASK_MONSTERSOLID, "M_droptofloor should use MASK_MONSTERSOLID for the floor trace");
  assert.equal(traces[0]?.passent, monster, "M_droptofloor should skip the monster in its floor trace");
  assert.deepEqual(monster.s.origin, [8, 16, 39.75], "M_droptofloor should drop to trace.endpos then let M_CheckGround settle by a quarter unit");
  assert.deepEqual(monster.origin, monster.s.origin, "M_droptofloor should keep origin mirrored for runtime/web refresh adapters");
  assert.equal(monster.groundentity, ground, "M_droptofloor should refresh groundentity through M_CheckGround");
  assert.equal(monster.groundentity_linkcount, 9, "M_droptofloor should refresh the traced ground linkcount");
  assert.equal(monster.waterlevel, 3, "M_droptofloor should recategorize water state after linking");
  assert.deepEqual(contentsProbes, [[8, 16, 16.75], [8, 16, 42.75], [8, 16, 64.75]], "M_droptofloor should run the original categorize probes from the dropped origin");
  assert.equal(monster.linkcount > 0, true, "M_droptofloor should link the entity after moving it");

  const noFloor = createMonster(runtime, 39);
  noFloor.s.origin = [1, 2, 3];
  noFloor.origin = [1, 2, 3];
  runtime.collision.trace = (start, _mins, _maxs, end, passent, mask) => {
    traces.push({ start: [...start], end: [...end], mask, passent });
    return createClearTrace(end);
  };

  M_droptofloor(noFloor, runtime);

  assert.deepEqual(noFloor.s.origin, [1, 2, 4], "M_droptofloor should preserve the original one-unit raise when no floor is found");
  assert.equal(noFloor.groundentity, null, "M_droptofloor should not refresh ground when the drop trace misses");
}

function verifyMSetEffectsShellsAndPowerArmor(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 50;

  const resurrecting = createMonster(runtime, 40);
  resurrecting.s.effects = EF_POWERSCREEN;
  resurrecting.s.renderfx = RF_SHELL_GREEN | RF_SHELL_BLUE;
  resurrecting.monsterinfo.aiflags |= AI_RESURRECTING;
  M_SetEffects(resurrecting, runtime);
  assert.equal((resurrecting.s.effects & EF_COLOR_SHELL) !== 0, true, "AI_RESURRECTING should set EF_COLOR_SHELL");
  assert.equal((resurrecting.s.effects & EF_POWERSCREEN) !== 0, false, "M_SetEffects should clear stale EF_POWERSCREEN");
  assert.equal((resurrecting.s.renderfx & RF_SHELL_RED) !== 0, true, "AI_RESURRECTING should set red shell renderfx");
  assert.equal((resurrecting.s.renderfx & (RF_SHELL_GREEN | RF_SHELL_BLUE)) === 0, true, "M_SetEffects should clear stale shell colors");

  const deadShielded = createMonster(runtime, 41);
  deadShielded.health = 0;
  deadShielded.powerarmor_time = 60;
  deadShielded.monsterinfo.power_armor_type = POWER_ARMOR_SHIELD;
  M_SetEffects(deadShielded, runtime);
  assert.equal(deadShielded.s.effects, 0, "dead monsters should return before power armor effects");
  assert.equal(deadShielded.s.renderfx, 0, "dead monsters should not receive power armor shell renderfx");

  const screen = createMonster(runtime, 42);
  screen.powerarmor_time = 51;
  screen.monsterinfo.power_armor_type = POWER_ARMOR_SCREEN;
  M_SetEffects(screen, runtime);
  assert.equal((screen.s.effects & EF_POWERSCREEN) !== 0, true, "POWER_ARMOR_SCREEN should set EF_POWERSCREEN while active");
  assert.equal((screen.s.effects & EF_COLOR_SHELL) !== 0, false, "POWER_ARMOR_SCREEN should not set EF_COLOR_SHELL");

  const shield = createMonster(runtime, 43);
  shield.powerarmor_time = 51;
  shield.monsterinfo.power_armor_type = POWER_ARMOR_SHIELD;
  M_SetEffects(shield, runtime);
  assert.equal((shield.s.effects & EF_COLOR_SHELL) !== 0, true, "POWER_ARMOR_SHIELD should set EF_COLOR_SHELL");
  assert.equal((shield.s.renderfx & RF_SHELL_GREEN) !== 0, true, "POWER_ARMOR_SHIELD should set green shell renderfx");
  assert.equal((shield.s.effects & EF_POWERSCREEN) !== 0, false, "POWER_ARMOR_SHIELD should not set EF_POWERSCREEN");

  const expired = createMonster(runtime, 44);
  expired.s.effects = EF_COLOR_SHELL | EF_POWERSCREEN;
  expired.s.renderfx = RF_SHELL_RED | RF_SHELL_GREEN | RF_SHELL_BLUE;
  expired.powerarmor_time = runtime.time;
  expired.monsterinfo.power_armor_type = POWER_ARMOR_SHIELD;
  M_SetEffects(expired, runtime);
  assert.equal(expired.s.effects, 0, "expired power armor should leave no shell or powerscreen effect");
  assert.equal(expired.s.renderfx, 0, "expired power armor should clear stale shell renderfx");
}

function verifyMMoveFrameSequenceAndCallbacks(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 12.5;
  const monster = createMonster(runtime, 45);
  const aiCalls: Array<{ frame: number; dist: number }> = [];
  const thinkCalls: number[] = [];

  const baseMove: GameMonsterMove = {
    firstframe: 10,
    lastframe: 12,
    frame: [10, 11, 12].map((frameNumber) => ({
      aifunc: (self, dist) => {
        aiCalls.push({ frame: self.s.frame, dist });
      },
      dist: frameNumber - 9,
      thinkfunc: (self) => {
        thinkCalls.push(self.s.frame);
      }
    })),
    endfunc: undefined
  };

  monster.monsterinfo.currentmove = baseMove;
  monster.monsterinfo.scale = 2;
  monster.s.frame = 9;
  M_MoveFrame(monster, runtime);
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "M_MoveFrame should schedule the next monster think");
  assert.equal(monster.s.frame, 10, "out-of-range frames should reset to the move firstframe");
  assert.deepEqual(aiCalls.pop(), { frame: 10, dist: 2 }, "M_MoveFrame should call frame AI with scaled distance");
  assert.equal(thinkCalls.pop(), 10, "M_MoveFrame should call the selected frame thinkfunc after AI");

  monster.monsterinfo.nextframe = 12;
  M_MoveFrame(monster, runtime);
  assert.equal(monster.s.frame, 12, "valid monsterinfo.nextframe should override normal advancement");
  assert.equal(monster.monsterinfo.nextframe, 0, "M_MoveFrame should clear consumed nextframe");

  monster.monsterinfo.aiflags |= AI_HOLD_FRAME;
  M_MoveFrame(monster, runtime);
  assert.equal(monster.s.frame, 12, "AI_HOLD_FRAME should keep the current animation frame");
  assert.deepEqual(aiCalls.pop(), { frame: 12, dist: 0 }, "AI_HOLD_FRAME should call AI with zero distance");

  monster.monsterinfo.aiflags = AI_HOLD_FRAME;
  monster.s.frame = 99;
  M_MoveFrame(monster, runtime);
  assert.equal(monster.s.frame, 10, "out-of-range reset should clear AI_HOLD_FRAME before selecting firstframe");
  assert.equal((monster.monsterinfo.aiflags & AI_HOLD_FRAME) === 0, true, "M_MoveFrame should clear hold when fixing an invalid frame");

  const replacementMove: GameMonsterMove = {
    firstframe: 20,
    lastframe: 21,
    frame: [
      {
        aifunc: (_self, dist) => {
          aiCalls.push({ frame: 20, dist });
        },
        dist: 7,
        thinkfunc: undefined
      },
      {
        aifunc: undefined,
        dist: 0,
        thinkfunc: undefined
      }
    ],
    endfunc: undefined
  };
  const endingMove: GameMonsterMove = {
    firstframe: 10,
    lastframe: 12,
    frame: baseMove.frame,
    endfunc: (self) => {
      self.monsterinfo.currentmove = replacementMove;
    }
  };

  monster.monsterinfo.currentmove = endingMove;
  monster.s.frame = 12;
  M_MoveFrame(monster, runtime);
  assert.equal(monster.monsterinfo.currentmove, replacementMove, "M_MoveFrame should regrab currentmove after endfunc changes it");
  assert.equal(monster.s.frame, 20, "M_MoveFrame should advance using the replacement move after endfunc");
  assert.deepEqual(aiCalls.pop(), { frame: 20, dist: 14 }, "replacement move index should be computed from its firstframe");

  let deadEndfuncRan = false;
  monster.svflags |= SVF_DEADMONSTER;
  monster.monsterinfo.currentmove = {
    firstframe: 30,
    lastframe: 30,
    frame: [{
      aifunc: () => {
        throw new Error("dead monster should return before frame AI");
      },
      dist: 1,
      thinkfunc: () => {
        throw new Error("dead monster should return before frame think");
      }
    }],
    endfunc: (self) => {
      deadEndfuncRan = true;
      self.monsterinfo.currentmove = baseMove;
    }
  };
  monster.s.frame = 30;
  M_MoveFrame(monster, runtime);
  assert.equal(deadEndfuncRan, true, "M_MoveFrame should still run endfunc before the dead-monster return");
  assert.equal(monster.s.frame, 30, "SVF_DEADMONSTER after endfunc should stop before selecting a new frame");
}

function verifyMonsterThinkSequenceAndOutputs(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 12;

  const monster = createMonster(runtime, 46);
  monster.s.origin = [4, 8, 40];
  monster.origin = [4, 8, 40];
  monster.mins = [-16, -16, -24];
  monster.monsterinfo.scale = 2;
  monster.monsterinfo.aiflags = AI_RESURRECTING;
  monster.health = 50;
  monster.max_health = 100;
  monster.s.frame = 9;
  monster.waterlevel = 0;
  monster.watertype = 0;
  monster.linkcount = 5;
  monster.monsterinfo.linkcount = 5;

  const callbackSnapshots: Array<{ phase: string; frame: number; dist?: number; waterlevel: number; renderfx: number }> = [];
  monster.monsterinfo.currentmove = {
    firstframe: 10,
    lastframe: 10,
    frame: [{
      aifunc: (self, dist) => {
        callbackSnapshots.push({
          phase: "ai",
          frame: self.s.frame,
          dist,
          waterlevel: self.waterlevel,
          renderfx: self.s.renderfx
        });
      },
      dist: 3,
      thinkfunc: (self) => {
        callbackSnapshots.push({
          phase: "think",
          frame: self.s.frame,
          waterlevel: self.waterlevel,
          renderfx: self.s.renderfx
        });
      }
    }],
    endfunc: undefined
  };

  const probes: vec3_t[] = [];
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => createClearTrace(end),
    pointcontents: (point) => {
      probes.push([...point]);
      return probes.length <= 2 ? CONTENTS_WATER : 0;
    }
  };

  monster_think(monster, runtime);

  assert.deepEqual(callbackSnapshots, [
    { phase: "ai", frame: 10, dist: 6, waterlevel: 0, renderfx: 0 },
    { phase: "think", frame: 10, waterlevel: 0, renderfx: 0 }
  ], "monster_think should run M_MoveFrame callbacks before water and render effect refresh");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "monster_think should preserve M_MoveFrame nextthink scheduling");
  assert.deepEqual(probes, [[4, 8, 17], [4, 8, 43], [4, 8, 65]], "monster_think should categorize position after movement callbacks");
  assert.equal(monster.waterlevel, 2, "monster_think should leave the categorized waterlevel on the monster");
  assert.equal(monster.air_finished, runtime.time + 12, "monster_think should run world effects after categorization");
  assert.equal((monster.flags & FL_INWATER) !== 0, true, "monster_think should apply M_WorldEffects water state");
  assert.equal((monster.s.effects & EF_COLOR_SHELL) !== 0, true, "monster_think should apply M_SetEffects shell effect");
  assert.equal((monster.s.renderfx & RF_SHELL_RED) !== 0, true, "monster_think should apply M_SetEffects resurrection shell color");
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

function createMonster(runtime: GameRuntime, index: number): GameEntity {
  const monster = createRuntimeEntity({ classname: "monster_soldier" }, index);
  monster.inuse = true;
  monster.classname = "monster_soldier";
  monster.movetype = MOVETYPE_STEP;
  monster.svflags |= SVF_MONSTER;
  monster.health = 100;
  monster.max_health = 100;
  monster.viewheight = 25;
  monster.mins = [-16, -16, -24];
  monster.maxs = [16, 16, 32];
  monster.origin = [0, 0, 0];
  monster.s.origin = [0, 0, 0];
  monster.monsterinfo.stand = () => {
    return;
  };
  runtime.entities[index] = monster;
  return monster;
}

function createDamageableMonster(runtime: GameRuntime, index: number): GameEntity {
  const monster = createMonster(runtime, index);
  monster.takedamage = damage_t.DAMAGE_AIM;
  monster.mass = 200;
  return monster;
}

function createPlayer(runtime: GameRuntime, index: number): GameEntity {
  const player = createRuntimeEntity({ classname: "player" }, index);
  player.inuse = true;
  player.classname = "player";
  player.health = 100;
  player.max_health = 100;
  player.viewheight = 22;
  attachGameClient(player);
  runtime.entities[index] = player;
  return player;
}

function createStraightHitCollision(target: GameEntity): GameRuntime["collision"] {
  let leadHitsRemaining = 3;

  const hitTrace = (end: vec3_t): trace_t => ({
    allsolid: false,
    startsolid: false,
    fraction: 0.5,
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
    ent: target
  });

  const clearTrace = (end: vec3_t): trace_t => ({
    ...hitTrace(end),
    fraction: 1,
    ent: null
  });

  return {
    world: {} as never,
    trace: (start, _mins, _maxs, end, passent, mask) => {
      if (mask === MASK_SHOT && start[0] === 0 && start[1] === 0 && start[2] === 0) {
        return clearTrace(end);
      }
      if (passent === target) {
        return clearTrace(end);
      }
      if ((mask & MASK_SHOT) !== 0 && leadHitsRemaining > 0) {
        leadHitsRemaining -= 1;
        return hitTrace(end);
      }
      return clearTrace(end);
    },
    pointcontents: () => 0
  };
}

function createGroundingCollision(ground: GameEntity): GameRuntime["collision"] {
  return {
    world: {} as never,
    trace: (start, _mins, _maxs, end) => ({
      allsolid: false,
      startsolid: false,
      fraction: 0.5,
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
      ent: ground
    }),
    pointcontents: () => 0
  };
}

function createClearTrace(end: vec3_t): trace_t {
  return {
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
  };
}

function replaceMathRandom(values: number[]): () => void {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[index++] ?? values[values.length - 1] ?? 0;
  return () => {
    Math.random = original;
  };
}
