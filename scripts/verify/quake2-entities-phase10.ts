/**
 * File: quake2-entities-phase10.ts
 * Purpose: Verify that the web app uses the client refresh pipeline as the primary visible-world-entity path and no longer imports the legacy BSP preview builder.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 10 of the visible-entities plan.
 *
 * Dependencies:
 * - Node.js fs/path
 */

import fs from "node:fs";
import path from "node:path";

main();

/**
 * Category: New
 * Purpose: Execute the phase-10 fallback-path assertions over the current repo files.
 */
function main(): void {
  const webMainPath = path.join(process.cwd(), "apps", "web", "src", "main.ts");
  const rendererIndexPath = path.join(process.cwd(), "packages", "renderer-three", "src", "index.ts");
  const previewBuilderPath = path.join(process.cwd(), "packages", "renderer-three", "src", "entity-preview-builder.ts");

  const webMain = fs.readFileSync(webMainPath, "utf8");
  const rendererIndex = fs.readFileSync(rendererIndexPath, "utf8");

  assertContains(webMain, "createThreeRefreshEntitySync", "apps/web main uses refresh-entity sync");
  assertNotContains(webMain, "buildEntityPreviewGroup", "apps/web main no longer uses BSP preview builder");
  assertNotContains(webMain, "updateEntityPreviewGroup", "apps/web main no longer updates BSP preview builder");
  assertNotContains(rendererIndex, "entity-preview-builder", "renderer-three public API no longer re-exports preview builder");
  assertBoolean(fs.existsSync(previewBuilderPath), false, "legacy preview builder file removed");

  console.log("Verification phase 10 - client refresh pipeline is the primary world-entity path");
}

/**
 * Category: New
 * Purpose: Assert one boolean condition with a readable label.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Fail when one expected substring is missing from the checked file text.
 */
function assertContains(content: string, expectedSubstring: string, label: string): void {
  if (!content.includes(expectedSubstring)) {
    throw new Error(`${label}: substring introuvable: ${expectedSubstring}`);
  }
}

/**
 * Category: New
 * Purpose: Fail when one forbidden substring is still present in the checked file text.
 */
function assertNotContains(content: string, forbiddenSubstring: string, label: string): void {
  if (content.includes(forbiddenSubstring)) {
    throw new Error(`${label}: substring encore presente: ${forbiddenSubstring}`);
  }
}
