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

let crc = CRC_Init();
for (const value of source) {
  crc = CRC_ProcessByte(crc, value);
}

assert.equal(CRC_Init(), 0xffff, "CRC_Init mismatch");
assert.equal(CRC_ProcessByte(0xffff, 49), 0xc782, "CRC_ProcessByte first-step mismatch");
assert.equal(CRC_Value(crc), 0x29b1, "CRC_Value mismatch");
assert.equal(CRC_Block(source), 0x29b1, "CRC_Block full mismatch");
assert.equal(CRC_Block(source, 4), 0x5349, "CRC_Block partial mismatch");

console.log("quake2-crc: ok");
