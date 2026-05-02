/**
 * File: quake2-refresh-entity-alias-flags.ts
 * Purpose: Verify that rare alias render flags from ref_gl/gl_mesh.c reach the Three refresh-entity adapter.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/qcommon
 * - packages/renderer-three
 * - three
 */

import { strict as assert } from "node:assert";
import { BufferAttribute, Mesh, MeshBasicMaterial } from "three";

import { createClientRuntime, type ClientRefreshFrame } from "../../packages/client/src/index.js";
import { createVirtualFilesystem, mountDirectory } from "../../packages/filesystem/src/index.js";
import { ALIAS_VERSION, IDALIASHEADER } from "../../packages/formats/src/index.js";
import { setLittleFloat, setLittleLong, setLittleShort, setUnsignedByte } from "../../packages/memory/src/binary-io.js";
import { CS_MODELS, RDF_IRGOGGLES, RF_IR_VISIBLE, RF_SHELL_RED } from "../../packages/qcommon/src/index.js";
import { createThreeRefreshEntitySync } from "../../packages/renderer-three/src/index.js";

main();

function main(): void {
  const filesystem = createVirtualFilesystem();
  mountDirectory(filesystem, "baseq2", {
    "models/flags/tris.md2": createAliasBuffer(["models/flags/skin0.pcx"]),
    "models/flags/skin0.pcx": createSolidPcx(64, 96, 192)
  });

  const runtime = createClientRuntime();
  runtime.cl.configstrings[CS_MODELS + 1] = "models/flags/tris.md2";

  const sync = createThreeRefreshEntitySync(filesystem);

  const baseStats = sync.apply(runtime, createFrame());
  assert.equal(baseStats.renderedEntities, 1, "base alias renderedEntities mismatch");
  const baseMesh = sync.root.children[0].children[0] as Mesh;
  const basePositions = readPositions(baseMesh);

  const firstEntity = createFrame().entities[0];
  const sharedSkinStats = sync.apply(runtime, {
    ...createFrame(),
    entities: [
      firstEntity,
      {
        ...firstEntity,
        entityNumber: 2,
        origin: [48, 0, 0],
        oldorigin: [48, 0, 0]
      }
    ]
  });
  assert.equal(sharedSkinStats.renderedEntities, 2, "shared skin aliases renderedEntities mismatch");
  const firstSharedMesh = sync.root.children[0].children[0] as Mesh;
  const secondSharedMesh = sync.root.children[1].children[0] as Mesh;
  assert.equal(
    (firstSharedMesh.material as MeshBasicMaterial).map,
    (secondSharedMesh.material as MeshBasicMaterial).map,
    "MD2 instances using the same skin must share the cached texture"
  );

  const shellStats = sync.apply(runtime, createFrame({ flags: RF_SHELL_RED }));
  assert.equal(shellStats.renderedEntities, 1, "shell alias renderedEntities mismatch");
  const shellMesh = sync.root.children[0].children[0] as Mesh;
  const shellMaterial = shellMesh.material as MeshBasicMaterial;
  assert.notDeepEqual(readPositions(shellMesh), basePositions, "RF_SHELL_RED must extrude alias vertices without RF_FRAMELERP");
  assert.equal(shellMaterial.map, null, "RF_SHELL_RED must disable the base skin map");
  assert.equal(shellMaterial.vertexColors, false, "RF_SHELL_RED must use flat shell color");
  assert.ok(Math.abs(shellMaterial.color.r - 1) < 0.0001, "RF_SHELL_RED material red mismatch");
  assert.ok(shellMaterial.color.g < 0.0001, "RF_SHELL_RED material green mismatch");
  assert.ok(shellMaterial.color.b < 0.0001, "RF_SHELL_RED material blue mismatch");

  runtime.cl.frame.playerstate.rdflags = RDF_IRGOGGLES;
  const irStats = sync.apply(runtime, createFrame({ flags: RF_IR_VISIBLE }));
  assert.equal(irStats.renderedEntities, 1, "IR alias renderedEntities mismatch");
  const irMesh = sync.root.children[0].children[0] as Mesh;
  const irMaterial = irMesh.material as MeshBasicMaterial;
  const colors = (irMesh.geometry.getAttribute("color") as BufferAttribute).array as Float32Array;
  assert.equal(irMaterial.vertexColors, true, "RF_IR_VISIBLE must use vertex colors");
  assert.ok(colors[0] > 0, "RF_IR_VISIBLE red vertex color mismatch");
  assert.equal(colors[1], 0, "RF_IR_VISIBLE green vertex color mismatch");
  assert.equal(colors[2], 0, "RF_IR_VISIBLE blue vertex color mismatch");

  console.log("quake2-refresh-entity-alias-flags: ok");
}

function createFrame(overrides: Partial<ClientRefreshFrame["entities"][number]> = {}): ClientRefreshFrame {
  return {
    view: {
      vieworg: [0, 0, 0],
      viewangles: [0, 0, 0],
      forward: [1, 0, 0],
      right: [0, -1, 0],
      up: [0, 0, 1],
      fov_x: 90,
      blend: [0, 0, 0, 0]
    },
    areabits: new Uint8Array([0xff]),
    entities: [{
      entityNumber: 1,
      modelindex: 1,
      frame: 0,
      oldframe: 0,
      backlerp: 0,
      origin: [32, 0, 0],
      oldorigin: [32, 0, 0],
      angles: [0, 0, 0],
      skinnum: 0,
      alpha: 1,
      flags: 0,
      effects: 0,
      customPlayerSkin: false,
      customWeaponModel: false,
      linkedModelSlot: 0,
      ...overrides
    }],
    lights: [],
    particles: [],
    lightStyles: [],
    beams: [],
    explosions: [],
    forceWalls: [],
    sustains: []
  };
}

function readPositions(mesh: Mesh): number[] {
  const position = mesh.geometry.getAttribute("position") as BufferAttribute;
  return Array.from(position.array as Float32Array);
}

function createAliasBuffer(skins: string[]): Uint8Array {
  const numSkins = skins.length;
  const numXyz = 3;
  const numSt = 3;
  const numTris = 1;
  const numFrames = 1;
  const numGlcmds = 11;
  const frameSize = 24 + 16 + numXyz * 4;
  const ofsSkins = 68;
  const ofsSt = ofsSkins + numSkins * 64;
  const ofsTris = ofsSt + numSt * 4;
  const ofsFrames = ofsTris + numTris * 12;
  const ofsGlcmds = ofsFrames + numFrames * frameSize;
  const ofsEnd = ofsGlcmds + numGlcmds * 4;
  const buffer = new Uint8Array(ofsEnd);

  setLittleLong(buffer, 0, IDALIASHEADER);
  setLittleLong(buffer, 4, ALIAS_VERSION);
  setLittleLong(buffer, 8, 64);
  setLittleLong(buffer, 12, 64);
  setLittleLong(buffer, 16, frameSize);
  setLittleLong(buffer, 20, numSkins);
  setLittleLong(buffer, 24, numXyz);
  setLittleLong(buffer, 28, numSt);
  setLittleLong(buffer, 32, numTris);
  setLittleLong(buffer, 36, numGlcmds);
  setLittleLong(buffer, 40, numFrames);
  setLittleLong(buffer, 44, ofsSkins);
  setLittleLong(buffer, 48, ofsSt);
  setLittleLong(buffer, 52, ofsTris);
  setLittleLong(buffer, 56, ofsFrames);
  setLittleLong(buffer, 60, ofsGlcmds);
  setLittleLong(buffer, 64, ofsEnd);

  for (let index = 0; index < skins.length; index += 1) {
    writeCString(buffer, ofsSkins + index * 64, 64, skins[index]);
  }

  setLittleShort(buffer, ofsSt + 0, 0);
  setLittleShort(buffer, ofsSt + 2, 0);
  setLittleShort(buffer, ofsSt + 4, 63);
  setLittleShort(buffer, ofsSt + 6, 0);
  setLittleShort(buffer, ofsSt + 8, 0);
  setLittleShort(buffer, ofsSt + 10, 63);

  setLittleShort(buffer, ofsTris + 0, 0);
  setLittleShort(buffer, ofsTris + 2, 1);
  setLittleShort(buffer, ofsTris + 4, 2);
  setLittleShort(buffer, ofsTris + 6, 0);
  setLittleShort(buffer, ofsTris + 8, 1);
  setLittleShort(buffer, ofsTris + 10, 2);

  const frameOffset = ofsFrames;
  setLittleFloat(buffer, frameOffset + 0, 1);
  setLittleFloat(buffer, frameOffset + 4, 1);
  setLittleFloat(buffer, frameOffset + 8, 1);
  setLittleFloat(buffer, frameOffset + 12, 0);
  setLittleFloat(buffer, frameOffset + 16, 0);
  setLittleFloat(buffer, frameOffset + 20, 0);
  writeCString(buffer, frameOffset + 24, 16, "frame0");
  const verticesOffset = frameOffset + 40;
  writeVertex(buffer, verticesOffset + 0, [0, 0, 0], 0);
  writeVertex(buffer, verticesOffset + 4, [8, 0, 0], 0);
  writeVertex(buffer, verticesOffset + 8, [0, 8, 0], 0);

  setLittleLong(buffer, ofsGlcmds + 0, 3);
  setLittleFloat(buffer, ofsGlcmds + 4, 0);
  setLittleFloat(buffer, ofsGlcmds + 8, 0);
  setLittleLong(buffer, ofsGlcmds + 12, 0);
  setLittleFloat(buffer, ofsGlcmds + 16, 1);
  setLittleFloat(buffer, ofsGlcmds + 20, 0);
  setLittleLong(buffer, ofsGlcmds + 24, 1);
  setLittleFloat(buffer, ofsGlcmds + 28, 0);
  setLittleFloat(buffer, ofsGlcmds + 32, 1);
  setLittleLong(buffer, ofsGlcmds + 36, 2);
  setLittleLong(buffer, ofsGlcmds + 40, 0);

  return buffer;
}

function writeVertex(buffer: Uint8Array, offset: number, position: [number, number, number], normalIndex: number): void {
  setUnsignedByte(buffer, offset + 0, position[0]);
  setUnsignedByte(buffer, offset + 1, position[1]);
  setUnsignedByte(buffer, offset + 2, position[2]);
  setUnsignedByte(buffer, offset + 3, normalIndex);
}

function createSolidPcx(red: number, green: number, blue: number): Uint8Array {
  const bytes = new Uint8Array(128 + 1 + 769);
  bytes[0] = 0x0a;
  bytes[1] = 5;
  bytes[2] = 1;
  bytes[3] = 8;
  setLittleShort(bytes, 4, 0);
  setLittleShort(bytes, 6, 0);
  setLittleShort(bytes, 8, 0);
  setLittleShort(bytes, 10, 0);
  setLittleShort(bytes, 12, 1);
  setLittleShort(bytes, 14, 1);
  bytes[65] = 1;
  setLittleShort(bytes, 66, 1);
  bytes[128] = 7;
  bytes[129] = 0x0c;
  bytes[130 + 7 * 3 + 0] = red;
  bytes[130 + 7 * 3 + 1] = green;
  bytes[130 + 7 * 3 + 2] = blue;
  return bytes;
}

function writeCString(buffer: Uint8Array, offset: number, maxLength: number, value: string): void {
  for (let index = 0; index < maxLength; index += 1) {
    buffer[offset + index] = 0;
  }

  for (let index = 0; index < value.length && index < maxLength - 1; index += 1) {
    buffer[offset + index] = value.charCodeAt(index);
  }
}
