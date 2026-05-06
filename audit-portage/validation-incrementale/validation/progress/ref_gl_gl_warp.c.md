# Progress - Quake-2-master/ref_gl/gl_warp.c

## Dernier lot valide

Lot complet `ref_gl/gl_warp.c` traite le 2026-05-06:

- fonctions: `BoundPoly`, `SubdividePolygon`, `GL_SubdivideSurface`, `EmitWaterPolys`, `DrawSkyPolygon`, `ClipSkyPolygon`, `R_AddSkySurface`, `R_ClearSkyBox`, `MakeSkyVec`, `R_DrawSkyBox`, `R_SetSky`;
- constantes/macros: `SUBDIVIDE_SIZE`, `TURBSCALE`, `ON_EPSILON`, `MAX_CLIP_VERTS`;
- etats globaux proprietaires: `c_sky`, `skyaxis`, `skyrotate`;
- faux positifs de matrice marques `Non applicable`: variables locales `axis`, `dv`, `frac`, `i`, `lindex`, `m`, `numverts`, `rdt`, `s`, `scroll`, `t`, `total`, `vec`.

## Preuves de session

- Source C comparee: `Quake-2-master/ref_gl/gl_warp.c`.
- Cible TS comparee et corrigee: `packages/renderer-three/src/gl_warp.ts`.
- Branchement runtime verifie: `packages/renderer-three/src/gl-world-scene-adapter.ts` appelle `GL_SubdivideSurface`, `EmitWaterPolys`, `R_ClearSkyBox`, `R_AddSkySurface`, `R_DrawSkyBox` dans les flux world/sky/warp; `packages/renderer-three/src/ref-gl-host.ts` alimente l'echelle de turbulence.
- `apps/web` verifie: `apps/web/src/full-game-render-loop.ts` transmet `glWorldAdapter.skyFaces` au `skyAdapter`, et le flux full-game instancie les adapters world/sky.
- `renderer-three` verifie: les sorties visibles water UV et sky faces sont consommees par `gl-world-scene-adapter.ts` et `sky-scene-adapter.ts`.

## Corrections appliquees

- Ajout des commentaires d'en-tete `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` et notes utiles aux fonctions proprietaires portees dans `packages/renderer-three/src/gl_warp.ts`.
- Correction defensive de `R_SetSky`: `sky_min`/`sky_max` suivent le mode memoire reduite meme si `gl_picmip` n'est pas injecte, tout en gardant la mutation `gl_picmip` quand le cvar existe.

## Tests lances

- `npm run verify:gl-warp`
- `npm run verify:three-world-warp-sky`
- `npm run typecheck`

## Blocages

Aucun.

## Prochain lot recommande

Aucun lot restant dans `ref_gl_gl_warp.c.md`: toutes les lignes sont `Valide` ou `Non applicable`.
