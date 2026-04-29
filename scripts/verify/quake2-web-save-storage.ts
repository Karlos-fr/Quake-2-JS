/**
 * File: quake2-web-save-storage.ts
 * Purpose: Verify browser logical savegame storage keeps Quake II save paths and slot labels.
 */

import { strict as assert } from "node:assert";

import {
  createWebSaveStorage,
  toSaveStorageKey,
  type WebSaveStorageBackend
} from "../../apps/web/src/web-save-storage.js";

class MemoryStorage implements WebSaveStorageBackend {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }
}

function fixedServerFile(comment: string): Uint8Array {
  const bytes = new Uint8Array(32 + 1024);
  const encoded = new TextEncoder().encode(comment);
  bytes.set(encoded.subarray(0, 31), 0);
  return bytes;
}

const backing = new MemoryStorage();
const storage = createWebSaveStorage(backing);

assert.equal(toSaveStorageKey("BASEQ2\\save\\SAVE1\\server.ssv"), "quake2js:save:baseq2/save/save1/server.ssv");

assert.equal(storage.writeBinary("baseq2/save/save1/server.ssv", fixedServerFile("Unit 1")), true);
assert.equal(storage.writeText("baseq2/save/save1/game.ssv", "{\"ok\":true}\n"), true);
assert.equal(storage.writeBinary("baseq2/save/save1/base1.sav", new Uint8Array([1, 2, 3])), true);
assert.equal(storage.writeBinary("rogue/save/save1/server.ssv", fixedServerFile("Rogue")), true);

assert.deepEqual(Array.from(storage.readBinary("baseq2/save/save1/base1.sav") ?? []), [1, 2, 3]);
assert.equal(storage.readText("baseq2/save/save1/game.ssv"), "{\"ok\":true}\n");
assert.deepEqual(storage.listFiles("baseq2/save/save1/*.sav"), ["baseq2/save/save1/base1.sav"]);

const baseSlots = storage.getSaveSlots("baseq2");
assert.equal(baseSlots[1]?.label, "Unit 1");
assert.equal(baseSlots[1]?.valid, true);
assert.equal(baseSlots[2], null);

const rogueSlots = storage.getSaveSlots("rogue");
assert.equal(rogueSlots[1]?.label, "Rogue");

storage.copySaveGame("baseq2", "save1", "save2");
assert.equal(storage.getSaveSlots("baseq2")[2]?.label, "Unit 1");
assert.deepEqual(Array.from(storage.readBinary("baseq2/save/save2/base1.sav") ?? []), [1, 2, 3]);

storage.wipeSavegame("baseq2", "save1");
assert.equal(storage.exists("baseq2/save/save1/server.ssv"), false);
assert.equal(storage.exists("baseq2/save/save2/server.ssv"), true);
assert.equal(storage.exists("rogue/save/save1/server.ssv"), true);

console.log("quake2-web-save-storage: ok");
