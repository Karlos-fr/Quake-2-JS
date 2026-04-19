/**
 * File: collision.ts
 * Source: Quake II original / qcommon/cmodel.c
 * Purpose: Port the first BSP collision and contents queries used by client prediction and shared movement code.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Builds collision state from the already parsed TypeScript BSP representation instead of raw lump memory.
 * - Focuses on world/submodel tracing and point contents, leaving PVS/area flooding for later.
 *
 * Notes:
 * - This file is intended to stay close to the original collision model logic.
 */

import {
  AngleVectors,
  CONTENTS_SOLID,
  SURF_LIGHT,
  type cmodel_t,
  type cplane_t,
  type csurface_t,
  type trace_t,
  type vec3_t
} from "./q-shared.js";
import {
  DotProduct,
  VectorAdd,
  VectorCopy
} from "../../math/src/index.js";
import type { BspMap, dplane_t, texinfo_t } from "../../formats/src/index.js";

const DIST_EPSILON = 0.03125;

interface CollisionBrushSide {
  plane: cplane_t;
  surface: csurface_t;
}

interface CollisionBrush {
  contents: number;
  numsides: number;
  firstbrushside: number;
}

interface CollisionLeaf {
  contents: number;
  cluster: number;
  area: number;
  firstleafbrush: number;
  numleafbrushes: number;
}

interface CollisionNode {
  plane: cplane_t;
  children: [number, number];
}

/**
 * Category: New
 * Purpose: Hold the BSP-derived collision structures needed by point contents and trace queries.
 *
 * Constraints:
 * - Must preserve node/leaf/brush indexing so headnodes from the BSP remain valid.
 */
export interface CollisionWorld {
  map: BspMap;
  map_cmodels: cmodel_t[];
  map_planes: cplane_t[];
  map_nodes: CollisionNode[];
  map_leafs: CollisionLeaf[];
  map_leafbrushes: number[];
  map_brushes: CollisionBrush[];
  map_brushsides: CollisionBrushSide[];
  nullsurface: csurface_t;
}

interface TraceWork {
  start: vec3_t;
  end: vec3_t;
  mins: vec3_t;
  maxs: vec3_t;
  extents: vec3_t;
  ispoint: boolean;
  contents: number;
  trace: trace_t;
  checkedBrushes: Set<number>;
}

/**
 * Category: New
 * Purpose: Build the first collision runtime from a parsed BSP map.
 *
 * Constraints:
 * - Must preserve model headnodes so world model `0` and submodels can be traced later.
 */
export function createCollisionWorld(map: BspMap): CollisionWorld {
  const map_planes = map.planes.map((plane) => createPlane(plane));
  const surfaces = map.texinfo.map((texinfo) => createSurface(texinfo));
  const nullsurface: csurface_t = { name: "", flags: SURF_LIGHT, value: 0 };

  const map_brushsides = map.brushsides.map((side) => ({
    plane: map_planes[side.planenum],
    surface: surfaces[side.texinfo] ?? nullsurface
  }));

  const map_brushes = map.brushes.map((brush) => ({
    contents: brush.contents,
    numsides: brush.numsides,
    firstbrushside: brush.firstside
  }));

  const map_leafs = map.leafs.map((leaf) => ({
    contents: leaf.contents,
    cluster: leaf.cluster,
    area: leaf.area,
    firstleafbrush: leaf.firstleafbrush,
    numleafbrushes: leaf.numleafbrushes
  }));

  const map_nodes = map.nodes.map((node) => ({
    plane: map_planes[node.planenum],
    children: [node.children[0], node.children[1]] as [number, number]
  }));

  const map_cmodels = map.models.map((model) => ({
    mins: [model.mins[0] - 1, model.mins[1] - 1, model.mins[2] - 1] as vec3_t,
    maxs: [model.maxs[0] + 1, model.maxs[1] + 1, model.maxs[2] + 1] as vec3_t,
    origin: [model.origin[0], model.origin[1], model.origin[2]] as vec3_t,
    headnode: model.headnode
  }));

  return {
    map,
    map_cmodels,
    map_planes,
    map_nodes,
    map_leafs,
    map_leafbrushes: Array.from(map.leafbrushes, (value) => value),
    map_brushes,
    map_brushsides,
    nullsurface
  };
}

/**
 * Original name: CM_PointContents
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Returns the BSP leaf contents for one point under a given headnode.
 */
export function CM_PointContents(world: CollisionWorld, point: vec3_t, headnode = 0): number {
  if (world.map_nodes.length === 0) {
    return 0;
  }

  const leafnum = CM_PointLeafnum_r(world, point, headnode);
  return world.map_leafs[leafnum]?.contents ?? CONTENTS_SOLID;
}

/**
 * Original name: CM_TransformedPointContents
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns point contents for one translated or rotated BSP submodel.
 */
export function CM_TransformedPointContents(
  world: CollisionWorld,
  point: vec3_t,
  headnode: number,
  origin: vec3_t,
  angles: vec3_t
): number {
  const localPoint = subtractVec3(point, origin);

  if (headnode !== getBoxHeadnode(world) && hasRotation(angles)) {
    rotateIntoModelFrame(localPoint, angles, localPoint);
  }

  const leafnum = CM_PointLeafnum_r(world, localPoint, headnode);
  return world.map_leafs[leafnum]?.contents ?? CONTENTS_SOLID;
}

/**
 * Original name: CM_BoxTrace
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Sweeps an AABB against one BSP headnode and returns the earliest brush hit.
 *
 * Porting notes:
 * - Covers the core world/submodel brush tracing path needed by `pmove`.
 * - Does not yet port rotated transformed traces.
 */
export function CM_BoxTrace(
  world: CollisionWorld,
  start: vec3_t,
  end: vec3_t,
  mins: vec3_t,
  maxs: vec3_t,
  headnode: number,
  brushmask: number
): trace_t {
  const trace: trace_t = {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: [...end],
    plane: createDefaultPlane(),
    surface: world.nullsurface,
    contents: 0,
    ent: null
  };

  if (world.map_nodes.length === 0) {
    return trace;
  }

  const extents: vec3_t = [0, 0, 0];
  const ispoint = mins[0] === 0 && mins[1] === 0 && mins[2] === 0 && maxs[0] === 0 && maxs[1] === 0 && maxs[2] === 0;
  if (!ispoint) {
    for (let index = 0; index < 3; index += 1) {
      extents[index] = Math.max(Math.abs(mins[index]), Math.abs(maxs[index]));
    }
  }

  const work: TraceWork = {
    start: [...start],
    end: [...end],
    mins: [...mins],
    maxs: [...maxs],
    extents,
    ispoint,
    contents: brushmask,
    trace,
    checkedBrushes: new Set<number>()
  };

  if (start[0] === end[0] && start[1] === end[1] && start[2] === end[2]) {
    CM_TestInLeafs(world, headnode, start, mins, maxs, work);
    VectorCopy(start, work.trace.endpos);
    return work.trace;
  }

  CM_RecursiveHullCheck(world, work, headnode, 0, 1, start, end);

  if (work.trace.fraction === 1) {
    VectorCopy(end, work.trace.endpos);
  } else {
    for (let index = 0; index < 3; index += 1) {
      work.trace.endpos[index] = start[index] + work.trace.fraction * (end[index] - start[index]);
    }
  }

  return work.trace;
}

/**
 * Original name: CM_TransformedBoxTrace
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Sweeps an AABB against one translated or rotated BSP submodel.
 */
export function CM_TransformedBoxTrace(
  world: CollisionWorld,
  start: vec3_t,
  end: vec3_t,
  mins: vec3_t,
  maxs: vec3_t,
  headnode: number,
  brushmask: number,
  origin: vec3_t,
  angles: vec3_t
): trace_t {
  const startLocal = subtractVec3(start, origin);
  const endLocal = subtractVec3(end, origin);
  const rotated = headnode !== getBoxHeadnode(world) && hasRotation(angles);

  if (rotated) {
    rotateIntoModelFrame(startLocal, angles, startLocal);
    rotateIntoModelFrame(endLocal, angles, endLocal);
  }

  const trace = CM_BoxTrace(world, startLocal, endLocal, mins, maxs, headnode, brushmask);

  if (rotated && trace.fraction !== 1.0) {
    const inverseAngles = negateVec3(angles);
    rotateOutOfModelFrame(trace.plane.normal, inverseAngles, trace.plane.normal);
  }

  trace.endpos = [
    start[0] + trace.fraction * (end[0] - start[0]),
    start[1] + trace.fraction * (end[1] - start[1]),
    start[2] + trace.fraction * (end[2] - start[2])
  ];

  return trace;
}

/**
 * Category: New
 * Purpose: Create a `pmove`-compatible trace callback bound to one collision world and headnode.
 *
 * Constraints:
 * - Must preserve `CM_BoxTrace` argument ordering expected by `pmove`.
 */
export function createCollisionTrace(world: CollisionWorld, headnode = 0, brushmask = -1): (
  start: vec3_t,
  mins: vec3_t,
  maxs: vec3_t,
  end: vec3_t
) => trace_t {
  return (start, mins, maxs, end) => {
    const trace = CM_BoxTrace(world, start, end, mins, maxs, headnode, brushmask);

    // Match Quake II `CL_PMTrace`: the world collision path reports a non-null
    // entity sentinel so `pmove` can recognize solid ground contact.
    if (trace.fraction < 1 || trace.startsolid || trace.allsolid) {
      trace.ent = world;
    }

    return trace;
  };
}

/**
 * Category: New
 * Purpose: Create a `pmove`-compatible point contents callback bound to one collision world and headnode.
 *
 * Constraints:
 * - Must preserve `CM_PointContents` semantics for the selected headnode.
 */
export function createCollisionPointContents(world: CollisionWorld, headnode = 0): (point: vec3_t) => number {
  return (point) => CM_PointContents(world, point, headnode);
}

/**
 * Category: New
 * Purpose: Expose one BSP submodel in `cmodel_t` shape for later entity collision usage.
 *
 * Constraints:
 * - Must return null for out-of-range model indexes.
 */
export function CM_InlineModel(world: CollisionWorld, index: number): cmodel_t | null {
  return world.map_cmodels[index] ?? null;
}

/**
 * Original name: CM_PointLeafnum_r
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Walks the BSP node tree to find the leaf containing one point.
 */
function CM_PointLeafnum_r(world: CollisionWorld, point: vec3_t, num: number): number {
  let current = num;

  while (current >= 0) {
    const node = world.map_nodes[current];
    const plane = node.plane;
    let distance: number;
    if (plane.type < 3) {
      distance = point[plane.type] - plane.dist;
    } else {
      distance = DotProduct(point, plane.normal) - plane.dist;
    }

    current = distance < 0 ? node.children[1] : node.children[0];
  }

  return -1 - current;
}

/**
 * Original name: CM_TestBoxInBrush
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Tests whether a stationary AABB starts inside one brush.
 */
function CM_TestBoxInBrush(world: CollisionWorld, mins: vec3_t, maxs: vec3_t, point: vec3_t, trace: trace_t, brush: CollisionBrush): void {
  if (!brush.numsides) {
    return;
  }

  const ofs: vec3_t = [0, 0, 0];
  for (let sideIndex = 0; sideIndex < brush.numsides; sideIndex += 1) {
    const side = world.map_brushsides[brush.firstbrushside + sideIndex];
    const plane = side.plane;

    for (let axis = 0; axis < 3; axis += 1) {
      ofs[axis] = plane.normal[axis] < 0 ? maxs[axis] : mins[axis];
    }

    let dist = DotProduct(ofs, plane.normal);
    dist = plane.dist - dist;
    const d1 = DotProduct(point, plane.normal) - dist;

    if (d1 > 0) {
      return;
    }
  }

  trace.startsolid = true;
  trace.allsolid = true;
  trace.fraction = 0;
  trace.contents = brush.contents;
}

/**
 * Original name: CM_ClipBoxToBrush
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Clips one swept AABB against one convex brush and updates the trace when it is hit sooner.
 */
function CM_ClipBoxToBrush(
  world: CollisionWorld,
  mins: vec3_t,
  maxs: vec3_t,
  p1: vec3_t,
  p2: vec3_t,
  trace: trace_t,
  brush: CollisionBrush
): void {
  if (!brush.numsides) {
    return;
  }

  let enterfrac = -1;
  let leavefrac = 1;
  let clipplane: cplane_t | null = null;
  let leadside: CollisionBrushSide | null = null;
  let getout = false;
  let startout = false;
  const ofs: vec3_t = [0, 0, 0];

  for (let sideIndex = 0; sideIndex < brush.numsides; sideIndex += 1) {
    const side = world.map_brushsides[brush.firstbrushside + sideIndex];
    const plane = side.plane;

    for (let axis = 0; axis < 3; axis += 1) {
      ofs[axis] = plane.normal[axis] < 0 ? maxs[axis] : mins[axis];
    }

    let dist = DotProduct(ofs, plane.normal);
    dist = plane.dist - dist;

    const d1 = DotProduct(p1, plane.normal) - dist;
    const d2 = DotProduct(p2, plane.normal) - dist;

    if (d2 > 0) {
      getout = true;
    }
    if (d1 > 0) {
      startout = true;
    }

    if (d1 > 0 && d2 >= d1) {
      return;
    }
    if (d1 <= 0 && d2 <= 0) {
      continue;
    }

    if (d1 > d2) {
      const fraction = (d1 - DIST_EPSILON) / (d1 - d2);
      if (fraction > enterfrac) {
        enterfrac = fraction;
        clipplane = plane;
        leadside = side;
      }
    } else {
      const fraction = (d1 + DIST_EPSILON) / (d1 - d2);
      if (fraction < leavefrac) {
        leavefrac = fraction;
      }
    }
  }

  if (!startout) {
    trace.startsolid = true;
    trace.contents = brush.contents;
    if (!getout) {
      trace.allsolid = true;
    }
    return;
  }

  if (enterfrac < leavefrac && enterfrac > -1 && enterfrac < trace.fraction) {
    const clampedFraction = enterfrac < 0 ? 0 : enterfrac;
    trace.fraction = clampedFraction;
    trace.contents = brush.contents;
    if (clipplane) {
      trace.plane = {
        normal: [...clipplane.normal],
        dist: clipplane.dist,
        type: clipplane.type,
        signbits: clipplane.signbits,
        pad: [clipplane.pad[0], clipplane.pad[1]]
      };
    }
    trace.surface = leadside?.surface ?? world.nullsurface;
  }
}

/**
 * Original name: CM_TraceToLeaf
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Tests the swept AABB against every relevant brush referenced by one leaf.
 */
function CM_TraceToLeaf(world: CollisionWorld, leafnum: number, work: TraceWork): void {
  const leaf = world.map_leafs[leafnum];
  if ((leaf.contents & work.contents) === 0) {
    return;
  }

  for (let index = 0; index < leaf.numleafbrushes; index += 1) {
    const brushnum = world.map_leafbrushes[leaf.firstleafbrush + index] ?? -1;
    if (brushnum < 0 || work.checkedBrushes.has(brushnum)) {
      continue;
    }
    work.checkedBrushes.add(brushnum);

    const brush = world.map_brushes[brushnum];
    if (!brush || (brush.contents & work.contents) === 0) {
      continue;
    }

    CM_ClipBoxToBrush(world, work.mins, work.maxs, work.start, work.end, work.trace, brush);
    if (work.trace.fraction === 0) {
      return;
    }
  }
}

/**
 * Category: New
 * Purpose: Collect the leafs overlapped by a stationary box and test them for initial solid overlap.
 *
 * Constraints:
 * - Must stay deterministic and avoid duplicate brush testing.
 */
function CM_TestInLeafs(world: CollisionWorld, headnode: number, start: vec3_t, mins: vec3_t, maxs: vec3_t, work: TraceWork): void {
  const c1: vec3_t = [0, 0, 0];
  const c2: vec3_t = [0, 0, 0];
  VectorAdd(start, mins, c1);
  VectorAdd(start, maxs, c2);

  for (let index = 0; index < 3; index += 1) {
    c1[index] -= 1;
    c2[index] += 1;
  }

  const leafs: number[] = [];
  CM_BoxLeafnums_r(world, headnode, c1, c2, leafs);
  for (const leafnum of leafs) {
    const leaf = world.map_leafs[leafnum];
    if ((leaf.contents & work.contents) === 0) {
      continue;
    }

    for (let brushIndex = 0; brushIndex < leaf.numleafbrushes; brushIndex += 1) {
      const brushnum = world.map_leafbrushes[leaf.firstleafbrush + brushIndex] ?? -1;
      if (brushnum < 0 || work.checkedBrushes.has(brushnum)) {
        continue;
      }
      work.checkedBrushes.add(brushnum);

      const brush = world.map_brushes[brushnum];
      if (!brush || (brush.contents & work.contents) === 0) {
        continue;
      }

      CM_TestBoxInBrush(world, mins, maxs, start, work.trace, brush);
      if (work.trace.allsolid) {
        return;
      }
    }
  }
}

/**
 * Category: New
 * Purpose: Recursively collect leaf numbers intersected by an axis-aligned bounds box.
 *
 * Constraints:
 * - Must preserve BSP child numbering where negative child ids reference leafs.
 */
function CM_BoxLeafnums_r(world: CollisionWorld, nodenum: number, mins: vec3_t, maxs: vec3_t, output: number[]): void {
  if (nodenum < 0) {
    output.push(-1 - nodenum);
    return;
  }

  const node = world.map_nodes[nodenum];
  const plane = node.plane;
  let dist1: number;
  let dist2: number;

  if (plane.type < 3) {
    dist1 = mins[plane.type] - plane.dist;
    dist2 = maxs[plane.type] - plane.dist;
  } else {
    dist1 = distToPlaneCorner(mins, maxs, plane.normal, plane.dist, false);
    dist2 = distToPlaneCorner(mins, maxs, plane.normal, plane.dist, true);
  }

  if (dist1 >= 0 && dist2 >= 0) {
    CM_BoxLeafnums_r(world, node.children[0], mins, maxs, output);
    return;
  }
  if (dist1 < 0 && dist2 < 0) {
    CM_BoxLeafnums_r(world, node.children[1], mins, maxs, output);
    return;
  }

  CM_BoxLeafnums_r(world, node.children[0], mins, maxs, output);
  CM_BoxLeafnums_r(world, node.children[1], mins, maxs, output);
}

/**
 * Original name: CM_RecursiveHullCheck
 * Source: qcommon/cmodel.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Walks the BSP recursively and clips the swept AABB against every relevant leaf.
 */
function CM_RecursiveHullCheck(
  world: CollisionWorld,
  work: TraceWork,
  num: number,
  p1f: number,
  p2f: number,
  p1: vec3_t,
  p2: vec3_t
): void {
  if (work.trace.fraction <= p1f) {
    return;
  }

  if (num < 0) {
    CM_TraceToLeaf(world, -1 - num, work);
    return;
  }

  const node = world.map_nodes[num];
  const plane = node.plane;
  let t1: number;
  let t2: number;
  let offset: number;

  if (plane.type < 3) {
    t1 = p1[plane.type] - plane.dist;
    t2 = p2[plane.type] - plane.dist;
    offset = work.extents[plane.type];
  } else {
    t1 = DotProduct(plane.normal, p1) - plane.dist;
    t2 = DotProduct(plane.normal, p2) - plane.dist;
    if (work.ispoint) {
      offset = 0;
    } else {
      offset =
        Math.abs(work.extents[0] * plane.normal[0]) +
        Math.abs(work.extents[1] * plane.normal[1]) +
        Math.abs(work.extents[2] * plane.normal[2]);
    }
  }

  if (t1 >= offset && t2 >= offset) {
    CM_RecursiveHullCheck(world, work, node.children[0], p1f, p2f, p1, p2);
    return;
  }
  if (t1 < -offset && t2 < -offset) {
    CM_RecursiveHullCheck(world, work, node.children[1], p1f, p2f, p1, p2);
    return;
  }

  let side: number;
  let frac: number;
  let frac2: number;

  if (t1 < t2) {
    const idist = 1 / (t1 - t2);
    side = 1;
    frac2 = (t1 + offset + DIST_EPSILON) * idist;
    frac = (t1 - offset + DIST_EPSILON) * idist;
  } else if (t1 > t2) {
    const idist = 1 / (t1 - t2);
    side = 0;
    frac2 = (t1 - offset - DIST_EPSILON) * idist;
    frac = (t1 + offset + DIST_EPSILON) * idist;
  } else {
    side = 0;
    frac = 1;
    frac2 = 0;
  }

  frac = clamp01(frac);
  const midf = p1f + (p2f - p1f) * frac;
  const mid: vec3_t = [0, 0, 0];
  for (let index = 0; index < 3; index += 1) {
    mid[index] = p1[index] + frac * (p2[index] - p1[index]);
  }

  CM_RecursiveHullCheck(world, work, node.children[side], p1f, midf, p1, mid);

  frac2 = clamp01(frac2);
  const midf2 = p1f + (p2f - p1f) * frac2;
  for (let index = 0; index < 3; index += 1) {
    mid[index] = p1[index] + frac2 * (p2[index] - p1[index]);
  }

  CM_RecursiveHullCheck(world, work, node.children[side ^ 1], midf2, p2f, mid, p2);
}

/**
 * Category: New
 * Purpose: Convert one BSP plane into the shared collision plane shape.
 */
function createPlane(plane: dplane_t): cplane_t {
  return {
    normal: [...plane.normal],
    dist: plane.dist,
    type: plane.type,
    signbits: computePlaneSignbits(plane.normal),
    pad: [0, 0]
  };
}

/**
 * Category: New
 * Purpose: Convert one BSP texinfo record into the shared collision/render surface shape.
 */
function createSurface(texinfo: texinfo_t): csurface_t {
  return {
    name: texinfo.texture,
    flags: texinfo.flags,
    value: texinfo.value
  };
}

/**
 * Category: New
 * Purpose: Create a neutral default plane for miss traces.
 */
function createDefaultPlane(): cplane_t {
  return {
    normal: [0, 0, 1],
    dist: 0,
    type: 2,
    signbits: 0,
    pad: [0, 0]
  };
}

/**
 * Category: New
 * Purpose: Compute Quake-style signbits for one plane normal.
 */
function computePlaneSignbits(normal: vec3_t): number {
  let signbits = 0;
  if (normal[0] < 0) {
    signbits |= 1;
  }
  if (normal[1] < 0) {
    signbits |= 2;
  }
  if (normal[2] < 0) {
    signbits |= 4;
  }
  return signbits;
}

/**
 * Category: New
 * Purpose: Clamp one trace fraction into the inclusive `[0, 1]` interval.
 */
function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

/**
 * Category: New
 * Purpose: Compute conservative min/max distances from an AABB to a non-axial BSP plane.
 */
function distToPlaneCorner(mins: vec3_t, maxs: vec3_t, normal: vec3_t, dist: number, farthest: boolean): number {
  const corner: vec3_t = [0, 0, 0];
  for (let index = 0; index < 3; index += 1) {
    if (farthest) {
      corner[index] = normal[index] >= 0 ? maxs[index] : mins[index];
    } else {
      corner[index] = normal[index] >= 0 ? mins[index] : maxs[index];
    }
  }

  return DotProduct(corner, normal) - dist;
}

/**
 * Category: New
 * Purpose: Resolve whether one model-space collision query must account for entity rotation.
 */
function hasRotation(angles: vec3_t): boolean {
  return angles[0] !== 0 || angles[1] !== 0 || angles[2] !== 0;
}

/**
 * Category: New
 * Purpose: Resolve the synthetic box-model headnode used by the original transformed trace fast path.
 *
 * Constraints:
 * - Falls back to `-1` when the world does not expose a dedicated temporary box hull.
 */
function getBoxHeadnode(world: CollisionWorld): number {
  return world.map_cmodels.length > 0 ? world.map_cmodels[0].headnode : -1;
}

/**
 * Category: New
 * Purpose: Rotate one point from world space into the local frame of a rotated BSP submodel.
 */
function rotateIntoModelFrame(input: vec3_t, angles: vec3_t, output: vec3_t): void {
  const basis = AngleVectors(angles);
  const temp: vec3_t = [input[0], input[1], input[2]];
  output[0] = DotProduct(temp, basis.forward);
  output[1] = -DotProduct(temp, basis.right);
  output[2] = DotProduct(temp, basis.up);
}

/**
 * Category: New
 * Purpose: Rotate one plane normal back out of a BSP submodel local frame.
 */
function rotateOutOfModelFrame(input: vec3_t, inverseAngles: vec3_t, output: vec3_t): void {
  const basis = AngleVectors(inverseAngles);
  const temp: vec3_t = [input[0], input[1], input[2]];
  output[0] = DotProduct(temp, basis.forward);
  output[1] = -DotProduct(temp, basis.right);
  output[2] = DotProduct(temp, basis.up);
}

/**
 * Category: New
 * Purpose: Subtract one vector from another without mutating the inputs.
 */
function subtractVec3(left: vec3_t, right: vec3_t): vec3_t {
  return [
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2]
  ];
}

/**
 * Category: New
 * Purpose: Negate one vector without mutating the source.
 */
function negateVec3(vector: vec3_t): vec3_t {
  return [-vector[0], -vector[1], -vector[2]];
}
