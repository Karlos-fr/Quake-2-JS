/**
 * File: bsp-surface-builder.ts
 * Purpose: Convert parsed Quake II BSP faces into renderer-agnostic triangulated surfaces.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the BSP data model and future rendering backends.
 *
 * Dependencies:
 * - packages/formats
 * - packages/qcommon
 */

import type { BspMap, dface_t, texinfo_t } from "../../formats/src/index.js";
import { SURF_NODRAW, SURF_SKY } from "../../qcommon/src/q-shared.js";

/**
 * Category: New
 * Purpose: Describe one triangulated BSP surface ready for renderer-specific mesh upload.
 *
 * Constraints:
 * - Must preserve face-to-material mapping.
 * - Must keep source face indices for later debugging and bridge logic.
 */
export interface BspSurface {
  faceIndex: number;
  textureName: string;
  texinfoIndex: number;
  flags: number;
  positions: Float32Array;
  texcoords: Float32Array;
  indices: Uint32Array;
}

/**
 * Category: New
 * Purpose: Control which BSP faces are converted into renderable surfaces.
 *
 * Constraints:
 * - Defaults must favor visible world geometry.
 */
export interface BspSurfaceBuildOptions {
  includeSky?: boolean;
  includeNoDraw?: boolean;
}

/**
 * Category: New
 * Purpose: Build triangulated renderer-common BSP surfaces from parsed Quake II map data.
 *
 * Constraints:
 * - Must not mutate the source BSP map.
 * - Must preserve surface ordering for debug and tracing.
 */
export function buildBspSurfaces(map: BspMap, options: BspSurfaceBuildOptions = {}): BspSurface[] {
  const surfaces: BspSurface[] = [];

  for (let faceIndex = 0; faceIndex < map.faces.length; faceIndex += 1) {
    const face = map.faces[faceIndex];
    const texinfo = map.texinfo[face.texinfo];
    if (!texinfo) {
      continue;
    }

    if (!shouldIncludeFace(texinfo, options)) {
      continue;
    }

    const polygon = buildFacePolygon(map, face);
    if (polygon.length < 3) {
      continue;
    }

    surfaces.push(createSurface(faceIndex, face, texinfo, polygon));
  }

  return surfaces;
}

/**
 * Category: New
 * Purpose: Decide whether one BSP face should become a renderable surface.
 *
 * Constraints:
 * - Must skip nodraw and sky by default.
 */
function shouldIncludeFace(texinfo: texinfo_t, options: BspSurfaceBuildOptions): boolean {
  if (!options.includeNoDraw && (texinfo.flags & SURF_NODRAW) !== 0) {
    return false;
  }

  if (!options.includeSky && (texinfo.flags & SURF_SKY) !== 0) {
    return false;
  }

  return true;
}

/**
 * Category: New
 * Purpose: Reconstruct the polygon vertices used by one BSP face.
 *
 * Constraints:
 * - Must resolve surfedges and signed edge orientation exactly.
 */
function buildFacePolygon(map: BspMap, face: dface_t): Array<[number, number, number]> {
  const polygon: Array<[number, number, number]> = [];

  for (let edgeOffset = 0; edgeOffset < face.numedges; edgeOffset += 1) {
    const surfedgeIndex = map.surfedges[face.firstedge + edgeOffset];
    const edge = map.edges[Math.abs(surfedgeIndex)];
    if (!edge) {
      continue;
    }

    const vertexIndex = surfedgeIndex >= 0 ? edge.v[0] : edge.v[1];
    const vertex = map.vertexes[vertexIndex];
    if (!vertex) {
      continue;
    }

    polygon.push(vertex.point);
  }

  return polygon;
}

/**
 * Category: New
 * Purpose: Create one triangulated surface payload from a reconstructed BSP face polygon.
 *
 * Constraints:
 * - Must preserve per-vertex texture mapping derived from texinfo vectors.
 */
function createSurface(
  faceIndex: number,
  face: dface_t,
  texinfo: texinfo_t,
  polygon: Array<[number, number, number]>
): BspSurface {
  const positions = new Float32Array(polygon.length * 3);
  const texcoords = new Float32Array(polygon.length * 2);

  for (let vertexIndex = 0; vertexIndex < polygon.length; vertexIndex += 1) {
    const point = polygon[vertexIndex];
    const positionOffset = vertexIndex * 3;
    const texcoordOffset = vertexIndex * 2;

    positions[positionOffset] = point[0];
    positions[positionOffset + 1] = point[1];
    positions[positionOffset + 2] = point[2];

    texcoords[texcoordOffset] = dotTexInfo(texinfo.vecs[0], point);
    texcoords[texcoordOffset + 1] = dotTexInfo(texinfo.vecs[1], point);
  }

  const triangleCount = polygon.length - 2;
  const indices = new Uint32Array(triangleCount * 3);

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
    const indexOffset = triangleIndex * 3;
    indices[indexOffset] = 0;
    indices[indexOffset + 1] = triangleIndex + 1;
    indices[indexOffset + 2] = triangleIndex + 2;
  }

  return {
    faceIndex,
    textureName: texinfo.texture,
    texinfoIndex: face.texinfo,
    flags: texinfo.flags,
    positions,
    texcoords,
    indices
  };
}

/**
 * Category: New
 * Purpose: Compute one BSP texture coordinate using one Quake texinfo row.
 *
 * Constraints:
 * - Must preserve the original affine mapping formula.
 */
function dotTexInfo(row: [number, number, number, number], point: [number, number, number]): number {
  return point[0] * row[0] + point[1] * row[1] + point[2] * row[2] + row[3];
}
