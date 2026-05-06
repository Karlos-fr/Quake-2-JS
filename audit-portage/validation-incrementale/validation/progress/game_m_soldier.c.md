# Progress - Quake-2-master/game/m_soldier.c

## Etat courant

- Statut fichier: Termine.
- Dernier lot traite: fermeture complete de `m_soldier.c` hors `m_soldier.h`: blocs walk/run, pain, muzzle tables, attack/refire, duck/dodge, death/gibs et spawn variants.
- Matrice apres lot: 145 entites, 137 `Valide`, 8 `Non applicable`, 0 `A verifier`.
- Commentaires d'en-tete: completes dans `packages/game/src/m_soldier.ts` pour les fonctions portees du lot restant (`soldier_walk1_random`, `soldier_walk`, `soldier_run`, `soldier_pain`, `soldier_fire`, wrappers fire, refires, duck/dodge, death et spawn variants).

## Preuves de session

- Source C lue: `Quake-2-master/game/m_soldier.c`.
- Cible TS lue: `packages/game/src/m_soldier.ts`.
- Ownership confirme: `packages/game/src/m_soldier.ts` porte le comportement proprietaire du monstre soldat; `g_spawn.ts` ne fait que dispatcher les spawns.
- Runtime confirme: `g_spawn.ts` enregistre `monster_soldier_light`, `monster_soldier` et `monster_soldier_ss`, puis `ED_CallSpawn`/`G_SpawnEntities` rendent le spawn atteignable depuis le flux serveur/game normal; les callbacks stand/idle/sight sont installes via `monsterinfo` et executes par le runtime monstre.
- `apps/web`: aucune logique parallele attendue pour ces entites; le navigateur doit declencher le flux via le runtime full-game et consommer les sorties runtime audio/snapshot.
- `packages/renderer-three`: integration attendue indirectement pour le modele, le skin et les frames du soldat; le lot ne produit pas de renderer direct, mais les snapshots/runtime rendent l'entite visible et le renderer-three consomme ce flux.
- Preuve C vs TS: `verify:m-soldier:source-parity` compare les fonctions exportees, toutes les tables `mframe_t`/`mmove_t`, les precaches, les consommateurs de `random`/`crandom`/`rand`, et maintenant les tables privees `blaster_flash`, `shotgun_flash`, `machinegun_flash`.
- Preuve comportement: `verify:m-soldier` couvre spawn variants, registres save, transitions stand/walk/run, refire, sight/duck/dodge, armes/muzzleflashes, callbacks `M_MoveFrame`, pain, death/gibs et headshot.
- Tests lances avec succes: `npm run verify:m-soldier`, `npm run verify:m-soldier:source-parity`, `npm run verify:m-soldier:header`, `npm run verify:g-spawn`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:audio-routing`, `npm run verify:web-render-order`, `npm run typecheck`, `git diff --check`.

## Decisions

- La premiere ligne `soldier_stand` de la matrice correspond au prototype C; elle est `Non applicable` avec une note, la definition etant validee sur sa ligne dediee.
- La premiere ligne `soldier_run` restante correspond au prototype C; elle est `Non applicable` avec une note, la definition etant validee sur sa ligne dediee.
- Les lignes `r`, `n` et `flash_index` sont des variables locales C; elles sont `Non applicable` avec justification, le comportement etant valide via `soldier_pain`, `soldier_dodge`, `soldier_fire` et `soldier_die`.
- Les lignes declaratives `soldier_frames_stand1` et `soldier_frames_stand3` ont ete validees en plus des lignes global/table du debut de matrice.
- Les notes de matrice restent vides pour les lignes `Valide`; seules les informations importantes de classification sont conservees en note.

## Prochain lot recommande

Aucun lot restant dans `game_m_soldier.c.md`: toutes les lignes sont `Valide` ou `Non applicable`. Ne pas inclure `m_soldier.h` dans cette fermeture; il reste un fichier separe.

## Blocages

- Aucun blocage ouvert pour le lot traite.
