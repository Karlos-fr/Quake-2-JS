/**
 * File: quake2-m-boss3.ts
 * Purpose: Verify the gameplay port of `game/m_boss3.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_boss3_stand behavior.
 *
 * Dependencies:
 * - packages/game/src/m_boss3.ts
 */

import { strict as assert } from "node:assert";

import { multicast_t, temp_event_t } from "../../packages/qcommon/src/index.js";
import {
  ED_CallSpawn,
  FRAMETIME,
  MOVETYPE_STEP,
  SOLID_BBOX,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainGameTempEntityEvents,
  useGameEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { findGameSaveFunction } from "../../packages/game/src/g_save.js";
import { FRAME_stand201, FRAME_stand202, FRAME_stand260 } from "../../packages/game/src/m_boss32.js";
import { SP_monster_boss3_stand, Think_Boss3Stand, Use_Boss3 } from "../../packages/game/src/m_boss3.js";

main();

function main(): void {
  verifySpawnInitializesStaticBoss();
  verifySpawnRegistryCallsBoss3Stand();
  verifySaveRegistryRestoresCallbacks();
  verifyThinkCyclesStandFrames();
  verifyUseEmitsBossTeleportAndFreesEntity();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-boss3: ok");
}

function verifySpawnInitializesStaticBoss(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss3Stand(runtime, 1);

  SP_monster_boss3_stand(boss, runtime);

  assert.equal(boss.movetype, MOVETYPE_STEP);
  assert.equal(boss.solid, SOLID_BBOX);
  assert.equal(boss.model, "models/monsters/boss3/rider/tris.md2");
  assert.equal(runtime.assets.modelPaths[boss.s.modelindex - 1], "models/monsters/boss3/rider/tris.md2");
  assert.equal(runtime.assets.soundPaths[0], "misc/bigtele.wav");
  assert.equal(boss.s.frame, FRAME_stand201);
  assert.deepEqual(boss.mins, [-32, -32, 0]);
  assert.deepEqual(boss.maxs, [32, 32, 90]);
  assert.equal(boss.use, Use_Boss3);
  assert.equal(boss.think, Think_Boss3Stand);
  assert.equal(boss.nextthink, runtime.time + FRAMETIME);
  assert.equal(boss.linked, true);
}

function verifySpawnRegistryCallsBoss3Stand(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss3Stand(runtime, 2);

  ED_CallSpawn(boss, runtime);

  assert.equal(boss.s.frame, FRAME_stand201);
  assert.equal(boss.use, Use_Boss3);
}

function verifySaveRegistryRestoresCallbacks(): void {
  assert.equal(findGameSaveFunction("SP_monster_boss3_stand"), SP_monster_boss3_stand);
  assert.equal(findGameSaveFunction("Think_Boss3Stand"), Think_Boss3Stand);
  assert.equal(findGameSaveFunction("Use_Boss3"), Use_Boss3);
}

function verifyThinkCyclesStandFrames(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss3Stand(runtime, 3);
  SP_monster_boss3_stand(boss, runtime);

  runtime.time = FRAMETIME;
  boss.think!(boss, runtime);
  assert.equal(boss.s.frame, FRAME_stand202);
  assert.equal(boss.nextthink, runtime.time + FRAMETIME);
  assert.equal(boss.think, Think_Boss3Stand);

  boss.s.frame = FRAME_stand260;
  boss.think!(boss, runtime);
  assert.equal(boss.s.frame, FRAME_stand201);
}

function verifyUseEmitsBossTeleportAndFreesEntity(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss3Stand(runtime, runtime.maxclients + 33);
  boss.s.origin = [8, 16, 24];
  boss.origin = [...boss.s.origin];
  SP_monster_boss3_stand(boss, runtime);

  useGameEntity(runtime, boss, null, null);

  const event = drainGameTempEntityEvents(runtime).at(-1);
  assert.equal(event?.type, temp_event_t.TE_BOSSTPORT);
  assert.equal(event?.multicast, multicast_t.MULTICAST_PVS);
  assert.deepEqual(event?.origin, [8, 16, 24]);
  assert.equal(boss.inuse, false);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const boss = createBoss3Stand(runtime, runtime.maxclients + 34);

  SP_monster_boss3_stand(boss, runtime);

  assert.equal(boss.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([
    { properties: { classname: "worldspawn" } }
  ]);
}

function createBoss3Stand(runtime: GameRuntime, index: number): GameEntity {
  const boss = createRuntimeEntity({ classname: "monster_boss3_stand" }, index);
  runtime.entities[index] = boss;
  return boss;
}
