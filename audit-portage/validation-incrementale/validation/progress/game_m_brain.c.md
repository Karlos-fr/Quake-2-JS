# Progress - Quake-2-master/game/m_brain.c

## Dernier lot valide

2026-05-06 - Lot initial sons/precache et mouvements de base:

- Sons `sound_chest_open` a `sound_melee3`, constantes `SOUND_*`, variables d'indices et ordre de precache dans `SP_monster_brain`.
- Callbacks `brain_sight`, `brain_search`, `brain_stand`, `brain_idle`, `brain_walk`, `brain_run`.
- Tables/moves `brain_frames_stand`, `brain_move_stand`, `brain_frames_idle`, `brain_move_idle`, `brain_frames_walk1`, `brain_move_walk1`, `brain_frames_run`, `brain_move_run`.
- Entrees declaratives correspondantes `brain_frames_stand`, `brain_frames_idle`, `brain_frames_walk1`, `brain_frames_run`.
- Les prototypes forward C `brain_run` et `brain_dead` generes comme fonctions distinctes ont ete marques `Non applicable`; la definition de `brain_run` a ete validee, `brain_dead` reste a traiter plus bas dans la matrice.

## Preuves de session

- Comparaison C/TS: `Quake-2-master/game/m_brain.c` vs `packages/game/src/m_brain.ts`.
- Tests lances:
  - `npm run verify:m-brain:header`
  - `npm run verify:m-brain:source-parity`
  - `npm run verify:m-brain`
- Commentaires d'en-tete renforces dans `packages/game/src/m_brain.ts` pour `brain_sight`, `brain_search`, `brain_stand`, `brain_idle`, `brain_walk`, `brain_run`.

## Runtime / apps-web / renderer-three

- Runtime: `monster_brain` est branche dans `packages/game/src/g_spawn.ts` via `ED_CallSpawn`, exporte par `packages/game/src/index.ts`, demarre via `walkmonster_start`, et ses sons sortent par les evenements runtime draines par `g_main.ts`/web local.
- apps/web: pas de logique parallele `monster_brain`; le flux navigateur consomme le runtime porte via les boucles full-game/local session et les sons gameplay draines.
- renderer-three: pas de branchement specifique attendu dans `m_brain.ts`; la sortie visible attendue est l'entite serveur avec `s.modelindex` et `s.frame`, transmise par les frames client puis consommee par `refresh-entity-sync.ts` pour les modeles MD2 et frames. Aucun manque specifique au lot initial.

## Prochain lot recommande

Continuer avec le bloc defense/pain/duck:

- `brain_frames_defense`, `brain_move_defense`
- `brain_frames_pain3`, `brain_move_pain3`, `brain_frames_pain2`, `brain_move_pain2`, `brain_frames_pain1`, `brain_move_pain1`
- `brain_duck_down`, `brain_duck_hold`, `brain_duck_up`, `brain_frames_duck`, `brain_move_duck`, `brain_dodge`

## Blocages

Aucun blocage pour le lot valide.
