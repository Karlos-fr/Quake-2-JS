/**
 * File: qgl.ts
 * Source: Quake II original / ref_gl/qgl.h
 * Purpose: Port the QGL symbol header used by the original OpenGL renderer.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Replaces global C function pointers with an explicit runtime object.
 * - Uses browser-friendly symbol providers instead of platform GL DLL loading.
 * - Keeps Win32 `qwgl*` bindings as inventory only because native WGL bootstrap is out of scope here.
 *
 * Notes:
 * - This file is the principal attachment point for `ref_gl/qgl.h`.
 * - This tranche preserves the full `qgl.h` procedure inventory so later
 *   renderer ports can bind against the original symbol names directly.
 */

export type qboolean = boolean;

export type QglProcedure = (...args: never[]) => unknown;

export const QGL_PROCEDURES = [
  "qglAccum",
  "qglAlphaFunc",
  "qglAreTexturesResident",
  "qglArrayElement",
  "qglBegin",
  "qglBindTexture",
  "qglBitmap",
  "qglBlendFunc",
  "qglCallList",
  "qglCallLists",
  "qglClear",
  "qglClearAccum",
  "qglClearColor",
  "qglClearDepth",
  "qglClearIndex",
  "qglClearStencil",
  "qglClipPlane",
  "qglColor3b",
  "qglColor3bv",
  "qglColor3d",
  "qglColor3dv",
  "qglColor3f",
  "qglColor3fv",
  "qglColor3i",
  "qglColor3iv",
  "qglColor3s",
  "qglColor3sv",
  "qglColor3ub",
  "qglColor3ubv",
  "qglColor3ui",
  "qglColor3uiv",
  "qglColor3us",
  "qglColor3usv",
  "qglColor4b",
  "qglColor4bv",
  "qglColor4d",
  "qglColor4dv",
  "qglColor4f",
  "qglColor4fv",
  "qglColor4i",
  "qglColor4iv",
  "qglColor4s",
  "qglColor4sv",
  "qglColor4ub",
  "qglColor4ubv",
  "qglColor4ui",
  "qglColor4uiv",
  "qglColor4us",
  "qglColor4usv",
  "qglColorMask",
  "qglColorMaterial",
  "qglColorPointer",
  "qglCopyPixels",
  "qglCopyTexImage1D",
  "qglCopyTexImage2D",
  "qglCopyTexSubImage1D",
  "qglCopyTexSubImage2D",
  "qglCullFace",
  "qglDeleteLists",
  "qglDeleteTextures",
  "qglDepthFunc",
  "qglDepthMask",
  "qglDepthRange",
  "qglDisable",
  "qglDisableClientState",
  "qglDrawArrays",
  "qglDrawBuffer",
  "qglDrawElements",
  "qglDrawPixels",
  "qglEdgeFlag",
  "qglEdgeFlagPointer",
  "qglEdgeFlagv",
  "qglEnable",
  "qglEnableClientState",
  "qglEnd",
  "qglEndList",
  "qglEvalCoord1d",
  "qglEvalCoord1dv",
  "qglEvalCoord1f",
  "qglEvalCoord1fv",
  "qglEvalCoord2d",
  "qglEvalCoord2dv",
  "qglEvalCoord2f",
  "qglEvalCoord2fv",
  "qglEvalMesh1",
  "qglEvalMesh2",
  "qglEvalPoint1",
  "qglEvalPoint2",
  "qglFeedbackBuffer",
  "qglFinish",
  "qglFlush",
  "qglFogf",
  "qglFogfv",
  "qglFogi",
  "qglFogiv",
  "qglFrontFace",
  "qglFrustum",
  "qglGenLists",
  "qglGenTextures",
  "qglGetBooleanv",
  "qglGetClipPlane",
  "qglGetDoublev",
  "qglGetError",
  "qglGetFloatv",
  "qglGetIntegerv",
  "qglGetLightfv",
  "qglGetLightiv",
  "qglGetMapdv",
  "qglGetMapfv",
  "qglGetMapiv",
  "qglGetMaterialfv",
  "qglGetMaterialiv",
  "qglGetPixelMapfv",
  "qglGetPixelMapuiv",
  "qglGetPixelMapusv",
  "qglGetPointerv",
  "qglGetPolygonStipple",
  "qglGetString",
  "qglGetTexEnvfv",
  "qglGetTexEnviv",
  "qglGetTexGendv",
  "qglGetTexGenfv",
  "qglGetTexGeniv",
  "qglGetTexImage",
  "qglGetTexLevelParameterfv",
  "qglGetTexLevelParameteriv",
  "qglGetTexParameterfv",
  "qglGetTexParameteriv",
  "qglHint",
  "qglIndexMask",
  "qglIndexPointer",
  "qglIndexd",
  "qglIndexdv",
  "qglIndexf",
  "qglIndexfv",
  "qglIndexi",
  "qglIndexiv",
  "qglIndexs",
  "qglIndexsv",
  "qglIndexub",
  "qglIndexubv",
  "qglInitNames",
  "qglInterleavedArrays",
  "qglIsEnabled",
  "qglIsList",
  "qglIsTexture",
  "qglLightModelf",
  "qglLightModelfv",
  "qglLightModeli",
  "qglLightModeliv",
  "qglLightf",
  "qglLightfv",
  "qglLighti",
  "qglLightiv",
  "qglLineStipple",
  "qglLineWidth",
  "qglListBase",
  "qglLoadIdentity",
  "qglLoadMatrixd",
  "qglLoadMatrixf",
  "qglLoadName",
  "qglLogicOp",
  "qglMap1d",
  "qglMap1f",
  "qglMap2d",
  "qglMap2f",
  "qglMapGrid1d",
  "qglMapGrid1f",
  "qglMapGrid2d",
  "qglMapGrid2f",
  "qglMaterialf",
  "qglMaterialfv",
  "qglMateriali",
  "qglMaterialiv",
  "qglMatrixMode",
  "qglMultMatrixd",
  "qglMultMatrixf",
  "qglNewList",
  "qglNormal3b",
  "qglNormal3bv",
  "qglNormal3d",
  "qglNormal3dv",
  "qglNormal3f",
  "qglNormal3fv",
  "qglNormal3i",
  "qglNormal3iv",
  "qglNormal3s",
  "qglNormal3sv",
  "qglNormalPointer",
  "qglOrtho",
  "qglPassThrough",
  "qglPixelMapfv",
  "qglPixelMapuiv",
  "qglPixelMapusv",
  "qglPixelStoref",
  "qglPixelStorei",
  "qglPixelTransferf",
  "qglPixelTransferi",
  "qglPixelZoom",
  "qglPointSize",
  "qglPolygonMode",
  "qglPolygonOffset",
  "qglPolygonStipple",
  "qglPopAttrib",
  "qglPopClientAttrib",
  "qglPopMatrix",
  "qglPopName",
  "qglPrioritizeTextures",
  "qglPushAttrib",
  "qglPushClientAttrib",
  "qglPushMatrix",
  "qglPushName",
  "qglRasterPos2d",
  "qglRasterPos2dv",
  "qglRasterPos2f",
  "qglRasterPos2fv",
  "qglRasterPos2i",
  "qglRasterPos2iv",
  "qglRasterPos2s",
  "qglRasterPos2sv",
  "qglRasterPos3d",
  "qglRasterPos3dv",
  "qglRasterPos3f",
  "qglRasterPos3fv",
  "qglRasterPos3i",
  "qglRasterPos3iv",
  "qglRasterPos3s",
  "qglRasterPos3sv",
  "qglRasterPos4d",
  "qglRasterPos4dv",
  "qglRasterPos4f",
  "qglRasterPos4fv",
  "qglRasterPos4i",
  "qglRasterPos4iv",
  "qglRasterPos4s",
  "qglRasterPos4sv",
  "qglReadBuffer",
  "qglReadPixels",
  "qglRectd",
  "qglRectdv",
  "qglRectf",
  "qglRectfv",
  "qglRecti",
  "qglRectiv",
  "qglRects",
  "qglRectsv",
  "qglRenderMode",
  "qglRotated",
  "qglRotatef",
  "qglScaled",
  "qglScalef",
  "qglScissor",
  "qglSelectBuffer",
  "qglShadeModel",
  "qglStencilFunc",
  "qglStencilMask",
  "qglStencilOp",
  "qglTexCoord1d",
  "qglTexCoord1dv",
  "qglTexCoord1f",
  "qglTexCoord1fv",
  "qglTexCoord1i",
  "qglTexCoord1iv",
  "qglTexCoord1s",
  "qglTexCoord1sv",
  "qglTexCoord2d",
  "qglTexCoord2dv",
  "qglTexCoord2f",
  "qglTexCoord2fv",
  "qglTexCoord2i",
  "qglTexCoord2iv",
  "qglTexCoord2s",
  "qglTexCoord2sv",
  "qglTexCoord3d",
  "qglTexCoord3dv",
  "qglTexCoord3f",
  "qglTexCoord3fv",
  "qglTexCoord3i",
  "qglTexCoord3iv",
  "qglTexCoord3s",
  "qglTexCoord3sv",
  "qglTexCoord4d",
  "qglTexCoord4dv",
  "qglTexCoord4f",
  "qglTexCoord4fv",
  "qglTexCoord4i",
  "qglTexCoord4iv",
  "qglTexCoord4s",
  "qglTexCoord4sv",
  "qglTexCoordPointer",
  "qglTexEnvf",
  "qglTexEnvfv",
  "qglTexEnvi",
  "qglTexEnviv",
  "qglTexGend",
  "qglTexGendv",
  "qglTexGenf",
  "qglTexGenfv",
  "qglTexGeni",
  "qglTexGeniv",
  "qglTexImage1D",
  "qglTexImage2D",
  "qglTexParameterf",
  "qglTexParameterfv",
  "qglTexParameteri",
  "qglTexParameteriv",
  "qglTexSubImage1D",
  "qglTexSubImage2D",
  "qglTranslated",
  "qglTranslatef",
  "qglVertex2d",
  "qglVertex2dv",
  "qglVertex2f",
  "qglVertex2fv",
  "qglVertex2i",
  "qglVertex2iv",
  "qglVertex2s",
  "qglVertex2sv",
  "qglVertex3d",
  "qglVertex3dv",
  "qglVertex3f",
  "qglVertex3fv",
  "qglVertex3i",
  "qglVertex3iv",
  "qglVertex3s",
  "qglVertex3sv",
  "qglVertex4d",
  "qglVertex4dv",
  "qglVertex4f",
  "qglVertex4fv",
  "qglVertex4i",
  "qglVertex4iv",
  "qglVertex4s",
  "qglVertex4sv",
  "qglVertexPointer",
  "qglViewport",
  "qglPointParameterfEXT",
  "qglPointParameterfvEXT",
  "qglColorTableEXT",
  "qglLockArraysEXT",
  "qglUnlockArraysEXT",
  "qglMTexCoord2fSGIS",
  "qglSelectTextureSGIS"
] as const;

export const QGL_OPTIONAL_PROCEDURES = [
  "qglPointParameterfEXT",
  "qglPointParameterfvEXT",
  "qglColorTableEXT",
  "qglLockArraysEXT",
  "qglUnlockArraysEXT",
  "qglMTexCoord2fSGIS",
  "qglSelectTextureSGIS"
] as const;

export const QWGL_WIN32_PROCEDURES = [
  "qwglChoosePixelFormat",
  "qwglDescribePixelFormat",
  "qwglGetPixelFormat",
  "qwglSetPixelFormat",
  "qwglSwapBuffers",
  "qwglCopyContext",
  "qwglCreateContext",
  "qwglCreateLayerContext",
  "qwglDeleteContext",
  "qwglGetCurrentContext",
  "qwglGetCurrentDC",
  "qwglGetProcAddress",
  "qwglMakeCurrent",
  "qwglShareLists",
  "qwglUseFontBitmaps",
  "qwglUseFontOutlines",
  "qwglDescribeLayerPlane",
  "qwglSetLayerPaletteEntries",
  "qwglGetLayerPaletteEntries",
  "qwglRealizeLayerPalette",
  "qwglSwapLayerBuffers",
  "qwglSwapIntervalEXT",
  "qwglGetDeviceGammaRampEXT",
  "qwglSetDeviceGammaRampEXT"
] as const;

export type QglProcedureName = (typeof QGL_PROCEDURES)[number];
export type QglOptionalProcedure = (typeof QGL_OPTIONAL_PROCEDURES)[number];
export type QglRequiredProcedure = Exclude<QglProcedureName, QglOptionalProcedure>;
export type QglInventoryProcedure = QglProcedureName;
export type QwglProcedureName = (typeof QWGL_WIN32_PROCEDURES)[number];

const QGL_OPTIONAL_PROCEDURE_SET = new Set<QglOptionalProcedure>(QGL_OPTIONAL_PROCEDURES);

export const QGL_REQUIRED_PROCEDURES = QGL_PROCEDURES.filter(
  (name): name is QglRequiredProcedure => !QGL_OPTIONAL_PROCEDURE_SET.has(name as QglOptionalProcedure)
);

export type QglDispatchTable = {
  [K in QglRequiredProcedure]: QglProcedure;
} & {
  [K in QglOptionalProcedure]: QglProcedure | null;
};

export interface QglSymbolProvider {
  resolve(name: string): unknown;
  shutdown?(): void;
}

export interface QglRuntime {
  initialized: boolean;
  provider: QglSymbolProvider | null;
  availableProcedures: Set<QglInventoryProcedure>;
  missingRequiredProcedures: QglRequiredProcedure[];
  symbols: QglDispatchTable;
}

export interface QglInitOptions {
  extraRequiredProcedures?: readonly string[];
}

export const GL_POINT_SIZE_MIN_EXT = 0x8126;
export const GL_POINT_SIZE_MAX_EXT = 0x8127;
export const GL_POINT_FADE_THRESHOLD_SIZE_EXT = 0x8128;
export const GL_DISTANCE_ATTENUATION_EXT = 0x8129;
export const GL_SHARED_TEXTURE_PALETTE_EXT = 0x81fb;
export const GL_TEXTURE0_SGIS = 0x835e;
export const GL_TEXTURE1_SGIS = 0x835f;

/**
 * Category: New
 * Purpose: Create the explicit runtime replacing the global symbol pointers declared in `qgl.h`.
 */
export function createQglRuntime(): QglRuntime {
  return {
    initialized: false,
    provider: null,
    availableProcedures: new Set<QglInventoryProcedure>(),
    missingRequiredProcedures: [],
    symbols: createEmptyDispatchTable()
  };
}

/**
 * Category: New
 * Purpose: Build a symbol provider from a plain object containing procedure bindings.
 */
export function createObjectQglProvider(bindings: Record<string, unknown>): QglSymbolProvider {
  return {
    resolve(name: string): unknown {
      return bindings[name];
    }
  };
}

/**
 * Original name: QGL_Init
 * Source: ref_gl/qgl.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Resolves the QGL procedures needed by the renderer and reports whether startup succeeded.
 *
 * Porting notes:
 * - The original DLL loading is replaced by an injected symbol provider.
 * - Optional extension entries stay nullable, matching the original `if (qglFooEXT)` usage pattern.
 */
export function QGL_Init(runtime: QglRuntime, provider: QglSymbolProvider, options: QglInitOptions = {}): qboolean {
  QGL_Shutdown(runtime);

  const missingRequiredProcedures: QglRequiredProcedure[] = [];
  const availableProcedures = new Set<QglInventoryProcedure>();
  const symbols = createEmptyDispatchTable();

  for (const name of QGL_REQUIRED_PROCEDURES) {
    const resolved = provider.resolve(name);
    if (!isQglProcedure(resolved)) {
      missingRequiredProcedures.push(name);
      continue;
    }

    symbols[name] = resolved;
    availableProcedures.add(name);
  }

  for (const name of QGL_OPTIONAL_PROCEDURES) {
    const resolved = provider.resolve(name);
    if (isQglProcedure(resolved)) {
      symbols[name] = resolved;
      availableProcedures.add(name);
    } else {
      symbols[name] = null;
    }
  }

  const extraRequiredProcedures = options.extraRequiredProcedures ?? [];
  for (const name of extraRequiredProcedures) {
    const resolved = provider.resolve(name);
    if (!isQglProcedure(resolved)) {
      runtime.provider = provider;
      runtime.availableProcedures = availableProcedures;
      runtime.missingRequiredProcedures = missingRequiredProcedures;
      runtime.symbols = symbols;
      provider.shutdown?.();
      runtime.provider = null;
      return false;
    }
  }

  runtime.provider = provider;
  runtime.availableProcedures = availableProcedures;
  runtime.missingRequiredProcedures = missingRequiredProcedures;
  runtime.symbols = symbols;
  runtime.initialized = missingRequiredProcedures.length === 0;

  if (!runtime.initialized) {
    provider.shutdown?.();
    runtime.provider = null;
    return false;
  }

  return true;
}

/**
 * Original name: QGL_Shutdown
 * Source: ref_gl/qgl.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Releases the active provider and clears all resolved symbol pointers.
 */
export function QGL_Shutdown(runtime: QglRuntime): void {
  runtime.provider?.shutdown?.();
  runtime.initialized = false;
  runtime.provider = null;
  runtime.availableProcedures.clear();
  runtime.missingRequiredProcedures = [];
  runtime.symbols = createEmptyDispatchTable();
}

/**
 * Category: New
 * Purpose: Test whether one QGL symbol is currently available in the runtime.
 */
export function hasQglProcedure(runtime: QglRuntime, name: QglInventoryProcedure): boolean {
  return runtime.availableProcedures.has(name);
}

function createEmptyDispatchTable(): QglDispatchTable {
  const unbound = createUnboundRequiredProcedure();
  const table = {} as Partial<Record<QglProcedureName, QglProcedure | null>>;

  for (const name of QGL_REQUIRED_PROCEDURES) {
    table[name] = unbound;
  }

  for (const name of QGL_OPTIONAL_PROCEDURES) {
    table[name] = null;
  }

  return table as QglDispatchTable;
}

function createUnboundRequiredProcedure(): QglProcedure {
  return () => {
    throw new Error("QGL procedure called before successful QGL_Init");
  };
}

function isQglProcedure(value: unknown): value is QglProcedure {
  return typeof value === "function";
}
