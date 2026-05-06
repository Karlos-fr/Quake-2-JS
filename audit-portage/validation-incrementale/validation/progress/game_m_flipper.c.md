# Progress - Quake-2-master/game/m_flipper.c

## Etat courant

- Statut: Termine cote `m_flipper.c`
- Dernier lot valide: reste fonctionnel du fichier: pain, attack/melee, death, sight/die/spawn, tables/moves declaratifs associes: `flipper_frames_pain2`, `flipper_move_pain2`, `flipper_frames_pain1`, `flipper_move_pain1`, `flipper_bite`, `flipper_preattack`, `flipper_frames_attack`, `flipper_move_attack`, `flipper_melee`, `flipper_pain`, `flipper_dead`, `flipper_frames_death`, `flipper_move_death`, `flipper_sight`, `flipper_die`, `SP_monster_flipper`, plus entrees declaratives pain/attack/death.
- Fichier TS proprietaire verifie: `packages/game/src/m_flipper.ts`
- Fichiers d'integration consultes: `packages/game/src/g_spawn.ts`, `packages/game/src/g_save.ts`, `packages/game/src/index.ts`, `apps/web/src/full-game-render-source.ts`, `packages/client/src/local-gameplay-sync.ts`, `packages/renderer-three/src/refresh-entity-sync.ts`

## Checklist appliquee

- Ownership: port proprietaire dans `packages/game/src/m_flipper.ts`; branchements exposes par `g_spawn`, `g_save` et `index`.
- Doublons: les doublons `global`/`table`/`declarative:monster-tables` des tables de frames pointent la meme table source et le meme port TS; les deux lignes `flipper_stand` correspondent au prototype et au corps C.
- Parite C/TS: sons precaches dans l'ordre source, tables de frames, moves, callbacks, damage, gib paths, bbox corpse, `deadflag`, `takedamage`, skin damagee, debounce pain, nightmare suppression et effets `monsterinfo.currentmove` compares avec `Quake-2-master/game/m_flipper.c`.
- Commentaires d'en-tete: fonctions du lot avec `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`; tables/constantes couvertes par le commentaire de fichier et les harness de parite.
- Runtime: `monster_flipper` atteint depuis `ED_CallSpawn`/`SP_monster_flipper`, puis `swimmonster_start`, `G_RunFrame`, `monster_think`, `M_MoveFrame`, callbacks AI/monster, save registry et save/restore.
- apps/web: integration attendue via client/server full-game, snapshots/configstrings, asset sync et source renderer; pas de logique parallele masquant le runtime.
- renderer-three: sortie visible attendue pour modele MD2, frames, skin et sons; consommation via `CL_BuildRefreshFrame` puis `refresh-entity-sync`/MD2 verifiee par tests full-game renderer.

## Tests lances

- `npm run verify:m-flipper` - ok
- `npm run verify:m-flipper:header` - ok
- `npm run verify:m-flipper:source-parity` - ok
- `npm run verify:full-game:render-source` - ok
- `npm run verify:full-game:server-snapshots` - ok
- `npm run verify:full-game:three-renderer` - ok
- `npm run verify:full-game:audio-routing` - ok
- `npm run verify:g-spawn` - ok

## Decisions et remarques

- Aucun correctif TS requis sur les lots valides.
- `sound_attack`, `sound_idle` et `sound_search` sont precaches comme en C mais non emis par `m_flipper.c`; le TS conserve les variables via `void ...` pour eviter de masquer ce fait.
- `apps/web` et `renderer-three` ne doivent pas referencer `m_flipper.ts` directement: ils consomment les sorties runtime/client generiques.
- Les deux lignes `n` de la matrice correspondent aux variables locales C de `flipper_pain` et `flipper_die`; elles sont marquees `Non applicable`, pas comme globals propriétaires autonomes.

## Prochain lot recommande

Aucun lot restant dans `game_m_flipper.c.md`: toutes les lignes sont `Valide` ou `Non applicable`. Laisser le coordinateur mettre a jour `AVANCEMENT_GLOBAL.md`.
