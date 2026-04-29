/**
 * File: quake2-full-game-three-renderer.ts
 * Purpose: Verify full-game uses the shared Three/ref_gl render loop for active gameplay.
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const source = readFileSync(join(repoRoot, "apps", "web", "src", "full-game.ts"), "utf8");
const renderLoopSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game-render-loop.ts"), "utf8");

assert.ok(source.includes("createFullGameRenderLoop"), "full-game should instantiate the shared Three/ref_gl render loop");
assert.ok(source.includes("createFullGameServerRenderSource"), "full-game should build render frames from the authoritative client state");
assert.ok(source.includes("getFullGameServerMapPath"), "full-game should derive the active renderer map from the server world model configstring");
assert.ok(source.includes("disposeFullGameRenderer"), "full-game should dispose stale Three renderers when the authoritative map changes");
assert.ok(source.includes("createThreeGlWorldSceneAdapter"), "full-game should create the Three world adapter");
assert.ok(source.includes("createRefGlHost"), "full-game should use the ref_gl host for HUD/draw commands");
assert.ok(source.includes("syncThreeCameraToRefresh"), "full-game should sync the Three camera from the refresh frame");
assert.ok(source.includes("requestFullGamePointerLock"), "full-game should own pointer lock in game mode");
assert.ok(source.includes("eventTarget instanceof HTMLElement && page.gameViewport.contains(eventTarget)"), "pointer lock should accept the clicked renderer viewport child");
assert.ok(source.includes(": page.gameViewport;"), "pointer lock should fall back to the full-game viewport");
assert.ok(source.includes("onPredictMovement"), "full-game CL_Frame hook should update predicted camera angles");
assert.ok(source.includes("CL_PredictMovement(client"), "full-game should run client prediction before rendering active gameplay");
assert.ok(source.includes("createClientPredictionCollisionSource(client, serverHost.collisionWorld)"), "full-game prediction should use the local server collision world");
assert.equal(source.includes("syncFullGamePredictionToAuthoritativeFrame"), false, "full-game should not add a non-original prediction resync path");
assert.ok(source.includes("CL_BuildActionEffects"), "full-game should play client-side muzzleflash and temp-entity sounds");
assert.ok(source.includes("CL_BuildEntityEventEffects"), "full-game should play client-side entity event sounds");
assert.ok(source.includes("onMuzzleFlash:"), "full-game should connect player muzzleflash sounds from the client parser");
assert.ok(source.includes("onMuzzleFlash2:"), "full-game should connect monster muzzleflash sounds from the client parser");
assert.ok(source.includes("applyAuthoritativeVisualEffects"), "full-game should apply muzzleflash dlights and particles from the client parser");
assert.ok(source.includes("CL_SmokeAndFlash"), "full-game should render monster muzzleflash smoke/flash effects");
assert.ok(source.includes("CL_ParticleEffect"), "full-game should render monster muzzleflash particle bursts");
assert.ok(source.includes("onTempEntity:"), "full-game should connect temp-entity sounds from the client parser");
assert.ok(source.includes("onEntityEvent:"), "full-game should connect frame entity event sounds from the client parser");
assert.ok(source.includes("SCR_DrawLoading"), "full-game should use the ported Quake II loading plaque state");
assert.ok(source.includes("drawLoadingFrame"), "full-game should render the loading plaque while waiting for the authoritative level");
assert.ok(source.includes("drawCenteredPicture(page, runtime, \"loading\")"), "full-game should draw the original loading picture centered");
assert.ok(source.includes("drawLoadingFrame(runtime, page);"), "full-game should keep the loading plaque visible while the Three renderer is pending");
assert.ok(source.includes("elapsedSeconds: runtime.client.cl.time * 0.001"), "full-game should pass absolute client time to ref_gl world rendering");
assert.ok(source.includes("const gameVisible = runtime.mode === \"game\""), "full-game should show the render viewport before the renderer finishes initializing");
assert.ok(source.includes("runtime.gameRenderer === null"), "full-game should keep the 2D loading overlay while the renderer is pending");
assert.ok(renderLoopSource.includes("getRenderableViewportSize"), "full-game render loop should guard against zero-sized hidden viewports");
assert.ok(renderLoopSource.includes("Math.max(1, width)"), "full-game render loop should never pass zero width to Three");
assert.ok(renderLoopSource.includes("Math.max(1, height)"), "full-game render loop should never pass zero height to Three");
assert.equal(source.includes("FullGameLocalSession"), false, "full-game should not depend on the legacy local-session type");
assert.equal(source.includes("createFullGameLocalSession"), false, "full-game should not create the legacy local-session harness");

console.log("quake2-full-game-three-renderer: ok");
