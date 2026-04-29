/**
 * File: local-collision-adapter.ts
 * Purpose: Share the local Quake II prediction collision bridge without depending on demo input/controller code.
 *
 * This file is not a direct source port.
 * It is a web/runtime adapter used by the standalone demo and the legacy local-session harness.
 *
 * Dependencies:
 * - packages/client
 * - packages/game
 * - packages/qcommon
 */

import type { LocalClientCollisionAdapter } from "../../../packages/client/src/index.js";
import {
  type GameEntity,
  type GameRuntime
} from "../../../packages/game/src/index.js";
import { MASK_PLAYERSOLID } from "../../../packages/qcommon/src/index.js";

/**
 * Category: New
 * Purpose: Build the local collision adapter that reuses the gameplay collision bridge for browser-side prediction.
 *
 * Constraints:
 * - Must stay close to Quake II `CL_PMTrace` / `CL_PMpointcontents` behavior.
 * - Must consume the current transformed inline-model poses from the gameplay runtime.
 */
export function createLocalCollisionAdapter(
  gameplayRuntime: GameRuntime,
  gameplayPlayer: GameEntity | null
): LocalClientCollisionAdapter {
  return {
    trace: (start, mins, maxs, end) => {
      if (!gameplayRuntime.collision) {
        throw new Error("createLocalCollisionAdapter requires gameplay collision bridge");
      }

      return gameplayRuntime.collision.trace(start, mins, maxs, end, gameplayPlayer, MASK_PLAYERSOLID);
    },
    pointcontents: (point) => {
      if (!gameplayRuntime.collision) {
        throw new Error("createLocalCollisionAdapter requires gameplay collision bridge");
      }

      return gameplayRuntime.collision.pointcontents(point, gameplayPlayer);
    }
  };
}
