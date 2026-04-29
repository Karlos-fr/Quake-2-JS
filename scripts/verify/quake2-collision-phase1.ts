/**
 * File: quake2-collision-phase1.ts
 * Purpose: Verify transformed collision queries against translated and rotated BSP inline models.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 1 of the collision plan.
 *
 * Dependencies:
 * - packages/formats
 * - packages/qcommon
 */

import fs from "node:fs";
import path from "node:path";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import {
  AngleVectors,
  CM_BoxTrace,
  CM_TransformedBoxTrace,
  CM_TransformedPointContents,
  createCollisionWorld,
  type vec3_t
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base2.bsp";
const LINEAR_MODEL = "*27";
const ROTATING_MODEL = "*40";

main();

/**
 * Category: New
 * Purpose: Run the phase-1 collision verification against one translated and one rotated BSP inline model.
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
  const linearEntity = requireEntityByModel(map, LINEAR_MODEL);
  const rotatingEntity = requireEntityByModel(map, ROTATING_MODEL);
  const linearModelIndex = requireModelIndex(LINEAR_MODEL);
  const rotatingModelIndex = requireModelIndex(ROTATING_MODEL);
  const linearHeadnode = requireHeadnode(map, LINEAR_MODEL);
  const rotatingHeadnode = requireHeadnode(map, ROTATING_MODEL);
  const mins: vec3_t = [0, 0, 0];
  const maxs: vec3_t = [0, 0, 0];

  const linearOrigin = getEntityOrModelOrigin(map, linearEntity, LINEAR_MODEL);
  const linearStart: vec3_t = [linearOrigin[0], linearOrigin[1], linearOrigin[2] + 256];
  const linearEnd: vec3_t = [linearOrigin[0], linearOrigin[1], linearOrigin[2] - 256];
  const linearTrace = CM_TransformedBoxTrace(
    world,
    linearStart,
    linearEnd,
    mins,
    maxs,
    linearHeadnode,
    -1,
    linearOrigin,
    [0, 0, 0]
  );
  const linearLocalTrace = CM_BoxTrace(
    world,
    subtractVec3(linearStart, linearOrigin),
    subtractVec3(linearEnd, linearOrigin),
    mins,
    maxs,
    linearHeadnode,
    -1
  );
  const linearSolidLocalPoint = findSolidLocalPoint(world, linearModelIndex, linearHeadnode);
  const linearSolidWorldPoint = addVec3(linearOrigin, linearSolidLocalPoint);
  const linearStationaryTrace = CM_TransformedBoxTrace(
    world,
    linearSolidWorldPoint,
    linearSolidWorldPoint,
    mins,
    maxs,
    linearHeadnode,
    -1,
    linearOrigin,
    [0, 0, 0]
  );

  const rotatingOrigin = getEntityOrModelOrigin(map, rotatingEntity, ROTATING_MODEL);
  const rotatingAngles = requireEntityAngles(rotatingEntity.properties.angles);
  const rotatingStart: vec3_t = [rotatingOrigin[0] + 96, rotatingOrigin[1], rotatingOrigin[2]];
  const rotatingEnd: vec3_t = [rotatingOrigin[0] - 96, rotatingOrigin[1], rotatingOrigin[2]];
  const rotatingTrace = CM_TransformedBoxTrace(
    world,
    rotatingStart,
    rotatingEnd,
    mins,
    maxs,
    rotatingHeadnode,
    -1,
    rotatingOrigin,
    rotatingAngles
  );
  const rotatingStartLocal = rotateIntoModelFrame(subtractVec3(rotatingStart, rotatingOrigin), rotatingAngles);
  const rotatingEndLocal = rotateIntoModelFrame(subtractVec3(rotatingEnd, rotatingOrigin), rotatingAngles);
  const rotatingLocalTrace = CM_BoxTrace(world, rotatingStartLocal, rotatingEndLocal, mins, maxs, rotatingHeadnode, -1);
  const rotatingSolidLocalPoint = findSolidLocalPoint(world, rotatingModelIndex, rotatingHeadnode);
  const rotatingSolidWorldPoint = addVec3(rotatingOrigin, rotateOutOfModelFrame(rotatingSolidLocalPoint, negateVec3(rotatingAngles)));
  const rotatingStationaryTrace = CM_TransformedBoxTrace(
    world,
    rotatingSolidWorldPoint,
    rotatingSolidWorldPoint,
    mins,
    maxs,
    rotatingHeadnode,
    -1,
    rotatingOrigin,
    rotatingAngles
  );
  const pointContents = CM_TransformedPointContents(world, rotatingSolidWorldPoint, rotatingHeadnode, rotatingOrigin, rotatingAngles);

  console.log(`Verification collision phase 1 - ${MAP_PATH}`);
  console.log(`linear fraction: ${linearTrace.fraction.toFixed(6)} / local ${linearLocalTrace.fraction.toFixed(6)}`);
  console.log(`linear endpos: ${formatVec3(linearTrace.endpos)}`);
  console.log(`linear stationary solid flags: startsolid=${linearStationaryTrace.startsolid} allsolid=${linearStationaryTrace.allsolid}`);
  console.log(`rotating fraction: ${rotatingTrace.fraction.toFixed(6)} / local ${rotatingLocalTrace.fraction.toFixed(6)}`);
  console.log(`rotating endpos: ${formatVec3(rotatingTrace.endpos)}`);
  console.log(`rotating plane normal: ${formatVec3(rotatingTrace.plane.normal)}`);
  console.log(`rotating stationary solid flags: startsolid=${rotatingStationaryTrace.startsolid} allsolid=${rotatingStationaryTrace.allsolid}`);
  console.log(`rotating contents at origin: ${pointContents}`);

  assertAlmostEqual(linearTrace.fraction, linearLocalTrace.fraction, "fraction translation");
  assertVecAlmostEqual(linearTrace.plane.normal, [0, 0, 0], "miss trace default plane normal");
  assertVecAlmostEqual(
    linearTrace.endpos,
    interpolateTraceEnd(linearStart, linearEnd, linearLocalTrace.fraction),
    "endpos translation"
  );
  assertAlmostEqual(rotatingTrace.fraction, rotatingLocalTrace.fraction, "fraction rotation");
  assertVecAlmostEqual(
    rotatingTrace.endpos,
    interpolateTraceEnd(rotatingStart, rotatingEnd, rotatingLocalTrace.fraction),
    "endpos rotation"
  );
  if (rotatingLocalTrace.fraction !== 1.0) {
    const expectedPlane = rotateOutOfModelFrame(rotatingLocalTrace.plane.normal, negateVec3(rotatingAngles));
    assertVecAlmostEqual(rotatingTrace.plane.normal, expectedPlane, "plane rotation");
  }
  assertBoolean(linearStationaryTrace.startsolid, true, "linear startsolid");
  assertBoolean(linearStationaryTrace.allsolid, true, "linear allsolid");
  assertBoolean(rotatingStationaryTrace.startsolid, true, "rotating startsolid");
  assertBoolean(rotatingStationaryTrace.allsolid, true, "rotating allsolid");
  assertBoolean(pointContents !== 0, true, "rotating point contents");
}

/**
 * Category: New
 * Purpose: Require one BSP entity by inline model name.
 */
function requireEntityByModel(map: ReturnType<typeof parseBsp>, model: string): ReturnType<typeof parseBsp>["parsedEntities"][number] {
  const entity = map.parsedEntities.find((candidate) => candidate.properties.model === model);
  if (!entity) {
    throw new Error(`Entite ${model} introuvable dans ${MAP_PATH}`);
  }

  return entity;
}

/**
 * Category: New
 * Purpose: Resolve the headnode backing one inline model name.
 */
function requireHeadnode(map: ReturnType<typeof parseBsp>, modelName: string): number {
  const modelIndex = requireModelIndex(modelName);
  const model = map.models[modelIndex];
  if (!model) {
    throw new Error(`Modele ${modelName} introuvable dans ${MAP_PATH}`);
  }

  return model.headnode;
}

/**
 * Category: New
 * Purpose: Parse one inline model name into its numeric BSP model index.
 */
function requireModelIndex(modelName: string): number {
  const modelIndex = Number.parseInt(modelName.slice(1), 10);
  if (!Number.isFinite(modelIndex)) {
    throw new Error(`Index de modele invalide: ${modelName}`);
  }

  return modelIndex;
}

/**
 * Category: New
 * Purpose: Parse one mandatory Quake origin string.
 */
function requireEntityOrigin(value: string | undefined): vec3_t {
  if (!value) {
    throw new Error("origin manquant");
  }

  const parts = value.trim().split(/\s+/).map((part) => Number.parseFloat(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error(`origin invalide: ${value}`);
  }

  return [parts[0], parts[1], parts[2]];
}

/**
 * Category: New
 * Purpose: Resolve one inline model origin from the entity `origin` field or the BSP model fallback.
 */
function getEntityOrModelOrigin(
  map: ReturnType<typeof parseBsp>,
  entity: ReturnType<typeof parseBsp>["parsedEntities"][number],
  modelName: string
): vec3_t {
  if (entity.properties.origin) {
    return requireEntityOrigin(entity.properties.origin);
  }

  const modelIndex = Number.parseInt(modelName.slice(1), 10);
  const model = map.models[modelIndex];
  if (!model) {
    throw new Error(`Modele ${modelName} introuvable pour l'origine`);
  }

  return [...model.origin];
}

/**
 * Category: New
 * Purpose: Parse one optional Quake angles string.
 */
function requireEntityAngles(value: string | undefined): vec3_t {
  if (!value) {
    return [0, 0, 0];
  }

  const parts = value.trim().split(/\s+/).map((part) => Number.parseFloat(part));
  if (parts.length === 1 && Number.isFinite(parts[0])) {
    return [0, parts[0], 0];
  }
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error(`angles invalides: ${value}`);
  }

  return [parts[0], parts[1], parts[2]];
}

/**
 * Category: New
 * Purpose: Subtract one vector from another without mutating inputs.
 */
function subtractVec3(left: vec3_t, right: vec3_t): vec3_t {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

/**
 * Category: New
 * Purpose: Add two vectors without mutating the inputs.
 */
function addVec3(left: vec3_t, right: vec3_t): vec3_t {
  return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
}

/**
 * Category: New
 * Purpose: Rotate one point into the local frame of a BSP inline model.
 */
function rotateIntoModelFrame(point: vec3_t, angles: vec3_t): vec3_t {
  const basis = AngleVectors(angles);
  return [
    dot(point, basis.forward),
    -dot(point, basis.right),
    dot(point, basis.up)
  ];
}

/**
 * Category: New
 * Purpose: Rotate one plane normal out of the local frame of a BSP inline model.
 */
function rotateOutOfModelFrame(normal: vec3_t, inverseAngles: vec3_t): vec3_t {
  const basis = AngleVectors(inverseAngles);
  return [
    dot(normal, basis.forward),
    -dot(normal, basis.right),
    dot(normal, basis.up)
  ];
}

/**
 * Category: New
 * Purpose: Find one solid point inside the local space of a BSP submodel for stationary trace verification.
 */
function findSolidLocalPoint(
  world: ReturnType<typeof createCollisionWorld>,
  modelIndex: number,
  headnode: number
): vec3_t {
  const cmodel = world.map_cmodels[modelIndex];
  if (!cmodel) {
    throw new Error(`cmodel introuvable pour ${modelIndex}`);
  }

  const mins = cmodel.mins;
  const maxs = cmodel.maxs;
  for (let x = Math.floor(mins[0]); x <= Math.ceil(maxs[0]); x += 8) {
    for (let y = Math.floor(mins[1]); y <= Math.ceil(maxs[1]); y += 8) {
      for (let z = Math.floor(mins[2]); z <= Math.ceil(maxs[2]); z += 8) {
        const point: vec3_t = [x, y, z];
        if (CM_TransformedPointContents(world, point, headnode, [0, 0, 0], [0, 0, 0]) !== 0) {
          return point;
        }
      }
    }
  }

  throw new Error(`Aucun point solide trouve pour le headnode ${headnode}`);
}

/**
 * Category: New
 * Purpose: Negate one vector.
 */
function negateVec3(vector: vec3_t): vec3_t {
  return [-vector[0], -vector[1], -vector[2]];
}

/**
 * Category: New
 * Purpose: Compute one dot product for local verification math.
 */
function dot(left: vec3_t, right: vec3_t): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

/**
 * Category: New
 * Purpose: Rebuild one world-space trace endpoint from a start/end pair and one hit fraction.
 */
function interpolateTraceEnd(start: vec3_t, end: vec3_t, fraction: number): vec3_t {
  return [
    start[0] + fraction * (end[0] - start[0]),
    start[1] + fraction * (end[1] - start[1]),
    start[2] + fraction * (end[2] - start[2])
  ];
}

/**
 * Category: New
 * Purpose: Assert that two scalar values are almost equal.
 */
function assertAlmostEqual(actual: number, expected: number, label: string): void {
  if (Math.abs(actual - expected) > 0.0001) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one boolean equality in verification output.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert that two vectors are almost equal.
 */
function assertVecAlmostEqual(actual: vec3_t, expected: vec3_t, label: string): void {
  for (let index = 0; index < 3; index += 1) {
    assertAlmostEqual(actual[index], expected[index], `${label}[${index}]`);
  }
}

/**
 * Category: New
 * Purpose: Format one vector for console output.
 */
function formatVec3(vector: vec3_t): string {
  return `${vector[0].toFixed(3)},${vector[1].toFixed(3)},${vector[2].toFixed(3)}`;
}
