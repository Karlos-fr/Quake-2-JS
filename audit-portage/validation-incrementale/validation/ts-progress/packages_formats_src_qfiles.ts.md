# Progress TS - packages/formats/src/qfiles.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 149 symboles.
- Prochain lot recommande: aucun.

## Decisions

- `packages/formats` est le proprietaire TS legitime des declarations de formats partagees issues de `qcommon/qfiles.h`; la matrice C/H `qcommon_qfiles.h.md` designe explicitement `packages/formats/src/qfiles.ts` comme cible attendue pour les constantes et structs BSP.
- 101 symboles portes depuis `qcommon/qfiles.h` sont marques `Couvert C/H` sans revalidation comportementale inutile.
- `texinfo_t` est rattache au struct source `texinfo_s` typedefe en C vers `texinfo_t`.
- `parseBsp` est classe `Category: New`, pas comme portage proprietaire de `dheader_t`, afin de ne pas masquer le proprietaire C/H `dheader_t`.
- Les constantes privees `*_SIZE`, DTO BSP et helpers de parsing sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)` explicites.
- `readStructArray` a ete ajoute manuellement a la matrice TS car le generateur ne l'avait pas listee.

## Tests de reference

- `npm run verify:qfiles`
- `npx tsx ./scripts/verify/quake2-cmodel.ts`
- `npm run verify:full-game:authoritative-handshake`
- `npm run typecheck`

## Integration

- Runtime: integre via `packages/qcommon/src/cmodel.ts`, `packages/game/src/runtime.ts`, `packages/client/src/local-session.ts` et les flux full-game qui chargent les BSP.
- apps/web: integre via `apps/web/src/full-game.ts`, `full-game-local-session.ts`, `main.ts` et `web-render-bootstrap.ts`.
- renderer-three: integre indirectement; `qfiles.ts` fournit les donnees BSP brutes/parsees, tandis que le renderer consomme les resultats via `gl_model.ts` et les adapters de rendu. Le renderer reste proprietaire de `ref_gl/*`, pas des declarations `qcommon/qfiles.h`.
