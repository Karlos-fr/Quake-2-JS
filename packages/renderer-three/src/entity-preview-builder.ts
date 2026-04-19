/**
 * File: entity-preview-builder.ts
 * Purpose: Create a first visual preview layer for selected Quake II BSP entities using MD2 meshes.
 *
 * This file is not a direct source port.
 * It is an adapter layer between BSP entity definitions and the Three.js backend.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/formats
 * - packages/renderer-three
 * - three
 */

import { Group } from "three";
import type { VirtualFilesystem } from "../../filesystem/src/index.js";
import { getEntityOrigin, getEntityYaw, type BspEntity } from "../../formats/src/index.js";
import { applyMd2Frame, buildMd2Mesh, loadMd2Model, type Md2MeshInstance } from "./md2-mesh-builder.js";

interface EntityPreviewDefinition {
  modelPath: string;
  scale?: number;
  verticalOffset?: number;
  rotateYawSpeed?: number;
  bobAmplitude?: number;
  bobSpeed?: number;
  frameRange?: [number, number];
  frameRate?: number;
}

interface EntityPreviewBehavior {
  classname: string;
  basePositionZ: number;
  rotateYawSpeed: number;
  bobAmplitude: number;
  bobSpeed: number;
  frameRange: [number, number] | null;
  frameRate: number;
}

/**
 * Category: New
 * Purpose: Pair one MD2 mesh instance with the lightweight preview behavior derived from its BSP entity.
 *
 * Constraints:
 * - Must preserve both the mesh instance and the source classname for future specialization.
 */
export interface EntityPreviewInstance {
  md2: Md2MeshInstance;
  behavior: EntityPreviewBehavior;
}

/**
 * Category: New
 * Purpose: Hold the meshes created for one first-pass BSP entity preview layer.
 *
 * Constraints:
 * - Must preserve access to the instantiated MD2 meshes for future animation hooks.
 */
export interface EntityPreviewGroup {
  group: Group;
  instances: EntityPreviewInstance[];
  supportedEntityCount: number;
}

const ENTITY_MODEL_MAP: Record<string, EntityPreviewDefinition> = {
  item_armor_body: { modelPath: "models/items/armor/body/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_armor_combat: { modelPath: "models/items/armor/combat/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_armor_jacket: { modelPath: "models/items/armor/jacket/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_armor_shard: { modelPath: "models/items/armor/shard/tris.md2", rotateYawSpeed: 1.4, bobAmplitude: 5, bobSpeed: 2 },
  item_power_screen: { modelPath: "models/items/armor/screen/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 4, bobSpeed: 1.7 },
  item_power_shield: { modelPath: "models/items/armor/shield/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 4, bobSpeed: 1.7 },
  item_quad: { modelPath: "models/items/quaddama/tris.md2", rotateYawSpeed: 1.5, bobAmplitude: 5, bobSpeed: 2.2 },
  item_invulnerability: { modelPath: "models/items/invulner/tris.md2", rotateYawSpeed: 1.3, bobAmplitude: 5, bobSpeed: 2 },
  item_silencer: { modelPath: "models/items/silencer/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_breather: { modelPath: "models/items/breather/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_enviro: { modelPath: "models/items/enviro/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_ancient_head: { modelPath: "models/items/c_head/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_adrenaline: { modelPath: "models/items/adrenal/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_bandolier: { modelPath: "models/items/band/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  item_pack: { modelPath: "models/items/pack/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 4, bobSpeed: 1.8 },
  ammo_shells: { modelPath: "models/items/ammo/shells/medium/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 3, bobSpeed: 1.6 },
  ammo_bullets: { modelPath: "models/items/ammo/bullets/medium/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 3, bobSpeed: 1.6 },
  ammo_cells: { modelPath: "models/items/ammo/cells/medium/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 3, bobSpeed: 1.6 },
  ammo_rockets: { modelPath: "models/items/ammo/rockets/medium/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 3, bobSpeed: 1.6 },
  ammo_slugs: { modelPath: "models/items/ammo/slugs/medium/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 3, bobSpeed: 1.6 },
  ammo_grenades: { modelPath: "models/items/ammo/grenades/medium/tris.md2", rotateYawSpeed: 1.1, bobAmplitude: 3, bobSpeed: 1.6 },
  weapon_shotgun: { modelPath: "models/weapons/g_shotg/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_supershotgun: { modelPath: "models/weapons/g_shotg2/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_machinegun: { modelPath: "models/weapons/g_machn/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_chaingun: { modelPath: "models/weapons/g_chain/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_grenadelauncher: { modelPath: "models/weapons/g_launch/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_rocketlauncher: { modelPath: "models/weapons/g_rocket/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_hyperblaster: { modelPath: "models/weapons/g_hyperb/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_railgun: { modelPath: "models/weapons/g_rail/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  weapon_bfg: { modelPath: "models/weapons/g_bfg/tris.md2", rotateYawSpeed: 0.9, bobAmplitude: 3, bobSpeed: 1.4 },
  key_data_cd: { modelPath: "models/items/keys/data_cd/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  key_power_cube: { modelPath: "models/items/keys/power/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  key_pyramid: { modelPath: "models/items/keys/pyramid/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  key_data_spinner: { modelPath: "models/items/keys/spinner/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  key_pass: { modelPath: "models/items/keys/pass/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  key_blue_key: { modelPath: "models/items/keys/key/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  key_red_key: { modelPath: "models/items/keys/red_key/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  key_airstrike_target: { modelPath: "models/items/keys/target/tris.md2", rotateYawSpeed: 1.2, bobAmplitude: 3, bobSpeed: 1.8 },
  misc_banner: { modelPath: "models/objects/banner/tris.md2", verticalOffset: 64, frameRange: [0, 15], frameRate: 8 },
  misc_satellite_dish: { modelPath: "models/objects/satellite/tris.md2" },
  misc_teleporter: { modelPath: "models/objects/dmspot/tris.md2", rotateYawSpeed: 0.8, bobAmplitude: 2, bobSpeed: 2.6 },
  misc_teleporter_dest: { modelPath: "models/objects/dmspot/tris.md2", rotateYawSpeed: 0.4, bobAmplitude: 1.5, bobSpeed: 2.2 },
  misc_bigviper: { modelPath: "models/ships/bigviper/tris.md2" },
  misc_viper: { modelPath: "models/ships/viper/tris.md2" },
  misc_strogg_ship: { modelPath: "models/ships/strogg1/tris.md2" },
  light_mine1: { modelPath: "models/objects/minelite/light1/tris.md2" },
  light_mine2: { modelPath: "models/objects/minelite/light2/tris.md2" },
  item_health: { modelPath: "models/items/healing/medium/tris.md2" },
  item_health_small: { modelPath: "models/items/healing/stimpack/tris.md2" },
  item_health_large: { modelPath: "models/items/healing/large/tris.md2" },
  item_health_mega: { modelPath: "models/items/mega_h/tris.md2" }
};

/**
 * Category: New
 * Purpose: Build a first visible entity preview group from BSP entities supported by local MD2 mappings.
 *
 * Constraints:
 * - Must ignore unsupported entities without failing the whole preview.
 */
export function buildEntityPreviewGroup(filesystem: VirtualFilesystem, entities: BspEntity[]): EntityPreviewGroup {
  const group = new Group();
  const instances: EntityPreviewInstance[] = [];
  const modelCache = new Map<string, ReturnType<typeof loadMd2Model>>();
  let supportedEntityCount = 0;

  for (const entity of entities) {
    const classname = entity.properties.classname;
    if (!classname) {
      continue;
    }

    const definition = ENTITY_MODEL_MAP[classname];
    if (!definition) {
      continue;
    }

    const origin = getEntityOrigin(entity);
    if (!origin) {
      continue;
    }

    supportedEntityCount += 1;

    let model = modelCache.get(definition.modelPath);
    if (model === undefined) {
      model = loadMd2Model(filesystem, definition.modelPath);
      modelCache.set(definition.modelPath, model);
    }

    if (!model) {
      continue;
    }

    const instance = buildMd2Mesh(filesystem, model);
    instance.mesh.position.set(
      origin[0],
      origin[1],
      origin[2] + (definition.verticalOffset ?? 0)
    );
    instance.mesh.rotation.x = Math.PI / 2;
    instance.mesh.rotation.z = (getEntityYaw(entity) * Math.PI) / 180;
    instance.mesh.scale.setScalar(definition.scale ?? 1);
    instance.mesh.name = `entity:${classname}`;
    group.add(instance.mesh);
    instances.push({
      md2: instance,
      behavior: {
        classname,
        basePositionZ: origin[2] + (definition.verticalOffset ?? 0),
        rotateYawSpeed: definition.rotateYawSpeed ?? 0,
        bobAmplitude: definition.bobAmplitude ?? 0,
        bobSpeed: definition.bobSpeed ?? 0,
        frameRange: definition.frameRange ?? null,
        frameRate: definition.frameRate ?? 0
      }
    });
  }

  return {
    group,
    instances,
    supportedEntityCount
  };
}

/**
 * Category: New
 * Purpose: Advance the lightweight visual behaviors of entity preview meshes.
 *
 * Constraints:
 * - Must keep updates deterministic from the provided elapsed time.
 */
export function updateEntityPreviewGroup(preview: EntityPreviewGroup, elapsedSeconds: number): void {
  for (const instance of preview.instances) {
    const { md2, behavior } = instance;

    if (behavior.rotateYawSpeed !== 0) {
      md2.mesh.rotation.z += behavior.rotateYawSpeed / 60;
    }

    if (behavior.bobAmplitude !== 0 && behavior.bobSpeed !== 0) {
      md2.mesh.position.z = behavior.basePositionZ + Math.sin(elapsedSeconds * behavior.bobSpeed) * behavior.bobAmplitude;
    }

    if (behavior.frameRange !== null && behavior.frameRate > 0) {
      const [startFrame, endFrame] = behavior.frameRange;
      const frameCount = endFrame - startFrame + 1;
      if (frameCount > 0 && endFrame < md2.model.frames.length) {
        const frame = startFrame + (Math.floor(elapsedSeconds * behavior.frameRate) % frameCount);
        applyMd2Frame(md2, frame);
      }
    }
  }
}
