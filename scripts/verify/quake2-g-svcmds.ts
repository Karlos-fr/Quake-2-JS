/**
 * File: quake2-g-svcmds.ts
 * Purpose: Verify the first TypeScript port of `game/g_svcmds.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for packet filters and `ServerCommand` dispatch.
 *
 * Dependencies:
 * - packages/game/src/g_svcmds.ts
 */

import { strict as assert } from "node:assert";

import type { cvar_t } from "../../packages/qcommon/src/index.js";
import { PRINT_HIGH } from "../../packages/qcommon/src/index.js";
import {
  MAX_IPFILTERS,
  SV_FilterPacket,
  ServerCommand,
  createGameServerCommandState,
  type GameServerCommandContext
} from "../../packages/game/src/g_svcmds.js";

const state = createGameServerCommandState();
const prints: string[] = [];
const writes = new Map<string, string>();
const command = { argv: ["sv"], args: "" };

const cvars = new Map<string, cvar_t>([
  ["filterban", createCvar("filterban", "1")],
  ["game", createCvar("game", "baseq2")]
]);

const context: GameServerCommandContext = {
  gi: {
    argc: () => command.argv.length,
    argv: (index) => command.argv[index] ?? "",
    args: () => command.args,
    cprintf: (_ent, printLevel, fmt, ...args) => {
      assert.equal(printLevel, PRINT_HIGH, "g_svcmds uses PRINT_HIGH for all admin output");
      prints.push(formatPrintf(fmt, args));
    },
    cvar: (name, value) => {
      let variable = cvars.get(name);
      if (!variable) {
        variable = createCvar(name, value);
        cvars.set(name, variable);
      }
      return variable;
    }
  },
  writeFile: (path, contents) => {
    writes.set(path, contents);
    return true;
  }
};

runCommand(["sv", "test"]);
assert.equal(prints.pop(), "Svcmd_Test_f()\n", "sv test output mismatch");

runCommand(["sv", "addip", "192.246.40"]);
assert.equal(state.numipfilters, 1, "addip must grow the filter list");
assert.equal(SV_FilterPacket(state, context, "192.246.40.7:27910"), true, "matching addresses must be filtered when filterban=1");
assert.equal(SV_FilterPacket(state, context, "192.246.41.7:27910"), false, "non-matching addresses must pass when filterban=1");

runCommand(["sv", "listip"]);
assert.deepEqual(
  prints.splice(0),
  ["Filter list:\n", "192.246. 40.  0\n".replace("192", "192").replace("246", "246")],
  "listip output mismatch"
);

runCommand(["sv", "removeip", "192.246.40"]);
assert.equal(prints.pop(), "Removed.\n", "removeip must acknowledge removal");
assert.equal(state.numipfilters, 0, "removeip must shrink the filter list");

runCommand(["sv", "removeip", "192.246.40"]);
assert.equal(prints.pop(), "Didn't find 192.246.40.\n", "removeip missing output mismatch");

runCommand(["sv", "addip", "10"]);
runCommand(["sv", "writeip"]);
assert.equal(prints.pop(), "Writing baseq2/listip.cfg.\n", "writeip announce mismatch");
assert.equal(
  writes.get("baseq2/listip.cfg"),
  "set filterban 1\nsv addip 10.0.0.0\n",
  "writeip contents mismatch"
);

cvars.set("filterban", createCvar("filterban", "0"));
assert.equal(SV_FilterPacket(state, context, "10.1.2.3:27910"), false, "matching addresses must pass when filterban=0");
assert.equal(SV_FilterPacket(state, context, "11.1.2.3:27910"), true, "non-matching addresses must be rejected when filterban=0");

runCommand(["sv", "bogus"]);
assert.equal(prints.pop(), "Unknown server command \"bogus\"\n", "unknown command mismatch");

runCommand(["sv", "addip", "bad.ip"]);
assert.equal(state.numipfilters, 2, "failed addip must still consume the newly allocated slot like the original code");
assert.equal(prints.splice(0).join(""), "Bad filter address: bad.ip\n", "bad addip diagnostic mismatch");

assert.equal(MAX_IPFILTERS, 1024, "MAX_IPFILTERS mismatch");

console.log("quake2-g-svcmds: ok");

function runCommand(argv: string[]): void {
  command.argv = argv.slice();
  command.args = argv.slice(1).join(" ");
  ServerCommand(state, context);
}

function createCvar(name: string, stringValue: string): cvar_t {
  return {
    name,
    string: stringValue,
    latched_string: null,
    flags: 0,
    modified: false,
    value: Number.parseFloat(stringValue) || 0
  };
}

function formatPrintf(fmt: string, args: unknown[]): string {
  let cursor = 0;
  return fmt.replace(/%s|%3i/g, (token) => {
    const value = args[cursor++];
    if (token === "%s") {
      return String(value);
    }
    return String(Number(value)).padStart(3, " ");
  });
}
