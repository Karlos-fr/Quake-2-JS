/**
 * File: quake2-p-client.ts
 * Purpose: Verify the player-client lifecycle helpers ported from `game/p_client.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for default runtime wiring in `p_client.ts`.
 *
 * Dependencies:
 * - packages/game
 */

import { strict as assert } from "node:assert";

import {
  DF_QUAD_DROP,
  DF_SPAWN_FARTHEST,
  MASK_DEADSOLID,
  MASK_PLAYERSOLID,
  entity_event_t,
  pmtype_t,
  PMF_NO_PREDICTION,
  PMF_TIME_TELEPORT,
  type trace_t
} from "../../packages/qcommon/src/index.js";
import {
  BODY_QUEUE_SIZE,
  DEAD_DEAD,
  DROPPED_PLAYER_ITEM,
  FL_GODMODE,
  FL_NOTARGET,
  FL_POWER_ARMOR,
  MOD_BFG_BLAST,
  MOD_BFG_EFFECT,
  MOD_BFG_LASER,
  MOD_BLASTER,
  MOD_BARREL,
  MOD_BOMB,
  MOD_CHAINGUN,
  MOD_CRUSH,
  MOD_EXIT,
  MOD_EXPLOSIVE,
  MOD_FALLING,
  MOD_FRIENDLY_FIRE,
  MOD_G_SPLASH,
  MOD_GRENADE,
  MOD_HANDGRENADE,
  MOD_HELD_GRENADE,
  MOD_HG_SPLASH,
  MOD_HIT,
  MOD_HYPERBLASTER,
  MOD_LAVA,
  MOD_MACHINEGUN,
  MOD_R_SPLASH,
  MOD_RAILGUN,
  MOD_ROCKET,
  MOD_SHOTGUN,
  MOD_SLIME,
  MOD_SPLASH,
  MOD_SSHOTGUN,
  MOD_SUICIDE,
  MOD_TARGET_BLASTER,
  MOD_TARGET_LASER,
  MOD_TELEFRAG,
  MOD_TRIGGER_HURT,
  MOD_WATER,
  damage_t,
  weaponstate_t
} from "../../packages/game/src/g_local.js";
import { FindItem } from "../../packages/game/src/g_items.js";
import {
  ClientConnect,
  ClientBegin,
  ClientDisconnect,
  ClientThink,
  ClientObituary,
  CopyToBodyQue,
  FetchClientEntData,
  InitBodyQue,
  InitClientPersistant,
  InitClientResp,
  IsFemale,
  IsNeutral,
  PlayersRangeFromSpot,
  PM_trace,
  PutClientInServer,
  PrintPmove,
  SaveClientData,
  SelectCoopSpawnPoint,
  SelectDeathmatchSpawnPoint,
  SelectFarthestDeathmatchSpawnPoint,
  SelectRandomDeathmatchSpawnPoint,
  SelectSpawnPoint,
  SP_CreateCoopSpots,
  SP_FixCoopSpots,
  SP_info_player_coop,
  SP_info_player_deathmatch,
  SP_info_player_intermission,
  SP_info_player_start,
  TossClientWeapon,
  ThrowClientHead,
  CheckBlock,
  player_pain,
  player_die,
  respawn
} from "../../packages/game/src/p_client.js";
import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  spawnGameEntity,
  type GameRuntime
} from "../../packages/game/src/runtime.js";

main();

function main(): void {
  verifyInitialClientStateHelpers();
  verifyPlayerStartSpawnFunctions();
  verifySpawnPointSelectionMatchesOriginalEdges();
  verifyClientUserinfoChangedConnectAndBegin();
  verifyBodyQueueUsesOriginalSizeAndWraps();
  verifyClientConnectRespectsAutosavedPersistentState();
  verifyClientObituaryWeaponMeansOfDeath();
  verifyClientObituaryWorldMeansOfDeath();
  verifyPutClientInServerClearsWeaponState();
  verifyTossClientWeaponUsesDefaultDropItem();
  verifyPlayerDieUsesDefaultSoundAndGibs();
  verifyThrowClientHeadUsesGLocalRandomHelpers();
  verifyPmoveTraceAndDebugHelpers();
  verifyClientThinkIntermissionChaseAndButtons();

  console.log("Verification p_client - player lifecycle defaults OK");
}

function verifyInitialClientStateHelpers(): void {
  const runtime = createHarnessRuntime();
  runtime.coop = true;
  runtime.framenum = 123;
  const player = spawnGameEntity(runtime);
  const client = attachGameClient(player);

  InitClientPersistant(client);
  const blaster = requireItem("Blaster");
  assert.equal(client.pers.selected_item, blaster.index, "InitClientPersistant should select the Blaster");
  assert.equal(client.pers.inventory[blaster.index], 1, "InitClientPersistant should grant one Blaster");
  assert.equal(client.pers.weapon, blaster, "InitClientPersistant should equip the Blaster");
  assert.equal(client.pers.health, 100, "InitClientPersistant health mismatch");
  assert.equal(client.pers.max_bullets, 200, "InitClientPersistant bullet max mismatch");
  assert.equal(client.pers.max_shells, 100, "InitClientPersistant shell max mismatch");
  assert.equal(client.pers.max_rockets, 50, "InitClientPersistant rocket max mismatch");
  assert.equal(client.pers.max_grenades, 50, "InitClientPersistant grenade max mismatch");
  assert.equal(client.pers.max_cells, 200, "InitClientPersistant cell max mismatch");
  assert.equal(client.pers.max_slugs, 50, "InitClientPersistant slug max mismatch");
  assert.equal(client.pers.connected, true, "InitClientPersistant should mark the client connected");

  client.pers.score = 7;
  InitClientResp(client, runtime);
  assert.equal(client.resp.enterframe, 123, "InitClientResp should copy the level framenum");
  assert.equal(client.resp.coop_respawn.score, 7, "InitClientResp should snapshot pers into coop_respawn");

  player.inuse = true;
  player.health = 42;
  player.max_health = 88;
  player.flags = FL_GODMODE | FL_NOTARGET | FL_POWER_ARMOR;
  client.resp.score = 11;
  SaveClientData(runtime);
  assert.equal(client.pers.health, 42, "SaveClientData should mirror entity health");
  assert.equal(client.pers.max_health, 88, "SaveClientData should mirror entity max_health");
  assert.equal(client.pers.score, 11, "SaveClientData should mirror coop score");

  player.health = 1;
  player.max_health = 2;
  client.resp.score = 0;
  FetchClientEntData(player, runtime);
  assert.equal(player.health, 42, "FetchClientEntData should restore pers health");
  assert.equal(player.max_health, 88, "FetchClientEntData should restore pers max_health");
  assert.equal(client.resp.score, 11, "FetchClientEntData should restore coop score");

  client.pers.userinfo = "\\gender\\female";
  assert.equal(IsFemale(player), true, "IsFemale should read female userinfo");
  assert.equal(IsNeutral(player), false, "IsNeutral should reject female userinfo");
  client.pers.userinfo = "\\gender\\cyborg";
  assert.equal(IsNeutral(player), true, "IsNeutral should accept non male/female userinfo");
  player_pain(player, null, 12, 34, runtime);
}

function verifyPlayerStartSpawnFunctions(): void {
  const runtime = createHarnessRuntime();
  runtime.coop = true;
  runtime.mapname = "security";
  runtime.time = 10;
  const start = spawnGameEntity(runtime);
  start.classname = "info_player_start";
  SP_info_player_start(start, runtime);
  assert.ok(start.think, "SP_info_player_start should schedule the security coop spot workaround");

  SP_CreateCoopSpots(start, runtime);
  const coopSpots = runtime.entities.filter((entity) => entity.classname === "info_player_coop");
  assert.equal(coopSpots.length, 3, "SP_CreateCoopSpots should create the three original security coop spots");
  assert.deepEqual(coopSpots.map((spot) => spot.s.origin), [[124, -164, 80], [252, -164, 80], [316, -164, 80]]);
  assert.ok(coopSpots.every((spot) => spot.targetname === "jail3" && spot.s.angles[1] === 90), "security coop spots should preserve target/yaw");

  const coop = spawnGameEntity(runtime);
  coop.classname = "info_player_coop";
  runtime.mapname = "jail2";
  SP_info_player_coop(coop, runtime);
  assert.ok(coop.think, "SP_info_player_coop should schedule targetname fixups for original hack maps");

  const namedStart = spawnGameEntity(runtime);
  namedStart.classname = "info_player_start";
  namedStart.targetname = "named";
  namedStart.s.origin = [128, 0, 0];
  coop.s.origin = [256, 0, 0];
  SP_FixCoopSpots(coop, runtime);
  assert.equal(coop.targetname, "named", "SP_FixCoopSpots should copy the nearest named start target");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = false;
  while (deathmatchRuntime.entities.length <= deathmatchRuntime.maxclients + BODY_QUEUE_SIZE) {
    spawnGameEntity(deathmatchRuntime);
  }
  const deathmatchSpot = spawnGameEntity(deathmatchRuntime);
  deathmatchSpot.classname = "info_player_deathmatch";
  deathmatchSpot.inuse = true;
  SP_info_player_deathmatch(deathmatchSpot, deathmatchRuntime);
  assert.equal(deathmatchSpot.inuse, false, "SP_info_player_deathmatch should free spots outside deathmatch");

  const intermission = spawnGameEntity(runtime);
  SP_info_player_intermission(intermission, runtime);
}

function verifySpawnPointSelectionMatchesOriginalEdges(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.inuse = true;
  player.health = 100;
  player.s.origin = [0, 0, 0];

  const first = spawnDeathmatchSpot(runtime, [100, 0, 0]);
  const closest = spawnDeathmatchSpot(runtime, [50, 0, 0]);
  const secondClosest = spawnDeathmatchSpot(runtime, [75, 0, 0]);

  assert.equal(PlayersRangeFromSpot(first, runtime), 100, "PlayersRangeFromSpot distance mismatch");
  assert.equal(SelectFarthestDeathmatchSpawnPoint(runtime), first, "SelectFarthestDeathmatchSpawnPoint should choose farthest spot");
  runtime.dmflags = DF_SPAWN_FARTHEST;
  assert.equal(SelectDeathmatchSpawnPoint(runtime), first, "SelectDeathmatchSpawnPoint should honor DF_SPAWN_FARTHEST");

  runtime.dmflags = 0;
  withMockedMathRandom([0], () => {
    assert.equal(
      SelectRandomDeathmatchSpawnPoint(runtime),
      first,
      "SelectRandomDeathmatchSpawnPoint should preserve the original non-shifting closest-two algorithm"
    );
  });
  assert.ok(closest && secondClosest, "deathmatch spot setup should keep closest candidates live");

  const coopRuntime = createHarnessRuntime();
  coopRuntime.coop = true;
  coopRuntime.spawnpoint = "target";
  const firstPlayer = spawnGameEntity(coopRuntime);
  attachGameClient(firstPlayer);
  assert.equal(SelectCoopSpawnPoint(firstPlayer, coopRuntime), null, "first coop player should use the normal start");
  const secondPlayer = spawnGameEntity(coopRuntime);
  attachGameClient(secondPlayer);
  spawnCoopSelectionSpot(coopRuntime, "other");
  const expected = spawnCoopSelectionSpot(coopRuntime, "target");
  assert.equal(SelectCoopSpawnPoint(secondPlayer, coopRuntime), expected, "SelectCoopSpawnPoint should match spawnpoint target by client slot");

  const normalRuntime = createHarnessRuntime();
  normalRuntime.spawnpoint = "";
  const start = spawnGameEntity(normalRuntime);
  start.classname = "info_player_start";
  start.s.origin = [8, 16, 24];
  start.s.angles = [0, 90, 0];
  const selected = SelectSpawnPoint(spawnGameEntity(normalRuntime), normalRuntime);
  assert.deepEqual(selected.origin, [8, 16, 33], "SelectSpawnPoint should add the original 9 unit spawn lift");
  assert.deepEqual(selected.angles, [0, 90, 0], "SelectSpawnPoint should copy spawn angles");
}

function verifyClientUserinfoChangedConnectAndBegin(): void {
  const runtime = createHarnessRuntime();
  runtime.maxclients = 1;
  runtime.deathmatch = true;
  const player = spawnGameEntity(runtime);
  const client = attachGameClient(player);
  const configstrings: string[] = [];
  const prints: string[] = [];

  assert.equal(
    ClientConnect(player, "\\name\\Ranger\\skin\\female/athena\\spectator\\1\\fov\\175\\hand\\2", runtime, {
      onConfigstringPlayer: (playernum, value) => {
        configstrings[playernum] = value;
      },
      onPrint: (_level, message) => {
        prints.push(message);
      }
    }),
    true,
    "ClientConnect should accept a normal userinfo payload"
  );
  assert.equal(client.pers.netname, "Ranger", "ClientConnect should apply netname through ClientUserinfoChanged");
  assert.equal(client.pers.spectator, true, "ClientUserinfoChanged should enable spectators only in deathmatch");
  assert.equal(client.ps.fov, 160, "ClientUserinfoChanged should clamp fov to 160");
  assert.equal(client.pers.hand, 2, "ClientUserinfoChanged should apply handedness");
  assert.equal(configstrings[0], "Ranger\\female/athena", "ClientUserinfoChanged should publish player skin configstring");
  assert.deepEqual(prints, [], "single-client ClientConnect should not print a connection broadcast");

  runtime.deathmatch = false;
  ClientConnect(player, "\\name\\Bad\\skin\\male/grunt\\spectator\\1", runtime);
  assert.equal(client.pers.spectator, false, "ClientUserinfoChanged should ignore spectator outside deathmatch");

  runtime.deathmatch = true;
  runtime.maxclients = 2;
  const begun = spawnGameEntity(runtime);
  begun.client = client;
  begun.inuse = false;
  const loginEffects: number[] = [];
  ClientBegin(begun, runtime, {
    SelectSpawnPoint: () => ({ origin: [10, 20, 30], angles: [0, 45, 0] }),
    KillBox: () => true,
    onLoginEffect: (ent) => {
      loginEffects.push(ent.index);
    }
  });
  assert.equal(begun.inuse, true, "ClientBegin deathmatch should put the client in server");
  assert.deepEqual(begun.s.origin, [10, 20, 31], "ClientBegin should use PutClientInServer spawn placement");
  assert.deepEqual(loginEffects, [begun.index], "ClientBegin deathmatch should emit the login effect");

  const respawnRuntime = createHarnessRuntime();
  respawnRuntime.deathmatch = true;
  InitBodyQue(respawnRuntime);
  const respawning = spawnGameEntity(respawnRuntime);
  attachGameClient(respawning);
  respawning.movetype = 0;
  respawnRuntime.time = 4;
  PutClientInServer(respawning, respawnRuntime, {
    SelectSpawnPoint: () => ({ origin: [1, 2, 3], angles: [0, 0, 0] }),
    KillBox: () => true
  });
  respawning.health = 0;
  respawning.deadflag = DEAD_DEAD;
  respawning.client!.respawn_time = 3;
  respawning.client!.latched_buttons = 1;
  respawning.client!.buttons = 1;
  respawning.client!.oldbuttons = 0;
  respawning.client!.pers.spectator = false;
  respawning.client!.resp.spectator = true;
  respawning.client!.pers.userinfo = "\\spectator\\0\\password\\";
  respawning.client!.pers.netname = "Player";
  respawning.client!.pers.score = 9;
  respawning.client!.resp.score = 9;
  const messages: string[] = [];
  respawnRuntime.time = 9;
  respawn(respawning, respawnRuntime, {
    SelectSpawnPoint: () => ({ origin: [5, 6, 7], angles: [0, 0, 0] }),
    KillBox: () => true,
    onBodyQueueCopy: () => undefined
  });
  assert.equal(respawning.s.event, entity_event_t.EV_PLAYER_TELEPORT, "respawn path should emit EV_PLAYER_TELEPORT");
  assert.equal((respawning.client!.ps.pmove.pm_flags & PMF_TIME_TELEPORT) !== 0, true, "respawn path should apply teleport hold");
  assert.deepEqual(messages, [], "respawn should not broadcast spectator join/leave messages");

  const disconnectMessages: string[] = [];
  const disconnected = spawnGameEntity(runtime);
  attachGameClient(disconnected).pers.netname = "Leaver";
  disconnected.inuse = true;
  disconnected.solid = 1;
  let logoutEffect = 0;
  let unlinked = 0;
  let clearedSkin = "";
  ClientDisconnect(disconnected, runtime, {
    onPrint: (_level, message) => {
      disconnectMessages.push(message);
    },
    onDisconnectEffect: () => {
      logoutEffect += 1;
    },
    onUnlinkEntity: () => {
      unlinked += 1;
    },
    onConfigstringPlayer: (_playernum, value) => {
      clearedSkin = value;
    }
  });
  assert.deepEqual(disconnectMessages, ["Leaver disconnected\n"], "ClientDisconnect should broadcast the original message");
  assert.equal(logoutEffect, 1, "ClientDisconnect should emit logout effect through the hook");
  assert.equal(unlinked, 1, "ClientDisconnect should unlink through the hook");
  assert.equal(disconnected.inuse, false, "ClientDisconnect should mark the entity unused");
  assert.equal(disconnected.classname, "disconnected", "ClientDisconnect classname mismatch");
  assert.equal(disconnected.client!.pers.connected, false, "ClientDisconnect should clear pers.connected");
  assert.equal(clearedSkin, "", "ClientDisconnect should clear the player skin configstring");
}

function verifyPutClientInServerClearsWeaponState(): void {
  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  const client = attachGameClient(player);
  client.pers.health = 100;
  client.pers.spectator = true;
  client.weaponstate = weaponstate_t.WEAPON_FIRING;
  client.killer_yaw = 270;
  client.fall_time = 42;

  PutClientInServer(player, runtime, {
    SelectSpawnPoint: () => ({ origin: [16, 32, 48], angles: [0, 90, 0] }),
    KillBox: () => true
  });

  assert.equal(client.weaponstate, weaponstate_t.WEAPON_READY, "PutClientInServer must memset weaponstate back to WEAPON_READY");
  assert.equal(client.killer_yaw, 0, "PutClientInServer must clear transient killer_yaw");
  assert.equal(client.fall_time, 0, "PutClientInServer must clear transient fall_time");
  assert.equal(client.newweapon, null, "PutClientInServer must clear newweapon for spectator spawn");
}

function verifyClientObituaryWeaponMeansOfDeath(): void {
  const cases: Array<[number, string]> = [
    [MOD_BLASTER, "victim was blasted by attacker\n"],
    [MOD_SHOTGUN, "victim was gunned down by attacker\n"],
    [MOD_SSHOTGUN, "victim was blown away by attacker's super shotgun\n"],
    [MOD_MACHINEGUN, "victim was machinegunned by attacker\n"],
    [MOD_CHAINGUN, "victim was cut in half by attacker's chaingun\n"],
    [MOD_GRENADE, "victim was popped by attacker's grenade\n"],
    [MOD_G_SPLASH, "victim was shredded by attacker's shrapnel\n"],
    [MOD_ROCKET, "victim ate attacker's rocket\n"],
    [MOD_R_SPLASH, "victim almost dodged attacker's rocket\n"],
    [MOD_HYPERBLASTER, "victim was melted by attacker's hyperblaster\n"],
    [MOD_RAILGUN, "victim was railed by attacker\n"],
    [MOD_BFG_LASER, "victim saw the pretty lights from attacker's BFG\n"],
    [MOD_BFG_BLAST, "victim was disintegrated by attacker's BFG blast\n"],
    [MOD_BFG_EFFECT, "victim couldn't hide from attacker's BFG\n"],
    [MOD_HANDGRENADE, "victim caught attacker's handgrenade\n"],
    [MOD_HG_SPLASH, "victim didn't see attacker's handgrenade\n"],
    [MOD_HELD_GRENADE, "victim feels attacker's pain\n"],
    [MOD_TELEFRAG, "victim tried to invade attacker's personal space\n"]
  ];

  for (const [mod, expected] of cases) {
    const runtime = createHarnessRuntime();
    runtime.deathmatch = true;
    runtime.meansOfDeath = mod;
    const victim = spawnGameEntity(runtime);
    attachGameClient(victim);
    victim.client!.pers.netname = "victim";
    const attacker = spawnGameEntity(runtime);
    attachGameClient(attacker);
    attacker.client!.pers.netname = "attacker";

    const prints: string[] = [];
    ClientObituary(victim, null, attacker, runtime, {
      onPrint: (_level, message) => {
        prints.push(message);
      }
    });

    assert.deepEqual(prints, [expected], `ClientObituary message mismatch for mod ${mod}`);
    assert.equal(victim.enemy, attacker, `ClientObituary should assign attacker enemy for mod ${mod}`);
    assert.equal(attacker.client!.resp.score, 1, `ClientObituary should credit attacker for mod ${mod}`);
  }
}

function verifyClientObituaryWorldMeansOfDeath(): void {
  const worldCases: Array<[number, string]> = [
    [MOD_SUICIDE, "victim suicides.\n"],
    [MOD_FALLING, "victim cratered.\n"],
    [MOD_CRUSH, "victim was squished.\n"],
    [MOD_WATER, "victim sank like a rock.\n"],
    [MOD_SLIME, "victim melted.\n"],
    [MOD_LAVA, "victim does a back flip into the lava.\n"],
    [MOD_EXPLOSIVE, "victim blew up.\n"],
    [MOD_BARREL, "victim blew up.\n"],
    [MOD_EXIT, "victim found a way out.\n"],
    [MOD_TARGET_LASER, "victim saw the light.\n"],
    [MOD_TARGET_BLASTER, "victim got blasted.\n"],
    [MOD_BOMB, "victim was in the wrong place.\n"],
    [MOD_SPLASH, "victim was in the wrong place.\n"],
    [MOD_TRIGGER_HURT, "victim was in the wrong place.\n"]
  ];

  for (const [mod, expected] of worldCases) {
    const runtime = createHarnessRuntime();
    runtime.deathmatch = true;
    runtime.meansOfDeath = mod;
    const victim = spawnGameEntity(runtime);
    const client = attachGameClient(victim);
    client.pers.netname = "victim";

    const prints: string[] = [];
    ClientObituary(victim, null, null, runtime, {
      onPrint: (_level, message) => {
        prints.push(message);
      }
    });

    assert.deepEqual(prints, [expected], `ClientObituary world message mismatch for mod ${mod}`);
    assert.equal(victim.enemy, null, `ClientObituary should not assign enemy for world mod ${mod}`);
    assert.equal(client.resp.score, -1, `ClientObituary should penalize victim for world mod ${mod}`);
  }

  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.meansOfDeath = MOD_HELD_GRENADE;
  const victim = spawnGameEntity(runtime);
  const client = attachGameClient(victim);
  client.pers.netname = "victim";

  const prints: string[] = [];
  ClientObituary(victim, null, victim, runtime, {
    onPrint: (_level, message) => {
      prints.push(message);
    }
  });

  assert.deepEqual(prints, ["victim tried to put the pin back in.\n"], "ClientObituary held grenade suicide message mismatch");
  assert.equal(victim.enemy, null, "ClientObituary held grenade suicide must clear enemy");
  assert.equal(client.resp.score, -1, "ClientObituary held grenade suicide should penalize victim");

  const defaultRuntime = createHarnessRuntime();
  defaultRuntime.deathmatch = true;
  defaultRuntime.meansOfDeath = MOD_HIT;
  const defaultVictim = spawnGameEntity(defaultRuntime);
  attachGameClient(defaultVictim).pers.netname = "victim";
  const defaultPrints: string[] = [];
  ClientObituary(defaultVictim, null, null, defaultRuntime, {
    onPrint: (_level, message) => {
      defaultPrints.push(message);
    }
  });
  assert.deepEqual(defaultPrints, ["victim died.\n"], "ClientObituary MOD_HIT world fallback mismatch");

  const friendlyRuntime = createHarnessRuntime();
  friendlyRuntime.deathmatch = true;
  friendlyRuntime.meansOfDeath = MOD_BLASTER | MOD_FRIENDLY_FIRE;
  const friendlyVictim = spawnGameEntity(friendlyRuntime);
  attachGameClient(friendlyVictim).pers.netname = "victim";
  const friendlyAttacker = spawnGameEntity(friendlyRuntime);
  const friendlyAttackerClient = attachGameClient(friendlyAttacker);
  friendlyAttackerClient.pers.netname = "attacker";
  const friendlyPrints: string[] = [];
  ClientObituary(friendlyVictim, null, friendlyAttacker, friendlyRuntime, {
    onPrint: (_level, message) => {
      friendlyPrints.push(message);
    }
  });
  assert.deepEqual(friendlyPrints, ["victim was blasted by attacker\n"], "ClientObituary friendly-fire message mismatch");
  assert.equal(friendlyAttackerClient.resp.score, -1, "ClientObituary friendly fire should penalize attacker");
}

function verifyClientConnectRespectsAutosavedPersistentState(): void {
  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  const client = attachGameClient(player);
  const shotgun = requireItem("Shotgun");
  const blaster = requireItem("Blaster");

  client.pers.weapon = shotgun;
  player.inuse = false;
  runtime.autosaved = false;
  assert.equal(ClientConnect(player, "\\name\\manual", runtime), true, "ClientConnect should accept manual connects");
  assert.equal(client.pers.weapon, blaster, "manual ClientConnect should reinitialize pers.weapon like non-autosaved C loads");

  player.inuse = false;
  client.pers.weapon = shotgun;
  runtime.autosaved = true;
  assert.equal(ClientConnect(player, "\\name\\auto", runtime), true, "ClientConnect should accept autosaved connects");
  assert.equal(client.pers.weapon, shotgun, "autosaved ClientConnect should preserve existing pers.weapon");
}

function verifyBodyQueueUsesOriginalSizeAndWraps(): void {
  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.inuse = true;
  player.classname = "player";
  player.s.origin = [32, 64, 96];
  player.origin = [32, 64, 96];
  player.s.angles = [0, 90, 0];
  player.angles = [0, 90, 0];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  player.solid = 1;

  InitBodyQue(runtime);

  const bodies = runtime.entities.filter((entity) => entity.classname === "bodyque");
  assert.equal(bodies.length, BODY_QUEUE_SIZE, "InitBodyQue should allocate the original body queue size");

  let firstBody = null as (typeof player) | null;
  CopyToBodyQue(player, runtime, {
    onBodyQueueCopy: (_source, body) => {
      firstBody = body;
    }
  });
  assert.ok(firstBody, "CopyToBodyQue should target a queued body");
  assert.equal(firstBody.s.number, firstBody.index, "CopyToBodyQue should preserve the body edict number");
  assert.deepEqual(firstBody.s.origin, player.s.origin, "CopyToBodyQue should copy the player origin");
  assert.equal(runtime.body_que, 1, "CopyToBodyQue should advance the body queue");

  for (let i = 1; i < BODY_QUEUE_SIZE; i += 1) {
    CopyToBodyQue(player, runtime);
  }
  assert.equal(runtime.body_que, 0, "CopyToBodyQue should wrap with BODY_QUEUE_SIZE");
}

function verifyTossClientWeaponUsesDefaultDropItem(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.dmflags = DF_QUAD_DROP;
  runtime.framenum = 10;
  runtime.time = 3;

  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  const shotgun = requireItem("Shotgun");
  const shells = requireItem("Shells");

  player.client!.pers.weapon = shotgun;
  player.client!.ammo_index = shells.index;
  player.client!.pers.inventory[shells.index] = 4;
  player.client!.quad_framenum = 40;

  TossClientWeapon(player, runtime);

  const droppedWeapon = runtime.entities.find((entity) => entity.classname === shotgun.classname);
  assert.ok(droppedWeapon, "TossClientWeapon should drop the current non-blaster weapon without a hook");
  assert.equal(droppedWeapon.spawnflags, DROPPED_PLAYER_ITEM, "dropped weapon should be marked as DROPPED_PLAYER_ITEM");

  const droppedQuad = runtime.entities.find((entity) => entity.classname === "item_quad");
  assert.ok(droppedQuad, "TossClientWeapon should drop active quad without a hook");
  assert.ok((droppedQuad.spawnflags & DROPPED_PLAYER_ITEM) !== 0, "dropped quad should preserve DROPPED_PLAYER_ITEM");
  assert.ok(droppedQuad.touch, "dropped quad should be touchable like the original Touch_Item path");
}

function verifyPlayerDieUsesDefaultSoundAndGibs(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.time = 12;

  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.inuse = true;
  player.classname = "player";
  player.health = -50;
  player.client!.pers.netname = "unit";

  player_die(player, null, player, 80, runtime);

  assert.equal(player.deadflag, DEAD_DEAD, "player_die should mark the player dead");
  assert.equal(player.takedamage, damage_t.DAMAGE_NO, "gibbed player should no longer take damage");
  assert.ok(
    player.model === "models/objects/gibs/head2/tris.md2" || player.model === "models/objects/gibs/skull/tris.md2",
    "gibbed player should become the client head/skull entity"
  );

  const meatGibs = runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2");
  assert.equal(meatGibs.length, 4, "player_die should spawn the four original meat gibs");

  const sounds = drainGameSoundEvents(runtime);
  assert.ok(
    sounds.some((event) => event.soundPath === "misc/udeath.wav"),
    "player_die should queue the default universal death sound"
  );
}

function verifyThrowClientHeadUsesGLocalRandomHelpers(): void {
  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.velocity = [0, 0, 0];

  withMockedMathRandom([0.75, 0, 0.99999, 0], () => {
    ThrowClientHead(player, 80, runtime);
  });

  assert.equal(player.model, "models/objects/gibs/head2/tris.md2", "ThrowClientHead keeps rand()&1 head selection");
  assert.equal(player.s.skinnum, 1, "ThrowClientHead applies the player-head skin branch");
  assertAlmostEqual(player.velocity[0], -120, "ThrowClientHead x velocity uses g_local.crandom");
  assertAlmostEqual(player.velocity[1], 120, "ThrowClientHead y velocity uses g_local.crandom");
  assertAlmostEqual(player.velocity[2], 240, "ThrowClientHead z velocity uses g_local.random");
}

function verifyPmoveTraceAndDebugHelpers(): void {
  assert.equal(CheckBlock(new Uint8Array([1, 2, 255, 0]), 4), 258, "CheckBlock should sum source bytes through the requested count");
  assert.equal(CheckBlock([7, 8, 9], 2), 15, "CheckBlock should stop at the explicit count");

  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.health = 100;
  const masks: number[] = [];
  runtime.collision = {
    world: null as never,
    trace: (_start, _mins, _maxs, end, passent, contentmask) => {
      masks.push(contentmask);
      assert.equal(passent, player, "PM_trace should pass through the player as passent");
      return createTrace(end);
    },
    pointcontents: () => 0
  };

  assert.equal(PM_trace([0, 0, 0], [-16, -16, -24], [16, 16, 32], [8, 0, 0], player, runtime).fraction, 1);
  player.health = 0;
  PM_trace([0, 0, 0], [-16, -16, -24], [16, 16, 32], [16, 0, 0], player, runtime);
  assert.deepEqual(masks, [MASK_PLAYERSOLID, MASK_DEADSOLID], "PM_trace should choose the original health-dependent masks");

  const pmoveLine = PrintPmove({
    s: {
      pm_type: pmtype_t.PM_NORMAL,
      origin: [1, 2, 3],
      velocity: [4, 5, 6],
      pm_flags: 7,
      pm_time: 8,
      gravity: 800,
      delta_angles: [9, 10, 11]
    },
    cmd: {
      msec: 12,
      buttons: 1,
      angles: [13, 14, 15],
      forwardmove: 16,
      sidemove: 17,
      upmove: 18,
      impulse: 9,
      lightlevel: 20
    },
    snapinitial: false,
    numtouch: 0,
    touchents: [],
    viewangles: [0, 0, 0],
    viewheight: 0,
    mins: [0, 0, 0],
    maxs: [0, 0, 0],
    groundentity: null,
    watertype: 0,
    waterlevel: 0,
    trace: null,
    pointcontents: null
  });
  assert.equal(pmoveLine, "sv   9:101 135\n", "PrintPmove should preserve the original checksum line format");
}

function verifyClientThinkIntermissionChaseAndButtons(): void {
  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  const client = attachGameClient(player);
  runtime.intermissiontime = 1;
  runtime.time = 7;
  ClientThink(player, createUsercmd({ buttons: 128 }), runtime);
  assert.equal(client.ps.pmove.pm_type, pmtype_t.PM_FREEZE, "ClientThink intermission should freeze pmove");
  assert.equal(runtime.exitintermission, 1, "ClientThink should allow intermission exit after five seconds and any button");

  runtime.intermissiontime = 0;
  runtime.exitintermission = 0;
  const chaseTarget = spawnGameEntity(runtime);
  client.chase_target = chaseTarget;
  client.resp.spectator = true;
  client.ps.pmove.pm_flags = PMF_NO_PREDICTION;
  ClientThink(player, createUsercmd({ buttons: 1, angles: [0, 16384, 0], lightlevel: 47 }), runtime);
  assert.deepEqual(client.resp.cmd_angles, [0, 90, 0], "ClientThink chase mode should convert command angles");
  assert.equal(client.buttons & 1, 1, "ClientThink should copy the latest command buttons");
  assert.equal(entLightLevel(player), 47, "ClientThink should copy the command light level");
  assert.equal(client.chase_target, null, "spectator attack should leave chase target");
  assert.equal((client.ps.pmove.pm_flags & PMF_NO_PREDICTION) === 0, true, "leaving chase should clear PMF_NO_PREDICTION");
}

function createTrace(endpos: [number, number, number]): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: [...endpos],
    plane: {
      normal: [0, 0, 0],
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

function createUsercmd(overrides: Partial<Parameters<typeof ClientThink>[1]> = {}): Parameters<typeof ClientThink>[1] {
  return {
    msec: 16,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0,
    ...overrides
  };
}

function entLightLevel(player: ReturnType<typeof spawnGameEntity>): number {
  return player.light_level;
}

function withMockedMathRandom(values: number[], callback: () => void): void {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => values[Math.min(index++, values.length - 1)];
  try {
    callback();
  } finally {
    Math.random = originalRandom;
  }
}

function assertAlmostEqual(actual: number, expected: number, message: string): void {
  assert.ok(Math.abs(actual - expected) < 0.0001, `${message}: expected ${expected}, got ${actual}`);
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 1;
  return runtime;
}

function spawnDeathmatchSpot(runtime: GameRuntime, origin: [number, number, number]) {
  const spot = spawnGameEntity(runtime);
  spot.classname = "info_player_deathmatch";
  spot.inuse = true;
  spot.s.origin = [...origin];
  return spot;
}

function spawnCoopSelectionSpot(runtime: GameRuntime, targetname: string) {
  const spot = spawnGameEntity(runtime);
  spot.classname = "info_player_coop";
  spot.inuse = true;
  spot.targetname = targetname;
  return spot;
}

function requireItem(pickupName: string) {
  const item = FindItem(pickupName);
  assert.ok(item, `missing item ${pickupName}`);
  return item;
}
