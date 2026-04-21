/**
 * File: web-shell.ts
 * Purpose: Hold the browser DOM shell used by the Quake2JS web demo without mixing it into the main bootstrap file.
 *
 * This file is not a direct source port.
 * It is an adapter layer for browser UI, HUD text and performance widgets.
 *
 * Dependencies:
 * - apps/web/src/local-client-controller.ts
 * - packages/renderer-three
 */

import type { RefreshEntitySyncStats } from "../../../packages/renderer-three/src/index.js";
import type { LocalClientController } from "./local-client-controller.js";

/**
 * Category: New
 * Purpose: Describe the imperative browser shell hooks used by the current web bootstrap.
 *
 * Constraints:
 * - Must stay DOM-specific and must not leak into runtime packages.
 */
export interface WebShell {
  viewport: HTMLDivElement;
  attachViewport: (canvas: HTMLCanvasElement) => void;
  bindGhostToggle: (options: { initialValue: boolean; onToggle: (enabled: boolean) => void }) => void;
  bindMapSelector: (options: { maps: string[]; currentValue: string; onChange: (value: string) => void }) => void;
  setPerformance: (frameAtMilliseconds: number) => void;
  setRenderer: (value: string) => void;
  setStatus: (value: string) => void;
  setError: (value: string) => void;
  setSkyText: (value: string) => void;
  setMapInfo: (value: {
    mapName: string;
    faceCount: number;
    surfaceCount: number;
    entityCount: number;
    spawnText: string;
    skyText: string;
  }) => void;
  setRuntimeInfo: (
    value: LocalClientController["refreshFrame"],
    refreshStats: RefreshEntitySyncStats | null
  ) => void;
}

/**
 * Category: New
 * Purpose: Require the root application mount point.
 *
 * Constraints:
 * - Must fail loudly when the page shell is broken.
 */
export function requireApp(): HTMLDivElement {
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
export function createWebShell(app: HTMLDivElement): WebShell {
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
  overlay.style.background = "rgba(14, 10, 8, 0.20)";
  overlay.style.border = "1px solid rgba(210, 196, 177, 0.16)";
  overlay.style.color = "#d4c4b1";
  overlay.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  overlay.style.fontSize = "12px";
  overlay.style.lineHeight = "1.5";
  overlay.style.whiteSpace = "pre-line";
  overlay.style.maxWidth = "340px";
  overlay.style.pointerEvents = "none";

  const ghostButton = document.createElement("button");
  ghostButton.type = "button";
  ghostButton.style.position = "absolute";
  ghostButton.style.top = "12px";
  ghostButton.style.right = "12px";
  ghostButton.style.padding = "3px 7px";
  ghostButton.style.border = "1px solid rgba(212, 196, 177, 0.18)";
  ghostButton.style.background = "rgba(24, 18, 14, 0.7)";
  ghostButton.style.color = "#9ca19e";
  ghostButton.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ghostButton.style.fontSize = "11px";
  ghostButton.style.lineHeight = "1";
  ghostButton.style.cursor = "pointer";
  ghostButton.style.pointerEvents = "auto";
  ghostButton.style.userSelect = "none";

  const mapSelect = document.createElement("select");
  mapSelect.style.position = "absolute";
  mapSelect.style.top = "12px";
  mapSelect.style.right = "86px";
  mapSelect.style.height = "23px";
  mapSelect.style.padding = "1px 6px";
  mapSelect.style.border = "1px solid rgba(212, 196, 177, 0.18)";
  mapSelect.style.background = "rgba(24, 18, 14, 0.7)";
  mapSelect.style.color = "#b7bbb8";
  mapSelect.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  mapSelect.style.fontSize = "11px";
  mapSelect.style.lineHeight = "1";
  mapSelect.style.cursor = "pointer";
  mapSelect.style.pointerEvents = "auto";
  mapSelect.style.userSelect = "none";
  mapSelect.style.maxWidth = "180px";

  const fpsPanel = document.createElement("div");
  fpsPanel.style.position = "absolute";
  fpsPanel.style.right = "16px";
  fpsPanel.style.bottom = "16px";
  fpsPanel.style.width = "232px";
  fpsPanel.style.padding = "8px 10px 10px";
  fpsPanel.style.background = "rgba(14, 10, 8, 0.20)";
  fpsPanel.style.border = "1px solid rgba(210, 196, 177, 0.16)";
  fpsPanel.style.color = "#d4c4b1";
  fpsPanel.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  fpsPanel.style.fontSize = "11px";
  fpsPanel.style.lineHeight = "1.35";
  fpsPanel.style.pointerEvents = "none";

  const fpsTitle = document.createElement("div");
  fpsTitle.style.marginBottom = "6px";
  fpsTitle.textContent = "FPS";

  const fpsCanvas = document.createElement("canvas");
  fpsCanvas.width = 212;
  fpsCanvas.height = 64;
  fpsCanvas.style.display = "block";
  fpsCanvas.style.width = "212px";
  fpsCanvas.style.height = "64px";

  const rendererLine = document.createElement("div");
  const statusLine = document.createElement("div");
  const infoLine = document.createElement("div");
  const runtimeLine = document.createElement("div");
  const errorLine = document.createElement("div");
  errorLine.style.color = "#f0b8a0";
  let lastRuntimeText = "";
  let mapInfoLines: string[] = [];

  fpsPanel.append(fpsTitle, fpsCanvas);
  overlay.append(rendererLine, statusLine, infoLine, runtimeLine, errorLine);
  viewport.append(overlay, fpsPanel, mapSelect, ghostButton);
  root.append(viewport);
  app.append(root);

  const fpsTracker = createFpsTracker(fpsCanvas, fpsTitle);

  return {
    viewport,
    attachViewport: (canvas) => {
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      viewport.prepend(canvas);
    },
    bindGhostToggle: ({ initialValue, onToggle }) => {
      let enabled = initialValue;

      const refreshGhostButton = (): void => {
        ghostButton.textContent = enabled ? "Ghost On" : "Ghost";
        ghostButton.style.color = enabled ? "#d8ddd8" : "#9ca19e";
        ghostButton.style.borderColor = enabled ? "rgba(216, 221, 216, 0.28)" : "rgba(212, 196, 177, 0.18)";
      };

      ghostButton.addEventListener("click", () => {
        enabled = !enabled;
        onToggle(enabled);
        refreshGhostButton();
      });

      refreshGhostButton();
    },
    bindMapSelector: ({ maps, currentValue, onChange }) => {
      mapSelect.innerHTML = "";

      for (const mapPath of maps) {
        const option = document.createElement("option");
        option.value = mapPath;
        option.textContent = getDisplayMapName(mapPath);
        option.selected = mapPath === currentValue;
        mapSelect.append(option);
      }

      mapSelect.value = maps.includes(currentValue) ? currentValue : (maps[0] ?? "");
      mapSelect.addEventListener("change", () => {
        if (!mapSelect.value) {
          return;
        }

        onChange(mapSelect.value);
      });
    },
    setPerformance: (frameAtMilliseconds) => {
      fpsTracker.pushFrame(frameAtMilliseconds);
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
    setSkyText: (value) => {
      if (mapInfoLines.length === 0) {
        return;
      }

      mapInfoLines[5] = `Sky: ${value}`;
      infoLine.textContent = mapInfoLines.join("\n");
    },
    setMapInfo: ({ mapName, faceCount, surfaceCount, entityCount, spawnText, skyText }) => {
      mapInfoLines = [
        `Map: ${mapName}`,
        `Faces BSP: ${faceCount}`,
        `Surfaces visibles: ${surfaceCount}`,
        `Entites visibles: ${entityCount}`,
        `Spawn: ${spawnText}`,
        `Sky: ${skyText}`,
        "Controles: clic pour souris, ZQSD, Espace, Ctrl/C"
      ];
      infoLine.textContent = mapInfoLines.join("\n");
    },
    setRuntimeInfo: (value, refreshStats) => {
      const nextRuntimeText = value
        ? [
            `Refresh: entites ${value.entities.length}`,
            refreshStats ? `Refresh MD2: ${refreshStats.renderedEntities}/${refreshStats.visibleEntities}` : "Refresh MD2: en attente",
            refreshStats
              ? `Skip refresh: no-model ${refreshStats.skippedNoModelIndex}, cfg ${refreshStats.skippedMissingConfigstring}, brush ${refreshStats.skippedInlineOrBrushModel}, non-md2 ${refreshStats.skippedNonMd2Model}, asset ${refreshStats.missingMd2AssetCount}`
              : "Skip refresh: en attente",
            `Beams: ${value.beams.length}`,
            `Explosions: ${value.explosions.length}`,
            `ForceWalls: ${value.forceWalls.length}`,
            `Sustains: ${value.sustains.length}`,
            `Lights: ${value.lights.length}`
          ].join("\n")
        : "Refresh: en attente";

      if (nextRuntimeText === lastRuntimeText) {
        return;
      }

      lastRuntimeText = nextRuntimeText;
      runtimeLine.textContent = nextRuntimeText;
    }
  };
}

/**
 * Category: New
 * Purpose: Format one BSP path into a compact UI label for the top-right map selector.
 */
function getDisplayMapName(mapPath: string): string {
  const slashIndex = mapPath.lastIndexOf("/");
  return slashIndex >= 0 ? mapPath.slice(slashIndex + 1) : mapPath;
}

/**
 * Category: New
 * Purpose: Track frame times and render a 60-second sliding FPS history in a compact canvas panel.
 *
 * Constraints:
 * - Must keep only the last 60 seconds of samples.
 * - Must stay lightweight enough to update every rendered frame.
 */
function createFpsTracker(
  canvas: HTMLCanvasElement,
  title: HTMLDivElement
): {
  pushFrame: (frameAtMilliseconds: number) => void;
} {
  const context = canvas.getContext("2d");
  if (!context) {
    return {
      pushFrame: () => {
        title.textContent = "FPS indisponible";
      }
    };
  }

  const windowMilliseconds = 60_000;
  const samples: Array<{ time: number; fps: number }> = [];
  let previousFrameAtMilliseconds = 0;

  /**
   * Category: New
   * Purpose: Paint the current FPS history as a green line over the trailing 60-second window.
   *
   * Constraints:
   * - Must tolerate sparse samples during startup.
   */
  const draw = (): void => {
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);

    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(210, 196, 177, 0.10)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, height - 0.5);
    context.lineTo(width, height - 0.5);
    context.moveTo(0, Math.round(height * 0.5) + 0.5);
    context.lineTo(width, Math.round(height * 0.5) + 0.5);
    context.stroke();

    if (samples.length === 0) {
      title.textContent = "FPS --";
      return;
    }

    const currentSample = samples[samples.length - 1];
    const maxFps = Math.max(60, ...samples.map((sample) => sample.fps));
    title.textContent = `FPS ${Math.round(currentSample.fps)}`;

    context.strokeStyle = "#5fd46f";
    context.lineWidth = 1.5;
    context.beginPath();

    for (let index = 0; index < samples.length; index += 1) {
      const sample = samples[index];
      const ageMilliseconds = currentSample.time - sample.time;
      const x = width - (ageMilliseconds / windowMilliseconds) * width;
      const normalized = Math.min(sample.fps / maxFps, 1);
      const y = height - normalized * (height - 6) - 3;

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.stroke();
  };

  return {
    pushFrame: (frameAtMilliseconds) => {
      if (previousFrameAtMilliseconds > 0) {
        const frameDeltaMilliseconds = Math.max(1, frameAtMilliseconds - previousFrameAtMilliseconds);
        const fps = 1000 / frameDeltaMilliseconds;
        samples.push({ time: frameAtMilliseconds, fps });
      }

      previousFrameAtMilliseconds = frameAtMilliseconds;

      while (samples.length > 0 && frameAtMilliseconds - samples[0].time > windowMilliseconds) {
        samples.shift();
      }

      draw();
    }
  };
}
