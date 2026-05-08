# Progress - Quake-2-master/ref_gl/warpsin.h

## Dernier lot valide

Lot complet `ref_gl/warpsin.h` traite le 2026-05-08:

- table: `r_turbsin`.

## Preuves de session

- Source C comparee: `Quake-2-master/ref_gl/warpsin.h`.
- Cible TS comparee et corrigee: `packages/renderer-three/src/warpsin.ts`.
- Export package verifie: `packages/renderer-three/src/index.ts` exporte `r_turbsin`.
- Branchement runtime verifie: `packages/renderer-three/src/gl_warp.ts` consomme `r_turbsin` dans `EmitWaterPolys`; `packages/renderer-three/src/gl_rmain.ts`/`ref-gl-host.ts` appliquent l'echelle runtime via `setWarpTurbulenceScale` sans muter la table.
- `apps/web` verifie: le flux web consomme le renderer via `createRefGlHost`/world adapter; la table n'est pas appelee directement par `apps/web`.
- `renderer-three` verifie: la sortie visible attendue est la turbulence UV des surfaces water/warp, consommee par `gl-world-scene-adapter.ts`.

## Corrections appliquees

- Ajout de la ligne `r_turbsin` dans la matrice, la generation automatique n'ayant pas extrait cette table incluse.
- Commentaire d'en-tete de `packages/renderer-three/src/warpsin.ts` precise `Original name`, `Category`, `Fidelity level`, comportement et note de portage.

## Tests lances

- `npm run verify:warpsin`
- `npm run verify:gl-warp`
- `npm run verify:three-world-warp-sky`
- `npm run typecheck`

## Blocages

Aucun.

## Prochain lot recommande

Aucun lot restant dans `ref_gl_warpsin.h.md`: la table `r_turbsin` est `Valide`.
