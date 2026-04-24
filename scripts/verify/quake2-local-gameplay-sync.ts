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
  createClientRuntime,
  syncLocalGameplayFrame
} from "../../packages/client/src/index.js";
import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  emitPlayerMuzzleFlash,
  registerGameModel,
  spawnGameEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { MZ_BLASTER } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyLocalMuzzleFlashReachesRefreshLights();
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

  assertNumber(gameplay.playerMuzzleFlashEvents.length, 0, "muzzle flash event must be drained by sync");
  assertBoolean(Boolean(muzzleLight), true, "local muzzle flash must become a refresh dynamic light");
  assertBoolean((muzzleLight?.intensity ?? 0) > 0, true, "local muzzle flash light must be visible");
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
