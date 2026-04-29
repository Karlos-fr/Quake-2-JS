/**
 * File: cl_main.ts
 * Purpose: Boot a browser demo that loads Quake II assets, parses one BSP map and renders it with Three.js.
 *
 * This file is not a direct source port.
 * It is an application bootstrap that connects the ported runtime/data layers to the web frontend.
 *
 * Dependencies:
 * - packages/formats
 * - packages/renderer-three
 * - three
 */

import {
  QGL_REQUIRED_PROCEDURES,
  createGlImageRuntime,
  createObjectQglProvider,
  createQuakeSkyResolver,
  createRefGlHost,
  createThreeBeamSync,
  createThreeDlightSync,
  createThreeGlDrawAdapter,
  createThreeGlWorldSceneAdapter,
  createThreeParticleSync,
  createThreePolyblendOverlay,
  createThreeRefreshEntitySync,
  createThreeSkySceneAdapter
} from "../../../packages/renderer-three/src/index.js";
import { findPrimarySpawnPoint, parseBsp } from "../../../packages/formats/src/index.js";
import { createVirtualFilesystem, mountPak, readMountedFile } from "../../../packages/filesystem/src/index.js";
import {
  CDAudio_Init,
  CDAudio_Pause,
  CDAudio_Play,
  CDAudio_Resume,
  CDAudio_Update,
  createClientCDAudioContext
} from "../../../packages/client/src/index.js";
import type { refimport_t } from "../../../packages/client/src/index.js";
import { createQuakeWebAudioAdapter, createWebCDAudioAdapter } from "../../../packages/platform/src/index.js";
import { CS_CDTRACK, PRINT_ALL, createCvarRuntime, Cvar_Get, type cvar_t } from "../../../packages/qcommon/src/index.js";
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
    const audio = createQuakeWebAudioAdapter({
      logs: {
        onInfo: (message) => ui.setStatus(message),
        onWarning: (message) => ui.setStatus(message)
      }
    });
    const cdAudioBackend = createWebCDAudioAdapter({
      context: audio.context,
      filesystem,
      logs: {
        onInfo: (message) => ui.setStatus(message),
        onWarning: (message) => ui.setStatus(message)
      }
    });
    const audioSettings = {
      masterVolume: 1,
      sfxVolume: 0.7,
      musicVolume: 1,
      muted: false
    };
    const applyAudioSettings = (): void => {
      const effectiveMaster = audioSettings.muted ? 0 : audioSettings.masterVolume;
      audio.setMuted(audioSettings.muted);
      audio.setMasterVolume(audioSettings.masterVolume);
      audio.setSfxVolume(audioSettings.sfxVolume);
      cdAudioBackend.setMasterVolume(effectiveMaster);
      cdAudioBackend.setMusicVolume(audioSettings.musicVolume);
    };
    applyAudioSettings();
    ui.bindAudioControls({
      masterVolume: audioSettings.masterVolume,
      sfxVolume: audioSettings.sfxVolume,
      musicVolume: audioSettings.musicVolume,
      muted: audioSettings.muted,
      onMasterVolume: (value) => {
        audioSettings.masterVolume = value;
        applyAudioSettings();
      },
      onSfxVolume: (value) => {
        audioSettings.sfxVolume = value;
        applyAudioSettings();
      },
      onMusicVolume: (value) => {
        audioSettings.musicVolume = value;
        applyAudioSettings();
      },
      onMuted: (value) => {
        audioSettings.muted = value;
        applyAudioSettings();
      }
    });
    const cdAudio = createClientCDAudioContext({
      onInit: () => true,
      onPlay: (track, looping) => cdAudioBackend.play(track, looping),
      onStop: () => cdAudioBackend.stop(),
      onPause: () => cdAudioBackend.pause(),
      onResume: () => cdAudioBackend.resume(),
      onUpdate: () => cdAudioBackend.update()
    });
    CDAudio_Init(cdAudio);
    const unlockAudio = (): void => {
      void audio.unlock();
    };
    ui.viewport.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("blur", () => {
      void audio.pause();
      CDAudio_Pause(cdAudio);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void audio.resume();
        CDAudio_Resume(cdAudio);
      } else {
        void audio.pause();
        CDAudio_Pause(cdAudio);
      }
    });
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
    const glDrawAdapter = createThreeGlDrawAdapter();
    const imageRuntime = createGlImageRuntime({
      loadFile: (path) => readMountedFile(filesystem, path)?.bytes ?? null,
      ...glDrawAdapter.imageHooks
    });
    const refGlHost = createRefGlHost({
      createQglProvider: () => createObjectQglProvider(createNoopQglBindings()),
      imageRuntime,
      drawHooks: glDrawAdapter.drawHooks,
      hooks: {
        glimpInit: () => true,
        glimpShutdown: () => {},
        glimpSetMode: () => ({ err: 0, width: ui.viewport.clientWidth || 640, height: ui.viewport.clientHeight || 480 }),
        glimpBeginFrame: () => {},
        glimpEndFrame: () => {}
      },
      imports: createWebRefImports(ui.setStatus)
    });
    refGlHost.init();
    const group = glWorldAdapter.root;
    const skyAdapter = createThreeSkySceneAdapter(skyResolver);
    const refreshEntitySync = createThreeRefreshEntitySync(filesystem);
    const particleSync = createThreeParticleSync(filesystem);
    const beamSync = createThreeBeamSync(filesystem);
    const dlightSync = createThreeDlightSync();
    const polyblendOverlay = createThreePolyblendOverlay();

    const scene = createScene(group);
    scene.add(skyAdapter.root);
    scene.add(refreshEntitySync.root);
    scene.add(particleSync.root);
    scene.add(beamSync.root);
    scene.add(dlightSync.root);
    refreshEntitySync.setShadowReceiverRoot(glWorldAdapter.root);
    const camera = createCamera();
    scene.add(camera);
    refreshEntitySync.attachToCamera(camera);
    const cameraController = createLocalClientController(ui.viewport, camera, map, spawn);
    const cdTrack = Number.parseInt(cameraController.runtime.cl.configstrings[CS_CDTRACK] ?? "", 10);
    CDAudio_Play(cdAudio, Number.isFinite(cdTrack) ? cdTrack : 0, true);
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
      glDrawAdapter,
      polyblendOverlay,
      ref: refGlHost.api,
      skyAdapter,
      glWorldAdapter,
      refreshEntitySync,
      particleSync,
      beamSync,
      dlightSync,
      refreshDebug,
      filesystem,
      audio,
      updateCDAudio: () => CDAudio_Update(cdAudio)
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

function createNoopQglBindings(): Record<string, unknown> {
  const bindings: Record<string, unknown> = {};
  for (const name of QGL_REQUIRED_PROCEDURES) {
    bindings[name] = () => undefined;
  }
  bindings.qglGetString = (name: number) => {
    switch (name) {
      case 0x1f00:
        return "Quake2JS";
      case 0x1f01:
        return "Three.js";
      case 0x1f02:
        return "1.0";
      case 0x1f03:
        return "";
      default:
        return "";
    }
  };
  bindings.qglGetError = () => 0;
  return bindings;
}

function createWebRefImports(onStatus: (message: string) => void): Partial<refimport_t> {
  const cvarRuntime = createCvarRuntime();
  const cvars = new Map<string, cvar_t>();

  return {
    Con_Printf: (level: number, message: string) => {
      if (level === PRINT_ALL && message.trim().length > 0) {
        onStatus(message.trim());
      }
    },
    Sys_Error: (_level: number, message: string): never => {
      throw new Error(message);
    },
    Cvar_Get: (name: string, value: string, flags: number) => {
      const existing = cvars.get(name);
      if (existing) {
        return existing;
      }
      const created = requireCvar(Cvar_Get(cvarRuntime, name, value, flags), name);
      cvars.set(name, created);
      return created;
    },
    Cvar_Set: (name: string, value: string) => {
      const target = cvars.get(name) ?? requireCvar(Cvar_Get(cvarRuntime, name, value, 0), name);
      target.string = value;
      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        target.value = numeric;
      }
      cvars.set(name, target);
      return target;
    },
    Cvar_SetValue: (name: string, value: number) => {
      const target = cvars.get(name) ?? requireCvar(Cvar_Get(cvarRuntime, name, String(value), 0), name);
      target.value = value;
      target.string = String(value);
      cvars.set(name, target);
    },
    Cmd_AddCommand: () => {},
    Cmd_RemoveCommand: () => {},
    FS_Gamedir: () => "baseq2",
    Vid_MenuInit: () => {}
  };
}

function requireCvar(cvar: cvar_t | null, name: string): cvar_t {
  if (!cvar) {
    throw new Error(`Unable to create cvar ${name}`);
  }

  return cvar;
}
