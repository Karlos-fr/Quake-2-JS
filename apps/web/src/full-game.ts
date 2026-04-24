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
import {
  createVirtualFilesystem,
  mountDirectory,
  mountPak,
  readMountedFile,
  type VirtualFilesystem
} from "../../../packages/filesystem/src/index.js";
import { createQuakeWebAudioAdapter, type QuakeWebAudioAdapter } from "../../../packages/platform/src/index.js";
import {
  Cmd_Init,
  Cvar_Command,
  Cvar_Init,
  Cvar_Get,
  createCommandRuntime,
  createCvarRuntime
} from "../../../packages/qcommon/src/index.js";
import {
  K_DOWNARROW,
  K_ENTER,
  K_ESCAPE,
  K_KP_DOWNARROW,
  K_KP_ENTER,
  K_KP_LEFTARROW,
  K_KP_RIGHTARROW,
  K_KP_UPARROW,
  K_LEFTARROW,
  K_RIGHTARROW,
  K_SPACE,
  K_UPARROW,
  Key_Init,
  createClientKeyContext,
  keydest_t
} from "../../../packages/client/src/keys.js";
import {
  M_Draw,
  M_Init,
  M_Keydown,
  M_Menu_Main_f,
  createClientMenuContext,
  type ClientMenuContext
} from "../../../packages/client/src/menu.js";
import { createClientQMenuContext } from "../../../packages/client/src/qmenu.js";
import {
  SCR_DrawCinematic,
  SCR_PlayCinematic,
  SCR_RunCinematic,
  SCR_StopCinematic,
  type ClientCinematicSnapshot
} from "../../../packages/client/src/screen.js";
import { createRefExport, type refexport_t } from "../../../packages/client/src/ref.js";
import { createClientRuntime, connstate_t, type ClientRuntime } from "../../../packages/client/src/types.js";
import { createClientVidMenuController, type ClientVidMenuController } from "../../../packages/client/src/vid-menu.js";
import { createClientVidContext } from "../../../packages/client/src/vid.js";

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
  | { type: "fade" };

interface FullGamePage {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  status: HTMLElement;
  hint: HTMLElement;
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
  filesystem: VirtualFilesystem;
  drawCommands: DrawCommand[];
  assets: CanvasAssetCache;
  audio: QuakeWebAudioAdapter;
  currentCinematicIndex: number;
  mode: "cinematic" | "menu";
  lastFrameTime: number;
  cinematicStartedAt: number;
}


void bootstrap();

async function bootstrap(): Promise<void> {
  const app = requireApp();
  const page = createPage(app);

  try {
    page.status.textContent = "Chargement des assets Quake II...";
    const filesystem = await createMountedFilesystem();
    const runtime = createFullGameRuntime(filesystem, page);

    resizeCanvas(page);
    window.addEventListener("resize", () => resizeCanvas(page));
    window.addEventListener("pointerdown", () => {
      void runtime.audio.unlock();
    });
    window.addEventListener("keydown", (event) => handleKeyDown(event, runtime, page));

    page.status.textContent = "Lecture de l'intro...";
    startNextCinematic(runtime, page);
    requestAnimationFrame((time) => frame(time, runtime, page));
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    page.status.textContent = "Echec du chargement.";
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
  canvas.tabIndex = 0;

  const status = document.createElement("div");
  status.style.position = "absolute";
  status.style.left = "16px";
  status.style.top = "12px";
  status.style.padding = "6px 8px";
  status.style.background = "rgba(0, 0, 0, 0.55)";
  status.style.border = "1px solid rgba(216, 210, 199, 0.22)";
  status.style.fontSize = "12px";

  const hint = document.createElement("div");
  hint.style.position = "absolute";
  hint.style.right = "16px";
  hint.style.bottom = "12px";
  hint.style.padding = "6px 8px";
  hint.style.background = "rgba(0, 0, 0, 0.55)";
  hint.style.border = "1px solid rgba(216, 210, 199, 0.22)";
  hint.style.fontSize = "12px";
  hint.textContent = "Clic: activer le son | Entree/Espace: avancer | Fleches: menu | Echap: menu";

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

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D indisponible.");
  }

  shell.append(canvas, status, hint, log);
  root.append(shell);
  canvas.focus();

  return { root: shell, canvas, context, status, hint, log };
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
  client.cls.state = connstate_t.ca_disconnected;

  const cvar = createCvarRuntime({
    onPrint: (line) => appendLog(page, line)
  });
  const cmd = createCommandRuntime({
    onPrint: (line) => appendLog(page, line),
    executeUnknownCommand: (_name, text) => {
      const result = Cvar_Command(cvar, cmd);
      if (result.output) {
        appendLog(page, result.output);
      }
      if (!result.handled) {
        appendLog(page, `commande differee: ${text}`);
      }
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
      onInfo: (message) => {
        appendLog(page, message);
        if (message.startsWith("audio actif")) {
          page.hint.textContent = "Entree/Espace: avancer | Fleches: menu | Echap: menu";
        }
      },
      onWarning: (message) => appendLog(page, message)
    }
  });

  const ref = createCanvasRef(filesystem, assets, drawCommands);
  const keys = createClientKeyContext({ cmd, cvar, client });
  const qmenu = createClientQMenuContext({
    getMilliseconds: () => client.cls.realtime
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
          appendLog(page, "changements video appliques aux cvars web.");
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
      startLocalSound: (name) => audio.playWav(filesystem, name),
      getSaveSlots: () => null,
      getMapList: () => null,
      getPlayerModels: () => null,
      onQuit: () => appendLog(page, "Quit demande.")
    }
  });
  menuContext = menu;
  keys.hooks.onMenuKeydown = (key) => M_Keydown(menu, key);
  keys.hooks.onMenuMain = () => M_Menu_Main_f(menu);
  M_Init(menu);

  return {
    client,
    menu,
    filesystem,
    drawCommands,
    assets,
    audio,
    currentCinematicIndex: 0,
    mode: "cinematic",
    lastFrameTime: 0,
    cinematicStartedAt: 0
  };
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
    }
  });

  if (!started) {
    appendLog(page, `cinematique introuvable: ${name}`);
    runtime.currentCinematicIndex += 1;
    startNextCinematic(runtime, page);
    return;
  }

  page.status.textContent = `Cinematique ${runtime.currentCinematicIndex + 1}/${STARTUP_CINEMATICS.length}: ${name}`;
}

function enterMainMenu(runtime: FullGameRuntime, page: FullGamePage): void {
  runtime.mode = "menu";
  runtime.client.cls.state = connstate_t.ca_disconnected;
  runtime.menu.keys.state.key_dest = keydest_t.key_menu;
  M_Menu_Main_f(runtime.menu);
  page.status.textContent = "Menu principal Quake II.";
}

function frame(time: number, runtime: FullGameRuntime, page: FullGamePage): void {
  const delta = runtime.lastFrameTime === 0 ? 0 : time - runtime.lastFrameTime;
  runtime.lastFrameTime = time;
  runtime.client.cls.realtime = time;
  runtime.client.cls.frametime = delta / 1000;
  runtime.client.cls.framecount += 1;

  clearCanvas(page);

  if (runtime.mode === "cinematic") {
    drawCinematicFrame(runtime, page);
  } else {
    drawMenuFrame(runtime, page);
  }

  requestAnimationFrame((nextTime) => frame(nextTime, runtime, page));
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
    }
  });

  const snapshot = SCR_DrawCinematic(runtime.client, {
    viewportWidth: LOGICAL_WIDTH,
    viewportHeight: LOGICAL_HEIGHT,
    keyDest: "game"
  }).cinematic;
  if (snapshot) {
    drawCinematicSnapshot(page, snapshot);
  }

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

  M_Draw(runtime.menu);
  drawCapturedCommands(page, runtime);
  for (const fill of runtime.menu.qmenu.state.drawFills) {
    drawPaletteFill(page, runtime.assets, fill.x, fill.y, fill.w, fill.h, fill.c);
  }
  for (const char of runtime.menu.qmenu.state.drawChars) {
    drawGlyph(page, runtime.filesystem, runtime.assets, char.x, char.y, char.c);
  }
}

function drawCapturedCommands(page: FullGamePage, runtime: FullGameRuntime): void {
  for (const command of runtime.drawCommands) {
    switch (command.type) {
      case "pic": {
        const image = loadPictureCanvas(runtime.filesystem, runtime.assets, command.name);
        if (image) {
          page.context.drawImage(
            image,
            command.x,
            command.y,
            command.width ?? image.width,
            command.height ?? image.height
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
      case "fade":
        page.context.fillStyle = "rgba(0, 0, 0, 0.58)";
        page.context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        break;
    }
  }
}

function drawCinematicSnapshot(page: FullGamePage, snapshot: ClientCinematicSnapshot): void {
  const imageData = page.context.createImageData(snapshot.width, snapshot.height);
  for (let index = 0; index < snapshot.pixels.length; index += 1) {
    const paletteIndex = snapshot.pixels[index] * 3;
    const rgbaIndex = index * 4;
    imageData.data[rgbaIndex] = snapshot.paletteRgb[paletteIndex] ?? 0;
    imageData.data[rgbaIndex + 1] = snapshot.paletteRgb[paletteIndex + 1] ?? 0;
    imageData.data[rgbaIndex + 2] = snapshot.paletteRgb[paletteIndex + 2] ?? 0;
    imageData.data[rgbaIndex + 3] = 255;
  }

  const temp = document.createElement("canvas");
  temp.width = snapshot.width;
  temp.height = snapshot.height;
  temp.getContext("2d")?.putImageData(imageData, 0, 0);
  page.context.drawImage(temp, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
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
  const key = mapDomKey(event);
  if (key === null) {
    return;
  }

  event.preventDefault();
  void runtime.audio.unlock();
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

  M_Keydown(runtime.menu, key);
}

function mapDomKey(event: KeyboardEvent): number | null {
  switch (event.key) {
    case "Escape": return K_ESCAPE;
    case "Enter": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_ENTER : K_ENTER;
    case " ": return K_SPACE;
    case "ArrowUp": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_UPARROW : K_UPARROW;
    case "ArrowDown": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_DOWNARROW : K_DOWNARROW;
    case "ArrowLeft": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_LEFTARROW : K_LEFTARROW;
    case "ArrowRight": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_RIGHTARROW : K_RIGHTARROW;
    default:
      return event.key.length === 1 ? event.key.charCodeAt(0) : null;
  }
}

function resizeCanvas(page: FullGamePage): void {
  page.canvas.width = LOGICAL_WIDTH;
  page.canvas.height = LOGICAL_HEIGHT;
  page.context.imageSmoothingEnabled = false;
}

function clearCanvas(page: FullGamePage): void {
  page.context.imageSmoothingEnabled = false;
  page.context.fillStyle = "#000";
  page.context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
}

function appendLog(page: FullGamePage, line: string): void {
  const next = `${page.log.textContent ?? ""}${line}\n`;
  page.log.textContent = next.split("\n").slice(-8).join("\n");
}
