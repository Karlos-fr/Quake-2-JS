/**
 * File: screen.ts
 * Source: Quake II original / client/cl_scrn.c
 * Purpose: Port the first client-side screen and HUD state logic, starting with center prints and screen-facing HUD snapshots.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Emits structured screen state instead of issuing immediate renderer draw calls.
 * - Keeps only the first logical HUD/state layer while later renderer/UI adapters remain separate.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original screen-management logic.
 */

import {
  CS_ITEMS,
  CS_IMAGES,
  CS_STATUSBAR,
  MAX_CONFIGSTRINGS,
  MAX_IMAGES,
  STAT_AMMO,
  STAT_AMMO_ICON,
  STAT_ARMOR,
  STAT_ARMOR_ICON,
  STAT_FLASHES,
  STAT_FRAGS,
  STAT_HEALTH,
  STAT_HEALTH_ICON,
  STAT_LAYOUTS,
  STAT_PICKUP_ICON,
  STAT_PICKUP_STRING,
  STAT_SELECTED_ICON,
  STAT_SELECTED_ITEM,
  STAT_SPECTATOR,
  STAT_TIMER,
  STAT_TIMER_ICON
} from "../../qcommon/src/index.js";
import type {
  HudBounds,
  HudDrawCommand,
  HudFillCommand,
  HudNumberCommand,
  HudPictureCommand,
  HudTextCommand
} from "./render-contracts.js";
import type { ClientRuntime } from "./types.js";

const STAT_MINUS = 10;
const CHAR_WIDTH = 16;

const sb_nums = [
  ["num_0", "num_1", "num_2", "num_3", "num_4", "num_5", "num_6", "num_7", "num_8", "num_9", "num_minus"],
  ["anum_0", "anum_1", "anum_2", "anum_3", "anum_4", "anum_5", "anum_6", "anum_7", "anum_8", "anum_9", "anum_minus"]
] as const;

/**
 * Category: New
 * Purpose: Describe one 2D HUD draw rectangle in pixel coordinates.
 *
 * Constraints:
 * - Must preserve Quake II pixel-space placement semantics.
 */
export type ClientHudBounds = HudBounds;

/**
 * Category: New
 * Purpose: Describe one image draw request emitted by the ported HUD logic.
 *
 * Constraints:
 * - Must carry the Quake II pic name unchanged.
 */
export type ClientHudPictureCommand = HudPictureCommand;

/**
 * Category: New
 * Purpose: Describe one text draw request emitted by the ported HUD logic.
 *
 * Constraints:
 * - Must preserve the original string payload and XOR/high-bit behavior.
 */
export type ClientHudTextCommand = HudTextCommand;

/**
 * Category: New
 * Purpose: Describe one number-field draw request emitted by `SCR_DrawField`.
 *
 * Constraints:
 * - Must preserve width clamp, color bank and digit pic mapping.
 */
export type ClientHudNumberCommand = HudNumberCommand;

/**
 * Category: New
 * Purpose: Reserve one fill-style HUD draw request for later layout tokens and debug overlays.
 *
 * Constraints:
 * - Must stay backend-agnostic.
 */
export type ClientHudFillCommand = HudFillCommand;

/**
 * Category: New
 * Purpose: Union the current HUD draw primitives produced by the screen port.
 */
export type ClientHudDrawCommand = HudDrawCommand;

/**
 * Category: New
 * Purpose: Describe the pixel footprint of one HUD string using Quake II sizing rules.
 *
 * Constraints:
 * - Must preserve embedded newline handling.
 */
export interface ClientHudStringMeasure {
  width: number;
  height: number;
  lines: number;
}

/**
 * Category: New
 * Purpose: Carry the screen dimensions and runtime gating needed to interpret Quake II HUD layout strings.
 *
 * Constraints:
 * - Must stay explicit so layout execution remains deterministic and testable.
 */
export interface ClientHudLayoutContext {
  viewportWidth: number;
  viewportHeight: number;
  active: boolean;
  refreshPrepped: boolean;
}

/**
 * Category: New
 * Purpose: Describe the active center-print text block tracked by the client screen layer.
 *
 * Constraints:
 * - Must preserve the original text and remaining display time.
 */
export interface ClientCenterPrintState {
  text: string;
  lines: number;
  remainingMs: number;
  startedAt: number;
}

/**
 * Category: New
 * Purpose: Describe the loading-plaque state exposed by the client screen layer.
 *
 * Constraints:
 * - Must keep the original draw flag and disable-screen relationship explicit.
 */
export interface ClientLoadingOverlayState {
  visible: boolean;
  drawFlag: number;
  disableScreen: boolean;
}

/**
 * Category: New
 * Purpose: Describe the pause-overlay state exposed by the client screen layer.
 *
 * Constraints:
 * - Must remain data-only and not depend on any renderer API.
 */
export interface ClientPauseOverlayState {
  visible: boolean;
}

/**
 * Category: New
 * Purpose: Describe the network warning overlay state used by `SCR_DrawNet`.
 *
 * Constraints:
 * - Must preserve the original backlog threshold rule when sequencing data is available.
 */
export interface ClientNetOverlayState {
  visible: boolean;
  backlog: number;
  threshold: number;
}

/**
 * Category: New
 * Purpose: Carry host/runtime inputs needed to build the full screen snapshot without coupling `screen.ts` to unrelated subsystems.
 *
 * Constraints:
 * - Must stay optional so partial client stages can still build a deterministic HUD snapshot.
 */
export interface ClientScreenBuildOptions {
  paused?: boolean;
  outgoingSequence?: number;
  incomingAcknowledged?: number;
  commandBackup?: number;
}

/**
 * Category: New
 * Purpose: Carry the optional key binding metadata needed by the inventory screen port.
 *
 * Constraints:
 * - Must stay decoupled from the browser input layer and only expose resolved strings.
 */
export interface ClientInventoryBindingMap {
  [itemName: string]: string | undefined;
}

/**
 * Category: New
 * Purpose: Describe the first HUD-facing snapshot extracted from client screen state.
 *
 * Constraints:
 * - Must keep raw layout and player-state-derived HUD values explicit for later UI adapters.
 */
export interface ClientScreenHudState {
  layout: string;
  layoutBits: number;
  statusbar: string;
  inventory: number[];
  stats: number[];
  centerPrint: ClientCenterPrintState | null;
  loading: ClientLoadingOverlayState;
  pause: ClientPauseOverlayState;
  net: ClientNetOverlayState;
  showScores: boolean;
  showInventory: boolean;
  health: number;
  healthIcon: string | null;
  ammo: number;
  ammoIcon: string | null;
  armor: number;
  armorIcon: string | null;
  selectedItem: number;
  selectedItemName: string | null;
  selectedIcon: string | null;
  pickupString: string | null;
  pickupIcon: string | null;
  timer: number;
  timerIcon: string | null;
  frags: number;
  flashes: number;
  spectator: boolean;
}

const DISPLAY_ITEMS = 17;

/**
 * Original name: SizeHUDString
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Measures one HUD string while honoring embedded newlines.
 */
export function SizeHUDString(text: string): ClientHudStringMeasure {
  let lines = 1;
  let width = 0;
  let current = 0;

  for (const char of text) {
    if (char === "\n") {
      lines += 1;
      current = 0;
      continue;
    }

    current += 1;
    if (current > width) {
      width = current;
    }
  }

  return {
    width: width * 8,
    height: lines * 8,
    lines
  };
}

/**
 * Original name: DrawHUDString
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Expands one HUD string into line-oriented text draw commands with optional centering and XOR masking.
 *
 * Porting notes:
 * - Emits data commands instead of drawing characters immediately.
 */
export function DrawHUDString(text: string, x: number, y: number, centerWidth: number, xorMask: number): ClientHudTextCommand[] {
  const commands: ClientHudTextCommand[] = [];
  const margin = x;
  const lines = text.split("\n");
  let currentY = y;

  for (const line of lines) {
    const drawX = centerWidth !== 0 ? margin + (centerWidth - line.length * 8) / 2 : margin;
    commands.push({
      type: "text",
      x: drawX,
      y: currentY,
      text: applyHudXor(line, xorMask),
      xorMask,
      centerWidth,
      variant: xorMask === 0 ? "normal" : "alt",
      bounds: {
        x: drawX,
        y: currentY,
        width: line.length * 8,
        height: 8
      }
    });
    currentY += 8;
  }

  return commands;
}

/**
 * Original name: SCR_DrawField
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds the digit picture sequence used by Quake II number fields.
 *
 * Porting notes:
 * - Returns a structured number command instead of issuing `DrawPic` calls.
 */
export function SCR_DrawField(x: number, y: number, color: number, width: number, value: number): ClientHudNumberCommand | null {
  if (width < 1) {
    return null;
  }

  const clampedWidth = Math.min(width, 5);
  const numText = `${Math.trunc(value)}`;
  const visibleLength = Math.min(numText.length, clampedWidth);
  const visibleText = visibleLength < numText.length ? numText.slice(0, visibleLength) : numText;
  const digits = Array.from(visibleText, mapHudDigitToPic(color));

  return {
    type: "number",
    x: x + 2 + CHAR_WIDTH * (clampedWidth - visibleLength),
    y,
    color,
    width: clampedWidth,
    value: Math.trunc(value),
    digits,
    bounds: {
      x,
      y,
      width: clampedWidth * CHAR_WIDTH + 2,
      height: 23
    }
  };
}

/**
 * Original name: SCR_TouchPics
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Enumerates the HUD pictures that the original renderer pre-registers for status bar drawing.
 *
 * Porting notes:
 * - Current stage focuses on status bar digits and optional crosshair pic naming.
 */
export function SCR_TouchPics(crosshairValue = 0): string[] {
  const pics = new Set<string>();

  for (const bank of sb_nums) {
    for (const pic of bank) {
      pics.add(pic);
    }
  }

  if (crosshairValue !== 0) {
    const clampedCrosshair = Math.max(0, Math.min(3, Math.trunc(crosshairValue)));
    pics.add(`ch${clampedCrosshair}`);
  }

  return [...pics];
}

/**
 * Original name: Inv_DrawString
 * Source: client/cl_inv.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Emits one left-aligned inventory text draw command.
 */
export function Inv_DrawString(x: number, y: number, text: string): ClientHudTextCommand {
  return {
    type: "text",
    x,
    y,
    text,
    xorMask: 0,
    centerWidth: 0,
    variant: "normal",
    bounds: {
      x,
      y,
      width: text.length * 8,
      height: 8
    }
  };
}

/**
 * Original name: SetStringHighBit
 * Source: client/cl_inv.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Sets the high bit on every character of the string.
 */
export function SetStringHighBit(text: string): string {
  let result = "";
  for (const char of text) {
    result += String.fromCharCode(char.charCodeAt(0) | 128);
  }
  return result;
}

/**
 * Original name: SCR_ExecuteLayoutString
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Interprets the Quake II HUD mini-language and emits ordered 2D draw commands.
 *
 * Porting notes:
 * - Current stage covers the priority token subset used by the standard status bar and early overlays, including `client` and `ctf` blocks.
 * - Keeps output as backend-agnostic draw commands instead of immediate renderer calls.
 */
export function SCR_ExecuteLayoutString(
  runtime: ClientRuntime,
  layout: string,
  context: ClientHudLayoutContext
): ClientHudDrawCommand[] {
  if (!context.active || !context.refreshPrepped || layout.length === 0) {
    return [];
  }

  const commands: ClientHudDrawCommand[] = [];
  const tokens = tokenizeLayoutString(layout);
  const state = {
    x: 0,
    y: 0,
    width: 3
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    switch (token) {
      case "xl":
        state.x = Number.parseInt(tokens[++index] ?? "0", 10);
        break;
      case "xr":
        state.x = context.viewportWidth + Number.parseInt(tokens[++index] ?? "0", 10);
        break;
      case "xv":
        state.x = context.viewportWidth / 2 - 160 + Number.parseInt(tokens[++index] ?? "0", 10);
        break;
      case "yt":
        state.y = Number.parseInt(tokens[++index] ?? "0", 10);
        break;
      case "yb":
        state.y = context.viewportHeight + Number.parseInt(tokens[++index] ?? "0", 10);
        break;
      case "yv":
        state.y = context.viewportHeight / 2 - 120 + Number.parseInt(tokens[++index] ?? "0", 10);
        break;
      case "pic": {
        const statIndex = Number.parseInt(tokens[++index] ?? "0", 10);
        const value = runtime.cl.frame.playerstate.stats[statIndex] ?? 0;
        if (value < 0 || value >= MAX_IMAGES) {
          throw new Error(`Pic >= MAX_IMAGES (${value})`);
        }

        const pic = resolveConfigstring(runtime, CS_IMAGES + value);
        if (pic) {
          commands.push(createPictureCommand(state.x, state.y, pic));
        }
        break;
      }
      case "picn": {
        const pic = tokens[++index] ?? "";
        if (pic.length > 0) {
          commands.push(createPictureCommand(state.x, state.y, pic));
        }
        break;
      }
      case "num": {
        state.width = Number.parseInt(tokens[++index] ?? "3", 10);
        const statIndex = Number.parseInt(tokens[++index] ?? "0", 10);
        const value = runtime.cl.frame.playerstate.stats[statIndex] ?? 0;
        const number = SCR_DrawField(state.x, state.y, 0, state.width, value);
        if (number) {
          commands.push(number);
        }
        break;
      }
      case "hnum": {
        const value = runtime.cl.frame.playerstate.stats[STAT_HEALTH] ?? 0;
        const color = value > 25 ? 0 : value > 0 ? (runtime.cl.frame.serverframe >> 2) & 1 : 1;
        if (((runtime.cl.frame.playerstate.stats[STAT_FLASHES] ?? 0) & 1) !== 0) {
          commands.push(createPictureCommand(state.x, state.y, "field_3"));
        }
        const number = SCR_DrawField(state.x, state.y, color, 3, value);
        if (number) {
          commands.push(number);
        }
        break;
      }
      case "anum": {
        const value = runtime.cl.frame.playerstate.stats[STAT_AMMO] ?? 0;
        if (value < 0) {
          break;
        }

        const color = value > 5 ? 0 : (runtime.cl.frame.serverframe >> 2) & 1;
        if (((runtime.cl.frame.playerstate.stats[STAT_FLASHES] ?? 0) & 4) !== 0) {
          commands.push(createPictureCommand(state.x, state.y, "field_3"));
        }
        const number = SCR_DrawField(state.x, state.y, color, 3, value);
        if (number) {
          commands.push(number);
        }
        break;
      }
      case "rnum": {
        const value = runtime.cl.frame.playerstate.stats[STAT_ARMOR] ?? 0;
        if (value < 1) {
          break;
        }

        if (((runtime.cl.frame.playerstate.stats[STAT_FLASHES] ?? 0) & 2) !== 0) {
          commands.push(createPictureCommand(state.x, state.y, "field_3"));
        }
        const number = SCR_DrawField(state.x, state.y, 0, 3, value);
        if (number) {
          commands.push(number);
        }
        break;
      }
      case "stat_string": {
        const statIndex = Number.parseInt(tokens[++index] ?? "0", 10);
        const configIndex = runtime.cl.frame.playerstate.stats[statIndex] ?? -1;
        if (configIndex < 0 || configIndex >= MAX_CONFIGSTRINGS) {
          throw new Error(`Bad stat_string index (${configIndex})`);
        }

        const value = runtime.cl.configstrings[configIndex] ?? "";
        if (value.length > 0) {
          commands.push(Inv_DrawString(state.x, state.y, value));
        }
        break;
      }
      case "cstring": {
        const text = tokens[++index] ?? "";
        commands.push(...DrawHUDString(text, state.x, state.y, 320, 0));
        break;
      }
      case "string": {
        const text = tokens[++index] ?? "";
        commands.push(Inv_DrawString(state.x, state.y, text));
        break;
      }
      case "cstring2": {
        const text = tokens[++index] ?? "";
        commands.push(...DrawHUDString(text, state.x, state.y, 320, 0x80));
        break;
      }
      case "string2": {
        const text = tokens[++index] ?? "";
        commands.push(Inv_DrawString(state.x, state.y, SetStringHighBit(text)));
        break;
      }
      case "if": {
        const statIndex = Number.parseInt(tokens[++index] ?? "0", 10);
        const value = runtime.cl.frame.playerstate.stats[statIndex] ?? 0;
        if (value === 0) {
          index = skipToEndif(tokens, index);
        }
        break;
      }
      case "endif":
        break;
      case "client":
        index = executeClientLayoutBlock(runtime, context, commands, tokens, index);
        break;
      case "ctf":
        index = executeCtfLayoutBlock(runtime, context, commands, tokens, index);
        break;
      default:
        break;
    }
  }

  return commands;
}

/**
 * Original name: SCR_DrawStats
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Executes the current status bar layout string and returns the resulting HUD draw commands.
 */
export function SCR_DrawStats(runtime: ClientRuntime, context: ClientHudLayoutContext): ClientHudDrawCommand[] {
  return SCR_ExecuteLayoutString(runtime, runtime.cl.configstrings[CS_STATUSBAR] ?? "", context);
}

/**
 * Original name: SCR_DrawLayout
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Executes the current overlay layout when `STAT_LAYOUTS` requests it.
 */
export function SCR_DrawLayout(runtime: ClientRuntime, context: ClientHudLayoutContext): ClientHudDrawCommand[] {
  if ((runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] ?? 0) === 0) {
    return [];
  }

  return SCR_ExecuteLayoutString(runtime, runtime.cl.layout, context);
}

/**
 * Original name: CL_DrawInventory
 * Source: client/cl_inv.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds the Quake II inventory overlay draw commands.
 *
 * Porting notes:
 * - Uses an optional resolved binding map instead of scanning engine-global keybinding tables.
 */
export function CL_DrawInventory(
  runtime: ClientRuntime,
  context: ClientHudLayoutContext,
  bindings: ClientInventoryBindingMap = {}
): ClientHudDrawCommand[] {
  const commands: ClientHudDrawCommand[] = [];
  const selected = runtime.cl.frame.playerstate.stats[STAT_SELECTED_ITEM] ?? 0;
  const itemIndexes: number[] = [];
  let selectedNum = 0;

  for (let i = 0; i < runtime.cl.inventory.length; i += 1) {
    if (i === selected) {
      selectedNum = itemIndexes.length;
    }

    if ((runtime.cl.inventory[i] ?? 0) !== 0) {
      itemIndexes.push(i);
    }
  }

  let top = selectedNum - Math.trunc(DISPLAY_ITEMS / 2);
  if (itemIndexes.length - top < DISPLAY_ITEMS) {
    top = itemIndexes.length - DISPLAY_ITEMS;
  }
  if (top < 0) {
    top = 0;
  }

  let x = (context.viewportWidth - 256) / 2;
  let y = (context.viewportHeight - 240) / 2;

  commands.push(createPictureCommand(x, y + 8, "inventory"));

  y += 24;
  x += 24;
  commands.push(Inv_DrawString(x, y, "hotkey ### item"));
  commands.push(Inv_DrawString(x, y + 8, "------ --- ----"));
  y += 16;

  for (let i = top; i < itemIndexes.length && i < top + DISPLAY_ITEMS; i += 1) {
    const item = itemIndexes[i];
    const itemName = runtime.cl.configstrings[CS_ITEMS + item] ?? "";
    const bind = bindings[itemName] ?? "";
    let line = `${bind.padStart(6, " ")} ${`${runtime.cl.inventory[item] ?? 0}`.padStart(3, " ")} ${itemName}`;

    if (item !== selected) {
      line = SetStringHighBit(line);
    } else if ((Math.trunc(runtime.cls.realtime * 10) & 1) !== 0) {
      commands.push(createTextCommand(x - 8, y, String.fromCharCode(15), "normal"));
    }

    commands.push(Inv_DrawString(x, y, line));
    y += 8;
  }

  return commands;
}

/**
 * Category: New
 * Purpose: Compose the current Quake II HUD overlays in the same high-level order as `SCR_UpdateScreen`.
 *
 * Constraints:
 * - Must preserve status bar, layout and inventory ordering before center/pause/loading overlays.
 */
export function SCR_BuildHudDrawCommands(
  runtime: ClientRuntime,
  context: ClientHudLayoutContext,
  options: {
    bindings?: ClientInventoryBindingMap;
    screenState?: ClientScreenHudState;
  } = {}
): ClientHudDrawCommand[] {
  const commands: ClientHudDrawCommand[] = [];
  const screenState = options.screenState ?? SCR_BuildScreenState(runtime);
  commands.push(...SCR_DrawStats(runtime, context));

  if (((runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] ?? 0) & 1) !== 0) {
    commands.push(...SCR_DrawLayout(runtime, context));
  }

  if (((runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] ?? 0) & 2) !== 0) {
    commands.push(...CL_DrawInventory(runtime, context, options.bindings));
  }

  if (screenState.net.visible) {
    commands.push(createAutosizedPictureCommand(64, 0, "net"));
  }

  if (screenState.centerPrint) {
    const centerY = screenState.centerPrint.lines <= 4 ? context.viewportHeight * 0.35 : 48;
    commands.push(...DrawHUDString(screenState.centerPrint.text, 0, centerY, context.viewportWidth, 0));
  }

  if (screenState.pause.visible) {
    commands.push(createAutosizedPictureCommand(-1, context.viewportHeight / 2 + 8, "pause"));
  }

  if (screenState.loading.visible) {
    commands.push(createAutosizedPictureCommand(-1, -1, "loading"));
  }

  return commands;
}

/**
 * Original name: SCR_CenterPrint
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stores a center-print string and resets its display timer.
 *
 * Porting notes:
 * - Preserves line counting and timing state.
 * - Leaves console echoing to host hooks or later adapters.
 */
export function SCR_CenterPrint(runtime: ClientRuntime, text: string, centertimeSeconds = 2.5): void {
  runtime.cl.screen.scr_centerstring = text;
  runtime.cl.screen.scr_centertime_off = centertimeSeconds * 1000;
  runtime.cl.screen.scr_centertime_start = runtime.cl.time;
  runtime.cl.screen.scr_center_lines = countCenterLines(text);
}

/**
 * Original name: SCR_CheckDrawCenterString
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Advances center-print timing and returns the active center-print descriptor when visible.
 *
 * Porting notes:
 * - Uses `cls.frametime` in milliseconds for the current port stage.
 */
export function SCR_CheckDrawCenterString(runtime: ClientRuntime): ClientCenterPrintState | null {
  runtime.cl.screen.scr_centertime_off -= runtime.cls.frametime;
  if (runtime.cl.screen.scr_centertime_off <= 0 || runtime.cl.screen.scr_centerstring.length === 0) {
    return null;
  }

  return {
    text: runtime.cl.screen.scr_centerstring,
    lines: runtime.cl.screen.scr_center_lines,
    remainingMs: runtime.cl.screen.scr_centertime_off,
    startedAt: runtime.cl.screen.scr_centertime_start
  };
}

/**
 * Original name: SCR_BeginLoadingPlaque
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Flags the loading plaque as active and suppresses prepared sound state.
 *
 * Porting notes:
 * - Keeps only the client state mutations needed by current screen adapters.
 */
export function SCR_BeginLoadingPlaque(runtime: ClientRuntime): void {
  runtime.cl.sound_prepped = false;
  runtime.cl.screen.scr_draw_loading = 1;
  runtime.cls.disable_servercount = runtime.cl.servercount;
}

/**
 * Original name: SCR_EndLoadingPlaque
 * Source: client/cl_scrn.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Clears the loading plaque state.
 */
export function SCR_EndLoadingPlaque(runtime: ClientRuntime): void {
  runtime.cl.screen.scr_draw_loading = 0;
  runtime.cls.disable_screen = 0;
}

/**
 * Category: New
 * Purpose: Build the first renderer-agnostic client HUD/screen snapshot.
 *
 * Constraints:
 * - Must preserve the raw layout string and core statusbar-derived values.
 */
export function SCR_BuildScreenState(runtime: ClientRuntime, options: ClientScreenBuildOptions = {}): ClientScreenHudState {
  const stats = [...runtime.cl.frame.playerstate.stats];
  const layoutBits = stats[STAT_LAYOUTS] ?? 0;

  return {
    layout: runtime.cl.layout,
    layoutBits,
    statusbar: runtime.cl.configstrings[CS_STATUSBAR] ?? "",
    inventory: [...runtime.cl.inventory],
    stats,
    centerPrint: buildCenterPrintSnapshot(runtime),
    loading: buildLoadingSnapshot(runtime),
    pause: buildPauseSnapshot(options),
    net: buildNetSnapshot(options),
    showScores: (layoutBits & 1) !== 0,
    showInventory: (layoutBits & 2) !== 0,
    health: stats[STAT_HEALTH] ?? 0,
    healthIcon: resolveImageStat(runtime, stats[STAT_HEALTH_ICON]),
    ammo: stats[STAT_AMMO] ?? 0,
    ammoIcon: resolveImageStat(runtime, stats[STAT_AMMO_ICON]),
    armor: stats[STAT_ARMOR] ?? 0,
    armorIcon: resolveImageStat(runtime, stats[STAT_ARMOR_ICON]),
    selectedItem: stats[STAT_SELECTED_ITEM] ?? 0,
    selectedItemName: resolveSelectedItemName(runtime, stats[STAT_SELECTED_ITEM]),
    selectedIcon: resolveImageStat(runtime, stats[STAT_SELECTED_ICON]),
    pickupString: resolveConfigstring(runtime, stats[STAT_PICKUP_STRING]),
    pickupIcon: resolveImageStat(runtime, stats[STAT_PICKUP_ICON]),
    timer: stats[STAT_TIMER] ?? 0,
    timerIcon: resolveImageStat(runtime, stats[STAT_TIMER_ICON]),
    frags: stats[STAT_FRAGS] ?? 0,
    flashes: stats[STAT_FLASHES] ?? 0,
    spectator: (stats[STAT_SPECTATOR] ?? 0) !== 0
  };
}

/**
 * Category: New
 * Purpose: Build the currently visible center-print snapshot without mutating timer state.
 */
function buildCenterPrintSnapshot(runtime: ClientRuntime): ClientCenterPrintState | null {
  if (runtime.cl.screen.scr_centertime_off <= 0 || runtime.cl.screen.scr_centerstring.length === 0) {
    return null;
  }

  return {
    text: runtime.cl.screen.scr_centerstring,
    lines: runtime.cl.screen.scr_center_lines,
    remainingMs: runtime.cl.screen.scr_centertime_off,
    startedAt: runtime.cl.screen.scr_centertime_start
  };
}

/**
 * Category: New
 * Purpose: Build the loading-plaque snapshot corresponding to `SCR_DrawLoading`.
 */
function buildLoadingSnapshot(runtime: ClientRuntime): ClientLoadingOverlayState {
  return {
    visible: runtime.cl.screen.scr_draw_loading !== 0,
    drawFlag: runtime.cl.screen.scr_draw_loading,
    disableScreen: runtime.cls.disable_screen !== 0
  };
}

/**
 * Category: New
 * Purpose: Build the pause-overlay snapshot corresponding to `SCR_DrawPause`.
 */
function buildPauseSnapshot(options: ClientScreenBuildOptions): ClientPauseOverlayState {
  return {
    visible: options.paused === true
  };
}

/**
 * Category: New
 * Purpose: Build the net-warning snapshot corresponding to `SCR_DrawNet`.
 */
function buildNetSnapshot(options: ClientScreenBuildOptions): ClientNetOverlayState {
  const threshold = Math.max(1, (options.commandBackup ?? 64) - 1);
  const outgoingSequence = options.outgoingSequence;
  const incomingAcknowledged = options.incomingAcknowledged;
  const backlog =
    outgoingSequence !== undefined && incomingAcknowledged !== undefined
      ? outgoingSequence - incomingAcknowledged
      : 0;

  return {
    visible: backlog >= threshold,
    backlog,
    threshold
  };
}

/**
 * Category: New
 * Purpose: Count the display lines of a center-print string using Quake-style newline rules.
 */
function countCenterLines(text: string): number {
  if (text.length === 0) {
    return 0;
  }

  let lines = 1;
  for (const char of text) {
    if (char === "\n") {
      lines += 1;
    }
  }
  return lines;
}

/**
 * Category: New
 * Purpose: Resolve one configstring-backed HUD reference safely.
 */
function resolveConfigstring(runtime: ClientRuntime, index: number | undefined): string | null {
  if (index === undefined || index <= 0 || index >= runtime.cl.configstrings.length) {
    return null;
  }

  const value = runtime.cl.configstrings[index];
  return value.length > 0 ? value : null;
}

/**
 * Category: New
 * Purpose: Resolve one image-backed stat through the Quake II `CS_IMAGES` configstring range.
 */
function resolveImageStat(runtime: ClientRuntime, imageIndex: number | undefined): string | null {
  if (imageIndex === undefined || imageIndex <= 0) {
    return null;
  }

  return resolveConfigstring(runtime, CS_IMAGES + imageIndex);
}

/**
 * Category: New
 * Purpose: Resolve the currently selected inventory item name through the `CS_ITEMS` configstring range.
 */
function resolveSelectedItemName(runtime: ClientRuntime, selectedItem: number | undefined): string | null {
  if (selectedItem === undefined || selectedItem < 0) {
    return null;
  }

  return resolveConfigstring(runtime, CS_ITEMS + selectedItem);
}

/**
 * Category: New
 * Purpose: Apply the Quake II HUD XOR/high-bit transform to one string payload.
 */
function applyHudXor(text: string, xorMask: number): string {
  if (xorMask === 0) {
    return text;
  }

  let result = "";
  for (const char of text) {
    result += String.fromCharCode(char.charCodeAt(0) ^ xorMask);
  }
  return result;
}

/**
 * Category: New
 * Purpose: Resolve one number-field digit to the corresponding Quake II HUD picture name.
 */
function mapHudDigitToPic(color: number): (char: string) => string {
  const colorIndex = color === 1 ? 1 : 0;
  const picBank = sb_nums[colorIndex];

  return (char: string): string => {
    const frame = char === "-" ? STAT_MINUS : Math.max(0, Math.min(9, char.charCodeAt(0) - 48));
    return picBank[frame];
  };
}

/**
 * Category: New
 * Purpose: Tokenize one Quake II HUD layout string while preserving quoted substrings.
 */
function tokenizeLayoutString(layout: string): string[] {
  const tokens: string[] = [];
  let index = 0;

  while (index < layout.length) {
    while (index < layout.length && /\s/.test(layout[index])) {
      index += 1;
    }

    if (index >= layout.length) {
      break;
    }

    if (layout[index] === "\"") {
      index += 1;
      let token = "";
      while (index < layout.length && layout[index] !== "\"") {
        token += layout[index];
        index += 1;
      }
      if (index < layout.length && layout[index] === "\"") {
        index += 1;
      }
      tokens.push(token);
      continue;
    }

    let token = "";
    while (index < layout.length && !/\s/.test(layout[index])) {
      token += layout[index];
      index += 1;
    }
    tokens.push(token);
  }

  return tokens;
}

/**
 * Category: New
 * Purpose: Skip one simple `if ... endif` branch using the same flat matching style as the original code path.
 */
function skipToEndif(tokens: string[], currentIndex: number): number {
  let index = currentIndex;
  while (index + 1 < tokens.length) {
    index += 1;
    if (tokens[index] === "endif") {
      return index;
    }
  }
  return tokens.length - 1;
}

/**
 * Category: New
 * Purpose: Emit the draw commands corresponding to one `client` layout block.
 */
function executeClientLayoutBlock(
  runtime: ClientRuntime,
  context: ClientHudLayoutContext,
  commands: ClientHudDrawCommand[],
  tokens: string[],
  currentIndex: number
): number {
  let index = currentIndex;
  const x = context.viewportWidth / 2 - 160 + Number.parseInt(tokens[++index] ?? "0", 10);
  const y = context.viewportHeight / 2 - 120 + Number.parseInt(tokens[++index] ?? "0", 10);
  const clientIndex = Number.parseInt(tokens[++index] ?? "0", 10);
  const score = Number.parseInt(tokens[++index] ?? "0", 10);
  const ping = Number.parseInt(tokens[++index] ?? "0", 10);
  const time = Number.parseInt(tokens[++index] ?? "0", 10);

  if (clientIndex < 0 || clientIndex >= runtime.cl.clientinfo.length) {
    throw new Error(`client >= MAX_CLIENTS (${clientIndex})`);
  }

  let clientInfo = runtime.cl.clientinfo[clientIndex];
  if (!clientInfo.iconname) {
    clientInfo = runtime.cl.baseclientinfo;
  }

  if (clientInfo.iconname.length > 0) {
    commands.push(createPictureCommand(x, y, clientInfo.iconname));
  }

  commands.push(createTextCommand(x + 32, y, clientInfo.name, "alt"));
  commands.push(createTextCommand(x + 32, y + 8, "Score: ", "normal"));
  commands.push(createTextCommand(x + 32 + 7 * 8, y + 8, `${score}`, "alt"));
  commands.push(createTextCommand(x + 32, y + 16, `Ping:  ${ping}`, "normal"));
  commands.push(createTextCommand(x + 32, y + 24, `Time:  ${time}`, "normal"));

  return index;
}

/**
 * Category: New
 * Purpose: Emit the draw commands corresponding to one `ctf` layout block.
 */
function executeCtfLayoutBlock(
  runtime: ClientRuntime,
  context: ClientHudLayoutContext,
  commands: ClientHudDrawCommand[],
  tokens: string[],
  currentIndex: number
): number {
  let index = currentIndex;
  const x = context.viewportWidth / 2 - 160 + Number.parseInt(tokens[++index] ?? "0", 10);
  const y = context.viewportHeight / 2 - 120 + Number.parseInt(tokens[++index] ?? "0", 10);
  const clientIndex = Number.parseInt(tokens[++index] ?? "0", 10);
  const score = Number.parseInt(tokens[++index] ?? "0", 10);
  const ping = Math.min(999, Number.parseInt(tokens[++index] ?? "0", 10));

  if (clientIndex < 0 || clientIndex >= runtime.cl.clientinfo.length) {
    throw new Error(`client >= MAX_CLIENTS (${clientIndex})`);
  }

  const clientInfo = runtime.cl.clientinfo[clientIndex];
  const block = `${`${score}`.padStart(3, " ")} ${`${ping}`.padStart(3, " ")} ${clientInfo.name.padEnd(12, " ").slice(0, 12)}`;
  commands.push(createTextCommand(x, y, block, clientIndex === runtime.cl.playernum ? "alt" : "normal"));

  return index;
}

/**
 * Category: New
 * Purpose: Create one HUD picture command that defers to the original picture's native size.
 *
 * Constraints:
 * - Must preserve the `SCR_ExecuteLayoutString` coordinates exactly.
 * - Must let the renderer resolve the final width and height from the registered pic.
 */
function createPictureCommand(x: number, y: number, pic: string): ClientHudPictureCommand {
  return {
    type: "picture",
    x,
    y,
    pic,
    bounds: {
      x,
      y,
      width: 0,
      height: 0
    }
  };
}

/**
 * Category: New
 * Purpose: Create one HUD picture command that defers size resolution to the final Three.js texture.
 *
 * Constraints:
 * - `x = -1` centers horizontally.
 * - `y = -1` centers vertically.
 */
function createAutosizedPictureCommand(x: number, y: number, pic: string): ClientHudPictureCommand {
  return {
    type: "picture",
    x,
    y,
    pic,
    bounds: {
      x,
      y,
      width: 0,
      height: 0
    }
  };
}

/**
 * Category: New
 * Purpose: Create one plain HUD text command with the requested Quake-style variant.
 */
function createTextCommand(x: number, y: number, text: string, variant: "normal" | "alt"): ClientHudTextCommand {
  return {
    type: "text",
    x,
    y,
    text: variant === "alt" ? SetStringHighBit(text) : text,
    xorMask: variant === "alt" ? 0x80 : 0,
    centerWidth: 0,
    variant,
    bounds: {
      x,
      y,
      width: text.length * 8,
      height: 8
    }
  };
}
