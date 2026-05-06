# Progress - Quake-2-master/game/m_boss32.c

## Etat courant

- Statut: En cours
- Dernier lot traite: blocs mort/sight `makron_frames_death2`, `makron_move_death2`, `makron_frames_death3`, `makron_move_death3`, `makron_frames_sight`, `makron_move_sight`, plus `makron_sight`.
- Verdict du dernier lot: Valide pour les tables/moves mort/sight et `makron_sight`.
- Fichier TS proprietaire: `packages/game/src/m_boss32.ts`

## Session 2026-05-06 - lot death/sight

Lot 3x traite:

- `makron_frames_death2`, `makron_move_death2`.
- `makron_frames_death3`, `makron_move_death3`.
- `makron_frames_sight`, `makron_move_sight`.
- Lignes declaratives `makron_frames_death2`, `makron_frames_death3`, `makron_frames_sight`.
- `makron_sight`.

Corrections:

- `m_boss32.ts`: ajout du commentaire d'en-tete de portage pour `makron_sight`.
- `quake2-m-boss32.ts`: preuves ciblees ajoutees pour les tables/moves death2/death3/sight, callbacks death2, transition `makron_sight`, et registre save des moves/fonction.

Tests lances:

- `npm run verify:m-boss32`
- `npm run verify:m-boss32:source-parity`
- `npm run verify:m-boss32:header`
- `npm run verify:full-game:audio-routing`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Integration:

- Runtime: valide. `SP_monster_makron` branche `self->monsterinfo.sight = makron_sight` et demarre aussi sur `makron_move_sight`; `makron_die` branche `makron_move_death2`, dont les callbacks sont avances par `M_MoveFrame` et finissent sur `makron_dead`.
- apps/web: valide. Les sons death2 transitent par les `soundEvents` runtime consommes par le flux audio full-game; les frames visibles transitent par les snapshots/client refresh.
- renderer-three: valide. Les sorties visibles attendues sont les frames du modele Makron et le corps/torso associe en runtime; `renderer-three` les consomme par le chemin generique MD2 via `modelindex`, `frame`, `oldframe` et `backlerp`. Aucun adapter Makron specifique n'est requis.

## Session 2026-05-06 - lot pain

Lot 3x traite:

- `makron_frames_pain6`, `makron_move_pain6`.
- `makron_frames_pain5`, `makron_move_pain5`.
- `makron_frames_pain4`, `makron_move_pain4`.
- Lignes declaratives `makron_frames_pain6`, `makron_frames_pain5`, `makron_frames_pain4`.
- `makron_pain`.

Corrections:

- `m_boss32.ts`: `makron_pain` utilise maintenant `g_local.random()` pour les appels C `random()`.
- `m_boss32.ts`: ajout du commentaire d'en-tete de portage pour `makron_pain`, incluant le dangling-else source conserve.
- `quake2-m-boss32.ts`: preuves ciblees ajoutees pour les tables/moves pain4/pain5/pain6, callbacks pain6, endfunc `makron_run`, et registre save des moves pain.

Tests lances:

- `npm run verify:m-boss32`
- `npm run verify:m-boss32:source-parity`
- `npm run verify:m-boss32:header`
- `npm run verify:full-game:audio-routing`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Integration:

- Runtime: valide. `SP_monster_makron` branche `self.pain = makron_pain`; les moves pain sont selectionnes par `makron_pain` puis avances par `M_MoveFrame`, avec retour `makron_run`.
- apps/web: valide. Les sons de douleur transitent par les `soundEvents` runtime consommes par le flux audio full-game; aucune logique web parallele Makron detectee.
- renderer-three: valide. Les sorties visibles attendues sont les frames de modele Makron et les changements de skin, consommes par le chemin generique snapshots/refresh/renderer-three via `modelindex`, `frame`, `oldframe`, `backlerp` et `skinnum`.

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

Continuer avec le bloc attaque BFG:

- `makronBFG`.
- `makron_frames_attack3`, `makron_move_attack3`.
- `makron_frames_attack4`, `makron_move_attack4`.
- `makron_frames_attack5`, `makron_move_attack5`.
- Inclure les lignes declaratives associees si le lot reste coherent.

## Session 2026-05-06 - lot callbacks/walk

Lot 3x traite:

- `makron_hit`, `makron_popup`, `makron_brainsplorch`, `makron_prerailgun`.
- `makron_frames_walk`, `makron_move_walk`, `makron_walk`.
- Ligne declarative `makron_frames_walk`.

Corrections:

- `m_boss32.ts`: ajout de commentaires d'en-tete pour `makron_hit`, `makron_popup`, `makron_brainsplorch`, `makron_prerailgun`, `makron_walk`.
- `quake2-m-boss32.ts`: preuves renforcees pour les canaux/attenuations exacts des callbacks sonores, pour `makron_frames_walk`, pour `makron_move_walk`, et pour son enregistrement save.

Tests lances:

- `npm run verify:m-boss32`
- `npm run verify:m-boss32:source-parity`
- `npm run verify:m-boss32:header`
- `npm run verify:full-game:audio-routing`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Integration:

- Runtime: valide. Les callbacks sont atteignables via `monsterinfo.currentmove` et `M_MoveFrame`: `makron_popup` depuis pain6, `makron_hit`/`makron_brainsplorch` depuis death2, `makron_prerailgun` depuis attack5; `makron_walk` est branche sur `monsterinfo.walk` par `SP_monster_makron`.
- apps/web: valide. Les sons transitent par les `soundEvents` runtime et le flush game/import, puis par le flux audio full-game; aucune logique web parallele ne remplace ces callbacks.
- renderer-three: valide. Le bloc walk produit des frames de modele Makron consommees par le chemin generique entites MD2 (`modelindex`, `frame`, `oldframe`, `backlerp`). Les callbacks sonores ne produisent pas de sortie renderer directe.
- Decision conservee: le C declare `makron_frames_walk` en `ai_walk`, mais `makron_move_walk` reference `makron_frames_run`; le TS et les tests conservent explicitement ce comportement.

## Mise a jour recommandee pour AVANCEMENT_GLOBAL.md

- `Quake-2-master/game/m_boss32.c`: passer a `En cours`.
- Progress: `progress/game_m_boss32.c.md`.
- Validees: 63.
- Non applicables: 8.
- Prochain lot: `makronBFG`, `makron_frames_attack3`, `makron_move_attack3`, `makron_frames_attack4`, `makron_move_attack4`, `makron_frames_attack5`, `makron_move_attack5`, avec les lignes declaratives associees si coherent.
