/**
 * File: quake2-m-hover-source-parity.ts
 * Purpose: Verify `packages/game/src/m_hover.ts` directly against `Quake-2-master/game/m_hover.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness that keeps the TypeScript monster tables aligned with the original C file.
 *
 * Dependencies:
 * - Quake-2-master/game/m_hover.c
 * - packages/game/src/m_hover.ts
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
import * as hover from "../../packages/game/src/m_hover.js";

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_hover.c"
);
const TS_SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../packages/game/src/m_hover.ts"
);

const source = readFileSync(SOURCE_PATH, "utf8");
const sourceWithoutComments = stripComments(source);
const tsSource = readFileSync(TS_SOURCE_PATH, "utf8");

main();

function main(): void {
  verifySourceMoveTables();
  verifySourcePrecacheAssets();
  verifySourceRandomMacroConsumers();

  console.log("quake2-m-hover-source-parity: ok");
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
  const spawnBlock = getFunctionBlock("SP_monster_hover");
  const sourceSounds = Array.from(spawnBlock.matchAll(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1]);
  const sourceModel = spawnBlock.match(/gi\.modelindex\s*\(\s*"([^"]+)"\s*\)/)?.[1];

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_hover" }, 1);
  runtime.entities[1] = entity;

  hover.SP_monster_hover(entity, runtime);

  assert.deepEqual(runtime.assets.soundPaths, sourceSounds, "SP_monster_hover sound precache order");
  assert.equal(runtime.assets.modelPaths[entity.s.modelindex - 1], sourceModel, "SP_monster_hover model precache");
}

function verifySourceRandomMacroConsumers(): void {
  const randomConsumers = [
    ["hover_search", /random\s*\(\s*\)\s*<\s*0\.5/, /random\s*\(\s*\)\s*<\s*0\.5/],
    ["hover_reattack", /random\s*\(\s*\)\s*<=\s*0\.6/, /random\s*\(\s*\)\s*<=\s*0\.6/],
    ["hover_pain", /random\s*\(\s*\)\s*<\s*0\.5/, /random\s*\(\s*\)\s*<\s*0\.5/],
    ["hover_die", /random\s*\(\s*\)\s*<\s*0\.5/, /random\s*\(\s*\)\s*<\s*0\.5/]
  ] as const;

  assert.match(tsSource, /import\s*\{[\s\S]*\brandom\b[\s\S]*\}\s*from\s+"\.\/g_local\.js"/, "m_hover.ts should import g_local.random");
  assert.doesNotMatch(stripComments(tsSource), /Math\.random\s*\(/, "m_hover.ts macro random consumers should not call Math.random directly");

  for (const [functionName, sourcePattern, tsPattern] of randomConsumers) {
    assert.match(getFunctionBlock(functionName), sourcePattern, `${functionName}: source should consume random macro`);
    assert.match(getTsFunctionBlock(functionName), tsPattern, `${functionName}: TS should consume g_local.random helper`);
  }
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
  let searchFrom = 0;
  let start = -1;
  let bodyStart = -1;

  while (true) {
    start = source.indexOf(`void ${functionName}`, searchFrom);
    assert.notEqual(start, -1, `${functionName} should exist in source`);

    const semicolon = source.indexOf(";", start);
    bodyStart = source.indexOf("{", start);
    assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

    if (semicolon === -1 || bodyStart < semicolon) {
      break;
    }

    searchFrom = semicolon + 1;
  }

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
  const start = tsSource.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist in TS source`);

  const bodyStart = tsSource.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a TS body`);

  let depth = 0;
  for (let i = bodyStart; i < tsSource.length; i += 1) {
    const char = tsSource[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return tsSource.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} TS body was not closed`);
}

function getFrameConstant(name: string): number {
  return getExport<number>(name);
}

function getExport<T>(name: string): T {
  const value = (hover as Record<string, unknown>)[name];
  assert.notEqual(value, undefined, `${name} should be exported by m_hover.ts`);
  return value as T;
}

function parseDistance(token: string): number {
  const value = Number(token);
  assert.ok(Number.isFinite(value), `Unsupported distance token ${token}`);
  return value;
}

function stripComments(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}
