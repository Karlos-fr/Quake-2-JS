/**
 * File: hud-draw.ts
 * Purpose: Define renderer-agnostic 2D HUD draw contracts shared between the Quake II client runtime and rendering backends.
 *
 * This file is not a direct source port.
 * It is an adapter contract layer between the ported HUD logic and platform-specific renderers.
 *
 * Dependencies:
 * - None
 */

import type {
  HudBounds,
  HudDrawCommand,
  HudFillCommand,
  HudNumberCommand,
  HudPictureCommand,
  HudTextCommand
} from "../../client/src/render-contracts.js";

export type {
  HudBounds,
  HudDrawCommand,
  HudFillCommand,
  HudNumberCommand,
  HudPictureCommand,
  HudTextCommand
} from "../../client/src/render-contracts.js";

/**
 * Category: New
 * Purpose: Describe the minimal contract a renderer uses to resolve one Quake II HUD picture name.
 *
 * Constraints:
 * - Must return null when the requested HUD picture is unavailable.
 */
export type HudPictureResourceResolver<TResource> = (pic: string) => TResource | null;

/**
 * Category: New
 * Purpose: Collect the unique picture names referenced by one HUD command list.
 *
 * Constraints:
 * - Must preserve source order on first encounter.
 */
export function collectHudPictureResourceNames(commands: HudDrawCommand[]): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const command of commands) {
    if (command.type === "picture" && !seen.has(command.pic)) {
      seen.add(command.pic);
      names.push(command.pic);
      continue;
    }

    if (command.type === "number") {
      for (const pic of command.digits) {
        if (!seen.has(pic)) {
          seen.add(pic);
          names.push(pic);
        }
      }
    }
  }

  return names;
}
