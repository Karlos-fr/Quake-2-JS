/**
 * File: quake2-files.ts
 * Purpose: Verify the principal TypeScript attachment point for `qcommon/files.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the virtual search path and mounted PAK logic.
 *
 * Dependencies:
 * - packages/filesystem/src/virtual-filesystem.ts
 * - packages/formats/src/pak.ts
 */

import { strict as assert } from "node:assert";

const SFF_SUBDIR = 0x08;

import {
  Developer_searchpath,
  FS_AddGameDirectory,
  FS_Dir_f,
  FS_ExecAutoexec,
  FS_FreeFile,
  FS_Gamedir,
  FS_InitFilesystem,
  FS_Link,
  FS_Link_f,
  FS_ListFiles,
  FS_LoadFile,
  FS_NextPath,
  FS_Path_f,
  FS_Read,
  FS_SetGamedir,
  MAX_READ,
  createVirtualFilesystem,
  markBaseSearchPaths,
  mountDirectory,
  readMountedFile,
  readMountedTextFile
} from "../../packages/filesystem/src/index.js";

const filesystem = createVirtualFilesystem();
const basePakBytes = createPakBytes([
  { name: "maps/base1.bsp", bytes: encodeAscii("base-pak-map") },
  { name: "maps/pakmap.bsp", bytes: encodeAscii("pak-map") },
  { name: "textures/wall.wal", bytes: encodeAscii("wal") }
]);
const basePak1Bytes = createPakBytes([
  { name: "maps/base1.bsp", bytes: encodeAscii("base-pak1-map") }
]);
const xatrixPakBytes = createPakBytes([
  { name: "maps/base1.bsp", bytes: encodeAscii("xatrix-pak-map") }
]);

const addedBase = FS_AddGameDirectory(filesystem, "baseq2", {
  "maps/base1.bsp": encodeAscii("base-map"),
  "maps/sub/deep.bsp": encodeAscii("deep-map"),
  "configs/default.cfg": encodeAscii("seta skill 1"),
  "autoexec.cfg": encodeAscii("echo base"),
  "pics/colormap.pcx": encodeAscii("pcx"),
  "players/male/tris.md2": encodeAscii("md2"),
  "players/male/grunt.pcx": encodeAscii("skin"),
  "players/male/grunt_i.pcx": encodeAscii("icon"),
  "pak0.pak": basePakBytes,
  "pak1.pak": basePak1Bytes
});
assert.equal(addedBase.packs.length, 2, "FS_AddGameDirectory should load numbered pak files");
assert.equal(FS_Gamedir(filesystem), "baseq2", "FS_AddGameDirectory gamedir mismatch");
assert.equal(decodeAscii(FS_LoadFile(filesystem, "maps/base1.bsp") ?? new Uint8Array()), "base-pak1-map", "FS_AddGameDirectory higher pak should override lower pak and loose file");
markBaseSearchPaths(filesystem);

mountDirectory(filesystem, "rogue", {
  "maps/base1.bsp": encodeAscii("rogue-override"),
  "maps/rogue1.bsp": encodeAscii("rogue-map")
});

assert.equal(FS_Gamedir(filesystem), "rogue", "FS_Gamedir latest mount mismatch");
assert.equal(Developer_searchpath(filesystem), 2, "Developer_searchpath rogue mismatch");

const override = FS_LoadFile(filesystem, "maps/base1.bsp");
assert.equal(decodeAscii(override ?? new Uint8Array()), "rogue-override", "directory override mismatch");
assert.equal(MAX_READ, 0x10000, "MAX_READ value mismatch");

const largeSource = new Uint8Array(MAX_READ + 7);
for (let index = 0; index < largeSource.byteLength; index += 1) {
  largeSource[index] = index & 0xff;
}
const largeCopy = new Uint8Array(largeSource.byteLength);
FS_Read(largeCopy, largeCopy.byteLength, largeSource);
assert.deepEqual([...largeCopy], [...largeSource], "FS_Read chunk copy mismatch");
assert.throws(() => FS_Read(new Uint8Array(3), 3, new Uint8Array(2)), /FS_Read: 0 bytes read/, "FS_Read short read mismatch");

const overrideCopy = override;
assert.notEqual(overrideCopy, readMountedFile(filesystem, "maps/base1.bsp")?.bytes, "FS_LoadFile must allocate a distinct buffer");
if (overrideCopy) {
  overrideCopy[0] = "R".charCodeAt(0);
}
assert.equal(
  decodeAscii(readMountedFile(filesystem, "maps/base1.bsp")?.bytes ?? new Uint8Array()),
  "rogue-override",
  "FS_LoadFile copy must not mutate mounted bytes"
);

const pakFile = FS_LoadFile(filesystem, "maps/pakmap.bsp");
assert.equal(decodeAscii(pakFile ?? new Uint8Array()), "pak-map", "FS_LoadPackFile pak lookup mismatch");

assert.equal(FS_Link_f(filesystem), "USAGE: link <from> <to>", "FS_Link_f usage mismatch");
FS_Link_f(filesystem, "alias", "baseq2/configs");
assert.equal(
  readMountedTextFile(filesystem, "alias/default.cfg"),
  "seta skill 1",
  "FS_Link linked lookup mismatch"
);
FS_Link_f(filesystem, "alias", "baseq2");
assert.equal(
  readMountedTextFile(filesystem, "alias/autoexec.cfg"),
  "echo base",
  "FS_Link_f replacement mismatch"
);
FS_Link(filesystem, "alias", "baseq2/configs");
FS_Link_f(filesystem, "slash/", "baseq2/configs/");
assert.equal(
  readMountedTextFile(filesystem, "slash/default.cfg"),
  "seta skill 1",
  "FS_Link_f slash-preserving concat mismatch"
);
FS_Link_f(filesystem, "missing-link", "baseq2/missing");
assert.equal(
  FS_LoadFile(filesystem, "missing-link/base1.bsp"),
  undefined,
  "FS_FOpenFile link miss must not fall back to normal search paths"
);
FS_Link_f(filesystem, "slash/", "");
assert.equal(readMountedTextFile(filesystem, "slash/default.cfg"), undefined, "FS_Link_f deletion mismatch");
assert.equal(readMountedFile(filesystem, "maps/base1.bsp")?.bytes.byteLength, 14, "FS_filelength equivalent mismatch");

const listed = FS_ListFiles(filesystem, "baseq2/maps/*.bsp");
assert.deepEqual(listed, ["baseq2/maps/base1.bsp"], "FS_ListFiles base wildcard mismatch");
assert.deepEqual(FS_ListFiles(filesystem, "BASEQ2/MAPS/*.BSP"), ["baseq2/maps/base1.bsp"], "FS_ListFiles should lower normalized matches");
assert.deepEqual(FS_ListFiles(filesystem, "baseq2/players/*.*", SFF_SUBDIR), ["baseq2/players/male"], "FS_ListFiles SFF_SUBDIR mismatch");
assert.deepEqual(FS_ListFiles(filesystem, "baseq2/players/male/*.pcx"), [
  "baseq2/players/male/grunt.pcx",
  "baseq2/players/male/grunt_i.pcx"
], "FS_ListFiles skin wildcard mismatch");

const pathLines = FS_Path_f(filesystem);
assert.equal(pathLines.includes("Current search path:"), true, "FS_Path_f header mismatch");
assert.equal(pathLines.includes("----------"), true, "FS_Path_f base separator mismatch");
assert.equal(pathLines.includes("rogue"), true, "FS_Path_f rogue directory mismatch");
assert.equal(pathLines.includes("baseq2/pak1.pak (1 files)"), true, "FS_Path_f pak1 listing mismatch");
assert.equal(pathLines.includes("baseq2/pak0.pak (3 files)"), true, "FS_Path_f pak listing mismatch");
assert.equal(pathLines.includes("alias : baseq2/configs"), true, "FS_Path_f link listing mismatch");
assert.equal(pathLines.includes("slash/ : baseq2/configs/"), false, "FS_Path_f deleted link listing mismatch");

assert.equal(FS_NextPath(filesystem, null), "rogue", "FS_NextPath first path mismatch");
assert.equal(FS_NextPath(filesystem, "rogue"), "baseq2", "FS_NextPath second path mismatch");
assert.equal(FS_NextPath(filesystem, "baseq2"), null, "FS_NextPath end mismatch");

const dirLines = FS_Dir_f(filesystem, "maps/*.bsp");
assert.equal(dirLines.includes("Directory of rogue/maps/*.bsp"), true, "FS_Dir_f rogue header mismatch");
assert.equal(dirLines.includes("base1.bsp"), true, "FS_Dir_f loose file mismatch");
assert.equal(dirLines.includes("rogue1.bsp"), true, "FS_Dir_f second loose file mismatch");

assert.equal(FS_ExecAutoexec(filesystem), true, "FS_ExecAutoexec mismatch");

const beforeSet = FS_Path_f(filesystem);
assert.equal(beforeSet.includes("rogue"), true, "precondition rogue search path mismatch");
assert.equal(FS_SetGamedir(filesystem, "xatrix"), true, "FS_SetGamedir valid mismatch");
assert.equal(FS_Gamedir(filesystem), "xatrix", "FS_SetGamedir gamedir mismatch");
assert.equal(FS_Path_f(filesystem).includes("rogue"), false, "FS_SetGamedir should trim to base search paths");
assert.equal(FS_SetGamedir(filesystem, "../bad"), false, "FS_SetGamedir invalid mismatch");
assert.equal(FS_SetGamedir(filesystem, "xatrix", {
  "maps/base1.bsp": encodeAscii("xatrix-loose-map"),
  "pak0.pak": xatrixPakBytes
}), true, "FS_SetGamedir should mount provided mod directory");
assert.equal(FS_Path_f(filesystem).includes("xatrix/pak0.pak (1 files)"), true, "FS_SetGamedir should add mod pak search path");
assert.equal(FS_Path_f(filesystem).includes("xatrix"), true, "FS_SetGamedir should add mod directory search path");
assert.equal(decodeAscii(FS_LoadFile(filesystem, "maps/base1.bsp") ?? new Uint8Array()), "xatrix-pak-map", "FS_SetGamedir mod pak should override base files");
assert.equal(FS_SetGamedir(filesystem, ""), true, "FS_SetGamedir empty base reset mismatch");
assert.equal(FS_Gamedir(filesystem), "baseq2", "FS_SetGamedir empty should reset logical gamedir");
assert.equal(FS_Path_f(filesystem).includes("xatrix"), false, "FS_SetGamedir empty should trim mod search paths");
assert.equal(FS_SetGamedir(filesystem, "bad/path"), false, "FS_SetGamedir slash rejection mismatch");
assert.equal(FS_SetGamedir(filesystem, "bad\\path"), false, "FS_SetGamedir backslash rejection mismatch");
assert.equal(FS_SetGamedir(filesystem, "c:bad"), false, "FS_SetGamedir colon rejection mismatch");

FS_FreeFile(override ?? new Uint8Array());

const initializedFilesystem = createVirtualFilesystem();
const registeredCommands = new Map<string, () => void>();
const printed: string[] = [];
const commandArgs: string[] = [];
const requestedCvars: Array<{ name: string; value: string; flags: number }> = [];
const initialCvars = new Map([
  ["basedir", { string: "." }],
  ["cddir", { string: "cdrom" }],
  ["game", { string: "xatrix" }]
]);
const directoryContents = new Map<string, Record<string, Uint8Array>>([
  ["baseq2", {
    "maps/base1.bsp": encodeAscii("base-mounted")
  }],
  ["cdrom/baseq2", {
    "maps/base1.bsp": encodeAscii("cd-mounted")
  }],
  ["xatrix", {
    "maps/base1.bsp": encodeAscii("xatrix-mounted"),
    "autoexec.cfg": encodeAscii("exec xatrix")
  }]
]);

FS_InitFilesystem(initializedFilesystem, {
  commands: {
    addCommand: (name, callback) => {
      registeredCommands.set(name, callback);
    },
    argc: () => commandArgs.length,
    argv: (index) => commandArgs[index] ?? "",
    print: (line) => {
      printed.push(line);
    }
  },
  cvars: {
    get: (name, value, flags) => {
      requestedCvars.push({ name, value, flags });
      return initialCvars.get(name) ?? { string: value };
    }
  },
  resolveDirectoryFiles: (path) => directoryContents.get(path)
});

assert.deepEqual([...registeredCommands.keys()].sort(), ["dir", "link", "path"], "FS_InitFilesystem command registration mismatch");
assert.deepEqual(requestedCvars, [
  { name: "basedir", value: ".", flags: 8 },
  { name: "cddir", value: "", flags: 8 },
  { name: "game", value: "", flags: 20 }
], "FS_InitFilesystem cvar setup mismatch");
assert.equal(FS_Gamedir(initializedFilesystem), "xatrix", "FS_InitFilesystem should apply game cvar override");
assert.equal(decodeAscii(FS_LoadFile(initializedFilesystem, "maps/base1.bsp") ?? new Uint8Array()), "xatrix-mounted", "FS_InitFilesystem game override lookup mismatch");
assert.equal(FS_NextPath(initializedFilesystem, null), "xatrix", "FS_InitFilesystem FS_NextPath game path mismatch");
assert.equal(FS_NextPath(initializedFilesystem, "xatrix"), "baseq2", "FS_InitFilesystem FS_NextPath base path mismatch");
assert.equal(FS_NextPath(initializedFilesystem, "baseq2"), "cdrom/baseq2", "FS_InitFilesystem FS_NextPath cddir path mismatch");
assert.equal(FS_NextPath(initializedFilesystem, "cdrom/baseq2"), null, "FS_InitFilesystem FS_NextPath end mismatch");

registeredCommands.get("path")?.();
assert.equal(printed.some((line) => line.includes("Current search path:")), true, "FS_InitFilesystem path command output mismatch");
printed.length = 0;
commandArgs.splice(0, commandArgs.length, "link", "alias", "xatrix");
registeredCommands.get("link")?.();
assert.equal(readMountedTextFile(initializedFilesystem, "alias/autoexec.cfg"), "exec xatrix", "FS_InitFilesystem link command mismatch");
commandArgs.splice(0, commandArgs.length, "dir", "maps/*.bsp");
registeredCommands.get("dir")?.();
assert.equal(printed.some((line) => line.includes("Directory of xatrix/maps/*.bsp")), true, "FS_InitFilesystem dir command output mismatch");

console.log("Verification files: OK");

function encodeAscii(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function decodeAscii(bytes: Uint8Array): string {
  let result = "";
  for (let index = 0; index < bytes.length; index += 1) {
    result += String.fromCharCode(bytes[index]);
  }
  return result;
}

function createPakBytes(entries: Array<{ name: string; bytes: Uint8Array }>): Uint8Array {
  const headerSize = 12;
  const entryDataSize = entries.reduce((sum, entry) => sum + entry.bytes.length, 0);
  const dirOffset = headerSize + entryDataSize;
  const dirEntrySize = 64;
  const dirLength = entries.length * dirEntrySize;
  const bytes = new Uint8Array(dirOffset + dirLength);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  writeInt32LE(view, 0, (("K".charCodeAt(0) << 24) + ("C".charCodeAt(0) << 16) + ("A".charCodeAt(0) << 8) + "P".charCodeAt(0)) | 0);
  writeInt32LE(view, 4, dirOffset);
  writeInt32LE(view, 8, dirLength);

  let dataOffset = headerSize;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]!;
    bytes.set(entry.bytes, dataOffset);

    const dirBase = dirOffset + index * dirEntrySize;
    for (let charIndex = 0; charIndex < entry.name.length; charIndex += 1) {
      bytes[dirBase + charIndex] = entry.name.charCodeAt(charIndex) & 0xff;
    }
    writeInt32LE(view, dirBase + 56, dataOffset);
    writeInt32LE(view, dirBase + 60, entry.bytes.length);

    dataOffset += entry.bytes.length;
  }

  return bytes;
}

function writeInt32LE(view: DataView, offset: number, value: number): void {
  view.setInt32(offset, value, true);
}
