/**
 * File: full-game.ts
 * Purpose: Browser page that follows the original Quake II front-door flow: cinematics first, then the menu.
 *
 * This file is not a direct source port.
 * It is an application adapter that wires ported client/menu/cinematic code to a canvas-backed web page.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/formats
 * - packages/qcommon
 */

import { parsePcx, type PcxImage } from "../../../packages/formats/src/index.js";
import { Scene } from "three";
import {
  createVirtualFilesystem,
  FS_Gamedir,
  FS_SetGamedir,
  mountDirectory,
  mountPak,
  readMountedFile,
  type VirtualFilesystem
} from "../../../packages/filesystem/src/index.js";
import {
  createQuakeWebAudioAdapter,
  createWebCDAudioAdapter,
  type QuakeWebAudioAdapter,
  type WebCDAudioAdapter
} from "../../../packages/platform/src/index.js";
import {
  Cmd_AddCommand,
  Cmd_Exists,
  Cmd_Init,
  Cmd_RemoveCommand,
  Cbuf_AddText,
  Cbuf_Execute,
  Cvar_Command,
  Cvar_Init,
  Cvar_Get,
  Cvar_VariableValue,
  PRINT_ALL,
  AngleVectors,
  CM_InlineModel,
  createCommandRuntime,
  createCvarRuntime,
  type cvar_t
} from "../../../packages/qcommon/src/index.js";
import {
  K_DOWNARROW,
  K_BACKSPACE,
  K_ALT,
  K_CTRL,
  K_DEL,
  K_ENTER,
  K_ESCAPE,
  K_F10,
  K_END,
  K_F1,
  K_HOME,
  K_INS,
  K_KP_DOWNARROW,
  K_KP_END,
  K_KP_ENTER,
  K_KP_DEL,
  K_KP_HOME,
  K_KP_INS,
  K_KP_LEFTARROW,
  K_KP_MINUS,
  K_KP_PGDN,
  K_KP_PGUP,
  K_KP_PLUS,
  K_KP_RIGHTARROW,
  K_KP_SLASH,
  K_KP_UPARROW,
  K_LEFTARROW,
  K_MWHEELDOWN,
  K_MWHEELUP,
  K_MOUSE1,
  K_MOUSE2,
  K_MOUSE3,
  K_RIGHTARROW,
  K_PGUP,
  K_PGDN,
  K_PAUSE,
  K_SHIFT,
  K_SPACE,
  K_TAB,
  K_UPARROW,
  Key_Init,
  Key_Event,
  createClientKeyContext,
  keydest_t
} from "../../../packages/client/src/keys.js";
import {
  Con_ClearNotify,
  Con_DrawConsole,
  Con_Init,
  Con_Print,
  Con_SyncConsoleToKeys,
  createClientConsoleContext,
  type ClientConsoleContext,
  type ConsoleDrawConsoleSnapshot,
  type ConsoleTextCommand
} from "../../../packages/client/src/console.js";
import {
  M_Draw,
  M_ForceMenuOff,
  M_Init,
  M_Keydown,
  M_Menu_Main_f,
  createClientMenuContext,
  type ClientMenuContext
} from "../../../packages/client/src/menu.js";
import { createClientQMenuContext } from "../../../packages/client/src/qmenu.js";
import {
  SCR_Init,
  SCR_DrawCinematicRef,
  SCR_DrawLoading,
  SCR_PlayCinematic,
  SCR_RunCinematic,
  SCR_RunConsole,
  SCR_StopCinematic
} from "../../../packages/client/src/cl_scrn.js";
import { CL_RegisterSounds } from "../../../packages/client/src/sound.js";
import type {
  ClientMuzzleFlash2Packet,
  ClientMuzzleFlashPacket,
  ClientTempEntityPacket
} from "../../../packages/client/src/cl_parse.js";
import type { ClientEntityEvent } from "../../../packages/client/src/cl_ents.js";
import { CL_InitInput, createClientInputContext, createClientSendCmdBridge } from "../../../packages/client/src/cl_input.js";
import {
  CL_Frame,
  CL_InitLocal,
  CL_ReadPackets,
  CL_WriteConfiguration,
  Cmd_ForwardToServer as CL_Cmd_ForwardToServer,
  createClientMainContext,
  type ClientMainContext
} from "../../../packages/client/src/cl_main.js";
import {
  CL_BuildActionEffects,
  CL_BuildEntityEventEffects,
  CL_AllocDlight,
  CL_ItemRespawnParticles,
  CL_LogoutEffect,
  CL_ParticleEffect,
  type ClientActionEffect
} from "../../../packages/client/src/cl_fx.js";
import { CL_SmokeAndFlash } from "../../../packages/client/src/cl_tent.js";
import { createClientScreenContext } from "../../../packages/client/src/cl_scrn.js";
import {
  createClientSndDmaContext,
  S_BeginRegistration as S_DMA_BeginRegistration,
  S_EndRegistration as S_DMA_EndRegistration,
  S_Init as S_DMA_Init,
  S_IssueReadyPlaysounds as S_DMA_IssueReadyPlaysounds,
  S_IssuePlaysound as S_DMA_IssuePlaysound,
  S_RegisterSound as S_DMA_RegisterSound,
  S_StartLocalSound as S_DMA_StartLocalSound,
  S_StartSound as S_DMA_StartSound,
  S_StopAllSounds as S_DMA_StopAllSounds,
  S_Update as S_DMA_Update,
  type ClientSndDmaContext
} from "../../../packages/client/src/snd_dma.js";
import { createClientSoundLocalContext, type ClientSoundLocalContext, type playsound_t, type sfx_t } from "../../../packages/client/src/snd_loc.js";
import {
  CL_CalcViewValues,
  CL_PredictMovement,
  CL_UpdateLerpFraction,
  CL_PrepRefresh,
  createClientPredictionCollisionSource,
  createClientViewContext,
  V_Init
} from "../../../packages/client/src/view.js";
import { createRefExport, type refexport_t, type refimport_t } from "../../../packages/client/src/ref.js";
import { createClientRuntime, connstate_t, type ClientRuntime } from "../../../packages/client/src/client.js";
import type { ClientRefreshFrame } from "../../../packages/client/src/index.js";
import { createClientVidMenuController, type ClientVidMenuController } from "../../../packages/client/src/vid-menu.js";
import { createClientVidContext } from "../../../packages/client/src/vid.js";
import {
  createFullGameCommandBridgeState,
  registerFullGameCommandBridge,
  syncFullGameLoadingState,
  type FullGameCommandBridgeState
} from "./full-game-command-bridge.js";
import {
  createWebConfigStorage,
  readWebConfigOrMountedText,
  type WebConfigStorage
} from "./web-config-storage.js";
import { createWebSaveStorage, type WebSaveStorage } from "./web-save-storage.js";
import { registerWebConfigCommands } from "./web-config-commands.js";
import { createFullGameLocalTransport } from "./full-game-local-transport.js";
import {
  createFullGameServerHost,
  type FullGameServerHost
} from "./full-game-server-host.js";
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
import { createRefreshDebugLayer } from "./refresh-debug-layer.js";
import {
  createFullGameRenderLoop,
  type FullGameRenderLoop
} from "./full-game-render-loop.js";
import {
  createFullGameServerRenderSource,
  getFullGameServerMapPath
} from "./full-game-render-source.js";
import {
  createCamera,
  createRenderer,
  type ActiveRenderer
} from "./web-render-bootstrap.js";

const BASEQ2_PAK_CANDIDATES = [
  "/@fs/C:/a/Projets/Quake-2/Quake 2/baseq2/pak0.pak",
  "/baseq2/pak0.pak"
];

const LOOSE_VIDEO_CANDIDATES = [
  "/@fs/C:/a/Projets/Quake-2/Quake 2/baseq2",
  "/baseq2"
];

const STARTUP_CINEMATICS = [
  "idlog.cin",
  "ntro.cin"
];

const LOGICAL_WIDTH = 640;
const LOGICAL_HEIGHT = 480;

type DrawCommand =
  | { type: "pic"; x: number; y: number; name: string; width?: number; height?: number }
  | { type: "char"; x: number; y: number; code: number }
  | { type: "fill"; x: number; y: number; width: number; height: number; color: number }
  | { type: "raw"; x: number; y: number; width: number; height: number; cols: number; rows: number; data: Uint8Array }
  | { type: "fade" };

interface FullGamePage {
  root: HTMLElement;
  gameViewport: HTMLDivElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  status: HTMLElement;
  log: HTMLElement;
}

interface CanvasAssetCache {
  pictures: Map<string, HTMLCanvasElement | null>;
  glyphs: HTMLCanvasElement | null;
  paletteRgb: Uint8Array | null;
}

interface FullGameRuntime {
  client: ClientRuntime;
  menu: ClientMenuContext;
  console: ClientConsoleContext;
  mouse: FullGameMouseState;
  filesystem: VirtualFilesystem;
  configStorage: WebConfigStorage;
  saveStorage: WebSaveStorage;
  drawCommands: DrawCommand[];
  assets: CanvasAssetCache;
  audio: QuakeWebAudioAdapter;
  cdAudio: WebCDAudioAdapter;
  sndDma: ClientSndDmaContext;
  audioDebug: FullGameAudioDebugState;
  gameBridge: FullGameCommandBridgeState;
  serverHost: FullGameServerHost;
  gameRenderer: FullGameRendererState | null;
  gameRendererPromise: Promise<FullGameRendererState> | null;
  gameRendererPromiseMapPath: string | null;
  currentCinematicIndex: number;
  mode: "cinematic" | "menu" | "loading" | "game";
  lastFrameTime: number;
  cinematicStartedAt: number;
  flushClientOutput: () => void;
  updateClientAudio: () => void;
  writeConfiguration: () => boolean;
  beginAuthoritativeConnection: (mapRequest: string) => void;
  shouldPumpAuthoritativeFrame: () => boolean;
  pumpAuthoritativeFrame: (milliseconds: number) => void;
  authoritativeGameReady: () => boolean;
  markAuthoritativeGameActive: () => void;
  consoleRenderedInThree: boolean;
}

interface FullGameAudioDebugState {
  serverStartSoundCalls: number;
  serverResolvedSfx: number;
  serverMissingSfx: number;
  lastServerSound: string;
  lastMissingSound: string;
}

interface FullGameRendererState {
  mapPath: string;
  renderer: ActiveRenderer;
  renderLoop: FullGameRenderLoop;
  camera: ReturnType<typeof createCamera>;
  consoleCanvas: HTMLCanvasElement;
}

interface FullGameMouseState {
  pointerLocked: boolean;
  pointerLockEscapeArmed: boolean;
  lookActive: boolean;
  dragging: boolean;
  suppressNextEscapeKeyUp: boolean;
}


void bootstrap();

async function bootstrap(): Promise<void> {
  const app = requireApp();
  const page = createPage(app);

  try {
    page.status.textContent = "Chargement des assets Quake II...";
    const filesystem = await createMountedFilesystem();
    const runtime = createFullGameRuntime(filesystem, page);
    void runtime.audio.unlock();

    resizeCanvas(page);
    window.addEventListener("resize", () => resizeCanvas(page));
    window.addEventListener("beforeunload", () => {
      runtime.writeConfiguration();
    });
    window.addEventListener("pointerdown", (event) => handlePointerDown(event, runtime, page), { capture: true });
    document.addEventListener("pointerlockchange", () => handlePointerLockChange(runtime, page));
    window.addEventListener("pointerlockerror", () => {
      runtime.mouse.pointerLocked = false;
      Con_Print(runtime.console.con, "pointer lock souris refuse par le navigateur\n", runtime.client.cls.realtime);
    });
    document.addEventListener("mousemove", (event) => handleMouseMove(event, runtime, page));
    document.addEventListener("keydown", (event) => handleKeyDown(event, runtime, page), { capture: true });
    document.addEventListener("keyup", (event) => handleKeyUp(event, runtime, page), { capture: true });
    window.addEventListener("mousedown", (event) => handleMouseButton(event, true, runtime, page));
    window.addEventListener("mouseup", (event) => handleMouseButton(event, false, runtime, page));
    window.addEventListener("wheel", (event) => handleMouseWheel(event, runtime, page), { passive: false });
    window.addEventListener("blur", () => resetFullGameMouseLook(runtime));

    page.status.textContent = "Lecture de l'intro...";
    startNextCinematic(runtime, page);
    requestAnimationFrame((time) => frame(time, runtime, page));
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    page.status.textContent = "Echec du chargement.";
    page.log.style.display = "block";
    page.log.textContent = [
      "Impossible de lancer la page de deroulement Quake II.",
      message,
      "En dev, Vite doit pouvoir lire l'installation locale via /@fs/.",
      "Alternative: placer pak0.pak et baseq2/video/*.cin sous apps/web/public/baseq2/."
    ].join("\n");
  }
}

function requireApp(): HTMLElement {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) {
    throw new Error("Element #app introuvable.");
  }
  return app;
}

function createPage(root: HTMLElement): FullGamePage {
  root.innerHTML = "";
  document.body.style.margin = "0";
  document.body.style.background = "#000";
  document.body.style.overflow = "hidden";

  const shell = document.createElement("main");
  shell.style.position = "fixed";
  shell.style.inset = "0";
  shell.style.background = "#000";
  shell.style.color = "#d8d2c7";
  shell.style.fontFamily = "Arial, Helvetica, sans-serif";

  const gameViewport = document.createElement("div");
  gameViewport.style.position = "absolute";
  gameViewport.style.inset = "0";
  gameViewport.style.background = "#000";
  gameViewport.style.overflow = "hidden";
  gameViewport.style.zIndex = "0";
  gameViewport.style.display = "none";

  const canvas = document.createElement("canvas");
  canvas.width = LOGICAL_WIDTH;
  canvas.height = LOGICAL_HEIGHT;
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.objectFit = "contain";
  canvas.style.background = "#000";
  canvas.style.imageRendering = "pixelated";
  canvas.style.zIndex = "1";
  canvas.tabIndex = 0;

  const status = document.createElement("div");
  status.style.position = "absolute";
  status.style.left = "16px";
  status.style.top = "12px";
  status.style.padding = "6px 8px";
  status.style.background = "rgba(0, 0, 0, 0.55)";
  status.style.border = "1px solid rgba(216, 210, 199, 0.22)";
  status.style.fontSize = "12px";
  status.style.zIndex = "20";

  const log = document.createElement("pre");
  log.style.position = "absolute";
  log.style.left = "16px";
  log.style.bottom = "12px";
  log.style.maxWidth = "min(720px, calc(100vw - 32px))";
  log.style.maxHeight = "35vh";
  log.style.overflow = "auto";
  log.style.margin = "0";
  log.style.whiteSpace = "pre-wrap";
  log.style.color = "#f0d060";
  log.style.background = "rgba(0, 0, 0, 0.62)";
  log.style.font = "12px Consolas, monospace";
  log.style.display = "none";
  log.style.zIndex = "25";

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D indisponible.");
  }

  shell.append(gameViewport, canvas, log);
  root.append(shell);
  canvas.focus();

  return {
    root: shell,
    gameViewport,
    canvas,
    context,
    status,
    log
  };
}

async function createMountedFilesystem(): Promise<VirtualFilesystem> {
  const pakBytes = await fetchFirstBytes(BASEQ2_PAK_CANDIDATES);
  const looseVideos = new Map<string, Uint8Array>();

  for (const name of STARTUP_CINEMATICS) {
    const bytes = await fetchFirstBytes(LOOSE_VIDEO_CANDIDATES.map((base) => `${base}/video/${name}`));
    looseVideos.set(`video/${name}`, bytes);
  }

  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, pakBytes, "pak0.pak");
  mountDirectory(filesystem, "baseq2", looseVideos);
  return filesystem;
}

async function fetchFirstBytes(urls: string[]): Promise<Uint8Array> {
  const errors: string[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        errors.push(`${url}: ${response.status}`);
        continue;
      }
      return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : `${error}`}`);
    }
  }

  throw new Error(`Aucun fichier accessible:\n${errors.join("\n")}`);
}

function createFullGameRuntime(filesystem: VirtualFilesystem, page: FullGamePage): FullGameRuntime {
  const client = createClientRuntime();
  const mouse: FullGameMouseState = {
    pointerLocked: false,
    pointerLockEscapeArmed: false,
    lookActive: false,
    dragging: false,
    suppressNextEscapeKeyUp: false
  };
  const configStorage = createWebConfigStorage();
  const saveStorage = createWebSaveStorage();
  client.cls.state = connstate_t.ca_disconnected;
  let consoleContext: ClientConsoleContext | null = null;
  let mainContext: ClientMainContext | null = null;
  const printToConsole = (line: string): void => {
    if (shouldSuppressFullGameConsoleLine(line)) {
      return;
    }

    if (!consoleContext) {
      appendLog(page, line);
      return;
    }

    const text = line.endsWith("\n") ? line : `${line}\n`;
    Con_Print(consoleContext.con, text, client.cls.realtime);
    Con_SyncConsoleToKeys(consoleContext);
  };

  const cvar = createCvarRuntime({
    onPrint: printToConsole,
    onGameDirChange: (value) => {
      const applied = FS_SetGamedir(filesystem, value);
      if (!applied) {
        printToConsole(`gamedir invalide: ${value}`);
        return;
      }

      Cbuf_AddText(cmd, "exec config.cfg\n");
    },
    onExecAutoexec: () => {
      Cbuf_AddText(cmd, "exec autoexec.cfg\n");
    }
  });
  const cmd = createCommandRuntime({
    onPrint: printToConsole,
    loadTextFile: (path) => readWebConfigOrMountedText(configStorage, filesystem, path),
    executeUnknownCommand: (_name, text) => {
      if (text.trim() === "webaudioinfo") {
        printToConsole(formatWebAudioInfo(audio, sndDmaContext, audioDebug));
        return true;
      }

      const result = Cvar_Command(cvar, cmd);
      if (result.output) {
        printToConsole(result.output);
      }
      if (result.handled) {
        return true;
      }

      if (mainContext) {
        CL_Cmd_ForwardToServer(mainContext, {
          onPrint: printToConsole
        });
        return true;
      }

      printToConsole(`Unknown command "${text}"`);
      return true;
    }
  });

  Cmd_Init(cmd);
  Cvar_Init(cvar, cmd);
  seedMenuCvars(cvar);

  const drawCommands: DrawCommand[] = [];
  const assets: CanvasAssetCache = {
    pictures: new Map(),
    glyphs: null,
    paletteRgb: null
  };
  const audio = createQuakeWebAudioAdapter({
    logs: {
      onInfo: () => undefined,
      onWarning: printToConsole
    }
  });
  const cdAudio = createWebCDAudioAdapter({
    context: audio.context,
    filesystem,
    logs: {
      onInfo: () => undefined,
      onWarning: printToConsole
    }
  });
  let sndDmaContext: ClientSndDmaContext | null = null;
  let gameRenderer: FullGameRendererState | null = null;
  let gameRendererPromise: Promise<FullGameRendererState> | null = null;
  let gameRendererPromiseMapPath: string | null = null;
  let consoleRenderedInThree = false;
  const audioDebug: FullGameAudioDebugState = {
    serverStartSoundCalls: 0,
    serverResolvedSfx: 0,
    serverMissingSfx: 0,
    lastServerSound: "",
    lastMissingSound: ""
  };
  const soundLocal = createClientSoundLocalContext({
    onSNDDMA_Init: () => initializeWebSoundDma(soundLocal, audio),
    onSNDDMA_GetDMAPos: () => getWebSoundDmaPosition(soundLocal, audio),
    onSNDDMA_Shutdown: () => {
      audio.stopAll();
      soundLocal.state.dma.buffer = null;
      soundLocal.state.dma.samplepos = 0;
    },
    onFS_LoadFile: (path) => readMountedFile(filesystem, path)?.bytes ?? null,
    onFS_FreeFile: () => undefined,
    onComPrintf: printToConsole,
    onComDPrintf: printToConsole,
    onS_IssuePlaysound: (ps) => {
      if (!sndDmaContext) {
        return;
      }
      playIssuedWebSound(sndDmaContext, audio, ps);
    }
  });

  const ref = createCanvasRef(filesystem, assets, drawCommands);
  const keys = createClientKeyContext({ cmd, cvar, client });
  const localTransport = createFullGameLocalTransport({
    now: () => client.cls.realtime,
    onPrint: printToConsole
  });
  const fileExists = (path: string): boolean => readMountedFile(filesystem, path) !== null;
  const loadBinaryFile = (path: string): Uint8Array | null => readMountedFile(filesystem, path)?.bytes ?? null;
  const prepClientRefresh = (): void => {
    const options = {
      ref,
      viewportWidth: LOGICAL_WIDTH,
      viewportHeight: LOGICAL_HEIGHT,
      crosshairValue: Cvar_VariableValue(cvar, "crosshair"),
      ...(consoleContext ? { console: consoleContext.con } : {}),
      onPrint: printToConsole,
      onUpdateScreen: () => undefined,
      onPumpEvents: () => undefined,
      onPlayCdTrack: (track: number, looping: boolean) => {
        cdAudio.play(track, looping);
      },
      inlineModel: (name: string) => activeServerHost
        ? CM_InlineModel(activeServerHost.collisionWorld, name)
        : null
    };
    if (CL_PrepRefresh(client, options)) {
      client.cl.screen.scr_draw_loading = 0;
    }
  };
  const registerAuthoritativeSound = (path: string): sfx_t | string => {
    const context = sndDmaContext;
    if (!context) {
      return path;
    }

    return S_DMA_RegisterSound(context, path) ?? path;
  };
  const registerAuthoritativeSounds = (): void => {
    const context = sndDmaContext;
    if (!context) {
      CL_RegisterSounds(client);
      return;
    }

    CL_RegisterSounds(client, {
      onBeginRegistration: () => {
        S_DMA_BeginRegistration(context);
      },
      onRegisterSound: (path) => registerAuthoritativeSound(path),
      onEndRegistration: () => {
        S_DMA_EndRegistration(context);
        S_DMA_StopAllSounds(context);
      }
    });
  };
  const resolveAuthoritativeSfx = (sound: unknown): sfx_t | null => {
    if (isSfx(sound)) {
      return sound;
    }

    if (typeof sound !== "string" || sound.length === 0 || !sndDmaContext) {
      return null;
    }

    return S_DMA_RegisterSound(sndDmaContext, sound);
  };
  const startAuthoritativeSound = (
    origin: [number, number, number] | null,
    ent: number,
    channel: number,
    sound: unknown,
    volume: number,
    attenuation: number,
    timeofs: number
  ): void => {
    if (!sndDmaContext) {
      return;
    }

    audioDebug.serverStartSoundCalls += 1;
    audioDebug.lastServerSound = describeAuthoritativeSound(sound);
    const sfx = resolveAuthoritativeSfx(sound);
    if (sfx?.cache) {
      audioDebug.serverResolvedSfx += 1;
    } else {
      audioDebug.serverMissingSfx += 1;
      audioDebug.lastMissingSound = audioDebug.lastServerSound;
    }

    S_DMA_StartSound(
      sndDmaContext,
      origin,
      ent,
      channel,
      sfx,
      volume,
      attenuation,
      timeofs
    );
    if (timeofs <= 0) {
      for (const issued of S_DMA_IssueReadyPlaysounds(sndDmaContext)) {
        audio.playChannel(issued);
      }
    }
  };
  const startAuthoritativeEffectSounds = (effects: ClientActionEffect[]): void => {
    for (const effect of effects) {
      if (!effect.sound) {
        continue;
      }

      const volume = effect.sound.volume ?? 1;
      const timeofs = effect.sound.delayMs !== undefined ? effect.sound.delayMs / 1000 : 0;
      startAuthoritativeSound(
        effect.position ?? null,
        effect.entity ?? 0,
        effect.sound.channel,
        effect.sound.name,
        volume,
        effect.sound.attenuation,
        timeofs
      );
    }
  };
  const applyAuthoritativeVisualEffects = (effects: ClientActionEffect[]): void => {
    for (const effect of effects) {
      if (effect.light && effect.position && effect.entity !== undefined) {
        const dlight = CL_AllocDlight(client, effect.entity);
        dlight.origin = [...effect.position];
        dlight.radius = effect.light.radius;
        dlight.minlight = effect.light.minlight ?? 0;
        dlight.die = client.cl.time + effect.light.durationMs;
        dlight.decay = 0;
        dlight.color = [...effect.light.color];
      }

      if (effect.kind === "particle-effect" && effect.position) {
        CL_ParticleEffect(client, effect.position, [0, 0, 0], effect.color ?? 0, effect.count ?? 0);
      } else if (effect.kind === "item-respawn-particles" && effect.position) {
        CL_ItemRespawnParticles(client, effect.position);
      } else if (effect.kind === "smoke-and-flash" && effect.position) {
        CL_SmokeAndFlash(client, effect.position);
      } else if (
        effect.position
        && effect.packet
        && "weapon" in effect.packet
        && (effect.kind === "login" || effect.kind === "logout" || effect.kind === "respawn")
      ) {
        CL_LogoutEffect(client, effect.position, effect.packet.weapon);
      }
    }
  };
  const applyAuthoritativeActionEffects = (effects: ClientActionEffect[]): void => {
    applyAuthoritativeVisualEffects(effects);
    startAuthoritativeEffectSounds(effects);
  };
  let activeServerHost: FullGameServerHost | null = null;
  mainContext = createClientMainContext(client, cmd, cvar);
  CL_InitLocal(mainContext, {
    getMilliseconds: () => client.cls.realtime,
    qnet: localTransport.clientQnet,
    serverRunning: () => activeServerHost?.hasActiveGameMap() ?? false,
    allowDownload: false,
    fileExists,
    loadBinaryFile,
    onPrepRefresh: prepClientRefresh,
    onRegisterSounds: registerAuthoritativeSounds,
    onBegin: () => {
      client.cl.screen.scr_draw_loading = 0;
    },
    onPrint: printToConsole,
    onDisconnect: () => printToConsole("Disconnected."),
    onQuit: () => printToConsole("Quit demande."),
    onBeginLoadingPlaque: () => {
      client.cl.screen.scr_draw_loading = 1;
    },
    onEndLoadingPlaque: () => {
      client.cl.screen.scr_draw_loading = 0;
    },
    onServerConnectRequest: (servername) => {
      printToConsole(`Connecting to ${servername}...`);
    },
    onEnableRemoteNetworking: () => undefined,
    onPingServer: (message, destination) => {
      printToConsole(`ping ${destination}: ${message.trimEnd()}`);
    },
    onSendRcon: (_message, destination) => {
      printToConsole(`rcon vers ${destination} non branche.`);
    },
    getGameDir: () => FS_Gamedir(filesystem),
    onWriteConfigFile: (path, contents) => configStorage.writeText(path, contents)
  });
  const inputContext = createClientInputContext(client, cmd, cvar, {
    qnet: localTransport.clientQnet
  });
  CL_InitInput(inputContext);
  const sendClientCommand = createClientSendCmdBridge(inputContext, {
    getFrameOptions: () => ({
      anykeydown: keys.state.anykeydown > 0,
      key_game_active: keys.state.key_dest === keydest_t.key_game
    })
  });
  const viewContext = createClientViewContext(client, cmd, cvar);
  V_Init(viewContext);
  const screenContext = createClientScreenContext(client, cmd, cvar);
  SCR_Init(screenContext);
  const gameBridge = createFullGameCommandBridgeState();
  let pendingAuthoritativeMapRequest: string | null = null;
  const beginAuthoritativeConnection = (mapRequest: string): void => {
    if (pendingAuthoritativeMapRequest === mapRequest) {
      return;
    }

    pendingAuthoritativeMapRequest = mapRequest;
    localTransport.clear();
    client.cls.state = connstate_t.ca_disconnected;
    client.cl.refresh_prepped = false;
    client.cl.screen.scr_draw_loading = 1;
  };
  const serverHost = createFullGameServerHost({
    cmd,
    cvar,
    filesystem,
    getGameDir: () => FS_Gamedir(filesystem),
    saveStorage,
    qnet: localTransport.serverQnet,
    onPrint: printToConsole,
    onBeginLoading: () => {
      client.cl.screen.scr_draw_loading = 1;
    }
  });
  activeServerHost = serverHost;
  const predictAuthoritativeClientMovement = (): void => {
    const incomingAcknowledged = client.cls.netchan.incoming_acknowledged;
    const outgoingSequence = client.cls.netchan.outgoing_sequence;
    const predictionCollision = serverHost.hasActiveGameMap()
      ? createClientPredictionCollisionSource(client, serverHost.collisionWorld)
      : undefined;
    CL_PredictMovement(client, {
      incomingAcknowledged,
      outgoingSequence,
      predictMovement: true,
      ...(predictionCollision ? { predictionCollision } : {})
    });
  };
  const createAuthoritativeClientHooks = (withReadPackets: boolean) => ({
    getMilliseconds: () => client.cls.realtime,
    qnet: localTransport.clientQnet,
    serverRunning: () => serverHost.hasActiveGameMap(),
    onPrint: printToConsole,
    onStufftext: (text: string) => {
      Cbuf_AddText(cmd, text);
    },
    onExecuteCommandBuffer: () => {
      Cbuf_Execute(cmd);
    },
    ...(withReadPackets ? {
      onReadPackets: () => {
        CL_ReadPackets(mainContext!, createAuthoritativeClientHooks(false));
      }
    } : {}),
    onSendCmd: sendClientCommand,
    onPredictMovement: predictAuthoritativeClientMovement,
    onPrepRefresh: prepClientRefresh,
    onRegisterSounds: registerAuthoritativeSounds,
    onStartSound: startAuthoritativeSound,
    onMuzzleFlash: (packet: ClientMuzzleFlashPacket) => {
      applyAuthoritativeActionEffects(CL_BuildActionEffects(packet, client));
    },
    onMuzzleFlash2: (packet: ClientMuzzleFlash2Packet) => {
      applyAuthoritativeActionEffects(CL_BuildActionEffects(packet, client));
    },
    onTempEntity: (packet: ClientTempEntityPacket) => {
      startAuthoritativeEffectSounds(CL_BuildActionEffects(packet, client));
    },
    onEntityEvent: (event: ClientEntityEvent) => {
      applyAuthoritativeActionEffects(CL_BuildEntityEventEffects(event, {
        clFootsteps: client.cl.cl_footsteps
      }));
    },
    onBegin: () => {
      client.cl.screen.scr_draw_loading = 0;
    },
    onPlayCdTrack: (track: number, looping: boolean) => {
      cdAudio.play(track, looping);
    },
    registerModel: (path: string) => ref.RegisterModel(path),
    registerSkin: (path: string) => ref.RegisterSkin(path),
    registerPic: (path: string) => ref.RegisterPic(path),
    registerSound: registerAuthoritativeSound
  });
  const shouldPumpAuthoritativeFrame = (): boolean => (
    serverHost.hasActiveGameMap()
    || client.cls.state === connstate_t.ca_connecting
    || client.cls.state === connstate_t.ca_connected
    || client.cls.state === connstate_t.ca_active
  );
  const pumpAuthoritativeFrame = (milliseconds: number): void => {
    const msec = Math.max(0, Math.trunc(milliseconds));
    CL_Frame(mainContext!, msec, createAuthoritativeClientHooks(true));
    serverHost.frame(msec);
    CL_ReadPackets(mainContext!, createAuthoritativeClientHooks(false));
  };
  const authoritativeGameReady = (): boolean => (
    serverHost.hasActiveGameMap()
    && client.cls.state === connstate_t.ca_active
    && client.cl.refresh_prepped
  );
  const markAuthoritativeGameActive = (): void => {
    client.cl.screen.scr_draw_loading = 0;
    if (keys.state.key_dest !== keydest_t.key_console
      && keys.state.key_dest !== keydest_t.key_message
      && keys.state.key_dest !== keydest_t.key_menu) {
      keys.state.key_dest = keydest_t.key_game;
    }
    pendingAuthoritativeMapRequest = null;
    gameBridge.requestedMap = null;
    gameBridge.serverRunning = true;
    gameBridge.phase = "idle";
  };
  registerFullGameCommandBridge(cmd, cvar, client, gameBridge, {
    onPrint: printToConsole,
    onBeginLoading: () => {
      client.cl.screen.scr_draw_loading = 1;
    },
    onKillServer: () => {
      pendingAuthoritativeMapRequest = null;
      localTransport.clear();
      client.cls.state = connstate_t.ca_disconnected;
    },
    onMapRequested: (map, source) => {
      printToConsole(`${source} ${map}: preparation du host jeu final.`);
      beginAuthoritativeConnection(map);
    }
  });

  consoleContext = createClientConsoleContext({
    client,
    keys,
    cmd,
    cvar,
    filesystem,
    hooks: {
      onPrint: printToConsole,
      onWriteTextFile: (path) => printToConsole(`console dump: ${path}`),
      onCreatePath: () => undefined
    }
  });
  Con_Init(consoleContext, LOGICAL_WIDTH);
  const sndDma = createClientSndDmaContext(client, cmd, cvar, soundLocal);
  sndDmaContext = sndDma;
  S_DMA_Init(sndDma);

  const qmenu = createClientQMenuContext({
    getMilliseconds: () => client.cls.realtime,
    onDrawChar: (command) => {
      ref.DrawChar(command.x, command.y, command.c);
    },
    onDrawFill: (command) => {
      ref.DrawFill(command.x, command.y, command.w, command.h, command.c);
    }
  });
  let menuContext: ClientMenuContext | null = null;
  let videoMenu: ClientVidMenuController | null = null;
  const vid = createClientVidContext({
    onMenuInit: () => {
      if (!menuContext) {
        return;
      }
      const controller = createClientVidMenuController(menuContext, {
        onApplyChanges: () => {
          printToConsole("changements video appliques aux cvars web.");
        }
      });
      videoMenu = controller;
      controller.VID_MenuInit();
    },
    onMenuDraw: () => {
      videoMenu?.VID_MenuDraw();
    },
    onMenuKey: (key) => videoMenu?.VID_MenuKey(key) ?? null
  });
  vid.viddef.width = LOGICAL_WIDTH;
  vid.viddef.height = LOGICAL_HEIGHT;
  keys.hooks.onPrint = printToConsole;
  Key_Init(keys);

  const menu = createClientMenuContext({
    client,
    keys,
    qmenu,
    cmd,
    cvar,
    vid,
    ref,
    hooks: {
      startLocalSound: (name) => {
        if (sndDmaContext) {
          S_DMA_StartLocalSound(sndDmaContext, name);
        }
      },
      getSaveSlots: () => saveStorage.getSaveSlots(FS_Gamedir(filesystem)),
      getMapList: () => null,
      getPlayerModels: () => null,
      onClearNotify: () => Con_ClearNotify(consoleContext.con),
      onQuit: () => printToConsole("Quit demande.")
    }
  });
  menuContext = menu;
  keys.hooks.onMenuKeydown = (key) => M_Keydown(menu, key);
  keys.hooks.onMenuMain = () => M_Menu_Main_f(menu);
  keys.hooks.onToggleConsole = () => {
    toggleFullGameConsoleContext(menu, consoleContext, page, client);
  };
  M_Init(menu);
  registerFullGameToggleConsoleCommand(cmd, () => {
    toggleFullGameConsoleContext(menu, consoleContext, page, client);
  });
  queueFullGameConfigBootstrap(cmd);
  const flushClientOutput = (): void => {
    while (client.output.length > 0) {
      const line = client.output.shift();
      if (line) {
        printToConsole(line);
      }
    }
  };
  const updateClientAudio = (): void => {
    const listener = buildFullGameAudioListener(client);
    S_DMA_Update(sndDma, listener.origin, listener.forward, listener.right, listener.up);
    audio.syncLoopChannels(sndDma.sound.state.channels);
  };
  const writeConfiguration = (): boolean => {
    if (!mainContext) {
      return false;
    }

    const result = CL_WriteConfiguration(mainContext, {
      keyContext: keys,
      getGameDir: () => FS_Gamedir(filesystem),
      onWriteConfigFile: (path, contents) => configStorage.writeText(path, contents),
      onPrint: printToConsole
    });
    return result !== null;
  };
  registerWebConfigCommands(cmd, {
    writeConfiguration,
    onPrint: printToConsole
  });

  return {
    client,
    menu,
    console: consoleContext,
    mouse,
    filesystem,
    configStorage,
    saveStorage,
    drawCommands,
    assets,
    audio,
    cdAudio,
    sndDma,
    audioDebug,
    gameBridge,
    serverHost,
    get consoleRenderedInThree() {
      return consoleRenderedInThree;
    },
    set consoleRenderedInThree(value) {
      consoleRenderedInThree = value;
    },
    get gameRenderer() {
      return gameRenderer;
    },
    set gameRenderer(value) {
      gameRenderer = value;
    },
    get gameRendererPromise() {
      return gameRendererPromise;
    },
    set gameRendererPromise(value) {
      gameRendererPromise = value;
    },
    get gameRendererPromiseMapPath() {
      return gameRendererPromiseMapPath;
    },
    set gameRendererPromiseMapPath(value) {
      gameRendererPromiseMapPath = value;
    },
    currentCinematicIndex: 0,
    mode: "cinematic",
    lastFrameTime: 0,
    cinematicStartedAt: 0,
    flushClientOutput,
    updateClientAudio,
    writeConfiguration,
    beginAuthoritativeConnection,
    shouldPumpAuthoritativeFrame,
    pumpAuthoritativeFrame,
    authoritativeGameReady,
    markAuthoritativeGameActive
  };
}

function shouldSuppressFullGameConsoleLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === "Begin() from Player"
    || trimmed.startsWith("ref_gl version:")
    || trimmed.startsWith("GL_VENDOR:")
    || trimmed.startsWith("GL_RENDERER:")
    || trimmed.startsWith("GL_VERSION:")
    || trimmed.startsWith("GL_EXTENSIONS:")
    || trimmed.startsWith("...allowing CDS")
    || trimmed.startsWith("...disabling CDS")
    || trimmed.startsWith("...enabling ")
    || trimmed.startsWith("...using ")
    || trimmed.startsWith("...ignoring ")
    || trimmed.startsWith("...GL_")
    || trimmed.startsWith("...WGL_");
}

function initializeWebSoundDma(sound: ClientSoundLocalContext, audio: QuakeWebAudioAdapter): boolean {
  const context = audio.context;
  if (!context) {
    return false;
  }

  const speed = getRequestedSoundRate(sound, context.sampleRate);
  const channels = 2;
  const samplebits = 16;
  const frames = Math.max(4096, 1 << Math.ceil(Math.log2(speed * 0.5)));
  const samples = frames * channels;

  sound.state.dma.channels = channels;
  sound.state.dma.samples = samples;
  sound.state.dma.samplebits = samplebits;
  sound.state.dma.speed = speed;
  sound.state.dma.submission_chunk = 1;
  sound.state.dma.samplepos = 0;
  sound.state.dma.buffer = new Uint8Array(samples * (samplebits / 8));
  return true;
}

function getWebSoundDmaPosition(sound: ClientSoundLocalContext, audio: QuakeWebAudioAdapter): number {
  const context = audio.context;
  if (!context || sound.state.dma.samples <= 0 || sound.state.dma.speed <= 0) {
    return sound.state.dma.samplepos;
  }

  const elapsedFrames = Math.trunc(context.currentTime * sound.state.dma.speed);
  sound.state.dma.samplepos = (elapsedFrames * Math.max(1, sound.state.dma.channels)) % sound.state.dma.samples;
  return sound.state.dma.samplepos;
}

function playIssuedWebSound(context: ClientSndDmaContext, audio: QuakeWebAudioAdapter, ps: playsound_t): void {
  const issued = S_DMA_IssuePlaysound(context, ps);
  if (issued) {
    audio.playChannel(issued);
  }
}

function formatWebAudioInfo(
  audio: QuakeWebAudioAdapter,
  sndDma: ClientSndDmaContext | null,
  debug?: FullGameAudioDebugState
): string {
  const contextState = audio.context?.state ?? "unavailable";
  const channels = sndDma?.sound.state.channels ?? [];
  const activeChannels = channels.filter((channel) => channel.sfx && (channel.leftvol > 0 || channel.rightvol > 0));
  const activeNames = activeChannels
    .slice(0, 8)
    .map((channel) => `${channel.sfx?.name || "<empty>"}:${channel.sfx?.cache ? "cache" : "nocache"}(${channel.leftvol}/${channel.rightvol})`)
    .join(", ");
  const webDebug = audio.debug;

  return [
    `WebAudio: context=${contextState} unlocked=${audio.unlocked ? "1" : "0"} muted=${audio.muted ? "1" : "0"}`,
    `DMA: started=${sndDma?.state.sound_started ?? 0} sfx=${sndDma?.state.num_sfx ?? 0} painted=${sndDma?.sound.state.paintedtime ?? 0}`,
    `DMA channels: ${activeChannels.length}${activeNames ? ` :: ${activeNames}` : ""}`,
    `WebAudio SFX: played=${webDebug.playedSfx} skippedNoCache=${webDebug.skippedSfxNoCache} pending=${webDebug.pendingSfx} active=${webDebug.activeSources} loops=${webDebug.activeLoops}`,
    `WebAudio last: played=${webDebug.lastSfxName || "<none>"} skipped=${webDebug.lastSkippedSfxName || "<none>"}`,
    `Server SFX: starts=${debug?.serverStartSoundCalls ?? 0} resolved=${debug?.serverResolvedSfx ?? 0} missing=${debug?.serverMissingSfx ?? 0}`,
    `Server last: sound=${debug?.lastServerSound || "<none>"} missing=${debug?.lastMissingSound || "<none>"}`
  ].join("\n");
}

function buildFullGameAudioListener(client: ClientRuntime): {
  origin: [number, number, number];
  forward: [number, number, number];
  right: [number, number, number];
  up: [number, number, number];
} {
  if (client.cls.state === connstate_t.ca_active && client.cl.frame.valid) {
    CL_UpdateLerpFraction(client, { predictMovement: true });
    const view = CL_CalcViewValues(client, { predictMovement: true });
    return {
      origin: view.vieworg,
      forward: view.forward,
      right: view.right,
      up: view.up
    };
  }

  const vectors = AngleVectors(client.cl.viewangles);
  return {
    origin: [...client.cl.predicted_origin],
    forward: vectors.forward,
    right: vectors.right,
    up: vectors.up
  };
}

function isSfx(value: unknown): value is sfx_t {
  return (
    typeof value === "object"
    && value !== null
    && "name" in value
    && typeof (value as { name?: unknown }).name === "string"
  );
}

function describeAuthoritativeSound(sound: unknown): string {
  if (isSfx(sound)) {
    return sound.name || "<empty>";
  }
  if (typeof sound === "string") {
    return sound || "<empty>";
  }
  return "<null>";
}

function getRequestedSoundRate(sound: ClientSoundLocalContext, fallback: number): number {
  const khz = Math.trunc(sound.state.s_khz?.value ?? 11);
  if (khz >= 44) {
    return 44100;
  }
  if (khz >= 22) {
    return 22050;
  }
  if (khz >= 11) {
    return 11025;
  }
  return Math.max(11025, Math.trunc(fallback));
}

function queueFullGameConfigBootstrap(cmd: ReturnType<typeof createCommandRuntime>): void {
  Cbuf_AddText(cmd, "exec default.cfg\n");
  Cbuf_AddText(cmd, "exec config.cfg\n");
  Cbuf_AddText(cmd, "exec autoexec.cfg\n");
  Cbuf_AddText(cmd, "bind w +forward\n");
  Cbuf_AddText(cmd, "bind s +back\n");
  Cbuf_AddText(cmd, "bind a +moveleft\n");
  Cbuf_AddText(cmd, "bind d +moveright\n");
  Cbuf_AddText(cmd, "bind z +forward\n");
  Cbuf_AddText(cmd, "bind q +moveleft\n");
}

function registerFullGameToggleConsoleCommand(
  cmd: ReturnType<typeof createCommandRuntime>,
  handler: () => void
): void {
  if (Cmd_Exists(cmd, "toggleconsole")) {
    Cmd_RemoveCommand(cmd, "toggleconsole");
  }
  Cmd_AddCommand(cmd, "toggleconsole", handler);
}

function seedMenuCvars(cvar: ReturnType<typeof createCvarRuntime>): void {
  Cvar_Get(cvar, "maxclients", "1", 0);
  Cvar_Get(cvar, "paused", "0", 0);
  Cvar_Get(cvar, "deathmatch", "0", 0);
  Cvar_Get(cvar, "coop", "0", 0);
  Cvar_Get(cvar, "gamerules", "0", 0);
  Cvar_Get(cvar, "skill", "1", 0);
  Cvar_Get(cvar, "name", "Player", 1);
  Cvar_Get(cvar, "skin", "male/grunt", 1);
  Cvar_Get(cvar, "hand", "0", 1);
  Cvar_Get(cvar, "rate", "25000", 1);
  Cvar_Get(cvar, "s_volume", "0.7", 1);
  Cvar_Get(cvar, "lookspring", "0", 1);
  Cvar_Get(cvar, "lookstrafe", "0", 1);
  Cvar_Get(cvar, "freelook", "1", 1);
  Cvar_Get(cvar, "crosshair", "0", 1);
  Cvar_Get(cvar, "s_khz", "22", 1);
  Cvar_Get(cvar, "vid_ref", "gl", 1);
  Cvar_Get(cvar, "vid_fullscreen", "0", 1);
  Cvar_Get(cvar, "vid_gamma", "1", 1);
  Cvar_Get(cvar, "viewsize", "100", 1);
  Cvar_Get(cvar, "gl_driver", "opengl32", 0);
  Cvar_Get(cvar, "gl_picmip", "0", 0);
  Cvar_Get(cvar, "gl_mode", "3", 0);
  Cvar_Get(cvar, "gl_ext_palettedtexture", "1", 1);
  Cvar_Get(cvar, "gl_finish", "0", 1);
  Cvar_Get(cvar, "sw_mode", "0", 0);
  Cvar_Get(cvar, "sw_stipplealpha", "0", 1);
}

function createCanvasRef(
  filesystem: VirtualFilesystem,
  assets: CanvasAssetCache,
  commands: DrawCommand[]
): refexport_t {
  const ref = createRefExport();
  ref.RegisterPic = (name) => loadPictureCanvas(filesystem, assets, name);
  ref.DrawGetPicSize = (name) => {
    const image = loadPictureCanvas(filesystem, assets, name);
    return image ? { width: image.width, height: image.height } : { width: 0, height: 0 };
  };
  ref.DrawPic = (x, y, name) => {
    commands.push({ type: "pic", x, y, name });
  };
  ref.DrawStretchPic = (x, y, width, height, name) => {
    commands.push({ type: "pic", x, y, width, height, name });
  };
  ref.DrawChar = (x, y, code) => {
    commands.push({ type: "char", x, y, code });
  };
  ref.DrawFill = (x, y, width, height, color) => {
    commands.push({ type: "fill", x, y, width, height, color });
  };
  ref.DrawStretchRaw = (x, y, width, height, cols, rows, data) => {
    commands.push({ type: "raw", x, y, width, height, cols, rows, data });
  };
  ref.CinematicSetPalette = (palette) => {
    assets.paletteRgb = palette ? palette.slice() : null;
  };
  ref.DrawFadeScreen = () => {
    commands.push({ type: "fade" });
  };
  return ref;
}

function startNextCinematic(runtime: FullGameRuntime, page: FullGamePage): void {
  if (runtime.currentCinematicIndex >= STARTUP_CINEMATICS.length) {
    enterMainMenu(runtime, page);
    return;
  }

  const name = STARTUP_CINEMATICS[runtime.currentCinematicIndex];
  runtime.client.cls.realtime = performance.now();
  runtime.cinematicStartedAt = runtime.client.cls.realtime;
  runtime.mode = "cinematic";
  const started = SCR_PlayCinematic(runtime.client, name, {
    loadBinaryFile: (path) => readMountedFile(runtime.filesystem, path)?.bytes ?? null,
    onCinematicRawSamples: (count, sampleRate, sampleWidth, channels, samples) => {
      runtime.audio.queueRawSamples(count, sampleRate, sampleWidth, channels, samples);
    },
    onCinematicSoundRestart: () => {
      runtime.audio.stopRaw();
    },
    onCDAudioStop: () => {
      runtime.cdAudio.stop();
    }
  });

  if (!started) {
    Con_Print(runtime.console.con, `cinematique introuvable: ${name}\n`, runtime.client.cls.realtime);
    Con_SyncConsoleToKeys(runtime.console);
    runtime.currentCinematicIndex += 1;
    startNextCinematic(runtime, page);
    return;
  }

  page.status.textContent = `Cinematique ${runtime.currentCinematicIndex + 1}/${STARTUP_CINEMATICS.length}: ${name}`;
  page.status.style.display = "block";
}

function enterMainMenu(runtime: FullGameRuntime, page: FullGamePage): void {
  releaseFullGameMouseLook(runtime, page);
  runtime.mode = "menu";
  if (!runtime.serverHost.hasActiveGameMap()) {
    runtime.client.cls.state = connstate_t.ca_disconnected;
  }
  runtime.menu.keys.state.key_dest = keydest_t.key_menu;
  M_Menu_Main_f(runtime.menu);
  page.status.textContent = "Menu principal Quake II.";
  page.status.style.display = "block";
}

function frame(time: number, runtime: FullGameRuntime, page: FullGamePage): void {
  const delta = runtime.lastFrameTime === 0 ? 0 : time - runtime.lastFrameTime;
  runtime.lastFrameTime = time;
  runtime.client.cls.realtime = time;
  executeRuntimeCommandBuffer(runtime, page);
  if (runtime.shouldPumpAuthoritativeFrame()) {
    runtime.pumpAuthoritativeFrame(delta);
  } else {
    runtime.client.cls.frametime = delta / 1000;
    runtime.client.cls.framecount += 1;
  }
  runtime.updateClientAudio();
  executeRuntimeCommandBuffer(runtime, page);
  runtime.consoleRenderedInThree = false;
  syncFullGameViewportVisibility(runtime, page);

  clearCanvas(page);

  if (runtime.mode === "cinematic") {
    drawCinematicFrame(runtime, page);
  } else if (runtime.mode === "game") {
    drawGameFrame(runtime, page, delta / 1000);
  } else if (runtime.mode === "loading") {
    drawLoadingFrame(runtime, page);
  } else {
    drawMenuFrame(runtime, page);
  }

  if (runtime.menu.keys.state.key_dest === keydest_t.key_console
    && !runtime.consoleRenderedInThree) {
    page.status.style.display = "none";
    page.canvas.style.display = "block";
    drawConsoleFrame(runtime, page);
  }

  requestAnimationFrame((nextTime) => frame(nextTime, runtime, page));
}

function executeRuntimeCommandBuffer(runtime: FullGameRuntime, page: FullGamePage): void {
  Cbuf_Execute(runtime.menu.cmd);
  const enteredLoading = syncFullGameLoadingState(runtime.client, runtime.gameBridge, {
    onBeginLoading: () => {
      runtime.mode = "loading";
    },
    onPrint: (message) => {
      Con_Print(runtime.console.con, `${message}\n`, runtime.client.cls.realtime);
      Con_SyncConsoleToKeys(runtime.console);
    }
  });
  runtime.flushClientOutput();
  runtime.updateClientAudio();

  if (runtime.gameBridge.requestedMap) {
    const requestedMap = runtime.gameBridge.requestedMap;
    if (runtime.serverHost.hasActiveGameMap()) {
      runtime.beginAuthoritativeConnection(requestedMap);
    }

    if (runtime.authoritativeGameReady()) {
      runtime.markAuthoritativeGameActive();
      syncFullGameActiveView(runtime, page, `Jeu actif: ${runtime.serverHost.currentMapRequest ?? requestedMap}.`);
    } else {
      runtime.mode = "loading";
      page.status.textContent = `Preparation de ${requestedMap}.`;
      page.status.style.display = "block";
    }
  } else if (runtime.serverHost.hasActiveGameMap() && runtime.serverHost.currentMapRequest && runtime.authoritativeGameReady()) {
    runtime.markAuthoritativeGameActive();
    syncFullGameActiveView(runtime, page, "");
  } else if (runtime.gameBridge.phase === "loading" || enteredLoading) {
    page.status.textContent = "Chargement du jeu...";
    page.status.style.display = "block";
  }
}

function syncFullGameActiveView(runtime: FullGameRuntime, page: FullGamePage, gameStatus: string): void {
  if (runtime.menu.keys.state.key_dest === keydest_t.key_menu) {
    runtime.mode = "menu";
    page.status.textContent = "Menu principal Quake II.";
    page.status.style.display = "block";
    return;
  }

  runtime.mode = "game";
  page.status.textContent = gameStatus;
  page.status.style.display = "none";
}

function drawCinematicFrame(runtime: FullGameRuntime, page: FullGamePage): void {
  const wasActive = runtime.client.cl.cinematic.cinematictime > 0;
  SCR_RunCinematic(runtime.client, {
    keyDest: "game",
    currentTimeMs: runtime.client.cls.realtime
  }, {
    loadBinaryFile: (path) => readMountedFile(runtime.filesystem, path)?.bytes ?? null,
    onCinematicRawSamples: (count, sampleRate, sampleWidth, channels, samples) => {
      runtime.audio.queueRawSamples(count, sampleRate, sampleWidth, channels, samples);
    },
    onCinematicSoundRestart: () => {
      runtime.audio.stopRaw();
    },
    onCDAudioStop: () => {
      runtime.cdAudio.stop();
    }
  });

  runtime.drawCommands.length = 0;
  SCR_DrawCinematicRef(runtime.client, runtime.menu.ref, {
    viewportWidth: LOGICAL_WIDTH,
    viewportHeight: LOGICAL_HEIGHT,
    keyDest: "game"
  });
  drawCapturedCommands(page, runtime);

  if (wasActive && runtime.client.cl.cinematic.cinematictime <= 0) {
    runtime.currentCinematicIndex += 1;
    startNextCinematic(runtime, page);
  }
}

function drawMenuFrame(runtime: FullGameRuntime, page: FullGamePage): void {
  runtime.drawCommands.length = 0;
  runtime.menu.qmenu.state.drawChars.length = 0;
  runtime.menu.qmenu.state.drawFills.length = 0;
  runtime.menu.qmenu.state.drawStrings.length = 0;

  if (runtime.menu.keys.state.key_dest === keydest_t.key_console) {
    page.status.style.display = "none";
  } else {
    page.status.style.display = "block";
    M_Draw(runtime.menu);
  }

  drawCapturedCommands(page, runtime);
}

function drawLoadingFrame(runtime: FullGameRuntime, page: FullGamePage): void {
  runtime.drawCommands.length = 0;
  SCR_DrawLoading(runtime.client);
  drawCenteredPicture(page, runtime, "loading");
}

function drawGameFrame(runtime: FullGameRuntime, page: FullGamePage, deltaSeconds: number): void {
  if (runtime.menu.keys.state.key_dest === keydest_t.key_console) {
    page.status.style.display = "none";
  }

  if (!runtime.authoritativeGameReady()) {
    if (runtime.menu.keys.state.key_dest !== keydest_t.key_console) {
      page.status.textContent = "Preparation du jeu...";
      page.status.style.display = "block";
    }
    return;
  }

  const mapPath = getAuthoritativeMapPath(runtime);
  if (!mapPath) {
    page.status.textContent = "Carte serveur indisponible.";
    page.status.style.display = "block";
    return;
  }

  const renderer = ensureFullGameRenderer(runtime, page, mapPath);
  if (!renderer) {
    page.status.style.display = "none";
    drawLoadingFrame(runtime, page);
    return;
  }

  page.status.style.display = "none";
  const source = createFullGameServerRenderSource(runtime.client, {
    cvar: runtime.menu.cvar
  });
  syncThreeCameraToRefresh(renderer.camera, source.refreshFrame);
  const consoleCanvas = runtime.menu.keys.state.key_dest === keydest_t.key_console
    ? prepareConsoleCanvasOverlay(runtime, page, renderer)
    : null;
  renderer.renderLoop.renderFrame({
    source,
    elapsedSeconds: runtime.client.cl.time * 0.001,
    ...(consoleCanvas ? { canvasOverlay: consoleCanvas } : {})
  });
  runtime.consoleRenderedInThree = consoleCanvas !== null;
}

function ensureFullGameRenderer(
  runtime: FullGameRuntime,
  page: FullGamePage,
  mapPath: string
): FullGameRendererState | null {
  if (runtime.gameRenderer?.mapPath === mapPath) {
    return runtime.gameRenderer;
  }

  if (runtime.gameRenderer) {
    disposeFullGameRenderer(runtime.gameRenderer);
    runtime.gameRenderer = null;
  }

  if (runtime.gameRendererPromise && runtime.gameRendererPromiseMapPath === mapPath) {
    return null;
  }

  if (runtime.gameRendererPromise && runtime.gameRendererPromiseMapPath !== mapPath) {
    runtime.gameRendererPromise = null;
    runtime.gameRendererPromiseMapPath = null;
  }

  if (!runtime.gameRendererPromise) {
    const expectedMapPath = mapPath;
    runtime.gameRendererPromiseMapPath = expectedMapPath;
    runtime.gameRendererPromise = createFullGameThreeRenderer(runtime, page, expectedMapPath)
      .then((renderer) => {
        if (runtime.gameRendererPromiseMapPath !== expectedMapPath) {
          disposeFullGameRenderer(renderer);
          return renderer;
        }

        runtime.gameRenderer = renderer;
        runtime.gameRendererPromise = null;
        runtime.gameRendererPromiseMapPath = null;
        renderer.renderLoop.resize();
        return renderer;
      })
      .catch((error) => {
        if (runtime.gameRendererPromiseMapPath === expectedMapPath) {
          runtime.gameRendererPromise = null;
          runtime.gameRendererPromiseMapPath = null;
        }
        const message = error instanceof Error ? error.message : `${error}`;
        Con_Print(runtime.console.con, `renderer Three indisponible: ${message}\n`, runtime.client.cls.realtime);
        Con_SyncConsoleToKeys(runtime.console);
        throw error;
      });
  }

  return null;
}

function disposeFullGameRenderer(renderer: FullGameRendererState): void {
  renderer.renderLoop.dispose();
  renderer.renderer.domElement.remove();
  renderer.renderer.dispose();
}

async function createFullGameThreeRenderer(
  runtime: FullGameRuntime,
  page: FullGamePage,
  mapPath: string
): Promise<FullGameRendererState> {
  page.gameViewport.replaceChildren();
  const rendererBundle = await createRenderer();
  const rendererCanvas = rendererBundle.renderer.domElement;
  rendererCanvas.style.position = "absolute";
  rendererCanvas.style.inset = "0";
  rendererCanvas.style.width = "100%";
  rendererCanvas.style.height = "100%";
  rendererCanvas.style.display = "block";
  rendererCanvas.style.imageRendering = "auto";
  page.gameViewport.append(rendererCanvas);

  const glWorldAdapter = createThreeGlWorldSceneAdapter(runtime.filesystem, mapPath);
  const skyAdapter = createThreeSkySceneAdapter(createQuakeSkyResolver(runtime.filesystem));
  const glDrawAdapter = createThreeGlDrawAdapter();
  const imageRuntime = createGlImageRuntime({
    loadFile: (path) => readMountedFile(runtime.filesystem, path)?.bytes ?? null,
    ...glDrawAdapter.imageHooks
  });
  const refGlHost = createRefGlHost({
    createQglProvider: () => createObjectQglProvider(createNoopQglBindings()),
    imageRuntime,
    drawHooks: glDrawAdapter.drawHooks,
    hooks: {
      glimpInit: () => true,
      glimpShutdown: () => undefined,
      glimpSetMode: () => ({ err: 0, width: page.gameViewport.clientWidth || LOGICAL_WIDTH, height: page.gameViewport.clientHeight || LOGICAL_HEIGHT }),
      glimpBeginFrame: () => undefined,
      glimpEndFrame: () => undefined
    },
    imports: createFullGameRefImports((message) => {
      if (shouldSuppressFullGameConsoleLine(message)) {
        return;
      }

      Con_Print(runtime.console.con, `${message}\n`, runtime.client.cls.realtime);
      Con_SyncConsoleToKeys(runtime.console);
    })
  });
  refGlHost.init();

  const scene = new Scene();
  scene.add(glWorldAdapter.root);
  scene.add(skyAdapter.root);
  const refreshEntitySync = createThreeRefreshEntitySync(runtime.filesystem);
  const particleSync = createThreeParticleSync(runtime.filesystem);
  const beamSync = createThreeBeamSync(runtime.filesystem);
  const dlightSync = createThreeDlightSync();
  const polyblendOverlay = createThreePolyblendOverlay();
  scene.add(refreshEntitySync.root);
  scene.add(particleSync.root);
  scene.add(beamSync.root);
  scene.add(dlightSync.root);
  refreshEntitySync.setShadowReceiverRoot(glWorldAdapter.root);
  const camera = createCamera();
  scene.add(camera);
  refreshEntitySync.attachToCamera(camera);
  const refreshDebug = createRefreshDebugLayer();
  scene.add(refreshDebug.root);

  const renderLoop = createFullGameRenderLoop({
    renderer: rendererBundle.renderer,
    ui: {
      viewport: page.gameViewport
    },
    scene,
    camera,
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
    filesystem: runtime.filesystem,
    audio: runtime.audio,
    enableRenderSourceAudio: false
  });

  return {
    mapPath,
    renderer: rendererBundle.renderer,
    renderLoop,
    camera,
    consoleCanvas: document.createElement("canvas")
  };
}

function syncThreeCameraToRefresh(camera: ReturnType<typeof createCamera>, refreshFrame: ClientRefreshFrame | null): void {
  if (!refreshFrame) {
    return;
  }

  const view = refreshFrame.view;
  camera.position.set(view.vieworg[0], view.vieworg[1], view.vieworg[2]);
  const vectors = AngleVectors(view.viewangles);
  camera.up.set(vectors.up[0], vectors.up[1], vectors.up[2]);
  camera.lookAt(
    view.vieworg[0] + vectors.forward[0],
    view.vieworg[1] + vectors.forward[1],
    view.vieworg[2] + vectors.forward[2]
  );
}

function getAuthoritativeMapPath(runtime: FullGameRuntime): string | null {
  return getFullGameServerMapPath(runtime.client, runtime.serverHost.currentMapRequest);
}

function drawConsoleFrame(runtime: FullGameRuntime, page: FullGamePage): void {
  const frac = SCR_RunConsole(runtime.client, {
    keyDest: "console"
  });
  const renderer = runtime.gameRenderer;
  if (renderer) {
    const width = Math.max(1, page.gameViewport.clientWidth || window.innerWidth || LOGICAL_WIDTH);
    const height = Math.max(1, page.gameViewport.clientHeight || window.innerHeight || LOGICAL_HEIGHT);
    const snapshot = Con_DrawConsole(runtime.console, frac, width, height);
    if (snapshot) {
      drawConsoleSnapshotToCanvas(runtime, page, renderer.consoleCanvas, snapshot);
      renderer.renderLoop.renderCanvasOverlay(renderer.consoleCanvas);
      runtime.consoleRenderedInThree = true;
    }
    return;
  }

  const snapshot = Con_DrawConsole(runtime.console, frac, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  if (!snapshot) {
    return;
  }

  drawConsoleSnapshotCanvas(runtime, page, snapshot);
}

function prepareConsoleCanvasOverlay(
  runtime: FullGameRuntime,
  page: FullGamePage,
  renderer: FullGameRendererState
): HTMLCanvasElement | null {
  const frac = SCR_RunConsole(runtime.client, {
    keyDest: "console"
  });
  const width = Math.max(1, page.gameViewport.clientWidth || window.innerWidth || LOGICAL_WIDTH);
  const height = Math.max(1, page.gameViewport.clientHeight || window.innerHeight || LOGICAL_HEIGHT);
  const snapshot = Con_DrawConsole(runtime.console, frac, width, height);
  if (!snapshot) {
    return null;
  }

  drawConsoleSnapshotToCanvas(runtime, page, renderer.consoleCanvas, snapshot);
  return renderer.consoleCanvas;
}

function drawConsoleSnapshotToCanvas(
  runtime: FullGameRuntime,
  page: FullGamePage,
  canvas: HTMLCanvasElement,
  snapshot: ConsoleDrawConsoleSnapshot
): void {
  const width = Math.max(1, Math.trunc(snapshot.background.width));
  const height = Math.max(1, Math.trunc(snapshot.background.height));
  if (canvas.width !== width) {
    canvas.width = width;
  }
  if (canvas.height !== height) {
    canvas.height = height;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, width, height);
  const overlayPage: FullGamePage = { ...page, context };
  drawConsoleSnapshotCanvas(runtime, overlayPage, snapshot);
}

function drawConsoleSnapshotCanvas(
  runtime: FullGameRuntime,
  page: FullGamePage,
  snapshot: ConsoleDrawConsoleSnapshot
): void {
  drawOpaqueConsoleBackground(page, snapshot);

  const background = loadPictureCanvas(runtime.filesystem, runtime.assets, snapshot.background.pic);
  if (background) {
    page.context.drawImage(
      background,
      snapshot.background.x,
      snapshot.background.y,
      snapshot.background.width,
      snapshot.background.height
    );
  } else {
    page.context.fillStyle = "rgb(0, 0, 0)";
    page.context.fillRect(0, 0, snapshot.background.width, snapshot.lines);
  }

  for (const line of snapshot.rows) {
    drawConsoleText(page, runtime, line);
  }
  if (snapshot.backscroll) {
    drawConsoleText(page, runtime, snapshot.backscroll);
  }
  if (snapshot.downloadBar) {
    drawConsoleText(page, runtime, snapshot.downloadBar);
  }
  if (snapshot.input) {
    drawConsoleText(page, runtime, snapshot.input);
  }
  drawConsoleText(page, runtime, snapshot.version);
}

/**
 * Category: New
 * Purpose: Preserve Quake II's opaque `conback` console area when compositing the browser canvas overlay.
 *
 * Constraints:
 * - Must only cover the visible console fraction; the rest of the overlay canvas stays transparent.
 */
function drawOpaqueConsoleBackground(page: FullGamePage, snapshot: ConsoleDrawConsoleSnapshot): void {
  page.context.globalAlpha = 1;
  page.context.globalCompositeOperation = "source-over";
  page.context.fillStyle = "rgb(0, 0, 0)";
  page.context.fillRect(0, 0, snapshot.background.width, snapshot.lines);
}

function drawConsoleFrameRef(
  runtime: FullGameRuntime,
  ref: refexport_t,
  viewportWidth: number,
  viewportHeight: number
): void {
  const frac = SCR_RunConsole(runtime.client, {
    keyDest: "console"
  });
  const snapshot = Con_DrawConsole(runtime.console, frac, viewportWidth, viewportHeight);
  if (!snapshot) {
    return;
  }

  ref.DrawStretchPic(
    snapshot.background.x,
    snapshot.background.y,
    snapshot.background.width,
    snapshot.background.height,
    snapshot.background.pic
  );

  for (const line of snapshot.rows) {
    drawConsoleTextRef(ref, line);
  }
  if (snapshot.backscroll) {
    drawConsoleTextRef(ref, snapshot.backscroll);
  }
  if (snapshot.downloadBar) {
    drawConsoleTextRef(ref, snapshot.downloadBar);
  }
  if (snapshot.input) {
    drawConsoleTextRef(ref, snapshot.input);
  }
  drawConsoleTextRef(ref, snapshot.version);
}

function drawConsoleTextRef(ref: refexport_t, command: ConsoleTextCommand): void {
  const highBit = command.variant === "alt" ? 128 : 0;
  for (let index = 0; index < command.text.length; index += 1) {
    ref.DrawChar(command.x + index * 8, command.y, command.text.charCodeAt(index) | highBit);
  }
}

function drawConsoleText(page: FullGamePage, runtime: FullGameRuntime, command: ConsoleTextCommand): void {
  if (!loadGlyphCanvas(runtime.filesystem, runtime.assets)) {
    drawConsoleTextFallback(page, command);
    return;
  }

  const highBit = command.variant === "alt" ? 128 : 0;
  for (let index = 0; index < command.text.length; index += 1) {
    drawGlyph(
      page,
      runtime.filesystem,
      runtime.assets,
      command.x + index * 8,
      command.y,
      command.text.charCodeAt(index) | highBit
    );
  }
}

function drawConsoleTextFallback(page: FullGamePage, command: ConsoleTextCommand): void {
  const text = command.text
    .replace(/[\u0080-\u00ff]/g, (char) => String.fromCharCode(char.charCodeAt(0) & 0x7f))
    .trimEnd();
  if (!text) {
    return;
  }

  page.context.font = "8px Consolas, monospace";
  page.context.textBaseline = "top";
  page.context.fillStyle = command.variant === "alt" ? "#f0d060" : "#d8d2c7";
  page.context.fillText(text, command.x, command.y);
}

function drawCapturedCommands(page: FullGamePage, runtime: FullGameRuntime): void {
  for (const command of runtime.drawCommands) {
    switch (command.type) {
      case "pic": {
        const image = loadPictureCanvas(runtime.filesystem, runtime.assets, command.name);
        if (image) {
          const width = command.width ?? image.width;
          const height = command.height ?? image.height;
          const x = command.x < 0 ? (LOGICAL_WIDTH - width) / 2 : command.x;
          const y = command.y < 0 ? (LOGICAL_HEIGHT - height) / 2 : command.y;
          page.context.drawImage(
            image,
            x,
            y,
            width,
            height
          );
        }
        break;
      }
      case "char":
        drawGlyph(page, runtime.filesystem, runtime.assets, command.x, command.y, command.code);
        break;
      case "fill":
        drawPaletteFill(page, runtime.assets, command.x, command.y, command.width, command.height, command.color);
        break;
      case "raw":
        drawRawIndexedImage(page, runtime.assets, command);
        break;
      case "fade":
        page.context.fillStyle = "rgba(0, 0, 0, 0.58)";
        page.context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        break;
    }
  }
}

function drawCenteredPicture(page: FullGamePage, runtime: FullGameRuntime, name: string): void {
  const image = loadPictureCanvas(runtime.filesystem, runtime.assets, name);
  if (!image) {
    return;
  }

  page.context.drawImage(
    image,
    (LOGICAL_WIDTH - image.width) / 2,
    (LOGICAL_HEIGHT - image.height) / 2,
    image.width,
    image.height
  );
}

function drawRawIndexedImage(
  page: FullGamePage,
  assets: CanvasAssetCache,
  command: Extract<DrawCommand, { type: "raw" }>
): void {
  const palette = assets.paletteRgb;
  if (!palette) {
    return;
  }

  const imageData = page.context.createImageData(command.cols, command.rows);
  for (let index = 0; index < command.data.length; index += 1) {
    const paletteIndex = command.data[index] * 3;
    const rgbaIndex = index * 4;
    imageData.data[rgbaIndex] = palette[paletteIndex] ?? 0;
    imageData.data[rgbaIndex + 1] = palette[paletteIndex + 1] ?? 0;
    imageData.data[rgbaIndex + 2] = palette[paletteIndex + 2] ?? 0;
    imageData.data[rgbaIndex + 3] = 255;
  }

  const temp = document.createElement("canvas");
  temp.width = command.cols;
  temp.height = command.rows;
  temp.getContext("2d")?.putImageData(imageData, 0, 0);
  page.context.drawImage(temp, command.x, command.y, command.width, command.height);
}

function drawGlyph(
  page: FullGamePage,
  filesystem: VirtualFilesystem,
  assets: CanvasAssetCache,
  x: number,
  y: number,
  code: number
): void {
  const glyphs = loadGlyphCanvas(filesystem, assets);
  if (!glyphs) {
    return;
  }

  const glyphCode = code & 0xff;
  const sx = (glyphCode & 15) * 8;
  const sy = ((glyphCode >> 4) & 15) * 8;
  page.context.drawImage(glyphs, sx, sy, 8, 8, x, y, 8, 8);
}

function drawPaletteFill(
  page: FullGamePage,
  assets: CanvasAssetCache,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number
): void {
  const palette = assets.paletteRgb;
  const index = Math.max(0, Math.min(255, Math.trunc(color))) * 3;
  const red = palette?.[index] ?? color;
  const green = palette?.[index + 1] ?? color;
  const blue = palette?.[index + 2] ?? color;
  page.context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
  page.context.fillRect(x, y, width, height);
}

function loadPictureCanvas(
  filesystem: VirtualFilesystem,
  assets: CanvasAssetCache,
  name: string
): HTMLCanvasElement | null {
  if (assets.pictures.has(name)) {
    return assets.pictures.get(name) ?? null;
  }

  const file = resolvePictureFile(filesystem, name);
  if (!file) {
    assets.pictures.set(name, null);
    return null;
  }

  try {
    const image = parsePcx(file.bytes, file.path);
    const canvas = pcxToCanvas(image);
    assets.pictures.set(name, canvas);
    if (!assets.paletteRgb) {
      assets.paletteRgb = image.paletteRgb;
    }
    return canvas;
  } catch {
    assets.pictures.set(name, null);
    return null;
  }
}

function loadGlyphCanvas(filesystem: VirtualFilesystem, assets: CanvasAssetCache): HTMLCanvasElement | null {
  if (assets.glyphs) {
    return assets.glyphs;
  }

  const file = readMountedFile(filesystem, "pics/conchars.pcx");
  if (!file) {
    return null;
  }

  const image = parsePcx(file.bytes, file.path);
  assets.paletteRgb = image.paletteRgb;
  assets.glyphs = pcxToCanvas(image);
  return assets.glyphs;
}

function resolvePictureFile(filesystem: VirtualFilesystem, name: string): ReturnType<typeof readMountedFile> {
  const normalized = name.replaceAll("\\", "/").replace(/^\/+/, "");
  const candidates = normalized.endsWith(".pcx")
    ? [normalized]
    : normalized.includes("/")
      ? [`${normalized}.pcx`, normalized]
      : [`pics/${normalized}.pcx`, `pics/${normalized}`];

  for (const candidate of candidates) {
    const file = readMountedFile(filesystem, candidate);
    if (file) {
      return file;
    }
  }

  return undefined;
}

function pcxToCanvas(image: PcxImage): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (context) {
    context.putImageData(new ImageData(new Uint8ClampedArray(image.rgba), image.width, image.height), 0, 0);
  }
  return canvas;
}

function handleKeyDown(event: KeyboardEvent, runtime: FullGameRuntime, page: FullGamePage): void {
  if (isConsoleToggleDomKey(event)) {
    event.preventDefault();
    void runtime.audio.unlock();
    toggleFullGameConsole(runtime, page);
    return;
  }

  if (isTextInputTarget(event.target)) {
    return;
  }

  const key = mapDomKey(event);
  if (key === null) {
    return;
  }

  event.preventDefault();
  void runtime.audio.unlock();
  if (key === K_F10) {
    if (event.ctrlKey) {
      printFullGameWebAudioInfo(runtime);
    } else {
      toggleFullGameConsole(runtime, page);
    }
    return;
  }

  if (runtime.mode === "cinematic") {
    const elapsed = runtime.client.cls.realtime - runtime.cinematicStartedAt;
    if (elapsed > 1000 || key === K_ESCAPE || key === K_ENTER || key === K_SPACE) {
      SCR_StopCinematic(runtime.client);
      runtime.audio.stopRaw();
      runtime.currentCinematicIndex += 1;
      startNextCinematic(runtime, page);
    }
    return;
  }

  if (runtime.mode === "game" && runtime.menu.keys.state.key_dest === keydest_t.key_game) {
    Key_Event(runtime.menu.keys, key, true, runtime.client.cls.realtime);
    executeRuntimeCommandBuffer(runtime, page);
    syncFullGameKeyDestination(runtime, page);
    return;
  }

  if (runtime.menu.keys.state.key_dest === keydest_t.key_console) {
    Key_Event(runtime.menu.keys, key, true, runtime.client.cls.realtime);
    Key_Event(runtime.menu.keys, key, false, runtime.client.cls.realtime);
    executeRuntimeCommandBuffer(runtime, page);
    syncFullGameKeyDestination(runtime, page);
    page.status.textContent = runtime.menu.keys.state.key_dest === keydest_t.key_console
      ? "Console Quake II."
      : "Menu principal Quake II.";
    return;
  }

  M_Keydown(runtime.menu, key);
  executeRuntimeCommandBuffer(runtime, page);
  syncFullGameKeyDestination(runtime, page);
  if (key === K_ESCAPE) {
    runtime.mouse.suppressNextEscapeKeyUp = true;
  }

  const keyDestAfterMenu = runtime.menu.keys.state.key_dest as keydest_t;
  if (keyDestAfterMenu === keydest_t.key_console) {
    runtime.menu.keys.state.console_open = true;
    page.status.textContent = "Console Quake II.";
    return;
  }

  if (keyDestAfterMenu === keydest_t.key_game
    && runtime.client.cls.state === connstate_t.ca_disconnected
    && runtime.gameBridge.phase === "idle") {
    enterMainMenu(runtime, page);
  }
}

function syncFullGameKeyDestination(runtime: FullGameRuntime, page: FullGamePage): void {
  const keyDest = runtime.menu.keys.state.key_dest as keydest_t;

  if (keyDest === keydest_t.key_menu && runtime.mode === "game") {
    releaseFullGameMouseLook(runtime, page);
    runtime.mode = "menu";
    page.status.textContent = "Menu principal Quake II.";
    page.status.style.display = "block";
    return;
  }

  if (keyDest === keydest_t.key_game
    && runtime.mode === "menu"
    && (runtime.client.cls.state === connstate_t.ca_active || runtime.serverHost.hasActiveGameMap())) {
    runtime.mode = "game";
    page.status.textContent = "";
    page.status.style.display = "none";
  }
}

function toggleFullGameConsole(runtime: FullGameRuntime, page: FullGamePage): void {
  toggleFullGameConsoleContext(runtime.menu, runtime.console, page, runtime.client);
}

function toggleFullGameConsoleContext(
  menu: ClientMenuContext,
  consoleContext: ClientConsoleContext,
  page: FullGamePage,
  client: ClientRuntime
): void {
  const keys = menu.keys.state;
  Con_ClearNotify(consoleContext.con);
  if (keys.key_dest === keydest_t.key_console) {
    keys.console_open = false;
    keys.key_dest = client.cls.state === connstate_t.ca_active
      ? keydest_t.key_game
      : keydest_t.key_menu;
  } else {
    M_ForceMenuOff(menu);
    keys.console_open = true;
    keys.key_dest = keydest_t.key_console;
  }
  Con_SyncConsoleToKeys(consoleContext);
  page.status.textContent = keys.key_dest === keydest_t.key_console
    ? "Console Quake II."
    : client.cls.state !== connstate_t.ca_active
      ? "Menu principal Quake II."
      : "";
}

function printFullGameWebAudioInfo(runtime: FullGameRuntime): void {
  const info = formatWebAudioInfo(runtime.audio, runtime.sndDma, runtime.audioDebug);
  Con_Print(runtime.console.con, info, runtime.client.cls.realtime);
  Con_SyncConsoleToKeys(runtime.console);
}

function isConsoleToggleDomKey(event: KeyboardEvent): boolean {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }

  return event.code === "Backquote"
    || event.key === "`"
    || event.key === "~"
    || event.key.charCodeAt(0) === 178
    || event.key === "²";
}

function handleKeyUp(event: KeyboardEvent, runtime: FullGameRuntime, page: FullGamePage): void {
  if (isTextInputTarget(event.target)) {
    return;
  }

  if (isConsoleToggleDomKey(event)) {
    event.preventDefault();
    return;
  }

  const key = mapDomKey(event);
  if (key === null) {
    return;
  }

  if (key === K_F10) {
    event.preventDefault();
    return;
  }

  if (key === K_ESCAPE && runtime.mouse.suppressNextEscapeKeyUp) {
    runtime.mouse.suppressNextEscapeKeyUp = false;
    event.preventDefault();
    return;
  }

  if (key === K_ESCAPE
    && runtime.mode === "game"
    && runtime.menu.keys.state.key_dest === keydest_t.key_game
    && !isFullGamePointerLocked(page)) {
    event.preventDefault();
    routeFullGameEscapeToClient(runtime, page);
    return;
  }

  if (runtime.mode !== "game" || runtime.menu.keys.state.key_dest !== keydest_t.key_game) {
    return;
  }

  event.preventDefault();
  Key_Event(runtime.menu.keys, key, false, runtime.client.cls.realtime);
  executeRuntimeCommandBuffer(runtime, page);
}

function handlePointerDown(event: PointerEvent, runtime: FullGameRuntime, page: FullGamePage): void {
  void runtime.audio.unlock();
  if (runtime.mode !== "game" || runtime.menu.keys.state.key_dest !== keydest_t.key_game) {
    return;
  }

  runtime.mouse.lookActive = true;
  runtime.mouse.dragging = event.buttons !== 0;
  requestFullGamePointerLock(runtime, page, event.target);
}

function handlePointerLockChange(runtime: FullGameRuntime, page: FullGamePage): void {
  const shouldRouteEscape = runtime.mouse.pointerLockEscapeArmed
    && runtime.mode === "game"
    && runtime.menu.keys.state.key_dest === keydest_t.key_game;

  runtime.mouse.pointerLocked = isFullGamePointerLocked(page);
  if (runtime.mouse.pointerLocked) {
    runtime.mouse.lookActive = true;
    runtime.mouse.pointerLockEscapeArmed = runtime.mode === "game"
      && runtime.menu.keys.state.key_dest === keydest_t.key_game;
    return;
  }

  runtime.mouse.pointerLockEscapeArmed = false;
  if (shouldRouteEscape) {
    routeFullGameEscapeToClient(runtime, page);
  }
}

function routeFullGameEscapeToClient(runtime: FullGameRuntime, page: FullGamePage): void {
  runtime.mouse.lookActive = false;
  runtime.mouse.dragging = false;
  Key_Event(runtime.menu.keys, K_ESCAPE, true, runtime.client.cls.realtime);
  executeRuntimeCommandBuffer(runtime, page);
  syncFullGameKeyDestination(runtime, page);
}

function handleMouseButton(event: MouseEvent, down: boolean, runtime: FullGameRuntime, page: FullGamePage): void {
  if (runtime.mode !== "game" || runtime.menu.keys.state.key_dest !== keydest_t.key_game) {
    return;
  }

  const key = mapMouseButton(event);
  if (key === null) {
    return;
  }

  event.preventDefault();
  void runtime.audio.unlock();
  runtime.mouse.lookActive = true;
  runtime.mouse.dragging = down || event.buttons !== 0;
  if (down) {
    requestFullGamePointerLock(runtime, page, event.target);
  }
  Key_Event(runtime.menu.keys, key, down, runtime.client.cls.realtime);
  executeRuntimeCommandBuffer(runtime, page);
}

function handleMouseWheel(event: WheelEvent, runtime: FullGameRuntime, page: FullGamePage): void {
  if (runtime.mode !== "game" || runtime.menu.keys.state.key_dest !== keydest_t.key_game || event.deltaY === 0) {
    return;
  }

  const key = event.deltaY < 0 ? K_MWHEELUP : K_MWHEELDOWN;
  event.preventDefault();
  Key_Event(runtime.menu.keys, key, true, runtime.client.cls.realtime);
  Key_Event(runtime.menu.keys, key, false, runtime.client.cls.realtime);
  executeRuntimeCommandBuffer(runtime, page);
}

function mapMouseButton(event: MouseEvent): number | null {
  switch (event.button) {
    case 0: return K_MOUSE1;
    case 1: return K_MOUSE3;
    case 2: return K_MOUSE2;
    default: return null;
  }
}

function isTextInputTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement;
}

function mapDomKey(event: KeyboardEvent): number | null {
  const functionKey = mapFunctionKey(event.key);
  if (functionKey !== null) {
    return functionKey;
  }

  switch (event.key) {
    case "Escape": return K_ESCAPE;
    case "Enter": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_ENTER : K_ENTER;
    case "Tab": return K_TAB;
    case "Backspace": return K_BACKSPACE;
    case "Delete": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_DEL : K_DEL;
    case "Home": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_HOME : K_HOME;
    case "End": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_END : K_END;
    case "PageUp": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_PGUP : K_PGUP;
    case "PageDown": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_PGDN : K_PGDN;
    case "Insert": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_INS : K_INS;
    case "Shift": return K_SHIFT;
    case "Control": return K_CTRL;
    case "Alt": return K_ALT;
    case "Pause": return K_PAUSE;
    case " ": return K_SPACE;
    case "ArrowUp": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_UPARROW : K_UPARROW;
    case "ArrowDown": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_DOWNARROW : K_DOWNARROW;
    case "ArrowLeft": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_LEFTARROW : K_LEFTARROW;
    case "ArrowRight": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_RIGHTARROW : K_RIGHTARROW;
    case "/": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_SLASH : "/".charCodeAt(0);
    case "-": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_MINUS : "-".charCodeAt(0);
    case "+": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_PLUS : "+".charCodeAt(0);
    default:
      return mapPrintableDomKey(event);
  }
}

function mapFunctionKey(key: string): number | null {
  const match = /^F(\d{1,2})$/.exec(key);
  if (!match) {
    return null;
  }

  const index = Number.parseInt(match[1], 10);
  return index >= 1 && index <= 12 ? K_F1 + index - 1 : null;
}

function mapPrintableDomKey(event: KeyboardEvent): number | null {
  const digitMatch = /^Digit(\d)$/.exec(event.code);
  if (digitMatch) {
    return digitMatch[1]!.charCodeAt(0);
  }

  if (event.key.length !== 1) {
    return null;
  }

  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key.length !== 1) {
    return null;
  }

  return key.charCodeAt(0);
}

function resizeCanvas(page: FullGamePage): void {
  page.canvas.width = LOGICAL_WIDTH;
  page.canvas.height = LOGICAL_HEIGHT;
  page.context.imageSmoothingEnabled = false;
}

function syncFullGameViewportVisibility(runtime: FullGameRuntime, page: FullGamePage): void {
  const gameVisible = runtime.mode === "game";
  const overlayVisible = !gameVisible || runtime.gameRenderer === null;
  page.gameViewport.style.display = gameVisible ? "block" : "none";
  page.canvas.style.display = overlayVisible ? "block" : "none";
}

function clearCanvas(page: FullGamePage): void {
  page.context.imageSmoothingEnabled = false;
  page.context.fillStyle = "#000";
  page.context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
}

function resetFullGameMouseLook(runtime: FullGameRuntime): void {
  runtime.mouse.pointerLocked = false;
  runtime.mouse.pointerLockEscapeArmed = false;
  runtime.mouse.lookActive = false;
  runtime.mouse.dragging = false;
}

function releaseFullGameMouseLook(runtime: FullGameRuntime, page: FullGamePage): void {
  const wasLocked = isFullGamePointerLocked(page);
  resetFullGameMouseLook(runtime);
  if (wasLocked) {
    document.exitPointerLock();
  }
}

function requestFullGamePointerLock(runtime: FullGameRuntime, page: FullGamePage, eventTarget: EventTarget | null = null): void {
  if (runtime.mode !== "game" || runtime.menu.keys.state.key_dest !== keydest_t.key_game) {
    return;
  }

  if (document.pointerLockElement !== null) {
    runtime.mouse.pointerLocked = isFullGamePointerLocked(page);
    return;
  }

  const target = eventTarget instanceof HTMLElement && page.gameViewport.contains(eventTarget)
    ? eventTarget
    : page.gameViewport;
  try {
    void Promise.resolve(target.requestPointerLock()).catch(() => {
      runtime.mouse.pointerLocked = false;
    });
  } catch {
    runtime.mouse.pointerLocked = false;
  }
}

function handleMouseMove(event: MouseEvent, runtime: FullGameRuntime, page: FullGamePage): void {
  if (
    runtime.mode !== "game"
    || runtime.menu.keys.state.key_dest !== keydest_t.key_game
  ) {
    return;
  }

  const pointerLocked = isFullGamePointerLocked(page);
  runtime.mouse.pointerLocked = pointerLocked;
  if (!pointerLocked && !isFullGameMouseLookActive(runtime, page, event)) {
    return;
  }

  event.preventDefault();
  applyFullGameMouseLook(runtime, event.movementX, event.movementY);
}

function isFullGamePointerLocked(page: FullGamePage): boolean {
  const locked = document.pointerLockElement;
  return locked !== null && page.gameViewport.contains(locked);
}

function isFullGameMouseLookActive(runtime: FullGameRuntime, page: FullGamePage, event: MouseEvent): boolean {
  if (!runtime.mouse.lookActive) {
    return false;
  }

  if (runtime.mouse.dragging) {
    return true;
  }

  const bounds = page.gameViewport.getBoundingClientRect();
  return (
    event.clientX >= bounds.left
    && event.clientX <= bounds.right
    && event.clientY >= bounds.top
    && event.clientY <= bounds.bottom
  );
}

function applyFullGameMouseLook(runtime: FullGameRuntime, movementX: number, movementY: number): void {
  const sensitivity = Cvar_VariableValue(runtime.menu.cvar, "sensitivity") || 3;
  const yaw = Cvar_VariableValue(runtime.menu.cvar, "m_yaw") || 0.022;
  const pitch = Cvar_VariableValue(runtime.menu.cvar, "m_pitch") || 0.022;
  runtime.client.cl.viewangles[1] -= movementX * yaw * sensitivity;
  runtime.client.cl.viewangles[0] += movementY * pitch * sensitivity;
  runtime.client.cl.viewangles[0] = Math.max(-89, Math.min(89, runtime.client.cl.viewangles[0]));
}

function createNoopQglBindings(): Record<string, unknown> {
  const bindings: Record<string, unknown> = {};
  for (const name of QGL_REQUIRED_PROCEDURES) {
    bindings[name] = () => undefined;
  }
  bindings.qglGetString = (name: number) => {
    switch (name) {
      case 0x1f00: return "Quake2JS";
      case 0x1f01: return "Three.js";
      case 0x1f02: return "1.0";
      case 0x1f03: return "";
      default: return "";
    }
  };
  bindings.qglGetError = () => 0;
  return bindings;
}

function createFullGameRefImports(onPrint: (message: string) => void): Partial<refimport_t> {
  const cvarRuntime = createCvarRuntime();
  const cvars = new Map<string, cvar_t>();

  return {
    Con_Printf: (level, message) => {
      if (level === PRINT_ALL && message.trim().length > 0) {
        onPrint(message.trim());
      }
    },
    Sys_Error: (_level, message): never => {
      throw new Error(message);
    },
    Cvar_Get: (name, value, flags) => {
      const existing = cvars.get(name);
      if (existing) {
        return existing;
      }
      const created = requireFullGameRefCvar(Cvar_Get(cvarRuntime, name, value, flags), name);
      cvars.set(name, created);
      return created;
    },
    Cvar_Set: (name, value) => {
      const target = cvars.get(name) ?? requireFullGameRefCvar(Cvar_Get(cvarRuntime, name, value, 0), name);
      target.string = value;
      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        target.value = numeric;
      }
      cvars.set(name, target);
      return target;
    },
    Cvar_SetValue: (name, value) => {
      const target = cvars.get(name) ?? requireFullGameRefCvar(Cvar_Get(cvarRuntime, name, String(value), 0), name);
      target.value = value;
      target.string = String(value);
      cvars.set(name, target);
    },
    Cmd_AddCommand: () => undefined,
    Cmd_RemoveCommand: () => undefined,
    FS_Gamedir: () => "baseq2",
    Vid_MenuInit: () => undefined
  };
}

function requireFullGameRefCvar(cvar: cvar_t | null, name: string): cvar_t {
  if (!cvar) {
    throw new Error(`Unable to create ref cvar ${name}`);
  }
  return cvar;
}

function appendLog(page: FullGamePage, line: string): void {
  const next = `${page.log.textContent ?? ""}${line}\n`;
  page.log.textContent = next.split("\n").slice(-8).join("\n");
}
