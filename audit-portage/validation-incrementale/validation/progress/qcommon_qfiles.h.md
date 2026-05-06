# Progress - Quake-2-master/qcommon/qfiles.h

## Etat courant

- Statut: En cours
- Dernier lot valide: bloc SP2 initial, bloc WAL, constantes BSP/map/lumps, puis structures BSP initiales jusqu'a `texinfo_t.nexttexinfo`.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_qfiles.h.md`

## Derniere session

- Lot traite: bloc SP2 initial (`IDSPRITEHEADER`, `SPRITE_VERSION`, `dsprframe_t`, `dsprite_t` et champs directs), bloc WAL (`MIPLEVELS`, `miptex_s`/`miptex_t` et champs directs), puis bloc BSP adjacent depuis `IDBSPHEADER` jusqu'a `texinfo_t.nexttexinfo`.
- Source comparee: `Quake-2-master/qcommon/qfiles.h`.
- Cibles comparees: `packages/formats/src/sp2.ts`, `packages/formats/src/wal.ts`, `packages/formats/src/qfiles.ts`, `packages/formats/src/index.ts`, `packages/qcommon/src/cmodel.ts`, `apps/web/src/main.ts`, `apps/web/src/full-game-local-session.ts`, `packages/renderer-three/src/gl-model-loader.ts`, `packages/renderer-three/src/gl_image.ts`, `packages/renderer-three/src/gl-world-scene-adapter.ts`, `packages/renderer-three/src/gl_rsurf.ts`, `packages/renderer-three/src/refresh-entity-sync.ts`.
- Decision: ownership SP2 corrige vers `packages/formats/src/sp2.ts`; ownership WAL corrige vers `packages/formats/src/wal.ts`; `miptex_s` est represente par le typedef TS `miptex_t` avec commentaire explicite. `MIPLEVELS` et `LAST_VISIBLE_CONTENTS` sont maintenant exportes depuis l'index `packages/formats`.
- Commentaires: en-tetes de portage verifies pour `dsprframe_t`, `dsprite_t`, `parseSp2`, `miptex_s`/`miptex_t`, `parseWal`, `lump_t`, `dheader_t`, `dmodel_t`, `dvertex_t`, `dplane_t`, `dnode_t`, `texinfo_t` et `parseBsp`.
- Runtime: attendu et verifie. `parseSp2` est utilise par `Mod_LoadSpriteModel` et `refresh-entity-sync`; `parseWal` charge les textures murales via `GL_LoadWal` et le world adapter; `parseBsp` alimente `CM_LoadMap`, le runtime local/web, les maps, surfaces, contenus, texinfo, areabits et collision.
- apps/web: attendu et verifie. `apps/web` charge les BSP via `parseBsp` pour les sessions locales/full-game et consomme les sorties map/collision; les textures WAL/SP2 restent consommees par le renderer branche au host web, sans logique parallele de parsing.
- renderer-three: attendu et verifie. SP2 produit des sprites visibles consommes par `R_DrawSpriteModel`/`refresh-entity-sync`; WAL produit les images de surfaces consommees par `gl_image` et `gl-world-scene-adapter`; BSP produit modeles, surfaces, texinfo flags, contents et areabits consommes par `gl-model-loader`, `gl_rsurf` et le world adapter.
- Tests ajoutes: assertions ciblees dans `scripts/verify/quake2-qfiles.ts` pour `MIPLEVELS`, limites map, constantes lumps, contenus/surfaces, export `LAST_VISIBLE_CONTENTS`, parsing SP2/WAL, et BSP synthetique couvrant `lump_t`, `dheader_t`, `dmodel_t`, `dvertex_t`, `dplane_t`, `dnode_t` et `texinfo_t`.
- Tests lances: `npm run verify:qfiles`, `npm run verify:gl-model:phase8`, `npm run verify:refresh-entity:sprite`, `npm run verify:gl-image`, `npm run verify:gl-rsurf`, `npx tsx ./scripts/verify/quake2-cmodel.ts`, `npm run verify:three-world-alpha`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Prochain lot recommande

- Suite BSP: `dedge_t`, `MAXLIGHTMAPS`, `dface_t`, `dleaf_t`, `dbrushside_t`, `dbrush_t`, `ANGLE_*`, `dvis_t`, `dareaportal_t` et `darea_t` si le lot reste coherent.

## Blocages

- Aucun.
