# Progress - Quake-2-master/game/m_gunner.c

## Statut

Termine cote fichier `m_gunner.c`.

## Lot valide dans cette session

Fermeture complete depuis le debut du fichier jusqu'a `SP_monster_gunner`.

Entites couvertes:
- sons globaux `sound_pain`, `sound_pain2`, `sound_death`, `sound_idle`, `sound_open`, `sound_search`, `sound_sight`;
- callbacks sonores `gunner_idlesound`, `gunner_sight`, `gunner_search`;
- stand/fidget/walk/run/runandshoot et tables/moves associes;
- pain 1/2/3, death/gib/dead et tables/moves associes;
- dodge/duck et callbacks `gunner_duck_down`, `gunner_duck_hold`, `gunner_duck_up`;
- attaques chaingun/grenade, `GunnerFire`, `GunnerGrenade`, muzzle flashes, projectiles et moves associes;
- `gunner_attack`, `gunner_fire_chain`, `gunner_refire_chain`;
- spawn `SP_monster_gunner`, precache sons/modeles, callbacks `monsterinfo`, save registry et spawn registry;
- lignes declaratives de tables/moves generees par la matrice.

## Decisions

- Les declarations forward C (`GunnerGrenade`, `GunnerFire`, `gunner_fire_chain`, `gunner_refire_chain`, `gunner_stand`) sont marquees `Non applicable`; les definitions proprietaires correspondantes sont validees plus bas dans la matrice.
- Les variables locales C `n` et `flash_number` sont marquees `Non applicable`; leur comportement est valide via `gunner_die`, `GunnerFire` et `GunnerGrenade`.
- Aucune correction TypeScript necessaire dans `packages/game/src/m_gunner.ts`.
- `m_gunner.h` et `AVANCEMENT_GLOBAL.md` non modifies.

## Preuves

- Comparaison C vs TS: tables `mframe_t`/`mmove_t`, distances, callbacks, bornes de frames, sons precaches, modele, spawn et fonctions exportees verifiees par `verify:m-gunner:source-parity`.
- Header: constantes representatives et `MODEL_SCALE` verifiees par `verify:m-gunner:header`.
- Runtime: `ED_CallSpawn` -> `SP_monster_gunner`, puis `walkmonster_start`, `G_RunFrame`/`monster_think`/`M_MoveFrame`, callbacks `monsterinfo`, save registry et callbacks de moves.
- `apps/web`: le comportement est consomme par le flux full-game/local via spawn runtime, snapshots serveur, configstrings/assets, sons et temp outputs; aucune logique parallele masquante detectee pour `monster_gunner`.
- `renderer-three`: les sorties visibles attendues sont consommees via snapshots/refresh entities: modele MD2 `models/monsters/gunner/tris.md2`, `modelindex`, `frame`, `oldframe`, `backlerp`, `skinnum`, muzzle flash/temp outputs et projectiles/grenades.

## Tests lances

- `npm run verify:m-gunner`
- `npm run verify:m-gunner:header`
- `npm run verify:m-gunner:source-parity`
- `npm run verify:g-spawn`
- `npm run verify:g-save`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:audio-routing`
- `npm run verify:web-render-order`

## Prochain lot recommande

Aucun pour `m_gunner.c`: toutes les lignes sont `Valide` ou `Non applicable`.
