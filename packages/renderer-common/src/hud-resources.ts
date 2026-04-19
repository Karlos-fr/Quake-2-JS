/**
 * File: hud-resources.ts
 * Purpose: Define the Quake II HUD 2D resource catalog derived from the original client code.
 *
 * This file is not a direct source port.
 * It is a renderer-common asset contract layer built from the original HUD picture and text usage.
 *
 * Dependencies:
 * - packages/renderer-common/src/hud-draw.ts
 */

import { collectHudPictureResourceNames, type HudDrawCommand } from "./hud-draw.js";

/**
 * Category: New
 * Purpose: Identify one family of HUD resource as used by the original Quake II client.
 */
export type HudResourceKind = "picture" | "digit" | "crosshair" | "glyphs";

/**
 * Category: New
 * Purpose: Record where one HUD resource name comes from in the original Quake II client code.
 */
export interface HudResourceOrigin {
  sourceFile: string;
  originalSymbol: string;
  notes: string;
}

/**
 * Category: New
 * Purpose: Describe one named HUD picture resource known to the shared renderer layer.
 *
 * Constraints:
 * - Must preserve the original Quake II pic name unchanged.
 */
export interface HudPictureDescriptor {
  kind: Exclude<HudResourceKind, "glyphs">;
  name: string;
  origin: HudResourceOrigin;
}

/**
 * Category: New
 * Purpose: Describe the shared bitmap glyph set used by Quake II `DrawChar` style HUD text.
 *
 * Constraints:
 * - Must preserve the original 8x8 character grid assumptions.
 */
export interface HudGlyphSetDescriptor {
  kind: "glyphs";
  name: "conchars";
  charWidth: number;
  charHeight: number;
  columns: number;
  rows: number;
  supportsHighBit: boolean;
  origin: HudResourceOrigin;
}

/**
 * Category: New
 * Purpose: Group the known static HUD resources needed by the Quake II client HUD pipeline.
 */
export interface HudResourceCatalog {
  pictures: HudPictureDescriptor[];
  glyphs: HudGlyphSetDescriptor;
}

/**
 * Category: New
 * Purpose: Describe the concrete resource requirements extracted for one HUD frame.
 */
export interface HudFrameResourceRequirements {
  pictures: string[];
  glyphs: boolean;
  usesAlternateText: boolean;
}

const HUD_PICTURE_ORIGIN = {
  sourceFile: "client/cl_scrn.c",
  originalSymbol: "SCR_DrawStats / SCR_DrawPause / SCR_DrawLoading / SCR_DrawNet / SCR_TouchPics",
  notes: "Named HUD pics referenced by the original client renderer path."
} as const;

const HUD_INVENTORY_ORIGIN = {
  sourceFile: "client/cl_inv.c",
  originalSymbol: "CL_DrawInventory",
  notes: "Inventory overlay picture referenced by the original inventory screen."
} as const;

const HUD_CROSSHAIR_ORIGIN = {
  sourceFile: "client/cl_scrn.c + client/cl_view.c",
  originalSymbol: "SCR_TouchPics / SCR_DrawCrosshair",
  notes: "Crosshair pic names chosen by the original crosshair cvar path."
} as const;

const HUD_GLYPHS_ORIGIN = {
  sourceFile: "client/console.c + client/cl_scrn.c + client/cl_inv.c",
  originalSymbol: "DrawChar / DrawHUDString / Inv_DrawString",
  notes: "8x8 console/HUD glyph rendering used by Quake II text paths."
} as const;

const HUD_DIGIT_PICTURES = [
  "num_0",
  "num_1",
  "num_2",
  "num_3",
  "num_4",
  "num_5",
  "num_6",
  "num_7",
  "num_8",
  "num_9",
  "num_minus",
  "anum_0",
  "anum_1",
  "anum_2",
  "anum_3",
  "anum_4",
  "anum_5",
  "anum_6",
  "anum_7",
  "anum_8",
  "anum_9",
  "anum_minus",
  "field_3"
] as const;

const HUD_STANDARD_PICTURES = [
  "inventory",
  "loading",
  "pause",
  "net"
] as const;

const HUD_CROSSHAIR_PICTURES = ["ch0", "ch1", "ch2", "ch3"] as const;

/**
 * Category: New
 * Purpose: Return the static Quake II HUD resource catalog derived from the original client code.
 */
export function getQuake2HudResourceCatalog(): HudResourceCatalog {
  const pictures: HudPictureDescriptor[] = [
    ...HUD_DIGIT_PICTURES.map((name) => ({
      kind: name.startsWith("a") || name.startsWith("num") ? "digit" as const : "picture" as const,
      name,
      origin: HUD_PICTURE_ORIGIN
    })),
    ...HUD_STANDARD_PICTURES.map((name) => ({
      kind: "picture" as const,
      name,
      origin: name === "inventory" ? HUD_INVENTORY_ORIGIN : HUD_PICTURE_ORIGIN
    })),
    ...HUD_CROSSHAIR_PICTURES.map((name) => ({
      kind: "crosshair" as const,
      name,
      origin: HUD_CROSSHAIR_ORIGIN
    }))
  ];

  return {
    pictures,
    glyphs: {
      kind: "glyphs",
      name: "conchars",
      charWidth: 8,
      charHeight: 8,
      columns: 16,
      rows: 16,
      supportsHighBit: true,
      origin: HUD_GLYPHS_ORIGIN
    }
  };
}

/**
 * Category: New
 * Purpose: Build the concrete resource requirements for one HUD frame from emitted draw commands.
 *
 * Constraints:
 * - Must preserve first-use order for picture resources.
 * - Must flag text glyph usage whenever text commands are present.
 */
export function collectHudFrameResourceRequirements(commands: HudDrawCommand[]): HudFrameResourceRequirements {
  let glyphs = false;
  let usesAlternateText = false;

  for (const command of commands) {
    if (command.type === "text") {
      glyphs = true;
      if (command.variant === "alt" || command.xorMask !== 0) {
        usesAlternateText = true;
      }
    }
  }

  return {
    pictures: collectHudPictureResourceNames(commands),
    glyphs,
    usesAlternateText
  };
}
