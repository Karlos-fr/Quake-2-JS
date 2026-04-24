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
  createRuntimeEntity
} from "../../packages/game/src/index.js";
import { MASK_MONSTERSOLID } from "../../packages/qcommon/src/index.js";
import { FL_NOTARGET } from "../../packages/game/src/g-local.js";
import {
  monster_death_use,
  monster_start,
  monster_start_go,
  monster_use,
  walkmonster_start_go
} from "../../packages/game/src/g_monster.js";
import { MOVETYPE_STEP } from "../../packages/game/src/runtime.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";

main();

function main(): void {
  verifyMonsterStartBookkeepingAndDefaults();
  verifyMonsterStartSkipsGoodGuys();
  verifyMonsterUseHonorsOriginalFilters();
  verifyMonsterDeathUseDropsItemsAndFiresTargets();
  verifyMonsterStartGoFixesPointCombatTargets();
  verifyTriggeredSpawnStartupPath();

  console.log("Verification g_monster - shared monster gameplay OK");
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
