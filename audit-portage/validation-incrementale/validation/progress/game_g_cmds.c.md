# Progress - Quake-2-master/game/g_cmds.c

## Session 2026-04-30

- Lot valide: `ClientTeam`, `OnSameTeam` et temporaires C associes (`p`, `value`, `ent1Team`, `ent2Team`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; branchement runtime verifie via `Cmd_Say_f`, `ClientCommand`, `g_main.ts` et exports `index.ts`.
- Integration web/renderer: aucune reference directe dans `apps/web` ou `packages/renderer-three`; logique gameplay portee dans `packages/game`.
- Corrections: commentaires d'en-tete completes pour `ClientTeam` et `OnSameTeam` dans `packages/game/src/g_cmds.ts`.
- Tests de reference: `npm run verify:g-cmds`; `npm run typecheck`.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: `SelectNextItem`, `SelectPrevItem`, `ValidateSelectedItem` et leurs temporaires locaux associes.
