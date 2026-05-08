# Progress TS - packages/game/src/g_cmds.ts

- Statut: En cours
- Dernier lot valide: 3 interfaces `GameCommandCvars`, `GameCommandHooks`, `GameCommandContext` confirmees en `Category: New` avec `Original name: N/A` et `Source declaree: N/A (explicit TS runtime context)`.
- Prochain lot recommande: traiter les helpers locaux `TS sans lien source`, en commencant par `cheatsAllowed`, `giveSpawnedItem`, `callItemUse` et `callItemDrop`.
- Tests de reference:
  - `npm run verify:g-cmds`
  - `npm run typecheck`
- Blocages: aucun pour le lot `Couvert C/H`.
- Decisions:
  - `packages/game/src/g_cmds.ts` reste le proprietaire TS des fonctions portees depuis `Quake-2-master/game/g_cmds.c`.
  - `packages/game/src/g_main.ts` expose un autre `ClientCommand` proprietaire de `game/g_main.c`; ce n'est pas un doublon proprietaire de `g_cmds.c`.
  - Les helpers prives `ClientTeam` et `OnSameTeam` dans `packages/game/src/g_combat.ts` sont `Category: New`; ils ne revendiquent pas l'ownership `g_cmds.c`.
  - Les interfaces `GameCommandCvars`, `GameCommandHooks` et `GameCommandContext` sont des contrats TypeScript explicites pour remplacer les globals/`gi` C dans le flux commande; aucun proprietaire C/H distinct n'est attendu.
