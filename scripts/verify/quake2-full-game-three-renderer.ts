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
assert.ok(source.includes("createQcommonMiscRuntime"), "full-game should create the qcommon lifecycle runtime");
assert.ok(source.includes("createQcommonHostRuntime"), "full-game should create the qcommon system host runtime");
assert.ok(
  source.includes("Qcommon_Init(qcommon, {"),
  "full-game should initialize through the qcommon lifecycle adapter"
);
assert.ok(source.includes("Qcommon_Frame(qcommon, milliseconds, {"), "full-game authoritative frame should run through Qcommon_Frame");
assert.ok(source.includes("globals: qcommonGlobals"), "full-game should pass qcommon globals through the lifecycle adapter");
assert.ok(source.includes("host_speeds: Cvar_Get(cvar, \"host_speeds\", \"0\", 0)"), "full-game server host should share the qcommon host_speeds cvar");
assert.ok(source.includes("qcommonGlobals.time_before_game = milliseconds"), "full-game server host should feed host_speeds pre-game timing into qcommon globals");
assert.ok(source.includes("qcommonGlobals.time_after_game = milliseconds"), "full-game server host should feed host_speeds post-game timing into qcommon globals");
assert.ok(source.includes("hostSpeedsEnabled: () => (qcommonGlobals.host_speeds?.value ?? 0) !== 0"), "full-game client hooks should use qcommon host_speeds");
assert.ok(source.includes("qcommonGlobals.time_before_ref = milliseconds"), "full-game client hooks should feed pre-ref timing into qcommon globals");
assert.ok(source.includes("qcommonGlobals.time_after_ref = milliseconds"), "full-game client hooks should feed post-ref timing into qcommon globals");
assert.ok(source.includes("logStatsEnabled: () => (qcommonGlobals.log_stats?.value ?? 0) !== 0"), "full-game client hooks should use qcommon log_stats");
assert.ok(source.includes("Qcommon_Shutdown(runtime.qcommon)"), "full-game should shut down the qcommon lifecycle adapter");
assert.ok(source.includes("Sys_AppActivate(runtime.qcommonHost)"), "full-game should route browser activation through the qcommon system hook");
assert.ok(source.includes("host: qcommonHost"), "full-game keys should consume qcommon system hooks");
assert.ok(source.includes("runtime.captureClipboardText"), "full-game should capture browser clipboard text for Sys_GetClipboardData");
assert.ok(source.includes("getClipboardData: () => qcommonHost.hooks.sysGetClipboardData"), "full-game menu fields should use the qcommon clipboard hook");
assert.ok(source.includes("M_AddToServerList"), "full-game should route connectionless info responses into the Quake II server-list menu");
assert.ok(source.includes("onAddToServerList"), "full-game should expose the cl_main status-response hook to the web adapter");
assert.ok(source.includes("getMapList: () => readFullGameMapList(filesystem)"), "full-game start-server menu should read maps.lst through the ported menu hook");
assert.ok(source.includes("FS_LoadFile(filesystem, \"maps.lst\")"), "full-game map list hook should load maps.lst from the mounted Quake filesystem");
assert.equal(source.includes("syncFullGamePredictionToAuthoritativeFrame"), false, "full-game should not add a non-original prediction resync path");
assert.ok(source.includes("CL_BuildActionEffects"), "full-game should play client-side muzzleflash and temp-entity sounds");
assert.ok(source.includes("CL_BuildEntityEventEffects"), "full-game should play client-side entity event sounds");
assert.ok(source.includes("onMuzzleFlash:"), "full-game should connect player muzzleflash sounds from the client parser");
assert.ok(source.includes("onMuzzleFlash2:"), "full-game should connect monster muzzleflash sounds from the client parser");
assert.ok(source.includes("applyAuthoritativeVisualEffects"), "full-game should apply muzzleflash dlights and particles from the client parser");
assert.ok(source.includes("CL_SmokeAndFlash"), "full-game should render monster muzzleflash smoke/flash effects");
assert.ok(source.includes("CL_ParticleEffect"), "full-game should render monster muzzleflash particle bursts");
assert.ok(source.includes("CL_ItemRespawnParticles"), "full-game should render entity item-respawn particles");
assert.ok(source.includes("CL_TeleportParticles"), "full-game should render EV_PLAYER_TELEPORT particle lattices");
assert.ok(source.includes("onTempEntity:"), "full-game should connect temp-entity sounds from the client parser");
assert.ok(source.includes("onEntityEvent:"), "full-game should connect frame entity event sounds from the client parser");
assert.ok(source.includes("SCR_DrawLoading"), "full-game should use the ported Quake II loading plaque state");
assert.ok(source.includes("drawLoadingFrame"), "full-game should render the loading plaque while waiting for the authoritative level");
assert.ok(source.includes("drawCenteredPicture(page, runtime, \"loading\")"), "full-game should draw the original loading picture centered");
assert.ok(source.includes("drawLoadingFrame(runtime, page);"), "full-game should keep the loading plaque visible while the Three renderer is pending");
assert.ok(source.includes("forceGameInputForLevelLoad"), "full-game should force gameplay input during authoritative level loads");
assert.ok(source.includes("isAuthoritativeLevelLoading"), "full-game should track automatic authoritative level loads");
assert.ok(source.includes("shouldDrawFullGameLoadingFrame"), "full-game should prioritize the loading plaque over menu drawing");
assert.ok(source.includes("runtime.isAuthoritativeLevelLoading() && !runtime.authoritativeGameReady()"), "automatic map changes should stay in loading mode until the client is ready");
assert.equal(source.includes("shouldReconnectForAuthoritativeMap"), false, "automatic server map changes should follow original changing/reconnect commands, not web-side map-name heuristics");
assert.equal(source.includes("normalizeFullGameMapName"), false, "full-game should not compare client/server map names to synthesize reconnects");
assert.equal(source.includes("runtime.beginAuthoritativeConnection(serverMapRequest)"), false, "automatic server map changes must not restart the authoritative handshake from the web adapter");
assert.ok(source.includes("M_ForceMenuOff(menuContext)"), "full-game level loads should close the main menu when a map transition begins");
assert.ok(source.includes("onBeginLoadingPlaque: () => {\n      authoritativeLevelLoading = true;\n      client.cl.screen.scr_draw_loading = 1;\n      forceGameInputForLevelLoad();"), "client changing commands should leave menu mode during level loads");
assert.ok(source.includes("onBeginLoading: () => {\n      authoritativeLevelLoading = true;\n      client.cl.screen.scr_draw_loading = 1;\n      forceGameInputForLevelLoad();"), "server map changes should leave menu mode during level loads");
assert.ok(source.includes("elapsedSeconds: runtime.client.cl.time * 0.001"), "full-game should pass absolute client time to ref_gl world rendering");
assert.ok(source.includes("const gameVisible = runtime.mode === \"game\" || runtime.isAuthoritativeLevelLoading()"), "full-game should keep the render viewport visible during automatic level loads");
assert.ok(source.includes("runtime.client.cl.screen.scr_draw_loading !== 0"), "full-game should show the loading plaque as an overlay without hiding the game viewport");
assert.ok(source.includes("runtime.gameRenderer === null"), "full-game should keep the 2D loading overlay while the renderer is pending");
assert.ok(renderLoopSource.includes("getRenderableViewportSize"), "full-game render loop should guard against zero-sized hidden viewports");
assert.ok(renderLoopSource.includes("Math.max(1, width)"), "full-game render loop should never pass zero width to Three");
assert.ok(renderLoopSource.includes("Math.max(1, height)"), "full-game render loop should never pass zero height to Three");
assert.equal(source.includes("FullGameLocalSession"), false, "full-game should not depend on the legacy local-session type");
assert.equal(source.includes("createFullGameLocalSession"), false, "full-game should not create the legacy local-session harness");

console.log("quake2-full-game-three-renderer: ok");
