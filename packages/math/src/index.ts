/**
 * File: index.ts
 * Purpose: Provide the shared vector and scalar math helpers required by strict Quake II ports.
 *
 * This file is not a direct source port.
 * It gathers low-level helpers that support multiple runtime modules while preserving Quake-style naming.
 *
 * Dependencies:
 * - None
 */

export const vec3_origin: [number, number, number] = [0, 0, 0];

/**
 * Category: New
 * Purpose: Clone a Quake-style vec3 tuple.
 *
 * Constraints:
 * - Must preserve tuple ordering and numeric values exactly.
 */
export function cloneVec3(vector: [number, number, number]): [number, number, number] {
  return [vector[0], vector[1], vector[2]];
}

/**
 * Original name: VectorClear
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Clears all vector components to zero.
 *
 * Porting notes:
 * - Mutates the provided tuple to mirror the original macro behavior.
 */
export function VectorClear(vector: [number, number, number]): void {
  vector[0] = 0;
  vector[1] = 0;
  vector[2] = 0;
}

/**
 * Original name: VectorCopy
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Copies three vector components from `input` to `output`.
 *
 * Porting notes:
 * - Preserves in-place mutation semantics used throughout the original codebase.
 */
export function VectorCopy(
  input: [number, number, number],
  output: [number, number, number]
): void {
  output[0] = input[0];
  output[1] = input[1];
  output[2] = input[2];
}

/**
 * Original name: VectorAdd
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Adds two vectors component-wise into `output`.
 *
 * Porting notes:
 * - Keeps the original mutable output style instead of returning a new tuple.
 */
export function VectorAdd(
  left: [number, number, number],
  right: [number, number, number],
  output: [number, number, number]
): void {
  output[0] = left[0] + right[0];
  output[1] = left[1] + right[1];
  output[2] = left[2] + right[2];
}

/**
 * Original name: VectorSubtract
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Subtracts `right` from `left` component-wise into `output`.
 */
export function VectorSubtract(
  left: [number, number, number],
  right: [number, number, number],
  output: [number, number, number]
): void {
  output[0] = left[0] - right[0];
  output[1] = left[1] - right[1];
  output[2] = left[2] - right[2];
}

/**
 * Original name: VectorScale
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Scales a vector by `scale` into `output`.
 */
export function VectorScale(
  input: [number, number, number],
  scale: number,
  output: [number, number, number]
): void {
  output[0] = input[0] * scale;
  output[1] = input[1] * scale;
  output[2] = input[2] * scale;
}

/**
 * Original name: VectorMA
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Computes `output = vector + scale * addend`.
 */
export function VectorMA(
  vector: [number, number, number],
  scale: number,
  addend: [number, number, number],
  output: [number, number, number]
): void {
  output[0] = vector[0] + scale * addend[0];
  output[1] = vector[1] + scale * addend[1];
  output[2] = vector[2] + scale * addend[2];
}

/**
 * Original name: DotProduct
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the dot product of two vectors.
 */
export function DotProduct(left: [number, number, number], right: [number, number, number]): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

/**
 * Original name: CrossProduct
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Computes the cross product of `left` and `right` into `output`.
 */
export function CrossProduct(
  left: [number, number, number],
  right: [number, number, number],
  output: [number, number, number]
): void {
  output[0] = left[1] * right[2] - left[2] * right[1];
  output[1] = left[2] * right[0] - left[0] * right[2];
  output[2] = left[0] * right[1] - left[1] * right[0];
}

/**
 * Original name: VectorLength
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the Euclidean length of a vec3.
 */
export function VectorLength(vector: [number, number, number]): number {
  return Math.sqrt(DotProduct(vector, vector));
}

/**
 * Original name: VectorNormalize
 * Source: game/q_shared.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Normalizes the vector in place and returns the original length.
 *
 * Porting notes:
 * - Keeps the original in-place mutation contract.
 */
export function VectorNormalize(vector: [number, number, number]): number {
  const length = VectorLength(vector);
  if (length === 0) {
    return 0;
  }

  const inverseLength = 1 / length;
  vector[0] *= inverseLength;
  vector[1] *= inverseLength;
  vector[2] *= inverseLength;
  return length;
}
