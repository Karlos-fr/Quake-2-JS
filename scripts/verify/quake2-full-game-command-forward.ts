/**
 * File: quake2-full-game-command-forward.ts
 * Purpose: Verify the `full-game` console fallback for unknown commands and server forwarding.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for the command fallback policy used by `apps/web/src/full-game.ts`.
 *
 * Dependencies:
 * - packages/client/src/main.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/cvar.ts
 */

import { strict as assert } from "node:assert";

import {
  Cmd_ExecuteString,
  Cvar_Command,
  Cvar_Get,
  MSG_BeginReading,
  MSG_ReadByte,
  MSG_ReadString,
  clc_ops_e,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  Cmd_ForwardToServer as CL_Cmd_ForwardToServer,
  createClientMainContext
} from "../../packages/client/src/main.js";
import {
  connstate_t,
  createClientRuntime
} from "../../packages/client/src/types.js";

const printed: string[] = [];
const client = createClientRuntime();
const cvar = createCvarRuntime();
const cmd = createCommandRuntime({
  onPrint: (line) => {
    printed.push(line);
  }
});
const mainContext = createClientMainContext(client, cmd, cvar);

cmd.hooks.executeUnknownCommand = (_name, text) => {
  const result = Cvar_Command(cvar, cmd);
  if (result.output) {
    printed.push(result.output);
  }
  if (result.handled) {
    return true;
  }

  CL_Cmd_ForwardToServer(mainContext, {
    onPrint: (line) => {
      printed.push(line);
    }
  });
  return true;
};

Cvar_Get(cvar, "test_fallback_cvar", "42", 0);
Cmd_ExecuteString(cmd, "test_fallback_cvar");
assert.equal(printed.at(-1), "\"test_fallback_cvar\" is \"42\"", "unknown-command fallback should preserve Cvar_Command");
assert.equal(client.cls.netchan.message.cursize, 0, "cvar fallback should not forward to server");

Cmd_ExecuteString(cmd, "fly");
assert.equal(printed.at(-1), "Unknown command \"fly\"", "disconnected unknown command should print through the console path");
assert.equal(client.cls.netchan.message.cursize, 0, "disconnected unknown command should not write a server command");

client.cls.state = connstate_t.ca_active;
Cmd_ExecuteString(cmd, "fly 1");
MSG_BeginReading(client.cls.netchan.message);
assert.equal(MSG_ReadByte(client.cls.netchan.message), clc_ops_e.clc_stringcmd, "active unknown command should write clc_stringcmd");
assert.equal(MSG_ReadString(client.cls.netchan.message), "fly 1", "active unknown command should forward the full command line");

console.log("quake2-full-game-command-forward: ok");
