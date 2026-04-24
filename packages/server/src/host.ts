/**
 * File: host.ts
 * Purpose: Expose configurable top-level server entry points used by qcommon host wiring.
 *
 * This file is not a direct source port.
 * It bridges qcommon-style `SV_*` hooks to either a no-op default or an attached runtime facade.
 *
 * Dependencies:
 * - packages/server/src/runtime.ts
 * - packages/server/src/server.ts
 */

import type { qboolean } from "../../qcommon/src/index.js";
import type { ServerRuntimeFacade } from "./runtime.js";
import type { server_static_t, server_t } from "./server.js";

interface ServerHostBindings {
  SV_Init?: () => void;
  SV_Shutdown?: (finalmsg: string, reconnect: qboolean) => void;
  SV_Frame?: (msec: number) => void;
}

export interface ServerHostFacadeBindingsContext {
  facade: Pick<ServerRuntimeFacade, "main">;
  sv: server_t;
  svs: server_static_t;
  onInit?: () => void;
  onShutdown?: () => void;
}

let bindings: ServerHostBindings = {};

/**
 * Category: New
 * Purpose: Attach explicit top-level server hooks used by the qcommon host runtime.
 *
 * Constraints:
 * - Keeps the default behavior compatible with `sv_null.c` until bindings are installed.
 */
export function configureServerHost(next: ServerHostBindings): void {
  bindings = { ...next };
}

/**
 * Category: New
 * Purpose: Clear the attached top-level server hooks and restore no-op defaults.
 *
 * Constraints:
 * - Must preserve the historical null-server behavior when no runtime is attached.
 */
export function resetServerHost(): void {
  bindings = {};
}

/**
 * Category: New
 * Purpose: Attach a server runtime facade to the top-level host-facing `SV_*` entry points.
 *
 * Constraints:
 * - Only binds procedures that are currently ported and exposed by the runtime facade.
 */
export function configureServerHostFromFacade(context: ServerHostFacadeBindingsContext): void {
  configureServerHost({
    SV_Init: () => {
      context.facade.main.SV_Init();
      context.svs.initialized = true;
      context.onInit?.();
    },
    SV_Shutdown: (finalmsg, reconnect) => {
      context.facade.main.SV_Shutdown(finalmsg, reconnect);
      context.onShutdown?.();
    },
    SV_Frame: (msec) => context.facade.main.SV_Frame(msec)
  });
}

/**
 * Original name: SV_Init
 * Source: server/sv_null.c
 * Category: Bridged
 * Fidelity level: Close
 *
 * Behavior:
 * - Calls the attached host binding when configured, otherwise remains a no-op like `sv_null`.
 */
export function SV_Init(): void {
  bindings.SV_Init?.();
}

/**
 * Original name: SV_Shutdown
 * Source: server/sv_null.c
 * Category: Bridged
 * Fidelity level: Close
 *
 * Behavior:
 * - Calls the attached host binding when configured, otherwise remains a no-op like `sv_null`.
 */
export function SV_Shutdown(finalmsg: string, reconnect: boolean): void {
  bindings.SV_Shutdown?.(finalmsg, reconnect);
}

/**
 * Original name: SV_Frame
 * Source: server/sv_null.c
 * Category: Bridged
 * Fidelity level: Close
 *
 * Behavior:
 * - Calls the attached host binding when configured, otherwise remains a no-op like `sv_null`.
 */
export function SV_Frame(time: number): void {
  bindings.SV_Frame?.(time);
}

export type { ServerHostBindings };
