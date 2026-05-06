# Progress - Quake-2-master/ref_gl/gl_light.c

## Etat courant

- Statut: Termine
- Dernier lot valide: fichier complet `gl_light.c` en un gros lot coherent: dlights flashblend, marquage BSP, light sampling, lightmaps dynamiques, cache lightstyles et build lightmap.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_light.c.md`
- Cible principale: `packages/renderer-three/src/gl_light.ts`

## Validation appliquee

- Comparaison C vs TS faite pour `DLIGHT_CUTOFF`, `R_RenderDlight`, `R_RenderDlights`, `R_MarkLights`, `R_PushDlights`, `RecursiveLightPoint`, `R_LightPoint`, `R_AddDynamicLights`, `R_SetCacheState`, `R_BuildLightMap`, et les etats portes `r_dlightframecount`, `pointcolor`, `lightspot`.
- Ownership confirme: port principal dans `packages/renderer-three/src/gl_light.ts`; exports publics via `packages/renderer-three/src/index.ts`.
- Doublons: aucun doublon proprietaire detecte; `R_MarkModelLights`, `createGlLightRsurfHooks`, `createGlLightRmainHooks` et `three-dlight-sync` sont des adapters documentes.
- Commentaires d'en-tete verifies pour les fonctions portees et adapters.
- Faux positifs de matrice: les lignes `a`, `add`, `dist`, `end`, `fdist`, `i`, `light`, `lnum`, `maps`, `max`, `mid`, `monolightmap`, `nummaps`, `r`, `rad`, `scale`, `side`, `store`, `t`, `v` sont des variables/labels locaux C, marques `Non applicable`.

## Integration runtime / web / renderer-three

- Runtime ref_gl: `gl_rmain.ts` expose les hooks `pushDlights`, `renderDlights`, `lightPoint`; `gl_rsurf.ts` consomme les hooks lightmap; `gl-world-scene-adapter.ts` branche `R_PushDlights` et les lightmaps dynamiques sur les surfaces BSP visibles.
- `apps/web`: le render loop partage `glWorldAdapter.update(..., source.refreshFrame)` puis `dlightSync.apply(source.refreshFrame)`; `full-game.ts` cree `createThreeDlightSync` et le world adapter.
- `renderer-three`: `three-dlight-sync.ts` consomme explicitement la sortie visible de `R_RenderDlights`; `gl-world-scene-adapter.ts` consomme les dlights/lightstyles pour surfaces et lightmaps dynamiques.
- Deviation documentee: `R_LightPoint` utilise `currententity?.origin ?? p` pour permettre les hooks de type `R_SetLightLevel`/adapter sans `currententity` global, tout en conservant le chemin entity quand il est lie.

## Tests lances

- `npm run verify:gl-light`
- `npm run verify:dlight-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run verify:gl-rsurf`
- `npm run verify:gl-rmain`

## Blocages

- Aucun blocage ouvert pour `ref_gl/gl_light.c`.

## Prochain lot recommande

- Aucun dans ce fichier. Reprendre le prochain fichier `ref_gl` prioritaire dans `AVANCEMENT_GLOBAL.md`, par exemple `gl_image.c` ou `gl_local.h` selon coordination.
