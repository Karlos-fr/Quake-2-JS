/**
 * File: local-brush-models.ts
 * Purpose: Hold the standalone brush-model snapshot and interpolation helpers used by the local gameplay/client loop.
 *
 * This file is not a direct source port.
 * It is a runtime-side helper layer for moving BSP submodel interpolation.
 *
 * Dependencies:
 * - packages/game
 * - packages/qcommon
 * - packages/renderer-three
 */

import { LerpAngle } from "../../qcommon/src/index.js";
import type { GameRuntime } from "../../game/src/index.js";
import type { BrushModelSnapshot } from "../../renderer-three/src/index.js";
import type { BrushModelInterpolationState } from "./local-gameplay-sync.js";

/**
 * Category: New
 * Purpose: Extract the current inline brush model transforms from the local gameplay runtime.
 *
 * Constraints:
 * - Must only include active entities backed by BSP inline models.
 */
export function buildBrushModelSnapshots(runtime: GameRuntime): BrushModelSnapshot[] {
  const snapshots: BrushModelSnapshot[] = [];

  for (const entity of runtime.entities) {
    if (!entity.inuse || !entity.model?.startsWith("*")) {
      continue;
    }

    snapshots.push({
      model: entity.model,
      origin: [...entity.origin],
      angles: [...entity.angles]
    });
  }

  return snapshots;
}

/**
 * Category: New
 * Purpose: Create the initial brush-model interpolation state from the current gameplay runtime pose.
 *
 * Constraints:
 * - Must start with identical previous and current poses to avoid bootstrap pops.
 */
export function createBrushModelInterpolationState(runtime: GameRuntime): BrushModelInterpolationState<BrushModelSnapshot> {
  const snapshots = buildBrushModelSnapshots(runtime);

  return {
    previousSnapshots: cloneBrushModelSnapshots(snapshots),
    currentSnapshots: cloneBrushModelSnapshots(snapshots),
    previousTime: runtime.time,
    currentTime: runtime.time
  };
}

/**
 * Category: New
 * Purpose: Interpolate the current brush-model render pose from the last two gameplay snapshots like the original Quake II client entity path.
 *
 * Constraints:
 * - Must linearly interpolate origins.
 * - Must use `LerpAngle` for angular interpolation.
 */
export function buildInterpolatedBrushModelSnapshots(
  interpolationState: BrushModelInterpolationState<BrushModelSnapshot>,
  renderTimeSeconds: number
): BrushModelSnapshot[] {
  const currentSnapshots = interpolationState.currentSnapshots;
  const previousByModel = new Map<string, BrushModelSnapshot>();

  for (const snapshot of interpolationState.previousSnapshots) {
    if (snapshot.model) {
      previousByModel.set(snapshot.model, snapshot);
    }
  }

  const lerpFraction = interpolationState.currentTime > interpolationState.previousTime
    ? clamp01((renderTimeSeconds - interpolationState.currentTime) / (interpolationState.currentTime - interpolationState.previousTime))
    : 1;

  return currentSnapshots.map((currentSnapshot) => {
    if (!currentSnapshot.model) {
      return cloneBrushModelSnapshot(currentSnapshot);
    }

    const previousSnapshot = previousByModel.get(currentSnapshot.model);
    if (!previousSnapshot) {
      return cloneBrushModelSnapshot(currentSnapshot);
    }

    return {
      model: currentSnapshot.model,
      origin: [
        lerpValue(previousSnapshot.origin[0], currentSnapshot.origin[0], lerpFraction),
        lerpValue(previousSnapshot.origin[1], currentSnapshot.origin[1], lerpFraction),
        lerpValue(previousSnapshot.origin[2], currentSnapshot.origin[2], lerpFraction)
      ],
      angles: [
        LerpAngle(previousSnapshot.angles[0], currentSnapshot.angles[0], lerpFraction),
        LerpAngle(previousSnapshot.angles[1], currentSnapshot.angles[1], lerpFraction),
        LerpAngle(previousSnapshot.angles[2], currentSnapshot.angles[2], lerpFraction)
      ]
    };
  });
}

/**
 * Category: New
 * Purpose: Clone one list of brush-model snapshots so interpolation state keeps value semantics across fixed frames.
 */
export function cloneBrushModelSnapshots(snapshots: BrushModelSnapshot[]): BrushModelSnapshot[] {
  return snapshots.map(cloneBrushModelSnapshot);
}

/**
 * Category: New
 * Purpose: Clone one brush-model snapshot without sharing mutable tuple references.
 */
export function cloneBrushModelSnapshot(snapshot: BrushModelSnapshot): BrushModelSnapshot {
  return {
    model: snapshot.model,
    origin: [...snapshot.origin],
    angles: [...snapshot.angles]
  };
}

/**
 * Category: New
 * Purpose: Interpolate one scalar with a clamped fraction.
 */
function lerpValue(previous: number, current: number, fraction: number): number {
  return previous + (current - previous) * fraction;
}

/**
 * Category: New
 * Purpose: Clamp one interpolation fraction to the inclusive `[0, 1]` interval.
 */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
