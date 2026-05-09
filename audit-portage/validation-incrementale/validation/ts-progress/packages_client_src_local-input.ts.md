# Progress TS - packages/client/src/local-input.ts

- Statut: Termine
- Dernier lot valide: fichier complet (`syncLocalMovementButtons`, `setLocalButtonHeld`, `clearLocalMovementState`, `resetLocalButtonState`).
- Prochain lot recommande: aucun.
- Tests de reference:
  - `npm run verify:full-game:input-bindings`
  - `npm run verify:full-game:demo-cleanup`
  - `npm run typecheck`
- Blocages: aucun.

## Decisions

- Les 4 symboles sont des helpers locaux `Category: New`, sans entite C/H proprietaire directe.
- Metadonnees explicites retenues: `Original name: N/A`, `Source: N/A (standalone local-input helper)`.
- Integration runtime: via `stepLocalClientSession`, `CL_CreateCmd` et les structures `kbutton_t` portees.
- Integration apps/web: via `local-client-controller.ts` pour le clear focus/visibility et via les sessions locales/full-game.
- Integration renderer-three: non applicable directement; ces helpers ne produisent pas de donnees visibles, seulement des commandes d'entree consommees ensuite par le runtime.
