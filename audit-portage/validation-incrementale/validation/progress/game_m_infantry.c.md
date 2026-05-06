# Progress - Quake-2-master/game/m_infantry.c

## Etat courant

- Statut: Termine
- Dernier lot valide: fermeture du fichier `m_infantry.c`: pain, aim table, machinegun, sight, death/dead, duck/dodge, attaques melee/machinegun et spawn.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/game_m_infantry.c.md`
- TS proprietaire: `packages/game/src/m_infantry.ts`

## Lot valide pendant cette session

Entites validees:

- Sons: `sound_pain1`, `sound_pain2`, `sound_die1`, `sound_die2`, `sound_gunshot`, `sound_weapon_cock`, `sound_punch_swing`, `sound_punch_hit`, `sound_sight`, `sound_search`, `sound_idle`
- Tables/moves/fonctions: `infantry_frames_stand`, `infantry_move_stand`, `infantry_stand`, `infantry_frames_fidget`, `infantry_move_fidget`, `infantry_fidget`, `infantry_frames_walk`, `infantry_move_walk`, `infantry_walk`, `infantry_frames_run`, `infantry_move_run`, `infantry_run`
- Lignes declaratives associees: `infantry_frames_stand`, `infantry_frames_fidget`, `infantry_frames_walk`, `infantry_frames_run`

Checklist appliquee:

- Ownership confirme dans `packages/game/src/m_infantry.ts`.
- Doublons recherches: les constantes TS `SOUND_*` sont des chemins de precache/adapters locaux pour les handles C `sound_*`; les handles runtime `sound_*` restent proprietaires du module. La ligne `InfantryMachineGun` dupliquee dans la matrice n'a pas ete traitee dans ce lot.
- Comparaison C/H vs TS effectuee pour les chemins de sons precaches, les distances des frames, les bornes `firstframe`/`lastframe`, les `endfunc`, `infantry_stand`, `infantry_fidget`, `infantry_walk`, `infantry_run`.
- Commentaires d'en-tete verifies; `infantry_stand`, `infantry_fidget`, `infantry_walk` et `infantry_run` ont ete completes dans `packages/game/src/m_infantry.ts`.
- Branchement runtime verifie via `SP_monster_infantry`, `ED_CallSpawn`, `G_RunFrame`, `M_MoveFrame`, `walkmonster_start` et les callbacks `monsterinfo`.
- `apps/web` verifie: le flux web local/full-game delegue au runtime/client porte et consomme les frames de rafraichissement; pas de logique infantry parallele constatee.
- `packages/renderer-three` verifie: les sorties visibles attendues sont le modele `models/monsters/infantry/tris.md2` et les frames d'entite produites par runtime/client; elles passent par `ClientRefreshFrame` puis les adapters `refresh-entity-sync`/`gl_rmain`. Les sons restent du ressort audio/client, pas du renderer.

## Tests lances

- `npm run verify:m-infantry`
- `npm run verify:m-infantry:header`
- `npm run verify:m-infantry:source-parity`
- `npm run typecheck`

Tous passent pendant cette session.

## Lot valide pendant cette session de reprise

Entites validees:

- Pain: `infantry_frames_pain1`, `infantry_move_pain1`, `infantry_frames_pain2`, `infantry_move_pain2`, `infantry_pain`
- Machinegun: `aimangles`, `InfantryMachineGun`
- Sight/death: `infantry_sight`, `infantry_dead`, `infantry_frames_death1`, `infantry_move_death1`, `infantry_frames_death2`, `infantry_move_death2`, `infantry_frames_death3`, `infantry_move_death3`, `infantry_die`
- Duck/dodge: `infantry_duck_down`, `infantry_duck_hold`, `infantry_duck_up`, `infantry_frames_duck`, `infantry_move_duck`, `infantry_dodge`
- Attack: `infantry_cock_gun`, `infantry_fire`, `infantry_frames_attack1`, `infantry_move_attack1`, `infantry_swing`, `infantry_smack`, `infantry_frames_attack2`, `infantry_move_attack2`, `infantry_attack`
- Spawn: `SP_monster_infantry`
- Lignes declaratives associees: `infantry_frames_pain1`, `infantry_frames_pain2`, `infantry_frames_death1`, `infantry_frames_death2`, `infantry_frames_death3`, `infantry_frames_duck`, `infantry_frames_attack1`, `infantry_frames_attack2`

Entrees non applicables:

- Prototype C initial `InfantryMachineGun`, valide sur la ligne de definition.
- Variables locales generees comme globals: `n` dans `InfantryMachineGun`, `infantry_die`, `infantry_cock_gun`, et `flash_number` dans `InfantryMachineGun`; comportement valide avec les fonctions proprietaires.

Checklist appliquee:

- Ownership confirme dans `packages/game/src/m_infantry.ts`; aucun doublon proprietaire concurrent trouve hors export normal du module.
- Comparaison C vs TS effectuee sur les tables `mframe_t`, les `mmove_t`, les distances, callbacks, bornes de frames, sons, random macro/integer rand, machinegun/muzzleflash, pain, duck, death/gibs, melee et spawn.
- Commentaires d'en-tete verifies et completes pour `infantry_sight`, `infantry_dead`, `infantry_die`, `infantry_duck_down`, `infantry_duck_hold`, `infantry_duck_up`, `infantry_cock_gun`, `infantry_fire`, `infantry_swing`, `infantry_smack`, `infantry_attack` et `SP_monster_infantry`.
- Runtime verifie via `SP_monster_infantry`, `ED_CallSpawn`, `walkmonster_start`, `G_RunFrame`, `M_MoveFrame`, callbacks `monsterinfo`, `monster_fire_bullet`, sons, gibs et save registry.
- `apps/web` verifie: pas de logique infantry parallele; le flux navigateur consomme les sorties runtime/client porte, sons, muzzleflash et refresh frames.
- `packages/renderer-three` verifie: les sorties visibles attendues sont modele infantry, frames, oldframe/modelindex, muzzleflash/dlights/particules et gibs; consommation indirecte via snapshots/client refresh/Three, pas de branchement direct gameplay attendu.

## Tests lances pendant cette session de reprise

- `npm run verify:m-infantry`
- `npm run verify:m-infantry:header`
- `npm run verify:m-infantry:source-parity`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Tous passent pendant cette session.

## Decisions et points de reprise

- `m_infantry.c` est clos dans cette matrice: 79 `Valide`, 5 `Non applicable`, aucun `A verifier`.
- Prochain lot recommande: reprendre `m_infantry.h` dans une session separee.
