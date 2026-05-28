# Progress TS - packages/game/src/p_view.ts

- Fichier TS: `packages/game/src/p_view.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_view.ts.md`
- Statut: En cours

## Dernier lot traite

- 2026-05-28: `PlayerViewFrameState`, `painAnimationCycle`, `createPlayerViewFrameState`.
- Decision: `Valide` pour le lot de metadonnees locales.
- `PlayerViewFrameState` et `createPlayerViewFrameState` sont `Category: New` avec `Original name: N/A` et `Source: N/A (local frame-state adapter)`.
- `painAnimationCycle` est `Category: Adapter`, `Original name: i`, source `Quake-2-master/game/p_view.c` (`P_DamageFeedback` function-local static).

## Preuves de session

- Matrice TS lue: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_view.ts.md`.
- Matrice C/H lue: `audit-portage/validation-incrementale/validation/matrices/game_p_view.c.md`.
- Source C lue: `Quake-2-master/game/p_view.c`.
- La matrice C/H marque deja `xyspeed`, `bobmove`, `bobcycle`, `bobfracsin` comme `Valide` avec cible `PlayerViewFrameState.*`.
- `painAnimationCycle` correspond au `static int i` local de `P_DamageFeedback`, pas a une entite proprietaire C/H autonome.

## Integration runtime/apps-web/renderer-three

- Runtime: integre via `ClientEndServerFrame` et `P_DamageFeedback`.
- apps-web: non applicable directement; le web consomme l'etat serveur produit en aval.
- renderer-three: non applicable directement; ces helpers ne produisent pas eux-memes de sortie de rendu, seulement des champs playerstate/animation consommes ensuite.

## Tests

- `npm run verify:p-view` OK.

## Prochain lot recommande

- Valider `SV_CalcRoll` contre `game_p_view.c.md` et verifier son ownership TS, ses metadonnees et le passage des cvars `sv_rollangle`/`sv_rollspeed`.

## Blocages

- Aucun.
