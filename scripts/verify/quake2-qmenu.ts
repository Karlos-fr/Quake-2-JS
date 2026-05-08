/**
 * File: quake2-qmenu.ts
 * Purpose: Verify the direct TypeScript port of `client/qmenu.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the menu runtime behavior.
 *
 * Dependencies:
 * - packages/client/src/qmenu.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  MTYPE_SPINCONTROL,
  QMF_LEFT_JUSTIFY,
  createClientQMenuContext,
  createMenuAction,
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
  Menu_SelectItem,
  Menu_SlideItem,
  Menu_TallySlots,
  K_BACKSPACE,
  K_CTRL
} from "../../packages/client/src/index.js";

const context = createClientQMenuContext({
  getMilliseconds: () => 500,
  getClipboardData: () => "name\rnext"
});

context.state.vidWidth = 640;
context.state.vidHeight = 480;

const menu = createMenuFramework();
menu.x = 20;

const action = createMenuAction();
action.generic.name = "start";
action.generic.y = 20;
action.generic.flags = QMF_LEFT_JUSTIFY;
let actionTriggered = 0;
action.generic.callback = () => {
  actionTriggered += 1;
};

const separator = createMenuSeparator();
separator.generic.name = "----";
separator.generic.y = 30;

const field = createMenuField();
field.generic.name = "name";
field.generic.y = 40;
field.length = 8;
field.visible_length = 4;
field.buffer = "test";
field.cursor = 4;

const slider = createMenuSlider();
slider.generic.name = "volume";
slider.generic.y = 60;
slider.minvalue = 0;
slider.maxvalue = 10;
slider.curvalue = 2;

const list = createMenuList();
list.generic.name = "skill";
list.generic.y = 80;
list.itemnames = ["easy", "medium", "hard", null];

const spin = createMenuList(MTYPE_SPINCONTROL);
spin.generic.name = "mode";
spin.generic.y = 120;
spin.itemnames = ["off", "two\nlines", null];

Menu_AddItem(context, menu, action);
Menu_AddItem(context, menu, separator);
Menu_AddItem(context, menu, field);
Menu_AddItem(context, menu, slider);
Menu_AddItem(context, menu, list);
Menu_AddItem(context, menu, spin);

assert.equal(Menu_TallySlots(context, menu), 8, "Menu_TallySlots expanded list mismatch");

menu.cursor = 1;
Menu_AdjustCursor(context, menu, 1);
assert.equal(menu.cursor, 2, "Menu_AdjustCursor should skip separator forward");
Menu_AdjustCursor(context, menu, -1);
assert.equal(menu.cursor, 2, "Menu_AdjustCursor should keep a valid cursor in place");
menu.cursor = 1;
Menu_AdjustCursor(context, menu, -1);
assert.equal(menu.cursor, 0, "Menu_AdjustCursor should skip separator backward");

assert.equal(Menu_SelectItem(context, menu), true, "Menu_SelectItem action should succeed");
assert.equal(actionTriggered, 1, "Menu_SelectItem action callback mismatch");

assert.equal(Field_Key(context, field, K_BACKSPACE), true, "Field_Key backspace should succeed");
assert.equal(field.buffer, "tes", "Field_Key backspace buffer mismatch");

context.state.keydown[K_CTRL] = 1;
assert.equal(Field_Key(context, field, "v".charCodeAt(0)), true, "Field_Key paste should succeed");
assert.equal(field.buffer, "name", "Field_Key paste truncation mismatch");
context.state.keydown[K_CTRL] = 0;

menu.cursor = 3;
Menu_SlideItem(context, menu, 5);
assert.equal(slider.curvalue, 7, "Menu_SlideItem slider accumulate mismatch");
Menu_SlideItem(context, menu, 99);
assert.equal(slider.curvalue, 10, "Menu_SlideItem slider clamp high mismatch");
Menu_SlideItem(context, menu, -99);
assert.equal(slider.curvalue, 0, "Menu_SlideItem slider clamp low mismatch");

menu.cursor = 5;
Menu_SlideItem(context, menu, 1);
assert.equal(spin.curvalue, 1, "Menu_SlideItem spin increment mismatch");
Menu_SlideItem(context, menu, 1);
assert.equal(spin.curvalue, 1, "Menu_SlideItem spin high clamp mismatch");
Menu_SlideItem(context, menu, -2);
assert.equal(spin.curvalue, 0, "Menu_SlideItem spin low clamp mismatch");

Menu_Center(context, menu);
assert.equal(menu.y, Math.trunc((480 - (spin.generic.y + 10)) / 2), "Menu_Center video-height mismatch");

context.state.drawChars.length = 0;
context.state.drawFills.length = 0;
context.state.drawStrings.length = 0;
menu.cursor = 2;
Menu_Draw(context, menu);

assert.ok(
  context.state.drawChars.some((command) => command.c === 11 || command.c === " ".charCodeAt(0)),
  "Menu_Draw field cursor char missing"
);
assert.ok(
  context.state.drawChars.some((command) => command.c === 18) &&
    context.state.drawChars.some((command) => command.c === 20),
  "Menu_Draw field frame glyphs missing"
);

context.state.drawChars.length = 0;
context.state.drawFills.length = 0;
context.state.drawStrings.length = 0;
menu.cursor = 4;
Menu_Draw(context, menu);

assert.ok(
  context.state.drawFills.some((command) => command.c === 16 && command.h === 10),
  "Menu_Draw list highlight fill missing"
);
assert.ok(
  context.state.drawStrings.some((command) => command.text === "easy") &&
    context.state.drawStrings.some((command) => command.text === "medium") &&
    context.state.drawStrings.some((command) => command.text === "hard"),
  "Menu_Draw list item strings missing"
);
assert.ok(
  context.state.drawFills.some((command) => command.x === -92 && command.y === 265 && command.w === 128 && command.h === 10 && command.c === 16),
  "Menu_Draw list highlight fill geometry mismatch"
);

context.state.drawChars.length = 0;
context.state.drawFills.length = 0;
context.state.drawStrings.length = 0;
menu.cursor = 3;
slider.curvalue = 5;
Menu_Draw(context, menu);

assert.equal(slider.range, 0.5, "Slider_Draw range mismatch");
assert.equal(
  context.state.drawChars.filter((command) => command.c === 129).length,
  10,
  "Slider_Draw should emit ten rail glyphs"
);
assert.ok(context.state.drawChars.some((command) => command.c === 128), "Slider_Draw start glyph missing");
assert.ok(context.state.drawChars.some((command) => command.c === 130), "Slider_Draw end glyph missing");
assert.ok(
  context.state.drawChars.some((command) => command.c === 131 && command.x === 80 && command.y === 235),
  "Slider_Draw knob position mismatch"
);

context.state.drawChars.length = 0;
context.state.drawFills.length = 0;
context.state.drawStrings.length = 0;
menu.cursor = 5;
spin.curvalue = 1;
Menu_Draw(context, menu);

assert.ok(context.state.drawStrings.some((command) => command.text === "two"), "SpinControl_Draw first line missing");
assert.ok(context.state.drawStrings.some((command) => command.text === "lines"), "SpinControl_Draw second line missing");
assert.ok(context.state.drawStrings.some((command) => command.text === "----"), "Separator_Draw label missing");

console.log("quake2-qmenu: ok");
