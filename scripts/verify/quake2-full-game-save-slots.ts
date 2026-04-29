/**
 * File: quake2-full-game-save-slots.ts
 * Purpose: Verify full-game save/load commands persist browser save slots through server callbacks.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCR_Init,
  createClientRuntime,
  createClientScreenContext
} from "../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  FS_Gamedir,
  mountPak
} from "../../packages/filesystem/src/index.js";
import {
  Cbuf_AddText,
  Cbuf_Execute,
  Cmd_Init,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import { createFullGameCommandBridgeState, registerFullGameCommandBridge } from "../../apps/web/src/full-game-command-bridge.js";
import { createFullGameServerHost } from "../../apps/web/src/full-game-server-host.js";
import {
  createWebSaveStorage,
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

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game save slot verification");

const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const prints: string[] = [];
const saveStorage = createWebSaveStorage(new MemoryStorage());

Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
SCR_Init(createClientScreenContext(client, cmd, cvar));

const serverHost = createFullGameServerHost({
  cmd,
  cvar,
  filesystem,
  saveStorage,
  getGameDir: () => FS_Gamedir(filesystem),
  onPrint: (message) => {
    prints.push(message);
  },
  onBeginLoading: () => {
    client.cl.screen.scr_draw_loading = 1;
  }
});

const bridge = createFullGameCommandBridgeState();
registerFullGameCommandBridge(cmd, cvar, client, bridge, {
  onPrint: (message) => {
    prints.push(message);
  }
});

Cbuf_AddText(cmd, "loading ; killserver ; wait ; newgame\n");
Cbuf_Execute(cmd);
Cbuf_Execute(cmd);

assert.equal(serverHost.hasActiveGameMap(), true, "newgame should create an active server map before saving");
assert.equal(saveStorage.exists("baseq2/save/save0/server.ssv"), true, "newgame autosave should populate save0");
assert.equal(saveStorage.getSaveSlots("baseq2")[0]?.valid, true, "autosave should be visible in slot 0");

Cbuf_AddText(cmd, "save save1\n");
Cbuf_Execute(cmd);

assert.equal(saveStorage.exists("baseq2/save/save1/server.ssv"), true, "save save1 should write server.ssv");
assert.equal(saveStorage.exists("baseq2/save/save1/game.ssv"), true, "save save1 should write game.ssv");
assert.ok(saveStorage.listFiles("baseq2/save/save1/*.sav").length >= 1, "save save1 should write level .sav files");
assert.equal(saveStorage.getSaveSlots("baseq2")[1]?.valid, true, "save1 should become visible to the menu");

Cbuf_AddText(cmd, "load save1\n");
Cbuf_Execute(cmd);

assert.equal(serverHost.hasActiveGameMap(), true, "load save1 should restore an active server map");
assert.equal(serverHost.currentMapRequest, "base1", "load save1 should restore the saved base1 mapcmd");
assert.ok(prints.some((line) => line.includes("Saving game...")), "save command should run through sv_ccmds");
assert.ok(prints.some((line) => line.includes("Loading game...")), "load command should run through sv_ccmds");

console.log("quake2-full-game-save-slots: ok");
