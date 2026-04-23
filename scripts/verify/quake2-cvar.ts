/**
 * File: quake2-cvar.ts
 * Purpose: Verify the TypeScript port of `qcommon/cvar.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the shared cvar runtime.
 *
 * Dependencies:
 * - packages/qcommon/src/cvar.ts
 * - packages/qcommon/src/cmd.ts
 */

import { strict as assert } from "node:assert";

import { Cmd_ExecuteString, Cmd_TokenizeString, createCommandRuntime } from "../../packages/qcommon/src/cmd.js";
import {
  CVAR_ARCHIVE,
  CVAR_LATCH,
  CVAR_NOSET,
  CVAR_SERVERINFO,
  CVAR_USERINFO,
  Cvar_BitInfo,
  Cvar_Command,
  Cvar_CompleteVariable,
  Cvar_FindVar,
  Cvar_ForceSet,
  Cvar_FullSet,
  Cvar_Get,
  Cvar_GetLatchedVars,
  Cvar_InfoValidate,
  Cvar_Init,
  Cvar_List_f,
  Cvar_Serverinfo,
  Cvar_Set,
  Cvar_SetServerState,
  Cvar_SetValue,
  Cvar_Userinfo,
  Cvar_VariableString,
  Cvar_VariableValue,
  Cvar_WriteVariables,
  createCvarRuntime
} from "../../packages/qcommon/src/cvar.js";

const printed: string[] = [];
const validationErrors: Array<"name" | "value"> = [];
const writeProtected: string[] = [];
const latchedChanges: string[] = [];
const gameDirChanges: string[] = [];
let autoexecCount = 0;

const cvar = createCvarRuntime({
  onPrint: (line) => printed.push(line),
  onInfoValidationError: (kind) => validationErrors.push(kind),
  onWriteProtected: (name) => writeProtected.push(name),
  onLatchedChange: (name) => latchedChanges.push(name),
  onGameDirChange: (value) => gameDirChanges.push(value),
  onExecAutoexec: () => {
    autoexecCount += 1;
  }
});

const cmd = createCommandRuntime({
  executeUnknownCommand: () => false
});

assert.equal(Cvar_InfoValidate("name"), true, "plain cvar name should be valid");
assert.equal(Cvar_InfoValidate("bad\\name"), false, "backslash should invalidate info strings");
assert.equal(Cvar_InfoValidate("bad\"name"), false, "quote should invalidate info strings");
assert.equal(Cvar_InfoValidate("bad;name"), false, "semicolon should invalidate info strings");

assert.equal(Cvar_Get(cvar, "name\\bad", "1", CVAR_USERINFO), null, "invalid info cvar name should be rejected");
assert.equal(Cvar_Get(cvar, "good", "1;2", CVAR_USERINFO), null, "invalid info cvar value should be rejected");
assert.deepEqual(validationErrors, ["name", "value"], "info validation hooks mismatch");

const skill = Cvar_Get(cvar, "skill", "1", CVAR_ARCHIVE);
assert.ok(skill, "skill cvar should be created");
assert.equal(Cvar_VariableString(cvar, "skill"), "1", "VariableString mismatch");
assert.equal(Cvar_VariableValue(cvar, "skill"), 1, "VariableValue mismatch");
assert.equal(Cvar_CompleteVariable(cvar, "ski"), "skill", "CompleteVariable prefix mismatch");
assert.equal(Cvar_CompleteVariable(cvar, "skill"), "skill", "CompleteVariable exact mismatch");
assert.equal(Cvar_CompleteVariable(cvar, ""), null, "empty completion should fail");

const skillAgain = Cvar_Get(cvar, "skill", "2", CVAR_SERVERINFO);
assert.equal(skillAgain, skill, "existing cvar lookup should return same object");
assert.equal((skill?.flags ?? 0) & CVAR_SERVERINFO, CVAR_SERVERINFO, "existing flags should be ORed");

const rate = Cvar_FullSet(cvar, "rate", "25000", CVAR_USERINFO | CVAR_ARCHIVE);
assert.ok(rate, "rate cvar should be created");
assert.equal(Cvar_VariableValue(cvar, "rate"), 25000, "FullSet numeric parse mismatch");
assert.equal(cvar.userinfo_modified, false, "creating userinfo cvar should not mark modified flag yet");

Cvar_Set(cvar, "rate", "30000");
assert.equal(Cvar_VariableString(cvar, "rate"), "30000", "Cvar_Set mismatch");
assert.equal(cvar.userinfo_modified, true, "userinfo modification flag mismatch");

const fraglimit = Cvar_Get(cvar, "fraglimit", "10", 0);
assert.ok(fraglimit, "fraglimit cvar should be created");
Cvar_SetValue(cvar, "fraglimit", 20);
assert.equal(Cvar_VariableString(cvar, "fraglimit"), "20", "integer SetValue formatting mismatch");
Cvar_SetValue(cvar, "fraglimit", 2.5);
assert.equal(Cvar_VariableString(cvar, "fraglimit"), "2.5", "float SetValue formatting mismatch");

const cheat = Cvar_Get(cvar, "cheats", "0", CVAR_NOSET);
assert.ok(cheat, "write-protected cvar should be created");
Cvar_Set(cvar, "cheats", "1");
assert.equal(Cvar_VariableString(cvar, "cheats"), "0", "NOSET cvar should not change");
assert.deepEqual(writeProtected, ["cheats"], "write-protected hook mismatch");

const game = Cvar_Get(cvar, "game", "baseq2", CVAR_LATCH);
assert.ok(game, "latched game cvar should be created");
Cvar_SetServerState(cvar, 1);
Cvar_Set(cvar, "game", "rogue");
assert.equal(game?.string, "baseq2", "latched cvar should not change immediately while server is running");
assert.equal(game?.latched_string, "rogue", "latched cvar should keep pending value");
assert.deepEqual(latchedChanges, ["game"], "latched change hook mismatch");

Cvar_GetLatchedVars(cvar);
assert.equal(game?.string, "rogue", "GetLatchedVars should apply latched value");
assert.equal(game?.latched_string, null, "latched string should be cleared after apply");
assert.deepEqual(gameDirChanges, ["rogue"], "game dir change hook mismatch");
assert.equal(autoexecCount, 1, "autoexec hook mismatch after latched game change");

Cvar_SetServerState(cvar, 0);
Cvar_Set(cvar, "game", "xatrix");
assert.equal(game?.string, "xatrix", "unlatched game change should apply immediately when server is idle");
assert.deepEqual(gameDirChanges, ["rogue", "xatrix"], "immediate game dir hook mismatch");
assert.equal(autoexecCount, 2, "autoexec hook mismatch after immediate game change");

Cvar_SetServerState(cvar, 1);
Cvar_Set(cvar, "game", "ctf");
assert.equal(game?.latched_string, "ctf", "second latched value should replace previous pending one");
Cvar_ForceSet(cvar, "game", "baseq2");
assert.equal(game?.latched_string, null, "ForceSet should clear latched string");
assert.equal(game?.string, "baseq2", "ForceSet should update value immediately");

assert.equal(Cvar_BitInfo(cvar, CVAR_USERINFO), "\\rate\\30000", "userinfo BitInfo mismatch");
assert.equal(Cvar_Userinfo(cvar), "\\rate\\30000", "Userinfo mismatch");
assert.equal(Cvar_Serverinfo(cvar), "\\skill\\1", "Serverinfo mismatch");

const archiveOutput = Cvar_WriteVariables(cvar);
assert.equal(
  archiveOutput.includes('set skill "1"\n') && archiveOutput.includes('set rate "30000"\n'),
  true,
  "WriteVariables should serialize archived cvars"
);

Cmd_TokenizeString(cmd, "rate", true);
const inspect = Cvar_Command(cvar, cmd);
assert.deepEqual(inspect, { handled: true, output: "\"rate\" is \"30000\"" }, "Cvar_Command inspect mismatch");

Cmd_TokenizeString(cmd, "rate 32000", true);
const mutate = Cvar_Command(cvar, cmd);
assert.deepEqual(mutate, { handled: true }, "Cvar_Command set mismatch");
assert.equal(Cvar_VariableString(cvar, "rate"), "32000", "Cvar_Command should update value");

Cmd_TokenizeString(cmd, "missing", true);
assert.deepEqual(Cvar_Command(cvar, cmd), { handled: false }, "Cvar_Command fallback mismatch");

const list = Cvar_List_f(cvar);
assert.equal(list[list.length - 1], `${list.length - 1} cvars`, "cvar list footer mismatch");
assert.equal(list.some((line) => line.includes('rate "32000"')), true, "cvar list contents mismatch");
assert.ok(Cvar_FindVar(cvar, "rate"), "FindVar should locate existing cvar");

Cvar_Init(cvar, cmd);
Cmd_ExecuteString(cmd, "set hand 1 u");
assert.equal(Cvar_VariableString(cvar, "hand"), "1", "set command should create userinfo cvar");
Cmd_ExecuteString(cmd, "cvarlist");
assert.equal(printed.some((line) => line.includes('hand "1"')), true, "cvarlist command should print cvars");

console.log("quake2-cvar: ok");
