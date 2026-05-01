/**
 * File: quake2-g-ai.ts
 * Purpose: Verify the first direct TypeScript port of `game/g_ai.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict gameplay AI port.
 *
 * Dependencies:
 * - packages/game/src/g_ai.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  CONTENTS_LAVA,
  CONTENTS_MONSTER,
  CONTENTS_SLIME,
  CONTENTS_SOLID,
  CONTENTS_WINDOW
} from "../../packages/qcommon/src/q_shared.js";
import {
  AI_SetSightClient,
  FindTarget,
  FacingIdeal,
  HuntTarget,
  FoundTarget,
  M_CheckAttack,
  ai_checkattack,
  ai_run,
  ai_run_melee,
  ai_run_missile,
  ai_run_slide,
  infront,
  range,
  visible
} from "../../packages/game/src/g_ai.js";
import {
  AI_COMBAT_POINT,
  AI_BRUTAL,
  AI_LOST_SIGHT,
  AI_MEDIC,
  AI_PURSUE_NEXT,
  AI_PURSUE_TEMP,
  AI_PURSUIT_LAST_SEEN,
  AI_SOUND_TARGET,
  AI_STAND_GROUND,
  AI_TEMP_STAND_GROUND,
  AS_MELEE,
  AS_MISSILE,
  AS_SLIDING,
  AS_STRAIGHT,
  FL_FLY,
  FL_NOTARGET,
  RANGE_FAR,
  RANGE_MELEE,
  RANGE_MID,
  RANGE_NEAR,
  SVF_MONSTER
} from "../../packages/game/src/g_local.js";
import { attachGameClient, createGameRuntimeFromBspEntities, createRuntimeEntity } from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([]);
runtime.maxclients = 3;
runtime.time = 10;
runtime.framenum = 100;

const player1 = createRuntimeEntity({ classname: "player" }, 1);
attachGameClient(player1);
player1.inuse = true;
player1.health = 100;
player1.flags |= FL_NOTARGET;

const player2 = createRuntimeEntity({ classname: "player" }, 2);
attachGameClient(player2);
player2.inuse = true;
player2.health = 0;

const player3 = createRuntimeEntity({ classname: "player" }, 3);
attachGameClient(player3);
player3.inuse = true;
player3.health = 100;
player3.s.origin = [100, 0, 0];
player3.origin = [100, 0, 0];
player3.viewheight = 22;
player3.light_level = 64;

runtime.entities[1] = player1;
runtime.entities[2] = player2;
runtime.entities[3] = player3;

AI_SetSightClient(runtime);
assert.equal(runtime.sight_client, player3, "AI_SetSightClient must skip dead and notarget clients");

const monster = createRuntimeEntity({ classname: "monster_infantry" }, 10);
monster.inuse = true;
monster.health = 50;
monster.viewheight = 25;
monster.s.origin = [0, 0, 0];
monster.origin = [0, 0, 0];
monster.s.angles = [0, 0, 0];
monster.angles = [0, 0, 0];
monster.yaw_speed = 20;

let runCalls = 0;
let sightCalls = 0;
monster.monsterinfo.run = () => {
  runCalls += 1;
};
monster.monsterinfo.sight = (_self, other) => {
  if (other === player3) {
    sightCalls += 1;
  }
};

runtime.entities[10] = monster;

assert.equal(range(monster, createPointEntity(20, 0, 0, 11)), RANGE_MELEE, "range melee mismatch");
assert.equal(range(monster, createPointEntity(400, 0, 0, 12)), RANGE_NEAR, "range near mismatch");
assert.equal(range(monster, createPointEntity(700, 0, 0, 13)), RANGE_MID, "range mid mismatch");
assert.equal(range(monster, createPointEntity(1200, 0, 0, 14)), RANGE_FAR, "range far mismatch");

runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => ({
    allsolid: false,
    startsolid: false,
    fraction: end[0] >= 0 ? 1 : 0.5,
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
    ent: player3
  }),
  pointcontents: () => 0
};

assert.equal(visible(monster, player3, runtime), true, "visible must pass for clear trace");
assert.equal(infront(monster, player3), true, "infront must detect forward target");

const behind = createPointEntity(-100, 0, 0, 15);
assert.equal(infront(monster, behind), false, "infront must reject target behind monster");

runtime.sight_client = player3;
const found = FindTarget(monster, runtime);
assert.equal(found, true, "FindTarget must acquire visible sight client");
assert.equal(monster.enemy, player3, "FindTarget enemy mismatch");
assert.equal(monster.goalentity, player3, "FindTarget must hunt the enemy");
assert.equal(runCalls, 1, "FindTarget must enter run state once");
assert.equal(sightCalls, 1, "FindTarget must call sight callback for direct target acquisition");
assert.equal(monster.show_hostile, runtime.time + 1, "FindTarget show_hostile mismatch");
assert.equal(monster.monsterinfo.attack_finished, runtime.time + 1, "HuntTarget attack delay mismatch");

runtime.collision = createClearVisibilityCollision();
runtime.sight_entity = null;
runtime.sight_entity_framenum = 0;
runtime.sound_entity = null;
runtime.sound_entity_framenum = 0;
runtime.sound2_entity = null;
runtime.sound2_entity_framenum = 0;

const farClient = createPointEntity(1200, 0, 0, 32);
attachGameClient(farClient);
runtime.entities[32] = farClient;
const farRangeMonster = createFindTargetMonster(33);
runtime.sight_client = farClient;
assert.equal(FindTarget(farRangeMonster, runtime), false, "FindTarget must reject RANGE_FAR sight clients");
assert.equal(farRangeMonster.enemy, null, "FindTarget must not keep a far sight client as enemy");

const darkClient = createPointEntity(100, 0, 0, 34);
attachGameClient(darkClient);
darkClient.light_level = 5;
runtime.entities[34] = darkClient;
const darkTargetMonster = createFindTargetMonster(35);
runtime.sight_client = darkClient;
assert.equal(FindTarget(darkTargetMonster, runtime), false, "FindTarget must reject sight clients in light level 5 or darker");

const nearBehindClient = createPointEntity(-100, 0, 0, 36);
attachGameClient(nearBehindClient);
nearBehindClient.show_hostile = runtime.time - 0.1;
runtime.entities[36] = nearBehindClient;
const nearBehindMonster = createFindTargetMonster(37);
runtime.sight_client = nearBehindClient;
assert.equal(FindTarget(nearBehindMonster, runtime), false, "FindTarget must reject quiet RANGE_NEAR clients behind the monster");

nearBehindClient.show_hostile = runtime.time;
assert.equal(FindTarget(nearBehindMonster, runtime), true, "FindTarget must accept hostile RANGE_NEAR clients behind the monster");
assert.equal(nearBehindMonster.enemy, nearBehindClient, "FindTarget must keep the accepted hostile near client");
runtime.sight_entity = null;
runtime.sight_entity_framenum = 0;

const midBehindClient = createPointEntity(-700, 0, 0, 38);
attachGameClient(midBehindClient);
midBehindClient.show_hostile = runtime.time + 10;
runtime.entities[38] = midBehindClient;
const midBehindMonster = createFindTargetMonster(39);
runtime.sight_client = midBehindClient;
assert.equal(FindTarget(midBehindMonster, runtime), false, "FindTarget must reject RANGE_MID clients behind the monster");

const angryMonster = createPointEntity(120, 0, 0, 40);
angryMonster.classname = "monster_angry";
angryMonster.svflags |= SVF_MONSTER;
angryMonster.enemy = player3;
runtime.entities[40] = angryMonster;
const monsterTargetObserver = createFindTargetMonster(41);
runtime.sight_entity = null;
runtime.sight_entity_framenum = 0;
runtime.sight_client = angryMonster;
assert.equal(FindTarget(monsterTargetObserver, runtime), true, "FindTarget must accept angry monster sight targets");
assert.equal(monsterTargetObserver.enemy, player3, "FindTarget must resolve angry monster sight targets to their client enemy");

monster.s.angles[1] = 30;
monster.ideal_yaw = 40;
assert.equal(FacingIdeal(monster), true, "FacingIdeal must accept close yaw");
monster.ideal_yaw = 200;
assert.equal(FacingIdeal(monster), false, "FacingIdeal must reject large yaw delta");
monster.s.angles[1] = 45;
monster.ideal_yaw = 0;
assert.equal(FacingIdeal(monster), true, "FacingIdeal must include the 45 degree boundary");
monster.s.angles[1] = 46;
monster.ideal_yaw = 0;
assert.equal(FacingIdeal(monster), false, "FacingIdeal must reject deltas greater than 45 degrees");
monster.s.angles[1] = 314;
monster.ideal_yaw = 0;
assert.equal(FacingIdeal(monster), false, "FacingIdeal must reject deltas lower than 315 degrees");
monster.s.angles[1] = 315;
monster.ideal_yaw = 0;
assert.equal(FacingIdeal(monster), true, "FacingIdeal must include the 315 degree boundary");
monster.s.angles[1] = 350;
monster.ideal_yaw = 10;
assert.equal(FacingIdeal(monster), true, "FacingIdeal must accept wrapped yaw deltas near 360 degrees");
monster.s.angles[1] = 0;
monster.ideal_yaw = 90;
assert.equal(FacingIdeal(monster), false, "FacingIdeal must reject wrapped yaw deltas inside the blocked arc");

const hunter = createRuntimeEntity({ classname: "monster_hunter" }, 16);
hunter.enemy = player3;
hunter.monsterinfo.run = () => {
  runCalls += 1;
};
HuntTarget(hunter, runtime);
assert.equal(hunter.goalentity, player3, "HuntTarget must set goalentity to enemy");
assert.equal(hunter.monsterinfo.attack_finished, runtime.time + 1, "HuntTarget must delay first attack when pursuing");
assert.equal(hunter.ideal_yaw, 0, "HuntTarget must face the acquired enemy");

const standHunter = createRuntimeEntity({ classname: "monster_stand_hunter" }, 29);
standHunter.enemy = player3;
standHunter.monsterinfo.aiflags |= AI_STAND_GROUND;
let standHunterCalls = 0;
standHunter.monsterinfo.stand = () => {
  standHunterCalls += 1;
};
HuntTarget(standHunter, runtime);
assert.equal(standHunter.goalentity, player3, "HuntTarget stand-ground goalentity mismatch");
assert.equal(standHunterCalls, 1, "HuntTarget must call stand for stand-ground monsters");
assert.equal(standHunter.monsterinfo.attack_finished, 0, "HuntTarget must not delay attacks for stand-ground monsters");

const combatPoint = createRuntimeEntity({ classname: "point_combat", targetname: "cp1" }, 17);
combatPoint.inuse = true;
runtime.entities[17] = combatPoint;

const monsterWithCombatTarget = createRuntimeEntity({ classname: "monster_soldier", combattarget: "cp1" }, 18);
monsterWithCombatTarget.inuse = true;
monsterWithCombatTarget.enemy = player3;
let combatRunCalls = 0;
monsterWithCombatTarget.monsterinfo.run = () => {
  combatRunCalls += 1;
};
runtime.entities[18] = monsterWithCombatTarget;

FoundTarget(monsterWithCombatTarget, runtime);
assert.equal(monsterWithCombatTarget.goalentity, combatPoint, "FoundTarget must pick combattarget entity");
assert.equal(monsterWithCombatTarget.movetarget, combatPoint, "FoundTarget movetarget mismatch");
assert.equal(combatRunCalls, 1, "FoundTarget must run toward combattarget");
assert.equal(monsterWithCombatTarget.combattarget, undefined, "FoundTarget must consume combattarget after selecting it");
assert.equal((monsterWithCombatTarget.monsterinfo.aiflags & AI_COMBAT_POINT) !== 0, true, "FoundTarget must mark combat-point movement");
assert.equal(combatPoint.targetname, undefined, "FoundTarget must reserve the selected combat point");

const sightMonster = createRuntimeEntity({ classname: "monster_sight_broadcaster" }, 30);
sightMonster.inuse = true;
sightMonster.enemy = player3;
runtime.entities[30] = sightMonster;
FoundTarget(sightMonster, runtime);
assert.equal(runtime.sight_entity, sightMonster, "FoundTarget must broadcast sight_entity for client enemies");
assert.equal(runtime.sight_entity_framenum, runtime.framenum, "FoundTarget must stamp sight_entity_framenum");
assert.equal(sightMonster.light_level, 128, "FoundTarget must make the broadcaster visible to other monsters");
assert.deepEqual(sightMonster.monsterinfo.last_sighting, player3.s.origin, "FoundTarget must copy enemy origin into last_sighting");
assert.equal(sightMonster.monsterinfo.trail_time, runtime.time, "FoundTarget must refresh trail_time");

const missingCombatTarget = createRuntimeEntity({ classname: "monster_missing_combat", combattarget: "missing_cp" }, 31);
missingCombatTarget.inuse = true;
missingCombatTarget.enemy = player3;
let missingRunCalls = 0;
missingCombatTarget.monsterinfo.run = () => {
  missingRunCalls += 1;
};
runtime.entities[31] = missingCombatTarget;
FoundTarget(missingCombatTarget, runtime);
assert.equal(missingCombatTarget.goalentity, player3, "FoundTarget must fall back to enemy when combattarget is missing");
assert.equal(missingCombatTarget.movetarget, player3, "FoundTarget missing combattarget movetarget mismatch");
assert.equal(missingRunCalls, 1, "FoundTarget missing combattarget must hunt the enemy");

const soundMonster = createRuntimeEntity({ classname: "monster_guard" }, 27);
soundMonster.inuse = true;
soundMonster.s.origin = [0, 0, 0];
soundMonster.origin = [0, 0, 0];
soundMonster.areanum = 1;
soundMonster.spawnflags = 1;
soundMonster.yaw_speed = 20;
runtime.entities[27] = soundMonster;

const soundNoise = createRuntimeEntity({ classname: "player_noise" }, 28);
soundNoise.inuse = true;
soundNoise.s.origin = [128, 0, 0];
soundNoise.origin = [128, 0, 0];
soundNoise.owner = player3;
soundNoise.areanum = 1;
soundNoise.viewheight = 0;
runtime.entities[28] = soundNoise;

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

runtime.sound_entity = soundNoise;
runtime.sound_entity_framenum = runtime.framenum;
player3.flags |= FL_NOTARGET;
assert.equal(FindTarget(soundMonster, runtime), false, "FindTarget must reject heard target whose owner is notarget");
player3.flags &= ~FL_NOTARGET;
assert.equal(FindTarget(soundMonster, runtime), true, "FindTarget must accept reachable sound target");
assert.equal(soundMonster.enemy, soundNoise, "FindTarget sound enemy mismatch");
assert.equal((soundMonster.monsterinfo.aiflags & AI_SOUND_TARGET) !== 0, true, "FindTarget must set AI_SOUND_TARGET for heard targets");

const impactNoise = createRuntimeEntity({ classname: "player_noise_impact" }, 88);
impactNoise.inuse = true;
impactNoise.owner = player3;
impactNoise.s.origin = [24, 0, 0];
impactNoise.origin = [24, 0, 0];
runtime.entities[88] = impactNoise;
const impactMonster = createFindTargetMonster(89);
runtime.entities[89] = impactMonster;
runtime.sound_entity = null;
runtime.sound_entity_framenum = 0;
runtime.sound2_entity = impactNoise;
runtime.sound2_entity_framenum = runtime.framenum;
assert.equal(FindTarget(impactMonster, runtime), true, "FindTarget must accept fresh secondary impact sound target");
assert.equal(impactMonster.enemy, impactNoise, "FindTarget secondary sound enemy mismatch");
assert.equal((impactMonster.monsterinfo.aiflags & AI_SOUND_TARGET) !== 0, true, "FindTarget must set AI_SOUND_TARGET for secondary heard targets");
impactMonster.enemy = soundMonster.enemy;
assert.equal(FindTarget(impactMonster, runtime), false, "FindTarget must ignore secondary sound target while already angry");
impactMonster.enemy = null;
impactMonster.spawnflags = 1;
assert.equal(FindTarget(impactMonster, runtime), false, "FindTarget must ignore secondary sound target for stand-ground monsters");
impactMonster.spawnflags = 0;

const noiseTarget = createRuntimeEntity({ classname: "player_noise" }, 19);
noiseTarget.inuse = true;
noiseTarget.s.origin = [32, 0, 0];
noiseTarget.origin = [32, 0, 0];
runtime.entities[19] = noiseTarget;

const soundHunter = createRuntimeEntity({ classname: "monster_sound_hunter" }, 20);
soundHunter.inuse = true;
soundHunter.enemy = noiseTarget;
soundHunter.monsterinfo.aiflags |= AI_SOUND_TARGET;
let standCalls = 0;
soundHunter.monsterinfo.stand = () => {
  standCalls += 1;
};
runtime.entities[20] = soundHunter;

ai_run(soundHunter, 16, runtime);
assert.equal((soundHunter.monsterinfo.aiflags & AI_STAND_GROUND) !== 0, true, "ai_run must stand ground near sound target");
assert.equal((soundHunter.monsterinfo.aiflags & AI_TEMP_STAND_GROUND) !== 0, true, "ai_run must set temp stand ground near sound target");
assert.equal(standCalls, 1, "ai_run must call stand for close sound targets");

const farNoiseTarget = createRuntimeEntity({ classname: "player_noise_far" }, 81);
farNoiseTarget.inuse = true;
farNoiseTarget.s.origin = [128, 0, 0];
farNoiseTarget.origin = [128, 0, 0];
farNoiseTarget.absmin = [112, -16, -24];
farNoiseTarget.absmax = [144, 16, 32];
runtime.entities[81] = farNoiseTarget;

const farSoundHunter = createRuntimeEntity({ classname: "monster_sound_hunter_far" }, 82);
farSoundHunter.inuse = true;
farSoundHunter.enemy = farNoiseTarget;
farSoundHunter.goalentity = farNoiseTarget;
farSoundHunter.flags |= FL_FLY;
farSoundHunter.groundentity = createPointEntity(0, 0, -1, 83);
farSoundHunter.mins = [-16, -16, -24];
farSoundHunter.maxs = [16, 16, 32];
farSoundHunter.absmin = [-16, -16, -24];
farSoundHunter.absmax = [16, 16, 32];
farSoundHunter.yaw_speed = 360;
farSoundHunter.monsterinfo.aiflags |= AI_SOUND_TARGET;
let farStandCalls = 0;
farSoundHunter.monsterinfo.stand = () => {
  farStandCalls += 1;
};
runtime.entities[82] = farSoundHunter;

const savedRandomForSoundRun = Math.random;
try {
  Math.random = () => 0;
  runtime.sight_client = null;
  runtime.sound_entity = null;
  runtime.sound_entity_framenum = 0;
  runtime.sound2_entity = null;
  runtime.sound2_entity_framenum = 0;
  runtime.collision = createClearVisibilityCollision();
  ai_run(farSoundHunter, 16, runtime);
} finally {
  Math.random = savedRandomForSoundRun;
}
assert.equal(farStandCalls, 0, "ai_run must not stand for distant sound targets");
assert.ok(farSoundHunter.s.origin[0] > 0, "ai_run must move toward distant sound targets before target reacquisition");

const deadSlidingEnemy = createRuntimeEntity({ classname: "dead_sliding_enemy" }, 84);
deadSlidingEnemy.inuse = true;
deadSlidingEnemy.health = 0;
runtime.entities[84] = deadSlidingEnemy;

const slidingReturnMonster = createRuntimeEntity({ classname: "monster_sliding_return" }, 87);
slidingReturnMonster.inuse = true;
slidingReturnMonster.enemy = deadSlidingEnemy;
slidingReturnMonster.monsterinfo.attack_state = AS_SLIDING;
let slidingReturnStandCalls = 0;
slidingReturnMonster.monsterinfo.stand = () => {
  slidingReturnStandCalls += 1;
};
runtime.entities[87] = slidingReturnMonster;
ai_run(slidingReturnMonster, 12, runtime);
assert.equal(slidingReturnStandCalls, 1, "ai_run must return immediately when ai_checkattack resolves the enemy");
assert.equal(slidingReturnMonster.monsterinfo.attack_state, AS_SLIDING, "ai_run must not enter sliding after ai_checkattack returns true");

const runSlidingEnemy = createPointEntity(100, 0, 0, 85);
runSlidingEnemy.viewheight = 22;
runtime.entities[85] = runSlidingEnemy;

const runSlidingMonster = createRuntimeEntity({ classname: "monster_run_slider" }, 86);
runSlidingMonster.inuse = true;
runSlidingMonster.enemy = runSlidingEnemy;
runSlidingMonster.health = 100;
runSlidingMonster.viewheight = 25;
runSlidingMonster.flags |= FL_FLY;
runSlidingMonster.yaw_speed = 360;
runSlidingMonster.monsterinfo.attack_state = AS_SLIDING;
runSlidingMonster.monsterinfo.lefty = 1;
runtime.entities[86] = runSlidingMonster;

const aiRunSlideTraceEnds: number[][] = [];
let aiRunSlideTraceCount = 0;
runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => {
    aiRunSlideTraceCount += 1;
    if (aiRunSlideTraceCount > 1) {
      aiRunSlideTraceEnds.push(cleanVecForAssert(end));
    }
    return {
      allsolid: false,
      startsolid: false,
      fraction: aiRunSlideTraceCount === 1 ? 0 : 1,
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
ai_run(runSlidingMonster, 12, runtime);
assert.deepEqual(aiRunSlideTraceEnds, [[0, 12, 0]], "ai_run must delegate AS_SLIDING to ai_run_slide after ai_checkattack returns false");

const visibleRunEnemy = createPointEntity(160, 0, 0, 88);
visibleRunEnemy.viewheight = 22;
visibleRunEnemy.light_level = 64;
visibleRunEnemy.absmin = [144, -16, -24];
visibleRunEnemy.absmax = [176, 16, 32];
runtime.entities[88] = visibleRunEnemy;

const visibleRunner = createRuntimeEntity({ classname: "monster_visible_runner" }, 89);
visibleRunner.inuse = true;
visibleRunner.enemy = visibleRunEnemy;
visibleRunner.goalentity = visibleRunEnemy;
visibleRunner.health = 100;
visibleRunner.viewheight = 25;
visibleRunner.groundentity = createPointEntity(0, 0, -1, 90);
visibleRunner.mins = [-16, -16, -24];
visibleRunner.maxs = [16, 16, 32];
visibleRunner.absmin = [-16, -16, -24];
visibleRunner.absmax = [16, 16, 32];
visibleRunner.yaw_speed = 360;
visibleRunner.monsterinfo.aiflags = AI_LOST_SIGHT;
visibleRunner.monsterinfo.checkattack = () => false;
runtime.entities[89] = visibleRunner;
runtime.collision = createClearVisibilityCollision();
ai_run(visibleRunner, 0, runtime);
assert.equal((visibleRunner.monsterinfo.aiflags & AI_LOST_SIGHT) === 0, true, "ai_run must clear AI_LOST_SIGHT when enemy_vis is cached true");
assert.deepEqual(visibleRunner.monsterinfo.last_sighting, visibleRunEnemy.s.origin, "ai_run must refresh last_sighting while enemy is visible");
assert.equal(visibleRunner.monsterinfo.trail_time, runtime.time, "ai_run must stamp trail_time when enemy is visible");

const blockedCoopEnemy = createPointEntity(320, 0, 0, 91);
blockedCoopEnemy.viewheight = 22;
runtime.entities[91] = blockedCoopEnemy;

const coopPlayer = createRuntimeEntity({ classname: "player" }, 92);
attachGameClient(coopPlayer);
coopPlayer.inuse = true;
coopPlayer.health = 100;
coopPlayer.s.origin = [96, 0, 0];
coopPlayer.origin = [96, 0, 0];
coopPlayer.viewheight = 22;
coopPlayer.light_level = 64;
runtime.entities[92] = coopPlayer;

const coopRunner = createRuntimeEntity({ classname: "monster_coop_runner" }, 93);
coopRunner.inuse = true;
coopRunner.enemy = blockedCoopEnemy;
coopRunner.health = 100;
coopRunner.viewheight = 25;
coopRunner.s.angles = [0, 0, 0];
coopRunner.angles = [0, 0, 0];
let coopRunCalls = 0;
coopRunner.monsterinfo.run = () => {
  coopRunCalls += 1;
};
runtime.entities[93] = coopRunner;

runtime.coop = true;
runtime.sight_entity = null;
runtime.sight_entity_framenum = 0;
runtime.sight_client = coopPlayer;
runtime.sound_entity = null;
runtime.sound_entity_framenum = 0;
runtime.sound2_entity = null;
runtime.sound2_entity_framenum = 0;
runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => ({
    allsolid: false,
    startsolid: false,
    fraction: end[0] === blockedCoopEnemy.s.origin[0] ? 0 : 1,
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
ai_run(coopRunner, 0, runtime);
assert.equal(coopRunner.enemy, coopPlayer, "ai_run coop branch must reacquire a visible alternate player with FindTarget");
assert.equal(coopRunner.goalentity, coopPlayer, "ai_run coop FindTarget path must hunt the reacquired player");
assert.equal(coopRunCalls, 1, "ai_run coop FindTarget path must enter run state and return");

const expiredSearchEnemy = createPointEntity(240, 0, 0, 94);
expiredSearchEnemy.viewheight = 22;
runtime.entities[94] = expiredSearchEnemy;

const expiredSearchRunner = createRuntimeEntity({ classname: "monster_expired_search" }, 95);
expiredSearchRunner.inuse = true;
expiredSearchRunner.enemy = expiredSearchEnemy;
expiredSearchRunner.goalentity = expiredSearchEnemy;
expiredSearchRunner.health = 100;
expiredSearchRunner.viewheight = 25;
expiredSearchRunner.groundentity = createPointEntity(0, 0, -1, 96);
expiredSearchRunner.mins = [-16, -16, -24];
expiredSearchRunner.maxs = [16, 16, 32];
expiredSearchRunner.absmin = [-16, -16, -24];
expiredSearchRunner.absmax = [16, 16, 32];
expiredSearchRunner.yaw_speed = 360;
expiredSearchRunner.monsterinfo.search_time = runtime.time - 21;
runtime.entities[95] = expiredSearchRunner;

runtime.coop = false;
runtime.sight_client = null;
runtime.collision = createBlockedVisibilityCollision();
ai_run(expiredSearchRunner, 0, runtime);
assert.equal(expiredSearchRunner.monsterinfo.search_time, 0, "ai_run must clear expired search_time after moving to goal");
assert.equal((expiredSearchRunner.monsterinfo.aiflags & AI_LOST_SIGHT) === 0, true, "ai_run search timeout must return before starting lost-sight pursuit");

const deadEnemy = createRuntimeEntity({ classname: "dead_enemy" }, 21);
deadEnemy.inuse = true;
deadEnemy.health = 0;
runtime.entities[21] = deadEnemy;

const oldEnemy = createRuntimeEntity({ classname: "player" }, 22);
attachGameClient(oldEnemy);
oldEnemy.inuse = true;
oldEnemy.health = 100;
oldEnemy.s.origin = [80, 0, 0];
oldEnemy.origin = [80, 0, 0];
runtime.entities[22] = oldEnemy;

const monsterRecovering = createRuntimeEntity({ classname: "monster_recovering" }, 23);
monsterRecovering.inuse = true;
monsterRecovering.enemy = deadEnemy;
monsterRecovering.oldenemy = oldEnemy;
let recoveringRunCalls = 0;
monsterRecovering.monsterinfo.run = () => {
  recoveringRunCalls += 1;
};
runtime.entities[23] = monsterRecovering;

assert.equal(ai_checkattack(monsterRecovering, 0, runtime), false, "ai_checkattack oldenemy recovery return mismatch");
assert.equal(monsterRecovering.enemy, oldEnemy, "ai_checkattack must fall back to oldenemy");
assert.equal(monsterRecovering.oldenemy, null, "ai_checkattack must clear oldenemy after reuse");
assert.equal(monsterRecovering.goalentity, oldEnemy, "ai_checkattack must hunt recovered enemy");
assert.equal(recoveringRunCalls, 1, "ai_checkattack must restart run on recovered enemy");

const combatPointMonster = createRuntimeEntity({ classname: "monster_combat_point" }, 27);
combatPointMonster.inuse = true;
combatPointMonster.enemy = oldEnemy;
combatPointMonster.goalentity = createPointEntity(120, 0, 0, 28);
combatPointMonster.monsterinfo.aiflags |= AI_COMBAT_POINT;
runtime.entities[27] = combatPointMonster;
assert.equal(ai_checkattack(combatPointMonster, 0, runtime), false, "ai_checkattack must not fire while moving to a combat point");

const soundGoal = createPointEntity(20, 20, 0, 29);
runtime.entities[29] = soundGoal;

const freshSoundMonster = createRuntimeEntity({ classname: "monster_fresh_sound" }, 30);
freshSoundMonster.inuse = true;
freshSoundMonster.enemy = noiseTarget;
freshSoundMonster.goalentity = noiseTarget;
freshSoundMonster.movetarget = soundGoal;
freshSoundMonster.monsterinfo.aiflags |= AI_SOUND_TARGET | AI_STAND_GROUND | AI_TEMP_STAND_GROUND;
noiseTarget.teleport_time = runtime.time - 4;
runtime.entities[30] = freshSoundMonster;
assert.equal(ai_checkattack(freshSoundMonster, 0, runtime), false, "ai_checkattack must keep chasing a fresh sound target");
assert.equal(freshSoundMonster.show_hostile, runtime.time + 1, "fresh sound target must keep monster hostile");
assert.equal(freshSoundMonster.goalentity, noiseTarget, "fresh sound target must preserve goalentity");

const staleSoundMonster = createRuntimeEntity({ classname: "monster_stale_sound" }, 31);
staleSoundMonster.inuse = true;
staleSoundMonster.enemy = noiseTarget;
staleSoundMonster.goalentity = noiseTarget;
staleSoundMonster.movetarget = soundGoal;
staleSoundMonster.monsterinfo.aiflags |= AI_SOUND_TARGET | AI_STAND_GROUND | AI_TEMP_STAND_GROUND;
noiseTarget.teleport_time = runtime.time - 6;
runtime.entities[31] = staleSoundMonster;
assert.equal(ai_checkattack(staleSoundMonster, 0, runtime), true, "ai_checkattack must resolve a stale sound target as dead/no target");
assert.equal(staleSoundMonster.goalentity, soundGoal, "stale sound target must restore movetarget goal");
assert.equal((staleSoundMonster.monsterinfo.aiflags & AI_SOUND_TARGET) === 0, true, "stale sound target must clear AI_SOUND_TARGET");
assert.equal((staleSoundMonster.monsterinfo.aiflags & AI_STAND_GROUND) === 0, true, "stale temp stand ground must clear AI_STAND_GROUND");
assert.equal((staleSoundMonster.monsterinfo.aiflags & AI_TEMP_STAND_GROUND) === 0, true, "stale temp stand ground must clear AI_TEMP_STAND_GROUND");

const medicRecovered = createRuntimeEntity({ classname: "monster_medic_recovered" }, 36);
medicRecovered.inuse = true;
medicRecovered.enemy = oldEnemy;
medicRecovered.monsterinfo.aiflags |= AI_MEDIC;
let medicStandCalls = 0;
medicRecovered.monsterinfo.stand = () => {
  medicStandCalls += 1;
};
runtime.entities[36] = medicRecovered;
assert.equal(ai_checkattack(medicRecovered, 0, runtime), true, "AI_MEDIC must drop a revived enemy target");
assert.equal((medicRecovered.monsterinfo.aiflags & AI_MEDIC) === 0, true, "AI_MEDIC must clear when target is alive again");
assert.equal(medicRecovered.enemy, null, "AI_MEDIC dead-handling must clear the enemy");
assert.equal(medicStandCalls, 1, "AI_MEDIC dead-handling without movetarget must stand");
assert.equal(medicRecovered.monsterinfo.pausetime, runtime.time + 100000000, "dead-handling stand path must set pausetime");

const brutalEnemy = createRuntimeEntity({ classname: "brutal_enemy" }, 37);
brutalEnemy.inuse = true;
brutalEnemy.health = -79;
brutalEnemy.s.origin = [80, 0, 0];
brutalEnemy.origin = [80, 0, 0];
runtime.entities[37] = brutalEnemy;
const brutalMonster = createRuntimeEntity({ classname: "monster_brutal" }, 38);
brutalMonster.inuse = true;
brutalMonster.enemy = brutalEnemy;
brutalMonster.monsterinfo.aiflags |= AI_BRUTAL;
runtime.entities[38] = brutalMonster;
runtime.collision = createBlockedVisibilityCollision();
assert.equal(ai_checkattack(brutalMonster, 0, runtime), false, "AI_BRUTAL must keep attacking corpses above the gib threshold");
assert.equal(brutalMonster.enemy, brutalEnemy, "AI_BRUTAL must preserve a corpse above the gib threshold as enemy");

brutalEnemy.health = -80;
const brutalRetreatGoal = createPointEntity(10, 30, 0, 39);
brutalMonster.movetarget = brutalRetreatGoal;
let brutalWalkCalls = 0;
brutalMonster.monsterinfo.walk = () => {
  brutalWalkCalls += 1;
};
runtime.entities[39] = brutalRetreatGoal;
assert.equal(ai_checkattack(brutalMonster, 0, runtime), true, "AI_BRUTAL must drop corpses at the gib threshold");
assert.equal(brutalMonster.enemy, null, "AI_BRUTAL gib-threshold dead-handling must clear the enemy");
assert.equal(brutalMonster.goalentity, brutalRetreatGoal, "dead-handling with movetarget must restore goalentity");
assert.equal(brutalWalkCalls, 1, "dead-handling with movetarget must walk");

const lostSightEnemy = createRuntimeEntity({ classname: "player" }, 24);
attachGameClient(lostSightEnemy);
lostSightEnemy.inuse = true;
lostSightEnemy.health = 100;
lostSightEnemy.s.origin = [200, 0, 0];
lostSightEnemy.origin = [200, 0, 0];
lostSightEnemy.viewheight = 22;
lostSightEnemy.light_level = 64;
runtime.entities[24] = lostSightEnemy;

const pursuingMonster = createRuntimeEntity({ classname: "monster_pursuer" }, 25);
pursuingMonster.inuse = true;
pursuingMonster.enemy = lostSightEnemy;
pursuingMonster.monsterinfo.last_sighting = [...lostSightEnemy.s.origin];
pursuingMonster.groundentity = createPointEntity(0, 0, -1, 26);
pursuingMonster.mins = [-16, -16, -24];
pursuingMonster.maxs = [16, 16, 32];
runtime.entities[25] = pursuingMonster;

let pursuitTraceCall = 0;
runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => {
    pursuitTraceCall += 1;
    const blockedVisibility = pursuitTraceCall === 1;
    return {
      allsolid: false,
      startsolid: false,
      fraction: blockedVisibility ? 0 : 1,
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
      ent: blockedVisibility ? null : lostSightEnemy
    };
  },
  pointcontents: () => 0
};

ai_run(pursuingMonster, 0, runtime);
assert.equal((pursuingMonster.monsterinfo.aiflags & AI_LOST_SIGHT) !== 0, true, "ai_run must mark lost sight");
assert.equal((pursuingMonster.monsterinfo.aiflags & AI_PURSUIT_LAST_SEEN) !== 0, true, "ai_run must mark pursuit last seen");
assert.deepEqual(pursuingMonster.monsterinfo.last_sighting, lostSightEnemy.s.origin, "ai_run must record last seen position");
assert.equal(pursuingMonster.goalentity, null, "ai_run must restore original goalentity after temp pursuit goal");

runtime.playerTrail.trail_active = true;
runtime.playerTrail.trail = [];
for (let index = 0; index < 8; index += 1) {
  const marker = createRuntimeEntity({ classname: "player_trail" }, 40 + index);
  marker.inuse = true;
  marker.timestamp = index + 1;
  marker.s.origin = [100 + (index * 10), 5, 0];
  marker.origin = [...marker.s.origin];
  marker.s.angles[1] = 90;
  marker.angles[1] = 90;
  runtime.playerTrail.trail.push(marker);
}
runtime.playerTrail.trail_head = 0;

const pursueNextMonster = createRuntimeEntity({ classname: "monster_pursue_next" }, 60);
pursueNextMonster.inuse = true;
pursueNextMonster.enemy = lostSightEnemy;
pursueNextMonster.groundentity = createPointEntity(0, 0, -1, 61);
pursueNextMonster.mins = [-16, -16, -24];
pursueNextMonster.maxs = [16, 16, 32];
pursueNextMonster.monsterinfo.trail_time = 3;
pursueNextMonster.monsterinfo.last_sighting = [10, 0, 0];
pursueNextMonster.monsterinfo.aiflags = AI_LOST_SIGHT | AI_PURSUIT_LAST_SEEN | AI_PURSUE_NEXT;
runtime.entities[60] = pursueNextMonster;

let pursueNextTraceCall = 0;
runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => {
    pursueNextTraceCall += 1;
    const blockedEnemySight = pursueNextTraceCall === 1;
    return {
      allsolid: false,
      startsolid: false,
      fraction: blockedEnemySight ? 0 : 1,
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

ai_run(pursueNextMonster, 0, runtime);
assert.equal((pursueNextMonster.monsterinfo.aiflags & AI_PURSUE_NEXT) === 0, true, "ai_run must clear AI_PURSUE_NEXT after consuming it");
assert.equal((pursueNextMonster.monsterinfo.aiflags & AI_PURSUIT_LAST_SEEN) === 0, true, "ai_run must clear AI_PURSUIT_LAST_SEEN after first trail pick");
assert.equal(pursueNextMonster.monsterinfo.trail_time, 4, "ai_run must adopt picked trail marker timestamp");
assert.deepEqual(pursueNextMonster.monsterinfo.last_sighting, [130, 5, 0], "ai_run must adopt first eligible trail marker");
assert.equal(pursueNextMonster.ideal_yaw, 90, "ai_run must align yaw to picked trail marker");

const pursueTempMonster = createRuntimeEntity({ classname: "monster_pursue_temp" }, 62);
pursueTempMonster.inuse = true;
pursueTempMonster.enemy = lostSightEnemy;
pursueTempMonster.groundentity = createPointEntity(0, 0, -1, 63);
pursueTempMonster.mins = [-16, -16, -24];
pursueTempMonster.maxs = [16, 16, 32];
pursueTempMonster.monsterinfo.saved_goal = [300, 40, 0];
pursueTempMonster.monsterinfo.last_sighting = [120, 0, 0];
pursueTempMonster.monsterinfo.aiflags = AI_LOST_SIGHT | AI_PURSUE_NEXT | AI_PURSUE_TEMP;
runtime.entities[62] = pursueTempMonster;

runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => {
    const blockedEnemySight = end[0] === lostSightEnemy.s.origin[0] && end[1] === lostSightEnemy.s.origin[1];
    return {
      allsolid: false,
      startsolid: false,
      fraction: blockedEnemySight ? 0 : 1,
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

ai_run(pursueTempMonster, 0, runtime);
assert.equal((pursueTempMonster.monsterinfo.aiflags & AI_PURSUE_TEMP) === 0, true, "ai_run must clear AI_PURSUE_TEMP after restoring saved goal");
assert.deepEqual(pursueTempMonster.monsterinfo.last_sighting, [300, 40, 0], "ai_run must restore saved_goal when retrying original path");

const pursueLeftMonster = createRuntimeEntity({ classname: "monster_adjust_left" }, 64);
pursueLeftMonster.inuse = true;
pursueLeftMonster.enemy = lostSightEnemy;
pursueLeftMonster.groundentity = createPointEntity(0, 0, -1, 65);
pursueLeftMonster.mins = [-16, -16, -24];
pursueLeftMonster.maxs = [16, 16, 32];
pursueLeftMonster.monsterinfo.last_sighting = [100, 0, 0];
runtime.entities[64] = pursueLeftMonster;

let leftAdjustTraceCall = 0;
runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => {
    leftAdjustTraceCall += 1;
    let fraction = 1;
    if (leftAdjustTraceCall === 1) {
      fraction = 0;
    } else if (leftAdjustTraceCall === 2) {
      fraction = 0.5;
    } else if (leftAdjustTraceCall === 3) {
      fraction = 0.9;
    } else if (leftAdjustTraceCall === 4) {
      fraction = 0.2;
    }

    return {
      allsolid: false,
      startsolid: false,
      fraction,
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

ai_run(pursueLeftMonster, 0, runtime);
assert.equal((pursueLeftMonster.monsterinfo.aiflags & AI_PURSUE_TEMP) !== 0, true, "ai_run must mark temporary pursuit goal for left adjustment");
assert.deepEqual(pursueLeftMonster.monsterinfo.saved_goal, [100, 0, 0], "ai_run must save original goal before left adjustment");
assert.equal(pursueLeftMonster.monsterinfo.last_sighting[1] > 0, true, "ai_run left adjustment must steer to positive Y side");

const pursueRightMonster = createRuntimeEntity({ classname: "monster_adjust_right" }, 66);
pursueRightMonster.inuse = true;
pursueRightMonster.enemy = lostSightEnemy;
pursueRightMonster.groundentity = createPointEntity(0, 0, -1, 67);
pursueRightMonster.mins = [-16, -16, -24];
pursueRightMonster.maxs = [16, 16, 32];
pursueRightMonster.monsterinfo.last_sighting = [100, 0, 0];
runtime.entities[66] = pursueRightMonster;

let rightAdjustTraceCall = 0;
runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => {
    rightAdjustTraceCall += 1;
    let fraction = 1;
    if (rightAdjustTraceCall === 1) {
      fraction = 0;
    } else if (rightAdjustTraceCall === 2) {
      fraction = 0.5;
    } else if (rightAdjustTraceCall === 3) {
      fraction = 0.2;
    } else if (rightAdjustTraceCall === 4) {
      fraction = 0.9;
    }

    return {
      allsolid: false,
      startsolid: false,
      fraction,
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

ai_run(pursueRightMonster, 0, runtime);
assert.equal((pursueRightMonster.monsterinfo.aiflags & AI_PURSUE_TEMP) !== 0, true, "ai_run must mark temporary pursuit goal for right adjustment");
assert.deepEqual(pursueRightMonster.monsterinfo.saved_goal, [100, 0, 0], "ai_run must save original goal before right adjustment");
assert.equal(pursueRightMonster.monsterinfo.last_sighting[1] < 0, true, "ai_run right adjustment must steer to negative Y side");

const attackEnemy = createPointEntity(60, 0, 0, 70);
attackEnemy.viewheight = 22;
runtime.entities[70] = attackEnemy;

const meleeMonster = createRuntimeEntity({ classname: "monster_melee" }, 71);
meleeMonster.inuse = true;
meleeMonster.enemy = attackEnemy;
meleeMonster.health = 100;
meleeMonster.viewheight = 25;
meleeMonster.monsterinfo.checkattack = M_CheckAttack;
let meleeCalls = 0;
meleeMonster.monsterinfo.melee = () => {
  meleeCalls += 1;
};
runtime.entities[71] = meleeMonster;

runtime.skill = 1;
runtime.collision = createClearAttackCollision(attackEnemy);
assert.equal(ai_checkattack(meleeMonster, 0, runtime), true, "ai_checkattack must select melee in melee range");
assert.equal(meleeMonster.monsterinfo.attack_state, AS_MELEE, "M_CheckAttack must set AS_MELEE when melee callback exists");
ai_run(meleeMonster, 0, runtime);
assert.equal(meleeCalls, 1, "ai_run must execute selected melee attack callback");
assert.equal(meleeMonster.monsterinfo.attack_state, AS_STRAIGHT, "ai_run_melee must restore AS_STRAIGHT after firing");

meleeMonster.monsterinfo.attack_state = AS_MELEE;
meleeMonster.s.angles[1] = 90;
meleeMonster.angles[1] = 90;
meleeMonster.yaw_speed = 10;
ai_run_melee(meleeMonster, runtime);
assert.ok(Math.abs(meleeMonster.s.angles[1] - 80) < 0.01, "ai_run_melee must turn toward enemy_yaw before checking facing");
assert.equal(meleeCalls, 1, "ai_run_melee must not fire until FacingIdeal passes");
assert.equal(meleeMonster.monsterinfo.attack_state, AS_MELEE, "ai_run_melee must keep AS_MELEE while still turning");
meleeMonster.monsterinfo.attack_state = AS_STRAIGHT;

let attackTraceStart: number[] | null = null;
let attackTraceMins: number[] | null = null;
let attackTraceMaxs: number[] | null = null;
let attackTraceEnd: number[] | null = null;
let attackTracePassEntity: unknown = null;
let attackTraceMask = 0;
runtime.collision = {
  world: {} as never,
  trace: (start, mins, maxs, end, passedict, contentmask) => {
    attackTraceStart = [...start];
    attackTraceMins = [...mins];
    attackTraceMaxs = [...maxs];
    attackTraceEnd = [...end];
    attackTracePassEntity = passedict;
    attackTraceMask = contentmask;
    return makeTraceResult(end, attackEnemy);
  },
  pointcontents: () => 0
};
assert.equal(ai_checkattack(meleeMonster, 0, runtime), true, "M_CheckAttack must allow a clear attack trace");
assert.deepEqual(attackTraceStart, [0, 0, 25], "M_CheckAttack trace must start at monster eye position");
assert.deepEqual(attackTraceMins, [0, 0, 0], "M_CheckAttack trace must use null-equivalent mins");
assert.deepEqual(attackTraceMaxs, [0, 0, 0], "M_CheckAttack trace must use null-equivalent maxs");
assert.deepEqual(attackTraceEnd, [60, 0, 22], "M_CheckAttack trace must end at enemy eye position");
assert.equal(attackTracePassEntity, meleeMonster, "M_CheckAttack trace must pass the attacker as ignored entity");
assert.equal(
  attackTraceMask,
  CONTENTS_SOLID | CONTENTS_MONSTER | CONTENTS_SLIME | CONTENTS_LAVA | CONTENTS_WINDOW,
  "M_CheckAttack trace mask mismatch"
);
meleeMonster.monsterinfo.attack_state = AS_STRAIGHT;

const blocker = createPointEntity(30, 0, 0, 75);
runtime.entities[75] = blocker;
runtime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => makeTraceResult(end, blocker),
  pointcontents: () => 0
};
assert.equal(ai_checkattack(meleeMonster, 0, runtime), false, "M_CheckAttack must reject blocked attack traces");

const missileEnemy = createPointEntity(200, 0, 0, 72);
missileEnemy.viewheight = 22;
runtime.entities[72] = missileEnemy;

const missileMonster = createRuntimeEntity({ classname: "monster_missile" }, 73);
missileMonster.inuse = true;
missileMonster.enemy = missileEnemy;
missileMonster.health = 100;
missileMonster.viewheight = 25;
missileMonster.monsterinfo.checkattack = M_CheckAttack;
let missileCalls = 0;
missileMonster.monsterinfo.attack = () => {
  missileCalls += 1;
};
runtime.entities[73] = missileMonster;

const originalRandom = Math.random;
try {
  Math.random = () => 0;
  runtime.collision = createClearAttackCollision(missileEnemy);
  assert.equal(ai_checkattack(missileMonster, 0, runtime), true, "ai_checkattack must select missile when chance passes");
  assert.equal(missileMonster.monsterinfo.attack_state, AS_MISSILE, "M_CheckAttack must set AS_MISSILE after a passed missile chance");
  ai_run(missileMonster, 0, runtime);
  assert.equal(missileCalls, 1, "ai_run must execute selected missile attack callback");
  assert.equal(missileMonster.monsterinfo.attack_state, AS_STRAIGHT, "ai_run_missile must restore AS_STRAIGHT after firing");

  missileMonster.monsterinfo.attack_state = AS_MISSILE;
  missileMonster.s.angles[1] = 90;
  missileMonster.angles[1] = 90;
  missileMonster.yaw_speed = 10;
  ai_run_missile(missileMonster, runtime);
  assert.ok(Math.abs(missileMonster.s.angles[1] - 80) < 0.01, "ai_run_missile must turn toward enemy_yaw before checking facing");
  assert.equal(missileCalls, 1, "ai_run_missile must not fire until FacingIdeal passes");
  assert.equal(missileMonster.monsterinfo.attack_state, AS_MISSILE, "ai_run_missile must keep AS_MISSILE while still turning");

  const slidingMonster = createRuntimeEntity({ classname: "monster_slider" }, 77);
  slidingMonster.inuse = true;
  slidingMonster.enemy = missileEnemy;
  slidingMonster.health = 100;
  slidingMonster.viewheight = 25;
  slidingMonster.flags |= FL_FLY;
  slidingMonster.yaw_speed = 360;
  slidingMonster.monsterinfo.attack_state = AS_SLIDING;
  slidingMonster.monsterinfo.lefty = 1;
  runtime.entities[77] = slidingMonster;

  const slideTraceEnds: number[][] = [];
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => {
      slideTraceEnds.push(cleanVecForAssert(end));
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
    },
    pointcontents: () => 0
  };
  ai_run_slide(slidingMonster, 10, runtime);
  assert.deepEqual(slideTraceEnds, [[0, 10, 0]], "ai_run_slide lefty path must try ideal_yaw + 90 first");
  assert.equal(slidingMonster.monsterinfo.lefty, 1, "ai_run_slide must keep lefty when the first strafe succeeds");

  slidingMonster.s.origin = [0, 0, 0];
  slidingMonster.origin = [0, 0, 0];
  slidingMonster.monsterinfo.lefty = 0;
  slideTraceEnds.length = 0;
  let slideTraceCount = 0;
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => {
      slideTraceCount += 1;
      slideTraceEnds.push(cleanVecForAssert(end));
      return {
        allsolid: false,
        startsolid: false,
        fraction: slideTraceCount <= 2 ? 0 : 1,
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
  ai_run_slide(slidingMonster, 10, runtime);
  assert.deepEqual(slideTraceEnds, [[0, -10, 0], [0, -10, 0], [0, 10, 0]], "ai_run_slide must retry the opposite strafe after a blocked first move");
  assert.equal(slidingMonster.monsterinfo.lefty, 1, "ai_run_slide must flip lefty after a blocked first strafe");

  missileMonster.monsterinfo.attack_state = AS_STRAIGHT;
  missileMonster.monsterinfo.attack_finished = runtime.time + 1;
  assert.equal(ai_checkattack(missileMonster, 0, runtime), false, "M_CheckAttack must respect attack_finished cooldown");
  assert.equal(missileMonster.monsterinfo.attack_state, AS_STRAIGHT, "cooldown must not change attack_state");

  const flyingMonster = createRuntimeEntity({ classname: "monster_flyer" }, 74);
  flyingMonster.inuse = true;
  flyingMonster.enemy = missileEnemy;
  flyingMonster.health = 100;
  flyingMonster.viewheight = 25;
  flyingMonster.flags |= FL_FLY;
  flyingMonster.monsterinfo.checkattack = M_CheckAttack;
  flyingMonster.monsterinfo.attack = () => {};
  runtime.entities[74] = flyingMonster;

  runtime.collision = createClearAttackCollision(missileEnemy);
  Math.random = () => 0.2;
  assert.equal(ai_checkattack(flyingMonster, 0, runtime), false, "flying monsters must keep moving when missile chance fails");
  assert.equal(flyingMonster.monsterinfo.attack_state, AS_SLIDING, "failed flying attack chance may enter AS_SLIDING");

  const chanceMonster = createRuntimeEntity({ classname: "monster_chance" }, 76);
  chanceMonster.inuse = true;
  chanceMonster.enemy = missileEnemy;
  chanceMonster.health = 100;
  chanceMonster.viewheight = 25;
  chanceMonster.monsterinfo.checkattack = M_CheckAttack;
  chanceMonster.monsterinfo.attack = () => {};
  runtime.entities[76] = chanceMonster;
  runtime.collision = createClearAttackCollision(missileEnemy);
  runtime.skill = 1;
  chanceMonster.monsterinfo.attack_finished = 0;
  chanceMonster.monsterinfo.attack_state = AS_STRAIGHT;

  Math.random = () => 0.1;
  assert.equal(ai_checkattack(chanceMonster, 0, runtime), false, "RANGE_NEAR missile chance must use a strict less-than test");
  assert.equal(chanceMonster.monsterinfo.attack_state, AS_STRAIGHT, "failed grounded missile chance must keep AS_STRAIGHT");

  chanceMonster.monsterinfo.attack_finished = 0;
  Math.random = () => 0.099;
  assert.equal(ai_checkattack(chanceMonster, 0, runtime), true, "RANGE_NEAR missile chance must pass below 0.1");
  assert.equal(chanceMonster.monsterinfo.attack_state, AS_MISSILE, "passed RANGE_NEAR chance must select missile");

  chanceMonster.monsterinfo.attack_state = AS_STRAIGHT;
  chanceMonster.monsterinfo.attack_finished = 0;
  chanceMonster.monsterinfo.aiflags |= AI_STAND_GROUND;
  runtime.skill = 0;
  Math.random = () => 0.2;
  assert.equal(ai_checkattack(chanceMonster, 0, runtime), false, "easy stand-ground missile chance must be halved to 0.2");

  chanceMonster.monsterinfo.attack_finished = 0;
  runtime.skill = 2;
  Math.random = () => 0.79;
  assert.equal(ai_checkattack(chanceMonster, 0, runtime), true, "hard stand-ground missile chance must double to 0.8");
} finally {
  Math.random = originalRandom;
}

console.log("quake2-g-ai: ok");

function createPointEntity(x: number, y: number, z: number, index: number) {
  const entity = createRuntimeEntity({}, index);
  entity.s.origin = [x, y, z];
  entity.origin = [x, y, z];
  entity.viewheight = 0;
  entity.inuse = true;
  entity.health = 1;
  entity.light_level = 64;
  return entity;
}

function createFindTargetMonster(index: number) {
  const entity = createRuntimeEntity({ classname: "monster_findtarget" }, index);
  entity.inuse = true;
  entity.health = 50;
  entity.viewheight = 25;
  entity.s.origin = [0, 0, 0];
  entity.origin = [0, 0, 0];
  entity.s.angles = [0, 0, 0];
  entity.angles = [0, 0, 0];
  entity.yaw_speed = 20;
  entity.monsterinfo.run = () => {};
  runtime.entities[index] = entity;
  return entity;
}

function createClearVisibilityCollision() {
  return {
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
}

function createBlockedVisibilityCollision() {
  return {
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
}

function createClearAttackCollision(target: ReturnType<typeof createPointEntity>) {
  return {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => makeTraceResult(end, target),
    pointcontents: () => 0
  };
}

function makeTraceResult(end: readonly number[], ent: ReturnType<typeof createPointEntity>) {
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
    ent
  };
}

function cleanVecForAssert(value: readonly number[]) {
  return value.map((component) => Math.abs(component) < 1e-9 ? 0 : component);
}
