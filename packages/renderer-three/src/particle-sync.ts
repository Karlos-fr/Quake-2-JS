/**
 * File: particle-sync.ts
 * Purpose: Synchronize Quake II client refresh particles into a Three.js mesh using the ported `gl_rmain.c` particle geometry path.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the client refresh frame and the Three.js backend.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/formats
 * - packages/qcommon
 * - packages/renderer-three/src/gl-rmain.ts
 * - three
 */

import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parsePcx } from "../../formats/src/index.js";
import type { ClientRefreshFrame } from "../../client/src/refresh.js";
import { AngleVectors } from "../../qcommon/src/index.js";
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType
} from "three";
import { buildParticleTextureRgba } from "./gl-rmisc.js";
import {
  GL_DrawParticles,
  createGlRmainRuntime,
  setRmainPaletteTable,
  setRmainParticleTexture
} from "./gl-rmain.js";

interface ParticleSyncGeometryState {
  positions: Float32Array;
  uvs: Float32Array;
  colors: Float32Array;
}

export interface ThreeParticleSync {
  root: Group;
  apply: (refreshFrame: ClientRefreshFrame | null) => number;
}

/**
 * Category: New
 * Purpose: Build one Three.js adapter that renders client refresh particles using the ported Quake II triangle-particle path.
 *
 * Constraints:
 * - Must reuse `GL_DrawParticles` geometry rules instead of inventing a parallel particle layout.
 * - Must tolerate missing palette assets by falling back to a grayscale table.
 */
export function createThreeParticleSync(filesystem: VirtualFilesystem): ThreeParticleSync {
  const root = new Group();
  root.name = "refresh-particles";

  const geometry = new BufferGeometry();
  const material = new MeshBasicMaterial({
    map: createParticleTexture(),
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    side: DoubleSide
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = "refresh-particles:mesh";
  mesh.frustumCulled = false;
  root.add(mesh);

  const runtime = createGlRmainRuntime();
  const paletteTable = loadPaletteTable(filesystem);
  setRmainPaletteTable(runtime, paletteTable);
  setRmainParticleTexture(runtime, { name: "***particle***" } as never);

  let capturedState: ParticleSyncGeometryState = {
    positions: new Float32Array(0),
    uvs: new Float32Array(0),
    colors: new Float32Array(0)
  };

  runtime.hooks.onDrawParticles = (_texture, triangles) => {
    const positions = new Float32Array(triangles.length * 3 * 3);
    const uvs = new Float32Array(triangles.length * 3 * 2);
    const colors = new Float32Array(triangles.length * 3 * 4);

    let positionOffset = 0;
    let uvOffset = 0;
    let colorOffset = 0;
    for (const triangle of triangles) {
      for (const vertex of triangle.vertices) {
        positions[positionOffset] = vertex.position[0];
        positions[positionOffset + 1] = vertex.position[1];
        positions[positionOffset + 2] = vertex.position[2];
        positionOffset += 3;

        uvs[uvOffset] = vertex.uv[0];
        uvs[uvOffset + 1] = vertex.uv[1];
        uvOffset += 2;

        colors[colorOffset] = triangle.color[0];
        colors[colorOffset + 1] = triangle.color[1];
        colors[colorOffset + 2] = triangle.color[2];
        colors[colorOffset + 3] = triangle.color[3];
        colorOffset += 4;
      }
    }

    capturedState = { positions, uvs, colors };
  };

  return {
    root,
    apply: (refreshFrame) => {
      if (!refreshFrame || refreshFrame.particles.length === 0) {
        geometry.setDrawRange(0, 0);
        mesh.visible = false;
        return 0;
      }

      const vectors = AngleVectors(refreshFrame.view.viewangles);
      runtime.r_origin = [...refreshFrame.view.vieworg];
      runtime.vpn = [...vectors.forward];
      runtime.vup = [...vectors.up];
      runtime.vright = [...vectors.right];
      capturedState = {
        positions: new Float32Array(0),
        uvs: new Float32Array(0),
        colors: new Float32Array(0)
      };

      GL_DrawParticles(runtime, refreshFrame.particles.length, refreshFrame.particles, paletteTable);

      updateGeometry(geometry, capturedState);
      mesh.visible = capturedState.positions.length > 0;
      geometry.setDrawRange(0, capturedState.positions.length / 3);
      return refreshFrame.particles.length;
    }
  };
}

function updateGeometry(geometry: BufferGeometry, state: ParticleSyncGeometryState): void {
  geometry.setAttribute("position", new BufferAttribute(state.positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(state.uvs, 2));
  geometry.setAttribute("color", new BufferAttribute(state.colors, 4));
  geometry.computeBoundingSphere();
}

function createParticleTexture(): DataTexture {
  const texture = new DataTexture(buildParticleTextureRgba(), 8, 8, RGBAFormat, UnsignedByteType);
  texture.flipY = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function loadPaletteTable(filesystem: VirtualFilesystem): Uint32Array {
  const paletteFile = readMountedFile(filesystem, "pics/colormap.pcx");
  if (!paletteFile) {
    return Uint32Array.from({ length: 256 }, (_, index) => (((255 << 24) >>> 0) | (index << 16) | (index << 8) | index) >>> 0);
  }

  try {
    const palette = parsePcx(paletteFile.bytes, paletteFile.path).paletteRgb;
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      const r = palette[index * 3] ?? 0;
      const g = palette[index * 3 + 1] ?? 0;
      const b = palette[index * 3 + 2] ?? 0;
      table[index] = (((255 << 24) >>> 0) | (b << 16) | (g << 8) | r) >>> 0;
    }
    table[255] &= 0x00ffffff;
    return table;
  } catch {
    return Uint32Array.from({ length: 256 }, (_, index) => (((255 << 24) >>> 0) | (index << 16) | (index << 8) | index) >>> 0);
  }
}
