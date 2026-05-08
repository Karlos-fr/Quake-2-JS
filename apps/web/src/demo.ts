/**
 * File: demo.ts
 * Purpose: Standalone browser page that launches an in-game Quake II `.dm2` demo directly.
 *
 * This file is not a direct source port.
 * It wires the ported server demo playback, client parser and Three renderer into one small page.
 */

import { Scene } from "three";
import {
  CL_Frame,
  CL_InitInput,
  CL_InitLocal,
  CL_PrepRefresh,
  CL_ReadPackets,
  SCR_Init,
  connstate_t,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  createClientScreenContext,
  createClientSendCmdBridge,
  createRefExport,
  type ClientRefreshFrame,
  type ClientRuntime,
  type refexport_t,
  type refimport_t
} from "../../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  FS_Gamedir,
  mountPak,
  readMountedFile,
  type VirtualFilesystem
} from "../../../packages/filesystem/src/index.js";
import {
  Cbuf_AddText,
  Cbuf_Execute,
  Cmd_Init,
  Cvar_Get,
  Cvar_Init,
  Cvar_Set as QcommonCvar_Set,
  Cvar_SetValue as QcommonCvar_SetValue,
  Cvar_VariableValue,
  PRINT_ALL,
  createCommandRuntime,
  createCvarRuntime,
  type CommandRuntime,
  type CvarRuntime,
  type cvar_t
} from "../../../packages/qcommon/src/index.js";
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
import {
  createQuakeWebAudioAdapter,
  type QuakeWebAudioAdapter
} from "../../../packages/platform/src/index.js";
import { createFullGameLocalTransport } from "./full-game-local-transport.js";
import {
  createFullGameServerRenderSource,
  getFullGameServerMapPath
} from "./full-game-render-source.js";
import {
  createFullGameRenderLoop,
  type FullGameRenderLoop
} from "./full-game-render-loop.js";
import { createFullGameServerHost, type FullGameServerHost } from "./full-game-server-host.js";
import { createRefreshDebugLayer } from "./refresh-debug-layer.js";
import { loadFirstAvailablePak } from "./web-map-bootstrap.js";
import {
  createCamera,
  createRenderer,
  type ActiveRenderer
} from "./web-render-bootstrap.js";

const BASEQ2_PAK_CANDIDATES = [
  "/@fs/C:/a/Projets/Quake-2/Quake 2/baseq2/pak0.pak",
  "/baseq2/pak0.pak"
];
const DEMO_SEQUENCE = [
  "demo1.dm2",
  "demo2.dm2"
];

interface DemoPage {
  root: HTMLElement;
  viewport: HTMLDivElement;
  status: HTMLDivElement;
}

interface DemoRenderer {
  mapPath: string;
  renderer: ActiveRenderer;
  renderLoop: FullGameRenderLoop;
  camera: ReturnType<typeof createCamera>;
}

interface DemoRuntime {
  filesystem: VirtualFilesystem;
  client: ClientRuntime;
  cmd: CommandRuntime;
  cvar: CvarRuntime;
  serverHost: FullGameServerHost;
  audio: QuakeWebAudioAdapter;
  currentDemoIndex: number;
  renderer: DemoRenderer | null;
  rendererPromise: Promise<DemoRenderer> | null;
  rendererPromiseMapPath: string | null;
  previousFrameTime: number;
}

void bootstrap();

async function bootstrap(): Promise<void> {
  const app = requireApp();
  const page = createPage(app);

  try {
    page.status.textContent = "Chargement de pak0.pak...";
    const filesystem = await createDemoFilesystem();
    const runtime = createDemoRuntime(filesystem, page);

    const unlockAudio = (): void => {
      void runtime.audio.unlock();
    };
    page.viewport.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", (event) => {
      unlockAudio();
      if (event.key === "Escape" || event.key === " " || event.key === "Enter") {
        startNextDemo(runtime, page);
      }
    });
    window.addEventListener("blur", () => {
      void runtime.audio.pause();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void runtime.audio.resume();
      } else {
        void runtime.audio.pause();
      }
    });

    startNextDemo(runtime, page);
    requestAnimationFrame((time) => frame(time, runtime, page));
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    page.status.textContent = [
      "Impossible de lancer la demo in-game Quake II.",
      message,
      "En dev, Vite doit pouvoir lire l'installation locale via /@fs/.",
      "Alternative: placer pak0.pak sous apps/web/public/baseq2/pak0.pak."
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

function createPage(root: HTMLElement): DemoPage {
  document.body.style.margin = "0";
  document.body.style.background = "#050505";
  document.body.style.overflow = "hidden";

  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.background = "#050505";

  const viewport = document.createElement("div");
  viewport.tabIndex = 0;
  viewport.style.position = "absolute";
  viewport.style.inset = "0";
  viewport.style.background = "#000";
  viewport.style.outline = "none";

  const status = document.createElement("div");
  status.style.position = "absolute";
  status.style.left = "16px";
  status.style.right = "16px";
  status.style.bottom = "14px";
  status.style.color = "#d8d2c7";
  status.style.font = "12px Arial, sans-serif";
  status.style.textAlign = "center";
  status.style.whiteSpace = "pre-wrap";
  status.style.textShadow = "0 1px 2px #000";
  status.style.pointerEvents = "none";

  root.replaceChildren(viewport, status);
  viewport.focus();
  return { root, viewport, status };
}

async function createDemoFilesystem(): Promise<VirtualFilesystem> {
  const pakBytes = await loadFirstAvailablePak(BASEQ2_PAK_CANDIDATES);
  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, pakBytes, "pak0.pak");
  return filesystem;
}

function createDemoRuntime(filesystem: VirtualFilesystem, page: DemoPage): DemoRuntime {
  const client = createClientRuntime();
  const cmd = createCommandRuntime();
  const cvar = createCvarRuntime();
  const audio = createQuakeWebAudioAdapter();
  const transport = createFullGameLocalTransport({
    now: () => client.cls.realtime,
    onPrint: (message) => {
      page.status.textContent = message.trim();
    }
  });

  Cmd_Init(cmd);
  Cvar_Init(cvar, cmd);
  Cvar_Get(cvar, "crosshair", "0", 0);
  Cvar_Get(cvar, "gl_shadows", "0", 0);
  Cvar_Get(cvar, "gl_polyblend", "1", 0);
  SCR_Init(createClientScreenContext(client, cmd, cvar));

  const mainContext = createClientMainContext(client, cmd, cvar);
  const inputContext = createClientInputContext(client, cmd, cvar, {
    qnet: transport.clientQnet
  });
  const sendClientCommand = createClientSendCmdBridge(inputContext);
  const prepRef = createPrepRef();
  let runtime: DemoRuntime;

  const prepRefresh = (): void => {
    const result = CL_PrepRefresh(client, {
      ref: prepRef,
      viewportWidth: page.viewport.clientWidth || 640,
      viewportHeight: page.viewport.clientHeight || 480,
      crosshairValue: Cvar_VariableValue(cvar, "crosshair"),
      onUpdateScreen: () => undefined,
      onPumpEvents: () => undefined,
      onPrint: (message) => {
        const trimmed = message.trim();
        if (trimmed) {
          page.status.textContent = trimmed;
        }
      }
    });
    if (result) {
      client.cl.screen.scr_draw_loading = 0;
    }
  };

  const createClientHooks = (withReadPackets: boolean) => ({
    getMilliseconds: () => client.cls.realtime,
    qnet: transport.clientQnet,
    serverRunning: () => runtime.serverHost.hasActiveServer(),
    onPrint: (message: string) => {
      const trimmed = message.trim();
      if (trimmed) {
        page.status.textContent = trimmed;
      }
    },
    onStufftext: (text: string) => {
      Cbuf_AddText(cmd, text);
    },
    onExecuteCommandBuffer: () => {
      Cbuf_Execute(cmd);
    },
    ...(withReadPackets ? {
      onReadPackets: () => {
        CL_ReadPackets(mainContext, createClientHooks(false));
      }
    } : {}),
    onSendCmd: sendClientCommand,
    onPrepRefresh: prepRefresh,
    onRegisterSounds: () => undefined,
    onBegin: () => undefined,
    registerModel: (path: string) => path,
    registerSkin: (path: string) => path,
    registerPic: (path: string) => path,
    registerSound: (path: string) => path
  });

  const serverHost = createFullGameServerHost({
    cmd,
    cvar,
    filesystem,
    getGameDir: () => FS_Gamedir(filesystem),
    qnet: transport.serverQnet,
    onPrint: (message) => {
      const trimmed = message.trim();
      if (trimmed) {
        page.status.textContent = trimmed;
      }
    },
    onBeginLoading: () => {
      client.cl.screen.scr_draw_loading = 1;
    }
  });

  runtime = {
    filesystem,
    client,
    cmd,
    cvar,
    serverHost,
    audio,
    currentDemoIndex: -1,
    renderer: null,
    rendererPromise: null,
    rendererPromiseMapPath: null,
    previousFrameTime: 0
  };

  CL_InitLocal(mainContext, {
    getMilliseconds: () => client.cls.realtime,
    qnet: transport.clientQnet,
    serverRunning: () => runtime.serverHost.hasActiveServer(),
    allowDownload: false,
    fileExists: (path) => readMountedFile(filesystem, path) !== undefined,
    loadBinaryFile: (path) => readMountedFile(filesystem, path)?.bytes ?? null,
    onPrepRefresh: prepRefresh,
    onRegisterSounds: () => undefined,
    onBegin: () => undefined,
    onPrint: (message) => {
      const trimmed = message.trim();
      if (trimmed) {
        page.status.textContent = trimmed;
      }
    }
  });
  CL_InitInput(inputContext);

  (runtime as DemoRuntime & {
    mainContext: typeof mainContext;
    createClientHooks: typeof createClientHooks;
  }).mainContext = mainContext;
  (runtime as DemoRuntime & {
    mainContext: typeof mainContext;
    createClientHooks: typeof createClientHooks;
  }).createClientHooks = createClientHooks;
  return runtime;
}

function startNextDemo(runtime: DemoRuntime, page: DemoPage): void {
  runtime.currentDemoIndex = (runtime.currentDemoIndex + 1) % DEMO_SEQUENCE.length;
  const demoName = DEMO_SEQUENCE[runtime.currentDemoIndex];
  runtime.serverHost.shutdown();
  runtime.client.cls.state = connstate_t.ca_disconnected;
  runtime.client.cl.refresh_prepped = false;
  runtime.client.cl.frame.valid = false;
  Cbuf_AddText(runtime.cmd, `demomap ${demoName}\n`);
  Cbuf_Execute(runtime.cmd);
  page.status.textContent = `Demo in-game: ${demoName}`;
}

function frame(time: number, runtime: DemoRuntime, page: DemoPage): void {
  const delta = runtime.previousFrameTime === 0 ? 16 : Math.min(100, time - runtime.previousFrameTime);
  runtime.previousFrameTime = time;
  runtime.client.cls.realtime = time;

  const internal = runtime as DemoRuntime & {
    mainContext: ReturnType<typeof createClientMainContext>;
    createClientHooks: (withReadPackets: boolean) => Record<string, unknown>;
  };
  Cbuf_Execute(runtime.cmd);
  CL_Frame(internal.mainContext, Math.trunc(delta), internal.createClientHooks(true));
  runtime.serverHost.frame(Math.trunc(delta));
  CL_ReadPackets(internal.mainContext, internal.createClientHooks(false));
  Cbuf_Execute(runtime.cmd);

  const mapPath = getFullGameServerMapPath(runtime.client);
  if (runtime.client.cls.state === connstate_t.ca_active && runtime.client.cl.refresh_prepped && runtime.client.cl.frame.valid && mapPath) {
    void ensureRenderer(runtime, page, mapPath).then((renderer) => {
      const source = createFullGameServerRenderSource(runtime.client, {
        cvar: runtime.cvar,
        predictMovement: false,
        drawGun: true
      });
      syncDemoCameraToRefresh(renderer.camera, source.refreshFrame);
      renderer.renderLoop.renderFrame({
        source,
        elapsedSeconds: runtime.client.cl.time * 0.001
      });
      page.status.textContent = "";
    });
  }

  if (!runtime.serverHost.hasActiveServer() && runtime.client.cls.state !== connstate_t.ca_connecting) {
    startNextDemo(runtime, page);
  }

  requestAnimationFrame((nextTime) => frame(nextTime, runtime, page));
}

async function ensureRenderer(runtime: DemoRuntime, page: DemoPage, mapPath: string): Promise<DemoRenderer> {
  if (runtime.renderer?.mapPath === mapPath) {
    runtime.renderer.renderLoop.resize();
    return runtime.renderer;
  }

  if (runtime.rendererPromise && runtime.rendererPromiseMapPath === mapPath) {
    return await runtime.rendererPromise;
  }

  runtime.renderer?.renderLoop.dispose();
  runtime.renderer?.renderer.dispose();
  runtime.renderer = null;
  runtime.rendererPromiseMapPath = mapPath;
  runtime.rendererPromise = createDemoRenderer(runtime, page, mapPath);
  const renderer = await runtime.rendererPromise;
  runtime.renderer = renderer;
  runtime.rendererPromise = null;
  runtime.rendererPromiseMapPath = null;
  renderer.renderLoop.resize();
  return renderer;
}

async function createDemoRenderer(runtime: DemoRuntime, page: DemoPage, mapPath: string): Promise<DemoRenderer> {
  page.viewport.replaceChildren();
  const renderer = await createRenderer();
  const canvas = renderer.renderer.domElement;
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  page.viewport.append(canvas);

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
      glimpSetMode: () => ({ err: 0, width: page.viewport.clientWidth || 640, height: page.viewport.clientHeight || 480 }),
      glimpBeginFrame: () => undefined,
      glimpEndFrame: () => undefined
    },
    imports: createDemoRefImports((message) => {
      const trimmed = message.trim();
      if (trimmed) {
        page.status.textContent = trimmed;
      }
    })
  });
  refGlHost.init();

  const scene = new Scene();
  scene.add(glWorldAdapter.root);
  scene.add(skyAdapter.root);
  const refreshEntitySync = createThreeRefreshEntitySync(runtime.filesystem);
  refreshEntitySync.setAliasLightSampler(glWorldAdapter.sampleLightPoint);
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
    renderer: renderer.renderer,
    ui: {
      viewport: page.viewport
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
    enableRenderSourceAudio: true
  });

  window.addEventListener("resize", renderLoop.resize);
  return {
    mapPath,
    renderer: renderer.renderer,
    renderLoop,
    camera
  };
}

function syncDemoCameraToRefresh(camera: ReturnType<typeof createCamera>, refreshFrame: ClientRefreshFrame | null): void {
  if (!refreshFrame) {
    return;
  }

  const view = refreshFrame.view;
  camera.position.set(view.vieworg[0], view.vieworg[1], view.vieworg[2]);
  camera.up.set(view.up[0], view.up[1], view.up[2]);
  camera.lookAt(
    view.vieworg[0] + view.forward[0],
    view.vieworg[1] + view.forward[1],
    view.vieworg[2] + view.forward[2]
  );
}

function createPrepRef(): refexport_t {
  const ref = createRefExport();
  ref.RegisterModel = (name) => ({ name }) as ReturnType<refexport_t["RegisterModel"]>;
  ref.RegisterSkin = (name) => ({ name }) as ReturnType<refexport_t["RegisterSkin"]>;
  ref.RegisterPic = (name) => ({ name }) as ReturnType<refexport_t["RegisterPic"]>;
  ref.DrawGetPicSize = () => ({ width: 24, height: 24 });
  return ref;
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

function createDemoRefImports(onStatus: (message: string) => void): Partial<refimport_t> {
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
      const target = requireCvar(QcommonCvar_Set(cvarRuntime, name, value), name);
      cvars.set(name, target);
      return target;
    },
    Cvar_SetValue: (name: string, value: number) => {
      const target = requireCvar(QcommonCvar_SetValue(cvarRuntime, name, value), name);
      cvars.set(name, target);
    },
    Cmd_AddCommand: () => undefined,
    Cmd_RemoveCommand: () => undefined,
    FS_Gamedir: () => "baseq2",
    Vid_MenuInit: () => undefined
  };
}

function requireCvar(cvar: cvar_t | null, name: string): cvar_t {
  if (!cvar) {
    throw new Error(`Unable to create cvar ${name}`);
  }

  return cvar;
}
