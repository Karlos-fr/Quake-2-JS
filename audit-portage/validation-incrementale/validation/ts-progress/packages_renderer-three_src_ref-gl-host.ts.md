# Progress TS - packages/renderer-three/src/ref-gl-host.ts

- Statut: Termine
- Dernier lot valide: toutes les entites de la matrice TS (`RefGlHostOptions`, `RefGlHost`, `createRefGlHost`, `createDefaultDrawRuntime`, `createDrawApiHooks`, `syncImageFromRmain`, `syncDrawFromRmain`, `syncRmiscFromRmain`, `createQglRmiscHooks`).
- Verdict: host/facade renderer-three hors C/H. Les symboles publics sont `Category: New`; les ponts runtime/hooks sont `Category: Adapter`.
- Matrice C/H: aucune ligne proprietaire pour ce fichier. Les portages `ref_gl` appeles restent proprietaires de leurs fichiers (`gl_rmain.ts`, `gl_draw.ts`, `gl_image.ts`, `gl_rmisc.ts`, `gl_model.ts`).
- Ownership/doublons: recherche effectuee; aucun doublon proprietaire masque par `ref-gl-host.ts`.
- Tests de reference: `npm run verify:ref-gl-host`, `npm run verify:gl-rmain`, `npm run verify:gl-draw`, `npm run verify:gl-rmisc`, `npm run verify:gl-image`, `npm run verify:gl-model:phase9`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Integration: runtime client via `GetRefAPI`/`refexport_t`; apps-web via `full-game.ts` et `main.ts`; renderer-three via bootstrap, draw/image/rmisc/model runtimes.
- Prochain lot recommande: aucun.
