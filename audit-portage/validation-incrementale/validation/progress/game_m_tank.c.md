# Progress - Quake-2-master/game/m_tank.c

## Etat courant

- Statut: Termine
- Dernier lot valide: reste complet de `m_tank.c`: pain, callbacks armes, attaques blaster/strike/rocket/chaingun, refire/doattack, death, spawn, differences commander, tables/moves et doublons declaratifs associes.
- Entites validees dans la matrice: 114 / 114.

## Preuves de session

- Comparaison C/TS: `Quake-2-master/game/m_tank.c` vs `packages/game/src/m_tank.ts` pour toutes les entites restantes: pain, armes, attaques, refire/doattack, death, spawn et commander.
- Commentaires d'en-tete ajoutes/verifies pour `tank_pain`, `TankBlaster`, `TankStrike`, `TankRocket`, `TankMachineGun`, `tank_reattack_blaster`, `tank_poststrike`, `tank_refire_rocket`, `tank_doattack_rocket`, `tank_attack`, `tank_dead`, `tank_die`, et `SP_monster_tank`.
- Runtime: `SP_monster_tank` est branche via `g_spawn.ts` (`monster_tank`, `monster_tank_commander`), installe `pain/die/stand/walk/run/attack/sight/idle`, et `G_RunFrame` atteint les tables via `monster_think`/`M_MoveFrame`; les callbacks armes produisent les projectiles, muzzle flashes, bullets et sons attendus.
- apps/web: le flux full-game passe par le serveur/runtime porte et consomme les snapshots, sons et messages runtime produits; pas de logique parallele web trouvee pour remplacer `m_tank`.
- renderer-three: les modeles/frames/skinnum de tank sortent via les entity states client et sont consommes par les refresh entities; muzzle flashes/projectiles/temp outputs, dlights/particules et sons passent par le flux client/refresh/renderer/audio sans manque ouvert pour ce lot.

## Tests lances

- `npm run verify:m-tank`
- `npm run verify:m-tank:header`
- `npm run verify:m-tank:source-parity`
- `npm run typecheck`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:audio-routing`
- `npm run verify:refresh-entity:alias-flags`

## Decisions

- Retire lors de la session precedente cinq lignes qui correspondaient a des declarations en avant C et non a des entites proprietaires: `tank_refire_rocket`, `tank_doattack_rocket`, `tank_reattack_blaster`, la premiere ligne `tank_walk`, la premiere ligne `tank_run`.
- Aucun `tank_search` n'existe dans `m_tank.c`; `SP_monster_tank` ne renseigne pas `monsterinfo.search`, donc aucun manque runtime/web/renderer n'est ouvert pour une recherche tank dans ce lot.

## Prochain lot recommande

- Aucun lot restant dans `game_m_tank.c.md`: toutes les lignes sont `Valide`.
