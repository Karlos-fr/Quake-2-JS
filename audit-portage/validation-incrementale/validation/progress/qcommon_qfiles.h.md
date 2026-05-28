# Progress - Quake-2-master/qcommon/qfiles.h

## Etat courant

- Statut: Termine
- Dernier lot valide: suite BSP finale depuis `dedge_t` jusqu'a `darea_t`; toutes les entites de `qfiles.h` sont validees.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_qfiles.h.md`

## Derniere session

- Lot traite: suite BSP finale (`dedge_t`, `MAXLIGHTMAPS`, `dface_t`, `dleaf_t`, `dbrushside_t`, `dbrush_t`, `ANGLE_*`, `DVIS_*`, `dvis_t`, `dareaportal_t`, `darea_t` et champs directs).
- Source comparee: `Quake-2-master/qcommon/qfiles.h`.
- Cibles comparees: `packages/formats/src/qfiles.ts`, `packages/formats/src/index.ts`, `packages/qcommon/src/cmodel.ts`, `apps/web/src/main.ts`, `apps/web/src/full-game-local-session.ts`, `packages/renderer-three/src/gl_model.ts`, `packages/renderer-three/src/gl_model.ts`, `packages/renderer-three/src/gl_light.ts`, `packages/renderer-three/src/gl_rsurf.ts`, `packages/renderer-three/src/gl-world-scene-adapter.ts`.
- Decision: ownership confirme dans `packages/formats/src/qfiles.ts`; les exports publics existent via `packages/formats/src/index.ts`. Aucun doublon de portage proprietaire detecte.
- Commentaires: en-tetes de portage verifies pour `dedge_t`, `dface_t`, `dleaf_t`, `dbrushside_t`, `dbrush_t`, `dvis_t`, `dareaportal_t`, `darea_t` et `parseBsp`; helpers de lecture marques `Category: New`.
- Runtime: attendu et verifie. `parseBsp` alimente `CM_LoadMap`, leafs/brushes/brushsides/areas/areaportals, PVS/PHS et areabits via `packages/qcommon/src/cmodel.ts`.
- apps/web: attendu et verifie. `apps/web` charge les BSP via `parseBsp` en local et full-game, sans parsing parallele masquant le runtime.
- renderer-three: attendu et verifie. Les sorties BSP visibles sont consommees pour surfaces, edges/surfedges, faces/lightmaps/styles, leaf visibility, PVS, scene/world, alpha/sky/warp et dynamic lightmaps via `gl_model`, `gl_rsurf`, `gl_light` et le world adapter.
- Tests ajoutes: assertions ciblees dans `scripts/verify/quake2-qfiles.ts` pour `MAXLIGHTMAPS`, `dedge_t`, `dface_t`, `dleaf_t`, `dbrushside_t`, `dbrush_t`, `dvis_t` brut, `dareaportal_t`, `darea_t`, lighting, leaffaces, leafbrushes et surfedges.
- Tests lances: `npm run verify:qfiles`, `npx tsx ./scripts/verify/quake2-cmodel.ts`, `npm run verify:gl-model:phase8`, `npm run verify:gl-rsurf`, `npm run verify:three-world-alpha`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Prochain lot recommande

- Aucun dans `qcommon/qfiles.h`: toutes les lignes de la matrice sont `Valide`.

## Blocages

- Aucun.
