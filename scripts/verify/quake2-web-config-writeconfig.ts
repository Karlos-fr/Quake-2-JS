/**
 * File: quake2-web-config-writeconfig.ts
 * Purpose: Verify the temporary web `writeconfig` console command used by full-game.
 *
 * This file is not a direct source port.
 * It ensures the user-facing command still delegates to CL_WriteConfiguration and persists a logical `config.cfg`.
 *
 * Dependencies:
 * - apps/web/src/web-config-storage.ts
 * - packages/client/src/main.ts
 * - packages/qcommon/src/cmd.ts
 */

import { strict as assert } from "node:assert";

import {
  K_TAB,
  Key_Init,
  createClientKeyContext,
  createClientRuntime
} from "../../packages/client/src/index.js";
import {
  CL_InitLocal,
  CL_WriteConfiguration,
  createClientMainContext
} from "../../packages/client/src/main.js";
import {
  Cbuf_AddText,
  Cbuf_Execute,
  Cmd_Init,
  CVAR_ARCHIVE,
  Cvar_Get,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  createWebConfigStorage,
  toConfigStorageKey,
  type WebStorageLike
} from "../../apps/web/src/web-config-storage.js";
import { registerWebConfigCommands } from "../../apps/web/src/web-config-commands.js";

const backing = new Map<string, string>();
const storageLike: WebStorageLike = {
  getItem: (key) => backing.get(key) ?? null,
  setItem: (key, value) => {
    backing.set(key, value);
  },
  removeItem: (key) => {
    backing.delete(key);
  }
};

const printed: string[] = [];
const storage = createWebConfigStorage(storageLike);
const client = createClientRuntime();
const cmd = createCommandRuntime({
  onPrint: (line) => {
    printed.push(line);
  }
});
const cvar = createCvarRuntime();
const keys = createClientKeyContext({ client, cmd, cvar });
const main = createClientMainContext(client, cmd, cvar);

Cmd_Init(cmd);
Key_Init(keys);
CL_InitLocal(main);

keys.state.keybindings[K_TAB] = "inven";
Cvar_Get(cvar, "writeconfig_archive_test", "ok", CVAR_ARCHIVE);

const writeConfiguration = (): boolean => {
  const result = CL_WriteConfiguration(main, {
    keyContext: keys,
    getGameDir: () => "baseq2",
    onWriteConfigFile: (path, contents) => storage.writeText(path, contents),
    onPrint: (line) => printed.push(line)
  });
  return result !== null;
};

registerWebConfigCommands(cmd, {
  writeConfiguration,
  onPrint: (message) => printed.push(message)
});

Cbuf_AddText(cmd, "writeconfig\n");
Cbuf_Execute(cmd);

const stored = backing.get(toConfigStorageKey("baseq2/config.cfg")) ?? "";
assert.equal(printed.at(-1), "Wrote config.cfg.", "writeconfig should print success");
assert.equal(stored.includes("bind TAB \"inven\"\n"), true, "writeconfig should persist key bindings");
assert.equal(stored.includes("set writeconfig_archive_test \"ok\"\n"), true, "writeconfig should persist archived cvars");

console.log("quake2-web-config-writeconfig: ok");
