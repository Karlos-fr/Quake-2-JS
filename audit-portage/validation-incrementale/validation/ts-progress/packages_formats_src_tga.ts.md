# Progress TS - packages/formats/src/tga.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 10 symboles.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:gl-image`
  - `npm run verify:sky:phase5`
  - `npm run typecheck`
- Decisions:
  - `TargaHeader` est le portage proprietaire du struct source `_TargaHeader`, couvert par `ref_gl_gl_image.c.md`.
  - `parseTga` est un adapter/parser partage de formats; il ne doit pas masquer le portage proprietaire `LoadTGA`, qui reste dans `packages/renderer-three/src/gl_image.ts`.
  - Les helpers internes et `TgaImage` sont du code nouveau avec `Original name: N/A` et `Source: N/A (...)`.
- Blocages: Aucun.
