# Progress TS - packages/game/src/g_svcmds.ts

- Statut: Termine
- Lot traite: fichier complet, 18 symboles
- Derniere validation: validation TS croisee complete
- Prochain lot recommande: Aucun

## Decisions

- Les 10 symboles proprietaires de `Quake-2-master/game/g_svcmds.c` sont `Couvert C/H` via `game_g_svcmds.c.md`, qui les marque `Valide` avec `packages/game/src/g_svcmds.ts` comme proprietaire TS attendu.
- `GameServerCommandState`, `GameServerCommandContext`, `FREE_IPFILTER_COMPARE`, `createGameServerCommandState`, `getFilterBanValue`, `stringsEqualIgnoreCase`, `packFilterBytes` et `unpackFilterBytes` sont du code `New` local/adaptateur d'etat, avec `Original name: N/A` et `Source: N/A (...)` explicites.
- Le doublon nominal `stringsEqualIgnoreCase` existe dans d'autres fichiers game, mais chaque occurrence est un helper local prive autour de `Q_stricmp`; aucun ownership source C/H n'est masque dans ce fichier.

## Tests

- `npm run verify:g-svcmds`
- `npm run verify:g-main`
- `npm run verify:server:ccmds`
- `npm run verify:full-game:server-host`
- `npm run typecheck`

## Integration

- Runtime: integre via `g_main.ts` dans l'export game `ServerCommand`, puis appele par `SV_ServerCommand_f`; `SV_FilterPacket` est utilise par le flux `ClientConnect`.
- apps/web: integre via le host full-game et l'API game portee; le writer `listip.cfg` passe par le callback injecte.
- renderer-three: non applicable, ce fichier gere des commandes serveur et filtres IP sans produire de donnees de rendu.
