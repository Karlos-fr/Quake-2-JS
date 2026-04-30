/**
 * File: quake2-sv-world.ts
 * Purpose: Verify the TypeScript port target for `server/sv_world.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for server world-linking and trace procedures.
 *
 * Dependencies:
 * - packages/server/src/sv_world.ts
 * - packages/qcommon/src/collision.ts
 */

import fs from "node:fs";
import path from "node:path";
import { strict as assert } from "node:assert";

import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import {
  createServerState,
  createServerWorldProcedures
} from "../../packages/server/src/index.js";
import { createCollisionWorld } from "../../packages/qcommon/src/index.js";
import { CONTENTS_MONSTER } from "../../packages/qcommon/src/q_shared.js";
import { createRuntimeEntity, SOLID_BBOX, AREA_SOLID, type game_export_t } from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";
const MAX_VERIFY_TOUCH = 64;

main();

/**
 * Category: New
 * Purpose: Run one focused verification pass for the `sv_world.c` procedures.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const bspEntry = findPakEntry(pak, MAP_PATH);
  if (!bspEntry) {
    throw new Error(`${MAP_PATH} introuvable dans ${pakPath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), MAP_PATH);
  const collisionWorld = createCollisionWorld(map);
  const sv = createServerState();
  sv.models[1] = collisionWorld.map_cmodels[0];

  const worldspawn = createRuntimeEntity({}, 0);
  worldspawn.inuse = true;

  const box = createRuntimeEntity({}, 1);
  box.inuse = true;
  box.solid = SOLID_BBOX;
  box.mins = [-16, -16, -16];
  box.maxs = [16, 16, 16];
  box.s.origin = [0, 0, 32];
  box.s.angles = [0, 0, 0];

  const ge = createGameExports([worldspawn, box]);
  const world = createServerWorldProcedures({
    sv,
    ge,
    collisionWorld
  });

  world.SV_ClearWorld();
  world.SV_LinkEdict(box);

  assert.equal(box.linkcount, 1, "SV_LinkEdict should increment linkcount");
  assert.ok(box.s.solid > 0, "SV_LinkEdict should encode bbox solid value");

  const touch = new Array<typeof box | null>(MAX_VERIFY_TOUCH).fill(null);
  const areaCount = world.SV_AreaEdicts([-32, -32, 0], [32, 32, 64], touch, touch.length, AREA_SOLID);
  assert.equal(areaCount, 1, "SV_AreaEdicts should return linked box");
  assert.equal(touch[0], box, "SV_AreaEdicts should return the expected entity");

  const contents = world.SV_PointContents([0, 0, 32]);
  assert.ok((contents & CONTENTS_MONSTER) !== 0, "SV_PointContents should include linked bbox contents");

  const trace = world.SV_Trace([-64, 0, 32], [0, 0, 0], [0, 0, 0], [64, 0, 32], null, CONTENTS_MONSTER);
  assert.ok(trace.fraction < 1, "SV_Trace should hit linked box entity");
  assert.equal(trace.ent, box, "SV_Trace should report linked box as hit entity");

  world.SV_UnlinkEdict(box);
  const areaCountAfterUnlink = world.SV_AreaEdicts([-32, -32, 0], [32, 32, 64], touch, touch.length, AREA_SOLID);
  assert.equal(areaCountAfterUnlink, 0, "SV_UnlinkEdict should remove entity from area query");

  console.log("quake2-sv-world: ok");
}

function createGameExports(edicts: ReturnType<typeof createRuntimeEntity>[]): game_export_t {
  return {
    apiversion: 3,
    Init: () => {},
    Shutdown: () => {},
    SpawnEntities: () => {},
    WriteGame: () => {},
    ReadGame: () => {},
    WriteLevel: () => {},
    ReadLevel: () => {},
    ClientConnect: () => true,
    ClientBegin: () => {},
    ClientUserinfoChanged: () => {},
    ClientDisconnect: () => {},
    ClientCommand: () => {},
    ClientThink: () => {},
    RunFrame: () => {},
    ServerCommand: () => {},
    edicts,
    edict_size: 0,
    num_edicts: edicts.length,
    max_edicts: 1024
  };
}
