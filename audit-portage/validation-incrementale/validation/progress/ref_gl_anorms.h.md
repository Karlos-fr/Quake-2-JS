# Progress - Quake-2-master/ref_gl/anorms.h

## Etat

- Statut: Termine
- Dernier lot valide: table incluse `ref_gl/anorms.h`, materialisee en C comme `r_avertexnormals[NUMVERTEXNORMALS]` dans `ref_gl/gl_mesh.c`.
- Entites validees: `BYTE_DIRS` dans `packages/qcommon/src/anorms.ts`.

## Checklist appliquee

- Source H comparee a `packages/qcommon/src/anorms.ts`; `verify:anorms` compare les 162 triplets directement contre `Quake-2-master/ref_gl/anorms.h`.
- Ownership verifie: la table est partagee avec `client/anorms.h` et exposee une seule fois par `packages/qcommon/src/anorms.ts`; la matrice `client_anorms.h.md` n'a pas ete modifiee dans ce lot.
- Commentaire d'en-tete mis a jour dans `packages/qcommon/src/anorms.ts` pour declarer aussi `ref_gl/anorms.h` et l'usage C `r_avertexnormals`.
- Runtime verifie: `gl_mesh.ts` consomme la cardinalite et les indices `lightnormalindex`; `md2-mesh-builder.ts` consomme `DirFromByte` pour l'offset powersuit des frames alias.
- `apps/web` verifie: pas de logique parallele; le chemin full-game cree le renderer Three/ref_gl via `createRefGlHost` et consomme les sorties de rendu runtime.
- `renderer-three` verifie pour sorties visibles: modeles alias/MD2, frames et normals `lightnormalindex` sont couverts par `gl_mesh.ts`, `md2-mesh-builder.ts` et les tests renderer.

## Tests de reference

- `npm run verify:anorms`
- `npm run verify:gl-mesh`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages hors lot

- Aucun blocage constate dans ce lot.

## Prochain lot

Aucun lot restant dans `ref_gl_anorms.h.md`: la table incluse est validee par ligne manuelle.
