/**
 * File: brush-model-sync.ts
 * Purpose: Synchronize Quake II brush model transforms from gameplay snapshots into a Three.js BSP scene.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the gameplay runtime and the rendering backend.
 *
 * Dependencies:
 * - three
 */

import { Group, MathUtils, type Object3D } from "three";

/**
 * Category: New
 * Purpose: Describe one gameplay-owned inline model transform snapshot.
 *
 * Constraints:
 * - Must use the original Quake II `*N` model naming convention.
 */
export interface BrushModelSnapshot {
  model: string | undefined;
  origin: [number, number, number];
  angles: [number, number, number];
}

/**
 * Category: New
 * Purpose: Hold the imperative sync hook used by the web adapter each frame.
 */
export interface ThreeBrushModelSync {
  apply: (snapshots: BrushModelSnapshot[]) => void;
}

/**
 * Category: New
 * Purpose: Build one Three.js sync helper that applies gameplay transforms to BSP inline-model groups.
 *
 * Constraints:
 * - Must only target groups named `bsp-model:N`.
 * - Must leave the world model `0` untouched.
 */
export function createThreeBrushModelSync(root: Group): ThreeBrushModelSync {
  const modelGroups = collectModelGroups(root);

  return {
    apply: (snapshots) => {
      for (const snapshot of snapshots) {
        const modelIndex = parseInlineModelIndex(snapshot.model);
        if (modelIndex === null || modelIndex === 0) {
          continue;
        }

        const modelGroup = modelGroups.get(modelIndex);
        if (!modelGroup) {
          continue;
        }

        modelGroup.position.set(snapshot.origin[0], snapshot.origin[1], snapshot.origin[2]);
        modelGroup.rotation.set(
          MathUtils.degToRad(snapshot.angles[0]),
          MathUtils.degToRad(snapshot.angles[1]),
          MathUtils.degToRad(snapshot.angles[2]),
          "XYZ"
        );
      }
    }
  };
}

/**
 * Category: New
 * Purpose: Collect all BSP inline-model groups from the current rendered BSP root.
 */
function collectModelGroups(root: Group): Map<number, Group> {
  const modelGroups = new Map<number, Group>();

  root.traverse((object) => {
    const modelGroup = asModelGroup(object);
    if (!modelGroup) {
      return;
    }

    modelGroups.set(modelGroup.userData.modelIndex as number, modelGroup);
  });

  return modelGroups;
}

/**
 * Category: New
 * Purpose: Narrow one scene object to a BSP model group.
 */
function asModelGroup(object: Object3D): Group | null {
  if (!(object instanceof Group)) {
    return null;
  }

  if (typeof object.userData.modelIndex !== "number") {
    return null;
  }

  return object;
}

/**
 * Category: New
 * Purpose: Parse one Quake II inline model name like `*42`.
 */
function parseInlineModelIndex(model: string | undefined): number | null {
  if (!model || !model.startsWith("*")) {
    return null;
  }

  const modelIndex = Number.parseInt(model.slice(1), 10);
  return Number.isFinite(modelIndex) ? modelIndex : null;
}
