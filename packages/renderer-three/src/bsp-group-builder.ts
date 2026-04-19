/**
 * File: bsp-group-builder.ts
 * Purpose: Convert renderer-common BSP surfaces into Three.js meshes grouped by Quake II texture name.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the renderer-common data model and the Three.js backend.
 *
 * Dependencies:
 * - packages/renderer-common
 * - three
 */

import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  type Material,
  type Texture
} from "three";
import type { BspSurface } from "../../renderer-common/src/index.js";

/**
 * Category: New
 * Purpose: Resolve a Quake II texture name into a Three.js texture.
 *
 * Constraints:
 * - May return null when a texture is not yet available.
 */
export type BspTextureResolver = (textureName: string) => Texture | null;

/**
 * Category: New
 * Purpose: Control how BSP surfaces are converted into Three.js meshes.
 *
 * Constraints:
 * - Defaults must remain useful even when no real textures are available.
 */
export interface ThreeBspBuildOptions {
  resolveTexture?: BspTextureResolver;
}

/**
 * Category: New
 * Purpose: Convert renderer-common BSP surfaces into a Three.js group organized by texture.
 *
 * Constraints:
 * - Must not mutate source surfaces.
 * - Must preserve one material grouping per texture name.
 */
export function buildThreeBspGroup(surfaces: BspSurface[], options: ThreeBspBuildOptions = {}): Group {
  const group = new Group();
  const grouped = groupSurfacesByTexture(surfaces);

  for (const [textureName, textureSurfaces] of grouped) {
    const geometry = buildMergedSurfaceGeometry(textureSurfaces);
    const material = createSurfaceMaterial(textureName, options.resolveTexture);
    const mesh = new Mesh(geometry, material);
    mesh.name = `bsp:${textureName}`;
    group.add(mesh);
  }

  return group;
}

/**
 * Category: New
 * Purpose: Group BSP surfaces by their Quake II texture name.
 *
 * Constraints:
 * - Must preserve source order inside each texture bucket.
 */
function groupSurfacesByTexture(surfaces: BspSurface[]): Map<string, BspSurface[]> {
  const grouped = new Map<string, BspSurface[]>();

  for (const surface of surfaces) {
    const bucket = grouped.get(surface.textureName);
    if (bucket) {
      bucket.push(surface);
      continue;
    }

    grouped.set(surface.textureName, [surface]);
  }

  return grouped;
}

/**
 * Category: New
 * Purpose: Merge many triangulated BSP surfaces sharing one texture into one Three.js geometry.
 *
 * Constraints:
 * - Must preserve triangle winding from renderer-common indices.
 */
function buildMergedSurfaceGeometry(surfaces: BspSurface[]): BufferGeometry {
  let totalVertexCount = 0;
  let totalIndexCount = 0;

  for (const surface of surfaces) {
    totalVertexCount += surface.positions.length / 3;
    totalIndexCount += surface.indices.length;
  }

  const positions = new Float32Array(totalVertexCount * 3);
  const uvs = new Float32Array(totalVertexCount * 2);
  const indices = new Uint32Array(totalIndexCount);

  let vertexOffset = 0;
  let uvOffset = 0;
  let indexOffset = 0;
  let baseVertex = 0;

  for (const surface of surfaces) {
    positions.set(surface.positions, vertexOffset);
    uvs.set(surface.texcoords, uvOffset);

    for (let localIndex = 0; localIndex < surface.indices.length; localIndex += 1) {
      indices[indexOffset + localIndex] = baseVertex + surface.indices[localIndex];
    }

    vertexOffset += surface.positions.length;
    uvOffset += surface.texcoords.length;
    indexOffset += surface.indices.length;
    baseVertex += surface.positions.length / 3;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Category: New
 * Purpose: Create a default Three.js material for one BSP texture bucket.
 *
 * Constraints:
 * - Must remain usable even when no texture data is available yet.
 */
function createSurfaceMaterial(textureName: string, resolveTexture: BspTextureResolver | undefined): Material {
  const texture = resolveTexture?.(textureName) ?? null;
  if (texture !== null) {
    const quakeTexture = texture.userData.quake as { width?: number; height?: number } | undefined;
    if (quakeTexture?.width && quakeTexture?.height) {
      texture.repeat.set(1 / quakeTexture.width, 1 / quakeTexture.height);
    }

    return new MeshBasicMaterial({ map: texture });
  }

  return new MeshBasicMaterial({
    color: hashTextureColor(textureName)
  });
}

/**
 * Category: New
 * Purpose: Derive a stable fallback material color from a Quake texture name.
 *
 * Constraints:
 * - Must stay deterministic across runs.
 */
function hashTextureColor(textureName: string): number {
  let hash = 0;

  for (let index = 0; index < textureName.length; index += 1) {
    hash = (hash * 33 + textureName.charCodeAt(index)) >>> 0;
  }

  const r = 64 + (hash & 0x7f);
  const g = 64 + ((hash >> 8) & 0x7f);
  const b = 64 + ((hash >> 16) & 0x7f);
  return (r << 16) | (g << 8) | b;
}
