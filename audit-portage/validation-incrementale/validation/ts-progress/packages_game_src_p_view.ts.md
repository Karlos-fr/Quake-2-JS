# Progress TS - packages/game/src/p_view.ts

- Fichier TS: `packages/game/src/p_view.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_view.ts.md`
- Statut: Termine

## Dernier lot traite

- 2026-05-28: `SV_CalcViewOffset`, `SV_CalcGunOffset`, `SV_AddBlend`, `SV_CalcBlend`, `ClientEndServerFrame`.
- Decision: fonctions portees marquees `Couvert C/H`; la matrice C/H `game_p_view.c.md` les marque `Valide` avec cible proprietaire `packages/game/src/p_view.ts`.
- En-tetes TS verifies: `Original name`, `Source`, `Category: Ported`, export et fidelite presents pour les cinq fonctions.
- Ownership confirme: package `game`, fichier proprietaire unique, aucun doublon proprietaire homonyme dans `packages/` et reexport depuis `packages/game/src/index.ts`.
- 2026-05-28: `SV_CalcRoll`, `G_SetClientEffects`, `G_SetClientEvent`, `G_SetClientSound`, `G_SetClientFrame`, `P_DamageFeedback`, `P_FallingDamage`, `P_WorldEffects`; helpers rencontres `setClientBaseAnimation`, `dotProduct`, `addVec3`, `addVec3Into`, `clearVec3`, `copyVec3`, `subtractVec3`, `normalizeVec3`, `vectorMA`, `clamp`, `randomInt`.
- Decision: fonctions portees du lot marquees `Couvert C/H`; helpers locaux marques `Valide` comme `Adapter` ou `Category: New`.
- `setClientBaseAnimation` est un adapter local du bloc `newanim` de `G_SetClientFrame`; le proprietaire C/H reste `G_SetClientFrame`.
- Les helpers vectoriels/numeriques/random sont `Category: New`, avec `Original name: N/A` et `Source: N/A (<raison courte>)`.
- 2026-05-28: `PlayerViewFrameState`, `painAnimationCycle`, `createPlayerViewFrameState`.
- Decision: `Valide` pour le lot de metadonnees locales.
- `PlayerViewFrameState` et `createPlayerViewFrameState` sont `Category: New` avec `Original name: N/A` et `Source: N/A (local frame-state adapter)`.
- `painAnimationCycle` est `Category: Adapter`, `Original name: i`, source `Quake-2-master/game/p_view.c` (`P_DamageFeedback` function-local static).

## Preuves de session

- Matrice TS lue: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_view.ts.md`.
- Matrice C/H lue: `audit-portage/validation-incrementale/validation/matrices/game_p_view.c.md`.
- Source C lue: `Quake-2-master/game/p_view.c`.
- La matrice C/H marque `SV_CalcViewOffset`, `SV_CalcGunOffset`, `SV_AddBlend`, `SV_CalcBlend` et `ClientEndServerFrame` comme `Valide`, avec cible proprietaire `packages/game/src/p_view.ts`.
- La matrice C/H marque `SV_CalcRoll`, `G_SetClientEffects`, `G_SetClientEvent`, `G_SetClientSound`, `G_SetClientFrame`, `P_DamageFeedback`, `P_FallingDamage` et `P_WorldEffects` comme `Valide`, avec cible proprietaire `packages/game/src/p_view.ts`.
- Les cinq fonctions restantes sont exportees depuis `packages/game/src/p_view.ts` et reexportees par `packages/game/src/index.ts`; aucun autre symbole proprietaire homonyme trouve dans `packages/`.
- `SV_CalcViewOffset`, `SV_CalcGunOffset`, `SV_AddBlend` et `SV_CalcBlend` sont appeles par `ClientEndServerFrame`; `ClientEndServerFrame` est appele par `ClientEndServerFrames` depuis `G_RunFrame`.
- Les exports TS du lot sont dans `packages/game/src/p_view.ts` et sont reexportes par `packages/game/src/index.ts`; aucun autre symbole proprietaire homonyme trouve dans `packages/`.
- `ClientEndServerFrames` transmet bien `sv_rollangle` et `sv_rollspeed` depuis les cvars de `g_main.ts` vers `ClientEndServerFrame`, puis vers `SV_CalcRoll`.
- La matrice C/H marque deja `xyspeed`, `bobmove`, `bobcycle`, `bobfracsin` comme `Valide` avec cible `PlayerViewFrameState.*`.
- `painAnimationCycle` correspond au `static int i` local de `P_DamageFeedback`, pas a une entite proprietaire C/H autonome.

## Integration runtime/apps-web/renderer-three

- Runtime: integre via `ClientEndServerFrames` appele depuis `G_RunFrame`, avec delegation a `ClientEndServerFrame` et aux fonctions du lot.
- apps-web: integre indirectement via `local-gameplay-sync`, qui copie `viewoffset`, `kick_angles`, `gunoffset`, `blend`, `rdflags`, `STAT_FLASHES` et les etats d'entite produits par le runtime.
- renderer-three: integre indirectement pour les sorties visibles; `refresh-entity-sync` transmet `rdflags`, les entites consomment `effects`/`renderfx`/frames et `three-polyblend-overlay` consomme `ps.blend` via la refdef client. Pas d'appel direct attendu depuis `p_view.ts`.

## Tests

- `npm run verify:p-view` OK.

## Prochain lot recommande

- Aucun: matrice TS close pour `packages/game/src/p_view.ts`.

## Blocages

- Aucun.
