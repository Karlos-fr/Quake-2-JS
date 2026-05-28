# Progress TS - packages/game/src/p_hud.ts

- Fichier TS: `packages/game/src/p_hud.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_hud.ts.md`
- Statut: Termine
- Dernier lot traite: fonctions HUD/intermission portees et helpers locaux `imageIndex`, `layoutQuote`, `pad3`
- Prochain lot recommande: aucun.
- Tests de reference: `npm run verify:p-hud`, `npm run typecheck`
- Blocages: aucun

## 2026-05-28 - Interfaces locales HUD

- `GameHudHooks`: classe `Category: New`, avec `Original name: N/A` et `Source: N/A (local HUD hook contract)` dans l'entete et la matrice. Contrat local d'emission de layout, sans entite C/H proprietaire.
- `GameHudHelpComputerData`: classe `Category: New`, avec `Original name: N/A` et `Source: N/A (local help-computer data contract)` dans l'entete et la matrice. Contrat local pour injecter les donnees globales `game`/`level` lues par le port de `HelpComputer`.
- Integration runtime/apps-web/renderer-three: non applicable pour ce lot de types; les flux concrets restent portes par les fonctions HUD qui les consomment.

## 2026-05-28 - Lot elargi HUD/intermission

- Lot traite: `MoveClientToIntermission`, `BeginIntermission`, `DeathmatchScoreboardMessage`, `DeathmatchScoreboard`, `Cmd_Score_f`, `HelpComputer`, `Cmd_Help_f`, `G_SetStats`, `G_CheckChaseStats`, `G_SetSpectatorStats`, puis helpers locaux `imageIndex`, `layoutQuote`, `pad3`.
- Fonctions portees: `Couvert C/H` apres croisement avec `validation/matrices/game_p_hud.c.md`, qui marque chaque entite `Valide` avec proprietaire attendu `packages/game/src/p_hud.ts`. Les entetes TS exposent `Original name`, `Source: game/p_hud.c`, `Category: Ported`, export public et niveau de fidelite. Les recherches de doublons n'ont trouve que des appels/exports ou declarations header non proprietaires.
- Helpers locaux: classes `Category: New`, avec `Original name: N/A` et `Source: N/A (...)` dans les entetes et la matrice. `imageIndex` adapte `gi.imageindex` au registre d'assets runtime, `layoutQuote` protege les champs layout cites, `pad3` conserve le formatage `%3i` du help computer.
- Integration runtime: presente via `ClientCommand` pour `score`/`help`, `target_changelevel`/`G_RunFrame` pour intermission, `ClientEndServerFrame` pour stats HUD, et chase spectator via `p_view.ts`.
- Integration apps-web: consomme les stats/layouts par le flux local/full-game et `STAT_LAYOUTS`; pas de logique web proprietaire a corriger dans ce lot.
- Integration renderer-three: non applicable directement; ces entites produisent layout/HUD stats et etat client, sans donnees de scene renderer-three directes.
