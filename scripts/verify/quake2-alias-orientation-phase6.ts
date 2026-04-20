/**
 * File: quake2-alias-orientation-phase6.ts
 * Purpose: Verify the canonical Quake II alias-model rotation convention mirrored in the Three.js backend.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 6 of the visible-entities plan.
 *
 * Dependencies:
 * - three
 */

import { Euler, Matrix4, Vector3 } from "three";

main();

/**
 * Category: New
 * Purpose: Compare the ported alias-model rotation against the effective original Quake II transform order from `R_DrawAliasModel` plus `R_RotateForEntity`.
 */
function main(): void {
  const testAngles: Array<[number, number, number]> = [
    [0, 90, 0],
    [30, 45, 0],
    [-20, 15, 10],
    [0, 180, -25]
  ];

  for (const angles of testAngles) {
    assertOrientationMatchesOriginal(angles);
  }

  console.log("Verification phase 6 - alias orientation OK");
}

/**
 * Category: New
 * Purpose: Assert that the ported Three.js Euler convention yields the same transformed basis vectors as the original Quake II alias-model rotation order.
 */
function assertOrientationMatchesOriginal(angles: [number, number, number]): void {
  const originalMatrix = buildOriginalAliasRotationMatrix(angles);
  const portedMatrix = buildPortedAliasRotationMatrix(angles);

  const basisVectors = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1)
  ];

  for (const [index, basis] of basisVectors.entries()) {
    const original = basis.clone().applyMatrix4(originalMatrix);
    const ported = basis.clone().applyMatrix4(portedMatrix);
    const delta = original.distanceTo(ported);
    if (delta > 0.0001) {
      throw new Error(`orientation mismatch for angles ${angles.join(", ")} on basis ${index}: ${delta}`);
    }
  }
}

/**
 * Category: New
 * Purpose: Build the effective Quake II alias-model rotation matrix from the original OpenGL call order.
 */
function buildOriginalAliasRotationMatrix(angles: [number, number, number]): Matrix4 {
  const pitch = degreesToRadians(angles[0]);
  const yaw = degreesToRadians(angles[1]);
  const roll = degreesToRadians(angles[2]);

  const yawMatrix = new Matrix4().makeRotationZ(yaw);
  const pitchMatrix = new Matrix4().makeRotationY(pitch);
  const rollMatrix = new Matrix4().makeRotationX(-roll);

  return new Matrix4().multiplyMatrices(yawMatrix, new Matrix4().multiplyMatrices(pitchMatrix, rollMatrix));
}

/**
 * Category: New
 * Purpose: Build the ported Three.js alias-model rotation matrix encoded in `refresh-entity-sync.ts`.
 */
function buildPortedAliasRotationMatrix(angles: [number, number, number]): Matrix4 {
  const pitch = degreesToRadians(angles[0]);
  const yaw = degreesToRadians(angles[1]);
  const roll = degreesToRadians(angles[2]);
  const euler = new Euler(-roll, pitch, yaw, "ZYX");
  return new Matrix4().makeRotationFromEuler(euler);
}

/**
 * Category: New
 * Purpose: Convert one degree angle to radians.
 */
function degreesToRadians(value: number): number {
  return value * Math.PI / 180;
}
