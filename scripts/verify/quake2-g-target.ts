/**
 * File: quake2-g-target.ts
 * Purpose: Verify the first TypeScript target for `game/g_target.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for target entity behavior now attached to `packages/game/src/g_target.ts`.
 *
 * Dependencies:
 * - packages/game/src/g_target.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  ATTN_NORM,
  CHAN_RELIABLE,
  CHAN_VOICE,
  CS_CDTRACK,
  CS_LIGHTS,
  DF_ALLOW_EXIT,
  EF_BLASTER,
  MAX_QPATH,
  multicast_t,
  RF_BEAM,
  RF_TRANSLUCENT,
  temp_event_t,
  type trace_t,
  type vec3_t
} from "../../packages/qcommon/src/index.js";
import {
  SFL_CROSS_TRIGGER_1,
  SFL_CROSS_TRIGGER_3,
  SFL_CROSS_TRIGGER_MASK,
  MOD_EXPLOSIVE,
  MOD_EXIT,
  MOD_TARGET_LASER,
  MOD_SPLASH,
  svc_temp_entity
} from "../../packages/game/src/g_local.js";
import {
  FRAMETIME,
  FL_IMMUNE_LASER,
  SOLID_BBOX,
  SVF_MONSTER,
  SVF_NOCLIENT,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameConfigstringUpdates,
  drainGameTempEntityEvents,
  runPendingThinks,
  spawnGameEntity
} from "../../packages/game/src/index.js";
import { G_RunFrame, createGameMainContext } from "../../packages/game/src/g_main.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import {
  SP_target_blaster,
  SP_target_changelevel,
  SP_target_crosslevel_target,
  SP_target_crosslevel_trigger,
  SP_target_earthquake,
  SP_target_explosion,
  SP_target_goal,
  SP_target_help,
  SP_target_laser,
  SP_target_lightramp,
  SP_target_secret,
  SP_target_speaker,
  SP_target_spawner,
  SP_target_splash,
  SP_target_temp_entity,
  Use_Target_Speaker,
  Use_Target_Tent,
  target_explosion_explode,
  target_crosslevel_target_think,
  target_laser_off,
  target_laser_on,
  target_laser_think,
  target_laser_use,
  target_lightramp_use,
  trigger_crosslevel_trigger_use,
  use_target_explosion,
  use_target_goal,
  use_target_secret
} from "../../packages/game/src/g_target.js";
import type { game_import_t } from "../../packages/game/src/game.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";

const TARGET_LASER_START_ON = 1;
const TARGET_LASER_SPARKS = 0x80000000;

verifyTargetTempEntity();
verifyTargetSpeaker();
verifyTargetHelpSecretGoal();
verifyTargetExplosionAndSplash();
verifyChangelevelAndSpawner();
verifyCrosslevelTargets();
verifyLaserDamageAndLightramp();
verifyBlasterAndEarthquake();
verifyRuntimeEngineFlush();

console.log("quake2-g-target: ok");

function verifyTargetTempEntity(): void {
  const runtime = createRuntime();
  const ent = spawnGameEntity(runtime);
  ent.classname = "target_temp_entity";
  ent.style = temp_event_t.TE_EXPLOSION1;
  ent.s.origin = [10, 20, 30];
  SP_target_temp_entity(ent, runtime);

  Use_Target_Tent(ent, null, null, runtime);
  const events = drainGameTempEntityEvents(runtime);
  assert.equal(events.at(-1)?.type, temp_event_t.TE_EXPLOSION1, "target_temp_entity event type mismatch");
  assert.equal(events.at(-1)?.multicast, multicast_t.MULTICAST_PVS, "target_temp_entity multicast mismatch");
}

function verifyTargetSpeaker(): void {
  const runtime = createRuntime();
  const normal = spawnGameEntity(runtime);
  normal.classname = "target_speaker";
  normal.properties.noise = "misc/talk";
  SP_target_speaker(normal, runtime);

  assert.equal(runtime.assets.soundPaths[normal.noise_index - 1], "misc/talk.wav", "target_speaker wav suffix mismatch");
  assert.equal(normal.volume, 1, "target_speaker default volume mismatch");
  assert.equal(normal.attenuation, 1, "target_speaker default attenuation mismatch");
  assert.equal(normal.use, Use_Target_Speaker, "target_speaker use callback mismatch");
  assert.equal(normal.linked, true, "target_speaker must link after spawn");
  normal.use?.(normal, null, null, runtime);
  const normalSound = runtime.soundEvents.at(-1);
  assert.equal(normalSound?.soundPath, "misc/talk.wav", "target_speaker sound event mismatch");
  assert.equal(normalSound?.channel, CHAN_VOICE, "target_speaker normal channel mismatch");
  assert.equal(normalSound?.volume, 1, "target_speaker normal volume mismatch");
  assert.equal(normalSound?.attenuation, 1, "target_speaker normal attenuation mismatch");
  assert.deepEqual(normalSound?.origin, normal.s.origin, "target_speaker positioned origin mismatch");

  const reliable = spawnGameEntity(runtime);
  reliable.classname = "target_speaker";
  reliable.properties.noise = "misc/alert.wav";
  reliable.spawnflags = 4;
  reliable.volume = 0.25;
  reliable.attenuation = -1;
  reliable.origin = [4, 5, 6];
  SP_target_speaker(reliable, runtime);
  assert.equal(runtime.assets.soundPaths[reliable.noise_index - 1], "misc/alert.wav", "target_speaker must preserve wav suffix");
  assert.equal(reliable.attenuation, 0, "target_speaker attenuation -1 must map to 0");
  reliable.use?.(reliable, null, null, runtime);
  const reliableSound = runtime.soundEvents.at(-1);
  assert.equal(reliableSound?.channel, CHAN_VOICE | CHAN_RELIABLE, "target_speaker reliable channel mismatch");
  assert.equal(reliableSound?.volume, 0.25, "target_speaker custom volume mismatch");
  assert.equal(reliableSound?.attenuation, 0, "target_speaker custom attenuation mismatch");
  assert.deepEqual(reliableSound?.origin, [4, 5, 6], "target_speaker reliable origin mismatch");

  const looped = spawnGameEntity(runtime);
  looped.classname = "target_speaker";
  looped.properties.noise = "world/hum.wav";
  looped.spawnflags = 1;
  SP_target_speaker(looped, runtime);
  assert.equal(looped.s.sound, looped.noise_index, "target_speaker prestarted loop mismatch");
  looped.use?.(looped, null, null, runtime);
  assert.equal(looped.s.sound, 0, "target_speaker loop toggle off mismatch");

  const loopedOff = spawnGameEntity(runtime);
  loopedOff.classname = "target_speaker";
  loopedOff.properties.noise = "world/machine";
  loopedOff.spawnflags = 2;
  SP_target_speaker(loopedOff, runtime);
  assert.equal(loopedOff.s.sound, 0, "target_speaker looped-off spawn must not prestart");
  loopedOff.use?.(loopedOff, null, null, runtime);
  assert.equal(loopedOff.s.sound, loopedOff.noise_index, "target_speaker looped-off use must toggle on");

  const missingNoise = spawnGameEntity(runtime);
  missingNoise.classname = "target_speaker";
  SP_target_speaker(missingNoise, runtime);
  assert.equal(missingNoise.use, undefined, "target_speaker with no noise must not install use callback");
  assert.equal(missingNoise.linked, false, "target_speaker with no noise must not link");
  assert.ok(
    runtime.logEntries.some((entry) => entry.message.includes("target_speaker with no noise set")),
    "target_speaker with no noise must warn"
  );

  const longNoise = spawnGameEntity(runtime);
  longNoise.classname = "target_speaker";
  longNoise.properties.noise = "a".repeat(80);
  SP_target_speaker(longNoise, runtime);
  assert.equal(
    runtime.assets.soundPaths[longNoise.noise_index - 1],
    `${"a".repeat(80)}.wav`.slice(0, MAX_QPATH - 1),
    "target_speaker Com_sprintf buffer branch must truncate to MAX_QPATH - 1"
  );

  const longNoiseWithSuffix = spawnGameEntity(runtime);
  longNoiseWithSuffix.classname = "target_speaker";
  longNoiseWithSuffix.properties.noise = `sound/${"b".repeat(70)}.wav`;
  SP_target_speaker(longNoiseWithSuffix, runtime);
  assert.equal(
    runtime.assets.soundPaths[longNoiseWithSuffix.noise_index - 1],
    longNoiseWithSuffix.properties.noise.slice(0, MAX_QPATH - 1),
    "target_speaker strncpy buffer branch must truncate before sound registration"
  );
}

function verifyTargetHelpSecretGoal(): void {
  const runtime = createRuntime();
  const help = spawnGameEntity(runtime);
  help.classname = "target_help";
  help.message = "Find the exit";
  ED_CallSpawn(help, runtime);
  assert.equal(help.use?.name, "Use_Target_Help", "target_help spawn table must install Use_Target_Help");
  help.use?.(help, null, null, runtime);
  assert.equal(runtime.helpmessage2, "Find the exit", "target_help message mismatch");
  assert.equal(runtime.helpchanged, 1, "target_help counter mismatch");

  const help1 = spawnGameEntity(runtime);
  help1.classname = "target_help";
  help1.spawnflags = 1;
  help1.message = "Use the computer";
  SP_target_help(help1, runtime);
  help1.use?.(help1, null, null, runtime);
  assert.equal(runtime.helpmessage1, "Use the computer", "target_help spawnflag 1 must write helpmessage1");
  assert.equal(runtime.helpchanged, 2, "target_help second use must increment helpchanged");

  const longHelp = spawnGameEntity(runtime);
  longHelp.classname = "target_help";
  longHelp.message = "h".repeat(600);
  SP_target_help(longHelp, runtime);
  longHelp.use?.(longHelp, null, null, runtime);
  assert.equal(runtime.helpmessage2.length, 511, "target_help strncpy must cap helpmessage copy at 511 chars");
  assert.equal(runtime.helpmessage2, "h".repeat(511), "target_help truncated message content mismatch");

  const missingMessage = spawnGameEntity(runtime);
  missingMessage.classname = "target_help";
  SP_target_help(missingMessage, runtime);
  assert.equal(missingMessage.inuse, false, "target_help without message must free itself");
  assert.ok(
    runtime.logEntries.some((entry) => entry.message.includes("target_help with no message")),
    "target_help without message must warn"
  );

  const deathmatchRuntime = createRuntime();
  deathmatchRuntime.deathmatch = true;
  const dmHelp = spawnGameEntity(deathmatchRuntime);
  dmHelp.classname = "target_help";
  dmHelp.message = "No help in deathmatch";
  SP_target_help(dmHelp, deathmatchRuntime);
  assert.equal(dmHelp.inuse, false, "target_help must auto-remove in deathmatch");

  const secret = createHighEntity(runtime, "target_secret");
  const secretActivator = createPlayer(runtime);
  const secretTarget = spawnGameEntity(runtime);
  secretTarget.classname = "target_secret_receiver";
  secretTarget.targetname = "secret_done";
  let secretTargetActivator: GameEntity | null = null;
  secretTarget.use = (_ent, _other, activator) => {
    secretTargetActivator = activator;
  };
  secret.target = "secret_done";
  ED_CallSpawn(secret, runtime);
  assert.equal(secret.use?.name, "use_target_secret", "target_secret spawn table must install use_target_secret");
  assert.equal(runtime.assets.soundPaths[secret.noise_index - 1], "misc/secret.wav", "target_secret default sound mismatch");
  assert.equal(runtime.total_secrets, 1, "target_secret total mismatch");
  use_target_secret(secret, null, secretActivator, runtime);
  assert.equal(runtime.found_secrets, 1, "target_secret found mismatch");
  const secretSound = runtime.soundEvents.at(-1);
  assert.equal(secretSound?.soundPath, "misc/secret.wav", "target_secret use sound mismatch");
  assert.equal(secretSound?.channel, CHAN_VOICE, "target_secret sound channel mismatch");
  assert.equal(secretSound?.volume, 1, "target_secret sound volume mismatch");
  assert.equal(secretSound?.attenuation, 1, "target_secret sound attenuation mismatch");
  assert.equal(secretTargetActivator, secretActivator, "target_secret must fire targets with activator");
  assert.equal(secret.inuse, false, "target_secret must free itself");

  const customSecret = createHighEntity(runtime, "target_secret");
  customSecret.properties.noise = "custom/secret.wav";
  SP_target_secret(customSecret, runtime);
  assert.equal(runtime.assets.soundPaths[customSecret.noise_index - 1], "custom/secret.wav", "target_secret custom st.noise mismatch");
  assert.equal(customSecret.svflags, SVF_NOCLIENT, "target_secret must be hidden from clients");

  const mine3Runtime = createRuntime();
  mine3Runtime.mapname = "mine3";
  const mine3Secret = createHighEntity(mine3Runtime, "target_secret");
  mine3Secret.s.origin = [280, -2048, -624];
  SP_target_secret(mine3Secret, mine3Runtime);
  assert.equal(mine3Secret.message, "You have found a secret area.", "target_secret mine3 message hack mismatch");

  const secretDeathmatchRuntime = createRuntime();
  secretDeathmatchRuntime.deathmatch = true;
  const dmSecret = createHighEntity(secretDeathmatchRuntime, "target_secret");
  SP_target_secret(dmSecret, secretDeathmatchRuntime);
  assert.equal(dmSecret.inuse, false, "target_secret must auto-remove in deathmatch");
  assert.equal(secretDeathmatchRuntime.total_secrets, 0, "target_secret deathmatch must not increment totals");

  const goal = createHighEntity(runtime, "target_goal");
  const goalActivator = createPlayer(runtime);
  const goalTarget = spawnGameEntity(runtime);
  goalTarget.classname = "target_goal_receiver";
  goalTarget.targetname = "goal_done";
  let goalTargetActivator: GameEntity | null = null;
  goalTarget.use = (_ent, _other, activator) => {
    goalTargetActivator = activator;
  };
  goal.target = "goal_done";
  ED_CallSpawn(goal, runtime);
  assert.equal(goal.use?.name, "use_target_goal", "target_goal spawn table must install use_target_goal");
  assert.equal(runtime.assets.soundPaths[goal.noise_index - 1], "misc/secret.wav", "target_goal default sound mismatch");
  assert.equal(goal.svflags, SVF_NOCLIENT, "target_goal must be hidden from clients");
  assert.equal(runtime.total_goals, 1, "target_goal total mismatch");
  drainGameConfigstringUpdates(runtime);
  use_target_goal(goal, null, goalActivator, runtime);
  assert.equal(runtime.found_goals, 1, "target_goal found mismatch");
  const goalSound = runtime.soundEvents.at(-1);
  assert.equal(goalSound?.soundPath, "misc/secret.wav", "target_goal use sound mismatch");
  assert.equal(goalSound?.channel, CHAN_VOICE, "target_goal sound channel mismatch");
  assert.equal(goalSound?.volume, 1, "target_goal sound volume mismatch");
  assert.equal(goalSound?.attenuation, 1, "target_goal sound attenuation mismatch");
  assert.equal(goalTargetActivator, goalActivator, "target_goal must fire targets with activator");
  assert.equal(goal.inuse, false, "target_goal must free itself");
  assert.deepEqual(drainGameConfigstringUpdates(runtime), [{ index: CS_CDTRACK, value: "0" }], "target_goal must stop CD track when all goals found");

  const customGoal = createHighEntity(runtime, "target_goal");
  customGoal.properties.noise = "custom/goal.wav";
  SP_target_goal(customGoal, runtime);
  assert.equal(runtime.assets.soundPaths[customGoal.noise_index - 1], "custom/goal.wav", "target_goal custom st.noise mismatch");

  const twoGoalRuntime = createRuntime();
  const firstGoal = createHighEntity(twoGoalRuntime, "target_goal");
  const secondGoal = createHighEntity(twoGoalRuntime, "target_goal");
  SP_target_goal(firstGoal, twoGoalRuntime);
  SP_target_goal(secondGoal, twoGoalRuntime);
  drainGameConfigstringUpdates(twoGoalRuntime);
  use_target_goal(firstGoal, null, null, twoGoalRuntime);
  assert.deepEqual(drainGameConfigstringUpdates(twoGoalRuntime), [], "target_goal must not stop CD track before all goals are found");

  const goalDeathmatchRuntime = createRuntime();
  goalDeathmatchRuntime.deathmatch = true;
  const dmGoal = createHighEntity(goalDeathmatchRuntime, "target_goal");
  SP_target_goal(dmGoal, goalDeathmatchRuntime);
  assert.equal(dmGoal.inuse, false, "target_goal must auto-remove in deathmatch");
  assert.equal(goalDeathmatchRuntime.total_goals, 0, "target_goal deathmatch must not increment totals");
}

function verifyTargetExplosionAndSplash(): void {
  const runtime = createRuntime();
  const explosion = spawnGameEntity(runtime);
  explosion.classname = "target_explosion";
  explosion.dmg = 0;
  ED_CallSpawn(explosion, runtime);
  assert.equal(explosion.use, use_target_explosion, "target_explosion spawn table must install use_target_explosion");
  assert.equal(explosion.svflags, SVF_NOCLIENT, "target_explosion must be hidden from clients");
  use_target_explosion(explosion, null, null, runtime);
  const explosionEvent = drainGameTempEntityEvents(runtime).at(-1);
  assert.equal(explosionEvent?.type, temp_event_t.TE_EXPLOSION1, "target_explosion temp event mismatch");
  assert.equal(explosionEvent?.multicast, multicast_t.MULTICAST_PHS, "target_explosion multicast mismatch");

  const delayed = spawnGameEntity(runtime);
  delayed.classname = "target_explosion";
  delayed.delay = 0.3;
  delayed.dmg = 0;
  SP_target_explosion(delayed, runtime);
  delayed.use?.(delayed, null, null, runtime);
  assert.equal(delayed.nextthink, runtime.time + 0.3, "target_explosion delayed think mismatch");
  assert.equal(delayed.think, target_explosion_explode, "target_explosion delayed think callback mismatch");
  runPendingThinks(runtime, runtime.time + 0.3);
  assert.equal(delayed.nextthink, 0, "target_explosion delayed think must clear after running");
  assert.equal(drainGameTempEntityEvents(runtime).at(-1)?.type, temp_event_t.TE_EXPLOSION1, "target_explosion delayed temp event mismatch");

  const damaging = spawnGameEntity(runtime);
  damaging.classname = "target_explosion";
  damaging.dmg = 40;
  damaging.s.origin = [0, 0, 0];
  const victim = spawnGameEntity(runtime);
  victim.classname = "explosion_victim";
  victim.solid = SOLID_BBOX;
  victim.takedamage = 1;
  victim.health = 100;
  victim.s.origin = [0, 0, 0];
  const activator = createPlayer(runtime);
  use_target_explosion(damaging, null, activator, runtime);
  assert.equal(victim.health, 60, "target_explosion radius damage mismatch");
  assert.equal(runtime.meansOfDeath, MOD_EXPLOSIVE, "target_explosion damage mod mismatch");

  let receiverActivator: GameEntity | null = null;
  const chained = spawnGameEntity(runtime);
  chained.classname = "target_explosion";
  chained.dmg = 0;
  chained.delay = 0.7;
  chained.target = "after_boom";
  chained.activator = activator;
  const receiver = spawnGameEntity(runtime);
  receiver.classname = "target_explosion_receiver";
  receiver.targetname = "after_boom";
  receiver.use = (_self, _other, receivedActivator) => {
    receiverActivator = receivedActivator;
  };
  target_explosion_explode(chained, runtime);
  assert.equal(receiverActivator, activator, "target_explosion must fire targets with saved activator");
  assert.equal(chained.delay, 0.7, "target_explosion local save must restore delay after firing targets");
  assert.equal(
    runtime.entities.some((entity) => entity?.classname === "DelayedUse"),
    false,
    "target_explosion local save must prevent delayed G_UseTargets scheduling"
  );

  const splash = spawnGameEntity(runtime);
  splash.classname = "target_splash";
  splash.s.angles = [0, 90, 0];
  splash.angles = [0, 90, 0];
  splash.sounds = 1;
  SP_target_splash(splash, runtime);
  assert.equal(splash.count, 32, "target_splash default count mismatch");
  assertVec3NearlyEqual(splash.movedir, [0, 1, 0], "target_splash movedir must derive from angles");
  assert.equal(splash.svflags, SVF_NOCLIENT, "target_splash must be hidden from clients");
  splash.use?.(splash, null, null, runtime);
  const splashEvent = drainGameTempEntityEvents(runtime).at(-1);
  assert.equal(splashEvent?.type, temp_event_t.TE_SPLASH, "target_splash temp event mismatch");
  assert.equal(splashEvent?.multicast, multicast_t.MULTICAST_PVS, "target_splash multicast mismatch");
  assert.deepEqual(splashEvent?.origin, splash.s.origin, "target_splash origin mismatch");
  assert.equal(splashEvent?.payload.count, 32, "target_splash count payload mismatch");
  assertVec3NearlyEqual(splashEvent?.payload.dir as vec3_t, [0, 1, 0], "target_splash dir payload mismatch");
  assert.equal(splashEvent?.payload.sounds, 1, "target_splash sounds payload mismatch");

  const damagingSplash = spawnGameEntity(runtime);
  damagingSplash.classname = "target_splash";
  damagingSplash.s.origin = [0, 0, 0];
  damagingSplash.s.angles = [0, 0, 0];
  damagingSplash.dmg = 40;
  SP_target_splash(damagingSplash, runtime);
  const splashVictim = spawnGameEntity(runtime);
  splashVictim.classname = "splash_victim";
  splashVictim.solid = SOLID_BBOX;
  splashVictim.takedamage = 1;
  splashVictim.health = 100;
  splashVictim.s.origin = [0, 0, 0];
  const splashActivator = createPlayer(runtime);
  damagingSplash.use?.(damagingSplash, null, splashActivator, runtime);
  assert.equal(splashVictim.health, 60, "target_splash radius damage mismatch");
  assert.equal(runtime.meansOfDeath, MOD_SPLASH, "target_splash damage mod mismatch");
}

function verifyChangelevelAndSpawner(): void {
  const runtime = createRuntime();
  runtime.time = 2;
  const player = runtime.entities[1] ?? createPlayer(runtime);
  attachGameClient(player);
  player.health = 100;

  const changelevel = spawnGameEntity(runtime);
  changelevel.classname = "target_changelevel";
  changelevel.map = "unit2";
  ED_CallSpawn(changelevel, runtime);
  assert.equal(changelevel.use?.name, "use_target_changelevel", "target_changelevel spawn table must install use_target_changelevel");
  assert.equal(changelevel.svflags, SVF_NOCLIENT, "target_changelevel must be hidden from clients");
  changelevel.use?.(changelevel, player, player, runtime);
  assert.equal(runtime.intermissiontime, runtime.time, "target_changelevel must enter intermission");
  assert.equal(runtime.changemap, "unit2", "target_changelevel map mismatch");
  assert.equal(runtime.exitintermission, 1, "single-player target_changelevel should request exit");

  const alreadyActiveRuntime = createRuntime();
  alreadyActiveRuntime.time = 7;
  alreadyActiveRuntime.intermissiontime = 1;
  const alreadyActivePlayer = alreadyActiveRuntime.entities[1] ?? createPlayer(alreadyActiveRuntime);
  const alreadyActive = spawnGameEntity(alreadyActiveRuntime);
  alreadyActive.classname = "target_changelevel";
  alreadyActive.map = "unit2";
  SP_target_changelevel(alreadyActive, alreadyActiveRuntime);
  alreadyActive.use?.(alreadyActive, alreadyActivePlayer, alreadyActivePlayer, alreadyActiveRuntime);
  assert.equal(alreadyActiveRuntime.changemap, null, "active intermission must ignore repeated target_changelevel use");
  assert.equal(alreadyActiveRuntime.intermissiontime, 1, "active intermission timestamp must remain unchanged");

  const deadPlayerRuntime = createRuntime();
  deadPlayerRuntime.time = 8;
  const deadPlayer = deadPlayerRuntime.entities[1] ?? createPlayer(deadPlayerRuntime);
  deadPlayer.health = 0;
  const deadBlocked = spawnGameEntity(deadPlayerRuntime);
  deadBlocked.classname = "target_changelevel";
  deadBlocked.map = "unit2";
  SP_target_changelevel(deadBlocked, deadPlayerRuntime);
  deadBlocked.use?.(deadBlocked, deadPlayer, deadPlayer, deadPlayerRuntime);
  assert.equal(deadPlayerRuntime.intermissiontime, 0, "single-player dead player must not trigger target_changelevel");

  const missingMapRuntime = createRuntime();
  const missingMap = spawnGameEntity(missingMapRuntime);
  missingMap.classname = "target_changelevel";
  missingMap.s.origin = [1, 2, 3];
  SP_target_changelevel(missingMap, missingMapRuntime);
  assert.equal(missingMap.inuse, false, "target_changelevel without map must free itself");
  assert.ok(
    missingMapRuntime.logEntries.some((entry) => /target_changelevel with no map/.test(entry.message)),
    "target_changelevel without map warning mismatch"
  );

  const hackedRuntime = createRuntime();
  hackedRuntime.mapname = "fact1";
  const hacked = spawnGameEntity(hackedRuntime);
  hacked.classname = "target_changelevel";
  hacked.map = "fact3";
  SP_target_changelevel(hacked, hackedRuntime);
  assert.equal(hacked.map, "fact3$secret1", "target_changelevel fact1/fact3 hack mismatch");

  const blockedRuntime = createRuntime();
  blockedRuntime.time = 3;
  blockedRuntime.deathmatch = true;
  blockedRuntime.dmflags = 0;
  const victim = createPlayer(blockedRuntime);
  victim.client!.pers.netname = "player";
  victim.max_health = 10;
  victim.health = 100;
  const noexit = spawnGameEntity(blockedRuntime);
  noexit.classname = "target_changelevel";
  noexit.map = "dm2";
  SP_target_changelevel(noexit, blockedRuntime);
  noexit.use?.(noexit, victim, victim, blockedRuntime);
  assert.equal(blockedRuntime.intermissiontime, 0, "deathmatch noexit must block intermission");
  assert.equal(victim.health < 100, true, "deathmatch noexit must damage activator");
  assert.equal(blockedRuntime.meansOfDeath, MOD_EXIT, "deathmatch noexit damage mod mismatch");

  blockedRuntime.dmflags = DF_ALLOW_EXIT;
  noexit.use?.(noexit, victim, victim, blockedRuntime);
  assert.notEqual(blockedRuntime.intermissiontime, 0, "DF_ALLOW_EXIT must allow changelevel");
  assert.match(blockedRuntime.logEntries.at(-1)?.message ?? "", /player exited the level\./, "deathmatch changelevel must announce activator");

  const spawnerRuntime = createRuntime();
  const spawner = spawnGameEntity(spawnerRuntime);
  spawner.classname = "target_spawner";
  spawner.target = "target_temp_entity";
  spawner.s.origin = [9, 8, 7];
  spawner.s.angles = [0, 90, 0];
  spawner.speed = 120;
  ED_CallSpawn(spawner, spawnerRuntime);
  assert.equal(spawner.use?.name, "use_target_spawner", "target_spawner spawn table must install use_target_spawner");
  assert.equal(spawner.svflags, SVF_NOCLIENT, "target_spawner must be hidden from clients");
  assertVec3NearlyEqual(spawner.movedir, [0, 120, 0], "target_spawner movedir must be scaled by speed");
  spawner.use?.(spawner, null, null, spawnerRuntime);
  const spawned = spawnerRuntime.entities.at(-1);
  assert.equal(spawned?.classname, "target_temp_entity", "target_spawner classname mismatch");
  assert.ok(spawned?.use, "target_spawner must call spawned entity spawn function");
  assert.deepEqual(spawned?.s.origin, [9, 8, 7], "target_spawner origin mismatch");
  assert.deepEqual(spawned?.s.angles, [0, 0, 0], "target_spawner speed branch must copy angles after G_SetMovedir clears them");
  assertVec3NearlyEqual(spawned?.velocity ?? [NaN, NaN, NaN], [0, 120, 0], "target_spawner velocity mismatch");
  assert.equal(spawned?.linked, true, "target_spawner must relink spawned entity after KillBox");

  const missingTargetRuntime = createRuntime();
  const missingTargetSpawner = spawnGameEntity(missingTargetRuntime);
  missingTargetSpawner.classname = "target_spawner";
  SP_target_spawner(missingTargetSpawner, missingTargetRuntime);
  missingTargetSpawner.use?.(missingTargetSpawner, null, null, missingTargetRuntime);
  assert.equal(missingTargetRuntime.entities.at(-1)?.classname, "", "target_spawner missing target must keep null-classname branch");
  assert.ok(
    missingTargetRuntime.logEntries.some((entry) => entry.message === "ED_CallSpawn: NULL classname"),
    "target_spawner missing target must take ED_CallSpawn NULL classname warning branch"
  );
}

function verifyCrosslevelTargets(): void {
  const runtime = createRuntime();
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "target_crosslevel_trigger";
  trigger.spawnflags = SFL_CROSS_TRIGGER_1 | SFL_CROSS_TRIGGER_3;
  ED_CallSpawn(trigger, runtime);
  assert.equal(trigger.use, trigger_crosslevel_trigger_use, "target_crosslevel_trigger spawn table must install trigger_crosslevel_trigger_use");
  assert.equal(trigger.svflags, SVF_NOCLIENT, "target_crosslevel_trigger must be hidden from clients");
  runtime.serverflags = SFL_CROSS_TRIGGER_1;
  trigger_crosslevel_trigger_use(trigger, null, null, runtime);
  assert.equal(runtime.serverflags & (SFL_CROSS_TRIGGER_1 | SFL_CROSS_TRIGGER_3), SFL_CROSS_TRIGGER_1 | SFL_CROSS_TRIGGER_3, "crosslevel trigger serverflags mismatch");
  assert.equal(trigger.inuse, false, "crosslevel trigger must free itself");

  const receiver = spawnGameEntity(runtime);
  receiver.classname = "crosslevel_receiver";
  receiver.targetname = "crosslevel_done";
  let receiverActivator: GameEntity | null = null;
  receiver.use = (_ent, _other, activator) => {
    receiverActivator = activator;
  };

  const target = createHighEntity(runtime, "target_crosslevel_target");
  target.spawnflags = SFL_CROSS_TRIGGER_1 | SFL_CROSS_TRIGGER_3;
  target.target = "crosslevel_done";
  ED_CallSpawn(target, runtime);
  assert.equal(target.think, target_crosslevel_target_think, "target_crosslevel_target spawn table must install target_crosslevel_target_think");
  assert.equal(target.svflags, SVF_NOCLIENT, "target_crosslevel_target must be hidden from clients");
  assert.equal(target.nextthink, runtime.time + 1, "crosslevel target default delay mismatch");
  runPendingThinks(runtime, 1);
  assert.equal(target.inuse, false, "crosslevel target must fire and free when flags match");
  assert.equal(receiverActivator, null, "target_crosslevel_target must honor its default delayed target use");
  runPendingThinks(runtime, 2);
  assert.equal(receiverActivator, target, "target_crosslevel_target must use itself as activator after delay");

  const partialRuntime = createRuntime();
  partialRuntime.serverflags = SFL_CROSS_TRIGGER_1;
  const partialTarget = createHighEntity(partialRuntime, "target_crosslevel_target");
  partialTarget.spawnflags = SFL_CROSS_TRIGGER_1 | SFL_CROSS_TRIGGER_3;
  SP_target_crosslevel_target(partialTarget, partialRuntime);
  runPendingThinks(partialRuntime, 1);
  assert.equal(partialTarget.inuse, true, "target_crosslevel_target must remain when not all requested bits match");
  assert.equal(
    partialRuntime.entities.some((entity) => entity?.classname === "DelayedUse"),
    false,
    "target_crosslevel_target must not schedule target use when flags do not match"
  );

  runtime.serverflags = SFL_CROSS_TRIGGER_MASK | 0x100;
  const player = runtime.entities[1] ?? createPlayer(runtime);
  player.health = 100;
  const changelevel = spawnGameEntity(runtime);
  changelevel.classname = "target_changelevel";
  changelevel.map = "unit2*secret";
  SP_target_changelevel(changelevel, runtime);
  changelevel.use?.(changelevel, player, player, runtime);
  assert.equal(runtime.serverflags, 0x100, "target_changelevel must clear only crosslevel bits when changing unit");
}

function verifyLaserDamageAndLightramp(): void {
  const runtime = createRuntime();
  const laser = spawnGameEntity(runtime);
  laser.classname = "target_laser";
  laser.spawnflags = 1 | 2;
  laser.s.angles = [0, 0, 0];
  laser.angles = [0, 0, 0];
  SP_target_laser(laser, runtime);
  runPendingThinks(runtime, 1);
  assert.equal((laser.svflags & SVF_NOCLIENT) === 0, true, "target_laser START_ON visibility mismatch");
  assert.equal((laser.s.renderfx & (RF_BEAM | RF_TRANSLUCENT)), RF_BEAM | RF_TRANSLUCENT, "target_laser beam renderfx mismatch");
  assert.equal(laser.s.modelindex, 1, "target_laser must keep non-zero beam modelindex");
  assert.equal(laser.s.frame, 4, "target_laser default beam width mismatch");
  assert.equal(laser.s.skinnum, 0xf2f2f0f0, "target_laser red skinnum mismatch");
  assert.equal(laser.nextthink, runtime.time + FRAMETIME, "target_laser think cadence mismatch");
  laser.use?.(laser, null, null, runtime);
  assert.equal((laser.svflags & SVF_NOCLIENT) !== 0, true, "target_laser use must toggle off");

  const toggleRuntime = createRuntime();
  const toggleLaser = spawnGameEntity(toggleRuntime);
  toggleLaser.classname = "target_laser";
  toggleLaser.s.origin = [0, 0, 0];
  toggleLaser.movedir = [1, 0, 0];
  toggleRuntime.collision = {
    world: {} as never,
    trace: () => createTrace([48, 0, 0], null),
    pointcontents: () => 0
  };
  target_laser_on(toggleLaser, toggleRuntime);
  assert.equal(toggleLaser.activator, toggleLaser, "target_laser_on must default activator to self");
  assert.equal((toggleLaser.spawnflags & TARGET_LASER_START_ON) !== 0, true, "target_laser_on must set start-on bit");
  assert.equal((toggleLaser.spawnflags & TARGET_LASER_SPARKS) !== 0, true, "target_laser_on must set spark bit");
  assert.equal((toggleLaser.svflags & SVF_NOCLIENT) === 0, true, "target_laser_on must make beam visible");
  assertVec3NearlyEqual(toggleLaser.s.old_origin, [48, 0, 0], "target_laser_on must run immediate think");
  target_laser_off(toggleLaser, toggleRuntime);
  assert.equal((toggleLaser.spawnflags & TARGET_LASER_START_ON) === 0, true, "target_laser_off must clear only start-on bit");
  assert.equal((toggleLaser.spawnflags & TARGET_LASER_SPARKS) !== 0, true, "target_laser_off must preserve spark bit");
  assert.equal((toggleLaser.svflags & SVF_NOCLIENT) !== 0, true, "target_laser_off must hide beam");
  assert.equal(toggleLaser.nextthink, 0, "target_laser_off must cancel pending think");
  const toggleActivator = spawnGameEntity(toggleRuntime);
  toggleActivator.classname = "player";
  target_laser_use(toggleLaser, null, toggleActivator, toggleRuntime);
  assert.equal(toggleLaser.activator, toggleActivator, "target_laser_use must store activator before toggling on");
  assert.equal((toggleLaser.spawnflags & TARGET_LASER_START_ON) !== 0, true, "target_laser_use must toggle on");
  target_laser_use(toggleLaser, null, null, toggleRuntime);
  assert.equal(toggleLaser.activator, null, "target_laser_use must preserve explicit null activator like C");
  assert.equal((toggleLaser.spawnflags & TARGET_LASER_START_ON) === 0, true, "target_laser_use must toggle off");

  const tracedRuntime = createRuntime();
  const tracedLaser = spawnGameEntity(tracedRuntime);
  tracedLaser.classname = "target_laser";
  tracedLaser.spawnflags = 1;
  tracedLaser.s.origin = [0, 0, 0];
  tracedLaser.s.angles = [0, 0, 0];
  tracedLaser.angles = [0, 0, 0];
  const target = spawnGameEntity(tracedRuntime);
  target.classname = "monster_soldier";
  target.svflags |= SVF_MONSTER;
  target.takedamage = 1;
  target.health = 25;
  const wall = spawnGameEntity(tracedRuntime);
  wall.classname = "wall";
  let traceCount = 0;
  tracedRuntime.collision = {
    world: {} as never,
    trace: () => {
      traceCount += 1;
      return traceCount === 1
        ? createTrace([64, 0, 0], target)
        : createTrace([128, 0, 0], wall);
    },
    pointcontents: () => 0
  };
  SP_target_laser(tracedLaser, tracedRuntime);
  runPendingThinks(tracedRuntime, 1);
  assert.equal(target.health < 25, true, "target_laser must damage trace hit targets");
  assert.equal(tracedRuntime.meansOfDeath, MOD_TARGET_LASER, "target_laser damage mod mismatch");
  assert.equal(tracedLaser.s.old_origin[0], 128, "target_laser beam endpoint mismatch");
  const laserSparks = drainGameTempEntityEvents(tracedRuntime).find((event) => event.type === temp_event_t.TE_LASER_SPARKS);
  assert.ok(laserSparks, "target_laser wall spark mismatch");
  assert.deepEqual(laserSparks.origin, [128, 0, 0], "target_laser spark origin mismatch");
  assert.equal(laserSparks.multicast, multicast_t.MULTICAST_PVS, "target_laser spark multicast mismatch");
  assert.deepEqual(laserSparks.payload, { count: 8, dir: [0, 0, 1], color: 0 }, "target_laser spark payload mismatch");

  const immuneRuntime = createRuntime();
  const immuneLaser = spawnGameEntity(immuneRuntime);
  immuneLaser.classname = "target_laser";
  immuneLaser.spawnflags = 1;
  immuneLaser.s.origin = [0, 0, 0];
  immuneLaser.s.angles = [0, 0, 0];
  immuneLaser.angles = [0, 0, 0];
  const immuneTarget = spawnGameEntity(immuneRuntime);
  immuneTarget.classname = "laser_immune_monster";
  immuneTarget.svflags |= SVF_MONSTER;
  immuneTarget.takedamage = 1;
  immuneTarget.flags |= FL_IMMUNE_LASER;
  immuneTarget.health = 25;
  const immuneWall = spawnGameEntity(immuneRuntime);
  immuneWall.classname = "wall";
  let immuneTraceCount = 0;
  immuneRuntime.collision = {
    world: {} as never,
    trace: () => {
      immuneTraceCount += 1;
      return immuneTraceCount === 1
        ? createTrace([32, 0, 0], immuneTarget)
        : createTrace([96, 0, 0], immuneWall);
    },
    pointcontents: () => 0
  };
  SP_target_laser(immuneLaser, immuneRuntime);
  runPendingThinks(immuneRuntime, 1);
  assert.equal(immuneTarget.health, 25, "target_laser must not damage FL_IMMUNE_LASER entities");
  assert.equal(immuneTraceCount, 2, "target_laser must continue tracing through immune monsters");

  const trackingRuntime = createRuntime();
  const trackingLaser = spawnGameEntity(trackingRuntime);
  trackingLaser.classname = "target_laser";
  trackingLaser.s.origin = [0, 0, 0];
  trackingLaser.movedir = [1, 0, 0];
  const trackingEnemy = spawnGameEntity(trackingRuntime);
  trackingEnemy.classname = "info_target";
  trackingEnemy.absmin = [0, 128, 0];
  trackingEnemy.size = [0, 0, 0];
  trackingLaser.enemy = trackingEnemy;
  const trackingWall = spawnGameEntity(trackingRuntime);
  trackingWall.classname = "wall";
  trackingRuntime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => {
      assertVec3NearlyEqual(end, [0, 2048, 0], "target_laser enemy retarget trace end");
      return createTrace([0, 96, 0], trackingWall);
    },
    pointcontents: () => 0
  };
  target_laser_think(trackingLaser, trackingRuntime);
  assertVec3NearlyEqual(trackingLaser.movedir, [0, 1, 0], "target_laser enemy retarget movedir");
  const trackingSparks = drainGameTempEntityEvents(trackingRuntime).find((event) => event.type === temp_event_t.TE_LASER_SPARKS);
  assert.ok(trackingSparks, "target_laser retarget spark mismatch");
  assert.equal(trackingSparks.payload.count, 4, "target_laser count must be computed before retarget spark flag");

  const light = spawnGameEntity(runtime);
  light.classname = "light";
  light.targetname = "lamp";
  light.style = 3;

  const ramp = spawnGameEntity(runtime);
  ramp.classname = "target_lightramp";
  ramp.target = "lamp";
  ramp.message = "az";
  ramp.speed = 1;
  SP_target_lightramp(ramp, runtime);
  target_lightramp_use(ramp, null, null, runtime);
  assert.deepEqual(drainGameConfigstringUpdates(runtime), [{ index: CS_LIGHTS + light.style, value: "a" }], "target_lightramp initial lightstyle mismatch");
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assert.equal(drainGameConfigstringUpdates(runtime).length > 0, true, "target_lightramp must keep updating lightstyle");
}

function verifyBlasterAndEarthquake(): void {
  const runtime = createRuntime();
  const blaster = spawnGameEntity(runtime);
  blaster.classname = "target_blaster";
  blaster.s.angles = [0, 0, 0];
  blaster.angles = [0, 0, 0];
  ED_CallSpawn(blaster, runtime);
  assert.equal(blaster.dmg, 15, "target_blaster default damage mismatch");
  assert.equal(blaster.speed, 1000, "target_blaster default speed mismatch");
  assert.equal(blaster.svflags, SVF_NOCLIENT, "target_blaster should be hidden from clients");
  assertVec3NearlyEqual(blaster.movedir, [1, 0, 0], "target_blaster movedir mismatch");
  blaster.use?.(blaster, null, null, runtime);
  const bolt = runtime.entities.find((entity) => entity.classname === "bolt");
  assert.ok(bolt, "target_blaster must spawn one blaster bolt");
  assert.equal(bolt.dmg, 15, "target_blaster bolt damage mismatch");
  assertVec3NearlyEqual(bolt.velocity, [1000, 0, 0], "target_blaster bolt velocity mismatch");
  assert.equal(bolt.s.effects, EF_BLASTER, "target_blaster must pass EF_BLASTER like the C source");
  assert.equal(bolt.spawnflags, 1, "target_blaster must pass the C truthy final fire_blaster argument");
  assert.equal(bolt.solid, SOLID_BBOX, "target_blaster bolt solid mismatch");
  assert.equal(bolt.s.modelindex, runtime.assets.modelIndexByPath.get("models/objects/laser/tris.md2"), "target_blaster bolt model mismatch");
  assert.equal(bolt.s.sound, runtime.assets.soundIndexByPath.get("misc/lasfly.wav"), "target_blaster bolt flight sound mismatch");
  const fireSound = runtime.soundEvents.at(-1);
  assert.equal(fireSound?.soundPath, "weapons/laser2.wav", "target_blaster fire sound mismatch");
  assert.equal(fireSound?.channel, CHAN_VOICE, "target_blaster fire sound channel mismatch");
  assert.equal(fireSound?.volume, 1, "target_blaster fire sound volume mismatch");
  assert.equal(fireSound?.attenuation, ATTN_NORM, "target_blaster fire sound attenuation mismatch");

  const flaggedRuntime = createRuntime();
  const flagged = spawnGameEntity(flaggedRuntime);
  flagged.classname = "target_blaster";
  flagged.s.angles = [0, 0, 0];
  flagged.spawnflags = 1 | 2;
  flagged.dmg = 23;
  flagged.speed = 777;
  SP_target_blaster(flagged, flaggedRuntime);
  flagged.use?.(flagged, null, null, flaggedRuntime);
  const flaggedBolt = flaggedRuntime.entities.find((entity) => entity.classname === "bolt");
  assert.ok(flaggedBolt, "target_blaster flagged variant must spawn one blaster bolt");
  assert.equal(flaggedBolt.s.effects, EF_BLASTER, "target_blaster spawnflags must not change the C fire_blaster effect");
  assert.equal(flaggedBolt.spawnflags, 1, "target_blaster spawnflags must not change the C hyper argument");
  assert.equal(flaggedBolt.dmg, 23, "target_blaster explicit damage mismatch");
  assertVec3NearlyEqual(flaggedBolt.velocity, [777, 0, 0], "target_blaster explicit speed mismatch");

  const quake = spawnGameEntity(runtime);
  quake.classname = "target_earthquake";
  SP_target_earthquake(quake, runtime);
  assert.equal(quake.count, 5, "target_earthquake default count mismatch");
  assert.equal(quake.speed, 200, "target_earthquake default speed mismatch");

  const player = createPlayer(runtime);
  player.groundentity = runtime.entities[0] ?? null;
  player.mass = 100;
  quake.use?.(quake, null, player, runtime);
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assert.equal(player.groundentity, null, "target_earthquake must clear player groundentity");
  assert.equal(player.velocity[2], 200, "target_earthquake vertical velocity mismatch");
}

function verifyRuntimeEngineFlush(): void {
  const runtime = createRuntime();
  const writes: string[] = [];
  const sounds: string[] = [];
  const configstrings = new Map<number, string>();
  const multicasts: Array<{ origin: vec3_t; to: multicast_t }> = [];
  const imports = createRecordingImports(writes, configstrings, multicasts, sounds);
  const context = createGameMainContext(imports, { runtime });

  const goal = createHighEntity(runtime, "target_goal");
  SP_target_goal(goal, runtime);
  use_target_goal(goal, null, null, runtime);

  const splash = spawnGameEntity(runtime);
  splash.classname = "target_splash";
  splash.s.origin = [1, 2, 3];
  splash.movedir = [0, 0, 1];
  splash.count = 7;
  splash.sounds = 6;
  SP_target_splash(splash, runtime);
  splash.use?.(splash, null, null, runtime);

  const speaker = spawnGameEntity(runtime);
  speaker.classname = "target_speaker";
  speaker.properties.noise = "misc/talk.wav";
  speaker.spawnflags = 4;
  speaker.volume = 0.5;
  speaker.attenuation = 2;
  SP_target_speaker(speaker, runtime);
  speaker.use?.(speaker, null, null, runtime);

  G_RunFrame(context);

  assert.equal(configstrings.get(CS_CDTRACK), "0", "runtime configstring updates must flush through gi.configstring");
  assert.equal(
    sounds.at(-1),
    `positioned:${speaker.index}:${CHAN_VOICE | CHAN_RELIABLE}:${speaker.noise_index}:0.5:2:0:0,0,0`,
    "target_speaker must flush through gi.positioned_sound"
  );
  assert.deepEqual(
    writes.slice(-6),
    [
      `byte:${svc_temp_entity}`,
      `byte:${temp_event_t.TE_SPLASH}`,
      "byte:7",
      "pos:1,2,3",
      "dir:1,0,0",
      "byte:6"
    ],
    "runtime temp entity event must flush through gi.Write*"
  );
  assert.equal(multicasts.at(-1)?.to, multicast_t.MULTICAST_PVS, "runtime temp entity multicast mismatch");
  assert.equal(drainGameConfigstringUpdates(runtime).length, 0, "configstring queue must drain after G_RunFrame");
  assert.equal(drainGameTempEntityEvents(runtime).length, 0, "temp entity queue must drain after G_RunFrame");
}

function createRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 1;
  runtime.maxentities = 128;
  runtime.mapname = "unit";
  return runtime;
}

function createHighEntity(runtime: GameRuntime, classname: string): GameEntity {
  while (runtime.entities.length <= runtime.maxclients + 8) {
    const filler = spawnGameEntity(runtime);
    filler.classname = "filler";
  }

  const entity = spawnGameEntity(runtime);
  entity.classname = classname;
  return entity;
}

function createPlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  attachGameClient(player);
  player.health = 100;
  player.takedamage = 1;
  player.mass = 100;
  return player;
}

function assertVec3NearlyEqual(actual: vec3_t, expected: vec3_t, message: string): void {
  for (let i = 0; i < 3; i++) {
    assert.equal(Math.abs(actual[i] - expected[i]) < 1e-12, true, `${message} component ${i}`);
  }
}

function createRecordingImports(
  writes: string[],
  configstrings: Map<number, string>,
  multicasts: Array<{ origin: vec3_t; to: multicast_t }>,
  sounds: string[] = []
): game_import_t {
  return {
    bprintf: () => {},
    dprintf: () => {},
    cprintf: () => {},
    centerprintf: () => {},
    sound: (entity, channel, soundIndex, volume, attenuation, timeofs) => {
      sounds.push(`sound:${entity?.index ?? -1}:${channel}:${soundIndex}:${volume}:${attenuation}:${timeofs}`);
    },
    positioned_sound: (origin, entity, channel, soundIndex, volume, attenuation, timeofs) => {
      sounds.push(`positioned:${entity?.index ?? -1}:${channel}:${soundIndex}:${volume}:${attenuation}:${timeofs}:${origin.join(",")}`);
    },
    configstring: (index, value) => {
      configstrings.set(index, value);
    },
    error: (fmt) => {
      throw new Error(fmt);
    },
    modelindex: () => 0,
    soundindex: () => 0,
    imageindex: () => 0,
    setmodel: () => {},
    trace: () => createTrace([0, 0, 0], null),
    pointcontents: () => 0,
    inPVS: () => false,
    inPHS: () => false,
    SetAreaPortalState: () => {},
    AreasConnected: () => false,
    linkentity: () => {},
    unlinkentity: () => {},
    BoxEdicts: () => 0,
    Pmove: () => {},
    multicast: (origin, to) => {
      multicasts.push({ origin: [...origin], to });
    },
    unicast: () => {},
    WriteChar: (value) => writes.push(`char:${value}`),
    WriteByte: (value) => writes.push(`byte:${value}`),
    WriteShort: (value) => writes.push(`short:${value}`),
    WriteLong: (value) => writes.push(`long:${value}`),
    WriteFloat: (value) => writes.push(`float:${value}`),
    WriteString: (value) => writes.push(`string:${value}`),
    WritePosition: (value) => writes.push(`pos:${value.join(",")}`),
    WriteDir: (value) => writes.push(`dir:${value.join(",")}`),
    WriteAngle: (value) => writes.push(`angle:${value}`),
    TagMalloc: () => new Uint8Array(0),
    TagFree: () => {},
    FreeTags: () => {},
    cvar: (_name, value) => ({ name: "", string: value, latched_string: "", flags: 0, modified: false, value: Number(value) || 0 }),
    cvar_set: () => null,
    cvar_forceset: () => null,
    argc: () => 0,
    argv: () => "",
    args: () => "",
    AddCommandString: () => {},
    DebugGraph: () => {}
  };
}

function createTrace(endpos: vec3_t, ent: GameEntity | null): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: ent ? 0.5 : 1,
    endpos: [...endpos],
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
