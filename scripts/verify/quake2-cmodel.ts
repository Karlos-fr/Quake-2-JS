/**
 * File: quake2-cmodel.ts
 * Purpose: Verify the broader `qcommon/cmodel.c` service helpers beyond the base trace path.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript collision-model port.
 *
 * Dependencies:
 * - packages/formats
 * - packages/qcommon
 */

import fs from "node:fs";
import path from "node:path";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { CONTENTS_MONSTER, CONTENTS_SOLID } from "../../packages/qcommon/src/q_shared.js";
import { parseBsp, type BspMap, type darea_t } from "../../packages/formats/src/bsp.js";
import {
  CM_LoadMap,
  CM_AreasConnected,
  CM_BoxTrace,
  CM_BoxLeafnums,
  CM_BoxLeafnums_headnode,
  CM_ClusterPHS,
  CM_ClusterPVS,
  CM_DecompressVis,
  CM_EntityString,
  CM_HeadnodeForBox,
  CM_HeadnodeVisible,
  CM_InlineModel,
  CM_LeafArea,
  CM_LeafCluster,
  CM_LeafContents,
  CM_NumClusters,
  CM_NumInlineModels,
  CM_PointLeafnum,
  CM_PointContents,
  CM_ReadPortalState,
  CM_SetAreaPortalState,
  CM_TransformedPointContents,
  CM_WriteAreaBits,
  CM_WritePortalState,
  createCollisionModelRuntime,
  createCollisionWorld
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";

main();

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
  const runtime = createCollisionModelRuntime();
  const loadResult = CM_LoadMap(runtime, MAP_PATH, false, (name) => {
    const entry = findPakEntry(pak, name);
    return entry ? readPakEntryData(pak, entry) : undefined;
  });
  const cachedResult = CM_LoadMap(runtime, MAP_PATH, false, (name) => {
    const entry = findPakEntry(pak, name);
    return entry ? readPakEntryData(pak, entry) : undefined;
  });

  const entityString = CM_EntityString(world);
  const numInlineModels = CM_NumInlineModels(world);
  const numClusters = CM_NumClusters(world);
  const worldModel = CM_InlineModel(world, 0);
  const worldLeaf = CM_PointLeafnum(world, [0, 0, 0]);
  const worldContents = CM_LeafContents(world, 0);
  const worldCluster = CM_LeafCluster(world, worldLeaf);
  const worldArea = CM_LeafArea(world, worldLeaf);
  const boxHeadnode = CM_HeadnodeForBox(world, [-16, -16, -16], [16, 16, 16]);
  const boxContentsInside = CM_PointContents(world, [0, 0, 0], boxHeadnode);
  const boxContentsOutside = CM_PointContents(world, [64, 64, 64], boxHeadnode);
  const translatedBoxContentsInside = CM_TransformedPointContents(world, [128, 0, 0], boxHeadnode, [128, 0, 0], [0, 90, 0]);
  const translatedBoxContentsOutside = CM_TransformedPointContents(world, [192, 64, 64], boxHeadnode, [128, 0, 0], [0, 90, 0]);
  const boxPointTrace = CM_BoxTrace(world, [64, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], boxHeadnode, CONTENTS_MONSTER);
  const boxSweepTrace = CM_BoxTrace(world, [64, 0, 0], [0, 0, 0], [-8, -8, -8], [8, 8, 8], boxHeadnode, CONTENTS_MONSTER);
  const boxStationaryTrace = CM_BoxTrace(world, [0, 0, 0], [0, 0, 0], [-8, -8, -8], [8, 8, 8], boxHeadnode, CONTENTS_MONSTER);

  const touchedLeafs: number[] = [];
  const { count: boxLeafCount, topnode } = CM_BoxLeafnums(world, [-16, -16, -16], [16, 16, 16], touchedLeafs, 64);
  const syntheticBoxLeafs: number[] = [];
  const { count: syntheticBoxLeafCount, topnode: syntheticBoxTopnode } = CM_BoxLeafnums_headnode(
    world,
    [-2, -2, -2],
    [2, 2, 2],
    syntheticBoxLeafs,
    8,
    boxHeadnode
  );

  const pvs = CM_ClusterPVS(world, worldCluster);
  const phs = CM_ClusterPHS(world, worldCluster);
  const visRowBytes = (numClusters + 7) >> 3;
  const directVis = new Uint8Array(visRowBytes);
  CM_DecompressVis(world, new Uint8Array([0x7f, 0x00, 0xff]), directVis);
  const missingVis = new Uint8Array(visRowBytes);
  CM_DecompressVis(world, null, missingVis);
  const noVisWorld = createCollisionWorld({ ...map, visibility: new Uint8Array(0) } satisfies BspMap);
  const noVisPvs = CM_ClusterPVS(noVisWorld, worldCluster);
  const noVisPhs = CM_ClusterPHS(noVisWorld, worldCluster);
  const noVisNegativeCluster = CM_ClusterPVS(noVisWorld, -1);
  const areaBits = new Uint8Array((world.numareas + 7) >> 3);
  const areaBytes = CM_WriteAreaBits(world, areaBits, worldArea);
  verifyAreaPortalFlooding(map);
  const headnodeVisible = worldModel ? CM_HeadnodeVisible(world, worldModel.headnode, pvs) : false;
  const savedPortalState = CM_WritePortalState(world);

  console.log(`Verification cmodel - ${MAP_PATH}`);
  console.log(`inline models: ${numInlineModels}`);
  console.log(`clusters: ${numClusters}`);
  console.log(`load checksum: ${loadResult.checksum} reused=${cachedResult.reused}`);
  console.log(`leaf at origin: ${worldLeaf} cluster=${worldCluster} area=${worldArea}`);
  console.log(`leaf0 contents: ${worldContents}`);
  console.log(`box hull contents inside/outside: ${boxContentsInside}/${boxContentsOutside}`);
  console.log(`box point trace fraction/end: ${boxPointTrace.fraction.toFixed(9)} / ${boxPointTrace.endpos.join(",")}`);
  console.log(`box sweep trace fraction/end: ${boxSweepTrace.fraction.toFixed(9)} / ${boxSweepTrace.endpos.join(",")}`);
  console.log(`box stationary flags: startsolid=${boxStationaryTrace.startsolid} allsolid=${boxStationaryTrace.allsolid}`);
  console.log(`box leaf count: ${boxLeafCount} topnode=${topnode}`);
  console.log(`synthetic box leafs: ${syntheticBoxLeafs.join(",")} topnode=${syntheticBoxTopnode}`);
  console.log(`pvs/phs bytes: ${pvs.length}/${phs.length}`);
  console.log(`direct/no-vis first bytes: ${directVis[0]}/${missingVis[0]}/${noVisPvs[0]}`);
  console.log(`area bytes: ${areaBytes}`);
  console.log(`headnode visible in own pvs: ${headnodeVisible}`);

  assert(entityString.includes("worldspawn"), "entity string should contain worldspawn");
  assert(numInlineModels === map.models.length, "inline model count mismatch");
  assert(numClusters >= 1, "expected at least one cluster");
  assert(worldContents === CONTENTS_SOLID, "leaf 0 should stay solid");
  assert(boxHeadnode === world.box_headnode, "box headnode mismatch");
  assert(boxContentsInside === CONTENTS_MONSTER, "box hull should report monster contents inside");
  assert(boxContentsOutside !== CONTENTS_MONSTER, "box hull should not report monster contents outside");
  assert(translatedBoxContentsInside === CONTENTS_MONSTER, "transformed box hull should subtract origin before contents lookup");
  assert(translatedBoxContentsOutside !== CONTENTS_MONSTER, "transformed box hull should report empty contents outside translated bounds");
  assertAlmostEqual(boxPointTrace.fraction, 0.74951171875, "point trace should apply DIST_EPSILON at the brush face");
  assertAlmostEqual(boxSweepTrace.fraction, 0.62451171875, "swept box trace should expand planes by mins/maxs and DIST_EPSILON");
  assertVecAlmostEqual(boxPointTrace.endpos, [16.03125, 0, 0], "point trace endpos should match epsilon-adjusted fraction");
  assertVecAlmostEqual(boxSweepTrace.endpos, [24.03125, 0, 0], "swept box trace endpos should match expanded brush face");
  assert(boxPointTrace.contents === CONTENTS_MONSTER, "point trace should carry brush contents");
  assert(boxSweepTrace.contents === CONTENTS_MONSTER, "swept box trace should carry brush contents");
  assert(boxStationaryTrace.startsolid, "stationary box trace should start solid inside box hull");
  assert(boxStationaryTrace.allsolid, "stationary box trace should be allsolid inside box hull");
  assert(boxStationaryTrace.fraction === 0, "stationary box trace should have zero fraction inside box hull");
  assert(boxLeafCount >= 1, "expected at least one touched leaf");
  assert(syntheticBoxLeafCount === 1, "synthetic box hull should expose exactly one content leaf");
  assert(syntheticBoxLeafs[0] === world.box_leaf, "synthetic box hull should route inside bounds to box_leaf");
  assert(syntheticBoxTopnode === -1, "contained synthetic box query should not cross a topnode");
  assert(pvs.length === ((numClusters + 7) >> 3), "unexpected PVS size");
  assert(phs.length === ((numClusters + 7) >> 3), "unexpected PHS size");
  assert(directVis[0] === 0x7f, "CM_DecompressVis should copy literal visibility bytes");
  assert(directVis.slice(1).every((value) => value === 0), "CM_DecompressVis should clamp oversized zero runs to row size");
  assert(missingVis.every((value) => value === 0xff), "CM_DecompressVis should mark every cluster visible when vis data is missing");
  assert(noVisPvs.length === visRowBytes, "no-vis PVS row size mismatch");
  assert(noVisPhs.length === visRowBytes, "no-vis PHS row size mismatch");
  assert(noVisPvs.every((value) => value === 0xff), "CM_ClusterPVS should expose all clusters when map vis is absent");
  assert(noVisPhs.every((value) => value === 0xff), "CM_ClusterPHS should expose all clusters when map vis is absent");
  assert(noVisNegativeCluster.every((value) => value === 0), "cluster -1 should remain a zero visibility row");
  assert(areaBytes === ((world.numareas + 7) >> 3), "unexpected area bit size");
  assert(headnodeVisible, "world headnode should be visible in its own pvs");
  assert(loadResult.world !== null, "CM_LoadMap should return a loaded world");
  assert(loadResult.cmodel.headnode === (worldModel?.headnode ?? 0), "CM_LoadMap should expose world model 0");
  assert(cachedResult.reused, "second CM_LoadMap should reuse the cached world");
  assert(loadResult.checksum !== 0, "loaded BSP checksum should be non-zero");
  assert(savedPortalState.length === 1024 * 4, "portal state should preserve qboolean-sized savegame layout");

  const portalIndex = world.map_areaportals.findIndex((portal) => portal.portalnum > 0);
  if (portalIndex >= 0) {
    const portal = world.map_areaportals[portalIndex];
      const sourceArea = findAreaReferencingPortal(map.areas, portalIndex);
      if (sourceArea >= 0) {
        const targetArea = portal.otherarea;
        CM_SetAreaPortalState(world, portal.portalnum, false);
        const closed = CM_AreasConnected(world, sourceArea, targetArea);
        const closedPortalState = CM_WritePortalState(world);
        CM_SetAreaPortalState(world, portal.portalnum, true);
        const opened = CM_AreasConnected(world, sourceArea, targetArea);
        CM_ReadPortalState(world, closedPortalState);
        const restoredClosed = CM_AreasConnected(world, sourceArea, targetArea);
        CM_ReadPortalState(world, savedPortalState);

        console.log(`portal ${portal.portalnum} connectivity: closed=${closed} open=${opened}`);
        assert(opened || closed, "portal connectivity check should stay evaluable");
        assert(restoredClosed === closed, "portal state restore should reproduce saved connectivity");
      }
  }
}

function findAreaReferencingPortal(areas: darea_t[], portalIndex: number): number {
  for (let index = 0; index < areas.length; index += 1) {
    const area = areas[index];
    if (portalIndex >= area.firstareaportal && portalIndex < area.firstareaportal + area.numareaportals) {
      return index;
    }
  }

  return -1;
}

function verifyAreaPortalFlooding(map: BspMap): void {
  const world = createCollisionWorld({
    ...map,
    areas: [
      { numareaportals: 0, firstareaportal: 0 },
      { numareaportals: 1, firstareaportal: 0 },
      { numareaportals: 1, firstareaportal: 1 },
      { numareaportals: 0, firstareaportal: 2 }
    ],
    areaportals: [
      { portalnum: 1, otherarea: 2 },
      { portalnum: 1, otherarea: 1 }
    ]
  });
  const bits = new Uint8Array((world.numareas + 7) >> 3);

  assert(!CM_AreasConnected(world, 1, 2), "closed areaportal should split area floods");
  assert(!CM_AreasConnected(world, 1, 3), "unlinked areas should remain disconnected");
  assert(CM_WriteAreaBits(world, bits, 1) === 1, "synthetic area bytes mismatch");
  assert(bits[0] === 0b00000010, "closed area bits should include only the source flood");

  bits.fill(0);
  CM_WriteAreaBits(world, bits, 0);
  assert(bits[0] === 0b00001111, "area zero should force all loaded areas visible");

  CM_SetAreaPortalState(world, 1, true);
  assert(CM_AreasConnected(world, 1, 2), "open areaportal should merge connected floods");
  assert(!CM_AreasConnected(world, 1, 3), "open unrelated portal should not merge all areas");
  bits.fill(0);
  CM_WriteAreaBits(world, bits, 1);
  assert(bits[0] === 0b00000110, "open area bits should include both connected areas");

  const openState = CM_WritePortalState(world);
  assert(openState[4] === 1, "portal state should store qboolean little-endian values");
  CM_SetAreaPortalState(world, 1, false);
  assert(!CM_AreasConnected(world, 1, 2), "closing areaportal should split floods again");
  CM_ReadPortalState(world, openState);
  assert(CM_AreasConnected(world, 1, 2), "read portal state should reflood restored connections");

  world.map_noareas = true;
  assert(CM_AreasConnected(world, 1, 3), "map_noareas should force areas connected");
  bits.fill(0);
  CM_WriteAreaBits(world, bits, 1);
  assert(bits[0] === 0xff, "map_noareas should force all area bits visible");
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertAlmostEqual(actual: number, expected: number, message: string, epsilon = 0.000001): void {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertVecAlmostEqual(actual: readonly number[], expected: readonly number[], message: string, epsilon = 0.000001): void {
  for (let index = 0; index < expected.length; index += 1) {
    assertAlmostEqual(actual[index], expected[index], `${message}[${index}]`, epsilon);
  }
}
