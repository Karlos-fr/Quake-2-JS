/**
 * File: full-game-render-loop.ts
 * Purpose: Render one active Quake II client frame through the shared Three/ref_gl browser path.
 *
 * This file is not a direct source port.
 * It is a web renderer adapter shared by the standalone demo and the final full-game host.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/platform
 * - packages/renderer-three
 * - three
 */

import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  type PerspectiveCamera,
} from "three";
import {
  SCR_DrawHudRef,
  type BrushModelSnapshot,
  type ClientRefreshFrame,
  type ClientRuntime,
  type ClientScreenHudState,
  type QuakeSkySnapshot,
  type refexport_t
} from "../../../packages/client/src/index.js";
import type { VirtualFilesystem } from "../../../packages/filesystem/src/index.js";
import type { GameSoundEvent } from "../../../packages/game/src/index.js";
import type { QuakeWebAudioAdapter, WebAudioNamedLoop } from "../../../packages/platform/src/index.js";
import {
  type RefreshEntitySyncStats,
  createThreeBeamSync,
  createThreeDlightSync,
  createThreeGlDrawAdapter,
  createThreeGlWorldSceneAdapter,
  createThreeParticleSync,
  createThreePolyblendOverlay,
  createThreeRefreshEntitySync,
  createThreeSkySceneAdapter
} from "../../../packages/renderer-three/src/index.js";
import type { createRefreshDebugLayer } from "./refresh-debug-layer.js";
import { formatSkySnapshot, type ActiveRenderer } from "./web-render-bootstrap.js";

export const LOCAL_DEMO_HUD_WEAPON_BINDINGS = {
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

export interface FullGameRenderSource {
  runtime: ClientRuntime;
  refreshFrame: ClientRefreshFrame | null;
  screenState: ClientScreenHudState;
  skySnapshot: QuakeSkySnapshot | null;
  getBrushModelSnapshots: () => BrushModelSnapshot[];
  getCvarValue: (name: string) => number;
  resolveSoundPath: (soundIndex: number) => string | null;
  drainLocalGameplaySounds?: () => GameSoundEvent[];
}

export interface FullGameRenderUi {
  viewport: HTMLElement;
  setSkyText?: (value: string) => void;
  setRuntimeInfo?: (
    value: ClientRefreshFrame | null,
    refreshStats: RefreshEntitySyncStats | null,
    renderedParticleCount?: number
  ) => void;
}

export interface FullGameRenderLoop {
  resize: () => void;
  renderFrame: (options: {
    source: FullGameRenderSource;
    elapsedSeconds: number;
    drawOverlay?: (api: {
      ref: refexport_t;
      viewportWidth: number;
      viewportHeight: number;
    }) => void;
  }) => void;
  renderOverlay: (draw: (api: {
    ref: refexport_t;
    viewportWidth: number;
    viewportHeight: number;
  }) => void) => void;
  renderCanvasOverlay: (canvas: HTMLCanvasElement) => void;
  dispose: () => void;
}

export interface FullGameRenderLoopOptions {
  renderer: ActiveRenderer;
  ui: FullGameRenderUi;
  scene: Scene;
  camera: PerspectiveCamera;
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
  hudBindings?: Record<string, string>;
  enableRenderSourceAudio?: boolean;
}

export function createFullGameRenderLoop(options: FullGameRenderLoopOptions): FullGameRenderLoop {
  const {
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
    hudBindings = {},
    enableRenderSourceAudio = true
  } = options;
  const canvasOverlay = createCanvasOverlay();

  const resize = (): void => {
    const { width, height } = getRenderableViewportSize(ui.viewport);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    glDrawAdapter.setViewport(width, height);
    polyblendOverlay.setViewport(width, height);
  };

  const renderFrame: FullGameRenderLoop["renderFrame"] = ({ source, elapsedSeconds, drawOverlay }) => {
    updateAudioListener(audio, camera);
    if (enableRenderSourceAudio) {
      flushLocalGameplaySounds(source, filesystem, audio, camera);
      syncLocalLoopSounds(source, filesystem, audio, camera);
    }

    glWorldAdapter.update(elapsedSeconds, [
      camera.position.x,
      camera.position.y,
      camera.position.z
    ], source.getBrushModelSnapshots(), source.refreshFrame);
    skyAdapter.update(source.skySnapshot, camera, elapsedSeconds, glWorldAdapter.skyFaces);
    ui.setSkyText?.(formatSkySnapshot(source.skySnapshot));
    refreshEntitySync.setAliasShadowsEnabled(source.getCvarValue("gl_shadows") !== 0);
    const refreshEntityStats = refreshEntitySync.apply(source.runtime, source.refreshFrame);
    const renderedParticleCount = particleSync.apply(source.refreshFrame);
    beamSync.apply(source.refreshFrame);
    dlightSync.apply(source.refreshFrame);
    refreshDebug.update(source.refreshFrame);
    polyblendOverlay.applyFrame(
      source.refreshFrame,
      source.getCvarValue("gl_polyblend") !== 0
    );
    ui.setRuntimeInfo?.(source.refreshFrame, refreshEntityStats, renderedParticleCount);

    glDrawAdapter.clear();
    const viewportSize = getRenderableViewportSize(ui.viewport);
    SCR_DrawHudRef(
      source.runtime,
      ref,
      {
        viewportWidth: viewportSize.width,
        viewportHeight: viewportSize.height,
        active: true,
        refreshPrepped: true
      },
      {
        screenState: source.screenState,
        crosshairValue: source.getCvarValue("crosshair"),
        bindings: hudBindings
      }
    );
    drawOverlay?.({
      ref,
      viewportWidth: viewportSize.width,
      viewportHeight: viewportSize.height
    });

    renderer.autoClear = false;
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(polyblendOverlay.scene, polyblendOverlay.camera);
    renderer.render(glDrawAdapter.scene, glDrawAdapter.camera);
  };

  const renderOverlay: FullGameRenderLoop["renderOverlay"] = (draw) => {
    const viewportSize = getRenderableViewportSize(ui.viewport);
    glDrawAdapter.setViewport(viewportSize.width, viewportSize.height);
    glDrawAdapter.clear();
    draw({
      ref,
      viewportWidth: viewportSize.width,
      viewportHeight: viewportSize.height
    });
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(glDrawAdapter.scene, glDrawAdapter.camera);
  };

  const renderCanvasOverlay: FullGameRenderLoop["renderCanvasOverlay"] = (canvas) => {
    const viewportSize = getRenderableViewportSize(ui.viewport);
    canvasOverlay.setViewport(viewportSize.width, viewportSize.height);
    canvasOverlay.setCanvas(canvas);
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(canvasOverlay.scene, canvasOverlay.camera);
  };

  const dispose = (): void => {
    if (enableRenderSourceAudio) {
      audio.syncWavLoops(filesystem, []);
    }
    glDrawAdapter.dispose();
    polyblendOverlay.dispose();
    beamSync.dispose();
    dlightSync.dispose();
    refreshDebug.update(null);
    canvasOverlay.dispose();
    disposeObjectTree(scene);
  };

  return { resize, renderFrame, renderOverlay, renderCanvasOverlay, dispose };
}

function createCanvasOverlay(): {
  scene: Scene;
  camera: OrthographicCamera;
  setViewport: (width: number, height: number) => void;
  setCanvas: (canvas: HTMLCanvasElement) => void;
  dispose: () => void;
} {
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 1, 0, -100, 100);
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = "full-game-console-canvas-overlay";
  mesh.renderOrder = 1000;
  scene.add(mesh);
  let texture: CanvasTexture | null = null;

  return {
    scene,
    camera,
    setViewport: (width, height) => {
      const safeWidth = Math.max(1, width);
      const safeHeight = Math.max(1, height);
      camera.left = 0;
      camera.right = safeWidth;
      camera.top = safeHeight;
      camera.bottom = 0;
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.updateProjectionMatrix();
      mesh.position.set(safeWidth / 2, safeHeight / 2, 0);
      mesh.scale.set(safeWidth, safeHeight, 1);
    },
    setCanvas: (canvas) => {
      if (!texture || texture.image !== canvas) {
        texture?.dispose();
        texture = new CanvasTexture(canvas);
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        material.map = texture;
      }
      texture.needsUpdate = true;
      material.needsUpdate = true;
    },
    dispose: () => {
      texture?.dispose();
      geometry.dispose();
      material.dispose();
    }
  };
}

function getRenderableViewportSize(viewport: HTMLElement): { width: number; height: number } {
  const rect = viewport.getBoundingClientRect();
  const width = Math.round(rect.width || viewport.clientWidth || window.innerWidth || 640);
  const height = Math.round(rect.height || viewport.clientHeight || window.innerHeight || 480);

  return {
    width: Math.max(1, width),
    height: Math.max(1, height)
  };
}

function disposeObjectTree(root: Scene): void {
  root.traverse((object) => {
    const geometry = (object as { geometry?: { dispose?: () => void } }).geometry;
    geometry?.dispose?.();

    const material = (object as { material?: { dispose?: () => void } | Array<{ dispose?: () => void }> }).material;
    if (Array.isArray(material)) {
      for (const entry of material) {
        entry.dispose?.();
      }
      return;
    }

    material?.dispose?.();
  });
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
  source: FullGameRenderSource,
  filesystem: VirtualFilesystem,
  audio: QuakeWebAudioAdapter,
  camera: PerspectiveCamera
): void {
  const drainSounds = source.drainLocalGameplaySounds;
  if (!drainSounds) {
    return;
  }

  for (const event of drainSounds()) {
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
  source: FullGameRenderSource,
  filesystem: VirtualFilesystem,
  audio: QuakeWebAudioAdapter,
  camera: PerspectiveCamera
): void {
  const frame = source.runtime.cl.frame;
  const parseEntities = source.runtime.cl_parse_entities;
  const loops: WebAudioNamedLoop[] = [];

  for (let index = 0; index < frame.num_entities; index += 1) {
    const parseIndex = (frame.parse_entities + index) & (parseEntities.length - 1);
    const entity = parseEntities[parseIndex];
    if (!entity.sound) {
      continue;
    }

    const soundPath = source.resolveSoundPath(entity.sound);
    if (!soundPath) {
      continue;
    }

    const volumes = spatializeLoopSound(camera, entity.origin[0], entity.origin[1], entity.origin[2]);
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
