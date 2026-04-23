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
import { CONTENTS_MONSTER, CONTENTS_SOLID } from "../../packages/qcommon/src/q-shared.js";
import { parseBsp, type darea_t } from "../../packages/formats/src/bsp.js";
import {
  CM_LoadMap,
  CM_AreasConnected,
  CM_BoxLeafnums,
  CM_ClusterPHS,
  CM_ClusterPVS,
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

  const touchedLeafs: number[] = [];
  const { count: boxLeafCount, topnode } = CM_BoxLeafnums(world, [-16, -16, -16], [16, 16, 16], touchedLeafs, 64);

  const pvs = CM_ClusterPVS(world, worldCluster);
  const phs = CM_ClusterPHS(world, worldCluster);
  const areaBits = new Uint8Array((world.numareas + 7) >> 3);
  const areaBytes = CM_WriteAreaBits(world, areaBits, worldArea);
  const headnodeVisible = worldModel ? CM_HeadnodeVisible(world, worldModel.headnode, pvs) : false;
  const savedPortalState = CM_WritePortalState(world);

  console.log(`Verification cmodel - ${MAP_PATH}`);
  console.log(`inline models: ${numInlineModels}`);
  console.log(`clusters: ${numClusters}`);
  console.log(`load checksum: ${loadResult.checksum} reused=${cachedResult.reused}`);
  console.log(`leaf at origin: ${worldLeaf} cluster=${worldCluster} area=${worldArea}`);
  console.log(`leaf0 contents: ${worldContents}`);
  console.log(`box hull contents inside/outside: ${boxContentsInside}/${boxContentsOutside}`);
  console.log(`box leaf count: ${boxLeafCount} topnode=${topnode}`);
  console.log(`pvs/phs bytes: ${pvs.length}/${phs.length}`);
  console.log(`area bytes: ${areaBytes}`);
  console.log(`headnode visible in own pvs: ${headnodeVisible}`);

  assert(entityString.includes("worldspawn"), "entity string should contain worldspawn");
  assert(numInlineModels === map.models.length, "inline model count mismatch");
  assert(numClusters >= 1, "expected at least one cluster");
  assert(worldContents === CONTENTS_SOLID, "leaf 0 should stay solid");
  assert(boxHeadnode === world.box_headnode, "box headnode mismatch");
  assert(boxContentsInside === CONTENTS_MONSTER, "box hull should report monster contents inside");
  assert(boxContentsOutside !== CONTENTS_MONSTER, "box hull should not report monster contents outside");
  assert(boxLeafCount >= 1, "expected at least one touched leaf");
  assert(pvs.length === ((numClusters + 7) >> 3), "unexpected PVS size");
  assert(phs.length === ((numClusters + 7) >> 3), "unexpected PHS size");
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

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
