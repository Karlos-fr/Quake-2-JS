/**
 * File: quake2-md4.ts
 * Purpose: Verify the strict TypeScript port of `qcommon/md4.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the bundled MD4 implementation and `Com_BlockChecksum`.
 *
 * Dependencies:
 * - packages/qcommon/src/md4.ts
 */

import { strict as assert } from "node:assert";

import { Com_BlockChecksum, createMD4Context, MD4Final, MD4Init, MD4Update } from "../../packages/qcommon/src/md4.js";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function encodeAscii(value: string): Uint8Array {
  return Uint8Array.from(Array.from(value, (char) => char.charCodeAt(0)));
}

function md4Hex(value: string): string {
  const context = createMD4Context();
  const digest = new Uint8Array(16);
  MD4Init(context);
  MD4Update(context, encodeAscii(value));
  MD4Final(digest, context);
  return toHex(digest);
}

assert.equal(md4Hex(""), "31d6cfe0d16ae931b73c59d7e0c089c0", "MD4 empty string mismatch");
assert.equal(md4Hex("a"), "bde52cb31de33e46245e05fbdbd6fb24", "MD4 single-character mismatch");
assert.equal(md4Hex("abc"), "a448017aaf21d8525fc10ae87aa6729d", "MD4 abc mismatch");
assert.equal(md4Hex("message digest"), "d9130a8164549fe818874806e1c7014b", "MD4 message digest mismatch");
assert.equal(
  md4Hex("abcdefghijklmnopqrstuvwxyz"),
  "d79e1c308aa5bbcdeea8ed63df412da9",
  "MD4 alphabet vector mismatch"
);
assert.equal(
  md4Hex("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"),
  "043f8582f241db351ce627e153e7f0e4",
  "MD4 alphanumeric vector mismatch"
);
assert.equal(
  md4Hex("12345678901234567890123456789012345678901234567890123456789012345678901234567890"),
  "e33b4ddc9c38f2199c3e7b164fcc0536",
  "MD4 80-byte vector mismatch"
);

const splitContext = createMD4Context();
const splitDigest = new Uint8Array(16);
MD4Init(splitContext);
MD4Update(splitContext, encodeAscii("a"));
MD4Update(splitContext, encodeAscii("b"));
MD4Update(splitContext, encodeAscii("c"));
MD4Final(splitDigest, splitContext);
assert.equal(toHex(splitDigest), "a448017aaf21d8525fc10ae87aa6729d", "MD4 incremental update mismatch");
assert.deepEqual(Array.from(splitContext.state), [0, 0, 0, 0], "MD4Final must clear state");
assert.deepEqual(Array.from(splitContext.count), [0, 0], "MD4Final must clear count");

const exactBlock = Uint8Array.from({ length: 64 }, (_, index) => index);
const exactContext = createMD4Context();
const exactDigest = new Uint8Array(16);
MD4Init(exactContext);
MD4Update(exactContext, exactBlock);
assert.deepEqual(
  Array.from(exactContext.count),
  [512, 0],
  "MD4Update must track a full 64-byte block as 512 bits"
);
assert.deepEqual(
  Array.from(exactContext.buffer),
  Array.from(exactBlock),
  "MD4Update should preserve the copied full block bytes until finalization"
);
MD4Final(exactDigest, exactContext);
assert.equal(toHex(exactDigest), "2de6578f0e7898fa17acd84b79685d3a", "MD4 exact-block byte pattern mismatch");

const partialContext = createMD4Context();
MD4Init(partialContext);
MD4Update(partialContext, exactBlock, 17);
assert.deepEqual(
  Array.from(partialContext.buffer.slice(0, 17)),
  Array.from(exactBlock.slice(0, 17)),
  "MD4Update must buffer the trailing partial block bytes"
);
assert.deepEqual(Array.from(partialContext.count), [136, 0], "MD4Update partial length count mismatch");

assert.equal(Com_BlockChecksum(encodeAscii("abc")), 1570836014, "Com_BlockChecksum abc mismatch");
assert.equal(Com_BlockChecksum(exactBlock), 71981645, "Com_BlockChecksum exact-block byte pattern mismatch");

console.log("quake2-md4: ok");
