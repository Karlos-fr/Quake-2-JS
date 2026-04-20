/**
 * File: sky-scene-adapter.ts
 * Source: Quake II original / ref_gl/gl_warp.c
 * Purpose: Render the active Quake II sky with face ordering and texture mapping aligned to the original skybox code path.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Renders a full static six-face skybox mesh instead of clipping visible sky polygons first.
 * - Uses Three.js meshes and UVs in place of immediate-mode OpenGL calls.
 *
 * Notes:
 * - This file intentionally follows the original `st_to_vec`, `skytexorder` and `MakeSkyVec` conventions.
 */

import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Vector3,
  type Camera
} from "three";
import { QUAKE_SKY_FACE_SUFFIXES, type QuakeSkySnapshot } from "../../renderer-common/src/index.js";
import type { LoadedQuakeSkyTextureSet, QuakeSkyResolver } from "./quake-sky-resolver.js";

const SKY_BOX_DISTANCE = 2300;
const ROTATING_SKY_TEX_MIN = 1 / 256;
const ROTATING_SKY_TEX_MAX = 255 / 256;
const STATIC_SKY_TEX_MIN = 1 / 512;
const STATIC_SKY_TEX_MAX = 511 / 512;
const SKYTEXORDER = [0, 2, 1, 3, 4, 5] as const;
const ST_TO_VEC = [
  [3, -1, 2],
  [-3, 1, 2],
  [1, 3, 2],
  [-1, -3, 2],
  [-2, -1, 3],
  [2, -1, -3]
] as const;

/**
 * Category: New
 * Purpose: Hold the imperative hooks used to keep the rendered sky aligned with client sky state and camera movement.
 *
 * Constraints:
 * - Must tolerate `null` sky snapshots without breaking the scene.
 */
export interface ThreeSkySceneAdapter {
  root: Group;
  update: (snapshot: QuakeSkySnapshot | null, camera: Camera, elapsedSeconds: number) => void;
}

/**
 * Category: New
 * Purpose: Create a dedicated Three.js sky adapter that follows Quake II face ordering and UV conventions.
 *
 * Constraints:
 * - Must render sky independently from BSP geometry.
 * - Must keep the sky centered on the camera origin.
 */
export function createThreeSkySceneAdapter(resolver: QuakeSkyResolver): ThreeSkySceneAdapter {
  const root = new Group();
  root.name = "quake-sky-root";

  let currentSkyKey = "";
  let currentSkyMesh: Mesh | null = null;

  return {
    root,
    update: (snapshot, camera, elapsedSeconds) => {
      root.position.copy(camera.position);

      if (!snapshot) {
        currentSkyKey = "";
        currentSkyMesh = replaceSkyMesh(root, currentSkyMesh, null);
        return;
      }

      const nextSkyKey = buildSkyKey(snapshot);
      if (nextSkyKey !== currentSkyKey) {
        currentSkyKey = nextSkyKey;
        const textureSet = resolver.resolveTextureSet(snapshot.name);
        currentSkyMesh = replaceSkyMesh(root, currentSkyMesh, textureSet ? createSkyMesh(textureSet, snapshot.rotate) : null);
      }

      if (!currentSkyMesh) {
        return;
      }

      const axis = normalizeAxis(snapshot.axis);
      const rotationRadians = degreesToRadians(snapshot.rotate * elapsedSeconds);
      if (axis.lengthSq() === 0 || rotationRadians === 0) {
        currentSkyMesh.quaternion.identity();
        return;
      }

      currentSkyMesh.quaternion.copy(new Quaternion().setFromAxisAngle(axis, rotationRadians));
    }
  };
}

/**
 * Category: New
 * Purpose: Build a stable cache key from the active Quake II sky snapshot.
 */
function buildSkyKey(snapshot: QuakeSkySnapshot): string {
  return `${snapshot.name}|${snapshot.rotate}|${snapshot.axis.join(",")}`;
}

/**
 * Category: New
 * Purpose: Replace the currently rendered sky mesh while disposing previous sky resources.
 *
 * Constraints:
 * - Must keep exactly one active sky child under the adapter root.
 */
function replaceSkyMesh(root: Group, currentMesh: Mesh | null, nextMesh: Mesh | null): Mesh | null {
  if (currentMesh) {
    root.remove(currentMesh);
    disposeSkyMesh(currentMesh);
  }

  if (nextMesh) {
    root.add(nextMesh);
  }

  return nextMesh;
}

/**
 * Category: New
 * Purpose: Build one Quake II-style sky mesh with explicit per-face geometry and texture mapping.
 *
 * Constraints:
 * - Must preserve the original `skytexorder` face-to-texture correspondence.
 * - Must preserve the original `MakeSkyVec` vertex ordering.
 */
function createSkyMesh(textureSet: LoadedQuakeSkyTextureSet, rotate: number): Mesh {
  const geometry = buildSkyGeometry(rotate);
  const materials = buildSkyMaterials(textureSet);
  const mesh = new Mesh(geometry, materials);
  mesh.name = `quake-sky:${textureSet.assets.name}`;
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return mesh;
}

/**
 * Category: New
 * Purpose: Build the full skybox geometry from the Quake II `MakeSkyVec` convention.
 *
 * Constraints:
 * - Must emit six quads in axis order.
 * - Must use the original texture clamp interval for rotating vs non-rotating skies.
 */
function buildSkyGeometry(rotate: number): BufferGeometry {
  const skyMin = rotate !== 0 ? ROTATING_SKY_TEX_MIN : STATIC_SKY_TEX_MIN;
  const skyMax = rotate !== 0 ? ROTATING_SKY_TEX_MAX : STATIC_SKY_TEX_MAX;

  const positions = new Float32Array(6 * 4 * 3);
  const uvs = new Float32Array(6 * 4 * 2);
  const indices = new Uint16Array(6 * 6);

  let vertexOffset = 0;
  let uvOffset = 0;
  let indexOffset = 0;

  for (let axis = 0; axis < 6; axis += 1) {
    const corners: Array<[number, number]> = [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1]
    ];

    for (let cornerIndex = 0; cornerIndex < corners.length; cornerIndex += 1) {
      const [s, t] = corners[cornerIndex];
      const vertex = makeSkyVertex(s, t, axis, skyMin, skyMax);

      positions[vertexOffset] = vertex.position[0];
      positions[vertexOffset + 1] = vertex.position[1];
      positions[vertexOffset + 2] = vertex.position[2];
      vertexOffset += 3;

      uvs[uvOffset] = vertex.uv[0];
      uvs[uvOffset + 1] = vertex.uv[1];
      uvOffset += 2;
    }

    const baseVertex = axis * 4;
    indices[indexOffset] = baseVertex;
    indices[indexOffset + 1] = baseVertex + 1;
    indices[indexOffset + 2] = baseVertex + 2;
    indices[indexOffset + 3] = baseVertex;
    indices[indexOffset + 4] = baseVertex + 2;
    indices[indexOffset + 5] = baseVertex + 3;
    indexOffset += 6;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));

  geometry.clearGroups();
  for (let axis = 0; axis < 6; axis += 1) {
    geometry.addGroup(axis * 6, 6, axis);
  }

  return geometry;
}

/**
 * Original name: MakeSkyVec
 * Source: ref_gl/gl_warp.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds one skybox vertex position and its corresponding UV from Quake II sky-space `s`/`t`.
 *
 * Porting notes:
 * - Returns structured position and UV data instead of issuing OpenGL commands directly.
 */
function makeSkyVertex(
  s: number,
  t: number,
  axis: number,
  skyMin: number,
  skyMax: number
): {
  position: [number, number, number];
  uv: [number, number];
} {
  const b: [number, number, number] = [
    s * SKY_BOX_DISTANCE,
    t * SKY_BOX_DISTANCE,
    SKY_BOX_DISTANCE
  ];
  const position: [number, number, number] = [0, 0, 0];

  for (let componentIndex = 0; componentIndex < 3; componentIndex += 1) {
    const mapping = ST_TO_VEC[axis][componentIndex];
    position[componentIndex] = mapping < 0 ? -b[-mapping - 1] : b[mapping - 1];
  }

  let skyS = (s + 1) * 0.5;
  let skyT = (t + 1) * 0.5;

  if (skyS < skyMin) {
    skyS = skyMin;
  } else if (skyS > skyMax) {
    skyS = skyMax;
  }

  if (skyT < skyMin) {
    skyT = skyMin;
  } else if (skyT > skyMax) {
    skyT = skyMax;
  }

  skyT = 1 - skyT;

  return {
    position,
    uv: [skyS, skyT]
  };
}

/**
 * Category: New
 * Purpose: Build the six sky materials in the same effective face order used by the original renderer.
 *
 * Constraints:
 * - Must preserve `skytexorder`.
 */
function buildSkyMaterials(textureSet: LoadedQuakeSkyTextureSet): MeshBasicMaterial[] {
  return SKYTEXORDER.map((textureIndex) => {
    const faceName = QUAKE_SKY_FACE_SUFFIXES[textureIndex];
    return new MeshBasicMaterial({
      map: textureSet.textures[faceName],
      side: BackSide,
      depthWrite: false,
      fog: false
    });
  });
}

/**
 * Category: New
 * Purpose: Dispose one transient sky mesh and its owned geometry/material state.
 */
function disposeSkyMesh(mesh: Mesh): void {
  mesh.geometry.dispose();
  const material = mesh.material;
  if (Array.isArray(material)) {
    for (const entry of material) {
      entry.dispose();
    }
    return;
  }

  material.dispose();
}

/**
 * Category: New
 * Purpose: Convert degrees to radians for sky rotation updates.
 */
function degreesToRadians(value: number): number {
  return value * Math.PI / 180;
}

/**
 * Category: New
 * Purpose: Normalize one Quake II sky axis into a stable Three.js vector.
 *
 * Constraints:
 * - Must return a zero vector when no valid axis is present.
 */
function normalizeAxis(axis: [number, number, number]): Vector3 {
  const vector = new Vector3(axis[0], axis[1], axis[2]);
  if (vector.lengthSq() === 0) {
    return vector;
  }

  return vector.normalize();
}
