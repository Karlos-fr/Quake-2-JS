# Progress - Quake-2-master/ref_gl/anormtab.h

## Etat

- Statut: Termine
- Dernier lot valide: table complete `r_avertexnormal_dots` -> `R_AVERTEXNORMAL_DOTS`.
- Prochain lot recommande: aucun pour `ref_gl/anormtab.h`; fichier clos.

## Preuves de session

- Comparaison source C/H vs TS: `npm run verify:anormtab` parse `Quake-2-master/ref_gl/anormtab.h` et compare les 16 lignes x 256 valeurs avec `packages/renderer-three/src/anormtab.ts`.
- Commentaires d'en-tete: `packages/renderer-three/src/anormtab.ts` documente `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`; les helpers TS nouveaux declarent `Original name: N/A` et `Source: N/A`.
- Runtime renderer: `npm run verify:gl-mesh` prouve la selection `getAliasShadedotsForYaw` et la consommation par couleurs de vertices alias via `buildAliasVertexColors`.
- `apps/web`: `npm run verify:full-game:three-renderer` prouve que le full-game utilise le renderer Three/ref_gl partage; la table est consommee via renderer, pas par une logique web parallele.
- `renderer-three`: sortie visible applicable pour modeles alias/frames/lighting; branchement valide via `packages/renderer-three/src/gl_mesh.ts`.
- TypeScript: `npm run typecheck`.

## Decisions

- La matrice generee etait vide; la table incluse par `ref_gl/gl_mesh.c` est traitee comme l'entite declarative proprietaire du fichier.
