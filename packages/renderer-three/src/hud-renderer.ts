/**
 * File: hud-renderer.ts
 * Purpose: Render Quake II HUD draw commands through a dedicated Three.js orthographic scene.
 *
 * This file is not a direct source port.
 * It is an adapter layer between renderer-common HUD commands and the Three.js backend.
 *
 * Dependencies:
 * - packages/renderer-common
 * - three
 */

import {
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Texture,
  Vector3
} from "three";
import type {
  HudDrawCommand,
  HudFillCommand,
  HudNumberCommand,
  HudPictureCommand,
  HudTextCommand
} from "../../renderer-common/src/index.js";
import type { QuakeHudResourceResolver } from "./hud-resource-resolver.js";

/**
 * Category: New
 * Purpose: Expose the Three.js HUD scene and update hooks used to render Quake II 2D overlays.
 *
 * Constraints:
 * - Must keep HUD rendering isolated from the 3D world scene.
 */
export interface ThreeHudLayer {
  scene: Scene;
  camera: OrthographicCamera;
  root: Group;
  setViewport: (width: number, height: number) => void;
  render: (commands: HudDrawCommand[]) => void;
  dispose: () => void;
}

/**
 * Category: New
 * Purpose: Build a Three.js HUD layer able to display Quake II picture, number and text commands.
 *
 * Constraints:
 * - Must preserve pixel-space placement using an orthographic camera.
 * - Must remain tolerant of missing picture resources during incremental porting.
 */
export function createThreeHudLayer(resourceResolver: QuakeHudResourceResolver): ThreeHudLayer {
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 1, 0, -100, 100);
  const root = new Group();
  scene.add(root);

  let viewportWidth = 1;
  let viewportHeight = 1;

  return {
    scene,
    camera,
    root,
    setViewport: (width, height) => {
      viewportWidth = Math.max(1, width);
      viewportHeight = Math.max(1, height);
      camera.left = 0;
      camera.right = viewportWidth;
      camera.top = viewportHeight;
      camera.bottom = 0;
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.updateProjectionMatrix();
    },
    render: (commands) => {
      clearHudGroup(root);
      for (const command of commands) {
        switch (command.type) {
          case "picture":
            appendPictureCommand(root, command, resourceResolver, viewportWidth, viewportHeight);
            break;
          case "number":
            appendNumberCommand(root, command, resourceResolver, viewportHeight);
            break;
          case "text":
            appendTextCommand(root, command, resourceResolver, viewportHeight);
            break;
          case "fill":
            appendFillCommand(root, command, resourceResolver, viewportHeight);
            break;
        }
      }
    },
    dispose: () => {
      clearHudGroup(root);
    }
  };
}

/**
 * Category: New
 * Purpose: Append one palette-indexed fill command using Quake II `Draw_Fill` color semantics.
 */
function appendFillCommand(
  root: Group,
  command: HudFillCommand,
  resourceResolver: QuakeHudResourceResolver,
  viewportHeight: number
): void {
  if (command.width <= 0 || command.height <= 0) {
    return;
  }

  const color = resourceResolver.resolvePaletteColor(command.color);
  const geometry = new PlaneGeometry(command.width, command.height);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    opacity: color.alpha,
    transparent: color.alpha < 1,
    depthTest: false,
    depthWrite: false
  });
  material.color.setRGB(color.red, color.green, color.blue);

  const mesh = new Mesh(geometry, material);
  mesh.position.set(command.x + command.width / 2, viewportHeight - (command.y + command.height / 2), 0);
  root.add(mesh);
}

/**
 * Category: New
 * Purpose: Append one picture command as a textured quad in HUD pixel space.
 */
function appendPictureCommand(
  root: Group,
  command: HudPictureCommand,
  resourceResolver: QuakeHudResourceResolver,
  viewportWidth: number,
  viewportHeight: number
): void {
  const texture = resourceResolver.resolvePicture(command.pic);
  if (!texture) {
    return;
  }

  const textureSize = resolveTextureSize(texture);
  const width = command.bounds.width > 0 ? command.bounds.width : textureSize.width;
  const height = command.bounds.height > 0 ? command.bounds.height : textureSize.height;
  const x = command.x < 0 ? (viewportWidth - width) / 2 : command.x;
  const y = command.y < 0 ? (viewportHeight - height) / 2 : command.y;

  root.add(createTexturedQuad(x, y, texture, width, height, viewportHeight));
}

/**
 * Category: New
 * Purpose: Append one number command by expanding its digit picture list.
 *
 * Constraints:
 * - Must preserve the original `SCR_DrawField` left-to-right digit order.
 * - Must use the native digit picture dimensions while keeping the original 16-pixel advance.
 */
function appendNumberCommand(
  root: Group,
  command: HudNumberCommand,
  resourceResolver: QuakeHudResourceResolver,
  viewportHeight: number
): void {
  for (let index = 0; index < command.digits.length; index += 1) {
    const digitPic = command.digits[index];
    const texture = resourceResolver.resolvePicture(digitPic);
    if (!texture) {
      continue;
    }

    const textureSize = resolveTextureSize(texture);
    root.add(createTexturedQuad(command.x + index * 16, command.y, texture, textureSize.width, textureSize.height, viewportHeight));
  }
}

/**
 * Category: New
 * Purpose: Append one text command using a glyph-atlas-backed text texture.
 */
function appendTextCommand(
  root: Group,
  command: HudTextCommand,
  resourceResolver: QuakeHudResourceResolver,
  viewportHeight: number
): void {
  const textTexture = resourceResolver.buildTextTexture(command.text);
  if (!textTexture) {
    return;
  }

  root.add(createTexturedQuad(command.x, command.y, textTexture.texture, textTexture.width, textTexture.height, viewportHeight));
}

/**
 * Category: New
 * Purpose: Create one HUD-space textured quad with top-left pixel placement semantics.
 */
function createTexturedQuad(
  x: number,
  y: number,
  texture: Texture,
  width: number,
  height: number,
  viewportHeight: number
): Mesh {
  const geometry = new PlaneGeometry(width, height);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x + width / 2, viewportHeight - (y + height / 2), 0);
  return mesh;
}

/**
 * Category: New
 * Purpose: Resolve one usable pixel size from a Three.js texture regardless of its backing source.
 */
function resolveTextureSize(texture: Texture): { width: number; height: number } {
  const source = texture.source.data as { width?: number; height?: number } | undefined;
  const image = texture.image as { width?: number; height?: number } | undefined;

  return {
    width: Math.max(1, source?.width ?? image?.width ?? 1),
    height: Math.max(1, source?.height ?? image?.height ?? 1)
  };
}

/**
 * Category: New
 * Purpose: Dispose all transient HUD quads before the next frame rebuild.
 */
function clearHudGroup(group: Group): void {
  const children = [...group.children];
  for (const child of children) {
    group.remove(child);
    if (child instanceof Mesh) {
      child.geometry.dispose();
      const material = child.material;
      if (Array.isArray(material)) {
        for (const entry of material) {
          entry.dispose();
        }
      } else {
        material.dispose();
      }
    }
  }
}
