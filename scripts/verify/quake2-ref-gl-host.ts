/**
 * File: quake2-ref-gl-host.ts
 * Purpose: Verify that the minimal `ref_gl` host helper exposes one ready-to-use `refexport_t` over the ported bootstrap path.
 *
 * This file is not a direct source port.
 * It is a focused integration harness for the new host composition layer.
 *
 * Dependencies:
 * - packages/renderer-three/src/ref-gl-host.ts
 * - packages/renderer-three/src/qgl.ts
 * - packages/client/src/ref.ts
 */

import { strict as assert } from "node:assert";

import { createCvarRuntime, Cvar_Get } from "../../packages/qcommon/src/cvar.js";
import { RDF_NOWORLDMODEL } from "../../packages/qcommon/src/index.js";
import { createRefDef } from "../../packages/client/src/ref.js";
import {
  QGL_REQUIRED_PROCEDURES,
  QWGL_WIN32_PROCEDURES,
  createGlImageRuntime,
  createGlWarpRuntime,
  createObjectQglProvider,
  createRefGlHost
} from "../../packages/renderer-three/src/index.js";

const cvarRuntime = createCvarRuntime();
const log: string[] = [];
const addedCommands: string[] = [];
const commandCallbacks = new Map<string, () => void>();
const removedCommands: string[] = [];
const qglBindings: Record<string, unknown> = {};
const qwglBindings: Record<string, unknown> = {};
let screenshotPath = "";
let texturedQuadCount = 0;
let solidQuadCount = 0;

for (const name of QGL_REQUIRED_PROCEDURES) {
  qglBindings[name] = () => undefined;
}
qglBindings.qglGetString = (name: number) => {
  switch (name) {
    case 0x1f00:
      return "HostVendor";
    case 0x1f01:
      return "HostRenderer";
    case 0x1f02:
      return "1.0";
    case 0x1f03:
      return "GL_EXT_compiled_vertex_array WGL_EXT_swap_control";
    default:
      return "";
  }
};
qglBindings.qglGetError = () => 0;
qglBindings.qglClearColor = (r: number, g: number, b: number, a: number) => {
  log.push(`clearColor:${r},${g},${b},${a}`);
};
qglBindings.qglLockArraysEXT = () => undefined;
qglBindings.qglUnlockArraysEXT = () => undefined;

for (const name of QWGL_WIN32_PROCEDURES) {
  qwglBindings[name] = () => undefined;
}

const cvarByName = new Map<string, ReturnType<typeof Cvar_Get>>();
const palette = createTestPalette();
const fileMap = new Map<string, Uint8Array>([
  ["pics/colormap.pcx", createPcxFile(1, 1, Uint8Array.from([0]), palette)],
  ["pics/conchars.pcx", createPcxFile(128, 128, new Uint8Array(128 * 128), palette)],
  ["pics/test.pcx", createPcxFile(16, 8, new Uint8Array(16 * 8), palette)]
]);
const imageRuntime = createGlImageRuntime({
  loadFile: (path) => fileMap.get(path) ?? null,
  uploadImage: (_image, source) => ({
    upload_width: source.width,
    upload_height: source.height,
    has_alpha: true,
    paletted: false
  })
});
const warpRuntime = createGlWarpRuntime();
warpRuntime.turbulence_scale = 1;
const host = createRefGlHost({
  createQglProvider: () => createObjectQglProvider(qglBindings),
  createQwglProvider: () => createObjectQglProvider(qwglBindings),
  imageRuntime,
  warpRuntime,
  drawHooks: {
    drawTexturedQuad: () => {
      texturedQuadCount += 1;
    },
    drawSolidQuad: () => {
      solidQuadCount += 1;
    }
  },
  rmiscHooks: {
    ensureDirectory: (directory) => {
      log.push(`mkdir:${directory}`);
    },
    listFiles: () => [],
    readPixels: () => Uint8Array.from([1, 2, 3]),
    writeFile: (path) => {
      screenshotPath = path;
    }
  },
  hooks: {
    glimpInit: () => true,
    glimpShutdown: () => {
      log.push("glimpShutdown");
    },
    glimpEndFrame: () => {
      log.push("glimpEndFrame");
    },
    glimpAppActivate: (activate) => {
      log.push(`glimpAppActivate:${activate}`);
    },
    glimpSetMode: () => ({ err: 0, width: 640, height: 480 }),
    glimpBeginFrame: (cameraSeparation) => {
      log.push(`begin:${cameraSeparation}`);
    },
    print: (_level, message) => {
      log.push(message.trimEnd());
    },
    onSetGL2D: (viewport) => {
      log.push(`gl2d:${viewport.width}x${viewport.height}`);
    }
  },
  imports: {
    Cmd_AddCommand: (name, command) => {
      addedCommands.push(name);
      commandCallbacks.set(name, command);
    },
    Cmd_RemoveCommand: (name) => {
      removedCommands.push(name);
    },
    Con_Printf: (_level, message) => {
      log.push(message.trimEnd());
    },
    FS_Gamedir: () => "baseq2",
    Cvar_Get: (name, value, flags) => {
      const existing = cvarByName.get(name);
      if (existing) {
        return existing;
      }
      const created = Cvar_Get(cvarRuntime, name, value, flags);
      cvarByName.set(name, created);
      return created;
    },
    Cvar_Set: (name, value) => {
      const target = cvarByName.get(name) ?? Cvar_Get(cvarRuntime, name, value, 0);
      target.string = value;
      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        target.value = numeric;
      }
      cvarByName.set(name, target);
      return target;
    },
    Cvar_SetValue: (name, value) => {
      const target = cvarByName.get(name);
      if (!target) {
        return;
      }
      target.value = value;
      target.string = String(value);
    }
  },
  apiHooks: {
    swapInit: () => {
      log.push("swapInit");
    },
    endFrame: () => {
      log.push("endFrame");
    }
  }
});

assert.equal(host.api.api_version > 0, true, "createRefGlHost api version mismatch");
assert.equal(log.includes("swapInit"), true, "createRefGlHost swap init mismatch");
assert.equal(host.init(), true, "createRefGlHost init helper mismatch");
assert.equal(host.qglRuntime.initialized, true, "createRefGlHost qgl runtime init mismatch");
assert.equal(host.qwglRuntime?.initialized, true, "createRefGlHost qwgl runtime init mismatch");
assert.equal(addedCommands.includes("imagelist"), true, "createRefGlHost command registration mismatch");
assert.equal(log.includes("clearColor:1,0,0.5,0.5"), true, "createRefGlHost GL_SetDefaultState wiring mismatch");
assert.equal(host.imageRuntime?.r_particletexture?.name, "***particle***", "createRefGlHost particle texture wiring mismatch");
assert.equal(host.imageRuntime?.r_notexture?.name, "***r_notexture***", "createRefGlHost no-texture wiring mismatch");
assert.equal(host.runtime.r_particletexture?.name, "***particle***", "createRefGlHost rmain particle wiring mismatch");
assert.equal(warpRuntime.turbulence_scale, 0.5, "createRefGlHost turbulence scale wiring mismatch");
assert.equal(host.api.DrawGetPicSize("test").width, 16, "createRefGlHost DrawGetPicSize gl_draw wiring mismatch");
host.api.DrawPic(8, 12, "test");
host.api.DrawChar(4, 6, 65);
host.api.DrawFill(0, 0, 3, 5, 12);
assert.equal(texturedQuadCount, 2, "createRefGlHost textured draw wiring mismatch");
assert.equal(solidQuadCount, 1, "createRefGlHost solid draw wiring mismatch");

commandCallbacks.get("gl_strings")?.();
assert.equal(log.includes("GL_VENDOR: HostVendor"), true, "createRefGlHost gl_strings command wiring mismatch");

commandCallbacks.get("screenshot")?.();
assert.equal(screenshotPath, "baseq2/scrnshot/quake00.tga", "createRefGlHost screenshot command wiring mismatch");
assert.equal(log.includes("mkdir:baseq2/scrnshot"), true, "createRefGlHost screenshot directory wiring mismatch");

const frame = createRefDef();
frame.width = 320;
frame.height = 200;
frame.fov_x = 90;
frame.fov_y = 75;
frame.rdflags = RDF_NOWORLDMODEL;
host.api.BeginFrame(0.5);
host.api.RenderFrame(frame);
assert.equal(log.includes("begin:0.5"), true, "createRefGlHost BeginFrame mismatch");
assert.equal(log.includes("gl2d:640x480"), true, "createRefGlHost RenderFrame 2D reset mismatch");

host.api.EndFrame();
assert.equal(log.includes("endFrame"), true, "createRefGlHost EndFrame mismatch");
assert.equal(log.includes("glimpEndFrame"), true, "createRefGlHost GLimp_EndFrame mismatch");

host.api.AppActivate(true);
assert.equal(log.includes("glimpAppActivate:true"), true, "createRefGlHost GLimp_AppActivate mismatch");

host.shutdown();
assert.equal(host.qglRuntime.initialized, false, "createRefGlHost qgl runtime shutdown mismatch");
assert.equal(host.qwglRuntime?.initialized, false, "createRefGlHost qwgl runtime shutdown mismatch");
assert.equal(log.includes("glimpShutdown"), true, "createRefGlHost glimp shutdown mismatch");
assert.deepEqual(removedCommands, ["modellist", "screenshot", "imagelist", "gl_strings"], "createRefGlHost command cleanup mismatch");

console.log("quake2-ref-gl-host: ok");

function createPcxFile(width: number, height: number, indices: Uint8Array, paletteRgb: Uint8Array): Uint8Array {
  const header = new Uint8Array(128);
  header[0] = 0x0a;
  header[1] = 5;
  header[2] = 1;
  header[3] = 8;
  writeShort(header, 4, 0);
  writeShort(header, 6, 0);
  writeShort(header, 8, width - 1);
  writeShort(header, 10, height - 1);
  writeShort(header, 12, width);
  writeShort(header, 14, height);
  header[65] = 1;
  writeShort(header, 66, width);
  writeShort(header, 68, 1);

  const encoded: number[] = [];
  for (const value of indices) {
    if ((value & 0xc0) === 0xc0) {
      encoded.push(0xc1, value);
    } else {
      encoded.push(value);
    }
  }

  const bytes = new Uint8Array(128 + encoded.length + 1 + 768);
  bytes.set(header, 0);
  bytes.set(encoded, 128);
  bytes[128 + encoded.length] = 0x0c;
  bytes.set(paletteRgb, 128 + encoded.length + 1);
  return bytes;
}

function createTestPalette(): Uint8Array {
  const paletteRgb = new Uint8Array(768);
  for (let i = 0; i < 256; i += 1) {
    paletteRgb[i * 3] = i & 0xff;
    paletteRgb[i * 3 + 1] = (i * 2) & 0xff;
    paletteRgb[i * 3 + 2] = (i * 3) & 0xff;
  }
  return paletteRgb;
}

function writeShort(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >> 8) & 0xff;
}
