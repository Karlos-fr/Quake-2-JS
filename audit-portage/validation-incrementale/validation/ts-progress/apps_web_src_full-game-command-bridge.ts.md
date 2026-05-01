# Progress TS - apps/web/src/full-game-command-bridge.ts

## Dernier lot traite

- Lot: toutes les entites restantes de `apps/web/src/full-game-command-bridge.ts`.
- Entites: `registerFullGameCommandBridge`, `syncFullGameLoadingState`, `registerCommand`.
- Verdict: `Non applicable` pour les 3 symboles, classes `Category: New`, avec `Original name: N/A` et `Source: N/A (...)` explicites.
- Justification: symboles propres au bridge web, sans ownership C/H; les portages proprietaires des commandes restent dans `packages/server/src/sv_ccmds.ts`, et le proprietaire de `SCR_BeginLoadingPlaque` reste dans `packages/client/src/cl_scrn.ts`.
- Corrections: entetes locaux ajoutes dans `apps/web/src/full-game-command-bridge.ts`; matrice TS terminee avec `Reste a auditer: 0`.

## Tests de reference

- `npm run verify:full-game:bridge`
- `npm run typecheck`

## Decisions importantes

- Ne pas marquer ce fichier `Couvert C/H`: il adapte le flux navigateur et ne possede pas les entites C/H `SV_Map_f`, `SV_GameMap_f`, `SV_KillServer_f` ou `SCR_BeginLoadingPlaque`.
- `apps/web` consomme ce bridge depuis `apps/web/src/full-game.ts`; `renderer-three` n'a pas de consommation directe attendue pour ce lot d'etat.
- Croisement effectue pendant la session: `SV_GameMap_f`, `SV_Map_f` et `SV_KillServer_f` sont documentes et implementes dans `packages/server/src/sv_ccmds.ts`; `SCR_BeginLoadingPlaque` est documente et exporte dans `packages/client/src/cl_scrn.ts`.

## Prochain lot recommande

- Aucun. Fichier TS termine.
