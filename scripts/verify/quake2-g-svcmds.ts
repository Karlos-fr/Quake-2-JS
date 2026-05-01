/**
 * File: quake2-g-svcmds.ts
 * Purpose: Verify the closed TypeScript port of `game/g_svcmds.c`.
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
  SVCmd_AddIP_f,
  SVCmd_ListIP_f,
  SVCmd_RemoveIP_f,
  SVCmd_WriteIP_f,
  ServerCommand,
  StringToFilter,
  createGameServerCommandState,
  type GameServerCommandContext,
  type ipfilter_t
} from "../../packages/game/src/g_svcmds.js";

const state = createGameServerCommandState();
const prints: string[] = [];
const writes = new Map<string, string>();
const command = { argv: ["sv"], args: "" };

assert.equal(MAX_IPFILTERS, 1024, "MAX_IPFILTERS mismatch");
assert.equal(state.ipfilters.length, MAX_IPFILTERS, "ipfilters must reserve the original fixed table size");
assert.equal(state.numipfilters, 0, "numipfilters must start at zero");
assert.deepEqual(state.ipfilters[0], { mask: 0, compare: 0 }, "ipfilter_t slots must zero-initialize mask/compare");
assert.notEqual(state.ipfilters[0], state.ipfilters[1], "ipfilter_t slots must be independent mutable objects");

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
assert.deepEqual(
  state.ipfilters[0],
  { mask: 0x00ffffff, compare: 0x0028f6c0 },
  "addip must populate the original little-endian mask/compare pair"
);
assert.equal(SV_FilterPacket(state, context, "192.246.40.7:27910"), true, "matching addresses must be filtered when filterban=1");
assert.equal(SV_FilterPacket(state, context, "192.246.41.7:27910"), false, "non-matching addresses must pass when filterban=1");
assert.equal(
  SV_FilterPacket(state, context, "192x246x40x7:27910"),
  true,
  "SV_FilterPacket must preserve the original permissive single-separator scan"
);
assert.equal(
  SV_FilterPacket(state, context, "300.246.40.7:27910"),
  false,
  "SV_FilterPacket must pack parsed octets as bytes before comparing"
);

const parsedFilter: ipfilter_t = { mask: 0, compare: 0 };
assert.equal(StringToFilter(context, "0.0.5.0", parsedFilter), true, "zero octets must parse as wildcard bytes");
assert.deepEqual(
  parsedFilter,
  { mask: 0x00ff0000, compare: 0x00050000 },
  "StringToFilter must preserve the original byte and mask packing"
);
assert.equal(StringToFilter(context, "1.", parsedFilter), false, "trailing separators must fail like the C parser");
assert.equal(prints.pop(), "Bad filter address: 1.\n", "trailing separator diagnostic mismatch");
assert.equal(StringToFilter(context, "", parsedFilter), false, "empty filter addresses must fail like the C parser");
assert.equal(prints.pop(), "Bad filter address: \n", "empty address diagnostic mismatch");
assert.equal(
  StringToFilter(context, "1x2x3x4", parsedFilter),
  true,
  "the original parser accepts any single separator between numeric runs"
);
assert.deepEqual(
  parsedFilter,
  { mask: 0xffffffff, compare: 0x04030201 },
  "StringToFilter must keep original permissive separator behavior"
);

runCommand(["sv", "listip"]);
assert.deepEqual(
  prints.splice(0),
  ["Filter list:\n", "192.246. 40.  0\n".replace("192", "192").replace("246", "246")],
  "listip output mismatch"
);

const listState = createGameServerCommandState();
listState.numipfilters = 2;
listState.ipfilters[0] = { mask: 0, compare: 0x04030201 };
listState.ipfilters[1] = { mask: 0, compare: 0xc8030201 };
listState.ipfilters[2] = { mask: 0, compare: 0x08070605 };
runListIpDirect(listState);
assert.deepEqual(
  prints.splice(0),
  ["Filter list:\n", "  1.  2.  3.  4\n", "  1.  2.  3.200\n"],
  "listip must unpack compare through the original byte order and stop at numipfilters"
);

const emptyListState = createGameServerCommandState();
runListIpDirect(emptyListState);
assert.deepEqual(prints.splice(0), ["Filter list:\n"], "empty listip must only print the header");

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

runCommand(["sv", "addip", "1.2.3.200"]);
runCommand(["sv", "writeip"]);
assert.equal(prints.pop(), "Writing baseq2/listip.cfg.\n", "writeip high-octet announce mismatch");
assert.equal(
  writes.get("baseq2/listip.cfg"),
  "set filterban 1\nsv addip 10.0.0.0\nsv addip 1.2.3.200\n",
  "writeip must serialize active filters with original byte order"
);
assert.equal(
  SV_FilterPacket(state, context, "1.2.3.200:27910"),
  true,
  "high-bit fourth octet filters must compare as unsigned values"
);

cvars.set("game", createCvar("game", ""));
cvars.set("filterban", createCvar("filterban", "0"));
runCommand(["sv", "writeip"]);
assert.equal(prints.pop(), "Writing baseq2/listip.cfg.\n", "writeip must fall back to GAMEVERSION when game cvar is empty");
assert.equal(
  writes.get("baseq2/listip.cfg"),
  "set filterban 0\nsv addip 10.0.0.0\nsv addip 1.2.3.200\n",
  "writeip must serialize the current filterban cvar value"
);

cvars.set("filterban", createCvar("filterban", "0"));
assert.equal(SV_FilterPacket(state, context, "10.1.2.3:27910"), false, "matching addresses must pass when filterban=0");
assert.equal(SV_FilterPacket(state, context, "11.1.2.3:27910"), true, "non-matching addresses must be rejected when filterban=0");

runCommand(["sv", "bogus"]);
assert.equal(prints.pop(), "Unknown server command \"bogus\"\n", "unknown command mismatch");

runCommand(["sv", "addip", "bad.ip"]);
assert.equal(state.numipfilters, 3, "failed addip must still consume the newly allocated slot like the original code");
assert.equal(prints.splice(0).join(""), "Bad filter address: bad.ip\n", "bad addip diagnostic mismatch");

const usageState = createGameServerCommandState();
runAddIpDirect(usageState, ["sv", "addip"]);
assert.equal(usageState.numipfilters, 0, "addip without an address must not allocate a filter slot");
assert.equal(prints.pop(), "Usage:  addip <ip-mask>\n", "addip usage diagnostic mismatch");

const reuseState = createGameServerCommandState();
reuseState.numipfilters = 3;
reuseState.ipfilters[0] = { mask: 0xffffffff, compare: 0x04030201 };
reuseState.ipfilters[1] = { mask: 0, compare: 0xffffffff };
reuseState.ipfilters[2] = { mask: 0xffffffff, compare: 0x08070605 };
runAddIpDirect(reuseState, ["sv", "addip", "172.16"]);
assert.equal(reuseState.numipfilters, 3, "addip must reuse a free sentinel slot before growing numipfilters");
assert.deepEqual(
  reuseState.ipfilters[1],
  { mask: 0x0000ffff, compare: 0x000010ac },
  "addip must populate the first 0xffffffff free slot"
);
assert.deepEqual(reuseState.ipfilters[2], { mask: 0xffffffff, compare: 0x08070605 }, "addip must not disturb later slots");

const fullState = createGameServerCommandState();
fullState.numipfilters = MAX_IPFILTERS;
for (let index = 0; index < MAX_IPFILTERS; index += 1) {
  fullState.ipfilters[index] = { mask: 0xffffffff, compare: index };
}
runAddIpDirect(fullState, ["sv", "addip", "8.8.8.8"]);
assert.equal(fullState.numipfilters, MAX_IPFILTERS, "full addip must keep numipfilters unchanged");
assert.deepEqual(fullState.ipfilters[MAX_IPFILTERS - 1], { mask: 0xffffffff, compare: MAX_IPFILTERS - 1 }, "full addip must not overwrite filters");
assert.equal(prints.pop(), "IP filter list is full\n", "full addip diagnostic mismatch");

const removeUsageState = createGameServerCommandState();
runRemoveIpDirect(removeUsageState, ["sv", "removeip"]);
assert.equal(removeUsageState.numipfilters, 0, "removeip without an address must leave the filter list unchanged");
assert.equal(prints.pop(), "Usage:  sv removeip <ip-mask>\n", "removeip usage diagnostic mismatch");

const compactState = createGameServerCommandState();
compactState.numipfilters = 3;
compactState.ipfilters[0] = { mask: 0xffffffff, compare: 0x04030201 };
compactState.ipfilters[1] = { mask: 0x00ffffff, compare: 0x0028f6c0 };
compactState.ipfilters[2] = { mask: 0xffffffff, compare: 0x08070605 };
runRemoveIpDirect(compactState, ["sv", "removeip", "192.246.40"]);
assert.equal(prints.pop(), "Removed.\n", "removeip must acknowledge an exact mask/compare removal");
assert.equal(compactState.numipfilters, 2, "removeip must decrement numipfilters after removal");
assert.deepEqual(compactState.ipfilters[0], { mask: 0xffffffff, compare: 0x04030201 }, "removeip must preserve filters before the removed slot");
assert.deepEqual(compactState.ipfilters[1], { mask: 0xffffffff, compare: 0x08070605 }, "removeip must compact later filters down one slot");
assert.deepEqual(
  compactState.ipfilters[2],
  { mask: 0xffffffff, compare: 0x08070605 },
  "removeip must leave the now-unused trailing slot with the original C stale value"
);

const beforeMissingRemove = compactState.ipfilters.slice(0, compactState.numipfilters).map((filter) => ({ ...filter }));
runRemoveIpDirect(compactState, ["sv", "removeip", "192.246.40"]);
assert.equal(prints.pop(), "Didn't find 192.246.40.\n", "removeip must report a missing exact filter");
assert.equal(compactState.numipfilters, 2, "missing removeip must not change numipfilters");
assert.deepEqual(
  compactState.ipfilters.slice(0, compactState.numipfilters),
  beforeMissingRemove,
  "missing removeip must not alter active filters"
);

const noWriterState = createGameServerCommandState();
noWriterState.numipfilters = 1;
noWriterState.ipfilters[0] = { mask: 0xffffffff, compare: 0x04030201 };
prints.splice(0);
SVCmd_WriteIP_f(noWriterState, { gi: context.gi });
assert.deepEqual(
  prints.splice(0),
  ["Writing baseq2/listip.cfg.\n", "Couldn't open baseq2/listip.cfg\n"],
  "writeip without a writer must preserve the original fopen failure diagnostic"
);

console.log("quake2-g-svcmds: ok");

function runCommand(argv: string[]): void {
  command.argv = argv.slice();
  command.args = argv.slice(1).join(" ");
  ServerCommand(state, context);
}

function runAddIpDirect(targetState: ReturnType<typeof createGameServerCommandState>, argv: string[]): void {
  command.argv = argv.slice();
  command.args = argv.slice(1).join(" ");
  SVCmd_AddIP_f(targetState, context);
}

function runRemoveIpDirect(targetState: ReturnType<typeof createGameServerCommandState>, argv: string[]): void {
  command.argv = argv.slice();
  command.args = argv.slice(1).join(" ");
  SVCmd_RemoveIP_f(targetState, context);
}

function runListIpDirect(targetState: ReturnType<typeof createGameServerCommandState>): void {
  command.argv = ["sv", "listip"];
  command.args = "listip";
  SVCmd_ListIP_f(targetState, context);
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
