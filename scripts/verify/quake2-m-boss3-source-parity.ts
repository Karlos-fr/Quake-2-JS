/**
 * File: quake2-m-boss3-source-parity.ts
 * Purpose: Verify `packages/game/src/m_boss3.ts` directly against `Quake-2-master/game/m_boss3.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness that keeps the TypeScript boss3 stand-in aligned with the original C file.
 *
 * Dependencies:
 * - Quake-2-master/game/m_boss3.c
 * - packages/game/src/m_boss3.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { multicast_t, temp_event_t } from "../../packages/qcommon/src/index.js";
import {
  FRAMETIME,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainGameTempEntityEvents
} from "../../packages/game/src/index.js";
import { FRAME_stand201, FRAME_stand260 } from "../../packages/game/src/m_boss32.js";
import * as boss3 from "../../packages/game/src/m_boss3.js";

const SOURCE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../Quake-2-master/game/m_boss3.c");
const source = readFileSync(SOURCE_PATH, "utf8");
const sourceWithoutComments = stripComments(source);

main();

function main(): void {
  verifySourceFunctionsAreExported();
  verifyUseBoss3TeleportEvent();
  verifyThinkBoss3StandFrameCycle();
  verifySpawnAssetsAndBounds();

  console.log("quake2-m-boss3-source-parity: ok");
}

function verifySourceFunctionsAreExported(): void {
  const sourceFunctions = parseSourceFunctionNames(sourceWithoutComments);

  for (const functionName of sourceFunctions) {
    assert.notEqual((boss3 as Record<string, unknown>)[functionName], undefined, `${functionName} should be exported by m_boss3.ts`);
  }
}

function verifyUseBoss3TeleportEvent(): void {
  const useBlock = getFunctionBlock("Use_Boss3", sourceWithoutComments);
  assert.match(useBlock, /\bsvc_temp_entity\b/, "Use_Boss3 should write svc_temp_entity");
  assert.match(useBlock, /\bTE_BOSSTPORT\b/, "Use_Boss3 should write TE_BOSSTPORT");
  assert.match(useBlock, /\bMULTICAST_PVS\b/, "Use_Boss3 should multicast to PVS");
  assert.match(useBlock, /\bG_FreeEdict\b/, "Use_Boss3 should free its edict");

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_boss3_stand" }, 32);
  runtime.entities[32] = entity;
  entity.s.origin = [12, 24, 36];
  boss3.Use_Boss3(entity, null, null, runtime);

  const event = drainGameTempEntityEvents(runtime).at(-1);
  assert.equal(event?.type, temp_event_t.TE_BOSSTPORT, "Use_Boss3 temp entity type");
  assert.equal(event?.multicast, multicast_t.MULTICAST_PVS, "Use_Boss3 multicast");
  assert.deepEqual(event?.origin, [12, 24, 36], "Use_Boss3 origin");
  assert.equal(entity.inuse, false, "Use_Boss3 should free its entity");
}

function verifyThinkBoss3StandFrameCycle(): void {
  const thinkBlock = getFunctionBlock("Think_Boss3Stand", sourceWithoutComments);
  assert.match(thinkBlock, /\bFRAME_stand260\b/, "Think_Boss3Stand should test FRAME_stand260");
  assert.match(thinkBlock, /\bFRAME_stand201\b/, "Think_Boss3Stand should wrap to FRAME_stand201");
  assert.match(thinkBlock, /\bFRAMETIME\b/, "Think_Boss3Stand should schedule FRAMETIME");

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_boss3_stand" }, 1);
  entity.s.frame = FRAME_stand260;
  boss3.Think_Boss3Stand(entity, runtime);

  assert.equal(entity.s.frame, FRAME_stand201, "Think_Boss3Stand frame wrap");
  assert.equal(entity.nextthink, runtime.time + FRAMETIME, "Think_Boss3Stand nextthink");
}

function verifySpawnAssetsAndBounds(): void {
  const spawnBlock = getFunctionBlock("SP_monster_boss3_stand", sourceWithoutComments);
  const sourceModel = spawnBlock.match(/self->model\s*=\s*"([^"]+)"/)?.[1];
  const sourceSound = spawnBlock.match(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/)?.[1];
  const mins = parseVectorSet(spawnBlock, "self->mins");
  const maxs = parseVectorSet(spawnBlock, "self->maxs");

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_boss3_stand" }, 1);
  runtime.entities[1] = entity;
  boss3.SP_monster_boss3_stand(entity, runtime);

  assert.equal(runtime.assets.modelPaths[entity.s.modelindex - 1], sourceModel, "SP_monster_boss3_stand model");
  assert.equal(runtime.assets.soundPaths[0], sourceSound, "SP_monster_boss3_stand precache sound");
  assert.deepEqual(entity.mins, mins, "SP_monster_boss3_stand mins");
  assert.deepEqual(entity.maxs, maxs, "SP_monster_boss3_stand maxs");
}

function getFunctionBlock(functionName: string, cSource: string): string {
  const start = cSource.search(new RegExp(`\\bvoid\\s+${functionName}\\s*\\(`));
  assert.notEqual(start, -1, `${functionName} should exist in source`);
  const bodyStart = cSource.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < cSource.length; i += 1) {
    if (cSource[i] === "{") {
      depth += 1;
    } else if (cSource[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return cSource.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} body was not closed`);
}

function parseVectorSet(cSource: string, target: string): [number, number, number] {
  const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cSource.match(new RegExp(`VectorSet\\s*\\(\\s*${escapedTarget}\\s*,\\s*([^,]+)\\s*,\\s*([^,]+)\\s*,\\s*([^\\)]+)\\)`));
  assert.ok(match, `${target} VectorSet should exist`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseSourceFunctionNames(cSource: string): string[] {
  return Array.from(cSource.matchAll(/\bvoid\s+(\w+)\s*\([^;]*\)\s*\{/g), (match) => match[1]);
}

function stripComments(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}
