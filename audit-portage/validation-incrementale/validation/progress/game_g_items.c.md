# Progress - Quake-2-master/game/g_items.c

## Dernier lot valide

- `Use_Weapon` reference par `g_items.c` et porte dans `packages/game/src/p_weapon.ts`, avec dispatch depuis `packages/game/src/g_items.ts`, `packages/game/src/g_cmds.ts` et le chemin demo web via `packages/game/src/local-game-bootstrap.ts`.

## Tests de reference

- `npm run verify:g-items`
- `npm run verify:p-weapon`

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- `Drop_Weapon`, en gardant la meme attention au rattachement `g_items.c` declarations/table vers le corps original `game/p_weapon.c` et le port `packages/game/src/p_weapon.ts`.
