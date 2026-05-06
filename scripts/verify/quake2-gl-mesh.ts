/**
 * File: quake2-gl-mesh.ts
 * Purpose: Verify core alias-model helpers ported from `ref_gl/gl_mesh.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for alias shading and frame lerp behavior.
 *
 * Dependencies:
 * - packages/formats
 * - packages/renderer-three
 * - three
 */

import { strict as assert } from "node:assert";
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import {
  BYTE_DIRS,
  NUMVERTEXNORMALS as QCOMMON_NUMVERTEXNORMALS,
  RDF_IRGOGGLES,
  RF_FULLBRIGHT,
  RF_GLOW,
  RF_IR_VISIBLE,
  RF_MINLIGHT,
  RF_SHELL_BLUE,
  RF_SHELL_DOUBLE,
  RF_SHELL_GREEN,
  RF_SHELL_HALF_DAM,
  RF_SHELL_RED
} from "../../packages/qcommon/src/index.js";
import type { cplane_t } from "../../packages/qcommon/src/index.js";
import type { Md2Model, dmdl_t, daliasframe_t } from "../../packages/formats/src/index.js";
import {
  GL_DrawAliasShadow,
  NUMVERTEXNORMALS,
  R_CullAliasModel,
  applyMd2AliasFrameLerp,
  buildAliasShadeVector,
  buildAliasShellShadeLight,
  buildAliasVertexColors,
  computeAliasShadeLight,
  computeAliasWeaponLightLevel,
  getAliasShadedotsForYaw,
  SHADEDOT_QUANT,
  sanitizeAliasFramePair,
  type Md2MeshInstance
} from "../../packages/renderer-three/src/index.js";

main();

function main(): void {
  verifyAliasConstantsAndTables();
  verifyAliasLerpWithoutShell();
  verifyAliasLerpWithShellOffset();
  verifyAliasShellShadeLightCombinations();
  verifyAliasShadeLightGlowAndIr();
  verifyAliasShadeLightFullbrightAndMinlight();
  verifyAliasShadeLightMonolightmapAndWeaponLevel();
  verifyAliasShadeVector();
  verifyAliasVertexColorsFromShadedots();
  verifyAliasFramePairSanitization();
  verifyAliasCullModel();
  verifyAliasShadowProjection();
  console.log("quake2-gl-mesh: ok");
}

function verifyAliasConstantsAndTables(): void {
  assert.equal(NUMVERTEXNORMALS, 162, "NUMVERTEXNORMALS mismatch");
  assert.equal(NUMVERTEXNORMALS, QCOMMON_NUMVERTEXNORMALS, "NUMVERTEXNORMALS shared alias normal count mismatch");
  assert.equal(BYTE_DIRS.length, NUMVERTEXNORMALS, "r_avertexnormals length mismatch");
  assert.equal(SHADEDOT_QUANT, 16, "SHADEDOT_QUANT mismatch");
  assert.equal(getAliasShadedotsForYaw(0), getAliasShadedotsForYaw(360), "shadedots yaw wrap mismatch");
  assert.equal(getAliasShadedotsForYaw(90), getAliasShadedotsForYaw(90 + 360), "shadedots positive yaw wrap mismatch");
}

function verifyAliasLerpWithoutShell(): void {
  const meshInstance = createSingleVertexMeshInstance();
  applyMd2AliasFrameLerp(meshInstance, {
    frame: 0,
    oldframe: 1,
    backlerp: 0.25,
    flags: 0,
    origin: [10, 20, 30],
    oldorigin: [10, 20, 30],
    angles: [0, 0, 0]
  });

  const position = getPosition(meshInstance);
  assert.ok(Math.abs(position[0] - 11) < 0.0001, `unexpected x without shell: ${position[0]}`);
  assert.ok(Math.abs(position[1] - 23.25) < 0.0001, `unexpected y without shell: ${position[1]}`);
  assert.ok(Math.abs(position[2] - 37.5) < 0.0001, `unexpected z without shell: ${position[2]}`);
}

function verifyAliasLerpWithShellOffset(): void {
  const meshInstance = createSingleVertexMeshInstance();
  applyMd2AliasFrameLerp(meshInstance, {
    frame: 0,
    oldframe: 1,
    backlerp: 0.25,
    flags: RF_SHELL_RED,
    origin: [10, 20, 30],
    oldorigin: [10, 20, 30],
    angles: [0, 0, 0]
  });

  const position = getPosition(meshInstance);
  assert.ok(Math.abs(position[0] - 11) < 0.0001, `unexpected shell x: ${position[0]}`);
  assert.ok(Math.abs(position[1] - 23.25) < 0.0001, `unexpected shell y: ${position[1]}`);
  assert.ok(Math.abs(position[2] - 41.5) < 0.0001, `unexpected shell z: ${position[2]}`);
}

function verifyAliasShellShadeLightCombinations(): void {
  assert.deepEqual(buildAliasShellShadeLight(RF_SHELL_RED | RF_SHELL_GREEN | RF_SHELL_BLUE), [1, 1, 1], "godmode shell color mismatch");
  assert.deepEqual(buildAliasShellShadeLight(RF_SHELL_RED | RF_SHELL_DOUBLE), [1, 0, 1], "red double shell color mismatch");
  assert.deepEqual(buildAliasShellShadeLight(RF_SHELL_BLUE | RF_SHELL_DOUBLE), [0, 1, 1], "blue double shell color mismatch");
  assert.deepEqual(buildAliasShellShadeLight(RF_SHELL_DOUBLE), [0.9, 0.7, 0], "double shell color mismatch");
  assert.deepEqual(buildAliasShellShadeLight(RF_SHELL_HALF_DAM), [0.56, 0.59, 0.45], "half-damage shell color mismatch");
  assert.deepEqual(buildAliasShellShadeLight(RF_SHELL_HALF_DAM | RF_SHELL_GREEN), [0.56, 1, 0.45], "half-damage green shell color mismatch");
}

function verifyAliasShadeLightGlowAndIr(): void {
  const shade = computeAliasShadeLight({
    flags: RF_GLOW,
    rdflags: 0,
    timeSeconds: 0.5,
    baseShadeLight: [1, 1, 1]
  });
  const pulse = 0.1 * Math.sin(0.5 * 7);
  const expectedGlowComponent = pulse < -0.2 ? 0.8 : 1 + pulse;
  assert.ok(Math.abs(shade[0] - expectedGlowComponent) < 0.0001, "RF_GLOW mismatch");

  const irShade = computeAliasShadeLight({
    flags: RF_IR_VISIBLE | RF_GLOW,
    rdflags: RDF_IRGOGGLES,
    timeSeconds: 2,
    baseShadeLight: [0.2, 0.3, 0.4]
  });
  assert.deepEqual(irShade, [1, 0, 0], "IR goggles override mismatch");
}

function verifyAliasShadeLightFullbrightAndMinlight(): void {
  assert.deepEqual(
    computeAliasShadeLight({
      flags: RF_FULLBRIGHT,
      rdflags: 0,
      timeSeconds: 0,
      baseShadeLight: [0.2, 0.3, 0.4]
    }),
    [1, 1, 1],
    "RF_FULLBRIGHT mismatch"
  );
  assert.deepEqual(
    computeAliasShadeLight({
      flags: RF_MINLIGHT,
      rdflags: 0,
      timeSeconds: 0,
      baseShadeLight: [0.02, 0.03, 0.04]
    }),
    [0.1, 0.1, 0.1],
    "RF_MINLIGHT floor mismatch"
  );
  assert.deepEqual(
    computeAliasShadeLight({
      flags: RF_MINLIGHT,
      rdflags: 0,
      timeSeconds: 0,
      baseShadeLight: [0.02, 0.3, 0.04]
    }),
    [0.02, 0.3, 0.04],
    "RF_MINLIGHT should not override a lit component"
  );
}

function verifyAliasShadeLightMonolightmapAndWeaponLevel(): void {
  const shade = computeAliasShadeLight({
    flags: 0,
    rdflags: 0,
    timeSeconds: 0,
    baseShadeLight: [0.2, 0.6, 0.4],
    monoLightmapMode: "A"
  });
  assert.deepEqual(shade, [0.6, 0.6, 0.6], "gl_monolightmap grayscale mismatch");
  assert.equal(computeAliasWeaponLightLevel(shade), 90, "weapon r_lightlevel mismatch");
}

function verifyAliasShadeVector(): void {
  const shadevector = buildAliasShadeVector(90);
  const invSqrt2 = 1 / Math.sqrt(2);
  assert.ok(Math.abs(shadevector[0]) < 0.0001, "shadevector x mismatch");
  assert.ok(Math.abs(shadevector[1] + invSqrt2) < 0.0001, "shadevector y mismatch");
  assert.ok(Math.abs(shadevector[2] - invSqrt2) < 0.0001, "shadevector z mismatch");
}

function verifyAliasVertexColorsFromShadedots(): void {
  const meshInstance = createSingleVertexMeshInstance();
  const shadelight: [number, number, number] = [0.5, 0.25, 1];
  const colors = buildAliasVertexColors(meshInstance.model, 0, meshInstance.vertexIndices, 90, shadelight);
  const normalIndex = meshInstance.model.frames[0].verts[0].lightnormalindex;
  const l = getAliasShadedotsForYaw(90)[normalIndex];

  assert.ok(Math.abs(colors[0] - l * shadelight[0]) < 0.0001, "alias vertex color r mismatch");
  assert.ok(Math.abs(colors[1] - l * shadelight[1]) < 0.0001, "alias vertex color g mismatch");
  assert.ok(Math.abs(colors[2] - l * shadelight[2]) < 0.0001, "alias vertex color b mismatch");
}

function verifyAliasFramePairSanitization(): void {
  assert.deepEqual(
    sanitizeAliasFramePair(1, 0, 2),
    { frame: 1, oldframe: 0, corrected: false },
    "valid alias frame pair should stay unchanged"
  );
  assert.deepEqual(
    sanitizeAliasFramePair(9, 0, 2),
    { frame: 0, oldframe: 0, corrected: true },
    "invalid frame should zero both frame and oldframe"
  );
  assert.deepEqual(
    sanitizeAliasFramePair(0, -1, 2),
    { frame: 0, oldframe: 0, corrected: true },
    "invalid oldframe should zero both frame and oldframe"
  );
}

function verifyAliasCullModel(): void {
  const meshInstance = createSingleVertexMeshInstance();
  const frustum = createTestFrustum();

  const visible = R_CullAliasModel(
    meshInstance.model,
    {
      origin: [100, 0, 0],
      angles: [0, 0, 0],
      frame: 0,
      oldframe: 1
    },
    frustum
  );
  assert.equal(visible.culled, false, "expected visible alias model");
  assert.equal(visible.bbox.length, 8, "expected 8 bbox corners");

  const hidden = R_CullAliasModel(
    meshInstance.model,
    {
      origin: [-800, 0, 0],
      angles: [0, 0, 0],
      frame: 0,
      oldframe: 1
    },
    frustum
  );
  assert.equal(hidden.culled, true, "expected culled alias model");

  const cullFrameReset = R_CullAliasModel(
    meshInstance.model,
    {
      origin: [0, 0, 0],
      angles: [0, 0, 0],
      frame: 99,
      oldframe: 1
    },
    frustum
  );
  assert.deepEqual(
    cullFrameReset.bbox[7],
    [0, 0, 0],
    "R_CullAliasModel should reset only invalid frame, not oldframe"
  );
}

function verifyAliasShadowProjection(): void {
  const projected = GL_DrawAliasShadow(
    new Float32Array([10, 20, 30]),
    [0.6, 0.8, 0],
    100
  );

  assert.ok(Math.abs(projected[0] - (10 - 0.6 * 130)) < 0.0001, "shadow x mismatch");
  assert.ok(Math.abs(projected[1] - (20 - 0.8 * 130)) < 0.0001, "shadow y mismatch");
  assert.ok(Math.abs(projected[2] - (-99)) < 0.0001, "shadow z mismatch");
}

function createSingleVertexMeshInstance(): Md2MeshInstance {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(3), 3));
  const mesh = new Mesh(geometry, new MeshBasicMaterial());

  const frameCurrent = createFrame({
    scale: [2, 3, 4],
    translate: [10, 20, 30],
    v: [1, 2, 3],
    lightnormalindex: 5
  });
  const frameOld = createFrame({
    scale: [2, 3, 4],
    translate: [0, 0, 0],
    v: [4, 5, 6],
    lightnormalindex: 5
  });

  const model: Md2Model = {
    header: createHeader(),
    skins: [],
    st: [],
    triangles: [],
    frames: [frameCurrent, frameOld],
    glcmds: new Int32Array()
  };

  return {
    mesh,
    model,
    skinTexture: null,
    vertexIndices: new Uint32Array([0])
  };
}

function createFrame(options: {
  scale: [number, number, number];
  translate: [number, number, number];
  v: [number, number, number];
  lightnormalindex: number;
}): daliasframe_t {
  const positions = new Float32Array(3);
  positions[0] = options.v[0] * options.scale[0] + options.translate[0];
  positions[1] = options.v[1] * options.scale[1] + options.translate[1];
  positions[2] = options.v[2] * options.scale[2] + options.translate[2];

  return {
    scale: [...options.scale],
    translate: [...options.translate],
    name: "f",
    verts: [{ v: [...options.v], lightnormalindex: options.lightnormalindex }],
    positions
  };
}

function createHeader(): dmdl_t {
  return {
    ident: 0,
    version: 8,
    skinwidth: 0,
    skinheight: 0,
    framesize: 0,
    num_skins: 0,
    num_xyz: 1,
    num_st: 0,
    num_tris: 0,
    num_glcmds: 0,
    num_frames: 2,
    ofs_skins: 0,
    ofs_st: 0,
    ofs_tris: 0,
    ofs_frames: 0,
    ofs_glcmds: 0,
    ofs_end: 0
  };
}

function getPosition(meshInstance: Md2MeshInstance): [number, number, number] {
  const positionAttribute = meshInstance.mesh.geometry.getAttribute("position") as BufferAttribute;
  return [positionAttribute.array[0], positionAttribute.array[1], positionAttribute.array[2]];
}

function createTestFrustum(): [cplane_t, cplane_t, cplane_t, cplane_t] {
  return [
    createPlane([1, 0, 0], 0),
    createPlane([-1, 0, 0], -1000),
    createPlane([0, 1, 0], -1000),
    createPlane([0, -1, 0], -1000)
  ];
}

function createPlane(normal: [number, number, number], dist: number): cplane_t {
  return {
    normal,
    dist,
    type: 5,
    signbits: 0,
    pad: [0, 0]
  };
}
