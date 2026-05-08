/**
 * File: web-demo-loop.ts
 * Purpose: Hold the browser-side animation loop for the current Quake2JS web demo.
 *
 * This file is not a direct source port.
 * It now delegates active frame rendering to `full-game-render-loop.ts` so the demo and final host share one path.
 *
 * Dependencies:
 * - apps/web/src/full-game-render-loop.ts
 * - apps/web/src/local-client-controller.ts
 * - apps/web/src/refresh-debug-layer.ts
 * - apps/web/src/web-render-bootstrap.ts
 * - apps/web/src/web-shell.ts
 * - packages/renderer-three
 * - three
 */

import type { PerspectiveCamera, Scene } from "three";
import type { refexport_t } from "../../../packages/client/src/index.js";
import type { VirtualFilesystem } from "../../../packages/filesystem/src/index.js";
import type { QuakeWebAudioAdapter } from "../../../packages/platform/src/index.js";
import {
  createThreeBeamSync,
  createThreeDlightSync,
  createThreeGlDrawAdapter,
  createThreeGlWorldSceneAdapter,
  createThreeParticleSync,
  createThreePolyblendOverlay,
  createThreeRefreshEntitySync,
  createThreeSkySceneAdapter
} from "../../../packages/renderer-three/src/index.js";
import {
  LOCAL_DEMO_HUD_WEAPON_BINDINGS,
  createFullGameRenderLoop
} from "./full-game-render-loop.js";
import type { LocalClientController } from "./local-client-controller.js";
import type { createRefreshDebugLayer } from "./refresh-debug-layer.js";
import { type ActiveRenderer } from "./web-render-bootstrap.js";
import type { WebShell } from "./web-shell.js";

/**
 * Original name: N/A
 * Source: N/A (web demo adapter)
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
  glDrawAdapter: ReturnType<typeof createThreeGlDrawAdapter>;
  polyblendOverlay: ReturnType<typeof createThreePolyblendOverlay>;
  ref: refexport_t;
  skyAdapter: ReturnType<typeof createThreeSkySceneAdapter>;
  glWorldAdapter: ReturnType<typeof createThreeGlWorldSceneAdapter>;
  refreshEntitySync: ReturnType<typeof createThreeRefreshEntitySync>;
  particleSync: ReturnType<typeof createThreeParticleSync>;
  beamSync: ReturnType<typeof createThreeBeamSync>;
  dlightSync: ReturnType<typeof createThreeDlightSync>;
  refreshDebug: ReturnType<typeof createRefreshDebugLayer>;
  filesystem: VirtualFilesystem;
  audio: QuakeWebAudioAdapter;
  updateCDAudio?: () => void;
}

/**
 * Original name: N/A
 * Source: N/A (web demo adapter)
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
    glDrawAdapter,
    polyblendOverlay,
    ref,
    skyAdapter,
    glWorldAdapter,
    refreshEntitySync,
    particleSync,
    beamSync,
    dlightSync,
    refreshDebug,
    filesystem,
    audio,
    updateCDAudio
  } = options;

  const renderLoop = createFullGameRenderLoop({
    renderer,
    ui,
    scene,
    camera,
    glDrawAdapter,
    polyblendOverlay,
    ref,
    skyAdapter,
    glWorldAdapter,
    refreshEntitySync,
    particleSync,
    beamSync,
    dlightSync,
    refreshDebug,
    filesystem,
    audio,
    hudBindings: LOCAL_DEMO_HUD_WEAPON_BINDINGS
  });

  renderLoop.resize();
  window.addEventListener("resize", renderLoop.resize);

  const animationStartedAt = performance.now();
  let previousFrameAt = animationStartedAt;
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const elapsedSeconds = (now - animationStartedAt) / 1000;
    const deltaSeconds = Math.min(0.05, (now - previousFrameAt) / 1000);
    previousFrameAt = now;

    ui.setPerformance(now);
    cameraController.update(deltaSeconds);
    updateCDAudio?.();
    renderLoop.renderFrame({
      source: cameraController,
      elapsedSeconds
    });
  });
}
