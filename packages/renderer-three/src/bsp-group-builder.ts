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

export type BspModelOriginResolver = (modelIndex: number) => [number, number, number];

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
  resolveModelOrigin?: BspModelOriginResolver;
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
  const groupedByModel = groupSurfacesByModel(surfaces);

  for (const [modelIndex, modelSurfaces] of groupedByModel) {
    const modelGroup = new Group();
    const modelOrigin = options.resolveModelOrigin?.(modelIndex) ?? [0, 0, 0];
    modelGroup.name = `bsp-model:${modelIndex}`;
    modelGroup.userData.modelIndex = modelIndex;
    modelGroup.position.set(modelOrigin[0], modelOrigin[1], modelOrigin[2]);

    const groupedByTexture = groupSurfacesByTexture(modelSurfaces);
    for (const [textureName, textureSurfaces] of groupedByTexture) {
      const geometry = buildMergedSurfaceGeometry(textureSurfaces, modelOrigin);
      const material = createSurfaceMaterial(textureName, options.resolveTexture);
      const mesh = new Mesh(geometry, material);
      mesh.name = `bsp:${modelIndex}:${textureName}`;
      modelGroup.add(mesh);
    }

    group.add(modelGroup);
  }

  return group;
}

/**
 * Category: New
 * Purpose: Group BSP surfaces by the model index that owns each face.
 *
 * Constraints:
 * - Must preserve source order inside each model bucket.
 */
function groupSurfacesByModel(surfaces: BspSurface[]): Map<number, BspSurface[]> {
  const grouped = new Map<number, BspSurface[]>();

  for (const surface of surfaces) {
    const bucket = grouped.get(surface.modelIndex);
    if (bucket) {
      bucket.push(surface);
      continue;
    }

    grouped.set(surface.modelIndex, [surface]);
  }

  return grouped;
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
function buildMergedSurfaceGeometry(surfaces: BspSurface[], modelOrigin: [number, number, number]): BufferGeometry {
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
    copySurfacePositionsRelativeToModel(positions, vertexOffset, surface.positions, modelOrigin);
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
 * Purpose: Copy BSP surface positions into one merged buffer relative to the owning model origin.
 */
function copySurfacePositionsRelativeToModel(
  target: Float32Array,
  targetOffset: number,
  source: Float32Array,
  modelOrigin: [number, number, number]
): void {
  for (let sourceOffset = 0; sourceOffset < source.length; sourceOffset += 3) {
    target[targetOffset + sourceOffset] = source[sourceOffset] - modelOrigin[0];
    target[targetOffset + sourceOffset + 1] = source[sourceOffset + 1] - modelOrigin[1];
    target[targetOffset + sourceOffset + 2] = source[sourceOffset + 2] - modelOrigin[2];
  }
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
