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

assert.equal(Com_BlockChecksum(encodeAscii("abc")), 1570836014, "Com_BlockChecksum abc mismatch");

console.log("quake2-md4: ok");
