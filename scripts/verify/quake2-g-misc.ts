/**
 * File: quake2-g-misc.ts
 * Purpose: Verify the gameplay-side world helper and specialty entity behaviors ported from `game/g_misc.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for `g_misc.ts`.
 *
 * Dependencies:
 * - packages/game
 */

import { strict as assert } from "node:assert";
import { CS_LIGHTS, EF_ANIM_ALL, EF_ANIM_ALLFAST, EF_FLIES, EF_GIB, MASK_MONSTERSOLID, RF_FRAMELERP, RF_TRANSLUCENT, entity_event_t, multicast_t, PMF_TIME_TELEPORT, temp_event_t, type cplane_t, type trace_t } from "../../packages/qcommon/src/index.js";

import {
  SP_func_explosive,
  SP_func_clock,
  SP_light,
  SOLID_BBOX,
  SOLID_BSP,
  SOLID_NOT,
  ANIM_DEATH,
  BecomeExplosion1,
  BecomeExplosion2,
  GIB_METALLIC,
  GIB_ORGANIC,
  FRAMETIME,
  MOVETYPE_BOUNCE,
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  MOVETYPE_TOSS,
  SP_info_notnull,
  SP_info_null,
  SP_misc_blackhole,
  SP_misc_easterchick,
  SP_misc_easterchick2,
  SP_misc_eastertank,
  SP_misc_explobox,
  SP_misc_teleporter,
  SP_misc_teleporter_dest,
  SP_path_corner,
  SP_point_combat,
  SP_viewthing,
  SP_target_character,
  SP_target_string,
  SOLID_TRIGGER,
  SVF_NOCLIENT,
  attachGameClient,
  barrel_delay,
  barrel_touch,
  createGameRuntimeFromBspEntities,
  damage_t,
  drainGameConfigstringUpdates,
  drainGameSoundEvents,
  drainGameTempEntityEvents,
  ED_CallSpawn,
  barrel_explode,
  func_explosive_explode,
  func_explosive_spawn,
  func_explosive_use,
  gib_die,
  gib_think,
  gib_touch,
  linkGameEntity,
  misc_blackhole_think,
  misc_easterchick2_think,
  misc_easterchick_think,
  misc_blackhole_use,
  misc_eastertank_think,
  path_corner_touch,
  point_combat_touch,
  runPendingThinks,
  spawnGameEntity,
  target_string_use,
  ThrowDebris,
  ThrowHead,
  ThrowGib,
  TH_viewthing,
  useGameEntity
} from "../../packages/game/src/index.js";
import { SP_func_object, SP_func_wall, func_object_touch, func_object_use, func_wall_use } from "../../packages/game/src/g_misc.js";
import { AI_COMBAT_POINT, AI_NOSTEP, AI_STAND_GROUND, FL_FLY, FL_NO_KNOCKBACK, FL_SWIM } from "../../packages/game/src/g_local.js";
import { ThrowClientHead } from "../../packages/game/src/p_client.js";
import { SVF_MONSTER } from "../../packages/game/src/runtime.js";

main();

function main(): void {
  verifyTeleporterMovesPlayerAndSetsTeleportState();
  verifyPathCornerSpawnSetupAndInvalidFree();
  verifyPathCornerAdvancesMonsterGoal();
  verifyPathCornerPathtargetTeleportAndPauseBranches();
  verifyPointCombatSpawnSetupAndDeathmatchFree();
  verifyPointCombatTouchBranches();
  verifyViewthingSpawnAndThinkLoop();
  verifyInfoNullAndInfoNotnullSpawnMarkers();
  verifyTargetStringMapsFrames();
  verifyFuncClockBootstrapsTargetStringMessage();
  verifyMiscExploboxSpawnsShootableBarrel();
  verifyMiscBlackholeSpawnsLoopsAndFreesOnUse();
  verifyMiscEastertankSpawnsAndLoopsStandFrames();
  verifyMiscEasterchickSpawnsAndLoopsStandFrames();
  verifyMiscEasterchick2SpawnsAndLoopsStandFrames();
  verifyBarrelDelaySchedulesDelayedExplosion();
  verifyBarrelTouchPushesOnlyFromGroundedActors();
  verifyBarrelExplodeThrowsDebrisAndExplosionTempEntities();
  verifyLightWritesSourceConfigstrings();
  verifyFuncWallSpawnAndUseTogglesVisibility();
  verifyFuncObjectSpawnUseReleaseAndCrush();
  verifyFuncExplosiveSpawnsAndExplodesBrushModel();
  verifyFuncExplosiveExplodeMassLimitsTargetsAndFreeBranches();
  verifyGibTypesSelectMovementAndTouchBehavior();
  verifyGibTouchMatchesPlaneGatedSourceBehavior();
  verifyGibThinkAndDieCallbacks();
  verifyThrowHeadConvertsSourceEntityToGib();
  verifyThrowClientHeadConvertsPlayerOrBodyToClientGib();
  verifyThrowDebrisSpawnsDamageableVisibleChunk();
  verifyBecomeExplosionEmitsTempEntityAndFreesSource();

  console.log("quake2-g-misc: ok");
}

function verifyTeleporterMovesPlayerAndSetsTeleportState(): void {
  const runtime = createHarnessRuntime();

  const destination = spawnGameEntity(runtime);
  destination.classname = "misc_teleporter_dest";
  destination.targetname = "exit";
  destination.origin = [100, 200, 300];
  destination.s.origin = [100, 200, 300];
  SP_misc_teleporter_dest(destination, runtime);

  const teleporter = spawnGameEntity(runtime);
  teleporter.classname = "misc_teleporter";
  teleporter.target = "exit";
  teleporter.origin = [0, 0, 0];
  teleporter.s.origin = [0, 0, 0];
  SP_misc_teleporter(teleporter, runtime);

  const trigger = runtime.entities.find((entity) => entity.classname === "teleporter_trigger");
  assert.ok(trigger?.touch, "misc_teleporter must spawn one touch trigger");

  const player = spawnGameEntity(runtime);
  player.classname = "player";
  attachGameClient(player);
  player.client!.resp.cmd_angles = [0, 0, 0];
  player.origin = [10, 20, 30];
  player.s.origin = [10, 20, 30];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  linkGameEntity(runtime, player);

  trigger.touch!(trigger, player, runtime);

  assert.deepEqual(player.origin, [100, 200, 310], "teleporter touch must move player to destination + 10 on Z");
  assert.equal((player.client!.ps.pmove.pm_flags & PMF_TIME_TELEPORT) !== 0, true, "teleporter touch must set PMF_TIME_TELEPORT");
  assert.equal(player.s.event, entity_event_t.EV_PLAYER_TELEPORT, "teleporter touch must emit EV_PLAYER_TELEPORT on the player");
}

function verifyPathCornerSpawnSetupAndInvalidFree(): void {
  const runtime = createHarnessRuntime();

  for (let i = 0; i < 16; i += 1) {
    spawnGameEntity(runtime);
  }

  const invalidCorner = spawnGameEntity(runtime);
  invalidCorner.classname = "path_corner";
  invalidCorner.s.origin = [1, 2, 3];

  SP_path_corner(invalidCorner, runtime);

  assert.equal(invalidCorner.inuse, false, "path_corner without targetname must be freed");
  assert.equal(runtime.logEntries.some((entry) => entry.kind === "warning" && entry.message.includes("path_corner with no targetname at (1 2 3)")), true, "path_corner without targetname must emit the source warning");

  const corner = spawnGameEntity(runtime);
  corner.classname = "path_corner";
  corner.targetname = "corner_a";
  corner.s.origin = [0, 0, 0];
  corner.origin = [0, 0, 0];

  SP_path_corner(corner, runtime);

  assert.equal(corner.solid, SOLID_TRIGGER, "SP_path_corner must create a trigger");
  assert.equal(corner.touch, path_corner_touch, "SP_path_corner must install path_corner_touch");
  assert.deepEqual(corner.mins, [-8, -8, -8], "SP_path_corner must set source mins");
  assert.deepEqual(corner.maxs, [8, 8, 8], "SP_path_corner must set source maxs");
  assert.equal((corner.svflags & SVF_NOCLIENT) !== 0, true, "SP_path_corner must hide the trigger from clients");
  assert.equal(corner.linked, true, "SP_path_corner must link the trigger");
}

function verifyPathCornerAdvancesMonsterGoal(): void {
  const runtime = createHarnessRuntime();

  const nextCorner = spawnGameEntity(runtime);
  nextCorner.classname = "path_corner";
  nextCorner.targetname = "corner_b";
  nextCorner.origin = [128, 0, 0];
  nextCorner.s.origin = [128, 0, 0];
  SP_path_corner(nextCorner, runtime);

  const corner = spawnGameEntity(runtime);
  corner.classname = "path_corner";
  corner.targetname = "corner_a";
  corner.target = "corner_b";
  corner.origin = [0, 0, 0];
  corner.s.origin = [0, 0, 0];
  SP_path_corner(corner, runtime);

  const monster = spawnGameEntity(runtime);
  monster.classname = "monster";
  monster.movetarget = corner;
  monster.s.origin = [0, 0, 0];
  monster.origin = [0, 0, 0];

  path_corner_touch(corner, monster, runtime);

  assert.equal(monster.movetarget, nextCorner, "path_corner touch must advance movetarget to next corner");
  assert.equal(monster.goalentity, nextCorner, "path_corner touch must sync goalentity");
  assert.equal(monster.ideal_yaw, 0, "path_corner touch must compute yaw toward the next goal");
}

function verifyPathCornerPathtargetTeleportAndPauseBranches(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 42;

  const useTarget = spawnGameEntity(runtime);
  useTarget.classname = "target_relay";
  useTarget.targetname = "corner_pathtarget";
  let usedBy: unknown = null;
  useTarget.use = (_self, _other, activator) => {
    usedBy = activator;
  };

  const afterTeleport = spawnGameEntity(runtime);
  afterTeleport.classname = "path_corner";
  afterTeleport.targetname = "after_teleport";
  afterTeleport.s.origin = [96, 32, 0];
  afterTeleport.origin = [96, 32, 0];
  SP_path_corner(afterTeleport, runtime);

  const teleportCorner = spawnGameEntity(runtime);
  teleportCorner.classname = "path_corner";
  teleportCorner.targetname = "teleport_corner";
  teleportCorner.target = "after_teleport";
  teleportCorner.spawnflags = 1;
  teleportCorner.mins = [-8, -8, -24];
  teleportCorner.s.origin = [64, 32, 80];
  teleportCorner.origin = [64, 32, 80];
  SP_path_corner(teleportCorner, runtime);
  teleportCorner.mins = [-8, -8, -24];

  const corner = spawnGameEntity(runtime);
  corner.classname = "path_corner";
  corner.targetname = "corner_a";
  corner.target = "teleport_corner";
  corner.pathtarget = "corner_pathtarget";
  corner.s.origin = [0, 0, 0];
  corner.origin = [0, 0, 0];
  SP_path_corner(corner, runtime);

  const monster = spawnGameEntity(runtime);
  monster.classname = "monster";
  monster.movetarget = corner;
  monster.s.origin = [0, 0, 0];
  monster.origin = [0, 0, 0];
  monster.mins = [-16, -16, -32];

  path_corner_touch(corner, monster, runtime);

  assert.equal(usedBy, monster, "path_corner pathtarget must use targets with the monster as activator");
  assert.equal(corner.target, "teleport_corner", "path_corner pathtarget must restore the saved target");
  assert.deepEqual(monster.s.origin, [64, 32, 88], "TELEPORT path_corner must move monster by next mins and monster mins");
  assert.equal(monster.movetarget, afterTeleport, "TELEPORT path_corner must pick the teleporter corner target afterward");
  assert.equal(monster.goalentity, afterTeleport, "TELEPORT path_corner must sync goalentity after the second pick");
  assert.equal(monster.s.event, entity_event_t.EV_OTHER_TELEPORT, "TELEPORT path_corner must emit EV_OTHER_TELEPORT");

  const waitCorner = spawnGameEntity(runtime);
  waitCorner.classname = "path_corner";
  waitCorner.targetname = "wait_corner";
  waitCorner.wait = 3;
  waitCorner.s.origin = [0, 0, 0];
  waitCorner.origin = [0, 0, 0];
  SP_path_corner(waitCorner, runtime);

  const waitingMonster = spawnGameEntity(runtime);
  waitingMonster.classname = "monster";
  waitingMonster.movetarget = waitCorner;
  let standCalls = 0;
  waitingMonster.monsterinfo.stand = () => {
    standCalls += 1;
  };

  path_corner_touch(waitCorner, waitingMonster, runtime);

  assert.equal(waitingMonster.movetarget, null, "path_corner without target must clear movetarget before wait handling");
  assert.equal(waitingMonster.goalentity, null, "path_corner without target must clear goalentity before wait handling");
  assert.equal(waitingMonster.monsterinfo.pausetime, 45, "wait path_corner must pause until level time plus wait");
  assert.equal(standCalls, 1, "wait path_corner must call monster stand exactly once");

  const stopCorner = spawnGameEntity(runtime);
  stopCorner.classname = "path_corner";
  stopCorner.targetname = "stop_corner";
  stopCorner.s.origin = [0, 0, 0];
  stopCorner.origin = [0, 0, 0];
  SP_path_corner(stopCorner, runtime);

  const stoppingMonster = spawnGameEntity(runtime);
  stoppingMonster.classname = "monster";
  stoppingMonster.movetarget = stopCorner;
  let stopStandCalls = 0;
  stoppingMonster.monsterinfo.stand = () => {
    stopStandCalls += 1;
  };

  path_corner_touch(stopCorner, stoppingMonster, runtime);

  assert.equal(stoppingMonster.movetarget, null, "terminal path_corner must clear movetarget");
  assert.equal(stoppingMonster.goalentity, null, "terminal path_corner must clear goalentity");
  assert.equal(stoppingMonster.monsterinfo.pausetime, 100000042, "terminal path_corner must pause for the original large sentinel");
  assert.equal(stopStandCalls, 1, "terminal path_corner must call monster stand exactly once");
}

function verifyPointCombatTouchBranches(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 12;

  const nextCombat = spawnGameEntity(runtime);
  nextCombat.classname = "point_combat";
  nextCombat.targetname = "next_combat";

  const combat = spawnGameEntity(runtime);
  combat.classname = "point_combat";
  combat.target = "next_combat";

  const monster = spawnGameEntity(runtime);
  monster.classname = "monster";
  monster.movetarget = combat;
  monster.monsterinfo.aiflags = AI_COMBAT_POINT;

  point_combat_touch(combat, monster, runtime);

  assert.equal(monster.target, "next_combat", "point_combat with target must copy target to monster");
  assert.equal(monster.goalentity, nextCombat, "point_combat with target must pick next goalentity");
  assert.equal(monster.movetarget, nextCombat, "point_combat with target must pick next movetarget");
  assert.equal(combat.target, undefined, "point_combat with target must clear self target after picking");

  const missingTarget = spawnGameEntity(runtime);
  missingTarget.classname = "point_combat";
  missingTarget.target = "missing";
  const missingMonster = spawnGameEntity(runtime);
  missingMonster.classname = "monster";
  missingMonster.movetarget = missingTarget;

  point_combat_touch(missingTarget, missingMonster, runtime);

  assert.equal(missingMonster.movetarget, null, "point_combat missing target must fall through cleanup after restoring movetarget to self");
  assert.equal(missingMonster.goalentity, missingMonster.enemy, "point_combat cleanup must restore enemy as goalentity");

  const holdCombat = spawnGameEntity(runtime);
  holdCombat.classname = "point_combat";
  holdCombat.spawnflags = 1;
  const holdMonster = spawnGameEntity(runtime);
  holdMonster.classname = "monster";
  holdMonster.movetarget = holdCombat;
  holdMonster.monsterinfo.aiflags = AI_COMBAT_POINT;
  let standCalls = 0;
  holdMonster.monsterinfo.stand = () => {
    standCalls += 1;
  };

  point_combat_touch(holdCombat, holdMonster, runtime);

  assert.equal(holdMonster.monsterinfo.pausetime, 100000012, "hold point_combat must pause non-swim/fly monsters indefinitely");
  assert.equal((holdMonster.monsterinfo.aiflags & AI_STAND_GROUND) !== 0, true, "hold point_combat must set stand ground");
  assert.equal((holdMonster.monsterinfo.aiflags & AI_COMBAT_POINT) === 0, true, "point_combat cleanup must clear AI_COMBAT_POINT");
  assert.equal(standCalls, 1, "hold point_combat must call stand");

  const swimCombat = spawnGameEntity(runtime);
  swimCombat.classname = "point_combat";
  swimCombat.spawnflags = 1;
  const swimmingMonster = spawnGameEntity(runtime);
  swimmingMonster.classname = "monster";
  swimmingMonster.movetarget = swimCombat;
  swimmingMonster.flags = FL_SWIM | FL_FLY;

  point_combat_touch(swimCombat, swimmingMonster, runtime);

  assert.equal(swimmingMonster.monsterinfo.pausetime, 0, "hold point_combat must not pause swim/fly monsters");

  const relay = spawnGameEntity(runtime);
  relay.classname = "target_relay";
  relay.targetname = "combat_pathtarget";
  let activator: unknown = null;
  relay.use = (_self, _other, useActivator) => {
    activator = useActivator;
  };

  const pathtargetCombat = spawnGameEntity(runtime);
  pathtargetCombat.classname = "point_combat";
  pathtargetCombat.pathtarget = "combat_pathtarget";
  const clientEnemy = spawnGameEntity(runtime);
  clientEnemy.classname = "player";
  attachGameClient(clientEnemy);
  const pathtargetMonster = spawnGameEntity(runtime);
  pathtargetMonster.classname = "monster";
  pathtargetMonster.movetarget = pathtargetCombat;
  pathtargetMonster.enemy = clientEnemy;

  point_combat_touch(pathtargetCombat, pathtargetMonster, runtime);

  assert.equal(activator, clientEnemy, "point_combat pathtarget must prefer client enemy as activator");
  assert.equal(pathtargetCombat.target, undefined, "point_combat pathtarget must restore the saved empty target");
}

function verifyPointCombatSpawnSetupAndDeathmatchFree(): void {
  const runtime = createHarnessRuntime();

  const combat = spawnGameEntity(runtime);
  combat.classname = "point_combat";

  SP_point_combat(combat, runtime);

  assert.equal(combat.solid, SOLID_TRIGGER, "SP_point_combat must create a trigger");
  assert.equal(combat.touch, point_combat_touch, "SP_point_combat must install point_combat_touch");
  assert.deepEqual(combat.mins, [-8, -8, -16], "SP_point_combat mins mismatch");
  assert.deepEqual(combat.maxs, [8, 8, 16], "SP_point_combat maxs mismatch");
  assert.equal(combat.svflags, SVF_NOCLIENT, "SP_point_combat must hide the trigger from clients");
  assert.equal(combat.linked, true, "SP_point_combat must link the trigger into runtime");
  assert.equal(runtime.linkedTriggerEntities.includes(combat), true, "SP_point_combat must expose the trigger to touch queries");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  const deathmatchCombat = spawnFreeableEntity(deathmatchRuntime);
  deathmatchCombat.classname = "point_combat";

  SP_point_combat(deathmatchCombat, deathmatchRuntime);

  assert.equal(deathmatchCombat.inuse, false, "SP_point_combat must free point_combat in deathmatch");
  assert.equal(deathmatchCombat.linked, false, "deathmatch point_combat must not be linked");
}

function verifyViewthingSpawnAndThinkLoop(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 12;

  const viewthing = spawnGameEntity(runtime);
  viewthing.classname = "viewthing";

  SP_viewthing(viewthing, runtime);

  assert.equal(viewthing.movetype, MOVETYPE_NONE, "SP_viewthing must use MOVETYPE_NONE");
  assert.equal(viewthing.solid, SOLID_BBOX, "SP_viewthing must use SOLID_BBOX");
  assert.equal(viewthing.s.renderfx, RF_FRAMELERP, "SP_viewthing must enable RF_FRAMELERP");
  assert.deepEqual(viewthing.mins, [-16, -16, -24], "SP_viewthing mins mismatch");
  assert.deepEqual(viewthing.maxs, [16, 16, 32], "SP_viewthing maxs mismatch");
  assert.equal(runtime.assets.modelPaths[viewthing.s.modelindex - 1], "models/objects/banner/tris.md2", "SP_viewthing must register the banner model");
  assert.equal(viewthing.think, TH_viewthing, "SP_viewthing must install TH_viewthing");
  assert.equal(viewthing.nextthink, 12.5, "SP_viewthing must schedule the first think at source delay");
  assert.equal(viewthing.linked, true, "SP_viewthing must link the debug entity");
  assert.equal(runtime.linkedDynamicBoxEntities.includes(viewthing), true, "SP_viewthing must expose the visible bbox to runtime collision lists");
  assert.equal(runtime.logEntries.some((entry) => entry.kind === "message" && entry.message === "viewthing spawned"), true, "SP_viewthing must preserve the source diagnostic");

  runtime.time = 20;
  viewthing.s.frame = 6;

  TH_viewthing(viewthing, runtime);

  assert.equal(viewthing.s.frame, 0, "TH_viewthing must wrap frames modulo 7");
  assert.equal(viewthing.think, TH_viewthing, "TH_viewthing must keep its think loop installed");
  assert.equal(viewthing.nextthink, 20 + FRAMETIME, "TH_viewthing must schedule the next source frame tick");
}

function verifyInfoNullAndInfoNotnullSpawnMarkers(): void {
  const runtime = createHarnessRuntime();

  const infoNull = spawnFreeableEntity(runtime);
  infoNull.classname = "info_null";
  infoNull.s.origin = [1, 2, 3];
  ED_CallSpawn(infoNull, runtime);
  assert.equal(infoNull.inuse, false, "SP_info_null must immediately free positional marker entities");

  const infoNotnull = spawnGameEntity(runtime);
  infoNotnull.classname = "info_notnull";
  infoNotnull.s.origin = [4, 5, 6];
  ED_CallSpawn(infoNotnull, runtime);
  assert.deepEqual(infoNotnull.absmin, [4, 5, 6], "SP_info_notnull must copy s.origin to absmin");
  assert.deepEqual(infoNotnull.absmax, [4, 5, 6], "SP_info_notnull must copy s.origin to absmax");
  assert.equal(infoNotnull.solid, SOLID_NOT, "SP_info_notnull must remain a non-solid positional marker");
  assert.equal(infoNotnull.linked, false, "SP_info_notnull must not link a visible or touchable entity");

  const directNull = spawnFreeableEntity(runtime);
  directNull.classname = "info_null";
  SP_info_null(directNull, runtime);
  assert.equal(directNull.inuse, false, "direct SP_info_null calls must free the edict");

  const directNotnull = spawnGameEntity(runtime);
  directNotnull.classname = "info_notnull";
  directNotnull.s.origin = [-7, 8, 9];
  directNotnull.absmin = [0, 0, 0];
  directNotnull.absmax = [1, 1, 1];
  SP_info_notnull(directNotnull, runtime);
  assert.deepEqual(directNotnull.absmin, [-7, 8, 9], "direct SP_info_notnull calls must refresh absmin from s.origin");
  assert.deepEqual(directNotnull.absmax, [-7, 8, 9], "direct SP_info_notnull calls must refresh absmax from s.origin");
}

function verifyTargetStringMapsFrames(): void {
  const runtime = createHarnessRuntime();

  const display = spawnGameEntity(runtime);
  display.classname = "target_string";
  display.message = "12:-";
  SP_target_string(display, runtime);

  const char1 = spawnGameEntity(runtime);
  char1.classname = "target_character";
  char1.team = "display";
  char1.count = 1;
  SP_target_character(char1, runtime);

  const char2 = spawnGameEntity(runtime);
  char2.classname = "target_character";
  char2.team = "display";
  char2.count = 2;
  SP_target_character(char2, runtime);

  display.teammaster = char1;
  char1.teamchain = char2;

  target_string_use(display, null, null, runtime);

  assert.equal(char1.s.frame, 1, "target_string must map first digit");
  assert.equal(char2.s.frame, 2, "target_string must map second digit");
}

function verifyFuncClockBootstrapsTargetStringMessage(): void {
  const runtime = createHarnessRuntime();

  const stringTarget = spawnGameEntity(runtime);
  stringTarget.classname = "target_string";
  stringTarget.targetname = "clock_display";
  stringTarget.message = "";
  SP_target_string(stringTarget, runtime);

  const clock = spawnGameEntity(runtime);
  clock.classname = "func_clock";
  clock.target = "clock_display";
  clock.spawnflags = 1;
  clock.style = 1;
  clock.count = 3;
  SP_func_clock(clock, runtime);

  useGameEntity(runtime, clock, null, clock);
  runPendingThinks(runtime, runtime.time + 1);

  assert.ok(stringTarget.message && stringTarget.message.length >= 4, "func_clock must write a formatted target_string message");
}

function verifyMiscExploboxSpawnsShootableBarrel(): void {
  const runtime = createHarnessRuntime();

  const barrel = spawnGameEntity(runtime);
  barrel.classname = "misc_explobox";
  barrel.origin = [64, 32, 16];
  barrel.s.origin = [64, 32, 16];
  SP_misc_explobox(barrel, runtime);

  assert.equal(barrel.model, "models/objects/barrels/tris.md2", "misc_explobox must use the barrel MD2 model");
  assert.equal(runtime.assets.modelPaths[barrel.s.modelindex - 1], "models/objects/barrels/tris.md2", "misc_explobox modelindex must resolve to barrels/tris.md2");
  assert.deepEqual(barrel.mins, [-16, -16, 0], "misc_explobox mins mismatch");
  assert.deepEqual(barrel.maxs, [16, 16, 40], "misc_explobox maxs mismatch");
  assert.equal(barrel.mass, 400, "misc_explobox default mass mismatch");
  assert.equal(barrel.health, 10, "misc_explobox default health mismatch");
  assert.equal(barrel.dmg, 150, "misc_explobox default damage mismatch");
  assert.equal(barrel.takedamage, damage_t.DAMAGE_YES, "misc_explobox must be shootable");
  assert.equal(barrel.die, barrel_delay, "misc_explobox must use barrel_delay as die callback");
  assert.ok(barrel.touch, "misc_explobox must expose barrel_touch");
  assert.ok(barrel.think, "misc_explobox must schedule M_droptofloor");
  assert.equal(runtime.assets.modelPaths.includes("models/objects/debris1/tris.md2"), true, "misc_explobox must precache debris1");
  assert.equal(runtime.assets.modelPaths.includes("models/objects/debris2/tris.md2"), true, "misc_explobox must precache debris2");
  assert.equal(runtime.assets.modelPaths.includes("models/objects/debris3/tris.md2"), true, "misc_explobox must precache debris3");

  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end, passent, mask) => {
      assert.equal(passent, barrel, "misc_explobox droptofloor trace must pass the barrel");
      assert.equal(mask, MASK_MONSTERSOLID, "misc_explobox droptofloor trace mask mismatch");
      return makeTrace({
        fraction: 0.5,
        endpos: [...end],
        ent: runtime.entities[0]!,
        plane: { normal: [0, 0, 1], dist: 0, type: 0, signbits: 0, pad: [0, 0] }
      });
    },
    pointcontents: () => 1
  };
  runPendingThinks(runtime, runtime.time + 2 * FRAMETIME);
  assert.equal(barrel.groundentity, runtime.entities[0], "misc_explobox delayed M_droptofloor must refresh groundentity");

  const custom = spawnGameEntity(runtime);
  custom.classname = "misc_explobox";
  custom.mass = 900;
  custom.health = 25;
  custom.dmg = 300;
  ED_CallSpawn(custom, runtime);
  assert.equal(custom.mass, 900, "misc_explobox must preserve explicit mass");
  assert.equal(custom.health, 25, "misc_explobox must preserve explicit health");
  assert.equal(custom.dmg, 300, "misc_explobox must preserve explicit damage");
  assert.equal(custom.die, barrel_delay, "ED_CallSpawn must dispatch misc_explobox");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  const deathmatchBarrel = spawnFreeableEntity(deathmatchRuntime);
  deathmatchBarrel.classname = "misc_explobox";
  SP_misc_explobox(deathmatchBarrel, deathmatchRuntime);
  assert.equal(deathmatchBarrel.inuse, false, "misc_explobox must be auto-removed in deathmatch");
  assert.equal(deathmatchBarrel.linked, false, "deathmatch misc_explobox must not stay linked");
}

function verifyMiscBlackholeSpawnsLoopsAndFreesOnUse(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 10;

  const blackhole = spawnFreeableEntity(runtime);
  blackhole.classname = "misc_blackhole";
  blackhole.origin = [8, 16, 24];
  blackhole.s.origin = [8, 16, 24];

  SP_misc_blackhole(blackhole, runtime);

  assert.equal(blackhole.movetype, MOVETYPE_NONE, "misc_blackhole must be stationary");
  assert.equal(blackhole.solid, SOLID_NOT, "misc_blackhole must be non-solid");
  assert.deepEqual(blackhole.mins, [-64, -64, 0], "misc_blackhole mins mismatch");
  assert.deepEqual(blackhole.maxs, [64, 64, 8], "misc_blackhole maxs mismatch");
  assert.equal(runtime.assets.modelPaths[blackhole.s.modelindex - 1], "models/objects/black/tris.md2", "misc_blackhole modelindex must resolve to black/tris.md2");
  assert.equal(blackhole.s.renderfx, RF_TRANSLUCENT, "misc_blackhole must be translucent");
  assert.equal(blackhole.use, misc_blackhole_use, "misc_blackhole must install misc_blackhole_use");
  assert.equal(blackhole.think, misc_blackhole_think, "misc_blackhole must install misc_blackhole_think");
  assert.equal(blackhole.nextthink, runtime.time + 2 * FRAMETIME, "misc_blackhole must schedule first think two frames later");
  assert.equal(blackhole.linked, true, "misc_blackhole must be linked for snapshots");

  runPendingThinks(runtime, runtime.time + 2 * FRAMETIME);
  assert.equal(blackhole.s.frame, 1, "misc_blackhole think must advance frame while below 19");
  assert.equal(blackhole.nextthink, runtime.time + FRAMETIME, "misc_blackhole think must reschedule every frame");

  blackhole.s.frame = 18;
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assert.equal(blackhole.s.frame, 0, "misc_blackhole think must wrap frame 18 to 0");
  assert.equal(blackhole.think, misc_blackhole_think, "misc_blackhole wrap must keep the think callback");

  const dispatch = spawnFreeableEntity(runtime);
  dispatch.classname = "misc_blackhole";
  ED_CallSpawn(dispatch, runtime);
  assert.equal(dispatch.use, misc_blackhole_use, "ED_CallSpawn must dispatch misc_blackhole to SP_misc_blackhole");

  useGameEntity(runtime, dispatch, null, blackhole);
  assert.equal(dispatch.inuse, false, "misc_blackhole_use must free the blackhole entity");
  assert.equal(drainGameTempEntityEvents(runtime).length, 0, "misc_blackhole_use must keep the source-commented temp entity omitted");
}

function verifyMiscEastertankSpawnsAndLoopsStandFrames(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 20;

  const tank = spawnFreeableEntity(runtime);
  tank.classname = "misc_eastertank";
  tank.origin = [16, 32, 48];
  tank.s.origin = [16, 32, 48];

  SP_misc_eastertank(tank, runtime);

  assert.equal(tank.movetype, MOVETYPE_NONE, "misc_eastertank must be stationary");
  assert.equal(tank.solid, SOLID_BBOX, "misc_eastertank must use a bbox solid");
  assert.deepEqual(tank.mins, [-32, -32, -16], "misc_eastertank mins mismatch");
  assert.deepEqual(tank.maxs, [32, 32, 32], "misc_eastertank maxs mismatch");
  assert.equal(runtime.assets.modelPaths[tank.s.modelindex - 1], "models/monsters/tank/tris.md2", "misc_eastertank modelindex must resolve to tank/tris.md2");
  assert.equal(tank.s.frame, 254, "misc_eastertank must start at frame 254");
  assert.equal(tank.think, misc_eastertank_think, "misc_eastertank must install misc_eastertank_think");
  assert.equal(tank.nextthink, runtime.time + 2 * FRAMETIME, "misc_eastertank must schedule first think two frames later");
  assert.equal(tank.linked, true, "misc_eastertank must be linked for snapshots");

  runPendingThinks(runtime, runtime.time + 2 * FRAMETIME);
  assert.equal(tank.s.frame, 255, "misc_eastertank think must advance while below frame 293");
  assert.equal(tank.nextthink, runtime.time + FRAMETIME, "misc_eastertank think must reschedule every frame");

  tank.s.frame = 292;
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assert.equal(tank.s.frame, 254, "misc_eastertank think must wrap frame 292 back to 254");
  assert.equal(tank.think, misc_eastertank_think, "misc_eastertank wrap must keep the think callback");

  const dispatch = spawnFreeableEntity(runtime);
  dispatch.classname = "misc_eastertank";
  ED_CallSpawn(dispatch, runtime);
  assert.equal(dispatch.think, misc_eastertank_think, "ED_CallSpawn must dispatch misc_eastertank to SP_misc_eastertank");
}

function verifyMiscEasterchickSpawnsAndLoopsStandFrames(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 30;

  const chick = spawnFreeableEntity(runtime);
  chick.classname = "misc_easterchick";
  chick.origin = [24, 36, 48];
  chick.s.origin = [24, 36, 48];

  SP_misc_easterchick(chick, runtime);

  assert.equal(chick.movetype, MOVETYPE_NONE, "misc_easterchick must be stationary");
  assert.equal(chick.solid, SOLID_BBOX, "misc_easterchick must use a bbox solid");
  assert.deepEqual(chick.mins, [-32, -32, 0], "misc_easterchick mins mismatch");
  assert.deepEqual(chick.maxs, [32, 32, 32], "misc_easterchick maxs mismatch");
  assert.equal(runtime.assets.modelPaths[chick.s.modelindex - 1], "models/monsters/bitch/tris.md2", "misc_easterchick modelindex must resolve to bitch/tris.md2");
  assert.equal(chick.s.frame, 208, "misc_easterchick must start at frame 208");
  assert.equal(chick.think, misc_easterchick_think, "misc_easterchick must install misc_easterchick_think");
  assert.equal(chick.nextthink, runtime.time + 2 * FRAMETIME, "misc_easterchick must schedule first think two frames later");
  assert.equal(chick.linked, true, "misc_easterchick must be linked for snapshots");

  runPendingThinks(runtime, runtime.time + 2 * FRAMETIME);
  assert.equal(chick.s.frame, 209, "misc_easterchick think must advance while below frame 247");
  assert.equal(chick.nextthink, runtime.time + FRAMETIME, "misc_easterchick think must reschedule every frame");

  chick.s.frame = 246;
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assert.equal(chick.s.frame, 208, "misc_easterchick think must wrap frame 246 back to 208");
  assert.equal(chick.think, misc_easterchick_think, "misc_easterchick wrap must keep the think callback");

  const dispatch = spawnFreeableEntity(runtime);
  dispatch.classname = "misc_easterchick";
  ED_CallSpawn(dispatch, runtime);
  assert.equal(dispatch.think, misc_easterchick_think, "ED_CallSpawn must dispatch misc_easterchick to SP_misc_easterchick");
}

function verifyMiscEasterchick2SpawnsAndLoopsStandFrames(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 32;

  const chick = spawnFreeableEntity(runtime);
  chick.classname = "misc_easterchick2";
  chick.origin = [28, 40, 52];
  chick.s.origin = [28, 40, 52];

  SP_misc_easterchick2(chick, runtime);

  assert.equal(chick.movetype, MOVETYPE_NONE, "misc_easterchick2 must be stationary");
  assert.equal(chick.solid, SOLID_BBOX, "misc_easterchick2 must use a bbox solid");
  assert.deepEqual(chick.mins, [-32, -32, 0], "misc_easterchick2 mins mismatch");
  assert.deepEqual(chick.maxs, [32, 32, 32], "misc_easterchick2 maxs mismatch");
  assert.equal(runtime.assets.modelPaths[chick.s.modelindex - 1], "models/monsters/bitch/tris.md2", "misc_easterchick2 modelindex must resolve to bitch/tris.md2");
  assert.equal(chick.s.frame, 248, "misc_easterchick2 must start at frame 248");
  assert.equal(chick.think, misc_easterchick2_think, "misc_easterchick2 must install misc_easterchick2_think");
  assert.equal(chick.nextthink, runtime.time + 2 * FRAMETIME, "misc_easterchick2 must schedule first think two frames later");
  assert.equal(chick.linked, true, "misc_easterchick2 must be linked for snapshots");

  runPendingThinks(runtime, runtime.time + 2 * FRAMETIME);
  assert.equal(chick.s.frame, 249, "misc_easterchick2 think must advance while below frame 287");
  assert.equal(chick.nextthink, runtime.time + FRAMETIME, "misc_easterchick2 think must reschedule every frame");

  chick.s.frame = 286;
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assert.equal(chick.s.frame, 248, "misc_easterchick2 think must wrap frame 286 back to 248");
  assert.equal(chick.think, misc_easterchick2_think, "misc_easterchick2 wrap must keep the think callback");

  const dispatch = spawnFreeableEntity(runtime);
  dispatch.classname = "misc_easterchick2";
  ED_CallSpawn(dispatch, runtime);
  assert.equal(dispatch.think, misc_easterchick2_think, "ED_CallSpawn must dispatch misc_easterchick2 to SP_misc_easterchick2");
}

function verifyBarrelDelaySchedulesDelayedExplosion(): void {
  const runtime = createHarnessRuntime();
  const attacker = spawnGameEntity(runtime);
  attacker.classname = "barrel_attacker";

  const barrel = spawnFreeableEntity(runtime);
  barrel.classname = "misc_explobox";
  barrel.s.origin = [12, 24, 36];
  barrel.origin = [12, 24, 36];
  barrel.absmin = [0, 0, 0];
  barrel.size = [32, 32, 40];
  barrel.dmg = 100;
  barrel.takedamage = damage_t.DAMAGE_YES;

  barrel_delay(barrel, null, attacker, 999, runtime);

  assert.equal(barrel.takedamage, damage_t.DAMAGE_NO, "barrel_delay must make the barrel non-damageable");
  assert.equal(barrel.nextthink, runtime.time + 2 * FRAMETIME, "barrel_delay must schedule exactly two frames later");
  assert.equal(barrel.think, barrel_explode, "barrel_delay must install barrel_explode as next think");
  assert.equal(barrel.activator, attacker, "barrel_delay must remember the attacker as activator");

  withMockedRandom(Array(200).fill(0.5), () => {
    runPendingThinks(runtime, runtime.time + 2 * FRAMETIME);
  });

  const events = drainGameTempEntityEvents(runtime);
  assert.equal(events.at(-1)?.type, temp_event_t.TE_EXPLOSION1, "barrel_delay scheduled think must trigger barrel_explode");
  assert.equal(barrel.inuse, false, "barrel_delay scheduled explosion must free the barrel");
}

function verifyBarrelTouchPushesOnlyFromGroundedActors(): void {
  const runtime = createHarnessRuntime();
  const floor = runtime.entities[0]!;
  let traceCount = 0;
  runtime.collision = {
    world: {} as never,
    trace: () => {
      traceCount += 1;
      return makeTrace({ fraction: 0.5, endpos: [101, 0, 16], ent: floor });
    },
    pointcontents: () => 1
  };

  const barrel = spawnGameEntity(runtime);
  barrel.classname = "misc_explobox";
  barrel.s.origin = [100, 0, 16];
  barrel.origin = [100, 0, 16];
  barrel.mins = [-16, -16, 0];
  barrel.maxs = [16, 16, 40];
  barrel.mass = 400;
  barrel.groundentity = floor;
  barrel.monsterinfo.aiflags = AI_NOSTEP;

  const pusher = spawnGameEntity(runtime);
  pusher.classname = "pusher";
  pusher.s.origin = [0, 0, 16];
  pusher.origin = [0, 0, 16];
  pusher.mass = 200;
  pusher.groundentity = floor;

  barrel_touch(barrel, pusher, runtime);

  assert.equal(traceCount, 1, "barrel_touch must attempt one M_walkmove for grounded pushers");
  assert.deepEqual(barrel.s.origin, [101, 0, 16], "barrel_touch must move along vectoyaw(self - other)");

  pusher.groundentity = null;
  barrel.s.origin = [100, 0, 16];
  barrel.origin = [100, 0, 16];
  barrel_touch(barrel, pusher, runtime);
  assert.equal(traceCount, 1, "barrel_touch must ignore actors not standing on ground");
  assert.deepEqual(barrel.s.origin, [100, 0, 16], "barrel_touch must not move for airborne actors");

  pusher.groundentity = barrel;
  barrel_touch(barrel, pusher, runtime);
  assert.equal(traceCount, 1, "barrel_touch must ignore actors standing on the barrel itself");
}

function verifyBarrelExplodeThrowsDebrisAndExplosionTempEntities(): void {
  const runtime = createHarnessRuntime();
  const attacker = spawnGameEntity(runtime);
  attacker.classname = "barrel_attacker";

  const barrel = spawnFreeableEntity(runtime);
  barrel.classname = "misc_explobox";
  barrel.s.origin = [20, 30, 40];
  barrel.origin = [20, 30, 40];
  barrel.absmin = [4, 8, 12];
  barrel.size = [32, 48, 40];
  barrel.dmg = 150;
  barrel.activator = attacker;

  const damaged = spawnGameEntity(runtime);
  damaged.classname = "barrel_radius_target";
  damaged.s.origin = [20, 32, 32];
  damaged.origin = [20, 32, 32];
  damaged.mins = [0, 0, 0];
  damaged.maxs = [0, 0, 0];
  damaged.health = 200;
  damaged.takedamage = damage_t.DAMAGE_YES;
  damaged.solid = SOLID_BBOX;

  withMockedRandom(Array(200).fill(0.5), () => {
    barrel_explode(barrel, runtime);
  });

  const debris = runtime.entities.filter((entity) => entity.classname === "debris");
  assert.equal(debris.length, 14, "barrel_explode must throw two big, four corner and eight small debris chunks");
  assert.equal(debris.filter((entity) => entity.model === "models/objects/debris1/tris.md2").length, 2, "barrel_explode must throw two debris1 chunks");
  assert.equal(debris.filter((entity) => entity.model === "models/objects/debris3/tris.md2").length, 4, "barrel_explode must throw four debris3 bottom-corner chunks");
  assert.equal(debris.filter((entity) => entity.model === "models/objects/debris2/tris.md2").length, 8, "barrel_explode must throw eight debris2 chunks");
  assert.deepEqual(debris[0]?.s.origin, [20, 32, 32], "random barrel debris must use the centered barrel origin");
  assert.deepEqual(debris[2]?.s.origin, [4, 8, 12], "first corner debris must start at absmin");
  assert.deepEqual(debris[5]?.s.origin, [36, 56, 12], "last corner debris must start at the opposite bottom corner");
  assert.equal(debris[0]?.velocity[2], 112.5, "debris1 speed must use spd = 1.5 * dmg / 200");
  assert.equal(debris[2]?.velocity[2], 131.25, "debris3 speed must use spd = 1.75 * dmg / 200");
  assert.equal(debris[6]?.velocity[2], 150, "debris2 speed must use spd = 2 * dmg / 200");
  assert.equal(damaged.health < 200, true, "barrel_explode must apply MOD_BARREL radius damage");

  let events = drainGameTempEntityEvents(runtime);
  assert.equal(events.at(-1)?.type, temp_event_t.TE_EXPLOSION1, "airborne barrel_explode must become TE_EXPLOSION1");
  assert.deepEqual(events.at(-1)?.origin, [20, 30, 40], "barrel_explode must restore the saved origin before the temp entity");
  assert.equal(barrel.inuse, false, "barrel_explode must free the exploding barrel");

  const groundedRuntime = createHarnessRuntime();
  const ground = groundedRuntime.entities[0]!;
  const groundedBarrel = spawnFreeableEntity(groundedRuntime);
  groundedBarrel.classname = "misc_explobox";
  groundedBarrel.s.origin = [1, 2, 3];
  groundedBarrel.origin = [1, 2, 3];
  groundedBarrel.absmin = [0, 0, 0];
  groundedBarrel.size = [16, 16, 32];
  groundedBarrel.dmg = 80;
  groundedBarrel.groundentity = ground;

  withMockedRandom(Array(200).fill(0.5), () => {
    barrel_explode(groundedBarrel, groundedRuntime);
  });

  events = drainGameTempEntityEvents(groundedRuntime);
  assert.equal(events.at(-1)?.type, temp_event_t.TE_EXPLOSION2, "grounded barrel_explode must become TE_EXPLOSION2");
  assert.deepEqual(events.at(-1)?.origin, [1, 2, 3], "grounded barrel_explode must restore the saved origin before TE_EXPLOSION2");
}

function verifyLightWritesSourceConfigstrings(): void {
  const runtime = createHarnessRuntime();

  const untargeted = spawnFreeableEntity(runtime);
  untargeted.classname = "light";
  SP_light(untargeted, runtime);
  assert.equal(untargeted.inuse, false, "SP_light must free untargeted lights");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  const deathmatchLight = spawnFreeableEntity(deathmatchRuntime);
  deathmatchLight.classname = "light";
  deathmatchLight.targetname = "toggle_light";
  deathmatchLight.style = 33;
  SP_light(deathmatchLight, deathmatchRuntime);
  assert.equal(deathmatchLight.inuse, false, "SP_light must free targeted lights in deathmatch");

  const defaultStyleLight = spawnGameEntity(runtime);
  defaultStyleLight.classname = "light";
  defaultStyleLight.targetname = "default_style_light";
  defaultStyleLight.style = 31;
  SP_light(defaultStyleLight, runtime);
  assert.equal(defaultStyleLight.use == null, true, "SP_light must not install light_use for styles below 32");
  assert.deepEqual(drainGameConfigstringUpdates(runtime), [], "SP_light must not write default lightstyle configstrings");

  const light = spawnGameEntity(runtime);
  light.classname = "light";
  light.targetname = "toggle_light";
  light.style = 33;
  light.spawnflags = 1;
  SP_light(light, runtime);

  assert.deepEqual(drainGameConfigstringUpdates(runtime), [{ index: CS_LIGHTS + 33, value: "a" }], "SP_light must initialize the source lightstyle configstring");

  useGameEntity(runtime, light, null, light);
  assert.deepEqual(drainGameConfigstringUpdates(runtime), [{ index: CS_LIGHTS + 33, value: "m" }], "light_use must toggle the lightstyle configstring on");
}

function verifyFuncWallSpawnAndUseTogglesVisibility(): void {
  const runtime = createHarnessRuntime();

  const plain = spawnGameEntity(runtime);
  plain.classname = "func_wall";
  plain.model = "*1";

  SP_func_wall(plain, runtime);

  assert.equal(plain.movetype, MOVETYPE_PUSH, "plain func_wall must use MOVETYPE_PUSH");
  assert.equal(plain.solid, SOLID_BSP, "plain func_wall must spawn solid");
  assert.equal(plain.use, undefined, "plain func_wall must not install a use callback");
  assert.equal(plain.linked, true, "plain func_wall must link immediately");
  assert.equal(runtime.assets.modelPaths[plain.s.modelindex - 1], "*1", "func_wall must register its inline model");

  const hidden = spawnGameEntity(runtime);
  hidden.classname = "func_wall";
  hidden.model = "*2";
  hidden.spawnflags = 1;

  SP_func_wall(hidden, runtime);

  assert.equal(hidden.use, func_wall_use, "trigger-spawn func_wall must install func_wall_use");
  assert.equal(hidden.solid, SOLID_NOT, "trigger-spawn func_wall without START_ON must start non-solid");
  assert.equal((hidden.svflags & SVF_NOCLIENT) !== 0, true, "hidden func_wall must set SVF_NOCLIENT");

  useGameEntity(runtime, hidden, null, hidden);

  assert.equal(hidden.solid, SOLID_BSP, "func_wall_use must make hidden wall solid");
  assert.equal((hidden.svflags & SVF_NOCLIENT) === 0, true, "func_wall_use must make hidden wall client-visible");
  assert.equal(hidden.use, undefined, "non-TOGGLE func_wall must clear use after first activation");

  const startOnWithoutToggle = spawnGameEntity(runtime);
  startOnWithoutToggle.classname = "func_wall";
  startOnWithoutToggle.model = "*3";
  startOnWithoutToggle.spawnflags = 1 | 4 | 8 | 16;

  SP_func_wall(startOnWithoutToggle, runtime);

  assert.equal((startOnWithoutToggle.spawnflags & 2) !== 0, true, "START_ON without TOGGLE must force TOGGLE like the C source");
  assert.equal(startOnWithoutToggle.solid, SOLID_BSP, "START_ON func_wall must spawn solid");
  assert.equal((startOnWithoutToggle.svflags & SVF_NOCLIENT) === 0, true, "START_ON func_wall must be visible");
  assert.equal((startOnWithoutToggle.s.effects & EF_ANIM_ALL) !== 0, true, "func_wall spawnflag 8 must set EF_ANIM_ALL");
  assert.equal((startOnWithoutToggle.s.effects & EF_ANIM_ALLFAST) !== 0, true, "func_wall spawnflag 16 must set EF_ANIM_ALLFAST");

  useGameEntity(runtime, startOnWithoutToggle, null, startOnWithoutToggle);

  assert.equal(startOnWithoutToggle.solid, SOLID_NOT, "TOGGLE func_wall use must hide an active wall");
  assert.equal((startOnWithoutToggle.svflags & SVF_NOCLIENT) !== 0, true, "TOGGLE func_wall use must set SVF_NOCLIENT");
  assert.equal(startOnWithoutToggle.use, func_wall_use, "TOGGLE func_wall must keep its use callback");

  const missingTriggerSpawn = spawnGameEntity(runtime);
  missingTriggerSpawn.classname = "func_wall";
  missingTriggerSpawn.model = "*4";
  missingTriggerSpawn.spawnflags = 2;

  SP_func_wall(missingTriggerSpawn, runtime);

  assert.equal((missingTriggerSpawn.spawnflags & 1) !== 0, true, "non-plain func_wall must force TRIGGER_SPAWN");
  assert.equal(missingTriggerSpawn.solid, SOLID_NOT, "forced TRIGGER_SPAWN without START_ON must start hidden");

  const dispatch = spawnGameEntity(runtime);
  dispatch.classname = "func_wall";
  dispatch.model = "*5";
  dispatch.spawnflags = 1;

  ED_CallSpawn(dispatch, runtime);

  assert.equal(dispatch.use, func_wall_use, "ED_CallSpawn must dispatch func_wall to SP_func_wall");
}

function verifyFuncObjectSpawnUseReleaseAndCrush(): void {
  const runtime = createHarnessRuntime();

  const plain = spawnGameEntity(runtime);
  plain.classname = "func_object";
  plain.model = "*1";
  plain.mins = [-16, -16, 0];
  plain.maxs = [16, 16, 32];

  SP_func_object(plain, runtime);

  assert.equal(plain.solid, SOLID_BSP, "plain func_object must spawn solid");
  assert.equal(plain.movetype, MOVETYPE_PUSH, "plain func_object must wait as MOVETYPE_PUSH");
  assert.equal(plain.dmg, 100, "func_object must default crush damage to 100");
  assert.deepEqual(plain.mins, [-15, -15, 1], "func_object must shrink source mins by one unit");
  assert.deepEqual(plain.maxs, [15, 15, 31], "func_object must shrink source maxs by one unit");
  assert.equal(plain.clipmask, MASK_MONSTERSOLID, "func_object must use MASK_MONSTERSOLID");
  assert.equal(runtime.assets.modelPaths[plain.s.modelindex - 1], "*1", "func_object must register its inline model");

  runPendingThinks(runtime, 2 * FRAMETIME);

  assert.equal(plain.movetype, MOVETYPE_TOSS, "plain func_object must release after two frames");
  assert.equal(plain.touch, func_object_touch, "func_object_release must install func_object_touch");

  const victim = spawnGameEntity(runtime);
  victim.classname = "victim";
  victim.health = 150;
  victim.takedamage = damage_t.DAMAGE_YES;
  const topPlane: cplane_t = { normal: [0, 0, 1], dist: 0, type: 0, signbits: 0, pad: [0, 0] };

  plain.touch!(plain, victim, runtime, topPlane);
  assert.equal(victim.health, 50, "func_object_touch must crush damageable entities below the falling object");

  victim.health = 150;
  plain.touch!(plain, victim, runtime, null);
  assert.equal(victim.health, 150, "func_object_touch must ignore touches without a collision plane");
  plain.touch!(plain, victim, runtime, { ...topPlane, normal: [0, 1, 0] });
  assert.equal(victim.health, 150, "func_object_touch must ignore side planes");
  victim.takedamage = damage_t.DAMAGE_NO;
  plain.touch!(plain, victim, runtime, topPlane);
  assert.equal(victim.health, 150, "func_object_touch must ignore non-damageable entities");

  const hidden = spawnGameEntity(runtime);
  hidden.classname = "func_object";
  hidden.model = "*2";
  hidden.spawnflags = 1 | 2 | 4;
  hidden.dmg = 25;
  hidden.mins = [-8, -8, 0];
  hidden.maxs = [8, 8, 16];

  SP_func_object(hidden, runtime);

  assert.equal(hidden.use, func_object_use, "trigger-spawn func_object must install func_object_use");
  assert.equal(hidden.solid, SOLID_NOT, "trigger-spawn func_object must start non-solid");
  assert.equal((hidden.svflags & SVF_NOCLIENT) !== 0, true, "trigger-spawn func_object must start hidden");
  assert.equal((hidden.s.effects & EF_ANIM_ALL) !== 0, true, "func_object spawnflag 2 must set EF_ANIM_ALL");
  assert.equal((hidden.s.effects & EF_ANIM_ALLFAST) !== 0, true, "func_object spawnflag 4 must set EF_ANIM_ALLFAST");

  useGameEntity(runtime, hidden, null, hidden);

  assert.equal(hidden.solid, SOLID_BSP, "func_object_use must make the object solid");
  assert.equal((hidden.svflags & SVF_NOCLIENT) === 0, true, "func_object_use must make the object client-visible");
  assert.equal(hidden.use, undefined, "func_object_use must clear the one-shot use callback");
  assert.equal(hidden.movetype, MOVETYPE_TOSS, "func_object_use must release the object immediately");
  assert.equal(hidden.touch, func_object_touch, "func_object_use must arm crush touch");

  const dispatch = spawnGameEntity(runtime);
  dispatch.classname = "func_object";
  dispatch.model = "*3";

  ED_CallSpawn(dispatch, runtime);

  assert.equal(dispatch.solid, SOLID_BSP, "ED_CallSpawn must dispatch func_object to SP_func_object");
}

function verifyFuncExplosiveSpawnsAndExplodesBrushModel(): void {
  const runtime = createHarnessRuntime();

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  const deathmatchExplosive = spawnFreeableEntity(deathmatchRuntime);
  deathmatchExplosive.classname = "func_explosive";
  deathmatchExplosive.model = "*1";
  SP_func_explosive(deathmatchExplosive, deathmatchRuntime);
  assert.equal(deathmatchExplosive.inuse, false, "SP_func_explosive must free explosive brushes in deathmatch");
  assert.equal(deathmatchExplosive.linked, false, "deathmatch func_explosive must not stay linked");

  const explosive = spawnGameEntity(runtime);
  explosive.classname = "func_explosive";
  explosive.model = "*8";
  explosive.mins = [-16, -16, 0];
  explosive.maxs = [16, 16, 32];
  explosive.mass = 100;
  explosive.dmg = 120;
  SP_func_explosive(explosive, runtime);

  assert.equal(explosive.solid, SOLID_BSP, "func_explosive must spawn solid when not trigger-spawned");
  assert.equal(explosive.s.modelindex, 9, "func_explosive must apply gi.setmodel-style inline modelindex");
  assert.equal(runtime.assets.modelPaths.includes("models/objects/debris1/tris.md2"), true, "SP_func_explosive must precache large debris");
  assert.equal(runtime.assets.modelPaths.includes("models/objects/debris2/tris.md2"), true, "SP_func_explosive must precache small debris");
  assert.equal(explosive.takedamage, damage_t.DAMAGE_YES, "untargeted func_explosive must be shootable");
  assert.equal(explosive.health, 100, "untargeted func_explosive must default health to 100");
  assert.equal(explosive.die, func_explosive_explode, "untargeted func_explosive must use func_explosive_explode");
  assert.equal(explosive.linked, true, "SP_func_explosive must link visible brush models");
  assert.equal(runtime.linkedInlineBspEntities.includes(explosive), true, "SP_func_explosive must expose inline BSP brushes to runtime collision");

  const attacker = spawnGameEntity(runtime);
  attacker.classname = "attacker";
  attacker.s.origin = [128, 0, 0];
  attacker.origin = [128, 0, 0];
  func_explosive_explode(explosive, attacker, attacker, explosive.health, runtime);

  assert.equal(runtime.entities.filter((entity) => entity.classname === "debris").length, 5, "mass 100 func_explosive must throw one large and four small debris chunks");
  assert.equal(drainGameTempEntityEvents(runtime).at(-1)?.type, temp_event_t.TE_EXPLOSION1, "func_explosive with damage must emit TE_EXPLOSION1");

  const triggerSpawned = spawnGameEntity(runtime);
  triggerSpawned.classname = "func_explosive";
  triggerSpawned.model = "*9";
  triggerSpawned.spawnflags = 1;
  SP_func_explosive(triggerSpawned, runtime);

  assert.equal(triggerSpawned.solid, SOLID_NOT, "trigger-spawned func_explosive must start non-solid");
  assert.equal((triggerSpawned.svflags & SVF_NOCLIENT) !== 0, true, "trigger-spawned func_explosive must start hidden from clients");
  assert.equal(triggerSpawned.use, func_explosive_spawn, "trigger-spawned func_explosive must first expose func_explosive_spawn");
  useGameEntity(runtime, triggerSpawned, null, triggerSpawned);
  assert.equal(triggerSpawned.solid, SOLID_BSP, "func_explosive_spawn must make the brush solid");
  assert.equal((triggerSpawned.svflags & SVF_NOCLIENT) === 0, true, "func_explosive_spawn must make the brush client-visible");
  assert.equal(triggerSpawned.use, undefined, "func_explosive_spawn must clear the one-shot use callback");
  assert.equal(triggerSpawned.linked, true, "func_explosive_spawn must relink the revealed brush");
  assert.equal(runtime.linkedInlineBspEntities.includes(triggerSpawned), true, "func_explosive_spawn must expose the revealed inline brush to collision");

  const targeted = spawnGameEntity(runtime);
  targeted.classname = "func_explosive";
  targeted.model = "*10";
  targeted.targetname = "boom";
  targeted.target = "explosion_relay";
  targeted.dmg = 0;
  SP_func_explosive(targeted, runtime);

  assert.equal(targeted.use, func_explosive_use, "targeted func_explosive must be trigger-usable instead of shootable");
  assert.equal(targeted.takedamage, damage_t.DAMAGE_NO, "targeted func_explosive must not be shootable");
  assert.equal(targeted.die, undefined, "targeted func_explosive must not install a shootable die callback");
  assert.equal(targeted.linked, true, "targeted func_explosive must still link as a visible brush");

  const relay = spawnGameEntity(runtime);
  relay.classname = "target_relay";
  relay.targetname = "explosion_relay";
  const other = spawnGameEntity(runtime);
  other.classname = "trigger_source";
  let relayActivator = null as ReturnType<typeof spawnGameEntity> | null;
  relay.use = (_self, _other, activator) => {
    relayActivator = activator;
  };

  func_explosive_use(targeted, other, null, runtime);
  assert.equal(relayActivator, other, "func_explosive_use must forward other as the explosion attacker/target activator");
  assert.equal(targeted.inuse, false, "func_explosive_use without dmg must free the brush through G_FreeEdict");

  const dispatch = spawnGameEntity(runtime);
  dispatch.classname = "func_explosive";
  dispatch.model = "*11";
  ED_CallSpawn(dispatch, runtime);
  assert.equal(dispatch.solid, SOLID_BSP, "ED_CallSpawn must dispatch func_explosive to SP_func_explosive");
}

function verifyFuncExplosiveExplodeMassLimitsTargetsAndFreeBranches(): void {
  const runtime = createHarnessRuntime();

  const relay = spawnGameEntity(runtime);
  relay.classname = "target_relay";
  relay.targetname = "after_explosion";
  let relayActivator = null as ReturnType<typeof spawnGameEntity> | null;
  relay.use = (_self, _other, activator) => {
    relayActivator = activator;
  };

  const explosive = spawnFreeableEntity(runtime);
  explosive.classname = "func_explosive";
  explosive.absmin = [10, 20, 30];
  explosive.absmax = [90, 60, 50];
  explosive.size = [80, 40, 20];
  explosive.s.origin = [0, 0, 0];
  explosive.velocity = [0, 0, 0];
  explosive.mass = 1000;
  explosive.dmg = 0;
  explosive.target = "after_explosion";
  explosive.takedamage = damage_t.DAMAGE_YES;

  const inflictor = spawnGameEntity(runtime);
  inflictor.classname = "explosion_inflictor";
  inflictor.s.origin = [50, -60, 40];

  const attacker = spawnGameEntity(runtime);
  attacker.classname = "explosion_attacker";

  withMockedRandom(Array(200).fill(0.5), () => {
    func_explosive_explode(explosive, inflictor, attacker, 0, runtime);
  });

  const debris = runtime.entities.filter((entity) => entity.classname === "debris");
  assert.equal(debris.length, 24, "mass 1000 must cap func_explosive debris at 8 large and 16 small chunks");
  assert.equal(debris.filter((entity) => entity.model === "models/objects/debris1/tris.md2").length, 8, "large debris count must cap at 8");
  assert.equal(debris.filter((entity) => entity.model === "models/objects/debris2/tris.md2").length, 16, "small debris count must cap at 16");
  assert.deepEqual(debris[0]?.s.origin, [50, 40, 40], "func_explosive_explode must recenter debris around the bmodel origin");
  assert.deepEqual(debris[0]?.velocity, [0, 150, 100], "func_explosive_explode must launch chunks away from the inflictor before debris speed is added");
  assert.equal(relayActivator, attacker, "func_explosive_explode must fire targets with the attacker as activator");
  assert.equal(explosive.inuse, false, "func_explosive_explode without dmg must free the brush entity");
  assert.equal(drainGameTempEntityEvents(runtime).length, 0, "func_explosive_explode without dmg must not emit an explosion temp entity");

  const defaultMassRuntime = createHarnessRuntime();
  const defaultMassExplosive = spawnFreeableEntity(defaultMassRuntime);
  defaultMassExplosive.classname = "func_explosive";
  defaultMassExplosive.absmin = [0, 0, 0];
  defaultMassExplosive.absmax = [40, 20, 10];
  defaultMassExplosive.size = [40, 20, 10];
  defaultMassExplosive.mass = 0;
  defaultMassExplosive.dmg = 120;
  defaultMassExplosive.takedamage = damage_t.DAMAGE_YES;

  const damaged = spawnGameEntity(defaultMassRuntime);
  damaged.classname = "radius_damage_target";
  damaged.s.origin = [20, 10, 5];
  damaged.mins = [0, 0, 0];
  damaged.maxs = [0, 0, 0];
  damaged.health = 200;
  damaged.solid = SOLID_BBOX;
  damaged.takedamage = damage_t.DAMAGE_YES;

  withMockedRandom(Array(40).fill(0.5), () => {
    func_explosive_explode(defaultMassExplosive, defaultMassExplosive, attacker, 0, defaultMassRuntime);
  });

  assert.equal(defaultMassRuntime.entities.filter((entity) => entity.classname === "debris").length, 3, "missing mass must default to 75 and throw three small chunks");
  assert.equal(damaged.health < 200, true, "func_explosive_explode with dmg must apply radius damage");
  assert.equal(drainGameTempEntityEvents(defaultMassRuntime).at(-1)?.type, temp_event_t.TE_EXPLOSION1, "func_explosive_explode with dmg must emit TE_EXPLOSION1");
}

function verifyGibTypesSelectMovementAndTouchBehavior(): void {
  const runtime = createHarnessRuntime();
  const source = spawnGameEntity(runtime);
  source.classname = "gib_source";
  source.absmin = [0, 0, 0];
  source.size = [32, 32, 32];
  source.velocity = [0, 0, 0];

  ThrowGib(source, "models/objects/gibs/sm_meat/tris.md2", 40, GIB_ORGANIC, runtime);
  const organic = runtime.entities.at(-1)!;
  assert.equal(organic.movetype, MOVETYPE_TOSS, "organic gibs must use MOVETYPE_TOSS");
  assert.equal(organic.touch, gib_touch, "organic gibs must install gib_touch");
  assert.equal(organic.model, "models/objects/gibs/sm_meat/tris.md2", "organic gib model mismatch");

  ThrowGib(source, "models/objects/gibs/sm_metal/tris.md2", 40, GIB_METALLIC, runtime);
  const metallic = runtime.entities.at(-1)!;
  assert.equal(metallic.movetype, MOVETYPE_BOUNCE, "metallic gibs must use MOVETYPE_BOUNCE");
  assert.equal(metallic.touch, undefined, "metallic gibs must not install gib_touch");
  assert.equal(metallic.model, "models/objects/gibs/sm_metal/tris.md2", "metallic gib model mismatch");
}

function verifyGibTouchMatchesPlaneGatedSourceBehavior(): void {
  const runtime = createHarnessRuntime();
  const ground = spawnGameEntity(runtime);

  const noPlaneGib = spawnGameEntity(runtime);
  noPlaneGib.groundentity = ground;
  noPlaneGib.touch = gib_touch;
  noPlaneGib.s.modelindex = 0;
  noPlaneGib.s.frame = 3;

  gib_touch(noPlaneGib, ground, runtime);

  assert.equal(noPlaneGib.touch, undefined, "gib_touch must clear touch once the gib is grounded");
  assert.equal(noPlaneGib.s.frame, 3, "gib_touch without a plane must not advance frames");
  assert.deepEqual(drainGameSoundEvents(runtime), [], "gib_touch without a plane must not emit the flesh hit sound");

  const planeGib = spawnGameEntity(runtime);
  planeGib.groundentity = ground;
  planeGib.touch = gib_touch;
  planeGib.s.modelindex = 1;
  runtime.assets.modelPaths[0] = "models/objects/gibs/sm_meat/tris.md2";
  planeGib.s.frame = 3;

  gib_touch(planeGib, ground, runtime, {
    normal: [0, 0, 1],
    dist: 0,
    type: 2,
    signbits: 0,
    pad: [0, 0]
  });

  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "misc/fhit3.wav", "gib_touch with a plane must emit the flesh hit sound");
  assert.deepEqual(planeGib.s.angles, [0, 270, 0], "gib_touch must orient the gib from the impact plane right vector");
  assert.equal(planeGib.s.frame, 4, "small meat gib touch must advance one frame");
  assert.equal(planeGib.nextthink, runtime.time + 0.1, "small meat gib touch must schedule gib_think one frame later");
}

function verifyGibThinkAndDieCallbacks(): void {
  const runtime = createHarnessRuntime();
  const gib = spawnGameEntity(runtime);
  gib.s.frame = 8;
  runtime.time = 2;

  gib_think(gib, runtime);

  assert.equal(gib.s.frame, 9, "gib_think must advance the frame");
  assert.equal(gib.think, gib_think, "gib_think before frame 10 must keep itself scheduled");
  assert.equal(gib.nextthink, 2.1, "gib_think before frame 10 must schedule the next frame");

  gib.s.frame = 9;
  gib_think(gib, runtime);

  assert.equal(gib.s.frame, 10, "gib_think must reach cleanup frame 10");
  assert.notEqual(gib.think, gib_think, "gib_think at frame 10 must switch to cleanup think");
  assert.ok(gib.nextthink >= 10 && gib.nextthink < 20, "gib_think cleanup delay must match 8 + random()*10 from current time");

  let doomed = spawnGameEntity(runtime);
  while (doomed.index <= runtime.maxclients + 8) {
    doomed = spawnGameEntity(runtime);
  }
  gib_die(doomed, null, null, 25, runtime);

  assert.equal(doomed.inuse, false, "gib_die must free the gib entity");
}

function verifyThrowHeadConvertsSourceEntityToGib(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 5;

  withMockedRandom([0.75, 0.75, 0.75, 0.75, 0.25], () => {
    const organicHead = spawnGameEntity(runtime);
    organicHead.s.skinnum = 7;
    organicHead.s.frame = 42;
    organicHead.mins = [-16, -16, -24];
    organicHead.maxs = [16, 16, 32];
    organicHead.s.modelindex2 = 99;
    organicHead.s.effects = EF_FLIES;
    organicHead.s.sound = 17;
    organicHead.svflags = SVF_MONSTER;
    organicHead.velocity = [10, 20, 300];

    ThrowHead(organicHead, "models/objects/gibs/head2/tris.md2", 100, GIB_ORGANIC, runtime);

    assert.equal(organicHead.s.skinnum, 0, "ThrowHead must clear skin number");
    assert.equal(organicHead.s.frame, 0, "ThrowHead must reset frame");
    assert.deepEqual(organicHead.mins, [0, 0, 0], "ThrowHead must clear mins");
    assert.deepEqual(organicHead.maxs, [0, 0, 0], "ThrowHead must clear maxs");
    assert.equal(organicHead.s.modelindex2, 0, "ThrowHead must clear modelindex2");
    assert.equal(organicHead.model, "models/objects/gibs/head2/tris.md2", "ThrowHead model mismatch");
    assert.equal((organicHead.s.effects & EF_GIB) !== 0, true, "ThrowHead must set EF_GIB");
    assert.equal((organicHead.s.effects & EF_FLIES) === 0, true, "ThrowHead must clear EF_FLIES");
    assert.equal(organicHead.s.sound, 0, "ThrowHead must clear looping sound");
    assert.equal((organicHead.flags & FL_NO_KNOCKBACK) !== 0, true, "ThrowHead must set FL_NO_KNOCKBACK");
    assert.equal((organicHead.svflags & SVF_MONSTER) === 0, true, "ThrowHead must clear SVF_MONSTER");
    assert.equal(organicHead.takedamage, damage_t.DAMAGE_YES, "ThrowHead must make the head damageable");
    assert.equal(organicHead.die, gib_die, "ThrowHead must install gib_die");
    assert.equal(organicHead.movetype, MOVETYPE_TOSS, "organic ThrowHead must use MOVETYPE_TOSS");
    assert.equal(organicHead.touch, gib_touch, "organic ThrowHead must install gib_touch");
    assert.deepEqual(organicHead.velocity, [40, 50, 465], "organic ThrowHead must apply vscale 0.5 before clipping");
    assert.equal(organicHead.avelocity[1], 300, "ThrowHead must randomize yaw angular velocity with crandom()*600");
    assert.equal(organicHead.nextthink, 17.5, "ThrowHead must schedule free after 10 + random()*10 seconds");
  });

  withMockedRandom([0.75, 0.75, 0.75, 0.75, 0.25], () => {
    const metallicHead = spawnGameEntity(runtime);
    metallicHead.velocity = [10, 20, 300];

    ThrowHead(metallicHead, "models/objects/gibs/head2/tris.md2", 100, GIB_METALLIC, runtime);

    assert.equal(metallicHead.movetype, MOVETYPE_BOUNCE, "metallic ThrowHead must use MOVETYPE_BOUNCE");
    assert.equal(metallicHead.touch, undefined, "metallic ThrowHead must not install gib_touch");
    assert.deepEqual(metallicHead.velocity, [70, 80, 500], "metallic ThrowHead must apply vscale 1.0 before clipping");
  });
}

function verifyThrowClientHeadConvertsPlayerOrBodyToClientGib(): void {
  const runtime = createHarnessRuntime();

  withMockedRandom([1 / 0x7fffffff, 0.75, 0.25, 0.5], () => {
    const player = spawnGameEntity(runtime);
    attachGameClient(player);
    player.s.origin = [10, 20, 30];
    player.velocity = [1, 2, 3];

    ThrowClientHead(player, 100, runtime);

    assert.equal(player.model, "models/objects/gibs/head2/tris.md2", "ThrowClientHead odd rand must choose player head");
    assert.equal(player.s.skinnum, 1, "ThrowClientHead player head must use the player skin");
    assert.deepEqual(player.s.origin, [10, 20, 62], "ThrowClientHead must raise the head origin by 32 units");
    assert.equal(player.s.frame, 0, "ThrowClientHead must reset the frame");
    assert.deepEqual(player.mins, [-16, -16, 0], "ThrowClientHead mins mismatch");
    assert.deepEqual(player.maxs, [16, 16, 16], "ThrowClientHead maxs mismatch");
    assert.equal(player.takedamage, damage_t.DAMAGE_NO, "ThrowClientHead must make the head non-damageable");
    assert.equal(player.solid, SOLID_NOT, "ThrowClientHead must clear collision");
    assert.equal(player.s.effects, EF_GIB, "ThrowClientHead must replace effects with EF_GIB");
    assert.equal(player.s.sound, 0, "ThrowClientHead must clear looping sound");
    assert.equal((player.flags & FL_NO_KNOCKBACK) !== 0, true, "ThrowClientHead must set FL_NO_KNOCKBACK");
    assert.equal(player.movetype, MOVETYPE_BOUNCE, "ThrowClientHead must use MOVETYPE_BOUNCE");
    assert.deepEqual(player.velocity, [61, -58, 303], "ThrowClientHead must add VelocityForDamage to current velocity");
    assert.equal(player.client!.anim_priority, ANIM_DEATH, "ThrowClientHead must force client death animation priority");
    assert.equal(player.client!.anim_end, 0, "ThrowClientHead must end the client animation at frame 0");
  });

  withMockedRandom([0, 0.5, 0.5, 0], () => {
    const body = spawnGameEntity(runtime);
    body.s.origin = [0, 0, 0];
    body.velocity = [0, 0, 0];
    body.think = () => undefined;
    body.nextthink = 25;

    ThrowClientHead(body, 40, runtime);

    assert.equal(body.model, "models/objects/gibs/skull/tris.md2", "ThrowClientHead even rand must choose skull");
    assert.equal(body.s.skinnum, 0, "ThrowClientHead skull must clear skin");
    assert.deepEqual(body.velocity, [0, 0, 140], "ThrowClientHead low damage must use the 0.7 velocity scale");
    assert.equal(body.think, undefined, "ThrowClientHead queued bodies must clear think");
    assert.equal(body.nextthink, 0, "ThrowClientHead queued bodies must clear nextthink");
  });
}

function verifyThrowDebrisSpawnsDamageableVisibleChunk(): void {
  const runtime = createHarnessRuntime();
  runtime.time = 20;

  withMockedRandom([0.75, 0.25, 1.0, 0.5, 0.25, 0.75, 0.4], () => {
    for (let index = 0; index < 9; index += 1) {
      spawnGameEntity(runtime);
    }

    const source = spawnGameEntity(runtime);
    source.classname = "debris_source";
    source.velocity = [10, 20, 30];

    ThrowDebris(source, "models/objects/debris1/tris.md2", 2, [1, 2, 3], runtime);

    const chunk = runtime.entities.at(-1)!;
    assert.equal(chunk.classname, "debris", "ThrowDebris must name the spawned chunk debris");
    assert.deepEqual(chunk.s.origin, [1, 2, 3], "ThrowDebris must copy the requested origin into entity_state");
    assert.equal(chunk.model, "models/objects/debris1/tris.md2", "ThrowDebris model mismatch");
    assert.equal(runtime.assets.modelPaths[chunk.s.modelindex - 1], "models/objects/debris1/tris.md2", "ThrowDebris must register the visible debris model");
    assert.deepEqual(chunk.velocity, [110, -80, 430], "ThrowDebris must apply self velocity plus speed-scaled random vector");
    assert.equal(chunk.movetype, MOVETYPE_BOUNCE, "ThrowDebris chunks must bounce");
    assert.equal(chunk.solid, SOLID_NOT, "ThrowDebris chunks must be non-solid");
    assert.deepEqual(chunk.avelocity, [300, 150, 450], "ThrowDebris must randomize angular velocity on all axes");
    assert.equal(chunk.nextthink, 27, "ThrowDebris must schedule cleanup after 5 + random()*5 seconds");
    assert.equal(chunk.s.frame, 0, "ThrowDebris must initialize frame 0");
    assert.equal(chunk.flags, 0, "ThrowDebris must clear flags");
    assert.equal(chunk.takedamage, damage_t.DAMAGE_YES, "ThrowDebris chunks must be damageable");
    assert.equal(chunk.die?.name, "debris_die", "ThrowDebris must install debris_die");

    chunk.die!(chunk, source, source, 25, runtime);
    assert.equal(chunk.inuse, false, "debris_die must free the debris chunk");
  });
}

function verifyBecomeExplosionEmitsTempEntityAndFreesSource(): void {
  const runtime = createHarnessRuntime();

  const explosion1 = spawnFreeableEntity(runtime);
  explosion1.classname = "explosion1_source";
  explosion1.s.origin = [10, 20, 30];

  BecomeExplosion1(explosion1, runtime);

  let events = drainGameTempEntityEvents(runtime);
  assert.equal(events.length, 1, "BecomeExplosion1 must queue exactly one temp entity");
  assert.equal(events[0]?.type, temp_event_t.TE_EXPLOSION1, "BecomeExplosion1 temp entity type mismatch");
  assert.deepEqual(events[0]?.origin, [10, 20, 30], "BecomeExplosion1 must write self->s.origin");
  assert.equal(events[0]?.multicast, multicast_t.MULTICAST_PVS, "BecomeExplosion1 multicast mismatch");
  assert.equal(explosion1.inuse, false, "BecomeExplosion1 must free the source entity");

  const explosion2 = spawnFreeableEntity(runtime);
  explosion2.classname = "explosion2_source";
  explosion2.s.origin = [-5, 6, 7];

  BecomeExplosion2(explosion2, runtime);

  events = drainGameTempEntityEvents(runtime);
  assert.equal(events.length, 1, "BecomeExplosion2 must queue exactly one temp entity");
  assert.equal(events[0]?.type, temp_event_t.TE_EXPLOSION2, "BecomeExplosion2 temp entity type mismatch");
  assert.deepEqual(events[0]?.origin, [-5, 6, 7], "BecomeExplosion2 must write self->s.origin");
  assert.equal(events[0]?.multicast, multicast_t.MULTICAST_PVS, "BecomeExplosion2 multicast mismatch");
  assert.equal(explosion2.inuse, false, "BecomeExplosion2 must free the source entity");
}

function spawnFreeableEntity(runtime: ReturnType<typeof createHarnessRuntime>) {
  let entity = spawnGameEntity(runtime);
  while (entity.index <= runtime.maxclients + 8) {
    entity = spawnGameEntity(runtime);
  }
  return entity;
}

function withMockedRandom(sequence: number[], callback: () => void): void {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => sequence[index++] ?? sequence.at(-1) ?? 0;
  try {
    callback();
  } finally {
    Math.random = originalRandom;
  }
}

function makeTrace(overrides: Partial<trace_t> = {}): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: [0, 0, 0],
    plane: {
      normal: [0, 0, 0],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent: null,
    ...overrides
  };
}

function createHarnessRuntime() {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}
