/**
 * File: quake2-web-config-gamedir.ts
 * Purpose: Verify per-gamedir browser config resolution for `config.cfg`.
 *
 * This file is not a direct source port.
 * It checks that changing the logical Quake II gamedir reads/writes separate browser-backed config files.
 *
 * Dependencies:
 * - apps/web/src/web-config-storage.ts
 * - packages/filesystem
 * - packages/qcommon
 */

import { strict as assert } from "node:assert";

import {
  createVirtualFilesystem,
  FS_Gamedir,
  FS_SetGamedir,
  mountDirectory
} from "../../packages/filesystem/src/index.js";
import {
  Cbuf_AddText,
  Cbuf_Execute,
  Cmd_Init,
  CVAR_LATCH,
  Cvar_Command,
  Cvar_Get,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  createWebConfigStorage,
  readWebConfigOrMountedText,
  toConfigStorageKey,
  type WebStorageLike
} from "../../apps/web/src/web-config-storage.js";

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
const storage = createWebConfigStorage(storageLike);
const filesystem = createVirtualFilesystem();
const printed: string[] = [];
const cmd = createCommandRuntime({
  onPrint: (line) => printed.push(line),
  loadTextFile: (path) => readWebConfigOrMountedText(storage, filesystem, path),
  executeUnknownCommand: () => {
    const result = Cvar_Command(cvar, cmd);
    if (result.output) {
      printed.push(result.output);
    }
    return result.handled;
  }
});
const cvar = createCvarRuntime({
  onGameDirChange: (value) => {
    assert.equal(FS_SetGamedir(filesystem, value), true, "FS_SetGamedir should accept test gamedir");
    Cbuf_AddText(cmd, "exec config.cfg\n");
  },
  onExecAutoexec: () => {
    Cbuf_AddText(cmd, "exec autoexec.cfg\n");
  }
});

mountDirectory(filesystem, "baseq2", {
  "autoexec.cfg": encodeAscii("echo autoexec-base\n")
});
Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
Cvar_Get(cvar, "game", "", CVAR_LATCH);

storage.writeText("baseq2/config.cfg", "echo config-base\n");
storage.writeText("rogue/config.cfg", "echo config-rogue\n");

Cbuf_AddText(cmd, "exec config.cfg\n");
Cbuf_Execute(cmd);
assert.deepEqual(printed.slice(-2), ["execing config.cfg", "config-base"], "baseq2 config should load first");
assert.equal(FS_Gamedir(filesystem), "baseq2", "initial gamedir mismatch");

Cbuf_AddText(cmd, "game rogue\n");
Cbuf_Execute(cmd);
assert.equal(FS_Gamedir(filesystem), "rogue", "game rogue should switch filesystem gamedir");
assert.deepEqual(printed.slice(-4), [
  "execing config.cfg",
  "config-rogue",
  "execing autoexec.cfg",
  "autoexec-base"
], "rogue gamedir should load rogue config and preserve mounted autoexec resolution");

storage.writeText(`${FS_Gamedir(filesystem)}/config.cfg`, "echo rewritten-rogue\n");
assert.equal(backing.get(toConfigStorageKey("baseq2/config.cfg")), "echo config-base\n", "base config should not be overwritten");
assert.equal(backing.get(toConfigStorageKey("rogue/config.cfg")), "echo rewritten-rogue\n", "rogue config should use rogue key");

console.log("quake2-web-config-gamedir: ok");

function encodeAscii(value: string): Uint8Array {
  return Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
}
