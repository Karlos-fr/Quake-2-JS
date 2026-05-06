# Progress - Quake-2-master/ref_gl/gl_mesh.c

## Etat

- Statut: Termine
- Dernier lot valide: fichier complet `gl_mesh.c` en gros lot coherent.
- Entites validees: alias model rendering, `GL_LerpVerts`, `GL_DrawAliasFrameLerp`, `GL_DrawAliasShadow`, `R_CullAliasModel`, `R_DrawAliasModel`, `NUMVERTEXNORMALS`, `SHADEDOT_QUANT`, `shadevector`.
- Non applicables: faux positifs generateur de variables locales, plus `lightspot` qui est un extern proprietaire de `gl_light.c`.

## Checklist appliquee

- Source C comparee a `packages/renderer-three/src/gl_mesh.ts`, `packages/renderer-three/src/md2-mesh-builder.ts` et `packages/renderer-three/src/refresh-entity-sync.ts`.
- Ownership verifie: les fonctions/comportements proprietaires de `gl_mesh.c` sont portes dans `gl_mesh.ts`; la reconstruction geometry/MD2 et le branchement scene restent des adapters documentes.
- Commentaires d'en-tete verifies pour les fonctions portees et adapters critiques.
- Runtime ref_gl verifie via `R_DrawEntitiesOnList`, callback `drawAliasModel`, `createGlRmainRuntime`, et `createThreeRefreshEntitySync`.
- `apps/web` verifie via `main.ts` et `full-game.ts`, qui branchent `createRefGlHost` et la boucle renderer Three/ref_gl.
- `renderer-three` verifie pour sorties visibles: modeles alias MD2, frames, skins, shells, couleurs vertex, culling frustum, ombres, weapon models, transparence/depthhack, camera/scene.

## Tests de reference

- `npm run verify:gl-mesh`
- `npm run verify:refresh-entity:alias-flags`
- `npm run verify:refresh-entity:weapon`
- `npm run verify:entities:phase6:orientation`
- `npm run verify:gl-model:phase9`
- `npm run verify:ref-gl-host`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions

- `lightspot` n'est pas marque proprietaire ici: le global est valide dans `gl_light.c`. Pour l'ombre alias, le port Three consomme une hauteur `lheight` calculee par raycast/adaptation scene, ce qui preserve le comportement visible attendu sans doubler l'ownership du global.
- `NUMVERTEXNORMALS` est expose dans `gl_mesh.ts` et compare au compteur commun `BYTE_DIRS.length`/`qcommon.NUMVERTEXNORMALS`.
- `SHADEDOT_QUANT` reste porte par `anormtab.ts`, fichier de table incluse, et consomme par `gl_mesh.ts`.

## Prochain lot

Aucun lot restant dans `ref_gl_gl_mesh.c.md`: toutes les lignes sont `Valide` ou `Non applicable`.
