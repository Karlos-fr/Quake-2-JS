# Progress TS - packages/renderer-three/src/gl-world-scene-adapter.ts

## Etat courant

- Statut: Termine
- Dernier lot valide: fichier complet, 44 symboles reels.
- Prochain lot recommande: Aucun dans la matrice TS actuelle.

## Session

- Lot traite: tous les symboles de `SHARED_PALETTE_PATH` a `parseInlineModelIndex`.
- Verdict:
  - 44 symboles `Valide`.
  - 0 symbole `Couvert C/H`, car `gl-world-scene-adapter.ts` n'est pas proprietaire des ports C/H; il consomme les ports proprietaires `gl_model.c`, `gl_rsurf.c`, `gl_light.c`, `gl_warp.c`, `gl_image.c` et `gl_rmisc.c` pour produire des objets Three.js.
  - 0 symbole restant a auditer.
  - 0 entete incomplet restant.
- Decisions:
  - La matrice TS a ete recalee sur les 44 symboles reels du fichier actuel: retrait des anciennes lignes `ORIGINAL_DEFAULT_TEXTURE_INTENSITY`, `ORIGINAL_DEFAULT_INVERSE_INTENSITY`, `createIndexedTexture`, `applyOriginalTextureIntensity`, `applyOriginalTextureIntensityChannel` et ajout de `buildIndexedRgba`, `createRgbaTexture`, `updateThreeGlImageTexture`, `isSurfaceLightmapped`, `hideVisibleSurfaces`.
  - `createThreeGlWorldSceneAdapter` est classe `Adapter`, pas `New`, avec `Original name: N/A` et `Source: N/A (Three.js world scene adapter)` dans l'en-tete.
  - Les helpers relies a des flux `ref_gl` restent `Adapter`/`Valide`; aucun doublon ou mauvais ownership n'est masque en `Couvert C/H`.
- Integration:
  - `apps/web` consomme l'export via `full-game.ts`, `full-game-render-loop.ts`, `web-demo-loop.ts` et `main.ts`.
  - `renderer-three` consomme la scene via le flux BSP/brush models, refdef, lightstyles, dlights, sky/warp, textures et lightmaps.

## Tests de reference

- `npm run verify:three-world-warp-sky`
- `npm run verify:three-world-alpha`
- `npm run verify:gl-rsurf`
- `npm run verify:gl-warp`
- `npm run verify:gl-image`
- `npm run verify:ref-gl-host`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `git diff --check`
