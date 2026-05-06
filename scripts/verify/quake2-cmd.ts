/**
 * File: quake2-cmd.ts
 * Purpose: Verify the strict TypeScript port attached to `qcommon/cmd.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for the command buffer, tokenization and registry path.
 *
 * Dependencies:
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/common.ts
 */

import { strict as assert } from "node:assert";

import {
  ALIAS_LOOP_COUNT,
  Cbuf_AddEarlyCommands,
  Cbuf_AddLateCommands,
  Cbuf_AddText,
  Cbuf_CopyToDefer,
  Cbuf_Execute,
  Cbuf_ExecuteText,
  Cbuf_InsertFromDefer,
  Cbuf_InsertText,
  Cmd_AddCommand,
  Cmd_Argc,
  Cmd_Args,
  Cmd_Argv,
  Cmd_CompleteCommand,
  Cmd_ExecuteString,
  Cmd_Exists,
  Cmd_Init,
  Cmd_RemoveCommand,
  Cmd_TokenizeString,
  EXEC_APPEND,
  EXEC_INSERT,
  EXEC_NOW,
  MAX_ALIAS_NAME,
  createCommandRuntime
} from "../../packages/qcommon/src/cmd.js";
import { COM_Argv, COM_InitArgv, createCommonRuntime } from "../../packages/qcommon/src/common.js";

verifyCommandBufferExecution();
verifyWaitAndDefer();
verifyStartupCommandInjection();
verifyTokenizationAndMacroExpansion();
verifyCommandRegistryAndCompletion();
verifyAliasExecution();
verifyBuiltinCommandsAndForwarding();

console.log("Verification cmd: OK");

function verifyCommandBufferExecution(): void {
  const executed: string[] = [];
  const runtime = createCommandRuntime({
    executeUnknownCommand: (name) => {
      executed.push(name);
      return true;
    }
  });

  Cbuf_AddText(runtime, "first;\"semi;inside\";second\nthird");
  Cbuf_Execute(runtime);

  assert.deepEqual(
    executed,
    ["first", "semi;inside", "second", "third"],
    "Cbuf_Execute split mismatch"
  );

  Cbuf_ExecuteText(runtime, EXEC_NOW, "nowcmd");
  assert.equal(executed.at(-1), "nowcmd", "EXEC_NOW mismatch");

  Cbuf_ExecuteText(runtime, EXEC_INSERT, "inserted\n");
  Cbuf_Execute(runtime);
  assert.equal(executed.at(-1), "inserted", "EXEC_INSERT mismatch");

  Cbuf_ExecuteText(runtime, EXEC_APPEND, "appended\n");
  Cbuf_Execute(runtime);
  assert.equal(executed.at(-1), "appended", "EXEC_APPEND mismatch");

  const printed: string[] = [];
  const overflowRuntime = createCommandRuntime({
    onPrint: (line) => printed.push(line),
    executeUnknownCommand: (name) => {
      executed.push(name);
      return true;
    }
  });
  Cbuf_AddText(overflowRuntime, "x".repeat(8191));
  Cbuf_AddText(overflowRuntime, "overflow\n");
  assert.equal(printed[0], "Cbuf_AddText: overflow\n", "Cbuf_AddText overflow print mismatch");
  Cbuf_Execute(overflowRuntime);
  assert.equal(executed.includes("overflow"), false, "Cbuf_AddText overflow should not append text");
}

function verifyWaitAndDefer(): void {
  const runtime = createCommandRuntime();
  const executed: string[] = [];

  Cmd_AddCommand(runtime, "record", () => {
    executed.push(Cmd_Argv(runtime, 1));
  });
  Cmd_Init(runtime);

  Cbuf_AddText(runtime, "record one\nwait\nrecord two\n");
  Cbuf_Execute(runtime);
  assert.deepEqual(executed, ["one"], "wait first pass mismatch");
  Cbuf_Execute(runtime);
  assert.deepEqual(executed, ["one", "two"], "wait second pass mismatch");

  Cbuf_AddText(runtime, "record kept\n");
  Cbuf_CopyToDefer(runtime);
  assert.equal(runtime.cmd_text.cursize, 0, "Cbuf_CopyToDefer clear mismatch");
  Cbuf_InsertFromDefer(runtime);
  Cbuf_Execute(runtime);
  assert.deepEqual(executed, ["one", "two", "kept"], "Cbuf_InsertFromDefer mismatch");

  Cbuf_AddText(runtime, "record tail\n");
  Cbuf_InsertText(runtime, "record head\n");
  Cbuf_Execute(runtime);
  assert.deepEqual(executed.slice(-2), ["head", "tail"], "Cbuf_InsertText prepend mismatch");
}

function verifyStartupCommandInjection(): void {
  const common = createCommonRuntime();
  COM_InitArgv(common, ["quake2", "+set", "game", "rogue", "+map", "base1", "+exec", "autoexec.cfg"]);

  const earlyRuntime = createCommandRuntime();
  Cbuf_AddEarlyCommands(earlyRuntime, common, true);
  assert.equal(readBuffer(earlyRuntime), "set game rogue\n", "Cbuf_AddEarlyCommands mismatch");
  assert.equal(COM_Argv(common, 1), "", "Cbuf_AddEarlyCommands clear mismatch");

  const lateRuntime = createCommandRuntime();
  assert.equal(Cbuf_AddLateCommands(lateRuntime, common), true, "Cbuf_AddLateCommands return mismatch");
  assert.equal(readBuffer(lateRuntime), "map base1 \nexec autoexec.cfg\n", "Cbuf_AddLateCommands payload mismatch");
}

function verifyTokenizationAndMacroExpansion(): void {
  const runtime = createCommandRuntime({
    expandMacroToken: (token) => {
      if (token === "name") {
        return "quake2";
      }
      if (token === "nested") {
        return "$name";
      }
      if (token === "loop") {
        return "$loop";
      }
      return "";
    }
  });

  Cmd_TokenizeString(runtime, "echo $nested tail", true);
  assert.equal(Cmd_Argc(runtime), 3, "Cmd_TokenizeString argc mismatch");
  assert.equal(Cmd_Argv(runtime, 1), "quake2", "recursive macro expansion mismatch");
  assert.equal(Cmd_Args(runtime), "quake2 tail", "Cmd_Args mismatch");

  Cmd_TokenizeString(runtime, "echo \"$name\" tail", true);
  assert.equal(Cmd_Argv(runtime, 1), "$name", "quoted macro should not expand");

  Cmd_TokenizeString(runtime, "echo $loop", true);
  assert.equal(Cmd_Argc(runtime), 0, "macro loop should discard line");

  Cmd_TokenizeString(runtime, "echo \"unterminated", true);
  assert.equal(Cmd_Argc(runtime), 0, "unmatched quote should discard line");
}

function verifyCommandRegistryAndCompletion(): void {
  const runtime = createCommandRuntime({
    isKnownVariable: (name) => name === "name"
  });

  Cmd_AddCommand(runtime, "god", () => {});
  Cmd_AddCommand(runtime, "give", () => {});

  assert.equal(Cmd_Exists(runtime, "god"), true, "Cmd_Exists mismatch");
  assert.equal(Cmd_CompleteCommand(runtime, "god"), "god", "Cmd_CompleteCommand exact mismatch");
  assert.equal(Cmd_CompleteCommand(runtime, "gi"), "give", "Cmd_CompleteCommand partial mismatch");

  assert.throws(
    () => Cmd_AddCommand(runtime, "name", () => {}),
    /already defined as a var/,
    "Cmd_AddCommand cvar guard mismatch"
  );

  Cmd_RemoveCommand(runtime, "god");
  assert.equal(Cmd_Exists(runtime, "god"), false, "Cmd_RemoveCommand mismatch");
}

function verifyAliasExecution(): void {
  const printed: string[] = [];
  const runtime = createCommandRuntime({
    onPrint: (line) => printed.push(line),
    executeUnknownCommand: () => false,
    forwardToServer: (text) => printed.push(`forward:${text}`)
  });

  Cmd_Init(runtime);
  Cmd_ExecuteString(runtime, "alias hi echo hello world");
  Cmd_ExecuteString(runtime, "hi");
  Cbuf_Execute(runtime);
  assert.deepEqual(printed, ["hello world"], "Cmd_Alias_f execution mismatch");

  printed.length = 0;
  Cmd_ExecuteString(runtime, `alias ${"a".repeat(MAX_ALIAS_NAME)} echo no`);
  assert.equal(printed[0], "Alias name is too long", "Cmd_Alias_f MAX_ALIAS_NAME guard mismatch");
  assert.equal(runtime.cmd_aliases.some((alias) => alias.name.length >= MAX_ALIAS_NAME), false, "oversized alias should not register");

  printed.length = 0;
  Cmd_ExecuteString(runtime, "alias");
  assert.equal(printed[0], "hi : echo hello world\n", "Cmd_Alias_f listing mismatch");

  const loopRuntime = createCommandRuntime();
  Cmd_Init(loopRuntime);
  Cmd_ExecuteString(loopRuntime, "alias loop loop");
  Cmd_ExecuteString(loopRuntime, "loop");
  Cbuf_Execute(loopRuntime);
  assert.equal(loopRuntime.alias_count, ALIAS_LOOP_COUNT, "alias loop guard mismatch");
}

function verifyBuiltinCommandsAndForwarding(): void {
  const printed: string[] = [];
  let loadedPath = "";
  let forwarded = "";

  const runtime = createCommandRuntime({
    loadTextFile: (path) => {
      loadedPath = path;
      return "echo fromexec\n";
    },
    onPrint: (line) => printed.push(line),
    forwardToServer: (text) => {
      forwarded = text;
    }
  });

  Cmd_Init(runtime);

  Cmd_ExecuteString(runtime, "cmdlist");
  assert.equal(printed.includes("cmdlist"), true, "cmdlist contents mismatch");
  assert.equal(printed.at(-1), "5 commands", "cmdlist count mismatch");

  printed.length = 0;
  Cmd_ExecuteString(runtime, "exec autoexec.cfg");
  assert.equal(loadedPath, "autoexec.cfg", "Cmd_Exec_f path mismatch");
  assert.equal(printed[0], "execing autoexec.cfg", "Cmd_Exec_f print mismatch");
  Cbuf_Execute(runtime);
  assert.equal(printed.at(-1), "fromexec", "Cmd_Exec_f insertion mismatch");

  printed.length = 0;
  Cmd_ExecuteString(runtime, "echo alpha beta");
  assert.equal(printed[0], "alpha beta", "Cmd_Echo_f mismatch");

  Cmd_TokenizeString(runtime, "god", true);
  forwarded = "";
  Cbuf_ExecuteText(runtime, EXEC_NOW, "noclip");
  assert.equal(forwarded, "noclip", "unknown command forwarding mismatch");

  const nullForwardRuntime = createCommandRuntime({
    forwardToServer: (text) => {
      forwarded = text;
    }
  });
  Cmd_AddCommand(nullForwardRuntime, "god", null);
  Cmd_ExecuteString(nullForwardRuntime, "god");
  assert.equal(forwarded, "cmd god", "null command recursion mismatch");
}

function readBuffer(runtime: ReturnType<typeof createCommandRuntime>): string {
  return new TextDecoder("latin1").decode(runtime.cmd_text.data.subarray(0, runtime.cmd_text.cursize));
}
