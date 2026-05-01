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
import { CS_LIGHTS, EF_FLIES, EF_GIB, entity_event_t, multicast_t, PMF_TIME_TELEPORT, temp_event_t } from "../../packages/qcommon/src/index.js";

import {
  SP_func_explosive,
  SP_func_clock,
  SP_light,
  SOLID_BSP,
  SOLID_NOT,
  ANIM_DEATH,
  BecomeExplosion1,
  BecomeExplosion2,
  GIB_METALLIC,
  GIB_ORGANIC,
  MOVETYPE_BOUNCE,
  MOVETYPE_TOSS,
  SP_misc_explobox,
  SP_misc_teleporter,
  SP_misc_teleporter_dest,
  SP_path_corner,
  SP_target_character,
  SP_target_string,
  attachGameClient,
  barrel_delay,
  createGameRuntimeFromBspEntities,
  damage_t,
  drainGameConfigstringUpdates,
  drainGameSoundEvents,
  drainGameTempEntityEvents,
  func_explosive_explode,
  func_explosive_spawn,
  func_explosive_use,
  gib_die,
  gib_think,
  gib_touch,
  linkGameEntity,
  path_corner_touch,
  runPendingThinks,
  spawnGameEntity,
  target_string_use,
  ThrowDebris,
  ThrowHead,
  ThrowGib,
  useGameEntity
} from "../../packages/game/src/index.js";
import { FL_NO_KNOCKBACK } from "../../packages/game/src/g_local.js";
import { ThrowClientHead } from "../../packages/game/src/p_client.js";
import { SVF_MONSTER } from "../../packages/game/src/runtime.js";

main();

function main(): void {
  verifyTeleporterMovesPlayerAndSetsTeleportState();
  verifyPathCornerAdvancesMonsterGoal();
  verifyTargetStringMapsFrames();
  verifyFuncClockBootstrapsTargetStringMessage();
  verifyMiscExploboxSpawnsShootableBarrel();
  verifyLightWritesSourceConfigstrings();
  verifyFuncExplosiveSpawnsAndExplodesBrushModel();
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
}

function verifyLightWritesSourceConfigstrings(): void {
  const runtime = createHarnessRuntime();

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

function verifyFuncExplosiveSpawnsAndExplodesBrushModel(): void {
  const runtime = createHarnessRuntime();

  const explosive = spawnGameEntity(runtime);
  explosive.classname = "func_explosive";
  explosive.model = "*1";
  explosive.mins = [-16, -16, 0];
  explosive.maxs = [16, 16, 32];
  explosive.mass = 100;
  explosive.dmg = 120;
  SP_func_explosive(explosive, runtime);

  assert.equal(explosive.solid, SOLID_BSP, "func_explosive must spawn solid when not trigger-spawned");
  assert.equal(explosive.s.modelindex, 2, "func_explosive must apply gi.setmodel-style inline modelindex");
  assert.equal(explosive.takedamage, damage_t.DAMAGE_YES, "untargeted func_explosive must be shootable");
  assert.equal(explosive.die, func_explosive_explode, "untargeted func_explosive must use func_explosive_explode");

  const attacker = spawnGameEntity(runtime);
  attacker.classname = "attacker";
  attacker.s.origin = [128, 0, 0];
  attacker.origin = [128, 0, 0];
  func_explosive_explode(explosive, attacker, attacker, explosive.health, runtime);

  assert.equal(runtime.entities.filter((entity) => entity.classname === "debris").length, 5, "mass 100 func_explosive must throw one large and four small debris chunks");
  assert.equal(drainGameTempEntityEvents(runtime).at(-1)?.type, temp_event_t.TE_EXPLOSION1, "func_explosive with damage must emit TE_EXPLOSION1");

  const triggerSpawned = spawnGameEntity(runtime);
  triggerSpawned.classname = "func_explosive";
  triggerSpawned.model = "*2";
  triggerSpawned.spawnflags = 1;
  SP_func_explosive(triggerSpawned, runtime);

  assert.equal(triggerSpawned.use, func_explosive_spawn, "trigger-spawned func_explosive must first expose func_explosive_spawn");
  useGameEntity(runtime, triggerSpawned, null, triggerSpawned);
  assert.equal(triggerSpawned.solid, SOLID_BSP, "func_explosive_spawn must make the brush solid");

  const targeted = spawnGameEntity(runtime);
  targeted.classname = "func_explosive";
  targeted.model = "*3";
  targeted.targetname = "boom";
  SP_func_explosive(targeted, runtime);

  assert.equal(targeted.use, func_explosive_use, "targeted func_explosive must be trigger-usable instead of shootable");
  assert.equal(targeted.takedamage, damage_t.DAMAGE_NO, "targeted func_explosive must not be shootable");
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

function createHarnessRuntime() {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}
