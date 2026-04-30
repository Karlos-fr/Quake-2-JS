# Progress - Quake-2-master/game/g_func.c

## Dernier lot valide

- 2026-04-30: mouvement lineaire `Move_Done`, `Move_Final`, `Move_Begin` et variable locale `frames`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:76-109` avec `packages/game/src/g_func.ts:76-130`.
- Effets verifies: `velocity`, `think`, `nextthink`, `remaining_distance`, appel `endfunc`, calcul `floor(frames)`.
- Branchement: `Move_Calc` programme/appelle `Move_Begin`; `G_RunFrame` execute les `think` via le runtime game.
- Integration: aucune compensation directe dans `apps/web` ou `packages/renderer-three`.
- Tests: `npm run verify:g-func` OK; test inline `Move_*` OK.

- 2026-04-30: macros initiales `PLAT_LOW_TRIGGER`, `STATE_TOP`, `STATE_BOTTOM`, `STATE_UP`, `STATE_DOWN`, `DOOR_START_OPEN`, `DOOR_REVERSE`, `DOOR_CRUSHER`, `DOOR_NOMONSTER`, `DOOR_TOGGLE`, `DOOR_X_AXIS`, `DOOR_Y_AXIS`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:56-69` avec `packages/game/src/runtime.ts:859-870`.
- Branchement: constantes importees par `packages/game/src/g_func.ts` et reexportees par `packages/game/src/index.ts`.
- Integration: aucune reference directe dans `apps/web` ou `packages/renderer-three`; logique runtime uniquement.
- Tests: `npm run verify:g-func` OK.

## Prochain lot recommande

- Valider le lot suivant de mouvement accelere `Think_AccelMove`, `Move_Calc`, `AccelerationDistance`, `plat_CalcAcceleratedMove`, `plat_Accelerate` et leurs temporaires associes.

## Blocages

- Aucun pour ce lot.

## Decisions

- Les macros de `g_func.c` sont portees comme constantes runtime partagees dans `packages/game/src/runtime.ts`; ce rattachement reste acceptable car `g_func.ts` les consomme directement et `index.ts` les expose depuis le package game.
