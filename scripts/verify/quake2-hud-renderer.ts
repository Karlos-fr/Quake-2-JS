/**
 * File: quake2-hud-renderer.ts
 * Purpose: Verify Three.js HUD integration for renderer-common draw commands.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the renderer adapter layer fed by the ported client HUD.
 *
 * Dependencies:
 * - packages/renderer-three/src/hud-renderer.ts
 */

import { strict as assert } from "node:assert";

import { Mesh, MeshBasicMaterial } from "three";
import { createThreeHudLayer, type QuakeHudResourceResolver } from "../../packages/renderer-three/src/index.js";

const resolver: QuakeHudResourceResolver = {
  resolvePicture: () => null,
  resolvePaletteColor: (index) => {
    assert.equal(index, 12, "HUD fill palette index mismatch");
    return {
      red: 0x99 / 255,
      green: 0x66 / 255,
      blue: 0x33 / 255,
      alpha: 1
    };
  },
  resolveGlyphSet: () => ({
    kind: "glyphs",
    name: "conchars",
    charWidth: 8,
    charHeight: 8,
    columns: 16,
    rows: 16,
    supportsHighBit: true,
    origin: {
      sourceFile: "client/console.c + client/cl_scrn.c + client/cl_inv.c",
      originalSymbol: "DrawChar / DrawHUDString / Inv_DrawString",
      notes: "8x8 console/HUD glyph rendering used by Quake II text paths."
    }
  }),
  buildTextTexture: () => null
};

const hud = createThreeHudLayer(resolver);
hud.setViewport(320, 200);
hud.render([
  {
    type: "fill",
    x: 7,
    y: 9,
    width: 11,
    height: 13,
    color: 12,
    bounds: {
      x: 7,
      y: 9,
      width: 11,
      height: 13
    }
  }
]);

assert.equal(hud.root.children.length, 1, "HUD fill must create one mesh");
const fillMesh = hud.root.children[0];
assert.ok(fillMesh instanceof Mesh, "HUD fill child must be a Mesh");
assert.deepEqual(fillMesh.position.toArray(), [12.5, 184.5, 0], "HUD fill mesh position mismatch");

const material = fillMesh.material;
assert.ok(material instanceof MeshBasicMaterial, "HUD fill material mismatch");
assert.equal(material.depthTest, false, "HUD fill depthTest mismatch");
assert.equal(material.depthWrite, false, "HUD fill depthWrite mismatch");
assert.equal(material.color.r, 0x99 / 255, "HUD fill red mismatch");
assert.equal(material.color.g, 0x66 / 255, "HUD fill green mismatch");
assert.equal(material.color.b, 0x33 / 255, "HUD fill blue mismatch");

hud.dispose();
assert.equal(hud.root.children.length, 0, "HUD dispose should clear fill mesh");

console.log("quake2-hud-renderer: ok");
