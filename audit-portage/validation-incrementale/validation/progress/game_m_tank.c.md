# Progress - Quake-2-master/game/m_tank.c

## Etat courant

- Statut: En cours
- Dernier lot valide: sons/globals initiaux, callbacks de base (`tank_sight`, `tank_footstep`, `tank_thud`, `tank_windup`, `tank_idle`), moves stand/walk/run et tables declaratives associees.
- Entites validees dans la matrice: 44 / 114.

## Preuves de session

- Comparaison C/TS: `Quake-2-master/game/m_tank.c` vs `packages/game/src/m_tank.ts` pour les sons, callbacks, frames et moves stand/walk/run.
- Commentaires d'en-tete ajoutes/verifies pour `tank_sight`, `tank_footstep`, `tank_thud`, `tank_windup`, `tank_idle`, `tank_stand`, `tank_walk`, `tank_run`.
- Runtime: `SP_monster_tank` est branche via `g_spawn.ts` (`monster_tank`, `monster_tank_commander`), installe `stand/walk/run/sight/idle`, et `G_RunFrame` atteint les frames via `monster_think`/`M_MoveFrame`; `FindTarget` et `ai_stand`/`ai_walk` atteignent `sight` et `idle`.
- apps/web: le flux full-game passe par le serveur/runtime porte et consomme les snapshots/sounds produits; pas de logique parallele web trouvee pour remplacer `m_tank`.
- renderer-three: les frames/modeles visibles sortent via les entity states client et sont consommes par `refresh-entity-sync`; les sons passent par le routage full-game/audio, sans manque ouvert pour ce lot.

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

- Retire de la matrice cinq lignes qui correspondaient a des declarations en avant C et non a des entites proprietaires: `tank_refire_rocket`, `tank_doattack_rocket`, `tank_reattack_blaster`, la premiere ligne `tank_walk`, la premiere ligne `tank_run`.
- Aucun `tank_search` n'existe dans `m_tank.c`; `SP_monster_tank` ne renseigne pas `monsterinfo.search`, donc aucun manque runtime/web/renderer n'est ouvert pour une recherche tank dans ce lot.

## Prochain lot recommande

- Valider le bloc pain: `tank_frames_pain1`, `tank_move_pain1`, `tank_frames_pain2`, `tank_move_pain2`, `tank_frames_pain3`, `tank_move_pain3`, `tank_pain`, et les tables declaratives pain associees.
