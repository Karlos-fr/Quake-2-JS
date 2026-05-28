# Progress TS - packages/renderer-three/src/gl_model.ts

## Etat courant

- Statut: Termine
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_gl_model.ts.md`
- Fichier TS: `packages/renderer-three/src/gl_model.ts`
- Source principale: `Quake-2-master/ref_gl/gl_model.h`
- Matrice C/H principale: `audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_model.h.md`

## Session courante

- Lot traite: fichier complet, 38 symboles.
- Verdict: 16 `Couvert C/H`, 22 `Valide`, 0 reste a auditer.
- En-tetes incomplets: 0 restant.
- `Category: New`: toutes les factories et guards TS ont `Original name: N/A` et `Source: N/A (...)` explicites.

## Decisions

- `gl_model.ts` est le proprietaire TS des declarations memoire de `ref_gl/gl_model.h`.
- Les fonctions de chargement et d'enregistrement de `ref_gl/gl_model.c` restent proprietaires dans `gl_model.ts`; elles ne sont pas revalidees ici.
- `image_t`, `model_s`, `glpoly_vertex_t` et `mnode_child_t` sont des adapters/alias TS, pas des portages proprietaires distincts.
- `mvertex_t`, `mmodel_t` et `medge_t` sont valides par lecture directe du header, car la matrice C/H genere seulement certains champs et pas une ligne finale dediee au typedef.

## Tests de reference

- `npm run verify:gl-model:header`
- `npm run verify:ref-gl-host`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `git diff --check`

## Prochain lot recommande

- Aucun dans la matrice TS actuelle.


## Session 2026-05-28 - redecoupage lot 4

- `ref_gl/gl_model.h` et `ref_gl/gl_model.c` sont consolides dans `packages/renderer-three/src/gl_model.ts`.
- Ancien contenu du loader integre au meme fichier pour respecter le basename strict commun C/H.
- Les imports renderer pointent vers `./gl_model.js`; aucun fichier `gl_model.ts` ne reste proprietaire.

### Ancien progress loader consolide

# Progress TS - packages/renderer-three/src/gl_model.ts

## Etat courant

- Statut: Termine
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_gl_model.ts.md`
- Fichier TS: `packages/renderer-three/src/gl_model.ts`
- Dernier lot traite: lot complet de 59 symboles du chargeur de modeles renderer (`MAX_MOD_KNOWN` a `renderer_dvis_t`).
- Prochain lot recommande: aucun dans cette matrice.

## Session 2026-05-27 - validation croisee complete

- Lot: 59 symboles, frontiere logique `ref_gl/gl_model.c` / model loading.
- Preuves C/H: `audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_model.c.md`, `audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_model.h.md`, `audit-portage/validation-incrementale/validation/matrices/qcommon_qfiles.h.md`, source `Quake-2-master/ref_gl/gl_model.c`.
- Verdict: 30 symboles `Couvert C/H`, 29 symboles `Valide`.
- Corrections: en-tetes `New` completes avec `Original name: N/A` et `Source: N/A (<raison courte>)`; helpers extraits classes `Adapter`; matrice TS reliee aux matrices C/H disponibles.
- Integration runtime/apps/web/renderer-three: non applicable cote gameplay/web; ce fichier est lui-meme le port/adaptateur renderer-three de `ref_gl/gl_model.c`, consomme par `ref-gl-host.ts`, `gl_rsurf.ts` et les exports renderer.
- Tests lances: `npm run verify:gl-model:phase1`, `npm run verify:gl-model:phase2`, `npm run verify:gl-model:phase3`, `npm run verify:gl-model:phase4`, `npm run verify:gl-model:phase5`, `npm run verify:gl-model:phase6`, `npm run verify:gl-model:phase7`, `npm run verify:gl-model:phase8`, `npm run verify:gl-model:phase9`, `npm run verify:ref-gl-host`, `npm run typecheck`, `git diff --check`.

## Decisions

- `GlModelRuntime` est un `Adapter`: il possede en TS les anciens globals de `gl_model.c`, mais ce n'est pas une entite C unique.
- Les constantes `*_SIZE` sont des helpers de lecture binaire BSP; les structures proprietaires restent dans `qcommon/qfiles.h` et `packages/formats/src/qfiles.ts`.
- Les helpers `computePlaneSignbits`, `findKnownModel`, `allocateKnownModel`, `readBrushHeader` et `copyModelShallow` sont des extractions locales; les proprietaires portes restent les fonctions `Mod_LoadPlanes`, `Mod_ForName` et `Mod_LoadBrushModel`.
