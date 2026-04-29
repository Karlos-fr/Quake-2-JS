/**
 * File: quake2-refresh-entity-sprite.ts
 * Purpose: Verify that `refresh-entity-sync.ts` now consumes SP2 sprite entities through the ported `R_DrawSpriteModel` path.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for sprite refresh-entity integration.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/client
 * - packages/formats
 * - packages/renderer-three
 */

import { strict as assert } from "node:assert";

import { createVirtualFilesystem, mountDirectory } from "../../packages/filesystem/src/index.js";
import { createClientRuntime } from "../../packages/client/src/index.js";
import { IDSPRITEHEADER, SPRITE_VERSION } from "../../packages/formats/src/index.js";
import { CS_MODELS, RF_TRANSLUCENT } from "../../packages/qcommon/src/index.js";
import type { ClientRefreshFrame } from "../../packages/client/src/refresh.js";
import { createThreeRefreshEntitySync } from "../../packages/renderer-three/src/index.js";

const filesystem = createVirtualFilesystem();
mountDirectory(filesystem, "baseq2", {
  "sprites/test.sp2": buildTestSpriteBytes()
});

const runtime = createClientRuntime();
runtime.cl.configstrings[CS_MODELS + 1] = "sprites/test.sp2";
runtime.cl.time = 1000;

const refreshFrame: ClientRefreshFrame = {
  view: {
    vieworg: [0, 0, 0],
    viewangles: [0, 0, 0],
    forward: [1, 0, 0],
    right: [0, -1, 0],
    up: [0, 0, 1],
    fov_x: 90,
    blend: [0, 0, 0, 0]
  },
  entities: [{
    entityNumber: 1,
    modelindex: 1,
    frame: 0,
    oldframe: 0,
    backlerp: 0,
    origin: [10, 20, 30],
    oldorigin: [10, 20, 30],
    angles: [0, 0, 0],
    skinnum: 0,
    alpha: 0.75,
    flags: RF_TRANSLUCENT,
    customPlayerSkin: false,
    customWeaponModel: false,
    linkedModelSlot: 0
  }],
  lights: [],
  particles: [],
  lightStyles: [],
  beams: [],
  explosions: [],
  forceWalls: [],
  sustains: []
};

const sync = createThreeRefreshEntitySync(filesystem);
const stats = sync.apply(runtime, refreshFrame);
assert.equal(stats.renderedEntities, 1, "sprite renderedEntities mismatch");
assert.equal(stats.skippedNonMd2Model, 0, "sprite skip mismatch");
assert.equal(sync.root.userData.refGl?.source, "R_DrawEntitiesOnList", "sprite dispatch source mismatch");
assert.equal(sync.root.userData.refGl?.queuedEntities, 1, "sprite queued entity count mismatch");
assert.equal(sync.root.children.length, 1, "sprite root child mismatch");

const spriteRoot = sync.root.children[0] as { children: Array<{ geometry?: { getAttribute: (name: string) => { count: number } | undefined }; material?: { opacity?: number; transparent?: boolean } }>; visible?: boolean };
assert.equal(spriteRoot.children.length, 1, "sprite mesh child mismatch");

const spriteMesh = spriteRoot.children[0];
assert.equal(spriteMesh.geometry?.getAttribute("position")?.count, 4, "sprite quad vertex count mismatch");
assert.equal(spriteMesh.geometry?.getAttribute("uv")?.count, 4, "sprite quad uv count mismatch");
assert.equal(spriteMesh.material?.opacity, 0.75, "sprite opacity mismatch");
assert.equal(spriteMesh.material?.transparent, true, "sprite transparency mismatch");

const opaqueAlphaStats = sync.apply(runtime, {
  ...refreshFrame,
  entities: [{
    ...refreshFrame.entities[0],
    alpha: 1,
    flags: RF_TRANSLUCENT
  }]
});
assert.equal(opaqueAlphaStats.renderedEntities, 1, "sprite RF_TRANSLUCENT alpha-1 renderedEntities mismatch");
const translucentFlagSpriteRoot = sync.root.children[0] as { children: Array<{ material?: { opacity?: number; transparent?: boolean } }> };
const translucentFlagSpriteMesh = translucentFlagSpriteRoot.children[0];
assert.equal(translucentFlagSpriteMesh.material?.opacity, 1, "sprite RF_TRANSLUCENT alpha-1 opacity mismatch");
assert.equal(translucentFlagSpriteMesh.material?.transparent, true, "sprite RF_TRANSLUCENT flag transparency mismatch");

const clearedStats = sync.apply(runtime, {
  ...refreshFrame,
  entities: []
});
assert.equal(clearedStats.renderedEntities, 0, "sprite cleared renderedEntities mismatch");
assert.equal(sync.root.children.length, 0, "sprite cleared root child mismatch");

console.log("quake2-refresh-entity-sprite: ok");

function buildTestSpriteBytes(): Uint8Array {
  const bytes = new Uint8Array(12 + 80);
  const view = new DataView(bytes.buffer);
  view.setInt32(0, IDSPRITEHEADER, true);
  view.setInt32(4, SPRITE_VERSION, true);
  view.setInt32(8, 1, true);
  view.setInt32(12, 32, true);
  view.setInt32(16, 48, true);
  view.setInt32(20, 8, true);
  view.setInt32(24, 12, true);
  const nameBytes = new TextEncoder().encode("sprites/frame0.pcx");
  bytes.set(nameBytes, 28);
  return bytes;
}
