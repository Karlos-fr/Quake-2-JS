/**
 * File: quake2-web-render-order.ts
 * Purpose: Verify the browser demo frame orchestration that splits ref_gl outputs across Three.js adapters.
 *
 * This file is not a direct source port.
 * It is a static integration guard for the web runtime render order.
 *
 * Dependencies:
 * - apps/web/src/web-demo-loop.ts
 * - apps/web/src/full-game-render-loop.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const LOOP_PATH = path.join(process.cwd(), "apps", "web", "src", "web-demo-loop.ts");
const RENDER_LOOP_PATH = path.join(process.cwd(), "apps", "web", "src", "full-game-render-loop.ts");

main();

/**
 * Category: New
 * Purpose: Keep the split runtime order aligned with the documented ref_gl integration contract.
 */
function main(): void {
  const demoSource = fs.readFileSync(LOOP_PATH, "utf8");
  const renderSource = fs.readFileSync(RENDER_LOOP_PATH, "utf8");

  assert.equal(
    demoSource.includes("ref.RenderFrame(") || renderSource.includes("ref.RenderFrame("),
    false,
    "web render path should document the split renderer path instead of silently calling ref.RenderFrame"
  );
  assert.equal(
    demoSource.includes(".RenderFrame(") || renderSource.includes(".RenderFrame("),
    false,
    "web render path should not add an untracked RenderFrame call"
  );

  assertInOrder(demoSource, [
    "cameraController.update(deltaSeconds)",
    "renderLoop.renderFrame("
  ]);

  assertInOrder(renderSource, [
    "glWorldAdapter.update(",
    "skyAdapter.update(",
    "refreshEntitySync.apply(",
    "particleSync.apply(",
    "beamSync.apply(",
    "dlightSync.apply(",
    "refreshDebug.update(",
    "glDrawAdapter.clear()",
    "SCR_DrawHudRef(",
    "renderer.clear()",
    "renderer.render(scene, camera)",
    "renderer.clearDepth()",
    "renderer.render(polyblendOverlay.scene, polyblendOverlay.camera)",
    "renderer.render(glDrawAdapter.scene, glDrawAdapter.camera)"
  ]);

  assert.equal(
    renderSource.includes("crosshairValue: source.getCvarValue(\"crosshair\")"),
    true,
    "HUD pass should forward crosshair cvar to the ref draw path"
  );
  assert.equal(
    renderSource.includes("polyblendOverlay.applyFrame("),
    true,
    "shared render loop should apply the source view blend before rendering HUD"
  );
  assert.equal(
    renderSource.includes("source.getCvarValue(\"gl_polyblend\")"),
    true,
    "shared render loop should honor the gl_polyblend renderer cvar"
  );
  assert.equal(
    renderSource.includes("beamSync.apply(source.refreshFrame)"),
    true,
    "shared render loop should route refresh beams through the ref_gl beam adapter"
  );
  assert.equal(
    renderSource.includes("dlightSync.apply(source.refreshFrame)"),
    true,
    "shared render loop should route refresh dynamic lights through the ref_gl dlight adapter"
  );
  assert.equal(
    demoSource.includes("createRefreshDynamicLights") || renderSource.includes("createRefreshDynamicLights"),
    false,
    "web render path should not keep the direct PointLight dlight path"
  );

  console.log("quake2-web-render-order: ok");
}

/**
 * Category: New
 * Purpose: Assert that key frame phases appear in a stable, source-compatible order.
 */
function assertInOrder(source: string, tokens: string[]): void {
  let cursor = -1;
  for (const token of tokens) {
    const index = source.indexOf(token, cursor + 1);
    assert.notEqual(index, -1, `missing render phase: ${token}`);
    assert.equal(index > cursor, true, `render phase out of order: ${token}`);
    cursor = index;
  }
}
