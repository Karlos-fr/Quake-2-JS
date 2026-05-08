# Progress - Quake-2-master/client/anorms.h

## Etat

- Statut: Termine
- Dernier lot valide: table incluse `client/anorms.h`, materialisee en C comme `bytedirs[NUMVERTEXNORMALS]` dans `qcommon/common.c` et comme `r_avertexnormals[NUMVERTEXNORMALS]` dans `ref_gl/gl_mesh.c`.
- Entites validees: `BYTE_DIRS` dans `packages/qcommon/src/anorms.ts`.

## Checklist appliquee

- Source H comparee a `packages/qcommon/src/anorms.ts`; `verify:anorms` compare les 162 triplets directement contre `Quake-2-master/client/anorms.h`.
- Ownership verifie: la table partagee client/qcommon est proprietairement exposee par `packages/qcommon/src/anorms.ts`; le renderer consomme cette table via `DirFromByte` ou la compare depuis `gl_mesh.ts` sans dupliquer l'ownership de `client/anorms.h`.
- Commentaire d'en-tete verifie dans `packages/qcommon/src/anorms.ts`; la deviation volontaire `BYTE_DIRS` au lieu du nom C materiel `bytedirs` est documentee par le commentaire de port.
- Runtime verifie: `MSG_WriteDir`/`MSG_ReadDir`, `cl_parse.ts`, `cl_tent.ts` et `cl_fx.ts` utilisent `BYTE_DIRS`/`DirFromByte` pour directions reseau, temp entities et particules.
- `apps/web` verifie: pas de logique parallele; les sorties visibles passent par le runtime client et les frames de rendu full-game.
- `renderer-three` verifie pour sorties visibles: normales MD2 via `md2-mesh-builder.ts`, alias normal count via `gl_mesh.ts`, particules/temp entities via les frames client consommees par le renderer.

## Tests de reference

- `npm run verify:anorms`
- `npm run verify:cl-tent`
- `npm run verify:gl-mesh`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages hors lot

- `npm run verify:cl-fx` echoue sur `EF_ROCKET should expose the original rocket dlight to refresh`, assertion dlight sans lien avec la table `client/anorms.h`.

## Prochain lot

Aucun lot restant dans `client_anorms.h.md`: la table incluse est validee par ligne manuelle.
