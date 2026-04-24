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
import { readFileSync } from "node:fs";

import {
  GL_DISTANCE_ATTENUATION_EXT,
  GL_POINT_FADE_THRESHOLD_SIZE_EXT,
  GL_POINT_SIZE_MAX_EXT,
  GL_POINT_SIZE_MIN_EXT,
  GL_SHARED_TEXTURE_PALETTE_EXT,
  GL_TEXTURE0_SGIS,
  GL_TEXTURE1_SGIS,
  QGL_Init,
  QWGL_Init,
  createQglBootstrapHooks,
  QGL_PROCEDURES,
  QGL_OPTIONAL_PROCEDURES,
  QGL_REQUIRED_PROCEDURES,
  QGL_Shutdown,
  QWGL_Shutdown,
  QWGL_WIN32_PROCEDURES,
  createObjectQglProvider,
  createQglRuntime,
  createQwglRuntime,
  hasQglProcedure,
  hasQwglProcedure
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

const sourceHeader = readFileSync(new URL("../../Quake-2-master/ref_gl/qgl.h", import.meta.url), "utf8");
const sourceProcedures = extractSourceProcedureNames(sourceHeader);
assert.deepEqual(QGL_PROCEDURES, sourceProcedures.qgl, "QGL_PROCEDURES must match ref_gl/qgl.h declarations");
assert.deepEqual(QWGL_WIN32_PROCEDURES, sourceProcedures.qwgl, "QWGL_WIN32_PROCEDURES must match ref_gl/qgl.h declarations");

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

const qwglCallLog: string[] = [];
const qwglBindings: Record<string, unknown> = {};
for (const name of QWGL_WIN32_PROCEDURES) {
  qwglBindings[name] = () => {
    qwglCallLog.push(name);
  };
}

const qwglRuntime = createQwglRuntime();
const qwglInitialized = QWGL_Init(
  qwglRuntime,
  createObjectQglProvider(qwglBindings)
);
assert.equal(qwglInitialized, true, "QWGL_Init should succeed when all Win32 procedures are present");
assert.equal(qwglRuntime.initialized, true, "qwgl runtime.initialized mismatch");
assert.equal(qwglRuntime.missingRequiredProcedures.length, 0, "qwgl missingRequiredProcedures mismatch");
assert.equal(hasQwglProcedure(qwglRuntime, "qwglGetProcAddress"), true, "qwglGetProcAddress availability mismatch");
qwglRuntime.symbols.qwglGetProcAddress();
qwglRuntime.symbols.qwglSwapBuffers();
assert.deepEqual(qwglCallLog, ["qwglGetProcAddress", "qwglSwapBuffers"], "resolved Win32 procedure dispatch mismatch");

QWGL_Shutdown(qwglRuntime);
assert.equal(qwglRuntime.initialized, false, "qwgl runtime must be shut down");
assert.equal(hasQwglProcedure(qwglRuntime, "qwglGetProcAddress"), false, "Win32 procedure availability should reset on shutdown");

const failingQwglRuntime = createQwglRuntime();
const failingQwglInit = QWGL_Init(
  failingQwglRuntime,
  createObjectQglProvider({
    qwglGetProcAddress: () => undefined
  })
);
assert.equal(failingQwglInit, false, "QWGL_Init should fail when Win32 procedures are missing");
assert.equal(failingQwglRuntime.initialized, false, "failed QWGL init must leave runtime uninitialized");
assert.equal(failingQwglRuntime.missingRequiredProcedures.includes("qwglSwapBuffers"), true, "missing Win32 inventory mismatch");

const bootstrapCallLog: string[] = [];
const bootstrapQglBindings: Record<string, unknown> = {};
for (const name of QGL_REQUIRED_PROCEDURES) {
  bootstrapQglBindings[name] = () => undefined;
}
bootstrapQglBindings.qglGetString = (name: number) => {
  switch (name) {
    case 0x1f00:
      return "bootstrap-vendor";
    case 0x1f01:
      return "bootstrap-renderer";
    case 0x1f02:
      return "bootstrap-version";
    case 0x1f03:
      return "GL_EXT_point_parameters";
    default:
      return "";
  }
};
bootstrapQglBindings.qglPointParameterfEXT = () => {
  bootstrapCallLog.push("qglPointParameterfEXT");
};
bootstrapQglBindings.qglGetError = () => 0x0500;
const bootstrapQwglBindings: Record<string, unknown> = {};
for (const name of QWGL_WIN32_PROCEDURES) {
  bootstrapQwglBindings[name] = () => undefined;
}
bootstrapQwglBindings.qwglGetProcAddress = (name: string) => {
  bootstrapCallLog.push(`proc:${name}`);
  return () => undefined;
};
bootstrapQwglBindings.qwglSwapIntervalEXT = () => {
  bootstrapCallLog.push("qwglSwapIntervalEXT");
};

const bootstrapQglRuntime = createQglRuntime();
const bootstrapQwglRuntime = createQwglRuntime();
const bootstrapHooks = createQglBootstrapHooks({
  qglRuntime: bootstrapQglRuntime,
  qwglRuntime: bootstrapQwglRuntime,
  createQglProvider: () => createObjectQglProvider(bootstrapQglBindings),
  createQwglProvider: () => createObjectQglProvider(bootstrapQwglBindings)
});
assert.equal(bootstrapHooks.qglInit?.("opengl32"), true, "createQglBootstrapHooks init mismatch");
assert.equal(bootstrapQglRuntime.initialized, true, "bootstrap qgl runtime init mismatch");
assert.equal(bootstrapQwglRuntime.initialized, true, "bootstrap qwgl runtime init mismatch");
assert.equal(bootstrapHooks.getGlStrings?.()?.renderer, "bootstrap-renderer", "createQglBootstrapHooks GL string mismatch");
assert.equal(bootstrapHooks.getGlError?.(), 0x0500, "createQglBootstrapHooks GL error mismatch");
assert.equal(typeof bootstrapHooks.resolveBackendProc?.("glPointParameterfEXT"), "function", "createQglBootstrapHooks direct qgl proc mismatch");
assert.equal(typeof bootstrapHooks.resolveBackendProc?.("wglSwapIntervalEXT"), "function", "createQglBootstrapHooks direct qwgl proc mismatch");
assert.equal(typeof bootstrapHooks.resolveBackendProc?.("glLockArraysEXT"), "function", "createQglBootstrapHooks proc-address fallback mismatch");
assert.equal(bootstrapCallLog.includes("proc:glLockArraysEXT"), true, "createQglBootstrapHooks fallback call log mismatch");
bootstrapHooks.qglShutdown?.();
assert.equal(bootstrapQglRuntime.initialized, false, "bootstrap qgl runtime shutdown mismatch");
assert.equal(bootstrapQwglRuntime.initialized, false, "bootstrap qwgl runtime shutdown mismatch");

console.log("quake2-qgl-header: ok");

function extractSourceProcedureNames(source: string): { qgl: string[]; qwgl: string[] } {
  const qgl: string[] = [];
  const qwgl: string[] = [];
  let declaration = "";

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!declaration && !trimmed.startsWith("extern")) {
      continue;
    }

    declaration = `${declaration} ${trimmed}`.trim();
    if (!trimmed.endsWith(";")) {
      continue;
    }

    const match = /\*\s*(q(?:w)?gl[A-Za-z0-9_]+)\s*\)/.exec(declaration);
    if (match) {
      const name = match[1];
      if (name.startsWith("qwgl")) {
        qwgl.push(name);
      } else {
        qgl.push(name);
      }
    }
    declaration = "";
  }

  return { qgl, qwgl };
}
