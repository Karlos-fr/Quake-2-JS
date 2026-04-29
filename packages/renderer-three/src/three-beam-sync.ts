/**
 * File: three-beam-sync.ts
 * Purpose: Synchronize client refresh beams into Three.js through the ported `ref_gl` `R_DrawBeam` path.
 *
 * This file is not a direct source port.
 * It is an adapter layer for `gl_rmain.c` beam output.
 *
 * Dependencies:
 * - packages/client/src/ref.ts
 * - packages/client/src/refresh.ts
 * - packages/filesystem
 * - packages/formats
 * - packages/qcommon
 * - packages/renderer-three/src/gl_rmain.ts
 * - three
 */

import { createEntity, type entity_t } from "../../client/src/ref.js";
import type { ClientRefreshFrame } from "../../client/src/refresh.js";
import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parsePcx } from "../../formats/src/index.js";
import { RF_BEAM } from "../../qcommon/src/index.js";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineSegments
} from "three";
import {
  R_DrawBeam,
  createGlRmainRuntime,
  setRmainPaletteTable,
  type GlRmainBeamSegment
} from "./gl_rmain.js";

export interface ThreeBeamSync {
  root: Group;
  apply: (refreshFrame: ClientRefreshFrame | null) => number;
  dispose: () => void;
}

type BeamEntity = entity_t & {
  userData: {
    beamKind: NonNullable<ClientRefreshFrame>["beams"][number]["kind"];
    model: string | null;
    part: number;
    partCount: number;
  };
};

/**
 * Category: New
 * Purpose: Create the Three.js adapter that consumes `R_DrawBeam` output for refresh beams and lasers.
 */
export function createThreeBeamSync(filesystem: VirtualFilesystem): ThreeBeamSync {
  const root = new Group();
  root.name = "refresh-beams-ref-gl";

  const runtime = createGlRmainRuntime();
  setRmainPaletteTable(runtime, loadPaletteTable(filesystem));

  let emittedBeams: Array<{
    entity: BeamEntity;
    color: [number, number, number];
    segments: GlRmainBeamSegment[];
  }> = [];

  runtime.hooks.onDrawBeam = (entity, color, segments) => {
    emittedBeams.push({
      entity: entity as BeamEntity,
      color,
      segments
    });
  };

  return {
    root,
    apply: (refreshFrame) => {
      clearGroup(root);
      emittedBeams = [];

      if (!refreshFrame || refreshFrame.beams.length === 0) {
        return 0;
      }

      for (const beam of refreshFrame.beams) {
        for (const entity of createBeamEntities(beam)) {
          R_DrawBeam(runtime, entity);
        }
      }

      for (let index = 0; index < emittedBeams.length; index += 1) {
        const beam = emittedBeams[index];
        const line = createBeamLineSegments(beam.segments, beam.color, beam.entity.alpha);
        line.name = `ref-gl-beam:${index}`;
        line.userData.refGl = {
          source: "R_DrawBeam",
          segmentCount: beam.segments.length,
          skinnum: beam.entity.skinnum,
          frame: beam.entity.frame,
          alpha: beam.entity.alpha,
          beamKind: beam.entity.userData?.beamKind,
          model: beam.entity.userData?.model ?? null,
          part: beam.entity.userData?.part ?? 0,
          partCount: beam.entity.userData?.partCount ?? 1
        };
        root.add(line);
      }

      return emittedBeams.length;
    },
    dispose: () => {
      clearGroup(root);
    }
  };
}

function createBeamEntities(beam: NonNullable<ClientRefreshFrame>["beams"][number]): entity_t[] {
  if (beam.kind === "laser" || !beam.model || beam.specialLightningShort) {
    return [createBeamEntity(beam, beam.start, beam.end, 0, 1)];
  }

  const direction = subtractVec3(beam.end, beam.origin);
  const totalLength = vectorLength(direction);
  if (totalLength <= 0) {
    return [];
  }

  const stepLength = Math.max(1, beam.segmentLength);
  const partCount = Math.max(1, Math.ceil(totalLength / stepLength));
  const normal = scaleVec3(direction, 1 / totalLength);
  const entities: entity_t[] = [];

  for (let part = 0; part < partCount; part += 1) {
    const startDistance = part * stepLength;
    const endDistance = Math.min(totalLength, startDistance + stepLength);
    const start = addScaledVec3(beam.origin, normal, startDistance);
    const end = addScaledVec3(beam.origin, normal, endDistance);
    entities.push(createBeamEntity(beam, start, end, part, partCount));
  }

  return entities;
}

function createBeamEntity(
  beam: NonNullable<ClientRefreshFrame>["beams"][number],
  start: readonly [number, number, number],
  end: readonly [number, number, number],
  part: number,
  partCount: number
): BeamEntity {
  const entity = createEntity() as BeamEntity;
  entity.origin = [start[0], start[1], start[2]];
  entity.oldorigin = [end[0], end[1], end[2]];
  entity.frame = beam.frame > 0 ? beam.frame : Math.max(4, Math.min(16, beam.segmentLength * 0.2));
  entity.skinnum = beam.skinnum & 0xff;
  entity.alpha = beam.alpha > 0 ? beam.alpha : 1;
  entity.flags = beam.flags | RF_BEAM;
  entity.userData = {
    beamKind: beam.kind,
    model: beam.model,
    part,
    partCount
  };
  return entity;
}

function createBeamLineSegments(
  segments: readonly GlRmainBeamSegment[],
  color: [number, number, number],
  alpha: number
): LineSegments<BufferGeometry, LineBasicMaterial> {
  const positions: number[] = [];
  for (let index = 0; index < segments.length; index += 1) {
    const current = segments[index];
    const next = segments[(index + 1) % segments.length];
    if (!current || !next) {
      continue;
    }

    pushLine(positions, current.start, current.end);
    pushLine(positions, current.start, next.start);
    pushLine(positions, current.end, next.end);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  const material = new LineBasicMaterial({
    color: 0xffffff,
    transparent: alpha < 1,
    opacity: Math.max(0, Math.min(1, alpha)),
    depthTest: true,
    depthWrite: false
  });
  material.color.setRGB(color[0], color[1], color[2]);

  const line = new LineSegments(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 30;
  return line;
}

function pushLine(target: number[], start: readonly [number, number, number], end: readonly [number, number, number]): void {
  target.push(start[0], start[1], start[2], end[0], end[1], end[2]);
}

function subtractVec3(a: readonly [number, number, number], b: readonly [number, number, number]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function addScaledVec3(base: readonly [number, number, number], direction: readonly [number, number, number], scale: number): [number, number, number] {
  return [
    base[0] + direction[0] * scale,
    base[1] + direction[1] * scale,
    base[2] + direction[2] * scale
  ];
}

function scaleVec3(vector: readonly [number, number, number], scalar: number): [number, number, number] {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function vectorLength(vector: readonly [number, number, number]): number {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}

function clearGroup(group: Group): void {
  for (const child of [...group.children]) {
    group.remove(child);
    if (child instanceof LineSegments) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        material.dispose();
      }
    }
  }
}

function loadPaletteTable(filesystem: VirtualFilesystem): Uint32Array {
  const paletteFile = readMountedFile(filesystem, "pics/colormap.pcx");
  if (!paletteFile) {
    return createFallbackPaletteTable();
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
    return createFallbackPaletteTable();
  }
}

function createFallbackPaletteTable(): Uint32Array {
  return Uint32Array.from({ length: 256 }, (_, index) => (((255 << 24) >>> 0) | (index << 16) | (index << 8) | index) >>> 0);
}
