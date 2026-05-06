# Progress - Quake-2-master/game/m_infantry.c

## Etat courant

- Statut: En cours
- Dernier lot valide: sons globaux et bloc initial `stand` / `fidget` / `walk` / `run`
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

## Decisions et points de reprise

- Les lignes `n` de la matrice semblent etre des variables locales detectees comme globals; ne pas les valider sans verifier et probablement les retirer ou les marquer non applicables avec justification lors du lot concerne.
- `InfantryMachineGun` apparait deux fois dans la matrice; garder ce doublon pour le lot attaque/machinegun ou corriger la matrice apres verification.
- Prochain lot recommande: `infantry_frames_pain1`, `infantry_move_pain1`, `infantry_frames_pain2`, `infantry_move_pain2`, `infantry_pain`, puis verifier si `aimangles` et `InfantryMachineGun` peuvent etre traites dans le meme lot suivant ou doivent rester separes.
