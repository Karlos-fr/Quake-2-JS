# Progress TS - packages/game/src/g_cmds.ts

- Statut: Termine
- Dernier lot valide: helpers locaux restants `scanWeapon`, `isFloodBlocked`, `buildHelpData`, `cprintf`, `qstricmp`, `atoi`, `positiveModulo`, `padLeft` et `pad2` confirmes en `Category: New` avec `Original name: N/A` et `Source declaree: N/A (local helper)`.
- Prochain lot recommande: aucun pour `packages/game/src/g_cmds.ts`.
- Tests de reference:
  - `npm run verify:g-cmds`
  - `npm run typecheck`
- Blocages: aucun pour le lot `Couvert C/H`.
- Decisions:
  - `packages/game/src/g_cmds.ts` reste le proprietaire TS des fonctions portees depuis `Quake-2-master/game/g_cmds.c`.
  - `packages/game/src/g_main.ts` expose un autre `ClientCommand` proprietaire de `game/g_main.c`; ce n'est pas un doublon proprietaire de `g_cmds.c`.
  - `ClientTeam` et `OnSameTeam` restent proprietaires dans `packages/game/src/g_cmds.ts`; les doublons prives precedemment presents dans `packages/game/src/g_combat.ts` ont ete retires et `g_combat.ts` importe maintenant `OnSameTeam`.
  - Les interfaces `GameCommandCvars`, `GameCommandHooks` et `GameCommandContext` sont des contrats TypeScript explicites pour remplacer les globals/`gi` C dans le flux commande; aucun proprietaire C/H distinct n'est attendu.
  - `cheatsAllowed`, `giveSpawnedItem`, `callItemUse` et `callItemDrop` sont des helpers prives subordonnes a `g_cmds.c`: ils factorisent des blocs locaux ou dispatchent les callbacks string-backed vers leurs proprietaires TS, sans revendiquer d'entite C/H distincte.
  - `scanWeapon`, `isFloodBlocked`, `buildHelpData`, `cprintf`, `qstricmp`, `atoi`, `positiveModulo`, `padLeft` et `pad2` sont des helpers prives subordonnes aux fonctions portees de `g_cmds.c`; ils ne revendiquent aucune entite C/H distincte.
