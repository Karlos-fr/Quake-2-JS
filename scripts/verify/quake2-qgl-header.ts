/**
 * File: quake2-qgl-header.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/qgl.h` preserves the current QGL symbol inventory and runtime semantics.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/renderer-three/src/qgl.ts
 * - packages/renderer-three/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  GL_DISTANCE_ATTENUATION_EXT,
  GL_POINT_FADE_THRESHOLD_SIZE_EXT,
  GL_POINT_SIZE_MAX_EXT,
  GL_POINT_SIZE_MIN_EXT,
  GL_SHARED_TEXTURE_PALETTE_EXT,
  GL_TEXTURE0_SGIS,
  GL_TEXTURE1_SGIS,
  QGL_Init,
  QGL_PROCEDURES,
  QGL_OPTIONAL_PROCEDURES,
  QGL_REQUIRED_PROCEDURES,
  QGL_Shutdown,
  QWGL_WIN32_PROCEDURES,
  createObjectQglProvider,
  createQglRuntime,
  hasQglProcedure
} from "../../packages/renderer-three/src/index.js";

assert.equal(GL_POINT_SIZE_MIN_EXT, 0x8126, "GL_POINT_SIZE_MIN_EXT mismatch");
assert.equal(GL_POINT_SIZE_MAX_EXT, 0x8127, "GL_POINT_SIZE_MAX_EXT mismatch");
assert.equal(GL_POINT_FADE_THRESHOLD_SIZE_EXT, 0x8128, "GL_POINT_FADE_THRESHOLD_SIZE_EXT mismatch");
assert.equal(GL_DISTANCE_ATTENUATION_EXT, 0x8129, "GL_DISTANCE_ATTENUATION_EXT mismatch");
assert.equal(GL_SHARED_TEXTURE_PALETTE_EXT, 0x81fb, "GL_SHARED_TEXTURE_PALETTE_EXT mismatch");
assert.equal(GL_TEXTURE0_SGIS, 0x835e, "GL_TEXTURE0_SGIS mismatch");
assert.equal(GL_TEXTURE1_SGIS, 0x835f, "GL_TEXTURE1_SGIS mismatch");

assert.equal(QGL_PROCEDURES.length, 343, "QGL_PROCEDURES count mismatch");
assert.equal(QGL_REQUIRED_PROCEDURES.length, 336, "QGL_REQUIRED_PROCEDURES count mismatch");
assert.equal(QGL_OPTIONAL_PROCEDURES.length, 7, "QGL_OPTIONAL_PROCEDURES count mismatch");
assert.equal(QGL_PROCEDURES.includes("qglAccum"), true, "qglAccum inventory mismatch");
assert.equal(QGL_PROCEDURES.includes("qglViewport"), true, "qglViewport inventory mismatch");
assert.equal(QGL_REQUIRED_PROCEDURES.includes("qglBegin"), true, "qglBegin must be required");
assert.equal(QGL_REQUIRED_PROCEDURES.includes("qglTexImage2D"), true, "qglTexImage2D must be required");
assert.equal(QGL_OPTIONAL_PROCEDURES.includes("qglColorTableEXT"), true, "qglColorTableEXT must stay optional");
assert.equal(QGL_OPTIONAL_PROCEDURES.includes("qglSelectTextureSGIS"), true, "qglSelectTextureSGIS must stay optional");
assert.equal(QWGL_WIN32_PROCEDURES.includes("qwglSwapBuffers"), true, "qwglSwapBuffers inventory mismatch");
assert.equal(QWGL_WIN32_PROCEDURES.length, 24, "QWGL_WIN32_PROCEDURES count mismatch");

const callLog: string[] = [];
const bindings: Record<string, unknown> = {};

for (const name of QGL_REQUIRED_PROCEDURES) {
  bindings[name] = () => {
    callLog.push(name);
  };
}

bindings.qglColorTableEXT = () => {
  callLog.push("qglColorTableEXT");
};

const runtime = createQglRuntime();
const initialized = QGL_Init(
  runtime,
  createObjectQglProvider(bindings)
);

assert.equal(initialized, true, "QGL_Init should succeed when all required procedures are present");
assert.equal(runtime.initialized, true, "runtime.initialized mismatch");
assert.equal(runtime.missingRequiredProcedures.length, 0, "missingRequiredProcedures mismatch");
assert.equal(hasQglProcedure(runtime, "qglBegin"), true, "qglBegin availability mismatch");
assert.equal(hasQglProcedure(runtime, "qglColorTableEXT"), true, "qglColorTableEXT availability mismatch");
assert.equal(hasQglProcedure(runtime, "qglSelectTextureSGIS"), false, "qglSelectTextureSGIS availability mismatch");

runtime.symbols.qglBegin();
runtime.symbols.qglEnd();
runtime.symbols.qglColorTableEXT?.();

assert.deepEqual(callLog, ["qglBegin", "qglEnd", "qglColorTableEXT"], "resolved procedure dispatch mismatch");
assert.equal(runtime.symbols.qglSelectTextureSGIS, null, "optional SGIS symbol should stay null when missing");

QGL_Shutdown(runtime);
assert.equal(runtime.initialized, false, "runtime must be shut down");
assert.equal(hasQglProcedure(runtime, "qglBegin"), false, "procedure availability should reset on shutdown");

const failingRuntime = createQglRuntime();
const failingInit = QGL_Init(
  failingRuntime,
  createObjectQglProvider({
    qglBegin: () => undefined
  })
);

assert.equal(failingInit, false, "QGL_Init should fail when required procedures are missing");
assert.equal(failingRuntime.initialized, false, "failed init must leave runtime uninitialized");
assert.equal(failingRuntime.missingRequiredProcedures.includes("qglEnd"), true, "missing required inventory mismatch");

console.log("quake2-qgl-header: ok");
