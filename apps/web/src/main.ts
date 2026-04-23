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
  createQuakeSkyResolver,
  createThreeBrushModelSync,
  createThreeGlWorldSceneAdapter,
  createQuakeHudResourceResolver,
  createThreeParticleSync,
  createThreeRefreshEntitySync,
  createThreeSkySceneAdapter,
  createThreeHudLayer
} from "../../../packages/renderer-three/src/index.js";
import { findPrimarySpawnPoint, parseBsp } from "../../../packages/formats/src/index.js";
import { createVirtualFilesystem, mountPak, readMountedFile } from "../../../packages/filesystem/src/index.js";
import { createLocalClientController } from "./local-client-controller.js";
import { startWebDemoLoop } from "./web-demo-loop.js";
import { createRefreshDebugLayer } from "./refresh-debug-layer.js";
import { createWebShell, requireApp } from "./web-shell.js";
import {
  getDisplayMapName,
  getRequestedMapPath,
  listPakMapPaths,
  loadFirstAvailablePak,
  setRequestedMapPath
} from "./web-map-bootstrap.js";
import {
  createCamera,
  createRenderer,
  createScene,
  formatSkySnapshot
} from "./web-render-bootstrap.js";

const BASEQ2_PAK_CANDIDATES = [
  "/@fs/C:/a/Projets/Quake-2/Quake 2/baseq2/pak0.pak",
  "/baseq2/pak0.pak"
];
const DEFAULT_MAP_PATH = "maps/base1.bsp";

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
  const ui = createWebShell(app);
  const selectedMapPath = getRequestedMapPath(DEFAULT_MAP_PATH);

  try {
    ui.setStatus("Chargement de pak0.pak...");

    const rendererBundle = await createRenderer();
    ui.attachViewport(rendererBundle.renderer.domElement);
    ui.setRenderer(rendererBundle.label);
    ui.setStatus(`Analyse de la map ${getDisplayMapName(selectedMapPath)}...`);

    const pakBytes = await loadFirstAvailablePak(BASEQ2_PAK_CANDIDATES);
    const filesystem = createVirtualFilesystem();
    const mountedPak = mountPak(filesystem, pakBytes, "pak0.pak");
    const availableMaps = listPakMapPaths(mountedPak);
    ui.bindMapSelector({
      maps: availableMaps,
      currentValue: selectedMapPath,
      onChange: (mapPath) => {
        setRequestedMapPath(mapPath);
      }
    });

    const bspFile = readMountedFile(filesystem, selectedMapPath);
    if (!bspFile) {
      throw new Error(`La map ${selectedMapPath} est introuvable dans pak0.pak.`);
    }

    const map = parseBsp(bspFile.bytes, bspFile.path);
    const spawn = findPrimarySpawnPoint(map);
    const glWorldAdapter = createThreeGlWorldSceneAdapter(filesystem, selectedMapPath);
    const skyResolver = createQuakeSkyResolver(filesystem);
    const hudResourceResolver = createQuakeHudResourceResolver(filesystem);
    const hudLayer = createThreeHudLayer(hudResourceResolver);
    const group = glWorldAdapter.root;
    const skyAdapter = createThreeSkySceneAdapter(skyResolver);
    const brushModelSync = createThreeBrushModelSync(group);
    const refreshEntitySync = createThreeRefreshEntitySync(filesystem);
    const particleSync = createThreeParticleSync(filesystem);

    const scene = createScene(group);
    scene.add(skyAdapter.root);
    scene.add(refreshEntitySync.root);
    scene.add(particleSync.root);
    const camera = createCamera();
    refreshEntitySync.attachToCamera(camera);
    const cameraController = createLocalClientController(ui.viewport, camera, map, spawn);
    ui.bindGhostToggle({
      initialValue: cameraController.ghostMode,
      onToggle: (enabled) => {
        cameraController.setGhostMode(enabled);
      }
    });
    const refreshDebug = createRefreshDebugLayer();
    scene.add(refreshDebug.root);

    ui.setMapInfo({
      mapName: bspFile.path,
      faceCount: map.faces.length,
      surfaceCount: glWorldAdapter.worldmodel.numsurfaces,
      entityCount: cameraController.refreshFrame?.entities.length ?? 0,
      spawnText: spawn ? `${spawn.origin.join(", ")} | angle ${spawn.angle}` : "introuvable",
      skyText: formatSkySnapshot(cameraController.skySnapshot)
    });
    ui.setStatus("Map chargee.");

    startWebDemoLoop({
      renderer: rendererBundle.renderer,
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
      refreshDebug
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
