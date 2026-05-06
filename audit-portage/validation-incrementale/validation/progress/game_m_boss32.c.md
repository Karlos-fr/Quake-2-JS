# Progress - Quake-2-master/game/m_boss32.c

## Etat courant

- Statut: En cours
- Dernier lot traite: declarations forward initiales, globals sonores, `makron_taunt`, `makron_frames_stand`, `makron_move_stand`, `makron_stand`, `makron_frames_run`, `makron_move_run`, `makron_run`, `makron_step_left`, `makron_step_right`, `MakronPrecache`, declarations declaratives stand/run.
- Verdict du dernier lot: Valide pour les entites comportementales; Non applicable pour les declarations forward et le local `r`.
- Fichier TS proprietaire: `packages/game/src/m_boss32.ts`

## Session 2026-05-06

Lot 3x traite:

- `sound_pain4`, `sound_pain5`, `sound_pain6`, `sound_death`, `sound_step_left`, `sound_step_right`, `sound_attack_bfg`, `sound_brainsplorch`, `sound_prerailgun`, `sound_popup`, `sound_taunt1`, `sound_taunt2`, `sound_taunt3`, `sound_hit`.
- `makron_taunt` et son local `r`.
- `makron_frames_stand`, `makron_move_stand`, `makron_stand`.
- `makron_frames_run`, `makron_move_run`, `makron_run`.
- `makron_step_left`, `makron_step_right`.
- `MakronPrecache`.
- Lignes declaratives `makron_frames_stand` et `makron_frames_run`.

Corrections:

- `m_boss32.ts`: `makron_taunt` utilise maintenant `g_local.random()` pour le macro C `random()`.
- `m_boss32.ts`: ajout de commentaires d'en-tete pour `makron_taunt`, `makron_stand`, `makron_run`, `makron_step_left`, `makron_step_right`, `MakronPrecache`.
- `quake2-m-boss32.ts`: preuves ciblees ajoutees pour les tables/moves stand/run, callbacks de pas, canaux/attenuations des sons, et ownership spawn conforme au C (`monster_makron` non enregistre dans `g_spawn.c`).

Tests lances:

- `npm run verify:m-boss32`
- `npm run verify:m-boss32:source-parity`
- `npm run verify:m-boss32:header`
- `npm run verify:full-game:server-host`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:audio-routing`
- `npm run typecheck`

Integration:

- Runtime: valide. `SP_monster_makron` n'est pas une entree `g_spawn.c` dans le C original; il est atteint via `MakronToss` depuis Jorg, puis `MakronSpawn`, et ses callbacks `stand`/`run` sont atteignables via `monsterinfo` et `M_MoveFrame`.
- apps/web: valide. Les sorties sonores du lot transitent par les `soundEvents` runtime consommes par le chemin audio full-game; les frames de modele passent par snapshots/client refresh frame.
- renderer-three: valide. Les sorties visibles attendues sont le modele Makron et les frames `stand`/`run`, consommees par le chemin generique MD2 `modelindex`, `frame`, `oldframe`, `backlerp`; les sons seuls ne demandent pas d'adapter renderer.

## Prochain lot recommande

Continuer avec le bloc marche et callbacks sonores proches:

- `makron_hit`, `makron_popup`, `makron_brainsplorch`, `makron_prerailgun`.
- `makron_frames_walk`, `makron_move_walk`, `makron_walk`.
- Verifier explicitement l'ecart source existant: `makron_move_walk` pointe vers `makron_frames_run` dans le C et le TS conserve ce comportement.

## Mise a jour recommandee pour AVANCEMENT_GLOBAL.md

- `Quake-2-master/game/m_boss32.c`: passer a `En cours`.
- Progress: `progress/game_m_boss32.c.md`.
- Validees: 28.
- Non applicables: 8.
- Prochain lot: `makron_hit`/`makron_popup`/`makron_brainsplorch`/`makron_prerailgun`, puis bloc walk.
