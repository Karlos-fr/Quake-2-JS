/**
 * File: qmenu.ts
 * Source: Quake II original / client/qmenu.c + client/qmenu.h
 * Purpose: Port the Quake II shared menu framework and its core runtime behavior.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses an explicit runtime context for key state, clipboard access, timing, video size and draw sinks instead of C globals and `refexport_t`.
 * - Emits structured draw-command snapshots so the port can be verified without a live renderer backend.
 *
 * Notes:
 * - This file is the principal attachment point for `client/qmenu.c` and `client/qmenu.h`.
 */

import type { qboolean } from "../../qcommon/src/index.js";
import {
  K_BACKSPACE,
  K_CTRL,
  K_DEL,
  K_DOWNARROW,
  K_ENTER,
  K_ESCAPE,
  K_INS,
  K_KP_5,
  K_KP_DEL,
  K_KP_DOWNARROW,
  K_KP_END,
  K_KP_ENTER,
  K_KP_HOME,
  K_KP_INS,
  K_KP_LEFTARROW,
  K_KP_MINUS,
  K_KP_PGDN,
  K_KP_PGUP,
  K_KP_PLUS,
  K_KP_RIGHTARROW,
  K_KP_SLASH,
  K_KP_UPARROW,
  K_LEFTARROW,
  K_RIGHTARROW,
  K_SHIFT,
  K_SPACE,
  K_TAB,
  K_UPARROW
} from "./keys.js";

export {
  K_BACKSPACE,
  K_DOWNARROW,
  K_ENTER,
  K_ESCAPE,
  K_LEFTARROW,
  K_RIGHTARROW,
  K_SPACE,
  K_TAB,
  K_UPARROW
};

export const MAXMENUITEMS = 64;

export const MTYPE_SLIDER = 0;
export const MTYPE_LIST = 1;
export const MTYPE_ACTION = 2;
export const MTYPE_SPINCONTROL = 3;
export const MTYPE_SEPARATOR = 4;
export const MTYPE_FIELD = 5;

export const QMF_LEFT_JUSTIFY = 0x00000001;
export const QMF_GRAYED = 0x00000002;
export const QMF_NUMBERSONLY = 0x00000004;

const RCOLUMN_OFFSET = 16;
const LCOLUMN_OFFSET = -16;
const SLIDER_RANGE = 10;
const DEFAULT_VID_WIDTH = 320;
const DEFAULT_VID_HEIGHT = 240;

/**
 * Category: New
 * Purpose: Encode one menu text draw request emitted by the `Menu_DrawString*` family.
 *
 * Constraints:
 * - Must preserve pixel coordinates and the original string payload.
 */
export interface MenuDrawStringCommand {
  x: number;
  y: number;
  text: string;
  dark: qboolean;
  rightToLeft: qboolean;
}

/**
 * Category: New
 * Purpose: Encode one low-level `Draw_Char` request emitted by `qmenu.c`.
 *
 * Constraints:
 * - Must preserve exact character codes and pixel coordinates.
 */
export interface MenuDrawCharCommand {
  x: number;
  y: number;
  c: number;
}

/**
 * Category: New
 * Purpose: Encode one low-level `Draw_Fill` request emitted by `qmenu.c`.
 *
 * Constraints:
 * - Must preserve exact bounds and palette index.
 */
export interface MenuDrawFillCommand {
  x: number;
  y: number;
  w: number;
  h: number;
  c: number;
}

export interface menuframework_s {
  x: number;
  y: number;
  cursor: number;
  nitems: number;
  nslots: number;
  items: Array<MenuItem | null>;
  statusbar: string | null;
  cursordraw: ((context: ClientQMenuContext, menu: menuframework_s) => void) | null;
}

export interface menucommon_s {
  type: number;
  name: string | null;
  x: number;
  y: number;
  parent: menuframework_s | null;
  cursor_offset: number;
  localdata: Int32Array;
  flags: number;
  statusbar: string | null;
  callback: ((self: unknown) => void) | null;
  statusbarfunc: ((self: unknown) => void) | null;
  ownerdraw: ((context: ClientQMenuContext, self: unknown) => void) | null;
  cursordraw: ((context: ClientQMenuContext, self: unknown) => void) | null;
}

export interface menufield_s {
  generic: menucommon_s;
  buffer: string;
  cursor: number;
  length: number;
  visible_length: number;
  visible_offset: number;
}

export interface menuslider_s {
  generic: menucommon_s;
  minvalue: number;
  maxvalue: number;
  curvalue: number;
  range: number;
}

export interface menulist_s {
  generic: menucommon_s;
  curvalue: number;
  itemnames: Array<string | null> | null;
}

export interface menuaction_s {
  generic: menucommon_s;
}

export interface menuseparator_s {
  generic: menucommon_s;
}

export type MenuItem = menufield_s | menuslider_s | menulist_s | menuaction_s | menuseparator_s;

/**
 * Category: New
 * Purpose: Preserve the runtime globals and draw capture state used by the `qmenu.c` port.
 *
 * Constraints:
 * - Must keep the menu code independent from renderer/platform adapters.
 */
export interface ClientQMenuState {
  vidWidth: number;
  vidHeight: number;
  keydown: Int32Array;
  drawChars: MenuDrawCharCommand[];
  drawFills: MenuDrawFillCommand[];
  drawStrings: MenuDrawStringCommand[];
}

/**
 * Category: New
 * Purpose: Expose only the remaining platform hooks needed by `qmenu.c`.
 *
 * Constraints:
 * - Must stay limited to platform adaptation points that replace non-portable globals.
 */
export interface ClientQMenuHooks {
  getMilliseconds?: () => number;
  getClipboardData?: () => string | null;
  onDrawChar?: (command: MenuDrawCharCommand) => void;
  onDrawFill?: (command: MenuDrawFillCommand) => void;
}

/**
 * Category: New
 * Purpose: Group the menu framework public state with the explicit runtime required by the `qmenu.c` port.
 *
 * Constraints:
 * - Must preserve Quake-style defaults while keeping host integration explicit.
 */
export interface ClientQMenuContext {
  state: ClientQMenuState;
  hooks: ClientQMenuHooks;
}

export function createClientQMenuContext(hooks: ClientQMenuHooks = {}): ClientQMenuContext {
  return {
    state: {
      vidWidth: DEFAULT_VID_WIDTH,
      vidHeight: DEFAULT_VID_HEIGHT,
      keydown: new Int32Array(256),
      drawChars: [],
      drawFills: [],
      drawStrings: []
    },
    hooks
  };
}

export function createMenuFramework(): menuframework_s {
  return {
    x: 0,
    y: 0,
    cursor: 0,
    nitems: 0,
    nslots: 0,
    items: new Array<MenuItem | null>(MAXMENUITEMS).fill(null),
    statusbar: null,
    cursordraw: null
  };
}

export function createMenuCommon(type = MTYPE_ACTION): menucommon_s {
  return {
    type,
    name: null,
    x: 0,
    y: 0,
    parent: null,
    cursor_offset: 0,
    localdata: new Int32Array(4),
    flags: 0,
    statusbar: null,
    callback: null,
    statusbarfunc: null,
    ownerdraw: null,
    cursordraw: null
  };
}

export function createMenuField(): menufield_s {
  return {
    generic: createMenuCommon(MTYPE_FIELD),
    buffer: "",
    cursor: 0,
    length: 0,
    visible_length: 0,
    visible_offset: 0
  };
}

export function createMenuSlider(): menuslider_s {
  return {
    generic: createMenuCommon(MTYPE_SLIDER),
    minvalue: 0,
    maxvalue: 0,
    curvalue: 0,
    range: 0
  };
}

export function createMenuList(type = MTYPE_LIST): menulist_s {
  return {
    generic: createMenuCommon(type),
    curvalue: 0,
    itemnames: null
  };
}

export function createMenuAction(): menuaction_s {
  return {
    generic: createMenuCommon(MTYPE_ACTION)
  };
}

export function createMenuSeparator(): menuseparator_s {
  return {
    generic: createMenuCommon(MTYPE_SEPARATOR)
  };
}

function getMilliseconds(context: ClientQMenuContext): number {
  return context.hooks.getMilliseconds?.() ?? 0;
}

function emitDrawChar(context: ClientQMenuContext, x: number, y: number, c: number): void {
  const command = { x, y, c };
  context.state.drawChars.push(command);
  context.hooks.onDrawChar?.(command);
}

function emitDrawFill(context: ClientQMenuContext, x: number, y: number, w: number, h: number, c: number): void {
  const command = { x, y, w, h, c };
  context.state.drawFills.push(command);
  context.hooks.onDrawFill?.(command);
}

function emitDrawString(
  context: ClientQMenuContext,
  x: number,
  y: number,
  text: string | null,
  dark: qboolean,
  rightToLeft: qboolean
): void {
  const safeText = text ?? "";
  const command = { x, y, text: safeText, dark, rightToLeft };

  context.state.drawStrings.push(command);

  if (rightToLeft) {
    for (let i = 0; i < safeText.length; i += 1) {
      const index = safeText.length - i - 1;
      emitDrawChar(context, x - i * 8, y, safeText.charCodeAt(index) + (dark ? 128 : 0));
    }
    return;
  }

  for (let i = 0; i < safeText.length; i += 1) {
    emitDrawChar(context, x + i * 8, y, safeText.charCodeAt(i) + (dark ? 128 : 0));
  }
}

/**
 * Category: New
 * Purpose: Expose the low-level draw-char sink used by `qmenu.c` ownerdraw and cursordraw callbacks.
 *
 * Constraints:
 * - Must preserve the exact coordinates and glyph code passed by menu callbacks.
 */
export function QMenu_DrawChar(context: ClientQMenuContext, x: number, y: number, c: number): void {
  emitDrawChar(context, x, y, c);
}

/**
 * Category: New
 * Purpose: Expose one immediate bright menu string draw for `qmenu.c` ownerdraw callbacks.
 *
 * Constraints:
 * - Must encode the text through the same draw-command path as the built-in menu item renderers.
 */
export function QMenu_DrawString(context: ClientQMenuContext, x: number, y: number, text: string): void {
  emitDrawString(context, x, y, text, false, false);
}

function setFieldBuffer(field: menufield_s, text: string): void {
  field.buffer = text;
}

/**
 * Original name: Action_DoEnter
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Invokes the action callback when the menu item provides one.
 */
function Action_DoEnter(a: menuaction_s): void {
  a.generic.callback?.(a);
}

/**
 * Original name: Action_Draw
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Draws an action item using the original left/right justification and grayed-string rules.
 *
 * Porting notes:
 * - Emits draw commands through the explicit qmenu context instead of direct `Draw_Char` calls.
 */
function Action_Draw(context: ClientQMenuContext, a: menuaction_s): void {
  const x = a.generic.x + (a.generic.parent?.x ?? 0) + LCOLUMN_OFFSET;
  const y = a.generic.y + (a.generic.parent?.y ?? 0);

  if (a.generic.flags & QMF_LEFT_JUSTIFY) {
    emitDrawString(context, x, y, a.generic.name, !!(a.generic.flags & QMF_GRAYED), false);
  } else {
    emitDrawString(context, x, y, a.generic.name, !!(a.generic.flags & QMF_GRAYED), true);
  }

  a.generic.ownerdraw?.(context, a);
}

/**
 * Original name: Field_DoEnter
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Invokes the field callback when present and reports whether enter was handled.
 */
function Field_DoEnter(f: menufield_s): qboolean {
  if (f.generic.callback) {
    f.generic.callback(f);
    return true;
  }

  return false;
}

/**
 * Original name: Field_Draw
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Draws the field label, frame glyphs, visible text slice and blinking cursor.
 *
 * Porting notes:
 * - Uses explicit timing/video/draw state from `ClientQMenuContext` instead of C globals.
 */
function Field_Draw(context: ClientQMenuContext, f: menufield_s): void {
  const parentX = f.generic.parent?.x ?? 0;
  const parentY = f.generic.parent?.y ?? 0;
  const visibleText = f.buffer.slice(f.visible_offset, f.visible_offset + f.visible_length);

  if (f.generic.name) {
    emitDrawString(
      context,
      f.generic.x + parentX + LCOLUMN_OFFSET,
      f.generic.y + parentY,
      f.generic.name,
      true,
      true
    );
  }

  emitDrawChar(context, f.generic.x + parentX + 16, f.generic.y + parentY - 4, 18);
  emitDrawChar(context, f.generic.x + parentX + 16, f.generic.y + parentY + 4, 24);

  emitDrawChar(
    context,
    f.generic.x + parentX + 24 + f.visible_length * 8,
    f.generic.y + parentY - 4,
    20
  );
  emitDrawChar(
    context,
    f.generic.x + parentX + 24 + f.visible_length * 8,
    f.generic.y + parentY + 4,
    26
  );

  for (let i = 0; i < f.visible_length; i += 1) {
    emitDrawChar(context, f.generic.x + parentX + 24 + i * 8, f.generic.y + parentY - 4, 19);
    emitDrawChar(context, f.generic.x + parentX + 24 + i * 8, f.generic.y + parentY + 4, 25);
  }

  emitDrawString(context, f.generic.x + parentX + 24, f.generic.y + parentY, visibleText, false, false);

  if (f.generic.parent && Menu_ItemAtCursor(context, f.generic.parent) === f) {
    const offset = f.visible_offset ? f.visible_length : f.cursor;
    const cursorChar = (Math.trunc(getMilliseconds(context) / 250) & 1) ? 11 : " ".charCodeAt(0);

    emitDrawChar(
      context,
      f.generic.x + parentX + (offset + 2) * 8 + 8,
      f.generic.y + parentY,
      cursorChar
    );
  }
}

function normalizeKeypadKey(key: number): number {
  switch (key) {
    case K_KP_SLASH:
      return "/".charCodeAt(0);
    case K_KP_MINUS:
      return "-".charCodeAt(0);
    case K_KP_PLUS:
      return "+".charCodeAt(0);
    case K_KP_HOME:
      return "7".charCodeAt(0);
    case K_KP_UPARROW:
      return "8".charCodeAt(0);
    case K_KP_PGUP:
      return "9".charCodeAt(0);
    case K_KP_LEFTARROW:
      return "4".charCodeAt(0);
    case K_KP_5:
      return "5".charCodeAt(0);
    case K_KP_RIGHTARROW:
      return "6".charCodeAt(0);
    case K_KP_END:
      return "1".charCodeAt(0);
    case K_KP_DOWNARROW:
      return "2".charCodeAt(0);
    case K_KP_PGDN:
      return "3".charCodeAt(0);
    case K_KP_INS:
      return "0".charCodeAt(0);
    case K_KP_DEL:
      return ".".charCodeAt(0);
    default:
      return key;
  }
}

function isDigitKey(key: number): boolean {
  return key >= 48 && key <= 57;
}

function trimClipboardText(text: string): string {
  let end = text.length;

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code === 10 || code === 13 || code === 8) {
      end = i;
      break;
    }
  }

  return text.slice(0, end);
}

function applyFieldPaste(context: ClientQMenuContext, field: menufield_s): qboolean {
  const clipboard = context.hooks.getClipboardData?.();

  if (clipboard === null || clipboard === undefined) {
    return true;
  }

  const maxLength = Math.max(field.length - 1, 0);
  const pasted = trimClipboardText(clipboard).slice(0, maxLength);

  setFieldBuffer(field, pasted);
  field.cursor = field.buffer.length;
  field.visible_offset = field.cursor - field.visible_length;

  if (field.visible_offset < 0) {
    field.visible_offset = 0;
  }

  return true;
}

function removeCharAt(text: string, index: number): string {
  return `${text.slice(0, index)}${text.slice(index + 1)}`;
}

/**
 * Original name: Field_Key
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Applies one key press to a menu text field, including the Quake II keypad remaps and clipboard paste path.
 *
 * Porting notes:
 * - Uses explicit `keydown` state and clipboard hooks instead of the `keydown[]` global and `Sys_GetClipboardData`.
 */
export function Field_Key(context: ClientQMenuContext, field: menufield_s, key: number): qboolean {
  key = normalizeKeypadKey(key);

  if (key > 127) {
    switch (key) {
      case K_DEL:
      default:
        return false;
    }
  }

  const uppercaseKey = key >= 97 && key <= 122 ? key - 32 : key;
  const ctrlDown = context.state.keydown[K_CTRL] !== 0;
  const shiftDown = context.state.keydown[K_SHIFT] !== 0;

  if ((uppercaseKey === "V".charCodeAt(0) && ctrlDown) || (((key === K_INS) || (key === K_KP_INS)) && shiftDown)) {
    return applyFieldPaste(context, field);
  }

  switch (key) {
    case K_KP_LEFTARROW:
    case K_LEFTARROW:
    case K_BACKSPACE:
      if (field.cursor > 0) {
        setFieldBuffer(field, removeCharAt(field.buffer, field.cursor - 1));
        field.cursor -= 1;

        if (field.visible_offset) {
          field.visible_offset -= 1;
        }
      }
      break;

    case K_KP_DEL:
    case K_DEL:
      if (field.cursor < field.buffer.length) {
        setFieldBuffer(field, removeCharAt(field.buffer, field.cursor));
      }
      break;

    case K_KP_ENTER:
    case K_ENTER:
    case K_ESCAPE:
    case K_TAB:
      return false;

    case K_SPACE:
    default:
      if (!isDigitKey(key) && (field.generic.flags & QMF_NUMBERSONLY)) {
        return false;
      }

      if (field.cursor < field.length) {
        const char = String.fromCharCode(key);
        setFieldBuffer(field, `${field.buffer.slice(0, field.cursor)}${char}`);
        field.cursor += 1;

        if (field.cursor > field.visible_length) {
          field.visible_offset += 1;
        }
      }
      break;
  }

  return true;
}

/**
 * Original name: Menu_AddItem
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Appends one item to the menu and recomputes the menu slot count.
 */
export function Menu_AddItem(context: ClientQMenuContext, menu: menuframework_s, item: MenuItem): void {
  if (menu.nitems === 0) {
    menu.nslots = 0;
  }

  if (menu.nitems < MAXMENUITEMS) {
    menu.items[menu.nitems] = item;
    item.generic.parent = menu;
    menu.nitems += 1;
  }

  menu.nslots = Menu_TallySlots(context, menu);
}

/**
 * Original name: Menu_AdjustCursor
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Crawls forward or backward until the cursor lands on a non-separator item.
 */
export function Menu_AdjustCursor(context: ClientQMenuContext, menu: menuframework_s, dir: number): void {
  let citem: MenuItem | null;

  if (menu.cursor >= 0 && menu.cursor < menu.nitems) {
    citem = Menu_ItemAtCursor(context, menu);
    if (citem && citem.generic.type !== MTYPE_SEPARATOR) {
      return;
    }
  }

  if (dir === 1) {
    while (true) {
      citem = Menu_ItemAtCursor(context, menu);
      if (citem && citem.generic.type !== MTYPE_SEPARATOR) {
        break;
      }

      menu.cursor += dir;
      if (menu.cursor >= menu.nitems) {
        menu.cursor = 0;
      }
    }
  } else {
    while (true) {
      citem = Menu_ItemAtCursor(context, menu);
      if (citem && citem.generic.type !== MTYPE_SEPARATOR) {
        break;
      }

      menu.cursor += dir;
      if (menu.cursor < 0) {
        menu.cursor = menu.nitems - 1;
      }
    }
  }
}

/**
 * Original name: Menu_Center
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Vertically centers the menu using the last item's Y position and the current video height.
 */
export function Menu_Center(context: ClientQMenuContext, menu: menuframework_s): void {
  const lastItem = menu.nitems > 0 ? menu.items[menu.nitems - 1] : null;

  if (lastItem) {
    const height = lastItem.generic.y + 10;
    menu.y = Math.trunc((context.state.vidHeight - height) / 2);
  }
}

/**
 * Original name: Menu_DrawStatusBar
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Fills the bottom 8-pixel status bar and centers text when a status string is present.
 *
 * Porting notes:
 * - Reads video dimensions from the explicit qmenu state instead of `viddef`.
 */
function Menu_DrawStatusBar(context: ClientQMenuContext, text: string | null): void {
  if (text) {
    const maxcol = Math.trunc(context.state.vidWidth / 8);
    const col = Math.trunc(maxcol / 2 - text.length / 2);

    emitDrawFill(context, 0, context.state.vidHeight - 8, context.state.vidWidth, 8, 4);
    emitDrawString(context, col * 8, context.state.vidHeight - 8, text, false, false);
    return;
  }

  emitDrawFill(context, 0, context.state.vidHeight - 8, context.state.vidWidth, 8, 0);
}

/**
 * Original name: Menu_Draw
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Draws all menu items, the cursor marker and the active status bar.
 *
 * Porting notes:
 * - Captures `Draw_Char` and `Draw_Fill` requests through the explicit runtime instead of calling the renderer directly.
 */
export function Menu_Draw(context: ClientQMenuContext, menu: menuframework_s): void {
  for (let i = 0; i < menu.nitems; i += 1) {
    const item = menu.items[i];

    if (!item) {
      continue;
    }

    switch (item.generic.type) {
      case MTYPE_FIELD:
        Field_Draw(context, item as menufield_s);
        break;
      case MTYPE_SLIDER:
        Slider_Draw(context, item as menuslider_s);
        break;
      case MTYPE_LIST:
        MenuList_Draw(context, item as menulist_s);
        break;
      case MTYPE_SPINCONTROL:
        SpinControl_Draw(context, item as menulist_s);
        break;
      case MTYPE_ACTION:
        Action_Draw(context, item as menuaction_s);
        break;
      case MTYPE_SEPARATOR:
        Separator_Draw(context, item as menuseparator_s);
        break;
      default:
        break;
    }
  }

  const item = Menu_ItemAtCursor(context, menu);

  if (item && item.generic.cursordraw) {
    item.generic.cursordraw(context, item);
  } else if (menu.cursordraw) {
    menu.cursordraw(context, menu);
  } else if (item && item.generic.type !== MTYPE_FIELD) {
    const frame = 12 + (Math.trunc(getMilliseconds(context) / 250) & 1);

    if (item.generic.flags & QMF_LEFT_JUSTIFY) {
      emitDrawChar(context, menu.x + item.generic.x - 24 + item.generic.cursor_offset, menu.y + item.generic.y, frame);
    } else {
      emitDrawChar(context, menu.x + item.generic.cursor_offset, menu.y + item.generic.y, frame);
    }
  }

  if (item) {
    if (item.generic.statusbarfunc) {
      item.generic.statusbarfunc(item);
    } else if (item.generic.statusbar) {
      Menu_DrawStatusBar(context, item.generic.statusbar);
    } else {
      Menu_DrawStatusBar(context, menu.statusbar);
    }
  } else {
    Menu_DrawStatusBar(context, menu.statusbar);
  }
}

/**
 * Original name: Menu_DrawString
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Encodes one left-to-right bright menu draw request.
 */
export function Menu_DrawString(x: number, y: number, text: string): MenuDrawStringCommand {
  return { x, y, text, dark: false, rightToLeft: false };
}

/**
 * Original name: Menu_DrawStringDark
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Encodes one left-to-right darkened menu draw request.
 */
export function Menu_DrawStringDark(x: number, y: number, text: string): MenuDrawStringCommand {
  return { x, y, text, dark: true, rightToLeft: false };
}

/**
 * Original name: Menu_DrawStringR2L
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Encodes one right-to-left bright menu draw request.
 */
export function Menu_DrawStringR2L(x: number, y: number, text: string): MenuDrawStringCommand {
  return { x, y, text, dark: false, rightToLeft: true };
}

/**
 * Original name: Menu_DrawStringR2LDark
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Encodes one right-to-left darkened menu draw request.
 */
export function Menu_DrawStringR2LDark(x: number, y: number, text: string): MenuDrawStringCommand {
  return { x, y, text, dark: true, rightToLeft: true };
}

/**
 * Original name: Menu_ItemAtCursor
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the item currently addressed by the menu cursor or `null` when the cursor is outside the item array.
 */
export function Menu_ItemAtCursor(context: ClientQMenuContext, menu: menuframework_s): MenuItem | null {
  if (menu.cursor < 0 || menu.cursor >= menu.nitems) {
    return null;
  }

  return menu.items[menu.cursor] ?? null;
}

/**
 * Original name: Menu_SelectItem
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Activates the current item when its type supports enter/activate behavior.
 */
export function Menu_SelectItem(context: ClientQMenuContext, menu: menuframework_s): qboolean {
  const item = Menu_ItemAtCursor(context, menu);

  if (item) {
    switch (item.generic.type) {
      case MTYPE_FIELD:
        return Field_DoEnter(item as menufield_s);
      case MTYPE_ACTION:
        Action_DoEnter(item as menuaction_s);
        return true;
      case MTYPE_LIST:
        return false;
      case MTYPE_SPINCONTROL:
        return false;
      default:
        break;
    }
  }

  return false;
}

/**
 * Original name: Menu_SetStatusBar
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Stores the menu-wide status bar string.
 */
export function Menu_SetStatusBar(context: ClientQMenuContext, menu: menuframework_s, text: string | null): void {
  menu.statusbar = text;
}

/**
 * Original name: Menu_SlideItem
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Slides the active slider or spincontrol item.
 */
export function Menu_SlideItem(context: ClientQMenuContext, menu: menuframework_s, dir: number): void {
  const item = Menu_ItemAtCursor(context, menu);

  if (item) {
    switch (item.generic.type) {
      case MTYPE_SLIDER:
        Slider_DoSlide(item as menuslider_s, dir);
        break;
      case MTYPE_SPINCONTROL:
        SpinControl_DoSlide(item as menulist_s, dir);
        break;
      default:
        break;
    }
  }
}

/**
 * Original name: Menu_TallySlots
 * Source: client/qmenu.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Counts the cursor slots contributed by each menu item, expanding list items by their entry count.
 */
export function Menu_TallySlots(context: ClientQMenuContext, menu: menuframework_s): number {
  let total = 0;

  for (let i = 0; i < menu.nitems; i += 1) {
    const item = menu.items[i];

    if (!item) {
      continue;
    }

    if (item.generic.type === MTYPE_LIST) {
      let nitems = 0;
      const names = (item as menulist_s).itemnames ?? [];

      while (nitems < names.length && names[nitems]) {
        nitems += 1;
      }

      total += nitems;
    } else {
      total += 1;
    }
  }

  return total;
}

function Menulist_DoEnter(l: menulist_s): void {
  const start = Math.trunc(l.generic.y / 10) + 1;
  const cursor = l.generic.parent?.cursor ?? 0;

  l.curvalue = cursor - start;
  l.generic.callback?.(l);
}

function MenuList_Draw(context: ClientQMenuContext, l: menulist_s): void {
  const parentX = l.generic.parent?.x ?? 0;
  const parentY = l.generic.parent?.y ?? 0;
  let y = 0;

  emitDrawString(
    context,
    l.generic.x + parentX + LCOLUMN_OFFSET,
    l.generic.y + parentY,
    l.generic.name,
    true,
    true
  );

  emitDrawFill(
    context,
    l.generic.x - 112 + parentX,
    parentY + l.generic.y + l.curvalue * 10 + 10,
    128,
    10,
    16
  );

  for (const name of l.itemnames ?? []) {
    if (!name) {
      break;
    }

    emitDrawString(
      context,
      l.generic.x + parentX + LCOLUMN_OFFSET,
      l.generic.y + parentY + y + 10,
      name,
      true,
      true
    );

    y += 10;
  }
}

function Separator_Draw(context: ClientQMenuContext, s: menuseparator_s): void {
  if (s.generic.name) {
    emitDrawString(
      context,
      s.generic.x + (s.generic.parent?.x ?? 0),
      s.generic.y + (s.generic.parent?.y ?? 0),
      s.generic.name,
      true,
      true
    );
  }
}

function Slider_DoSlide(s: menuslider_s, dir: number): void {
  s.curvalue += dir;

  if (s.curvalue > s.maxvalue) {
    s.curvalue = s.maxvalue;
  } else if (s.curvalue < s.minvalue) {
    s.curvalue = s.minvalue;
  }

  s.generic.callback?.(s);
}

function Slider_Draw(context: ClientQMenuContext, s: menuslider_s): void {
  const parentX = s.generic.parent?.x ?? 0;
  const parentY = s.generic.parent?.y ?? 0;

  emitDrawString(
    context,
    s.generic.x + parentX + LCOLUMN_OFFSET,
    s.generic.y + parentY,
    s.generic.name,
    true,
    true
  );

  s.range = (s.curvalue - s.minvalue) / (s.maxvalue - s.minvalue);
  if (s.range < 0) {
    s.range = 0;
  }
  if (s.range > 1) {
    s.range = 1;
  }

  emitDrawChar(context, s.generic.x + parentX + RCOLUMN_OFFSET, s.generic.y + parentY, 128);

  let i = 0;
  for (; i < SLIDER_RANGE; i += 1) {
    emitDrawChar(
      context,
      RCOLUMN_OFFSET + s.generic.x + i * 8 + parentX + 8,
      s.generic.y + parentY,
      129
    );
  }

  emitDrawChar(
    context,
    RCOLUMN_OFFSET + s.generic.x + i * 8 + parentX + 8,
    s.generic.y + parentY,
    130
  );
  emitDrawChar(
    context,
    Math.trunc(8 + RCOLUMN_OFFSET + parentX + s.generic.x + (SLIDER_RANGE - 1) * 8 * s.range),
    s.generic.y + parentY,
    131
  );
}

function SpinControl_DoEnter(s: menulist_s): void {
  s.curvalue += 1;

  if (!s.itemnames || s.itemnames[s.curvalue] === null || s.itemnames[s.curvalue] === undefined) {
    s.curvalue = 0;
  }

  s.generic.callback?.(s);
}

function SpinControl_DoSlide(s: menulist_s, dir: number): void {
  s.curvalue += dir;

  if (s.curvalue < 0) {
    s.curvalue = 0;
  } else if (!s.itemnames || s.itemnames[s.curvalue] === null || s.itemnames[s.curvalue] === undefined) {
    s.curvalue -= 1;
  }

  s.generic.callback?.(s);
}

function SpinControl_Draw(context: ClientQMenuContext, s: menulist_s): void {
  const parentX = s.generic.parent?.x ?? 0;
  const parentY = s.generic.parent?.y ?? 0;
  const current = s.itemnames?.[s.curvalue] ?? "";

  if (s.generic.name) {
    emitDrawString(
      context,
      s.generic.x + parentX + LCOLUMN_OFFSET,
      s.generic.y + parentY,
      s.generic.name,
      true,
      true
    );
  }

  const newlineIndex = current.indexOf("\n");
  if (newlineIndex === -1) {
    emitDrawString(
      context,
      RCOLUMN_OFFSET + s.generic.x + parentX,
      s.generic.y + parentY,
      current,
      false,
      false
    );
    return;
  }

  const firstLine = current.slice(0, newlineIndex);
  const secondLine = current.slice(newlineIndex + 1);

  emitDrawString(
    context,
    RCOLUMN_OFFSET + s.generic.x + parentX,
    s.generic.y + parentY,
    firstLine,
    false,
    false
  );
  emitDrawString(
    context,
    RCOLUMN_OFFSET + s.generic.x + parentX,
    s.generic.y + parentY + 10,
    secondLine,
    false,
    false
  );
}
