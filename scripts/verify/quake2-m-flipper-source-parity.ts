/**
 * File: quake2-m-flipper-source-parity.ts
 * Purpose: Verify `packages/game/src/m_flipper.ts` directly against `Quake-2-master/game/m_flipper.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness that keeps the TypeScript monster tables aligned with the original C file.
 *
 * Dependencies:
 * - Quake-2-master/game/m_flipper.c
 * - packages/game/src/m_flipper.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  type GameMonsterMove
} from "../../packages/game/src/index.js";
import * as flipper from "../../packages/game/src/m_flipper.js";

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_flipper.c"
);
const TS_SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../packages/game/src/m_flipper.ts"
);

const source = readFileSync(SOURCE_PATH, "utf8");
const tsSource = readFileSync(TS_SOURCE_PATH, "utf8");
const sourceWithoutComments = stripComments(source);
const tsSourceWithoutComments = stripComments(tsSource);

main();

function main(): void {
  verifySourceMoveTables();
  verifySourcePrecacheAssets();
  verifyRandomMacroConsumers();

  console.log("quake2-m-flipper-source-parity: ok");
}

function verifyRandomMacroConsumers(): void {
  assert.ok(!sourceWithoutComments.includes("random()"), "m_flipper.c should have no active random() macro consumers");
  assert.ok(!sourceWithoutComments.includes("crandom()"), "m_flipper.c should have no active crandom() macro consumers");
  assert.ok(/\brand\s*\(/.test(getFunctionBlock("flipper_pain")), "flipper_pain source should use integer rand()");
  assert.ok(getTsFunctionBlock("flipper_pain").includes("randomInt(0x7fffffff)"), "flipper_pain TS should keep integer rand() on randomInt");
}

function verifySourceMoveTables(): void {
  const framesByName = parseFrameTables(sourceWithoutComments);
  const movesByName = parseMoves(sourceWithoutComments);

  for (const [moveName, sourceMove] of movesByName) {
    const tsMove = getExport<GameMonsterMove>(moveName);
    const sourceFrames = framesByName.get(sourceMove.frameTable);
    assert.ok(sourceFrames, `${sourceMove.frameTable} should be present in source`);

    assert.equal(tsMove.firstframe, getFrameConstant(sourceMove.firstframe), `${moveName}: firstframe`);
    assert.equal(tsMove.lastframe, getFrameConstant(sourceMove.lastframe), `${moveName}: lastframe`);
    assert.equal(tsMove.endfunc?.name, sourceMove.endfunc, `${moveName}: endfunc`);
    assert.equal(tsMove.frame.length, sourceFrames.length, `${moveName}: frame length`);

    for (const [index, sourceFrame] of sourceFrames.entries()) {
      const tsFrame = tsMove.frame[index];
      assert.equal(tsFrame.aifunc?.name, sourceFrame.aifunc, `${moveName}: aifunc ${index}`);
      assert.equal(tsFrame.dist, sourceFrame.dist, `${moveName}: dist ${index}`);
      assert.equal(tsFrame.thinkfunc?.name, sourceFrame.thinkfunc, `${moveName}: thinkfunc ${index}`);
    }
  }
}

function verifySourcePrecacheAssets(): void {
  const spawnBlock = getFunctionBlock("SP_monster_flipper");
  const sourceSounds = Array.from(spawnBlock.matchAll(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1]);
  const sourceModel = spawnBlock.match(/gi\.modelindex\s*\(\s*"([^"]+)"\s*\)/)?.[1];

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_flipper" }, 1);
  runtime.entities[1] = entity;

  flipper.SP_monster_flipper(entity, runtime);

  assert.deepEqual(runtime.assets.soundPaths, sourceSounds, "SP_monster_flipper sound precache order");
  assert.equal(runtime.assets.modelPaths[entity.s.modelindex - 1], sourceModel, "SP_monster_flipper model precache");
}

interface SourceFrame {
  aifunc: string;
  dist: number;
  thinkfunc: string | undefined;
}

interface SourceMove {
  firstframe: string;
  lastframe: string;
  frameTable: string;
  endfunc: string | undefined;
}

function parseFrameTables(cSource: string): Map<string, SourceFrame[]> {
  const tables = new Map<string, SourceFrame[]>();
  const tableRegex = /mframe_t\s+(\w+)\s*\[\]\s*=\s*\{([\s\S]*?)\};/g;

  for (const match of cSource.matchAll(tableRegex)) {
    const name = match[1];
    const body = match[2];
    const frames: SourceFrame[] = [];
    const frameRegex = /(ai_\w+)\s*,\s*([A-Za-z0-9_.+-]+)\s*,\s*(NULL|\w+)/g;

    for (const frameMatch of body.matchAll(frameRegex)) {
      frames.push({
        aifunc: frameMatch[1],
        dist: parseDistance(frameMatch[2]),
        thinkfunc: frameMatch[3] === "NULL" ? undefined : frameMatch[3]
      });
    }

    tables.set(name, frames);
  }

  return tables;
}

function parseMoves(cSource: string): Map<string, SourceMove> {
  const moves = new Map<string, SourceMove>();
  const moveRegex = /mmove_t\s+(\w+)\s*=\s*\{\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*,\s*(NULL|\w+)\s*\};/g;

  for (const match of cSource.matchAll(moveRegex)) {
    moves.set(match[1], {
      firstframe: match[2],
      lastframe: match[3],
      frameTable: match[4],
      endfunc: match[5] === "NULL" ? undefined : match[5]
    });
  }

  return moves;
}

function getFunctionBlock(functionName: string): string {
  const start = source.search(new RegExp(`(?:void|qboolean)\\s+${functionName}\\b\\s*\\([^;{}]*\\)\\s*\\{`));
  assert.notEqual(start, -1, `${functionName} should exist in source`);

  const bodyStart = source.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} body was not closed`);
}

function getTsFunctionBlock(functionName: string): string {
  const start = tsSourceWithoutComments.search(new RegExp(`(?:export\\s+)?function\\s+${functionName}\\b`));
  assert.notEqual(start, -1, `${functionName} should exist in TS source`);

  const bodyStart = tsSourceWithoutComments.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} TS should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < tsSourceWithoutComments.length; i += 1) {
    const char = tsSourceWithoutComments[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return tsSourceWithoutComments.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} TS body was not closed`);
}

function getFrameConstant(name: string): number {
  return getExport<number>(name);
}

function getExport<T>(name: string): T {
  const value = (flipper as Record<string, unknown>)[name];
  assert.notEqual(value, undefined, `${name} should be exported by m_flipper.ts`);
  return value as T;
}

function parseDistance(token: string): number {
  if (token === "FLIPPER_RUN_SPEED") {
    return 24;
  }
  const value = Number(token);
  assert.ok(Number.isFinite(value), `Unsupported distance token ${token}`);
  return value;
}

function stripComments(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}
