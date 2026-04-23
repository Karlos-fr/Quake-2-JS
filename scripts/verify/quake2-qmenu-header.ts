/**
 * File: quake2-qmenu-header.ts
 * Purpose: Verify that the TypeScript target for `client/qmenu.h` preserves the public declarations and baseline menu behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the shared menu framework.
 *
 * Dependencies:
 * - packages/client/src/qmenu.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  MAXMENUITEMS,
  MTYPE_ACTION,
  MTYPE_FIELD,
  MTYPE_LIST,
  MTYPE_SEPARATOR,
  MTYPE_SLIDER,
  MTYPE_SPINCONTROL,
  QMF_GRAYED,
  QMF_LEFT_JUSTIFY,
  QMF_NUMBERSONLY,
  createClientQMenuContext,
  createMenuAction,
  createMenuCommon,
  createMenuField,
  createMenuFramework,
  createMenuList,
  createMenuSeparator,
  createMenuSlider,
  Field_Key,
  Menu_AddItem,
  Menu_AdjustCursor,
  Menu_Center,
  Menu_Draw,
  Menu_DrawString,
  Menu_DrawStringDark,
  Menu_DrawStringR2L,
  Menu_DrawStringR2LDark,
  Menu_ItemAtCursor,
  Menu_SelectItem,
  Menu_SetStatusBar,
  Menu_SlideItem,
  Menu_TallySlots,
  K_BACKSPACE,
  K_CTRL,
  K_ENTER,
  K_ESCAPE,
  K_LEFTARROW
} from "../../packages/client/src/index.js";

assert.equal(MAXMENUITEMS, 64, "MAXMENUITEMS mismatch");
assert.equal(MTYPE_SLIDER, 0, "MTYPE_SLIDER mismatch");
assert.equal(MTYPE_LIST, 1, "MTYPE_LIST mismatch");
assert.equal(MTYPE_ACTION, 2, "MTYPE_ACTION mismatch");
assert.equal(MTYPE_SPINCONTROL, 3, "MTYPE_SPINCONTROL mismatch");
assert.equal(MTYPE_SEPARATOR, 4, "MTYPE_SEPARATOR mismatch");
assert.equal(MTYPE_FIELD, 5, "MTYPE_FIELD mismatch");
assert.equal(QMF_LEFT_JUSTIFY, 0x00000001, "QMF_LEFT_JUSTIFY mismatch");
assert.equal(QMF_GRAYED, 0x00000002, "QMF_GRAYED mismatch");
assert.equal(QMF_NUMBERSONLY, 0x00000004, "QMF_NUMBERSONLY mismatch");
assert.equal(K_ESCAPE, 27, "K_ESCAPE re-export mismatch");
assert.equal(K_ENTER, 13, "K_ENTER re-export mismatch");

const menu = createMenuFramework();
const action = createMenuAction();
action.generic.name = "start";
action.generic.y = 40;
let actionCalls = 0;
action.generic.callback = () => {
  actionCalls += 1;
};

const separator = createMenuSeparator();
separator.generic.y = 50;

const field = createMenuField();
field.generic.name = "player";
field.generic.y = 60;
field.length = 8;
field.visible_length = 4;

const slider = createMenuSlider();
slider.generic.name = "volume";
slider.generic.y = 70;
slider.minvalue = 0;
slider.maxvalue = 10;
slider.curvalue = 5;

const list = createMenuList();
list.generic.y = 90;
list.itemnames = ["one", "two", null];

const spin = createMenuList(MTYPE_SPINCONTROL);
spin.generic.name = "mode";
spin.generic.y = 120;
spin.itemnames = ["easy", "hard", null];

const common = createMenuCommon();

assert.equal(menu.items.length, MAXMENUITEMS, "createMenuFramework items length mismatch");
assert.equal(common.localdata.length, 4, "createMenuCommon localdata mismatch");
assert.equal(field.generic.type, MTYPE_FIELD, "createMenuField type mismatch");
assert.equal(slider.generic.type, MTYPE_SLIDER, "createMenuSlider type mismatch");
assert.equal(list.generic.type, MTYPE_LIST, "createMenuList type mismatch");
assert.equal(action.generic.type, MTYPE_ACTION, "createMenuAction type mismatch");
assert.equal(separator.generic.type, MTYPE_SEPARATOR, "createMenuSeparator type mismatch");

const context = createClientQMenuContext({
  getMilliseconds: () => 250,
  getClipboardData: () => "clip\nignored"
});

Menu_AddItem(context, menu, action);
Menu_AddItem(context, menu, separator);
Menu_AddItem(context, menu, field);
Menu_AddItem(context, menu, slider);
Menu_AddItem(context, menu, list);
Menu_AddItem(context, menu, spin);

assert.equal(menu.nitems, 6, "Menu_AddItem nitems mismatch");
assert.equal(menu.nslots, 7, "Menu_AddItem nslots mismatch");
assert.equal(action.generic.parent, menu, "Menu_AddItem parent mismatch");

menu.cursor = 0;
assert.equal(Menu_ItemAtCursor(context, menu), action, "Menu_ItemAtCursor mismatch");
assert.equal(Menu_SelectItem(context, menu), true, "Menu_SelectItem action mismatch");
assert.equal(actionCalls, 1, "Menu_SelectItem callback count mismatch");

field.generic.callback = () => {
  actionCalls += 10;
};
menu.cursor = 2;
assert.equal(Menu_SelectItem(context, menu), true, "Menu_SelectItem field mismatch");

field.buffer = "abcd";
field.cursor = 4;
assert.equal(Field_Key(context, field, K_BACKSPACE), true, "Field_Key backspace mismatch");
assert.equal(field.buffer, "abc", "Field_Key backspace buffer mismatch");

field.generic.flags = QMF_NUMBERSONLY;
field.cursor = 0;
field.buffer = "";
assert.equal(Field_Key(context, field, "x".charCodeAt(0)), false, "Field_Key numbers-only reject mismatch");
assert.equal(Field_Key(context, field, "7".charCodeAt(0)), true, "Field_Key numbers-only accept mismatch");
assert.equal(field.buffer, "7", "Field_Key insert mismatch");

field.generic.flags = 0;
context.state.keydown[K_CTRL] = 1;
assert.equal(Field_Key(context, field, "v".charCodeAt(0)), true, "Field_Key clipboard mismatch");
assert.equal(field.buffer, "clip", "Field_Key clipboard contents mismatch");
context.state.keydown[K_CTRL] = 0;

menu.cursor = 1;
Menu_AdjustCursor(context, menu, 1);
assert.equal(menu.cursor, 2, "Menu_AdjustCursor forward skip mismatch");
Menu_AdjustCursor(context, menu, -1);
assert.equal(menu.cursor, 2, "Menu_AdjustCursor valid-item early return mismatch");
menu.cursor = 1;
Menu_AdjustCursor(context, menu, -1);
assert.equal(menu.cursor, 0, "Menu_AdjustCursor backward skip mismatch");

Menu_SetStatusBar(context, menu, "ready");
assert.equal(menu.statusbar, "ready", "Menu_SetStatusBar mismatch");

menu.cursor = 3;
Menu_SlideItem(context, menu, 1);
assert.equal(slider.curvalue, 6, "Menu_SlideItem slider mismatch");

menu.cursor = 5;
Menu_SlideItem(context, menu, 1);
assert.equal(spin.curvalue, 1, "Menu_SlideItem spin mismatch");

context.state.vidHeight = 300;
Menu_Center(context, menu);
assert.equal(menu.y, Math.trunc((300 - (spin.generic.y + 10)) / 2), "Menu_Center mismatch");

context.state.drawChars.length = 0;
context.state.drawFills.length = 0;
context.state.drawStrings.length = 0;
menu.cursor = 0;
Menu_Draw(context, menu);
assert.ok(context.state.drawChars.length > 0, "Menu_Draw char output missing");
assert.ok(context.state.drawFills.length > 0, "Menu_Draw fill output missing");
assert.ok(context.state.drawStrings.some((command) => command.text === "ready"), "Menu_Draw statusbar text missing");

assert.deepEqual(Menu_DrawString(8, 16, "abc"), { x: 8, y: 16, text: "abc", dark: false, rightToLeft: false }, "Menu_DrawString mismatch");
assert.deepEqual(Menu_DrawStringDark(8, 16, "abc"), { x: 8, y: 16, text: "abc", dark: true, rightToLeft: false }, "Menu_DrawStringDark mismatch");
assert.deepEqual(Menu_DrawStringR2L(8, 16, "abc"), { x: 8, y: 16, text: "abc", dark: false, rightToLeft: true }, "Menu_DrawStringR2L mismatch");
assert.deepEqual(Menu_DrawStringR2LDark(8, 16, "abc"), { x: 8, y: 16, text: "abc", dark: true, rightToLeft: true }, "Menu_DrawStringR2LDark mismatch");

assert.equal(actionCalls, 11, "Field enter callback mismatch");

const noOpContext = createClientQMenuContext();
assert.equal(Field_Key(noOpContext, field, K_ESCAPE), false, "Field_Key default mismatch");
assert.equal(Field_Key(noOpContext, field, K_LEFTARROW), false, "Field_Key left arrow default mismatch");
assert.equal(Menu_SelectItem(noOpContext, createMenuFramework()), false, "Menu_SelectItem empty mismatch");

console.log("quake2-qmenu-header: ok");
