/**
 * File: particle-sync.ts
 * Purpose: Synchronize Quake II client refresh particles into WebGPU-capable Three.js instanced point sprites.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the client refresh frame and the Three.js backend.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/formats
 * - packages/qcommon
 * - packages/renderer-three/src/gl_rmain.ts
 * - three
 */

import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parsePcx } from "../../formats/src/index.js";
import { createRefDef, MAX_PARTICLES } from "../../client/src/ref.js";
import type { ClientRefreshFrame } from "../../client/src/refresh.js";
import { AngleVectors } from "../../qcommon/src/index.js";
import {
  DynamicDrawUsage,
  Group,
  InstancedBufferAttribute,
  Sprite,
  SpriteMaterial
} from "three";
import { PointsNodeMaterial } from "three/webgpu";
import { instancedDynamicBufferAttribute } from "three/tsl";
import {
  createGlRmainRuntime,
  R_DrawParticles,
  setRmainPaletteTable,
  setRmainParticleTexture
} from "./gl_rmain.js";

export interface ThreeParticleSync {
  root: Group;
  apply: (refreshFrame: ClientRefreshFrame | null) => number;
}

export interface ThreeParticleSyncOptions {
  particleSize?: number;
  particleMinSize?: number;
  particleMaxSize?: number;
  particleAttenuation?: [number, number, number];
  getViewportSize?: () => { width: number; height: number };
}

/**
 * Category: New
 * Purpose: Build one Three.js adapter that renders client refresh particles through the WebGPU sprite-instancing path.
 *
 * Constraints:
 * - Must reuse `R_DrawParticles` instead of inventing a parallel particle layout.
 * - Must tolerate missing palette assets by falling back to a grayscale table.
 */
export function createThreeParticleSync(filesystem: VirtualFilesystem, options: ThreeParticleSyncOptions = {}): ThreeParticleSync {
  const root = new Group();
  root.name = "refresh-particles";
  const particleSize = options.particleSize ?? 40;
  const particleMinSize = options.particleMinSize ?? 2;
  const particleMaxSize = options.particleMaxSize ?? Math.max(40, particleSize);
  const particleAttenuation = options.particleAttenuation ?? [0.01, 0, 0.01];

  const positionAttribute = new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3);
  const sizeAttribute = new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 2), 2);
  const colorAttribute = new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3);
  const alphaAttribute = new InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1);
  positionAttribute.setUsage(DynamicDrawUsage);
  sizeAttribute.setUsage(DynamicDrawUsage);
  colorAttribute.setUsage(DynamicDrawUsage);
  alphaAttribute.setUsage(DynamicDrawUsage);

  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    fog: false,
    sizeAttenuation: false
  });
  material.positionNode = instancedDynamicBufferAttribute(positionAttribute, "vec3");
  material.sizeNode = instancedDynamicBufferAttribute(sizeAttribute, "vec2");
  material.colorNode = instancedDynamicBufferAttribute(colorAttribute, "vec3");
  material.opacityNode = instancedDynamicBufferAttribute(alphaAttribute, "float");
  material.toneMapped = false;
  material.alphaToCoverage = false;

  const particleSprite = new Sprite(material as unknown as SpriteMaterial);
  particleSprite.name = "refresh-particles:webgpu-instanced-sprite";
  particleSprite.count = 0;
  particleSprite.visible = false;
  particleSprite.frustumCulled = false;
  particleSprite.renderOrder = 20;
  root.add(particleSprite);

  const runtime = createGlRmainRuntime();
  const paletteTable = loadPaletteTable(filesystem);
  setRmainPaletteTable(runtime, paletteTable);
  setRmainParticleTexture(runtime, { name: "***particle***" } as never);
  runtime.gl_ext_pointparameters = createRuntimeCvar("gl_ext_pointparameters", 1);
  runtime.gl_particle_size = createRuntimeCvar("gl_particle_size", particleSize);
  runtime.gl_particle_min_size = createRuntimeCvar("gl_particle_min_size", particleMinSize);
  runtime.gl_particle_max_size = createRuntimeCvar("gl_particle_max_size", particleMaxSize);
  runtime.gl_particle_att_a = createRuntimeCvar("gl_particle_att_a", particleAttenuation[0]);
  runtime.gl_particle_att_b = createRuntimeCvar("gl_particle_att_b", particleAttenuation[1]);
  runtime.gl_particle_att_c = createRuntimeCvar("gl_particle_att_c", particleAttenuation[2]);
  runtime.qglPointParameterfEXT = true;

  let capturedCount = 0;

  runtime.hooks.onDrawPointParticles = (particles) => {
    const positions = positionAttribute.array as Float32Array;
    const sizes = sizeAttribute.array as Float32Array;
    const colors = colorAttribute.array as Float32Array;
    const alphas = alphaAttribute.array as Float32Array;

    capturedCount = Math.min(particles.length, MAX_PARTICLES);
    for (let index = 0; index < capturedCount; index += 1) {
      const particle = particles[index];
      if (!particle) {
        continue;
      }

      let distance =
        (particle.position[0] - runtime.r_origin[0]) * runtime.vpn[0] +
        (particle.position[1] - runtime.r_origin[1]) * runtime.vpn[1] +
        (particle.position[2] - runtime.r_origin[2]) * runtime.vpn[2];
      distance = Math.max(1, distance);

      const positionOffset = index * 3;
      positions[positionOffset] = particle.position[0];
      positions[positionOffset + 1] = particle.position[1];
      positions[positionOffset + 2] = particle.position[2];

      const attenuatedSize = computePointParameterSize(runtime, particle.size, distance);
      const sizeOffset = index * 2;
      sizes[sizeOffset] = attenuatedSize;
      sizes[sizeOffset + 1] = attenuatedSize;

      const colorOffset = index * 3;
      colors[colorOffset] = clamp01(particle.color[0]);
      colors[colorOffset + 1] = clamp01(particle.color[1]);
      colors[colorOffset + 2] = clamp01(particle.color[2]);
      alphas[index] = clamp01(particle.color[3]);
    }

    particleSprite.count = capturedCount;
    particleSprite.visible = capturedCount > 0;
    positionAttribute.needsUpdate = true;
    sizeAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    alphaAttribute.needsUpdate = true;
  };

  return {
    root,
    apply: (refreshFrame) => {
      if (!refreshFrame || refreshFrame.particles.length === 0) {
        particleSprite.count = 0;
        particleSprite.visible = false;
        return 0;
      }

      const vectors = AngleVectors(refreshFrame.view.viewangles);
      runtime.r_origin = [...refreshFrame.view.vieworg];
      runtime.vpn = [...vectors.forward];
      runtime.vup = [...vectors.up];
      runtime.vright = [...vectors.right];
      capturedCount = 0;

      const refdef = createRefDef();
      refdef.fov_x = refreshFrame.view.fov_x;
      refdef.num_particles = refreshFrame.particles.length;
      refdef.particles = refreshFrame.particles.map((particle) => ({
        origin: [...particle.origin],
        color: particle.color,
        alpha: particle.alpha
      }));
      runtime.r_newrefdef = refdef;

      R_DrawParticles(runtime);

      return capturedCount;
    }
  };
}

function computePointParameterSize(
  runtime: ReturnType<typeof createGlRmainRuntime>,
  baseSize: number,
  distance: number
): number {
  const attA = runtime.gl_particle_att_a?.value ?? 0.01;
  const attB = runtime.gl_particle_att_b?.value ?? 0;
  const attC = runtime.gl_particle_att_c?.value ?? 0.01;
  const minSize = runtime.gl_particle_min_size?.value ?? 2;
  const maxSize = runtime.gl_particle_max_size?.value ?? 40;
  const attenuation = attA + attB * distance + attC * distance * distance;
  const attenuatedSize = attenuation > 0 ? baseSize / Math.sqrt(attenuation) : baseSize;

  return Math.max(minSize, Math.min(maxSize, attenuatedSize));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function createRuntimeCvar(name: string, value: number) {
  return {
    name,
    string: String(value),
    latched_string: null,
    flags: 0,
    modified: false,
    value
  };
}

function loadPaletteTable(filesystem: VirtualFilesystem): Uint32Array {
  const paletteFile = readMountedFile(filesystem, "pics/colormap.pcx");
  if (!paletteFile) {
    return Uint32Array.from({ length: 256 }, (_, index) => (((255 << 24) >>> 0) | (index << 16) | (index << 8) | index) >>> 0);
  }

  try {
    const palette = parsePcx(paletteFile.bytes, paletteFile.path).paletteRgb;
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      const r = palette[index * 3] ?? 0;
      const g = palette[index * 3 + 1] ?? 0;
      const b = palette[index * 3 + 2] ?? 0;
      table[index] = (((255 << 24) >>> 0) | (b << 16) | (g << 8) | r) >>> 0;
    }
    table[255] &= 0x00ffffff;
    return table;
  } catch {
    return Uint32Array.from({ length: 256 }, (_, index) => (((255 << 24) >>> 0) | (index << 16) | (index << 8) | index) >>> 0);
  }
}
