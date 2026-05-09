# Progress TS - packages/client/src/local-client-bootstrap.ts

- Statut: Termine
- Dernier lot valide: tout le fichier (`LOCAL_SINGLE_STATUSBAR`, `LOCAL_SCOREBOARD_LAYOUT`, `LocalClientItemStringEntry`, `LocalClientInventoryEntry`, `LocalClientHudBootstrapData`, `findClientImageIndex`, `initializeLocalHudState`, `setLocalLayoutBit`, `toggleLocalLayoutBit`)
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:local-gameplay-sync`
  - `npm run verify:full-game:newgame`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Decisions:
  - Les 9 symboles sont du code `Category: New` sans proprietaire C/H direct.
  - Les en-tetes et la matrice utilisent `Original name: N/A` et `Source: N/A (local client HUD bootstrap)`.
  - Le fichier fournit le bootstrap HUD/runtime local, consomme par `local-session.ts`, `local-gameplay-sync.ts` et `apps/web`; `renderer-three` consomme seulement les sorties refresh deja produites par le runtime client.
- Blocages: Aucun.
