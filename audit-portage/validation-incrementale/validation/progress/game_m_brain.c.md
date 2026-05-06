# Progress - Quake-2-master/game/m_brain.c

## Dernier lot valide

2026-05-06 - Gros lot defense/pain/duck/attaque/melee/death/spawn:

- Tables/moves `brain_frames_defense`, `brain_move_defense`, `brain_frames_pain3`, `brain_move_pain3`, `brain_frames_pain2`, `brain_move_pain2`, `brain_frames_pain1`, `brain_move_pain1`.
- Callbacks duck/dodge `brain_duck_down`, `brain_duck_hold`, `brain_duck_up`, `brain_frames_duck`, `brain_move_duck`, `brain_dodge`.
- Tables/moves death `brain_frames_death2`, `brain_move_death2`, `brain_frames_death1`, `brain_move_death1`.
- Callbacks melee/attaque `brain_swing_right`, `brain_hit_right`, `brain_swing_left`, `brain_hit_left`, `brain_frames_attack1`, `brain_move_attack1`, `brain_chest_open`, `brain_tentacle_attack`, `brain_chest_closed`, `brain_frames_attack2`, `brain_move_attack2`, `brain_melee`.
- Pain/death/spawn `brain_pain`, `brain_dead`, `brain_die`, `SP_monster_brain`.
- Entrees declaratives correspondantes `brain_frames_defense`, `brain_frames_pain3`, `brain_frames_pain2`, `brain_frames_pain1`, `brain_frames_duck`, `brain_frames_death2`, `brain_frames_death1`, `brain_frames_attack1`, `brain_frames_attack2`.
- Temporaires C `r` et `n` marques `Non applicable`: `r` est local a `brain_pain`; `n` est local aux boucles de gibs dans `brain_die`.

2026-05-06 - Lot initial sons/precache et mouvements de base:

- Sons `sound_chest_open` a `sound_melee3`, constantes `SOUND_*`, variables d'indices et ordre de precache dans `SP_monster_brain`.
- Callbacks `brain_sight`, `brain_search`, `brain_stand`, `brain_idle`, `brain_walk`, `brain_run`.
- Tables/moves `brain_frames_stand`, `brain_move_stand`, `brain_frames_idle`, `brain_move_idle`, `brain_frames_walk1`, `brain_move_walk1`, `brain_frames_run`, `brain_move_run`.
- Entrees declaratives correspondantes `brain_frames_stand`, `brain_frames_idle`, `brain_frames_walk1`, `brain_frames_run`.
- Les prototypes forward C `brain_run` et `brain_dead` generes comme fonctions distinctes ont ete marques `Non applicable`; les definitions de `brain_run` et `brain_dead` sont validees sur leurs lignes propres.

## Preuves de session

- Comparaison C/TS: `Quake-2-master/game/m_brain.c` vs `packages/game/src/m_brain.ts`.
- Tests lances:
  - `npm run verify:m-brain`
  - `npm run verify:m-brain:source-parity`
  - `npm run verify:m-brain:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:full-game:render-source`
  - `npm run typecheck`
- Commentaires d'en-tete renforces dans `packages/game/src/m_brain.ts` pour `brain_sight`, `brain_search`, `brain_stand`, `brain_idle`, `brain_walk`, `brain_run`.
- Commentaires d'en-tete ajoutes/renforces dans `packages/game/src/m_brain.ts` pour `brain_duck_down`, `brain_duck_hold`, `brain_duck_up`, `brain_dodge`, `brain_swing_right`, `brain_hit_right`, `brain_swing_left`, `brain_hit_left`, `brain_chest_open`, `brain_tentacle_attack`, `brain_chest_closed`, `brain_melee`, `brain_pain`, `brain_dead`, `brain_die`, `SP_monster_brain`.

## Runtime / apps-web / renderer-three

- Runtime: `monster_brain` est branche dans `packages/game/src/g_spawn.ts` via `ED_CallSpawn`, exporte par `packages/game/src/index.ts`, demarre via `walkmonster_start`, et ses sons sortent par les evenements runtime draines par `g_main.ts`/web local.
- apps/web: pas de logique parallele `monster_brain`; le flux navigateur consomme le runtime porte via les boucles full-game/local session et les sons gameplay draines.
- renderer-three: pas de branchement specifique attendu dans `m_brain.ts`; la sortie visible attendue est l'entite serveur avec `s.modelindex`, `s.frame`, `s.skinnum`, les sons, les gibs et les changements de bounding box/power armor gameplay. Les modeles/frames passent par les frames client puis `refresh-entity-sync.ts`; les gibs passent par les entites runtime generiques et le flux renderer. Aucun manque specifique aux lots valides.

## Prochain lot recommande

Aucun pour `m_brain.c`: toutes les entrees sont `Valide` ou `Non applicable`.

## Blocages

Aucun blocage pour le lot valide.
