/**
 * File: quake2-full-game-gameplay-commands.ts
 * Purpose: Verify that full-game gameplay/cheat commands are routed through the source client/server/game path.
 *
 * This file is not a direct source port.
 * It protects `full-game.html` from growing web-only implementations of player commands such as `god` or `noclip`.
 *
 * Dependencies:
 * - packages/client/src/main.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/messages.ts
 */

import { strict as assert } from "node:assert";

import {
  Cmd_ExecuteString,
  Cvar_Command,
  MSG_BeginReading,
  MSG_ReadByte,
  MSG_ReadString,
  clc_ops_e,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  CL_InitLocal,
  Cmd_ForwardToServer as CL_Cmd_ForwardToServer,
  createClientMainContext
} from "../../packages/client/src/main.js";
import {
  connstate_t,
  createClientRuntime
} from "../../packages/client/src/types.js";

const printed: string[] = [];
const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const mainContext = createClientMainContext(client, cmd, cvar);

CL_InitLocal(mainContext, {
  onPrint: (message) => {
    printed.push(message);
  },
  onWriteConfigFile: () => false
});

cmd.hooks.executeUnknownCommand = () => {
  const result = Cvar_Command(cvar, cmd);
  if (result.output) {
    printed.push(result.output);
  }
  if (result.handled) {
    return true;
  }

  CL_Cmd_ForwardToServer(mainContext, {
    onPrint: (message) => {
      printed.push(message);
    }
  });
  return true;
};

for (const name of ["god", "noclip", "notarget", "give"]) {
  const registration = cmd.cmd_functions.find((entry) => entry.name === name);
  assert.ok(registration, `${name} should be registered by CL_InitLocal`);
  assert.equal(registration.fn, null, `${name} should be a client-forwarded null command, not a web handler`);
}

assert.equal(cmd.cmd_functions.some((entry) => entry.name === "fly"), false, "fly should not be registered in the web command bridge");

Cmd_ExecuteString(cmd, "god");
assert.equal(printed.at(-1), "Can't \"cmd\", not connected", "disconnected god should not run a local web cheat");
assert.equal(client.cls.netchan.message.cursize, 0, "disconnected god should not write a server command");

client.cls.state = connstate_t.ca_active;
forwardAndAssert("god", "god");
forwardAndAssert("noclip", "noclip");
forwardAndAssert("give all", "give all");
forwardAndAssert("fly 1", "fly 1");

console.log("quake2-full-game-gameplay-commands: ok");

function forwardAndAssert(command: string, expected: string): void {
  client.cls.netchan.message.cursize = 0;
  client.cls.netchan.message.readcount = 0;

  Cmd_ExecuteString(cmd, command);

  MSG_BeginReading(client.cls.netchan.message);
  assert.equal(MSG_ReadByte(client.cls.netchan.message), clc_ops_e.clc_stringcmd, `${command} should write clc_stringcmd`);
  assert.equal(MSG_ReadString(client.cls.netchan.message), expected, `${command} forwarded text mismatch`);
}
