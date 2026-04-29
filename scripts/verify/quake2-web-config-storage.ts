/**
 * File: quake2-web-config-storage.ts
 * Purpose: Verify the browser config storage adapter used by `full-game.html`.
 *
 * This file is not a direct source port.
 * It is a web-adapter verification harness for logical Quake II `.cfg` files persisted in localStorage.
 *
 * Dependencies:
 * - apps/web/src/web-config-storage.ts
 * - packages/filesystem
 * - packages/qcommon
 */

import { strict as assert } from "node:assert";

import {
  createWebConfigStorage,
  readWebConfigOrMountedText,
  toConfigStorageKey,
  type WebStorageLike
} from "../../apps/web/src/web-config-storage.js";
import {
  createVirtualFilesystem,
  mountDirectory
} from "../../packages/filesystem/src/index.js";
import {
  Cbuf_AddText,
  Cbuf_Execute,
  Cmd_Init,
  createCommandRuntime
} from "../../packages/qcommon/src/index.js";

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

mountDirectory(filesystem, "baseq2", {
  "default.cfg": encodeAscii("echo default-from-vfs\n"),
  "config.cfg": encodeAscii("echo config-from-vfs\n"),
  "autoexec.cfg": encodeAscii("echo autoexec-from-vfs\n")
});

assert.equal(toConfigStorageKey("baseq2/config.cfg"), "quake2js:fs:baseq2/config.cfg", "storage key mismatch");
assert.equal(storage.writeText("baseq2/config.cfg", "echo config-from-storage\n"), true, "writeText should persist");
assert.equal(storage.readText("baseq2/config.cfg"), "echo config-from-storage\n", "readText exact mismatch");
assert.equal(
  readWebConfigOrMountedText(storage, filesystem, "config.cfg"),
  "echo config-from-storage\n",
  "config.cfg should resolve from web storage before mounted files"
);
assert.equal(
  readWebConfigOrMountedText(storage, filesystem, "default.cfg"),
  "echo default-from-vfs\n",
  "default.cfg should resolve from mounted files when not stored"
);
assert.equal(
  readWebConfigOrMountedText(storage, filesystem, "missing.cfg"),
  null,
  "missing cfg should resolve to null"
);

const printed: string[] = [];
const cmd = createCommandRuntime({
  onPrint: (line) => {
    printed.push(line);
  },
  loadTextFile: (path) => readWebConfigOrMountedText(storage, filesystem, path),
  executeUnknownCommand: () => false
});
Cmd_Init(cmd);

Cbuf_AddText(cmd, "exec default.cfg\n");
Cbuf_AddText(cmd, "exec config.cfg\n");
Cbuf_AddText(cmd, "exec autoexec.cfg\n");
Cbuf_Execute(cmd);

assert.deepEqual(printed, [
  "execing default.cfg",
  "default-from-vfs",
  "execing config.cfg",
  "config-from-storage",
  "execing autoexec.cfg",
  "autoexec-from-vfs"
], "config bootstrap exec order/output mismatch");

storage.remove("baseq2/config.cfg");
assert.equal(readWebConfigOrMountedText(storage, filesystem, "config.cfg"), "echo config-from-vfs\n", "remove should reveal mounted fallback");

console.log("quake2-web-config-storage: ok");

function encodeAscii(value: string): Uint8Array {
  return Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
}
