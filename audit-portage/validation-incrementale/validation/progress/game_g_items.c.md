# Progress - Quake-2-master/game/g_items.c

## Dernier lot valide

- `Use_Weapon` reference par `g_items.c` et porte dans `packages/game/src/p_weapon.ts`, avec dispatch depuis `packages/game/src/g_items.ts`, `packages/game/src/g_cmds.ts` et le chemin demo web via `packages/game/src/local-game-bootstrap.ts`.

Passe rapide post-validation du 2026-04-30: controle limite aux lignes deja `Valide` (`Pickup_Weapon`, `Use_Weapon`). Branchements runtime confirmes (`Touch_Item`/dispatch item pour pickup, commandes et bootstrap local pour use); integration `apps/web` attendue via la synchro gameplay/client et le bootstrap local; pas de branchement dedie `renderer-three` attendu au niveau de ces fonctions, les sorties visibles transitant par les entites refresh MD2 generiques et le HUD client.

## Tests de reference

- `npm run verify:g-items`
- `npm run verify:p-weapon`

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- `Drop_Weapon`, en gardant la meme attention au rattachement `g_items.c` declarations/table vers le corps original `game/p_weapon.c` et le port `packages/game/src/p_weapon.ts`.
