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
  Cvar_Set_f,
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
assert.equal(Cvar_InfoValidate("name=value"), true, "equals should not invalidate cvar info strings");

assert.equal(Cvar_Get(cvar, "name\\bad", "1", CVAR_USERINFO), null, "invalid info cvar name should be rejected");
assert.equal(Cvar_Get(cvar, "good", "1;2", CVAR_USERINFO), null, "invalid info cvar value should be rejected");
assert.deepEqual(validationErrors, ["name", "value"], "info validation hooks mismatch");
assert.deepEqual(
  printed,
  ["invalid info cvar name\n", "invalid info cvar value\n"],
  "Cvar_Get invalid info diagnostics should match Com_Printf paths"
);
assert.equal(cvar.cvar_vars.length, 0, "invalid info cvars should not be linked");

assert.equal(Cvar_FindVar(cvar, "missing"), null, "FindVar should return null before creation");
assert.equal(Cvar_VariableString(cvar, "missing"), "", "VariableString should return empty string for missing cvars");
assert.equal(Cvar_VariableValue(cvar, "missing"), 0, "VariableValue should return zero for missing cvars");
assert.equal(Cvar_Get(cvar, "missing_default", null, 0), null, "Cvar_Get should reject null defaults after lookup miss");

const skill = Cvar_Get(cvar, "skill", "1", CVAR_ARCHIVE);
assert.ok(skill, "skill cvar should be created");
assert.equal(skill.name, "skill", "created cvar name mismatch");
assert.equal(skill.string, "1", "created cvar string mismatch");
assert.equal(skill.modified, true, "created cvar should start modified like the C port");
assert.equal(skill.value, 1, "created cvar numeric value mismatch");
assert.equal(skill.flags, CVAR_ARCHIVE, "created cvar flags mismatch");
assert.equal(Cvar_VariableString(cvar, "skill"), "1", "VariableString mismatch");
assert.equal(Cvar_VariableValue(cvar, "skill"), 1, "VariableValue mismatch");
assert.equal(Cvar_CompleteVariable(cvar, "ski"), "skill", "CompleteVariable prefix mismatch");
assert.equal(Cvar_CompleteVariable(cvar, "skill"), "skill", "CompleteVariable exact mismatch");
assert.equal(Cvar_CompleteVariable(cvar, ""), null, "empty completion should fail");
assert.equal(Cvar_FindVar(cvar, "Skill"), null, "FindVar should be case-sensitive like strcmp");

const skillPrefix = Cvar_Get(cvar, "skill_speed", "7", 0);
assert.ok(skillPrefix, "second skill-prefixed cvar should be created");
assert.equal(cvar.cvar_vars[0], skillPrefix, "new cvars should be linked at the head of cvar_vars");
assert.equal(Cvar_CompleteVariable(cvar, "skill"), "skill", "exact completion should beat earlier partial matches");
assert.equal(Cvar_CompleteVariable(cvar, "skill_"), "skill_speed", "partial completion should preserve cvar_vars order");

const textual = Cvar_Get(cvar, "skill_label", "hard", 0);
assert.ok(textual, "textual cvar should be created");
assert.equal(Cvar_VariableValue(cvar, "skill_label"), 0, "non-numeric cvar value should parse like atof fallback");

const skillAgain = Cvar_Get(cvar, "skill", "2", CVAR_SERVERINFO);
assert.equal(skillAgain, skill, "existing cvar lookup should return same object");
assert.equal(skill?.string, "1", "existing cvar lookup should not replace the current value");
assert.equal((skill?.flags ?? 0) & CVAR_SERVERINFO, CVAR_SERVERINFO, "existing flags should be ORed");

const rate = Cvar_FullSet(cvar, "rate", "25000", CVAR_USERINFO | CVAR_ARCHIVE);
assert.ok(rate, "rate cvar should be created");
assert.equal(Cvar_VariableValue(cvar, "rate"), 25000, "FullSet numeric parse mismatch");
assert.equal(cvar.userinfo_modified, false, "creating userinfo cvar should not mark modified flag yet");

Cvar_Set(cvar, "rate", "30000");
assert.equal(Cvar_VariableString(cvar, "rate"), "30000", "Cvar_Set mismatch");
assert.equal(cvar.userinfo_modified, true, "userinfo modification flag mismatch");

const beforeInvalidSetPrints = printed.length;
Cvar_Set(cvar, "rate", "30;000");
assert.equal(Cvar_VariableString(cvar, "rate"), "30000", "invalid userinfo Cvar_Set should preserve old value");
assert.equal(validationErrors.at(-1), "value", "Cvar_Set invalid info hook mismatch");
assert.equal(printed[beforeInvalidSetPrints], "invalid info cvar value\n", "Cvar_Set invalid info diagnostic mismatch");

const fraglimit = Cvar_Get(cvar, "fraglimit", "10", 0);
assert.ok(fraglimit, "fraglimit cvar should be created");
Cvar_SetValue(cvar, "fraglimit", 20);
assert.equal(Cvar_VariableString(cvar, "fraglimit"), "20", "integer SetValue formatting mismatch");
Cvar_SetValue(cvar, "fraglimit", 2.5);
assert.equal(Cvar_VariableString(cvar, "fraglimit"), "2.500000", "float SetValue formatting mismatch");

const cheat = Cvar_Get(cvar, "cheats", "0", CVAR_NOSET);
assert.ok(cheat, "write-protected cvar should be created");
Cvar_Set(cvar, "cheats", "1");
assert.equal(Cvar_VariableString(cvar, "cheats"), "0", "NOSET cvar should not change");
assert.deepEqual(writeProtected, ["cheats"], "write-protected hook mismatch");
assert.equal(printed.at(-1), "cheats is write protected.\n", "NOSET diagnostic mismatch");

const game = Cvar_Get(cvar, "game", "baseq2", CVAR_LATCH);
assert.ok(game, "latched game cvar should be created");
Cvar_SetServerState(cvar, 1);
Cvar_Set(cvar, "game", "rogue");
assert.equal(game?.string, "baseq2", "latched cvar should not change immediately while server is running");
assert.equal(game?.latched_string, "rogue", "latched cvar should keep pending value");
assert.deepEqual(latchedChanges, ["game"], "latched change hook mismatch");
assert.equal(printed.at(-1), "game will be changed for next game.\n", "latched diagnostic mismatch");

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

const infoCvars = createCvarRuntime();
assert.equal(infoCvars.userinfo_modified, false, "userinfo_modified should default to false like the C global");
Cvar_Get(infoCvars, "archive_only", "ignored", CVAR_ARCHIVE);
Cvar_Get(infoCvars, "hostname", "quake2js", CVAR_SERVERINFO);
Cvar_Get(infoCvars, "name", "Player", CVAR_USERINFO);
Cvar_Get(infoCvars, "hand", "2", CVAR_USERINFO | CVAR_ARCHIVE);
Cvar_Get(infoCvars, "protocol", "34", CVAR_SERVERINFO | CVAR_NOSET);
Cvar_Get(infoCvars, "empty", "", CVAR_USERINFO);
assert.equal(
  Cvar_BitInfo(infoCvars, CVAR_USERINFO),
  "\\hand\\2\\name\\Player",
  "Cvar_BitInfo should include only matching userinfo cvars in cvar_vars order and skip empty values"
);
assert.equal(Cvar_Userinfo(infoCvars), "\\hand\\2\\name\\Player", "Cvar_Userinfo should delegate to Cvar_BitInfo(CVAR_USERINFO)");
assert.equal(
  Cvar_BitInfo(infoCvars, CVAR_SERVERINFO),
  "\\protocol\\34\\hostname\\quake2js",
  "Cvar_BitInfo should include only matching serverinfo cvars in cvar_vars order"
);
assert.equal(
  Cvar_Serverinfo(infoCvars),
  "\\protocol\\34\\hostname\\quake2js",
  "Cvar_Serverinfo should delegate to Cvar_BitInfo(CVAR_SERVERINFO)"
);
assert.equal(Cvar_BitInfo(infoCvars, CVAR_LATCH), "", "Cvar_BitInfo should return an empty info string when no cvar matches");
Cvar_Set(infoCvars, "hand", "1");
assert.equal(infoCvars.userinfo_modified, true, "userinfo_modified should be raised when an existing userinfo cvar changes");
assert.equal(Cvar_Userinfo(infoCvars), "\\hand\\1\\name\\Player", "Cvar_Userinfo should reflect later userinfo mutations");

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
assert.equal(cvar.userinfo_modified, true, "Cvar_Command should use Cvar_Set for mutations");

Cmd_TokenizeString(cmd, "missing", true);
assert.deepEqual(Cvar_Command(cvar, cmd), { handled: false }, "Cvar_Command fallback mismatch");

Cmd_TokenizeString(cmd, "set", true);
assert.equal(Cvar_Set_f(cvar, cmd), "usage: set <variable> <value> [u / s]", "Cvar_Set_f usage mismatch");

Cmd_TokenizeString(cmd, "set team red x", true);
assert.equal(Cvar_Set_f(cvar, cmd), "flags can only be 'u' or 's'", "Cvar_Set_f invalid flag mismatch");
assert.equal(Cvar_FindVar(cvar, "team"), null, "invalid Cvar_Set_f flag should not create the cvar");

Cmd_TokenizeString(cmd, "set team red s", true);
assert.equal(Cvar_Set_f(cvar, cmd), undefined, "Cvar_Set_f serverinfo branch should not return output");
assert.equal(Cvar_VariableString(cvar, "team"), "red", "Cvar_Set_f serverinfo branch should create the cvar");
assert.equal((Cvar_FindVar(cvar, "team")?.flags ?? 0) & CVAR_SERVERINFO, CVAR_SERVERINFO, "Cvar_Set_f serverinfo flag mismatch");

const list = Cvar_List_f(cvar);
assert.equal(list[list.length - 1], `${list.length - 1} cvars`, "cvar list footer mismatch");
assert.equal(list.some((line) => line.includes('rate "32000"')), true, "cvar list contents mismatch");
assert.ok(Cvar_FindVar(cvar, "rate"), "FindVar should locate existing cvar");

Cvar_Init(cvar, cmd);
Cmd_ExecuteString(cmd, "set hand 1 u");
assert.equal(Cvar_VariableString(cvar, "hand"), "1", "set command should create userinfo cvar");
Cmd_ExecuteString(cmd, "set hand 2 z");
assert.equal(printed.at(-1), "flags can only be 'u' or 's'", "set command invalid flag should print through Cvar_Init");
cmd.hooks.executeUnknownCommand = () => {
  const result = Cvar_Command(cvar, cmd);
  if (result.output !== undefined) {
    printed.push(result.output);
  }
  return result.handled;
};
Cmd_ExecuteString(cmd, "rate");
assert.equal(printed.at(-1), "\"rate\" is \"32000\"", "unknown command fallback should inspect cvars");
Cmd_ExecuteString(cmd, "rate 33000");
assert.equal(Cvar_VariableString(cvar, "rate"), "33000", "unknown command fallback should mutate cvars");
Cmd_ExecuteString(cmd, "cvarlist");
assert.equal(printed.some((line) => line.includes('hand "1"')), true, "cvarlist command should print cvars");

const archiveListCvar = createCvarRuntime();
const archivedFirst = Cvar_Get(archiveListCvar, "archived_first", "one", CVAR_ARCHIVE);
const transient = Cvar_Get(archiveListCvar, "transient", "skip", 0);
const userArchived = Cvar_Get(archiveListCvar, "user_archived", "two", CVAR_USERINFO | CVAR_ARCHIVE);
const protectedVar = Cvar_Get(archiveListCvar, "protected_var", "lock", CVAR_NOSET);
const latchedVar = Cvar_Get(archiveListCvar, "latched_var", "later", CVAR_LATCH);
assert.ok(archivedFirst && transient && userArchived && protectedVar && latchedVar, "isolated list cvars should be created");
assert.deepEqual(
  Cvar_WriteVariables(archiveListCvar).split("\n").filter(Boolean),
  [
    'set user_archived "two"',
    'set archived_first "one"'
  ],
  "WriteVariables should append archive cvars only in cvar_vars traversal order"
);
assert.deepEqual(
  Cvar_List_f(archiveListCvar),
  [
    "   L latched_var \"later\"",
    "   - protected_var \"lock\"",
    "*U   user_archived \"two\"",
    "     transient \"skip\"",
    "*    archived_first \"one\"",
    "5 cvars"
  ],
  "Cvar_List_f should match archive/user/server/protection flag formatting and count every cvar"
);

console.log("quake2-cvar: ok");
