/**
 * File: quake2-collision-phase9.ts
 * Purpose: Run the complete collision verification matrix and summarize runtime behavior deviations.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 9 of the collision plan.
 *
 * Dependencies:
 * - scripts/verify
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

type PhaseVerificationResult = {
  phase: number;
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
};

const COLLISION_PHASES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

main();

/**
 * Category: New
 * Purpose: Execute the full collision verification matrix and fail if any phase reports a regression.
 */
function main(): void {
  const extraArgs = process.argv.slice(2);
  const results = COLLISION_PHASES.map((phase) => runPhaseVerification(phase, extraArgs));
  const failedResults = results.filter((result) => !result.ok);

  console.log("Verification collision phase 9");
  for (const result of results) {
    console.log(`phase ${result.phase}: ${result.ok ? "OK" : `ECHEC (${result.exitCode})`}`);
    const excerpt = extractRelevantExcerpt(result);
    if (excerpt) {
      console.log(indentBlock(excerpt));
    }
  }

  if (failedResults.length > 0) {
    const failedPhases = failedResults.map((result) => result.phase).join(", ");
    throw new Error(`Des ecarts de comportement runtime ont ete detectes sur les phases: ${failedPhases}.`);
  }
}

/**
 * Category: New
 * Purpose: Run one collision verification phase as an isolated subprocess and capture its textual diagnostics.
 */
function runPhaseVerification(phase: number, extraArgs: string[]): PhaseVerificationResult {
  const scriptPath = path.resolve(process.cwd(), `scripts/verify/quake2-collision-phase${phase}.ts`);
  const result = spawnSync(process.execPath, [resolveTsxCliPath(), scriptPath, ...extraArgs], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false
  });

  return {
    phase,
    ok: result.status === 0 && !result.error,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? -1
  };
}

/**
 * Category: New
 * Purpose: Extract the most relevant diagnostic block from one phase result for summary logging.
 */
function extractRelevantExcerpt(result: PhaseVerificationResult): string {
  const combinedOutput = `${result.stdout}\n${result.stderr}`.trim();
  if (combinedOutput.length === 0) {
    return "";
  }

  const lines = combinedOutput
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (result.ok) {
    return lines.slice(0, Math.min(3, lines.length)).join("\n");
  }

  return lines.slice(-Math.min(10, lines.length)).join("\n");
}

/**
 * Category: New
 * Purpose: Indent one multi-line diagnostic block for readable phase-9 summary output.
 */
function indentBlock(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => `  ${line}`)
    .join("\n");
}

/**
 * Category: New
 * Purpose: Resolve the local `tsx` CLI entry used to execute TypeScript verification harnesses.
 */
function resolveTsxCliPath(): string {
  return path.resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
}
