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
  AI_GOOD_GUY,
  AI_STAND_GROUND,
  FRAMETIME,
  SOLID_NOT,
  SVF_MONSTER,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainMonsterMuzzleFlashEvents
} from "../../packages/game/src/index.js";
import { EF_FLIES, MASK_MONSTERSOLID, MASK_SHOT } from "../../packages/qcommon/src/index.js";
import { FL_NOTARGET, MOD_UNKNOWN } from "../../packages/game/src/g_local.js";
import {
  M_FliesOff,
  M_FliesOn,
  M_FlyCheck,
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
  monster_use,
  type GameMonsterHooks,
  walkmonster_start_go
} from "../../packages/game/src/g_monster.js";
import { MOVETYPE_STEP } from "../../packages/game/src/runtime.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";
import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyMonsterWeaponWrappers();
  verifyMonsterStartBookkeepingAndDefaults();
  verifyMonsterStartSkipsGoodGuys();
  verifyMonsterUseHonorsOriginalFilters();
  verifyMonsterDeathUseDropsItemsAndFiresTargets();
  verifyMonsterStartGoFixesPointCombatTargets();
  verifyTriggeredSpawnStartupPath();
  verifyCorpseFlyScheduling();

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

  const started = monster_start(monster, runtime);

  assert.equal(started, true, "monster_start should keep monsters outside deathmatch");
  assert.equal(runtime.total_monsters, 1, "monster_start should increment total_monsters for hostile monsters");
  assert.equal(monster.svflags & SVF_MONSTER, SVF_MONSTER, "monster_start should mark the entity as a monster");
  assert.equal(monster.clipmask, MASK_MONSTERSOLID, "monster_start should use the monster collision mask");
  assert.equal(typeof monster.monsterinfo.checkattack, "function", "monster_start should install the default M_CheckAttack");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "monster_start should arm the first think frame");
}

function verifyMonsterStartSkipsGoodGuys(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 2);
  monster.monsterinfo.aiflags |= AI_GOOD_GUY;

  monster_start(monster, runtime);

  assert.equal(runtime.total_monsters, 0, "monster_start should not count good-guy monsters");
}

function verifyMonsterUseHonorsOriginalFilters(): void {
  const runtime = createHarnessRuntime();
  const monster = createMonster(runtime, 3);
  const activator = createPlayer(runtime, 4);

  let foundTargetCalls = 0;
  monster_use(monster, null, activator, runtime, {
    FoundTarget: () => {
      foundTargetCalls += 1;
    }
  });

  assert.equal(monster.enemy, activator, "monster_use should acquire the activator as enemy");
  assert.equal(foundTargetCalls, 1, "monster_use should call FoundTarget after acquiring an enemy");

  const notargetMonster = createMonster(runtime, 5);
  activator.flags |= FL_NOTARGET;
  monster_use(notargetMonster, null, activator, runtime);
  assert.equal(notargetMonster.enemy, null, "monster_use should reject notarget activators");

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

  assert.equal(monster.item, null, "monster_death_use should clear the dropped item");
  assert.equal(activatorSeen, enemy, "monster_death_use should forward the current enemy as activator");
  assert.equal(runtime.entities.length > 1, true, "monster_death_use should spawn a dropped item entity");
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
}

function verifyTriggeredSpawnStartupPath(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 0;
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => ({
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
    }),
    pointcontents: () => 0
  };

  const monster = createMonster(runtime, 13);
  const activator = createPlayer(runtime, 14);
  monster.spawnflags = 2;
  monster.groundentity = createRuntimeEntity({ classname: "ground" }, 15);
  monster.monsterinfo.stand = () => {
    return;
  };

  walkmonster_start_go(monster, runtime);

  assert.equal(monster.solid, SOLID_NOT, "walkmonster_start_go should hide trigger-spawn monsters after shared startup");
  assert.equal(typeof monster.use, "function", "walkmonster_start_go should arm trigger-spawn use");

  monster.use!(monster, null, activator, runtime);

  assert.equal(typeof monster.think, "function", "monster_triggered_spawn_use should schedule the delayed spawn think");
  assert.equal(monster.nextthink, runtime.time + FRAMETIME, "monster_triggered_spawn_use should delay spawn by one frame");
  assert.equal(monster.enemy, activator, "monster_triggered_spawn_use should preserve the activating client as enemy");

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

function replaceMathRandom(values: number[]): () => void {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[index++] ?? values[values.length - 1] ?? 0;
  return () => {
    Math.random = original;
  };
}
