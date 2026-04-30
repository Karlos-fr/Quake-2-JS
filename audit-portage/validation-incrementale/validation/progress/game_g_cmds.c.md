# Progress - Quake-2-master/game/g_cmds.c

## Session 2026-04-30

- Lot valide: `ClientTeam`, `OnSameTeam` et temporaires C associes (`p`, `value`, `ent1Team`, `ent2Team`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; branchement runtime verifie via `Cmd_Say_f`, `ClientCommand`, `g_main.ts` et exports `index.ts`.
- Integration web/renderer: aucune reference directe dans `apps/web` ou `packages/renderer-three`; logique gameplay portee dans `packages/game`.
- Corrections: commentaires d'en-tete completes pour `ClientTeam` et `OnSameTeam` dans `packages/game/src/g_cmds.ts`.
- Tests de reference: `npm run verify:g-cmds`; `npm run typecheck`.
- Blocages: aucun pour ce lot.
- Lot valide: `SelectNextItem`, `SelectPrevItem`, `ValidateSelectedItem` et temporaires C associes (`it`; `cl`, `i`, `index` controles dans les boucles TS).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; branchement runtime verifie via `ClientCommand` (`invnext`, `invprev`, `invnextw`, `invprevw`, `invnextp`, `invprevp`), `Cmd_InvUse_f`, `Cmd_InvDrop_f` et les appels depuis `g_items.ts`.
- Integration web/renderer: aucune logique runtime remplacee dans `apps/web`; aucune compensation gameplay dans `packages/renderer-three`.
- Corrections: commentaires d'en-tete completes pour `SelectNextItem`, `SelectPrevItem` et `ValidateSelectedItem` dans `packages/game/src/g_cmds.ts`.
- Tests de reference: `npm run verify:g-cmds`; `npm run typecheck`.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: `Cmd_Give_f` et temporaires locaux associes (`name`, `it`, `index`, `i`, `give_all`, `it_ent`).
