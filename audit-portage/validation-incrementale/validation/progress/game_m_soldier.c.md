# Progress - Quake-2-master/game/m_soldier.c

## Etat courant

- Statut fichier: En cours.
- Dernier lot traite: sons globaux initiaux, `soldier_idle`, `soldier_cock`, bloc stand (`soldier_frames_stand1`, `soldier_move_stand1`, `soldier_frames_stand3`, `soldier_move_stand3`, `soldier_stand`) et `soldier_sight`; aucune entite `search` n'existe dans `m_soldier.c`.
- Matrice apres lot: 145 entites, 22 `Valide`, 1 `Non applicable`, 122 `A verifier`.
- Commentaires d'en-tete: completes dans `packages/game/src/m_soldier.ts` pour `soldier_idle`, `soldier_cock`, `soldier_stand` et `soldier_sight`.

## Preuves de session

- Source C lue: `Quake-2-master/game/m_soldier.c`.
- Cible TS lue: `packages/game/src/m_soldier.ts`.
- Ownership confirme: `packages/game/src/m_soldier.ts` porte le comportement proprietaire du monstre soldat; `g_spawn.ts` ne fait que dispatcher les spawns.
- Runtime confirme: `g_spawn.ts` enregistre `monster_soldier_light`, `monster_soldier` et `monster_soldier_ss`, puis `ED_CallSpawn`/`G_SpawnEntities` rendent le spawn atteignable depuis le flux serveur/game normal; les callbacks stand/idle/sight sont installes via `monsterinfo` et executes par le runtime monstre.
- `apps/web`: aucune logique parallele attendue pour ces entites; le navigateur doit declencher le flux via le runtime full-game et consommer les sorties runtime audio/snapshot.
- `packages/renderer-three`: integration attendue indirectement pour le modele, le skin et les frames du soldat; le lot ne produit pas de renderer direct, mais les snapshots/runtime rendent l'entite visible et le renderer-three consomme ce flux.
- Tests lances avec succes: `npm run verify:m-soldier`, `npm run verify:m-soldier:source-parity`, `npm run verify:m-soldier:header`, `npm run verify:g-spawn`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:audio-routing`, `npm run typecheck`.

## Decisions

- La premiere ligne `soldier_stand` de la matrice correspond au prototype C; elle est `Non applicable` avec une note, la definition etant validee sur sa ligne dediee.
- Les lignes declaratives `soldier_frames_stand1` et `soldier_frames_stand3` ont ete validees en plus des lignes global/table du debut de matrice.
- Les notes de matrice restent vides pour les lignes `Valide`; seules les informations importantes de classification sont conservees en note.

## Prochain lot recommande

Valider le bloc walk/run coherent: `soldier_walk1_random`, `soldier_frames_walk1`, `soldier_move_walk1`, `soldier_frames_walk2`, `soldier_move_walk2`, `soldier_walk`, `soldier_run`, `soldier_frames_start_run`, `soldier_move_start_run`, `soldier_frames_run`, `soldier_move_run`, et les lignes declaratives correspondantes.

## Blocages

- Aucun blocage ouvert pour le lot traite.
