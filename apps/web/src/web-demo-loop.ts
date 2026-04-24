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

import { Group, PointLight, Vector3, type PerspectiveCamera, type Scene } from "three";
import type { ClientRefreshFrame } from "../../../packages/client/src/index.js";
import { SCR_BuildHudDrawCommands } from "../../../packages/client/src/index.js";
import type { VirtualFilesystem } from "../../../packages/filesystem/src/index.js";
import { drainGameSoundEvents } from "../../../packages/game/src/index.js";
import type { QuakeWebAudioAdapter, WebAudioNamedLoop } from "../../../packages/platform/src/index.js";
import {
  createThreeBrushModelSync,
  createThreeGlWorldSceneAdapter,
  createThreeHudLayer,
  createThreeParticleSync,
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
  glWorldAdapter?: ReturnType<typeof createThreeGlWorldSceneAdapter>;
  refreshEntitySync: ReturnType<typeof createThreeRefreshEntitySync>;
  particleSync: ReturnType<typeof createThreeParticleSync>;
  refreshDebug: ReturnType<typeof createRefreshDebugLayer>;
  filesystem: VirtualFilesystem;
  audio: QuakeWebAudioAdapter;
  updateCDAudio?: () => void;
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
    glWorldAdapter,
    refreshEntitySync,
    particleSync,
    refreshDebug,
    filesystem,
    audio,
    updateCDAudio
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
  const dynamicLights = createRefreshDynamicLights(scene);

  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const elapsedSeconds = (now - animationStartedAt) / 1000;
    const deltaSeconds = Math.min(0.05, (now - previousFrameAt) / 1000);
    previousFrameAt = now;

    ui.setPerformance(now);
    cameraController.update(deltaSeconds);
    updateAudioListener(audio, camera);
    flushLocalGameplaySounds(cameraController, filesystem, audio, camera);
    syncLocalLoopSounds(cameraController, filesystem, audio, camera);
    updateCDAudio?.();
    skyAdapter.update(cameraController.skySnapshot, camera, elapsedSeconds);
    const brushModelSnapshots = cameraController.getBrushModelSnapshots();
    glWorldAdapter?.update(elapsedSeconds, [
      camera.position.x,
      camera.position.y,
      camera.position.z
    ], brushModelSnapshots, cameraController.refreshFrame);
    ui.setSkyText(formatSkySnapshot(cameraController.skySnapshot));
    if (!glWorldAdapter) {
      brushModelSync.apply(brushModelSnapshots);
    }
    refreshEntitySync.setAliasShadowsEnabled(cameraController.getCvarValue("gl_shadows") !== 0);
    const refreshEntityStats = refreshEntitySync.apply(cameraController.runtime, cameraController.refreshFrame);
    particleSync.apply(cameraController.refreshFrame);
    dynamicLights.update(cameraController.refreshFrame);
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

function createRefreshDynamicLights(scene: Scene): {
  update: (frame: ClientRefreshFrame | null) => void;
} {
  const root = new Group();
  root.name = "refresh-dynamic-lights";
  const lights = Array.from({ length: 32 }, () => {
    const light = new PointLight(0xffffff, 0, 1, 2);
    light.visible = false;
    root.add(light);
    return light;
  });
  scene.add(root);

  return {
    update: (frame) => {
      const sourceLights = frame?.lights ?? [];
      for (let index = 0; index < lights.length; index += 1) {
        const light = lights[index];
        const source = sourceLights[index];
        if (!source) {
          light.visible = false;
          light.intensity = 0;
          continue;
        }

        light.position.set(source.origin[0], source.origin[1], source.origin[2]);
        light.color.setRGB(
          Math.max(0, source.color[0]),
          Math.max(0, source.color[1]),
          Math.max(0, source.color[2])
        );
        light.distance = Math.max(64, source.intensity * 2);
        light.intensity = Math.max(0.2, source.intensity / 120);
        light.visible = true;
      }
    }
  };
}

function updateAudioListener(audio: QuakeWebAudioAdapter, camera: PerspectiveCamera): void {
  const forward = new Vector3();
  camera.getWorldDirection(forward);
  const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
  audio.setListener({
    position: [camera.position.x, camera.position.y, camera.position.z],
    forward: [forward.x, forward.y, forward.z],
    up: [up.x, up.y, up.z]
  });
}

function flushLocalGameplaySounds(
  cameraController: LocalClientController,
  filesystem: VirtualFilesystem,
  audio: QuakeWebAudioAdapter,
  camera: PerspectiveCamera
): void {
  for (const event of drainGameSoundEvents(cameraController.gameplayRuntime)) {
    const origin = event.origin ?? event.entity?.s.origin ?? null;
    const volume = event.volume ?? 1;
    if (!origin) {
      audio.playWavAt(filesystem, event.soundPath, {
        leftVolume: 255 * volume,
        rightVolume: 255 * volume
      });
      continue;
    }

    const volumes = spatializeLoopSound(camera, origin[0], origin[1], origin[2]);
    audio.playWavAt(filesystem, event.soundPath, {
      leftVolume: volumes.leftVolume * volume,
      rightVolume: volumes.rightVolume * volume
    });
  }
}

function syncLocalLoopSounds(
  cameraController: LocalClientController,
  filesystem: VirtualFilesystem,
  audio: QuakeWebAudioAdapter,
  camera: PerspectiveCamera
): void {
  const frame = cameraController.runtime.cl.frame;
  const parseEntities = cameraController.runtime.cl_parse_entities;
  const loops: WebAudioNamedLoop[] = [];

  for (let index = 0; index < frame.num_entities; index += 1) {
    const parseIndex = (frame.parse_entities + index) & (parseEntities.length - 1);
    const entity = parseEntities[parseIndex];
    if (!entity.sound) {
      continue;
    }

    const soundPath = cameraController.gameplayRuntime.assets.soundPaths[entity.sound - 1];
    if (!soundPath) {
      continue;
    }

    const volumes = spatializeLoopSound(
      camera,
      entity.origin[0],
      entity.origin[1],
      entity.origin[2]
    );
    if (volumes.leftVolume === 0 && volumes.rightVolume === 0) {
      continue;
    }

    loops.push({
      key: `entity:${entity.number}:sound:${entity.sound}`,
      name: soundPath,
      leftVolume: volumes.leftVolume,
      rightVolume: volumes.rightVolume
    });
  }

  audio.syncWavLoops(filesystem, loops);
}

function spatializeLoopSound(
  camera: PerspectiveCamera,
  x: number,
  y: number,
  z: number
): { leftVolume: number; rightVolume: number } {
  const source = new Vector3(x, y, z).sub(camera.position);
  let distance = source.length();
  if (distance > 0) {
    source.divideScalar(distance);
  }

  distance -= 80;
  if (distance < 0) {
    distance = 0;
  }
  distance *= 0.003;

  const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
  const dot = right.dot(source);
  const rightScale = 0.5 * (1 + dot);
  const leftScale = 0.5 * (1 - dot);
  const attenuation = Math.max(0, 1 - distance);

  return {
    leftVolume: Math.trunc(255 * attenuation * leftScale),
    rightVolume: Math.trunc(255 * attenuation * rightScale)
  };
}
