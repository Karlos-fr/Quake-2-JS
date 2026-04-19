/**
 * File: quake2-collision-phase6.ts
 * Purpose: Expose phase-6 collision verification under the collision-plan naming convention.
 *
 * This file is not a direct source port.
 * It is a verification harness adapter for phase 6 of the collision plan.
 *
 * Dependencies:
 * - scripts/verify/quake2-door-phase6.ts
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

main();

/**
 * Category: New
 * Purpose: Forward the collision phase-6 verification to the map-backed door and platform harness.
 */
function main(): void {
  const scriptPath = path.resolve(process.cwd(), "scripts/verify/quake2-door-phase6.ts");
  const result = spawnSync(process.execPath, [resolveTsxCliPath(), scriptPath, ...process.argv.slice(2)], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`La verification collision phase 6 a echoue avec le code ${result.status}.`);
  }
}

/**
 * Category: New
 * Purpose: Resolve the local `tsx` CLI entry used to execute TypeScript verification harnesses.
 */
function resolveTsxCliPath(): string {
  return path.resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
}
