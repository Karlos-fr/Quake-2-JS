/**
 * File: quake2-anorms.ts
 * Purpose: Verify the strict TypeScript port of `client/anorms.h`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the canonical Quake II encoded-normal table.
 *
 * Dependencies:
 * - packages/qcommon/src/anorms.ts
 */

import { strict as assert } from "node:assert";

import { BYTE_DIRS, DirFromByte } from "../../packages/qcommon/src/anorms.js";

assert.equal(BYTE_DIRS.length, 162, "BYTE_DIRS entry count mismatch");

assert.deepEqual(BYTE_DIRS[0], [-0.525731, 0.0, 0.850651], "BYTE_DIRS[0] mismatch");
assert.deepEqual(BYTE_DIRS[5], [0.0, 0.0, 1.0], "BYTE_DIRS[5] mismatch");
assert.deepEqual(BYTE_DIRS[52], [1.0, 0.0, 0.0], "BYTE_DIRS[52] mismatch");
assert.deepEqual(BYTE_DIRS[84], [0.0, 0.0, -1.0], "BYTE_DIRS[84] mismatch");
assert.deepEqual(BYTE_DIRS[104], [0.0, -1.0, 0.0], "BYTE_DIRS[104] mismatch");
assert.deepEqual(BYTE_DIRS[143], [-1.0, 0.0, 0.0], "BYTE_DIRS[143] mismatch");
assert.deepEqual(BYTE_DIRS[161], [-0.688191, -0.587785, -0.425325], "BYTE_DIRS[161] mismatch");

const resolved = DirFromByte(52);
assert.deepEqual(resolved, [1.0, 0.0, 0.0], "DirFromByte valid index mismatch");
assert.notEqual(resolved, BYTE_DIRS[52], "DirFromByte must return a copy");

assert.deepEqual(DirFromByte(undefined), [0, 0, 1], "DirFromByte undefined fallback mismatch");
assert.deepEqual(DirFromByte(-1), [0, 0, 1], "DirFromByte negative fallback mismatch");
assert.deepEqual(DirFromByte(162), [0, 0, 1], "DirFromByte out-of-range fallback mismatch");

console.log("quake2-anorms: ok");
