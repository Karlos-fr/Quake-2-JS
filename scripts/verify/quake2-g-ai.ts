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
  infront,
  range,
  visible
} from "../../packages/game/src/g_ai.js";
import {
  AI_COMBAT_POINT,
  AI_LOST_SIGHT,
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
