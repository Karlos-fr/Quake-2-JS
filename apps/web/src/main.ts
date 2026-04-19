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
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer
} from "three";
import { WebGPURenderer } from "three/webgpu";
import { SCR_BuildHudDrawCommands } from "../../../packages/client/src/index.js";
import { buildBspSurfaces } from "../../../packages/renderer-common/src/index.js";
import {
  applyMd2Frame,
  buildEntityPreviewGroup,
  buildMd2Mesh,
  buildThreeBspGroup,
  createThreeBrushModelSync,
  createQuakeHudResourceResolver,
  createQuakeTextureResolver,
  createThreeHudLayer,
  loadMd2Model,
  updateEntityPreviewGroup
} from "../../../packages/renderer-three/src/index.js";
import { findPrimarySpawnPoint, parseBsp } from "../../../packages/formats/src/index.js";
import { createVirtualFilesystem, mountPak, readMountedFile } from "../../../packages/filesystem/src/index.js";
import { createLocalClientController } from "./local-client-controller.js";

const BASEQ2_PAK_CANDIDATES = [
  "/@fs/C:/a/Projets/Quake-2/Quake 2/baseq2/pak0.pak",
  "/baseq2/pak0.pak"
];
const DEFAULT_MAP_PATH = "maps/base1.bsp";
const DEFAULT_MODEL_PATH = "models/items/armor/shard/tris.md2";

type ActiveRenderer = WebGPURenderer | WebGLRenderer;

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
    const hudResourceResolver = createQuakeHudResourceResolver(filesystem);
    const hudLayer = createThreeHudLayer(hudResourceResolver);
    const group = buildThreeBspGroup(surfaces, {
      resolveTexture: textureResolver.resolveTexture,
      resolveModelOrigin: (modelIndex) => getInlineModelRenderOrigin(map, modelIndex)
    });
    const brushModelSync = createThreeBrushModelSync(group);
    const entityPreview = buildEntityPreviewGroup(filesystem, map.parsedEntities);
    group.add(entityPreview.group);

    const modelInstance = loadPreviewModel(filesystem, spawn);
    if (modelInstance) {
      group.add(modelInstance.mesh);
    }

    const scene = createScene(group);
    const camera = createCamera();
    const cameraController = createLocalClientController(ui.viewport, camera, map, spawn);
    const refreshDebug = createRefreshDebugGroup();
    scene.add(refreshDebug.root);

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
      hudLayer.setViewport(width, height);
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
      brushModelSync.apply(cameraController.getBrushModelSnapshots());
      refreshDebug.update(cameraController.refreshFrame);
      ui.setRuntimeInfo(cameraController.refreshFrame);
      updateEntityPreviewGroup(entityPreview, elapsedSeconds);

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
          bindings: {
            Blaster: "1"
          }
        }
      );
      hudLayer.render(hudCommands);

      if (modelInstance && modelInstance.model.frames.length > 1) {
        const frameIndex = Math.floor(elapsedSeconds * 6) % modelInstance.model.frames.length;
        applyMd2Frame(modelInstance, frameIndex);
      }

      rendererBundle.renderer.autoClear = false;
      rendererBundle.renderer.clear();
      rendererBundle.renderer.render(scene, camera);
      rendererBundle.renderer.clearDepth();
      rendererBundle.renderer.render(hudLayer.scene, hudLayer.camera);
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
 * Purpose: Resolve the compiled render origin used for one BSP inline model group.
 *
 * Constraints:
 * - Must match the entity `origin` field when present.
 * - Must fall back to the BSP model origin for safety.
 */
function getInlineModelRenderOrigin(map: ReturnType<typeof parseBsp>, modelIndex: number): [number, number, number] {
  if (modelIndex <= 0) {
    return [0, 0, 0];
  }

  const modelName = `*${modelIndex}`;
  const entity = map.parsedEntities.find((candidate) => candidate.properties.model === modelName);
  if (entity?.properties.origin) {
    const origin = parseEntityOrigin(entity.properties.origin);
    if (origin) {
      return origin;
    }
  }

  const model = map.models[modelIndex];
  return model ? [...model.origin] : [0, 0, 0];
}

/**
 * Category: New
 * Purpose: Parse one Quake-style entity origin string into a numeric tuple.
 */
function parseEntityOrigin(value: string): [number, number, number] | null {
  const parts = value.trim().split(/\s+/).map((part) => Number.parseFloat(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  return [parts[0], parts[1], parts[2]];
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
  setRuntimeInfo: (value: ReturnType<typeof createLocalClientController>["refreshFrame"]) => void;
} {
  app.innerHTML = "";
  document.documentElement.style.height = "100%";
  document.documentElement.style.overflow = "hidden";
  document.body.style.margin = "0";
  document.body.style.height = "100%";
  document.body.style.overflow = "hidden";
  app.style.height = "100%";
  app.style.overflow = "hidden";

  const root = document.createElement("main");
  root.style.display = "grid";
  root.style.height = "100vh";
  root.style.overflow = "hidden";
  root.style.background = "#0d0906";

  const viewport = document.createElement("div");
  viewport.style.position = "relative";
  viewport.style.minHeight = "0";
  viewport.style.height = "100%";
  viewport.style.overflow = "hidden";

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
  overlay.style.maxWidth = "340px";
  overlay.style.pointerEvents = "none";

  const rendererLine = document.createElement("div");
  const statusLine = document.createElement("div");
  const infoLine = document.createElement("div");
  const runtimeLine = document.createElement("div");
  const errorLine = document.createElement("div");
  errorLine.style.color = "#f0b8a0";

  overlay.append(rendererLine, statusLine, infoLine, runtimeLine, errorLine);
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
    },
    setRuntimeInfo: (value) => {
      runtimeLine.textContent = value
        ? [
            `Refresh: entites ${value.entities.length}`,
            `Beams: ${value.beams.length}`,
            `Explosions: ${value.explosions.length}`,
            `ForceWalls: ${value.forceWalls.length}`,
            `Sustains: ${value.sustains.length}`,
            `Lights: ${value.lights.length}`
          ].join("\n")
        : "Refresh: en attente";
    }
  };
}

/**
 * Category: New
 * Purpose: Build a lightweight scene debug layer for client refresh beams and force walls.
 *
 * Constraints:
 * - Must stay cheap enough to rebuild every frame during the current prototype stage.
 */
function createRefreshDebugGroup(): {
  root: Group;
  update: (frame: ReturnType<typeof createLocalClientController>["refreshFrame"]) => void;
} {
  const root = new Group();
  const beams = new Group();
  const forceWalls = new Group();
  const sustains = new Group();
  root.add(beams);
  root.add(forceWalls);
  root.add(sustains);

  const beamMaterial = new LineBasicMaterial({ color: new Color("#74c9ff"), transparent: true, opacity: 0.72 });
  const forceWallMaterial = new LineBasicMaterial({ color: new Color("#e0a85f"), transparent: true, opacity: 0.9 });
  const steamMaterial = new LineBasicMaterial({ color: new Color("#c6d5d9"), transparent: true, opacity: 0.75 });
  const widowMaterial = new MeshBasicMaterial({ color: new Color("#8dd6ff"), wireframe: true, transparent: true, opacity: 0.4 });
  const nukeMaterial = new MeshBasicMaterial({ color: new Color("#ffb347"), wireframe: true, transparent: true, opacity: 0.35 });

  return {
    root,
    update: (frame) => {
      clearGroup(beams);
      clearGroup(forceWalls);
      clearGroup(sustains);

      if (!frame) {
        return;
      }

      for (const beam of frame.beams) {
        beams.add(createLineObject(beam.start, beam.end, beamMaterial));
      }

      for (const wall of frame.forceWalls) {
        forceWalls.add(createLineObject(wall.start, wall.end, forceWallMaterial));
      }

      for (const sustain of frame.sustains) {
        sustains.add(createSustainObject(sustain, steamMaterial, widowMaterial, nukeMaterial));
      }
    }
  };
}

/**
 * Category: New
 * Purpose: Create one simple Three.js line object between two Quake-space points.
 */
function createLineObject(start: [number, number, number], end: [number, number, number], material: LineBasicMaterial): Line {
  const geometry = new BufferGeometry().setFromPoints([
    new Vector3(start[0], start[1], start[2]),
    new Vector3(end[0], end[1], end[2])
  ]);
  return new Line(geometry, material);
}

/**
 * Category: New
 * Purpose: Create one minimal debug object representing a client sustain effect.
 */
function createSustainObject(
  sustain: NonNullable<ReturnType<typeof createLocalClientController>["refreshFrame"]>["sustains"][number],
  steamMaterial: LineBasicMaterial,
  widowMaterial: MeshBasicMaterial,
  nukeMaterial: MeshBasicMaterial
): Object3D {
  if (sustain.kind === "steam") {
    const end: [number, number, number] = [
      sustain.origin[0] + sustain.direction[0] * sustain.radius,
      sustain.origin[1] + sustain.direction[1] * sustain.radius,
      sustain.origin[2] + sustain.direction[2] * sustain.radius
    ];
    return createLineObject(sustain.origin, end, steamMaterial);
  }

  const geometry = new SphereGeometry(Math.max(8, sustain.radius), 10, 8);
  const material = sustain.kind === "widow" ? widowMaterial : nukeMaterial;
  const mesh = new Mesh(geometry, material);
  mesh.position.set(sustain.origin[0], sustain.origin[1], sustain.origin[2]);
  return mesh;
}

/**
 * Category: New
 * Purpose: Remove and dispose all transient debug objects from one Three.js group.
 */
function clearGroup(group: Group): void {
  const children = [...group.children];
  for (const child of children) {
    group.remove(child);
    disposeObject(child);
  }
}

/**
 * Category: New
 * Purpose: Dispose transient line geometries created by the current debug refresh layer.
 */
function disposeObject(object: Object3D): void {
  if ("geometry" in object) {
    const geometry = (object as { geometry?: BufferGeometry | SphereGeometry }).geometry;
    geometry?.dispose();
  }
}
