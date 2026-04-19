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

/**
 * Category: New
 * Purpose: Describe one 2D HUD draw rectangle in pixel coordinates.
 *
 * Constraints:
 * - Must preserve Quake II pixel-space placement semantics.
 */
export interface HudBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Category: New
 * Purpose: Describe one image draw request emitted by the ported HUD logic.
 *
 * Constraints:
 * - Must carry the Quake II pic name unchanged.
 */
export interface HudPictureCommand {
  type: "picture";
  x: number;
  y: number;
  pic: string;
  bounds: HudBounds;
}

/**
 * Category: New
 * Purpose: Describe one text draw request emitted by the ported HUD logic.
 *
 * Constraints:
 * - Must preserve the original string payload and alternate/high-bit variant.
 */
export interface HudTextCommand {
  type: "text";
  x: number;
  y: number;
  text: string;
  xorMask: number;
  centerWidth: number;
  variant: "normal" | "alt";
  bounds: HudBounds;
}

/**
 * Category: New
 * Purpose: Describe one number-field draw request emitted by the Quake II HUD logic.
 *
 * Constraints:
 * - Must preserve width clamp, color bank and digit pic mapping.
 */
export interface HudNumberCommand {
  type: "number";
  x: number;
  y: number;
  color: number;
  width: number;
  value: number;
  digits: string[];
  bounds: HudBounds;
}

/**
 * Category: New
 * Purpose: Describe one generic fill rectangle used by HUD overlays and future debug visuals.
 *
 * Constraints:
 * - Must stay backend-agnostic.
 */
export interface HudFillCommand {
  type: "fill";
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  bounds: HudBounds;
}

/**
 * Category: New
 * Purpose: Union the shared HUD draw primitives consumed by render backends.
 */
export type HudDrawCommand =
  | HudPictureCommand
  | HudTextCommand
  | HudNumberCommand
  | HudFillCommand;

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
