/**
 * File: quake2-full-game-demo-cleanup.ts
 * Purpose: Verify full-game keeps demo/local-session shortcuts out of the authoritative path.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CL_InitInput,
  CL_InitLocal,
  V_Init,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  createClientViewContext
} from "../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  mountPak
} from "../../packages/filesystem/src/index.js";
import {
  CS_MODELS,
  DF_INFINITE_AMMO,
  STAT_LAYOUTS,
  Cmd_Init,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import { FindItem } from "../../packages/game/src/index.js";
import { createFullGameLocalSession } from "../../apps/web/src/full-game-local-session.js";

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game demo cleanup verification");

const fullGameLocalSessionSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "full-game-local-session.ts"),
  "utf8"
);
const fullGameSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "full-game.ts"),
  "utf8"
);
const clientMenuSources = [
  "menu.ts",
  "menu-runtime.ts",
  "menu-main-game.ts",
  "menu-draw.ts",
  "menu-types.ts",
  "qmenu.ts"
].map((file) => ({
  file,
  source: readFileSync(join(repoRoot, "packages", "client", "src", file), "utf8")
}));
const menuMainGameSource = clientMenuSources.find((entry) => entry.file === "menu-main-game.ts")?.source ?? "";
const vidMenuSource = readFileSync(
  join(repoRoot, "packages", "client", "src", "vid-menu.ts"),
  "utf8"
);
const renderLoopSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "full-game-render-loop.ts"),
  "utf8"
);
const threeGlDrawAdapterSource = readFileSync(
  join(repoRoot, "packages", "renderer-three", "src", "three-gl-draw-adapter.ts"),
  "utf8"
);
const webDemoLoopSource = readFileSync(
  join(repoRoot, "apps", "web", "src", "web-demo-loop.ts"),
  "utf8"
);
assert.equal(
  fullGameSource.includes("full-game-local-session"),
  false,
  "authoritative full-game must not import the legacy local-session harness"
);
assert.equal(
  fullGameSource.includes("createFullGameLocalSession"),
  false,
  "authoritative full-game must not create the legacy local-session harness"
);
assert.equal(
  fullGameSource.includes("startFullGameAttractLoop(runtime, page);"),
  true,
  "full-game startup should enter the source attract loop"
);
assert.equal(
  fullGameSource.includes('demomap idlog.cin ; set nextserver q2js_d2'),
  true,
  "full-game attract loop should start with the logo cinematic"
);
assert.equal(
  fullGameSource.includes('demomap ntro.cin ; set nextserver q2js_d3'),
  true,
  "full-game attract loop should play the intro cinematic before the in-game demo"
);
assert.equal(
  fullGameSource.includes('demomap demo1.dm2 ; set nextserver q2js_d4'),
  true,
  "full-game attract loop should continue into the in-game demo"
);
assert.equal(
  fullGameSource.includes('demomap demo2.dm2 ; set nextserver q2js_d1'),
  true,
  "full-game attract loop should play the second in-game demo before looping"
);
assert.equal(
  fullGameSource.includes('demomap idlog.cin ; set nextserver q2js_d5'),
  false,
  "full-game attract loop should not replay the logo between demo1 and demo2"
);
assert.equal(
  fullGameSource.includes("SCR_FinishCinematic(runtime.client);"),
  true,
  "keyboard skip during attract-loop cinematics should advance through nextserver"
);
assert.equal(
  fullGameSource.includes('Cbuf_AddText(runtime.menu.cmd, "killserver\\n");\n    executeRuntimeCommandBuffer(runtime, page);\n    enterMainMenu(runtime, page);'),
  false,
  "keyboard input during in-game attract demos should open the menu through Key_Event instead of killing the server"
);
assert.equal(
  fullGameSource.includes("getServerState: () => serverHost.hasActiveServer() ? 1 : 0"),
  true,
  "opening the menu over an attract demo should set paused through the source menu path"
);
assert.equal(
  fullGameSource.includes('Cvar_Get(cvar, "gl_polyblend", "1", CVAR_ARCHIVE);'),
  true,
  "full-game should enable the source polyblend overlay by default"
);
assert.equal(
  fullGameSource.includes("drawOverlay: ({ viewportWidth, viewportHeight }) =>"),
  true,
  "the attract-demo menu should be composed through the Three render overlay path"
);
assert.equal(
  fullGameSource.includes("menuBackdrop"),
  false,
  "the attract-demo menu fade should not use an HTML backdrop"
);
assert.equal(
  fullGameSource.includes("drawMenuOverlayRef(runtime, renderer.ref, viewportWidth, viewportHeight);"),
  true,
  "the attract-demo menu should draw through the active game renderer ref"
);
assert.equal(
  fullGameSource.includes('page.frontendViewport.style.display = menuRenderedInFrontend || loadingRenderedInFrontend ? "block" : "none";'),
  true,
  "the standalone menu and loading plaque should use the frontend Three renderer"
);
assert.equal(
  fullGameSource.includes("ref: menuRef"),
  true,
  "full-game should give the source menu a refexport_t bridge instead of web/Three-specific menu state"
);
assert.equal(
  fullGameSource.includes("renderer.glDrawAdapter.scene"),
  true,
  "standalone menu rendering should render the ref_gl draw adapter scene"
);
assert.equal(
  fullGameSource.includes("renderer.glDrawAdapter.setViewport(LOGICAL_WIDTH, LOGICAL_HEIGHT);"),
  true,
  "standalone menu/loading drawing should keep the original 640x480 logical viewport"
);
assert.equal(
  fullGameSource.includes("getContainedLogicalViewportSize(page.frontendViewport)"),
  true,
  "standalone menu/loading frontend canvas should be centered in a contained 4:3 viewport"
);
assert.equal(
  fullGameSource.includes("runtime.menu.vid.viddef.width = viewportWidth;"),
  true,
  "attract-loop menu overlay should temporarily use the active game viewport width"
);
assert.equal(
  fullGameSource.includes("syncMenuOverlayFrameworkOrigins(runtime.menu, viewportWidth, viewportHeight);"),
  true,
  "attract-loop menu overlay should keep source menu item origins in the same viddef as the banner"
);
assert.equal(
  fullGameSource.includes("runtime.syncVideoMenuOverlayOrigins(viewportWidth, viewportHeight);"),
  true,
  "attract-loop menu overlay should also align the private video menu frameworks"
);
assert.equal(
  vidMenuSource.includes("function syncMenuOrigins(viewportWidth: number, viewportHeight: number): () => void"),
  true,
  "video menu controller should expose overlay origin synchronization for its private frameworks"
);
assert.equal(
  vidMenuSource.includes("case K_ESCAPE:\n        CancelChanges();"),
  true,
  "video menu escape should pop back to the parent menu"
);
assert.equal(
  menuMainGameSource.includes("context.state.s_game_menu.x = context.vid.viddef.width * 0.5;"),
  false,
  "Game_MenuDraw should stay ISO with client/menu.c and not reposition the framework during draw"
);
assert.equal(
  fullGameSource.includes("const loadingCommand = SCR_DrawLoading(runtime.client) ?? createFullGameAutosizedPictureCommand(\"loading\");"),
  true,
  "the loading plaque should still be sourced from SCR_DrawLoading before adapter fallback"
);
assert.equal(
  fullGameSource.includes("drawFullGamePictureRef("),
  true,
  "the loading plaque should draw through refexport_t instead of canvas-only helpers"
);
assert.equal(
  fullGameSource.includes("const loadingRenderedInFrontend = runtime.frontendRenderer !== null"),
  true,
  "the frontend Three layer should be visible for loading plaques"
);
assert.equal(
  fullGameSource.includes("new Mesh") || fullGameSource.includes("PlaneGeometry") || fullGameSource.includes("MeshBasicMaterial"),
  false,
  "full-game must not build ad hoc Three meshes for the source menu"
);
assert.equal(
  threeGlDrawAdapterSource.includes("Adapt the ported `ref_gl/gl_draw.c` hook surface"),
  true,
  "Three menu primitives should stay behind the ref_gl draw adapter"
);
assert.equal(
  threeGlDrawAdapterSource.includes("mesh.renderOrder = state.drawOrder"),
  true,
  "ref_gl draw adapter should preserve immediate-mode quad order for transparent menu artwork"
);
assert.equal(
  fullGameSource.includes("warmFullGameFrontendPics(renderer.ref);"),
  true,
  "frontend renderer should warm menu/loading pics before the first visible menu frame"
);
for (const { file, source } of clientMenuSources) {
  assert.equal(
    source.includes("renderer-three") || source.includes("apps/web") || source.includes('from "three"') || source.includes("from 'three'"),
    false,
    `${file} must not depend on web or Three adapters`
  );
}
assert.equal(
  fullGameSource.includes("onPlayCinematic: (name: string) =>"),
  true,
  "server-driven attract-loop cinematics should use the browser cinematic/audio hooks"
);
assert.equal(
  fullGameLocalSessionSource.includes("./local-client-controller.js"),
  false,
  "legacy local-session harness must not import the standalone demo controller"
);
assert.equal(
  fullGameLocalSessionSource.includes("demoInventory: false"),
  true,
  "legacy local-session harness must opt out of demo inventory grants"
);
assert.equal(
  fullGameLocalSessionSource.includes("ghostMode: false"),
  true,
  "legacy local-session harness must opt out of demo ghost movement"
);
assert.equal(
  renderLoopSource.includes("hudBindings = {}"),
  true,
  "shared full-game render loop must not default to demo HUD hotkeys"
);
assert.equal(
  webDemoLoopSource.includes("hudBindings: LOCAL_DEMO_HUD_WEAPON_BINDINGS"),
  true,
  "standalone web demo must opt in to demo HUD hotkeys explicitly"
);

const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
CL_InitLocal(createClientMainContext(client, cmd, cvar));
V_Init(createClientViewContext(client, cmd, cvar));
const inputContext = createClientInputContext(client, cmd, cvar);
CL_InitInput(inputContext);

const session = createFullGameLocalSession({
  filesystem,
  client,
  inputContext,
  cvar,
  mapRequest: "*base1$start"
});

const gameplayClient = session.gameplayRuntime.entities.find((entity) => entity.classname === "player")?.client;
assert.ok(gameplayClient, "legacy local-session player should have a gameplay client");
assert.equal(session.gameplayRuntime.dmflags & DF_INFINITE_AMMO, 0, "legacy local-session harness must not enable demo infinite ammo");

const blaster = FindItem("Blaster");
const shotgun = FindItem("Shotgun");
assert.ok(blaster, "Blaster item should exist");
assert.ok(shotgun, "Shotgun item should exist");
assert.equal(gameplayClient!.pers.inventory[blaster!.index], 1, "legacy local-session harness should keep source default Blaster");
assert.equal(gameplayClient!.pers.inventory[shotgun!.index] ?? 0, 0, "legacy local-session harness should not grant demo Shotgun");

session.setScoreboardVisible(true);
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 1) !== 0, true, "Tab should expose the scoreboard layout bit");
session.setScoreboardVisible(false);
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 1) !== 0, false, "Tab release should clear the scoreboard layout bit");
session.toggleInventory();
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 2) !== 0, true, "I should toggle the inventory layout bit");
session.toggleInventory();
assert.equal((client.cl.frame.playerstate.stats[STAT_LAYOUTS] & 2) !== 0, false, "I should toggle inventory off");

session.update(0.1);
assert.equal(session.gameplayRuntime.dmflags & DF_INFINITE_AMMO, 0, "legacy local-session update must not refill demo infinite ammo");
assert.equal(gameplayClient!.pers.inventory[shotgun!.index] ?? 0, 0, "legacy local-session update must not refill demo weapons");
assert.ok(client.cl.frame.playerstate.gunindex > 0, "legacy local-session update should preserve the Blaster view model");
assert.equal(
  client.cl.configstrings[CS_MODELS + client.cl.frame.playerstate.gunindex],
  "models/weapons/v_blast/tris.md2",
  "legacy local-session Blaster view model configstring mismatch"
);

console.log("quake2-full-game-demo-cleanup: ok");
