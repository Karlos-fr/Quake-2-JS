/**
 * File: quake2-local-gameplay-sync.ts
 * Purpose: Verify the local gameplay-to-client visual effect bridge consumed by renderer adapters.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for standalone local runtime integration.
 *
 * Dependencies:
 * - packages/client
 * - packages/game
 */

import {
  CL_BuildRefreshFrame,
  createLocalViewMotionState,
  createClientRuntime,
  syncLocalGameplayFrame,
  updateLocalGameplayPlayer
} from "../../packages/client/src/index.js";
import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  emitMonsterMuzzleFlash,
  emitGameTempEntity,
  emitPlayerMuzzleFlash,
  registerGameModel,
  spawnGameEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { EF_BLASTER, MAX_EDICTS, MZ_BLASTER, PMF_DUCKED, temp_event_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyLocalMuzzleFlashReachesRefreshLights();
  verifyLocalMonsterMuzzleFlashReachesRefreshLights();
  verifyLocalBlasterImpactReachesRefreshEntities();
  verifyLocalExplosionSoundIsQueued();
  verifyOutOfProtocolEntityNumbersAreSkipped();
  verifyLocalCrouchViewheightIsSmoothed();
  verifyRepeatedLocalSyncDoesNotResetBlasterTrailOrigin();
  console.log("quake2-local-gameplay-sync: ok");
}

function verifyLocalMuzzleFlashReachesRefreshLights(): void {
  const client = createClientRuntime();
  const gameplay = createHarnessRuntime();
  const player = createVisiblePlayer(gameplay);

  syncLocalGameplayFrame(client, gameplay);

  emitPlayerMuzzleFlash(gameplay, player, MZ_BLASTER);
  assertNumber(gameplay.playerMuzzleFlashEvents.length, 1, "muzzle flash event must be queued before sync");

  syncLocalGameplayFrame(client, gameplay);
  const refresh = CL_BuildRefreshFrame(client, { predictMovement: false });
  const muzzleLight = refresh.lights.find((light) => light.kind === "dlight" && light.sourceEntity === player.index);
  const sounds = drainGameSoundEvents(gameplay);

  assertNumber(gameplay.playerMuzzleFlashEvents.length, 0, "muzzle flash event must be drained by sync");
  assertBoolean(Boolean(muzzleLight), true, "local muzzle flash must become a refresh dynamic light");
  assertBoolean((muzzleLight?.intensity ?? 0) > 0, true, "local muzzle flash light must be visible");
  assertBoolean(sounds.some((event) => event.soundPath === "weapons/blastf1a.wav"), true, "local muzzle flash must queue weapon fire sound");
}

function verifyLocalMonsterMuzzleFlashReachesRefreshLights(): void {
  const client = createClientRuntime();
  const gameplay = createHarnessRuntime();
  const monster = spawnGameEntity(gameplay);

  monster.classname = "misc_actor";
  monster.inuse = true;
  monster.s.origin = [48, 64, 24];
  monster.s.angles = [0, 90, 0];
  monster.s.modelindex = registerGameModel(gameplay, "players/male/tris.md2");

  syncLocalGameplayFrame(client, gameplay);

  emitMonsterMuzzleFlash(gameplay, monster, [48, 64, 24], 63);
  assertNumber(gameplay.monsterMuzzleFlashEvents.length, 1, "monster muzzle flash event must be queued before sync");

  syncLocalGameplayFrame(client, gameplay);
  const refresh = CL_BuildRefreshFrame(client, { predictMovement: false });
  const muzzleLight = refresh.lights.find((light) => light.kind === "dlight" && light.sourceEntity === monster.index);
  const sounds = drainGameSoundEvents(gameplay);

  assertNumber(gameplay.monsterMuzzleFlashEvents.length, 0, "monster muzzle flash event must be drained by sync");
  assertBoolean(Boolean(muzzleLight), true, "local monster muzzle flash must become a refresh dynamic light");
  assertBoolean(sounds.some((event) => event.soundPath === "infantry/infatck1.wav"), true, "actor monster muzzle flash must queue machinegun sound");
}

function verifyLocalBlasterImpactReachesRefreshEntities(): void {
  const client = createClientRuntime();
  const gameplay = createHarnessRuntime();

  syncLocalGameplayFrame(client, gameplay);
  emitGameTempEntity(gameplay, temp_event_t.TE_BLASTER, [64, 64, 24], 1, {
    origin: [64, 64, 24],
    dir: [0, 0, 1]
  });

  syncLocalGameplayFrame(client, gameplay);
  const refresh = CL_BuildRefreshFrame(client, { predictMovement: false });
  const explosion = refresh.entities.find((entity) => entity.resolvedModelPath === "models/objects/explode/tris.md2");
  const impactLight = refresh.lights.find((light) => light.kind === "temp-explosion");
  const sounds = drainGameSoundEvents(gameplay);

  assertBoolean(Boolean(explosion), true, "local blaster impact must render the original explosion model");
  assertBoolean(refresh.particles.length > 0, true, "local blaster impact must emit particles");
  assertBoolean(Boolean(impactLight), true, "local blaster impact must emit its temporary light");
  assertBoolean(sounds.some((event) => event.soundPath === "weapons/lashit.wav"), true, "local blaster impact must queue impact sound");
}

function verifyLocalExplosionSoundIsQueued(): void {
  const client = createClientRuntime();
  const gameplay = createHarnessRuntime();

  emitGameTempEntity(gameplay, temp_event_t.TE_ROCKET_EXPLOSION, [96, 32, 24], 1, {
    origin: [96, 32, 24]
  });

  syncLocalGameplayFrame(client, gameplay);
  const sounds = drainGameSoundEvents(gameplay);

  assertBoolean(sounds.some((event) => event.soundPath === "weapons/rocklx1a.wav"), true, "local rocket explosion must queue explosion sound");
}

function verifyOutOfProtocolEntityNumbersAreSkipped(): void {
  const client = createClientRuntime();
  const gameplay = createHarnessRuntime();
  const overflow = spawnEntityAtIndex(gameplay, MAX_EDICTS);

  overflow.classname = "func_door";
  overflow.inuse = true;
  overflow.s.modelindex = registerGameModel(gameplay, "*1");

  syncLocalGameplayFrame(client, gameplay);

  assertNumber(client.cl.frame.num_entities, 0, "local sync must skip entities outside MAX_EDICTS");
}

function verifyLocalCrouchViewheightIsSmoothed(): void {
  const client = createClientRuntime();
  const gameplay = createHarnessRuntime();
  const player = createVisiblePlayer(gameplay);
  const viewMotion = createLocalViewMotionState(90);

  client.cls.frametime = 1 / 60;
  client.cl.predicted_origin = [32, 64, 16];
  client.cl.predicted_angles = [0, 90, 0];
  client.cl.predicted_viewheight = -2;
  client.cl.predicted_pmove.pm_flags = PMF_DUCKED;

  updateLocalGameplayPlayer(gameplay, player, client, viewMotion);

  assertNumber(player.viewheight, -2, "local gameplay player must keep exact crouched viewheight");
  assertBoolean(
    client.cl.frame.playerstate.viewoffset[2] > -2 && client.cl.frame.playerstate.viewoffset[2] < 22,
    true,
    "local rendered crouch viewheight must ease toward crouch height"
  );

  for (let index = 0; index < 12; index += 1) {
    updateLocalGameplayPlayer(gameplay, player, client, viewMotion);
  }

  assertNumber(client.cl.frame.playerstate.viewoffset[2], -2, "local rendered crouch viewheight must eventually reach target");
}

function verifyRepeatedLocalSyncDoesNotResetBlasterTrailOrigin(): void {
  const client = createClientRuntime();
  const gameplay = createHarnessRuntime();
  const bolt = spawnGameEntity(gameplay);

  bolt.classname = "bolt";
  bolt.inuse = true;
  bolt.s.origin = [64, 0, 0];
  bolt.s.old_origin = [0, 0, 0];
  bolt.s.effects = EF_BLASTER;
  bolt.s.modelindex = registerGameModel(gameplay, "models/objects/laser/tris.md2");

  client.cl.frame.serverframe = 1;
  syncLocalGameplayFrame(client, gameplay);

  const centity = client.cl_entities[bolt.index];
  centity.lerp_origin = [64, 0, 0];

  syncLocalGameplayFrame(client, gameplay);

  assertNumber(
    centity.lerp_origin[0],
    64,
    "same-frame local sync must not reset blaster trail start to old_origin"
  );
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

function createVisiblePlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  player.inuse = true;
  player.health = 100;
  player.max_health = 100;
  player.s.origin = [32, 64, 16];
  player.s.old_origin = [32, 64, 16];
  player.s.angles = [0, 90, 0];
  player.s.modelindex = registerGameModel(runtime, "players/male/tris.md2");
  attachGameClient(player);
  return player;
}

function spawnEntityAtIndex(runtime: GameRuntime, index: number): GameEntity {
  while (runtime.entities.length <= index) {
    spawnGameEntity(runtime);
  }
  return runtime.entities[index]!;
}

function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
