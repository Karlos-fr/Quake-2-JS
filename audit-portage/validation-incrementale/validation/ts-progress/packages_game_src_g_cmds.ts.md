# Progress TS - packages/game/src/g_cmds.ts

- Statut: En cours
- Dernier lot valide: 25 lignes `Couvert C/H` auditees et confirmees contre `validation/matrices/game_g_cmds.c.md`.
- Prochain lot recommande: traiter les 3 interfaces `GameCommandCvars`, `GameCommandHooks`, `GameCommandContext` en `Category: New`, puis les helpers locaux `TS sans lien source`.
- Tests de reference:
  - `npm run verify:g-cmds`
  - `npm run typecheck`
- Blocages: aucun pour le lot `Couvert C/H`.
- Decisions:
  - `packages/game/src/g_cmds.ts` reste le proprietaire TS des fonctions portees depuis `Quake-2-master/game/g_cmds.c`.
  - `packages/game/src/g_main.ts` expose un autre `ClientCommand` proprietaire de `game/g_main.c`; ce n'est pas un doublon proprietaire de `g_cmds.c`.
  - Les helpers prives `ClientTeam` et `OnSameTeam` dans `packages/game/src/g_combat.ts` sont `Category: New`; ils ne revendiquent pas l'ownership `g_cmds.c`.
