/**
 * File: web-demo-loop.ts
 * Purpose: Hold the browser-side render loop and resize wiring for the Quake2JS web demo.
 *
 * This file is not a direct source port.
 * It is an adapter layer that wires browser timing to the Three.js renderer and HUD layer.
 *
 * Dependencies:
 * - apps/web/src/local-client-controller.ts
 * - apps/web/src/refresh-debug-layer.ts
 * - apps/web/src/web-render-bootstrap.ts
 * - apps/web/src/web-shell.ts
 * - packages/client
 * - packages/renderer-three
 * - three
 */

import type { PerspectiveCamera, Scene } from "three";
import { SCR_BuildHudDrawCommands } from "../../../packages/client/src/index.js";
import {
  createThreeBrushModelSync,
  createThreeHudLayer,
  createThreeRefreshEntitySync,
  createThreeSkySceneAdapter
} from "../../../packages/renderer-three/src/index.js";
import type { LocalClientController } from "./local-client-controller.js";
import type { createRefreshDebugLayer } from "./refresh-debug-layer.js";
import { formatSkySnapshot, type ActiveRenderer } from "./web-render-bootstrap.js";
import type { WebShell } from "./web-shell.js";

const LOCAL_HUD_WEAPON_BINDINGS = {
  Blaster: "`",
  Shotgun: "1",
  "Super Shotgun": "2",
  Machinegun: "3",
  Chaingun: "4",
  Grenades: "5",
  "Grenade Launcher": "6",
  "Rocket Launcher": "7",
  HyperBlaster: "8",
  Railgun: "9",
  BFG10K: "0"
};

/**
 * Category: New
 * Purpose: Describe the browser-side objects needed to run the current Quake2JS demo loop.
 *
 * Constraints:
 * - Must remain web/renderer-specific.
 */
export interface WebDemoLoopOptions {
  renderer: ActiveRenderer;
  ui: WebShell;
  scene: Scene;
  camera: PerspectiveCamera;
  cameraController: LocalClientController;
  hudLayer: ReturnType<typeof createThreeHudLayer>;
  skyAdapter: ReturnType<typeof createThreeSkySceneAdapter>;
  brushModelSync: ReturnType<typeof createThreeBrushModelSync>;
  refreshEntitySync: ReturnType<typeof createThreeRefreshEntitySync>;
  refreshDebug: ReturnType<typeof createRefreshDebugLayer>;
}

/**
 * Category: New
 * Purpose: Start the current browser demo resize wiring and animation loop around the already-created runtime and renderer objects.
 *
 * Constraints:
 * - Must keep the frame ordering stable with the current web demo behavior.
 */
export function startWebDemoLoop(options: WebDemoLoopOptions): void {
  const {
    renderer,
    ui,
    scene,
    camera,
    cameraController,
    hudLayer,
    skyAdapter,
    brushModelSync,
    refreshEntitySync,
    refreshDebug
  } = options;

  const resize = (): void => {
    const width = ui.viewport.clientWidth;
    const height = ui.viewport.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    hudLayer.setViewport(width, height);
  };

  resize();
  window.addEventListener("resize", resize);

  const animationStartedAt = performance.now();
  let previousFrameAt = animationStartedAt;

  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const elapsedSeconds = (now - animationStartedAt) / 1000;
    const deltaSeconds = Math.min(0.05, (now - previousFrameAt) / 1000);
    previousFrameAt = now;

    ui.setPerformance(now);
    cameraController.update(deltaSeconds);
    skyAdapter.update(cameraController.skySnapshot, camera, elapsedSeconds);
    ui.setSkyText(formatSkySnapshot(cameraController.skySnapshot));
    brushModelSync.apply(cameraController.getBrushModelSnapshots());
    const refreshEntityStats = refreshEntitySync.apply(cameraController.runtime, cameraController.refreshFrame);
    refreshDebug.update(cameraController.refreshFrame);
    ui.setRuntimeInfo(cameraController.refreshFrame, refreshEntityStats);

    const hudCommands = SCR_BuildHudDrawCommands(
      cameraController.runtime,
      {
        viewportWidth: ui.viewport.clientWidth,
        viewportHeight: ui.viewport.clientHeight,
        active: true,
        refreshPrepped: true
      },
      {
        screenState: cameraController.screenState,
        bindings: LOCAL_HUD_WEAPON_BINDINGS
      }
    );
    hudLayer.render(hudCommands);

    renderer.autoClear = false;
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(hudLayer.scene, hudLayer.camera);
  });
}
