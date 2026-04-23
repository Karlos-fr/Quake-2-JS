/**
 * File: quake2-crc-header.ts
 * Purpose: Verify the TypeScript target for `qcommon/crc.h`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the CRC header-visible API.
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

let crc = CRC_Init();
assert.equal(crc, 0xffff, "CRC_Init seed mismatch");

for (const byte of new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57])) {
  crc = CRC_ProcessByte(crc, byte);
}

assert.equal(CRC_Value(crc), 0x29b1, "CRC_Value iterative mismatch");
assert.equal(CRC_Block(new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57])), 0x29b1, "CRC_Block mismatch");
assert.equal(CRC_Block(new Uint8Array([1, 2, 3, 4, 5]), 3), 0xadad, "CRC_Block partial-count mismatch");

console.log("quake2-crc-header: ok");
