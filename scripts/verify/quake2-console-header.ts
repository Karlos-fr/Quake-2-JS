/**
 * File: quake2-console-header.ts
 * Purpose: Verify that the TypeScript target for `client/console.h` preserves the key console declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/client/src/console.ts
 */

import { strict as assert } from "node:assert";

import {
  CON_TEXTSIZE,
  NUM_CON_TIMES,
  Con_CheckResize,
  Con_Clear_f,
  Con_ClearNotify,
  Con_CenteredPrint,
  Con_DrawCharacter,
  Con_DrawConsole,
  Con_DrawNotify,
  Con_Init,
  Con_Print,
  Con_ToggleConsole_f,
  createConsoleState
} from "../../packages/client/src/console.js";

const con = createConsoleState();

assert.equal(NUM_CON_TIMES, 4, "NUM_CON_TIMES mismatch");
assert.equal(CON_TEXTSIZE, 32768, "CON_TEXTSIZE mismatch");
assert.equal(con.initialized, false, "console_t.initialized default mismatch");
assert.equal(con.text.length, CON_TEXTSIZE, "console_t.text capacity mismatch");
assert.equal(con.text.every((char) => char === " "), true, "console_t.text fill mismatch");
assert.equal(con.current, 0, "console_t.current default mismatch");
assert.equal(con.x, 0, "console_t.x default mismatch");
assert.equal(con.display, 0, "console_t.display default mismatch");
assert.equal(con.ormask, 0, "console_t.ormask default mismatch");
assert.equal(con.linewidth, 0, "console_t.linewidth default mismatch");
assert.equal(con.totallines, 0, "console_t.totallines default mismatch");
assert.equal(con.cursorspeed, 4, "console_t.cursorspeed default mismatch");
assert.equal(con.vislines, 0, "console_t.vislines default mismatch");
assert.deepEqual(con.times, [0, 0, 0, 0], "console_t.times default mismatch");

Con_Init(con, 320);
assert.equal(con.initialized, true, "Con_Init must initialize console");
assert.equal(con.linewidth, 38, "Con_CheckResize default width mismatch");

Con_Print(con, "hello world", 1000);
assert.equal(con.current >= 0, true, "Con_Print must advance console line");
assert.equal(con.times[con.current % NUM_CON_TIMES], 1000, "Con_Print notify timestamp mismatch");

Con_CenteredPrint(con, "quake", 1200);
const notify = Con_DrawNotify(con, 1500, 3000);
assert.equal(notify.length > 0, true, "Con_DrawNotify must return recent lines");

Con_ClearNotify(con);
assert.equal(Con_DrawNotify(con, 1500, 3000).length, 0, "Con_ClearNotify mismatch");

Con_Clear_f(con);
assert.equal(con.text.every((char) => char === " "), true, "Con_Clear_f mismatch");

Con_CheckResize(con, 640);
assert.equal(con.linewidth, 78, "Con_CheckResize width update mismatch");
con.vislines = 120;
const consoleLines = Con_DrawConsole(con, 0.5, 1800);
assert.equal(consoleLines.length > 0, true, "Con_DrawConsole must expose header-mode lines");

assert.deepEqual(Con_DrawCharacter(8, 16, 65), { cx: 8, line: 16, num: 65 }, "Con_DrawCharacter mismatch");
assert.equal(Con_ToggleConsole_f(false), true, "Con_ToggleConsole_f open mismatch");
assert.equal(Con_ToggleConsole_f(true), false, "Con_ToggleConsole_f close mismatch");

console.log("quake2-console-header: ok");
