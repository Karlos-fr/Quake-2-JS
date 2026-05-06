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

import {
  Developer_searchpath,
  FS_AddGameDirectory,
  FS_Dir_f,
  FS_ExecAutoexec,
  FS_FreeFile,
  FS_Gamedir,
  FS_Link,
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

const addedBase = FS_AddGameDirectory(filesystem, "baseq2", {
  "maps/base1.bsp": encodeAscii("base-map"),
  "configs/default.cfg": encodeAscii("seta skill 1"),
  "autoexec.cfg": encodeAscii("echo base"),
  "pics/colormap.pcx": encodeAscii("pcx"),
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

FS_Link(filesystem, "alias", "baseq2/configs");
assert.equal(
  readMountedTextFile(filesystem, "alias/default.cfg"),
  "seta skill 1",
  "FS_Link linked lookup mismatch"
);
FS_Link(filesystem, "missing-link", "baseq2/missing");
assert.equal(
  FS_LoadFile(filesystem, "missing-link/base1.bsp"),
  undefined,
  "FS_FOpenFile link miss must not fall back to normal search paths"
);
assert.equal(readMountedFile(filesystem, "maps/base1.bsp")?.bytes.byteLength, 14, "FS_filelength equivalent mismatch");

const listed = FS_ListFiles(filesystem, "baseq2/maps/*.bsp");
assert.deepEqual(listed, ["baseq2/maps/base1.bsp"], "FS_ListFiles base wildcard mismatch");

const pathLines = FS_Path_f(filesystem);
assert.equal(pathLines.includes("Current search path:"), true, "FS_Path_f header mismatch");
assert.equal(pathLines.includes("----------"), true, "FS_Path_f base separator mismatch");
assert.equal(pathLines.includes("rogue"), true, "FS_Path_f rogue directory mismatch");
assert.equal(pathLines.includes("baseq2/pak1.pak (1 files)"), true, "FS_Path_f pak1 listing mismatch");
assert.equal(pathLines.includes("baseq2/pak0.pak (3 files)"), true, "FS_Path_f pak listing mismatch");
assert.equal(pathLines.includes("alias : baseq2/configs"), true, "FS_Path_f link listing mismatch");

assert.equal(FS_NextPath(filesystem, null), "rogue", "FS_NextPath first path mismatch");
assert.equal(FS_NextPath(filesystem, "rogue"), "baseq2", "FS_NextPath second path mismatch");
assert.equal(FS_NextPath(filesystem, "baseq2"), null, "FS_NextPath end mismatch");

const dirLines = FS_Dir_f(filesystem, "*.bsp");
assert.equal(dirLines.includes("Directory of rogue/*.bsp"), true, "FS_Dir_f rogue header mismatch");
assert.equal(dirLines.includes("base1.bsp"), true, "FS_Dir_f loose file mismatch");
assert.equal(dirLines.includes("rogue1.bsp"), true, "FS_Dir_f second loose file mismatch");

assert.equal(FS_ExecAutoexec(filesystem), true, "FS_ExecAutoexec mismatch");

const beforeSet = FS_Path_f(filesystem);
assert.equal(beforeSet.includes("rogue"), true, "precondition rogue search path mismatch");
assert.equal(FS_SetGamedir(filesystem, "xatrix"), true, "FS_SetGamedir valid mismatch");
assert.equal(FS_Gamedir(filesystem), "xatrix", "FS_SetGamedir gamedir mismatch");
assert.equal(FS_Path_f(filesystem).includes("rogue"), false, "FS_SetGamedir should trim to base search paths");
assert.equal(FS_SetGamedir(filesystem, "../bad"), false, "FS_SetGamedir invalid mismatch");

FS_FreeFile(override ?? new Uint8Array());

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
