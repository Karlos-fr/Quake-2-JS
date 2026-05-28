# Progress TS - packages/renderer-common/src/sky.ts

- Statut: Termine
- Dernier lot valide: `QUAKE_SKY_FACE_SUFFIXES`, `QuakeSkyFaceName`, `QuakeSkyAssetSet`
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:sky:phase3`
  - `npm run verify:sky:phase4`
  - `npm run verify:sky:phase5`
  - `npm run verify:three-world-warp-sky`
  - `npm run typecheck`
- Decisions:
  - `renderer-common/src/sky.ts` est un contrat commun runtime/renderer, pas le proprietaire du portage `ref_gl/gl_warp.c`.
  - Le portage proprietaire de `ref_gl/gl_warp.c::suf` reste `packages/renderer-three/src/gl_warp.ts::SKY_SUFFIXES`.
  - Les trois symboles sont `Category: New` avec `Original name: N/A` et `Source: N/A (renderer-common sky contract)`.
- Blocages: Aucun.
