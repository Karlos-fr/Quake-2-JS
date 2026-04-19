/**
 * File: md2-mesh-builder.ts
 * Purpose: Convert parsed Quake II MD2 models into Three.js meshes with optional PCX skins.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the MD2 asset format and the Three.js backend.
 *
 * Dependencies:
 * - packages/formats
 * - packages/filesystem
 * - three
 */

import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parseMd2, parsePcx, type Md2Model } from "../../formats/src/index.js";
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  type Texture
} from "three";

/**
 * Category: New
 * Purpose: Store the Three.js objects and frame metadata required to animate one MD2 mesh.
 *
 * Constraints:
 * - Must preserve access to the parsed source model for future adapter work.
 */
export interface Md2MeshInstance {
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  model: Md2Model;
  skinTexture: Texture | null;
}

/**
 * Category: New
 * Purpose: Control how one MD2 mesh is created.
 *
 * Constraints:
 * - Defaults must keep the mesh visible even without a decoded skin.
 */
export interface Md2MeshBuildOptions {
  skinPath?: string;
}

/**
 * Category: New
 * Purpose: Build one visible Three.js mesh from a parsed Quake II MD2 model.
 *
 * Constraints:
 * - Must preserve the source triangle indexing and UV mapping.
 * - Must initialize geometry from frame zero.
 */
export function buildMd2Mesh(
  filesystem: VirtualFilesystem,
  model: Md2Model,
  options: Md2MeshBuildOptions = {}
): Md2MeshInstance {
  const geometry = createMd2Geometry(model);
  const skinPath = options.skinPath ?? model.skins[0] ?? null;
  const skinTexture = skinPath ? loadMd2SkinTexture(filesystem, skinPath) : null;
  const material = skinTexture
    ? new MeshBasicMaterial({ map: skinTexture, transparent: true })
    : new MeshBasicMaterial({ color: 0xc9b48c });
  const mesh = new Mesh(geometry, material);
  mesh.name = `md2:${skinPath ?? "unskinned"}`;

  return {
    mesh,
    model,
    skinTexture
  };
}

/**
 * Category: New
 * Purpose: Load and parse one MD2 model from the mounted virtual filesystem.
 *
 * Constraints:
 * - Must return null when the source asset is missing.
 */
export function loadMd2Model(filesystem: VirtualFilesystem, path: string): Md2Model | null {
  const file = readMountedFile(filesystem, path);
  if (!file) {
    return null;
  }

  return parseMd2(file.bytes, file.path);
}

/**
 * Category: New
 * Purpose: Apply one MD2 animation frame to an existing mesh geometry.
 *
 * Constraints:
 * - Must update only the position attribute data.
 */
export function applyMd2Frame(meshInstance: Md2MeshInstance, frameIndex: number): void {
  const frame = meshInstance.model.frames[frameIndex];
  if (!frame) {
    return;
  }

  const positionAttribute = meshInstance.mesh.geometry.getAttribute("position") as BufferAttribute | undefined;
  if (!positionAttribute) {
    return;
  }

  const array = positionAttribute.array as Float32Array;
  let writeIndex = 0;

  for (const triangle of meshInstance.model.triangles) {
    for (let vertexOffset = 0; vertexOffset < 3; vertexOffset += 1) {
      const vertexIndex = triangle.index_xyz[vertexOffset] * 3;
      array[writeIndex] = frame.positions[vertexIndex];
      array[writeIndex + 1] = frame.positions[vertexIndex + 1];
      array[writeIndex + 2] = frame.positions[vertexIndex + 2];
      writeIndex += 3;
    }
  }

  positionAttribute.needsUpdate = true;
  meshInstance.mesh.geometry.computeVertexNormals();
}

/**
 * Category: New
 * Purpose: Build the initial Three.js geometry from MD2 frame zero.
 *
 * Constraints:
 * - Must duplicate triangle vertices so UV seams are preserved.
 */
function createMd2Geometry(model: Md2Model): BufferGeometry {
  const frame = model.frames[0];
  const positions = new Float32Array(model.triangles.length * 9);
  const uvs = new Float32Array(model.triangles.length * 6);

  let positionOffset = 0;
  let uvOffset = 0;

  for (const triangle of model.triangles) {
    for (let vertexOffset = 0; vertexOffset < 3; vertexOffset += 1) {
      const positionIndex = triangle.index_xyz[vertexOffset] * 3;
      positions[positionOffset] = frame.positions[positionIndex];
      positions[positionOffset + 1] = frame.positions[positionIndex + 1];
      positions[positionOffset + 2] = frame.positions[positionIndex + 2];
      positionOffset += 3;

      const st = model.st[triangle.index_st[vertexOffset]];
      uvs[uvOffset] = st.s / model.header.skinwidth;
      uvs[uvOffset + 1] = 1 - st.t / model.header.skinheight;
      uvOffset += 2;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Category: New
 * Purpose: Load an MD2 PCX skin as a Three.js texture.
 *
 * Constraints:
 * - Must return null when the skin asset is missing or invalid.
 */
function loadMd2SkinTexture(filesystem: VirtualFilesystem, path: string): Texture | null {
  const file = readMountedFile(filesystem, path);
  if (!file) {
    return null;
  }

  try {
    const image = parsePcx(file.bytes, file.path);
    const texture = new DataTexture(image.rgba, image.width, image.height, RGBAFormat, UnsignedByteType);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.flipY = true;
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch {
    return null;
  }
}
