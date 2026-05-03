/**
 * File: quake2-m-brain.ts
 * Purpose: Verify the gameplay port of `game/m_brain.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_brain behavior.
 *
 * Dependencies:
 * - packages/game/src/m_brain.ts
 */

import { strict as assert } from "node:assert";

import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_DUCKED,
  AI_HOLD_FRAME,
  AI_STAND_GROUND,
  DEAD_DEAD,
  FRAMETIME,
  M_MoveFrame,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  SOLID_BBOX,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  damage_t,
  drainGameSoundEvents,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  POWER_ARMOR_NONE,
  POWER_ARMOR_SCREEN
} from "../../packages/game/src/g_local.js";
import {
  FRAME_attak201,
  FRAME_duck01,
  SP_monster_brain,
  brain_chest_closed,
  brain_chest_open,
  brain_dead,
  brain_die,
  brain_dodge,
  brain_duck_down,
  brain_duck_hold,
  brain_duck_up,
  brain_hit_left,
  brain_idle,
  brain_melee,
  brain_move_attack1,
  brain_move_attack2,
  brain_move_death1,
  brain_move_death2,
  brain_move_duck,
  brain_move_idle,
  brain_move_pain1,
  brain_move_pain2,
  brain_move_pain3,
  brain_move_run,
  brain_move_stand,
  brain_move_walk1,
  brain_pain,
  brain_run,
  brain_search,
  brain_sight,
  brain_stand,
  brain_tentacle_attack,
  brain_walk
} from "../../packages/game/src/m_brain.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterBrain();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySightSearchAndIdleSounds();
  verifyDuckAndDodgeBranches();
  verifyMeleeAndTentacleCallbacks();
  verifyMoveFrameCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-brain: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 1);

  SP_monster_brain(brain, runtime);

  assert.equal(brain.movetype, MOVETYPE_STEP);
  assert.equal(brain.solid, SOLID_BBOX);
  assert.deepEqual(brain.mins, [-16, -16, -24]);
  assert.deepEqual(brain.maxs, [16, 16, 32]);
  assert.equal(brain.health, 300);
  assert.equal(brain.gib_health, -150);
  assert.equal(brain.mass, 400);
  assert.equal(brain.monsterinfo.currentmove, brain_move_stand);
  assert.equal(brain.monsterinfo.power_armor_type, POWER_ARMOR_SCREEN);
  assert.equal(brain.monsterinfo.power_armor_power, 100);
  assert.equal(runtime.assets.modelPaths[brain.s.modelindex - 1], "models/monsters/brain/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "brain/brnatck1.wav",
    "brain/brnatck2.wav",
    "brain/brnatck3.wav",
    "brain/brndeth1.wav",
    "brain/brnidle1.wav",
    "brain/brnidle2.wav",
    "brain/brnlens1.wav",
    "brain/brnpain1.wav",
    "brain/brnpain2.wav",
    "brain/brnsght1.wav",
    "brain/brnsrch1.wav",
    "brain/melee1.wav",
    "brain/melee2.wav",
    "brain/melee3.wav"
  ]);
  assert.ok(brain.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 2);

  SP_monster_brain(brain, runtime);
  brain.think!(brain, runtime);

  assert.equal(brain.yaw_speed, 20);
  assert.equal(brain.viewheight, 25);
  assert.equal(brain.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(brain.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(brain.max_health, 300);
  assert.equal(brain.think?.name, "monster_think");
  assert.equal(brain.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterBrain(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 3);

  ED_CallSpawn(brain, runtime);

  assert.equal(brain.health, 300);
  assert.equal(brain.monsterinfo.currentmove, brain_move_stand);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_brain"), SP_monster_brain);
  assert.equal(findGameSaveFunction("brain_pain"), brain_pain);
  assert.equal(findGameSaveFunction("brain_die"), brain_die);
  assert.equal(findGameSaveMove("brain_move_stand"), brain_move_stand);
  assert.equal(findGameSaveMove("brain_move_attack2"), brain_move_attack2);
  assert.equal(findGameSaveMove("brain_move_death1"), brain_move_death1);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 4);
  void runtime;

  brain_stand(brain);
  assert.equal(brain.monsterinfo.currentmove, brain_move_stand);
  brain_walk(brain);
  assert.equal(brain.monsterinfo.currentmove, brain_move_walk1);
  brain_run(brain);
  assert.equal(brain.monsterinfo.currentmove, brain_move_run);
  brain.monsterinfo.aiflags |= AI_STAND_GROUND;
  brain_run(brain);
  assert.equal(brain.monsterinfo.currentmove, brain_move_stand);

  withMathRandom([0.25], () => brain_melee(brain));
  assert.equal(brain.monsterinfo.currentmove, brain_move_attack1);
  withMathRandom([0.5], () => brain_melee(brain));
  assert.equal(
    brain.monsterinfo.currentmove,
    brain_move_attack2,
    "brain_melee should use the C 15-bit random() bucket at the 0.5 threshold"
  );
  withMathRandom([0.75], () => brain_melee(brain));
  assert.equal(brain.monsterinfo.currentmove, brain_move_attack2);
}

function verifySightSearchAndIdleSounds(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 5);
  SP_monster_brain(brain, runtime);

  brain_sight(brain, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "brain/brnsght1.wav");

  brain_search(brain, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "brain/brnsrch1.wav");

  brain_idle(brain, runtime);
  const idleSound = drainGameSoundEvents(runtime).at(-1);
  assert.equal(idleSound?.soundPath, "brain/brnlens1.wav");
  assert.equal(brain.monsterinfo.currentmove, brain_move_idle);
}

function verifyDuckAndDodgeBranches(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 6);
  const attacker = createEnemy(runtime, 7, [128, 0, 0]);
  SP_monster_brain(brain, runtime);

  brain_duck_down(brain, runtime);
  assert.equal(brain.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
  assert.equal(brain.maxs[2], 0);
  assert.equal(brain.takedamage, damage_t.DAMAGE_YES);

  brain.monsterinfo.pausetime = 2;
  brain_duck_hold(brain, runtime);
  assert.equal(brain.monsterinfo.aiflags & AI_HOLD_FRAME, AI_HOLD_FRAME);

  runtime.time = 3;
  brain_duck_hold(brain, runtime);
  assert.equal(brain.monsterinfo.aiflags & AI_HOLD_FRAME, 0);

  brain_duck_up(brain, runtime);
  assert.equal(brain.monsterinfo.aiflags & AI_DUCKED, 0);
  assert.equal(brain.maxs[2], 32);
  assert.equal(brain.takedamage, damage_t.DAMAGE_AIM);

  withMathRandom([0.5], () => brain_dodge(brain, attacker, 0.25, runtime));
  assert.notEqual(brain.monsterinfo.currentmove, brain_move_duck);
  withMathRandom([0.25], () => brain_dodge(brain, attacker, 0.25, runtime));
  assert.notEqual(
    brain.monsterinfo.currentmove,
    brain_move_duck,
    "brain_dodge should use the C 15-bit random() bucket at the 0.25 threshold"
  );
  withMathRandom([0.1], () => brain_dodge(brain, attacker, 0.25, runtime));
  assert.equal(brain.enemy, attacker);
  assert.equal(brain.monsterinfo.currentmove, brain_move_duck);
  assert.equal(brain.monsterinfo.pausetime, runtime.time + 0.75);
}

function verifyMeleeAndTentacleCallbacks(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 8);
  const enemy = createEnemy(runtime, 9, [40, 0, 0]);
  SP_monster_brain(brain, runtime);
  brain.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  withMathRandom([0], () => brain_hit_left(brain, runtime));
  assert.equal(enemy.health, 85);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "brain/melee3.wav");

  brain_chest_open(brain, runtime);
  assert.equal(brain.monsterinfo.power_armor_type, POWER_ARMOR_NONE);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "brain/brnatck1.wav");

  runtime.skill = 1;
  withMathRandom([0], () => brain_tentacle_attack(brain, runtime));
  assert.equal(enemy.health, 75);
  assert.equal((brain.spawnflags & 65536) !== 0, true);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "brain/brnatck3.wav");

  brain_chest_closed(brain);
  assert.equal(brain.monsterinfo.power_armor_type, POWER_ARMOR_SCREEN);
  assert.equal(brain.monsterinfo.currentmove, brain_move_attack1);
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 10);
  const enemy = createEnemy(runtime, 11, [40, 0, 0]);
  SP_monster_brain(brain, runtime);
  brain.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  brain.monsterinfo.currentmove = brain_move_attack2;
  brain.s.frame = FRAME_attak201 + 5;
  withMathRandom([0], () => M_MoveFrame(brain, runtime));
  assert.equal(brain.s.frame, FRAME_attak201 + 6);
  assert.equal(enemy.health, 90);

  brain.monsterinfo.currentmove = brain_move_duck;
  brain.s.frame = FRAME_duck01;
  M_MoveFrame(brain, runtime);
  assert.equal(brain.maxs[2], 0);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 12);
  SP_monster_brain(brain, runtime);
  brain.max_health = 300;
  brain.health = 100;

  withMathRandom([0.1], () => brain_pain(brain, null, 0, 10, runtime));
  assert.equal(brain.s.skinnum, 1);
  assert.equal(brain.monsterinfo.currentmove, brain_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "brain/brnpain1.wav");

  runtime.time = 4;
  withMathRandom([0.5], () => brain_pain(brain, null, 0, 10, runtime));
  assert.equal(brain.monsterinfo.currentmove, brain_move_pain2);

  runtime.time = 8;
  withMathRandom([0.9], () => brain_pain(brain, null, 0, 10, runtime));
  assert.equal(brain.monsterinfo.currentmove, brain_move_pain3);

  runtime.skill = 3;
  runtime.time = 12;
  brain.monsterinfo.currentmove = brain_move_stand;
  brain_pain(brain, null, 0, 10, runtime);
  assert.equal(brain.monsterinfo.currentmove, brain_move_stand);
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const brain = createBrain(runtime, 13);
  SP_monster_brain(brain, runtime);

  withMathRandom([0], () => brain_die(brain, null, null, 60, runtime));
  assert.equal(brain.deadflag, DEAD_DEAD);
  assert.equal(brain.takedamage, damage_t.DAMAGE_YES);
  assert.equal(brain.monsterinfo.power_armor_type, POWER_ARMOR_NONE);
  assert.equal(brain.monsterinfo.currentmove, brain_move_death1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "brain/brndeth1.wav");

  const second = createBrain(runtime, 14);
  SP_monster_brain(second, runtime);
  withMathRandom([0.5], () => brain_die(second, null, null, 60, runtime));
  assert.equal(
    second.monsterinfo.currentmove,
    brain_move_death2,
    "brain_die should use the C 15-bit random() bucket at the 0.5 threshold"
  );

  const third = createBrain(runtime, 17);
  SP_monster_brain(third, runtime);
  withMathRandom([0.75], () => brain_die(third, null, null, 60, runtime));
  assert.equal(third.monsterinfo.currentmove, brain_move_death2);

  brain_dead(third, runtime);
  assert.deepEqual(third.mins, [-16, -16, -24]);
  assert.deepEqual(third.maxs, [16, 16, -8]);
  assert.equal(third.movetype, MOVETYPE_TOSS);
  assert.equal(third.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);

  const gibBrain = createBrain(runtime, 15);
  SP_monster_brain(gibBrain, runtime);
  gibBrain.health = -150;
  brain_die(gibBrain, null, null, 25, runtime);
  assert.equal(gibBrain.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const brain = createBrain(runtime, 16);

  SP_monster_brain(brain, runtime);

  assert.equal(brain.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([
    { properties: { classname: "worldspawn" } }
  ]);
  runtime.collision = {
    world: {} as never,
    trace: (_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t) => makeTrace(null, end),
    pointcontents: () => 0
  };
  return runtime;
}

function createBrain(runtime: GameRuntime, index: number): GameEntity {
  const brain = createRuntimeEntity({ classname: "monster_brain" }, index);
  runtime.entities[index] = brain;
  return brain;
}

function createEnemy(runtime: GameRuntime, index: number, origin: vec3_t): GameEntity {
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, index);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.max_health = 100;
  enemy.takedamage = damage_t.DAMAGE_YES;
  enemy.svflags |= SVF_MONSTER;
  enemy.s.origin = [...origin];
  enemy.origin = [...origin];
  enemy.viewheight = 24;
  runtime.entities[index] = enemy;
  return enemy;
}

function makeTrace(entity: GameEntity | null, endpos: vec3_t | null = null): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: endpos ? [...endpos] : entity?.s.origin ? [...entity.s.origin] : [0, 0, 0],
    plane: {
      normal: [0, 0, 1],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent: entity
  };
}

function withMathRandom(values: number[], callback: () => void): void {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    const value = values[index];
    index += 1;
    return value ?? values.at(-1) ?? 0;
  };

  try {
    callback();
  } finally {
    Math.random = originalRandom;
  }
}
