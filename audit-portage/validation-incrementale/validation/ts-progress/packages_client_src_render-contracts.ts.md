# Progress TS - packages/client/src/render-contracts.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 7 symboles (`HudBounds`, `HudPictureCommand`, `HudTextCommand`, `HudNumberCommand`, `HudFillCommand`, `HudDrawCommand`, `QuakeSkySnapshot`).
- Decision: contrats runtime-renderer `Category: New`, hors C/H, avec `Original name: N/A` et `Source declaree: N/A (runtime-renderer contract)` explicites.
- Preuves: usages croises dans `cl_scrn.ts`, `cl_inv.ts`, `cl_cin.ts`, `sky.ts`, exports `index.ts`, consommation `apps/web` pour snapshots sky et `renderer-three` via `sky-scene-adapter.ts`.
- Tests de reference: `npm run typecheck`.
- Blocages: aucun.
- Prochain lot recommande: aucun.
