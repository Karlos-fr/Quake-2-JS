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
import { CONTENTS_DEADMONSTER, CONTENTS_MONSTER } from "../../packages/qcommon/src/q_shared.js";
import {
  createRuntimeEntity,
  SOLID_BBOX,
  AREA_SOLID,
  SVF_DEADMONSTER,
  type edict_t,
  type game_export_t
} from "../../packages/game/src/index.js";

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
  configureBoxEntity(box, [0, 0, 32]);

  const owner = createRuntimeEntity({}, 2);
  configureBoxEntity(owner, [0, 80, 32]);

  const missile = createRuntimeEntity({}, 3);
  configureBoxEntity(missile, [0, 120, 32]);
  missile.owner = owner;

  const deadMonster = createRuntimeEntity({}, 4);
  configureBoxEntity(deadMonster, [0, 160, 32]);
  deadMonster.svflags = SVF_DEADMONSTER;

  const ge = createGameExports([worldspawn, box, owner, missile, deadMonster]);
  const world = createServerWorldProcedures({
    sv,
    ge,
    collisionWorld
  });

  world.SV_ClearWorld();
  world.SV_LinkEdict(box);
  world.SV_LinkEdict(owner);
  world.SV_LinkEdict(missile);
  world.SV_LinkEdict(deadMonster);

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

  const passedictTrace = world.SV_Trace([-64, 0, 32], [0, 0, 0], [0, 0, 0], [64, 0, 32], box, CONTENTS_MONSTER);
  assert.equal(passedictTrace.ent, worldspawn, "SV_Trace should ignore the passedict itself");

  const ownerTrace = world.SV_Trace([-64, 80, 32], [0, 0, 0], [0, 0, 0], [64, 80, 32], missile, CONTENTS_MONSTER);
  assert.equal(ownerTrace.ent, worldspawn, "SV_Trace should ignore the owner of the passedict");

  const missileTrace = world.SV_Trace([-64, 120, 32], [0, 0, 0], [0, 0, 0], [64, 120, 32], owner, CONTENTS_MONSTER);
  assert.equal(missileTrace.ent, worldspawn, "SV_Trace should ignore edicts owned by the passedict");

  const deadMonsterFilteredTrace = world.SV_Trace(
    [-64, 160, 32],
    [0, 0, 0],
    [0, 0, 0],
    [64, 160, 32],
    null,
    CONTENTS_MONSTER
  );
  assert.equal(deadMonsterFilteredTrace.ent, worldspawn, "SV_Trace should skip dead monsters unless the mask includes them");

  const deadMonsterTrace = world.SV_Trace(
    [-64, 160, 32],
    [0, 0, 0],
    [0, 0, 0],
    [64, 160, 32],
    null,
    CONTENTS_MONSTER | CONTENTS_DEADMONSTER
  );
  assert.equal(deadMonsterTrace.ent, deadMonster, "SV_Trace should include dead monsters when CONTENTS_DEADMONSTER is set");

  world.SV_UnlinkEdict(box);
  const areaCountAfterUnlink = world.SV_AreaEdicts([-32, -32, 0], [32, 32, 64], touch, touch.length, AREA_SOLID);
  assert.equal(areaCountAfterUnlink, 0, "SV_UnlinkEdict should remove entity from area query");

  console.log("quake2-sv-world: ok");
}

function configureBoxEntity(entity: edict_t, origin: [number, number, number]): void {
  entity.inuse = true;
  entity.solid = SOLID_BBOX;
  entity.mins = [-16, -16, -16];
  entity.maxs = [16, 16, 16];
  entity.s.origin = [...origin];
  entity.s.angles = [0, 0, 0];
}

function createGameExports(edicts: edict_t[]): game_export_t {
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
