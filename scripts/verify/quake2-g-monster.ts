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
  FL_FLY,
  FL_SWIM,
  FRAMETIME,
  SOLID_NOT,
  SVF_MONSTER,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainGameSoundEvents,
  drainMonsterMuzzleFlashEvents
} from "../../packages/game/src/index.js";
import {
  EF_FLIES,
  MASK_MONSTERSOLID,
  MASK_SHOT
} from "../../packages/qcommon/src/index.js";
import { CONTENTS_LAVA, CONTENTS_SLIME, CONTENTS_WATER } from "../../packages/qcommon/src/q_shared.js";
import {
  DAMAGE_NO_ARMOR,
  FL_IMMUNE_LAVA,
  FL_IMMUNE_SLIME,
  FL_INWATER,
  FL_NOTARGET,
  MOD_LAVA,
  MOD_SLIME,
  MOD_UNKNOWN,
  MOD_WATER,
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
  M_WorldEffects,
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
  verifyAttackFinishedCooldown();
  verifyMCheckGroundTraceBranches();
  verifyMCheckGroundRuntimeReachability();
  verifyMCatagorizePositionWaterLevels();
  verifyMCatagorizePositionRuntimeReachability();
  verifyMWorldEffectsDamageAndSounds();
  verifyMDroptofloorTraceAndStateRefresh();

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
