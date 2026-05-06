/**
 * File: quake2-crc.ts
 * Purpose: Verify the TypeScript port target for `qcommon/crc.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the CRC implementation.
 *
 * Dependencies:
 * - packages/qcommon/src/qcommon.ts
 */

import { strict as assert } from "node:assert";

import {
  CRC_Block,
  CRC_Init,
  CRC_ProcessByte,
  CRC_Value
} from "../../packages/qcommon/src/index.js";

const source = new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57]);

function referenceCrcBlock(data: Uint8Array, count = data.length): number {
  let crc = 0xffff;

  for (let index = 0; index < count; index += 1) {
    crc ^= data[index] << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }

  return crc;
}

let crc = CRC_Init();
for (const value of source) {
  crc = CRC_ProcessByte(crc, value);
}

assert.equal(CRC_Init(), 0xffff, "CRC_Init mismatch");
assert.equal(CRC_Value(CRC_Init()), 0xffff, "CRC_Value seed final-xor mismatch");
assert.equal(CRC_ProcessByte(0xffff, 49), 0xc782, "CRC_ProcessByte first-step mismatch");
assert.equal(CRC_Value(crc), 0x29b1, "CRC_Value mismatch");
assert.equal(CRC_Block(source), 0x29b1, "CRC_Block full mismatch");
assert.equal(CRC_Block(source, 4), 0x5349, "CRC_Block partial mismatch");
assert.equal(CRC_Block(new Uint8Array()), 0xffff, "CRC_Block empty mismatch");

for (const fixture of [
  new Uint8Array([0]),
  new Uint8Array([0xff]),
  new Uint8Array([0, 1, 2, 3, 4, 5, 0xfe, 0xff]),
  new Uint8Array(Array.from({ length: 256 }, (_, index) => index))
]) {
  assert.equal(CRC_Block(fixture), referenceCrcBlock(fixture), "CRC_Block bitwise-reference mismatch");
}

console.log("quake2-crc: ok");
