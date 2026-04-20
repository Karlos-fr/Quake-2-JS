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
  BackSide,
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
  vertexIndices: Uint32Array;
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
  const md2Geometry = createMd2Geometry(model);
  const skinPath = options.skinPath ?? model.skins[0] ?? null;
  const skinTexture = skinPath ? loadMd2SkinTexture(filesystem, skinPath) : null;
  const material = skinTexture
    ? new MeshBasicMaterial({
        map: skinTexture,
        alphaTest: 0.5,
        transparent: false,
        side: BackSide
      })
    : new MeshBasicMaterial({ color: 0xc9b48c });
  const mesh = new Mesh(md2Geometry.geometry, material);
  mesh.name = `md2:${skinPath ?? "unskinned"}`;

  return {
    mesh,
    model,
    skinTexture,
    vertexIndices: md2Geometry.vertexIndices
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

  for (const sourceVertexIndex of meshInstance.vertexIndices) {
    const vertexIndex = sourceVertexIndex * 3;
    array[writeIndex] = frame.positions[vertexIndex];
    array[writeIndex + 1] = frame.positions[vertexIndex + 1];
    array[writeIndex + 2] = frame.positions[vertexIndex + 2];
    writeIndex += 3;
  }

  positionAttribute.needsUpdate = true;
  meshInstance.mesh.geometry.computeVertexNormals();
}

/**
 * Category: New
 * Purpose: Apply one interpolated MD2 pose between two source frames using the Quake-style backlerp fraction.
 *
 * Constraints:
 * - Must fall back to a single frame when one source frame is unavailable.
 * - Must preserve the original triangle indexing and only mutate the position buffer.
 */
export function applyMd2LerpedFrame(
  meshInstance: Md2MeshInstance,
  currentFrameIndex: number,
  previousFrameIndex: number,
  backlerp: number
): void {
  const currentFrame = meshInstance.model.frames[currentFrameIndex];
  const previousFrame = meshInstance.model.frames[previousFrameIndex];
  if (!currentFrame) {
    return;
  }

  if (!previousFrame || currentFrameIndex === previousFrameIndex || backlerp <= 0) {
    applyMd2Frame(meshInstance, currentFrameIndex);
    return;
  }

  const frontlerp = 1 - backlerp;
  const positionAttribute = meshInstance.mesh.geometry.getAttribute("position") as BufferAttribute | undefined;
  if (!positionAttribute) {
    return;
  }

  const array = positionAttribute.array as Float32Array;
  let writeIndex = 0;

  for (const sourceVertexIndex of meshInstance.vertexIndices) {
    const vertexIndex = sourceVertexIndex * 3;
    array[writeIndex] =
      (previousFrame.positions[vertexIndex] * backlerp) +
      (currentFrame.positions[vertexIndex] * frontlerp);
    array[writeIndex + 1] =
      (previousFrame.positions[vertexIndex + 1] * backlerp) +
      (currentFrame.positions[vertexIndex + 1] * frontlerp);
    array[writeIndex + 2] =
      (previousFrame.positions[vertexIndex + 2] * backlerp) +
      (currentFrame.positions[vertexIndex + 2] * frontlerp);
    writeIndex += 3;
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
function createMd2Geometry(model: Md2Model): { geometry: BufferGeometry; vertexIndices: Uint32Array } {
  const glCommandVertices = buildMd2GlCommandVertices(model);
  const frame = model.frames[0];
  const positions = new Float32Array(glCommandVertices.length * 3);
  const uvs = new Float32Array(glCommandVertices.length * 2);
  const vertexIndices = new Uint32Array(glCommandVertices.length);

  let positionOffset = 0;
  let uvOffset = 0;

  for (let index = 0; index < glCommandVertices.length; index += 1) {
    const commandVertex = glCommandVertices[index];
    const positionIndex = commandVertex.vertexIndex * 3;
    positions[positionOffset] = frame.positions[positionIndex];
    positions[positionOffset + 1] = frame.positions[positionIndex + 1];
    positions[positionOffset + 2] = frame.positions[positionIndex + 2];
    positionOffset += 3;

    uvs[uvOffset] = commandVertex.s;
    uvs[uvOffset + 1] = 1 - commandVertex.t;
    uvOffset += 2;

    vertexIndices[index] = commandVertex.vertexIndex;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return { geometry, vertexIndices };
}

/**
 * Category: New
 * Purpose: Rebuild the original MD2 OpenGL command stream into a flat triangle list that preserves Quake II strip and fan winding.
 *
 * Constraints:
 * - Must follow `dmdl_t.ofs_glcmds` semantics from `ref_gl/gl_mesh.c`.
 * - Must preserve the original per-command texture coordinates and vertex ordering.
 */
function buildMd2GlCommandVertices(model: Md2Model): Array<{ s: number; t: number; vertexIndex: number }> {
  const vertices: Array<{ s: number; t: number; vertexIndex: number }> = [];
  let commandOffset = 0;

  while (commandOffset < model.glcmds.length) {
    const count = model.glcmds[commandOffset];
    commandOffset += 1;

    if (count === 0) {
      break;
    }

    const primitiveVertexCount = Math.abs(count);
    const primitiveVertices: Array<{ s: number; t: number; vertexIndex: number }> = [];

    for (let index = 0; index < primitiveVertexCount; index += 1) {
      primitiveVertices.push({
        s: decodeMd2GlFloat(model.glcmds[commandOffset]),
        t: decodeMd2GlFloat(model.glcmds[commandOffset + 1]),
        vertexIndex: model.glcmds[commandOffset + 2]
      });
      commandOffset += 3;
    }

    if (count < 0) {
      appendMd2TriangleFan(vertices, primitiveVertices);
      continue;
    }

    appendMd2TriangleStrip(vertices, primitiveVertices);
  }

  return vertices;
}

/**
 * Category: New
 * Purpose: Append one MD2 triangle-fan command to the flattened triangle list.
 *
 * Constraints:
 * - Must preserve the original fan center and winding as emitted by Quake II.
 */
function appendMd2TriangleFan(
  target: Array<{ s: number; t: number; vertexIndex: number }>,
  source: Array<{ s: number; t: number; vertexIndex: number }>
): void {
  for (let index = 2; index < source.length; index += 1) {
    target.push(source[0], source[index - 1], source[index]);
  }
}

/**
 * Category: New
 * Purpose: Append one MD2 triangle-strip command to the flattened triangle list.
 *
 * Constraints:
 * - Must alternate winding exactly like OpenGL triangle strips.
 */
function appendMd2TriangleStrip(
  target: Array<{ s: number; t: number; vertexIndex: number }>,
  source: Array<{ s: number; t: number; vertexIndex: number }>
): void {
  for (let index = 2; index < source.length; index += 1) {
    if ((index & 1) === 0) {
      target.push(source[index - 2], source[index - 1], source[index]);
      continue;
    }

    target.push(source[index - 1], source[index - 2], source[index]);
  }
}

/**
 * Category: New
 * Purpose: Decode one packed MD2 OpenGL command float stored in the raw dword stream.
 *
 * Constraints:
 * - Must preserve IEEE-754 bit layout exactly.
 */
function decodeMd2GlFloat(value: number): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, value, true);
  return view.getFloat32(0, true);
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
