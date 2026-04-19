/**
 * File: main.ts
 * Purpose: Boot a browser demo that loads Quake II assets, parses one BSP map and renders it with Three.js.
 *
 * This file is not a direct source port.
 * It is an application bootstrap that connects the ported runtime/data layers to the web frontend.
 *
 * Dependencies:
 * - packages/formats
 * - packages/renderer-common
 * - packages/renderer-three
 * - three
 */

import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer
} from "three";
import { WebGPURenderer } from "three/webgpu";
import { buildBspSurfaces } from "../../../packages/renderer-common/src/index.js";
import {
  applyMd2Frame,
  buildEntityPreviewGroup,
  buildMd2Mesh,
  buildThreeBspGroup,
  createQuakeTextureResolver,
  loadMd2Model,
  updateEntityPreviewGroup
} from "../../../packages/renderer-three/src/index.js";
import { findPrimarySpawnPoint, parseBsp } from "../../../packages/formats/src/index.js";
import { createVirtualFilesystem, mountPak, readMountedFile } from "../../../packages/filesystem/src/index.js";

const BASEQ2_PAK_CANDIDATES = [
  "/@fs/C:/a/Projets/Quake-2/Quake 2/baseq2/pak0.pak",
  "/baseq2/pak0.pak"
];
const DEFAULT_MAP_PATH = "maps/base1.bsp";
const DEFAULT_MODEL_PATH = "models/items/armor/shard/tris.md2";
const CAMERA_MOVE_SPEED = 320;
const CAMERA_VERTICAL_SPEED = 220;
const CAMERA_MOUSE_SENSITIVITY = 0.0022;
const CAMERA_EYE_HEIGHT = 24;

type ActiveRenderer = WebGPURenderer | WebGLRenderer;
type MovementKey = "forward" | "backward" | "left" | "right" | "up" | "down";

interface CameraController {
  state: {
    position: Vector3;
    yaw: number;
    pitch: number;
    pressedKeys: Record<MovementKey, boolean>;
    pointerLocked: boolean;
  };
  update: (deltaSeconds: number) => void;
}

/**
 * Category: New
 * Purpose: Start the Quake2JS browser demo with live map loading and renderer initialization.
 *
 * Constraints:
 * - Must keep the page interactive even if asset loading fails.
 */
void bootstrap();

/**
 * Category: New
 * Purpose: Initialize the DOM, renderer, scene and runtime demo data.
 *
 * Constraints:
 * - Must report a readable error when pak0.pak cannot be reached.
 */
async function bootstrap(): Promise<void> {
  const app = requireApp();
  const ui = createShell(app);

  try {
    ui.setStatus("Chargement de pak0.pak...");

    const rendererBundle = await createRenderer();
    ui.attachViewport(rendererBundle.renderer.domElement);
    ui.setRenderer(rendererBundle.label);
    ui.setStatus("Analyse de la map base1...");

    const pakBytes = await loadFirstAvailablePak(BASEQ2_PAK_CANDIDATES);
    const filesystem = createVirtualFilesystem();
    mountPak(filesystem, pakBytes, "pak0.pak");

    const bspFile = readMountedFile(filesystem, DEFAULT_MAP_PATH);
    if (!bspFile) {
      throw new Error(`La map ${DEFAULT_MAP_PATH} est introuvable dans pak0.pak.`);
    }

    const map = parseBsp(bspFile.bytes, bspFile.path);
    const spawn = findPrimarySpawnPoint(map);
    const surfaces = buildBspSurfaces(map);
    const textureResolver = createQuakeTextureResolver(filesystem);
    const group = buildThreeBspGroup(surfaces, {
      resolveTexture: textureResolver.resolveTexture
    });
    const entityPreview = buildEntityPreviewGroup(filesystem, map.parsedEntities);
    group.add(entityPreview.group);

    const modelInstance = loadPreviewModel(filesystem, spawn);
    if (modelInstance) {
      group.add(modelInstance.mesh);
    }

    const scene = createScene(group);
    const camera = createCamera();
    const cameraController = createCameraController(ui.viewport, camera, spawn);

    ui.setMapInfo({
      mapName: bspFile.path,
      faceCount: map.faces.length,
      surfaceCount: surfaces.length,
      entityCount: entityPreview.supportedEntityCount,
      spawnText: spawn ? `${spawn.origin.join(", ")} | angle ${spawn.angle}` : "introuvable"
    });
    ui.setStatus("Map chargee.");

    const resize = (): void => {
      const width = ui.viewport.clientWidth;
      const height = ui.viewport.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererBundle.renderer.setSize(width, height);
    };

    resize();
    window.addEventListener("resize", resize);
    const animationStartedAt = performance.now();
    let previousFrameAt = animationStartedAt;
    rendererBundle.renderer.setAnimationLoop(() => {
      const now = performance.now();
      const elapsedSeconds = (now - animationStartedAt) / 1000;
      const deltaSeconds = Math.min(0.05, (now - previousFrameAt) / 1000);
      previousFrameAt = now;

      cameraController.update(deltaSeconds);
      updateEntityPreviewGroup(entityPreview, elapsedSeconds);

      if (modelInstance && modelInstance.model.frames.length > 1) {
        const frameIndex = Math.floor(elapsedSeconds * 6) % modelInstance.model.frames.length;
        applyMd2Frame(modelInstance, frameIndex);
      }

      rendererBundle.renderer.render(scene, camera);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    ui.setStatus("Echec du chargement.");
    ui.setError(
      [
        "Impossible de charger la demo Quake II.",
        message,
        "En mode dev, Vite doit pouvoir lire ton installation locale.",
        "Sinon, place `pak0.pak` dans `apps/web/public/baseq2/pak0.pak`."
      ].join("\n")
    );
  }
}

/**
 * Category: New
 * Purpose: Create the preferred Three.js renderer with WebGPU first and WebGL fallback.
 *
 * Constraints:
 * - Must await WebGPU backend initialization before rendering.
 */
async function createRenderer(): Promise<{ renderer: ActiveRenderer; label: string }> {
  const canvas = document.createElement("canvas");

  if ("gpu" in navigator) {
    try {
      const renderer = new WebGPURenderer({ antialias: true, canvas });
      await renderer.init();
      renderer.setClearColor(new Color("#0d0906"));
      return { renderer, label: "WebGPU" };
    } catch {
      // WebGL fallback is intentional when WebGPU init fails.
    }
  }

  const renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor(new Color("#0d0906"));
  return { renderer, label: "WebGL" };
}

/**
 * Category: New
 * Purpose: Try several pak0.pak URLs until one succeeds.
 *
 * Constraints:
 * - Must preserve the candidate order so local dev paths stay preferred.
 */
async function loadFirstAvailablePak(candidates: string[]): Promise<Uint8Array> {
  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) {
        throw new Error(`${candidate} -> HTTP ${response.status}`);
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      return bytes;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(`${error}`);
    }
  }

  throw lastError ?? new Error("Aucune source pak0.pak n'est accessible.");
}

/**
 * Category: New
 * Purpose: Create a minimal lit scene around the generated BSP group.
 *
 * Constraints:
 * - Must preserve the Quake-friendly Z-up convention.
 */
function createScene(group: Group): Scene {
  const scene = new Scene();
  scene.background = new Color("#0d0906");
  scene.add(group);

  const ambient = new AmbientLight(0xffffff, 0.8);
  const directional = new DirectionalLight(0xffffff, 0.35);
  directional.position.set(0.8, 0.2, 1);

  scene.add(ambient);
  scene.add(directional);
  return scene;
}

/**
 * Category: New
 * Purpose: Load one preview MD2 model and place it near the parsed BSP spawn point.
 *
 * Constraints:
 * - Must return null when the preview asset is unavailable.
 */
function loadPreviewModel(
  filesystem: ReturnType<typeof createVirtualFilesystem>,
  spawn: ReturnType<typeof findPrimarySpawnPoint>
): ReturnType<typeof buildMd2Mesh> | null {
  const model = loadMd2Model(filesystem, DEFAULT_MODEL_PATH);
  if (!model) {
    return null;
  }

  const meshInstance = buildMd2Mesh(filesystem, model);
  const origin = spawn?.origin ?? [0, 0, 0];
  meshInstance.mesh.position.set(origin[0] + 96, origin[1], origin[2] + 32);
  meshInstance.mesh.rotation.x = Math.PI / 2;
  meshInstance.mesh.scale.setScalar(1.5);
  return meshInstance;
}

/**
 * Category: New
 * Purpose: Create the main perspective camera used for the map preview.
 *
 * Constraints:
 * - Must use Z-up to stay aligned with Quake II coordinates.
 */
function createCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(75, 1, 4, 20000);
  camera.up.set(0, 0, 1);
  return camera;
}

/**
 * Category: New
 * Purpose: Create a lightweight browser FPS camera controller for map exploration.
 *
 * Constraints:
 * - Must support pointer lock mouse look and keyboard movement without external dependencies.
 */
function createCameraController(
  viewport: HTMLDivElement,
  camera: PerspectiveCamera,
  spawn: ReturnType<typeof findPrimarySpawnPoint>
): CameraController {
  const initialPosition = spawn
    ? new Vector3(spawn.origin[0], spawn.origin[1], spawn.origin[2] + CAMERA_EYE_HEIGHT)
    : new Vector3(0, -512, 192);
  const initialYaw = spawn ? (spawn.angle * Math.PI) / 180 : 0;

  const state: CameraController["state"] = {
    position: initialPosition,
    yaw: initialYaw,
    pitch: 0,
    pressedKeys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    },
    pointerLocked: false
  };

  applyCameraTransform(camera, state.position, state.yaw, state.pitch);

  const codeBindings: Record<string, MovementKey> = {
    Space: "up",
    ControlLeft: "down",
    ControlRight: "down"
  };

  const keyBindings: Record<string, MovementKey> = {
    z: "forward",
    s: "backward",
    q: "left",
    d: "right",
    c: "down"
  };

  viewport.addEventListener("click", () => {
    void viewport.requestPointerLock();
  });

  document.addEventListener("pointerlockchange", () => {
    state.pointerLocked = document.pointerLockElement === viewport;
  });

  document.addEventListener("mousemove", (event) => {
    if (!state.pointerLocked) {
      return;
    }

    state.yaw -= event.movementX * CAMERA_MOUSE_SENSITIVITY;
    state.pitch -= event.movementY * CAMERA_MOUSE_SENSITIVITY;
    state.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, state.pitch));
  });

  window.addEventListener("keydown", (event) => {
    const binding = codeBindings[event.code] ?? keyBindings[event.key.toLowerCase()];
    if (!binding) {
      return;
    }

    state.pressedKeys[binding] = true;
    event.preventDefault();
  });

  window.addEventListener("keyup", (event) => {
    const binding = codeBindings[event.code] ?? keyBindings[event.key.toLowerCase()];
    if (!binding) {
      return;
    }

    state.pressedKeys[binding] = false;
    event.preventDefault();
  });

  return {
    state,
    update: (deltaSeconds) => {
      const forward = new Vector3();
      camera.getWorldDirection(forward);
      forward.z = 0;
      if (forward.lengthSq() > 0) {
        forward.normalize();
      }

      const right = new Vector3().crossVectors(forward, camera.up).normalize();
      const movement = new Vector3();

      if (state.pressedKeys.forward) {
        movement.add(forward);
      }
      if (state.pressedKeys.backward) {
        movement.sub(forward);
      }
      if (state.pressedKeys.left) {
        movement.sub(right);
      }
      if (state.pressedKeys.right) {
        movement.add(right);
      }

      if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar(CAMERA_MOVE_SPEED * deltaSeconds);
        state.position.add(movement);
      }

      if (state.pressedKeys.up) {
        state.position.z += CAMERA_VERTICAL_SPEED * deltaSeconds;
      }
      if (state.pressedKeys.down) {
        state.position.z -= CAMERA_VERTICAL_SPEED * deltaSeconds;
      }

      applyCameraTransform(camera, state.position, state.yaw, state.pitch);
    }
  };
}

/**
 * Category: New
 * Purpose: Apply yaw/pitch first-person orientation to the active camera.
 *
 * Constraints:
 * - Must preserve Z-up world coordinates.
 */
function applyCameraTransform(camera: PerspectiveCamera, position: Vector3, yaw: number, pitch: number): void {
  camera.position.copy(position);
  camera.rotation.order = "ZYX";
  camera.rotation.x = Math.PI / 2;
  camera.rotation.y = 0;
  camera.rotation.z = 0;
  camera.rotateOnWorldAxis(new Vector3(0, 0, 1), yaw);
  camera.rotateX(-pitch);
}

/**
 * Category: New
 * Purpose: Require the root application mount point.
 *
 * Constraints:
 * - Must fail loudly when the page shell is broken.
 */
function requireApp(): HTMLDivElement {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) {
    throw new Error("Le conteneur #app est introuvable.");
  }

  return app;
}

/**
 * Category: New
 * Purpose: Build the browser shell used for the live Quake II loading preview.
 *
 * Constraints:
 * - Must expose small imperative hooks for status and viewport updates.
 */
function createShell(app: HTMLDivElement): {
  viewport: HTMLDivElement;
  attachViewport: (canvas: HTMLCanvasElement) => void;
  setRenderer: (value: string) => void;
  setStatus: (value: string) => void;
  setError: (value: string) => void;
  setMapInfo: (value: { mapName: string; faceCount: number; surfaceCount: number; entityCount: number; spawnText: string }) => void;
} {
  app.innerHTML = "";

  const root = document.createElement("main");
  root.style.display = "grid";
  root.style.gridTemplateRows = "1fr auto";
  root.style.height = "100vh";
  root.style.background = "#0d0906";

  const viewport = document.createElement("div");
  viewport.style.position = "relative";
  viewport.style.minHeight = "0";

  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.left = "16px";
  overlay.style.bottom = "16px";
  overlay.style.padding = "10px 12px";
  overlay.style.background = "rgba(14, 10, 8, 0.78)";
  overlay.style.border = "1px solid rgba(210, 196, 177, 0.16)";
  overlay.style.color = "#d4c4b1";
  overlay.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  overlay.style.fontSize = "12px";
  overlay.style.lineHeight = "1.5";
  overlay.style.whiteSpace = "pre-line";
  overlay.style.maxWidth = "420px";

  const rendererLine = document.createElement("div");
  const statusLine = document.createElement("div");
  const infoLine = document.createElement("div");
  const errorLine = document.createElement("div");
  errorLine.style.color = "#f0b8a0";

  overlay.append(rendererLine, statusLine, infoLine, errorLine);
  viewport.append(overlay);

  root.append(viewport);
  app.append(root);

  return {
    viewport,
    attachViewport: (canvas) => {
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      viewport.prepend(canvas);
    },
    setRenderer: (value) => {
      rendererLine.textContent = `Renderer: ${value}`;
    },
    setStatus: (value) => {
      statusLine.textContent = `Statut: ${value}`;
    },
    setError: (value) => {
      errorLine.textContent = value;
    },
    setMapInfo: ({ mapName, faceCount, surfaceCount, entityCount, spawnText }) => {
      infoLine.textContent = [
        `Map: ${mapName}`,
        `Faces BSP: ${faceCount}`,
        `Surfaces visibles: ${surfaceCount}`,
        `Entites visibles: ${entityCount}`,
        `Spawn: ${spawnText}`,
        `Controles: clic pour souris, ZQSD, Espace, Ctrl/C`
      ].join("\n");
    }
  };
}
