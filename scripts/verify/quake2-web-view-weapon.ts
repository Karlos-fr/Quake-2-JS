/**
 * File: quake2-web-view-weapon.ts
 * Purpose: Verify the browser-side first-person weapon bridge from the client refresh frame into the Three.js refresh-entity sync.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the weapon view-model integration closed in phase 4.2.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/client
 * - packages/qcommon
 * - packages/renderer-three
 * - three
 */

import { strict as assert } from "node:assert";
import { PerspectiveCamera, BufferAttribute, Mesh } from "three";

import { createVirtualFilesystem, mountDirectory } from "../../packages/filesystem/src/index.js";
import { createClientRuntime, type ClientRefreshFrame } from "../../packages/client/src/index.js";
import { ALIAS_VERSION, IDALIASHEADER } from "../../packages/formats/src/index.js";
import { setLittleFloat, setLittleLong, setLittleShort, setUnsignedByte } from "../../packages/memory/src/binary-io.js";
import { CS_MODELS, RF_DEPTHHACK, RF_MINLIGHT, RF_TRANSLUCENT, RF_WEAPONMODEL } from "../../packages/qcommon/src/index.js";
import { createThreeRefreshEntitySync } from "../../packages/renderer-three/src/index.js";

main();

function main(): void {
  const filesystem = createVirtualFilesystem();
  mountDirectory(filesystem, "baseq2", {
    "models/weapons/v_test/tris.md2": createAliasBuffer(
      [
        "models/weapons/v_test/skin0.pcx",
        "models/weapons/v_test/skin1.pcx"
      ],
      [
        [[0, 0, 0], [8, 0, 0], [0, 8, 0]],
        [[0, 0, 0], [12, 0, 0], [0, 12, 0]]
      ]
    ),
    "models/weapons/v_test/skin0.pcx": createSolidPcx(255, 32, 16),
    "models/weapons/v_test/skin1.pcx": createSolidPcx(32, 255, 16),
    "models/debug/tris.md2": createAliasBuffer(
      ["models/debug/skin0.pcx"],
      [
        [[0, 0, 0], [20, 0, 0], [0, 20, 0]]
      ]
    ),
    "models/debug/skin0.pcx": createSolidPcx(16, 32, 255)
  });

  const runtime = createClientRuntime();
  runtime.cl.configstrings[CS_MODELS + 1] = "models/weapons/v_test/tris.md2";

  const sync = createThreeRefreshEntitySync(filesystem);
  const camera = new PerspectiveCamera(90, 1, 0.1, 1000);
  sync.attachToCamera(camera);
  let sampledOrigin: [number, number, number] | null = null;
  sync.setAliasLightSampler((origin) => {
    sampledOrigin = [origin[0], origin[1], origin[2]];
    return [0.25, 0.5, 1];
  });

  const firstFrame = createWeaponRefreshFrame();
  const firstStats = sync.apply(runtime, firstFrame);
  assert.equal(firstStats.renderedEntities, 1, "first-person weapon renderedEntities mismatch");
  assert.equal(sync.root.userData.refGl?.source, "R_DrawEntitiesOnList", "weapon dispatch source mismatch");
  assert.equal(sync.root.userData.refGl?.queuedEntities, 1, "weapon queued entity count mismatch");
  assert.equal(sync.root.children.length, 0, "weapon model must stay out of the world root");
  assert.equal(sync.viewWeaponRoot.children.length, 1, "weapon model must attach under the camera root");

  const firstRoot = sync.viewWeaponRoot.children[0];
  assert.equal(firstRoot.parent, sync.viewWeaponRoot, "weapon root parent mismatch");
  assert.equal(firstRoot.position.x, -2, "weapon camera-local X mismatch");
  assert.equal(firstRoot.position.y, 5, "weapon camera-local Y mismatch");
  assert.equal(firstRoot.position.z, -1, "weapon camera-local Z mismatch");

  const firstMesh = firstRoot.children[0] as Mesh;
  const firstMaterialMap = ((firstMesh.material as { map?: unknown }).map ?? null);
  const firstTextureData = readTextureData(firstMaterialMap);
  assert.equal(firstTextureData[0], 255, "weapon skin intensity red mismatch");
  assert.equal(firstTextureData[1], 64, "weapon skin intensity green mismatch");
  assert.equal(firstTextureData[2], 32, "weapon skin intensity blue mismatch");
  assert.deepEqual(sampledOrigin, [11, 22, 35], "weapon alias light sampler origin mismatch");
  assert.equal((firstMesh.material as { depthTest?: boolean }).depthTest, false, "weapon depthhack depthTest mismatch");
  assert.equal((firstMesh.material as { depthWrite?: boolean }).depthWrite, false, "weapon depthhack depthWrite mismatch");
  assert.equal(firstMesh.renderOrder, 1000, "weapon depthhack renderOrder mismatch");
  const firstPositions = readPositions(firstMesh);
  assert.deepEqual(firstPositions, [0, 0, 0, 8, 0, 0, 0, 8, 0], "weapon frame-0 geometry mismatch");
  const firstColors = readColors(firstMesh);
  assert.equal(firstColors[0] > 0, true, "weapon sampled shadelight should affect vertex colors");
  assert.ok(Math.abs(firstColors[1] - firstColors[0] * 2) < 0.0001, "weapon sampled shadelight green ratio mismatch");
  assert.ok(Math.abs(firstColors[2] - firstColors[0] * 4) < 0.0001, "weapon sampled shadelight blue ratio mismatch");

  sync.setTextureLighting({ intensity: 3, gamma: 1 });
  sync.apply(runtime, firstFrame);
  const relitMesh = sync.viewWeaponRoot.children[0].children[0] as Mesh;
  const relitTextureData = readTextureData((relitMesh.material as { map?: unknown }).map ?? null);
  assert.equal(relitTextureData[0], 255, "weapon dynamic intensity red mismatch");
  assert.equal(relitTextureData[1], 96, "weapon dynamic intensity green mismatch");
  assert.equal(relitTextureData[2], 48, "weapon dynamic intensity blue mismatch");

  const animatedStats = sync.apply(runtime, createWeaponRefreshFrame({
    frame: 1,
    oldframe: 1,
    skinnum: 1
  }));
  assert.equal(animatedStats.renderedEntities, 1, "animated weapon renderedEntities mismatch");
  assert.equal(sync.viewWeaponRoot.children.length, 1, "animated weapon child count mismatch");

  const animatedRoot = sync.viewWeaponRoot.children[0];
  const animatedMesh = animatedRoot.children[0] as Mesh;
  const animatedMaterialMap = ((animatedMesh.material as { map?: unknown }).map ?? null);
  const animatedPositions = readPositions(animatedMesh);
  assert.notEqual(animatedRoot, firstRoot, "skinnum change must rebuild the weapon instance");
  assert.notEqual(animatedMaterialMap, firstMaterialMap, "weapon skin change must swap the active texture");
  assert.deepEqual(animatedPositions, [0, 0, 0, 12, 0, 0, 0, 12, 0], "weapon frame-1 geometry mismatch");

  const overrideStats = sync.apply(runtime, createWeaponRefreshFrame({
    resolvedModelPath: "models/debug/tris.md2"
  }));
  assert.equal(overrideStats.renderedEntities, 1, "override weapon renderedEntities mismatch");

  const overrideRoot = sync.viewWeaponRoot.children[0];
  const overrideMesh = overrideRoot.children[0] as Mesh;
  const overridePositions = readPositions(overrideMesh);
  assert.notEqual(overrideRoot, animatedRoot, "model override must rebuild the weapon instance");
  assert.deepEqual(overridePositions, [0, 0, 0, 20, 0, 0, 0, 20, 0], "resolvedModelPath override geometry mismatch");

  const translucentStats = sync.apply(runtime, createWeaponRefreshFrame({
    entityNumber: 2,
    flags: RF_TRANSLUCENT,
    alpha: 1,
    origin: [40, 0, 0],
    oldorigin: [40, 0, 0]
  }));
  assert.equal(translucentStats.renderedEntities, 1, "translucent alias renderedEntities mismatch");
  assert.equal(sync.root.children.length, 1, "translucent alias should attach to world root");
  assert.equal(sync.viewWeaponRoot.children.length, 0, "translucent alias should clear weapon root");
  const translucentRoot = sync.root.children[0];
  const translucentMesh = translucentRoot.children[0] as Mesh;
  assert.equal((translucentMesh.material as { transparent?: boolean }).transparent, true, "RF_TRANSLUCENT alias transparency mismatch");
  assert.equal((translucentMesh.material as { opacity?: number }).opacity, 1, "RF_TRANSLUCENT alias opacity mismatch");
  assert.equal((translucentMesh.material as { depthWrite?: boolean }).depthWrite, true, "RF_TRANSLUCENT alias depthWrite mismatch");

  console.log("quake2-web-view-weapon: ok");
}

function createWeaponRefreshFrame(overrides: Partial<ClientRefreshFrame["entities"][number]> = {}): ClientRefreshFrame {
  return {
    view: {
      vieworg: [10, 20, 30],
      viewangles: [1, 2, 3],
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
      origin: [11, 22, 35],
      oldorigin: [11, 22, 35],
      angles: [5, 15, 25],
      skinnum: 0,
      alpha: 1,
      flags: RF_MINLIGHT | RF_DEPTHHACK | RF_WEAPONMODEL,
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

function readColors(mesh: Mesh): number[] {
  const color = mesh.geometry.getAttribute("color") as BufferAttribute;
  return Array.from(color.array as Float32Array);
}

function readTextureData(map: unknown): Uint8Array {
  const data = (map as { image?: { data?: unknown } } | null)?.image?.data;
  assert.ok(data instanceof Uint8Array, "weapon skin texture data missing");
  return data;
}

function createAliasBuffer(
  skins: string[],
  frames: Array<Array<[number, number, number]>>
): Uint8Array {
  const numSkins = skins.length;
  const numXyz = 3;
  const numSt = 3;
  const numTris = 1;
  const numFrames = frames.length;
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

  for (let frameIndex = 0; frameIndex < frames.length; frameIndex += 1) {
    const frameOffset = ofsFrames + frameIndex * frameSize;
    setLittleFloat(buffer, frameOffset + 0, 1);
    setLittleFloat(buffer, frameOffset + 4, 1);
    setLittleFloat(buffer, frameOffset + 8, 1);
    setLittleFloat(buffer, frameOffset + 12, 0);
    setLittleFloat(buffer, frameOffset + 16, 0);
    setLittleFloat(buffer, frameOffset + 20, 0);
    writeCString(buffer, frameOffset + 24, 16, `frame${frameIndex}`);

    const verticesOffset = frameOffset + 40;
    for (let vertexIndex = 0; vertexIndex < numXyz; vertexIndex += 1) {
      const vertex = frames[frameIndex][vertexIndex];
      const offset = verticesOffset + vertexIndex * 4;
      setUnsignedByte(buffer, offset + 0, vertex[0]);
      setUnsignedByte(buffer, offset + 1, vertex[1]);
      setUnsignedByte(buffer, offset + 2, vertex[2]);
      setUnsignedByte(buffer, offset + 3, 0);
    }
  }

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
