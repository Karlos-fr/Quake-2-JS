/**
 * File: quake2-cl-pred.ts
 * Purpose: Verify the first direct `client/cl_pred.c` collision helpers now ported for prediction.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `CL_PMTrace` and `CL_PMpointcontents`.
 *
 * Dependencies:
 * - packages/client
 * - packages/formats
 * - packages/qcommon
 */

import fs from "node:fs";
import path from "node:path";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import {
  CL_PMTrace,
  CL_PMpointcontents,
  createClientRuntime
} from "../../packages/client/src/index.js";
import {
  CM_HeadnodeForBox,
  createCollisionWorld,
  createEntityState,
  type cmodel_t
} from "../../packages/qcommon/src/index.js";
import { CONTENTS_MONSTER } from "../../packages/qcommon/src/q-shared.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";

main();

/**
 * Category: New
 * Purpose: Run focused prediction-collision assertions against one real BSP world plus synthetic solids.
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
  const world = createCollisionWorld(map);
  const runtime = createClientRuntime();

  const brushHeadnode = CM_HeadnodeForBox(world, [-16, -16, -16], [16, 16, 16]);
  const brushModel: cmodel_t = {
    mins: [-16, -16, -16],
    maxs: [16, 16, 16],
    origin: [0, 0, 0],
    headnode: brushHeadnode
  };

  runtime.cl.model_clip[1] = brushModel;

  const bmodel = createEntityState();
  bmodel.number = 2;
  bmodel.modelindex = 1;
  bmodel.solid = 31;
  bmodel.origin = [64, 0, 0];
  bmodel.angles = [0, 0, 0];

  const bbox = createEntityState();
  bbox.number = 3;
  bbox.solid = (2) | (2 << 5) | (8 << 10);
  bbox.origin = [128, 0, 0];
  bbox.angles = [0, 0, 0];

  const trace = CL_PMTrace([32, 0, 0], [0, 0, 0], [0, 0, 0], [96, 0, 0], {
    world,
    entities: [bmodel],
    modelClip: runtime.cl.model_clip as Array<cmodel_t | null>,
    playernum: runtime.cl.playernum
  });

  const bmodelContents = CL_PMpointcontents([64, 0, 0], {
    world,
    entities: [bmodel],
    modelClip: runtime.cl.model_clip as Array<cmodel_t | null>,
    playernum: runtime.cl.playernum
  });

  const bboxTrace = CL_PMTrace([96, 0, 0], [0, 0, 0], [0, 0, 0], [160, 0, 0], {
    world,
    entities: [bbox],
    modelClip: runtime.cl.model_clip as Array<cmodel_t | null>,
    playernum: runtime.cl.playernum
  });

  console.log(`Verification cl_pred - ${MAP_PATH}`);
  console.log(`bmodel trace fraction: ${trace.fraction.toFixed(4)}`);
  console.log(`bmodel point contents: ${bmodelContents}`);
  console.log(`bbox trace fraction: ${bboxTrace.fraction.toFixed(4)}`);

  assert(trace.fraction < 1, "bmodel should clip prediction trace");
  assert(trace.ent === bmodel, "bmodel trace should report the clipped entity");
  assert((bmodelContents & CONTENTS_MONSTER) !== 0, "bmodel point contents should include transformed box contents");
  assert(bboxTrace.fraction < 1, "encoded bbox should clip prediction trace");
  assert(bboxTrace.ent === bbox, "encoded bbox trace should report the clipped entity");

  console.log("Verification cl_pred: OK");
}

/**
 * Category: New
 * Purpose: Assert one invariant in the prediction-collision harness.
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
