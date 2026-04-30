# Progress - Quake-2-master/game/g_items.c

## Dernier lot valide

- `Drop_Weapon` reference par `g_items.c` et porte dans `packages/game/src/p_weapon.ts`, avec dispatch depuis `packages/game/src/g_cmds.ts` (`Cmd_Drop_f`/`Cmd_InvDrop_f`) et le chemin runtime normal de commandes.

Passe rapide post-validation du 2026-04-30: controle limite aux lignes deja `Valide` (`Pickup_Weapon`, `Use_Weapon`). Branchements runtime confirmes (`Touch_Item`/dispatch item pour pickup, commandes et bootstrap local pour use); integration `apps/web` attendue via la synchro gameplay/client et le bootstrap local; pas de branchement dedie `renderer-three` attendu au niveau de ces fonctions, les sorties visibles transitant par les entites refresh MD2 generiques et le HUD client.

Validation `Drop_Weapon` du 2026-04-30: comparaison avec `game/p_weapon.c` confirmee (`DF_WEAPONS_STAY`, refus du dernier exemplaire de l'arme courante/nouvelle, `Drop_Item`, decrement inventaire). Header TS mis a jour pour documenter que `Drop_Item` porte est le chemin par defaut. Runtime branche via `Cmd_Drop_f`/`Cmd_InvDrop_f` et dispatch `g_cmds.ts`; `apps/web` passe par les commandes client forwardees au runtime; `renderer-three` non specifique, il consomme l'entite item visible generique produite par `Drop_Item`.

## Tests de reference

- `npm run verify:g-items`
- `npm run verify:p-weapon`
- `npm run typecheck`
- Sonde directe `Drop_Weapon` normal/current/DF_WEAPONS_STAY via `npx tsx` stdin.

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- `Weapon_Blaster`, en gardant la meme attention au rattachement `g_items.c` declarations/table vers le corps original `game/p_weapon.c` et le port `packages/game/src/p_weapon.ts`.
