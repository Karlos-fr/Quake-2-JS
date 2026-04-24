/**
 * File: ref-gl-bootstrap.ts
 * Purpose: Compose the ported `gl_rmain.c` runtime with the ported `qgl.h` bootstrap helpers.
 *
 * This file is not a direct source port.
 * It is a small integration layer that packages the classic `ref_gl` bootstrap path for host runtimes.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-rmain.ts
 * - packages/renderer-three/src/qgl.ts
 */

import { createGlRmainRuntime, type GlRmainHooks, type GlRmainRuntime } from "./gl-rmain.js";
import {
  createQglBootstrapHooks,
  createQglRuntime,
  createQwglRuntime,
  type QglRuntime,
  type QglSymbolProvider,
  type QwglRuntime
} from "./qgl.js";

type RefGlBootstrapRuntimeHooks = Omit<GlRmainHooks, "qglInit" | "qglShutdown" | "resolveBackendProc" | "getGlStrings">;

export interface RefGlBootstrapOptions {
  hooks?: RefGlBootstrapRuntimeHooks;
  qglRuntime?: QglRuntime;
  qwglRuntime?: QwglRuntime;
  createQglProvider: (driver: string) => QglSymbolProvider | null;
  createQwglProvider?: () => QglSymbolProvider | null;
}

export interface RefGlBootstrap {
  runtime: GlRmainRuntime;
  qglRuntime: QglRuntime;
  qwglRuntime?: QwglRuntime;
}

/**
 * Category: New
 * Purpose: Build one `gl_rmain` runtime already wired to the ported `QGL` / `QWGL` bootstrap flow.
 *
 * Constraints:
 * - Must keep the host-facing backend provider injection explicit.
 * - Must only create a `QWGL` runtime when the host also exposes a Win32-style provider.
 */
export function createRefGlBootstrap(options: RefGlBootstrapOptions): RefGlBootstrap {
  const qglRuntime = options.qglRuntime ?? createQglRuntime();
  const qwglRuntime = options.qwglRuntime ?? (options.createQwglProvider ? createQwglRuntime() : undefined);

  const runtime = createGlRmainRuntime({
    ...options.hooks,
    ...createQglBootstrapHooks({
      qglRuntime,
      createQglProvider: options.createQglProvider,
      ...(qwglRuntime ? { qwglRuntime } : {}),
      ...(options.createQwglProvider ? { createQwglProvider: options.createQwglProvider } : {})
    })
  });

  return {
    runtime,
    qglRuntime,
    ...(qwglRuntime ? { qwglRuntime } : {})
  };
}
