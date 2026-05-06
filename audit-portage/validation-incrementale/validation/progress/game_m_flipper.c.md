# Progress - Quake-2-master/game/m_flipper.c

## Etat courant

- Statut: En cours
- Dernier lot valide: sons globaux `sound_chomp` a `sound_sight`, stand/run/walk/start-run initial: `flipper_stand`, `flipper_frames_stand`, `flipper_move_stand`, `FLIPPER_RUN_SPEED`, `flipper_frames_run`, `flipper_move_run_loop`, `flipper_run_loop`, `flipper_frames_run_start`, `flipper_move_run_start`, `flipper_run`, `flipper_frames_walk`, `flipper_move_walk`, `flipper_walk`, `flipper_frames_start_run`, `flipper_move_start_run`, `flipper_start_run`, plus entrees declaratives correspondantes.
- Fichier TS proprietaire verifie: `packages/game/src/m_flipper.ts`
- Fichiers d'integration consultes: `packages/game/src/g_spawn.ts`, `packages/game/src/g_save.ts`, `packages/game/src/index.ts`, `apps/web/src/full-game-render-source.ts`, `packages/client/src/local-gameplay-sync.ts`, `packages/renderer-three/src/refresh-entity-sync.ts`

## Checklist appliquee

- Ownership: port proprietaire dans `packages/game/src/m_flipper.ts`; branchements exposes par `g_spawn`, `g_save` et `index`.
- Doublons: les doublons `global`/`table`/`declarative:monster-tables` des tables de frames pointent la meme table source et le meme port TS; les deux lignes `flipper_stand` correspondent au prototype et au corps C.
- Parite C/TS: sons precaches dans l'ordre source, tables de frames, moves, callbacks et effets `monsterinfo.currentmove` compares avec `Quake-2-master/game/m_flipper.c`.
- Commentaires d'en-tete: fonctions du lot avec `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`; tables/constantes couvertes par le commentaire de fichier et les harness de parite.
- Runtime: `monster_flipper` atteint depuis `ED_CallSpawn`/`SP_monster_flipper`, puis `swimmonster_start`, `G_RunFrame`, `monster_think`, `M_MoveFrame` et callbacks AI/monster.
- apps/web: integration attendue via client/server full-game, snapshots/configstrings et source renderer; pas de logique parallele masquant le runtime.
- renderer-three: sortie visible attendue pour modele MD2, frames, skin et sons; consommation via `CL_BuildRefreshFrame` puis `refresh-entity-sync` verifiee par tests full-game renderer.

## Tests lances

- `npm run verify:m-flipper` - ok
- `npm run verify:m-flipper:header` - ok
- `npm run verify:m-flipper:source-parity` - ok
- `npm run verify:full-game:render-source` - ok
- `npm run verify:full-game:server-snapshots` - ok
- `npm run verify:full-game:three-renderer` - ok
- `npm run verify:full-game:audio-routing` - ok

## Decisions et remarques

- Aucun correctif TS requis sur ce lot.
- `sound_attack`, `sound_idle` et `sound_search` sont precaches comme en C mais non emis par `m_flipper.c`; le TS conserve les variables via `void ...` pour eviter de masquer ce fait.
- `apps/web` et `renderer-three` ne doivent pas referencer `m_flipper.ts` directement: ils consomment les sorties runtime/client generiques.

## Prochain lot recommande

Continuer avec les animations pain/attack: `flipper_frames_pain2`, `flipper_move_pain2`, `flipper_frames_pain1`, `flipper_move_pain1`, `flipper_bite`, `flipper_preattack`, `flipper_frames_attack`, `flipper_move_attack`, `flipper_melee`, puis les entrees declaratives pain/attack si le lot reste coherent.
