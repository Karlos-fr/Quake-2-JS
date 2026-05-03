# Progress - Quake-2-master/game/m_berserk.c

## Session 2026-05-03

- Lot traite: globals sonores initiaux `sound_pain`, `sound_die`, `sound_idle`, `sound_punch`, `sound_sight`, `sound_search`.
- Verdict: Valide.
- Comparaison C/TS: les six `static int sound_*` C sont portes comme handles `let sound_* = 0` et constantes de chemin `SOUND_*`; les chemins et l'ordre de `gi.soundindex` dans `SP_monster_berserk` correspondent au precache TypeScript `precacheBerserkAssets`.
- Commentaires d'en-tete: entites globales, pas de commentaire de fonction requis; l'entete de fichier TS declare la source et la deviation runtime `gi.*`.
- Runtime: integre. `monster_berserk` est branche par `g_spawn.ts` vers `SP_monster_berserk`; le precache alimente `runtime.assets.soundPaths` et les callbacks berserk emettent des `soundEvents`.
- apps/web: integre. Le flux web consomme les `soundEvents` gameplay et resout les chemins sons depuis `gameplayRuntime.assets.soundPaths`; aucune logique parallele berserk constatee.
- renderer-three: non applicable justifie pour ce lot. Les entites auditees ne produisent que des sons one-shot, pas de modele/frame/image/particule/beam/dlight/temp entity/areabits/camera/scene a consommer par le renderer.
- Tests lances:
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:header`
- Corrections appliquees: aucune correction TS necessaire.

## Session 2026-05-03 - `berserk_sight` / `berserk_search`

- Lot traite: fonctions `berserk_sight` et `berserk_search`, emissions sonores et branchement runtime via `monsterinfo.sight` / `monsterinfo.search`.
- Verdict: Valide.
- Comparaison C/TS: `berserk_sight` conserve l'emission `CHAN_VOICE`, son `sound_sight`, volume `1`, attenuation `ATTN_NORM`, `timeofs` 0; `berserk_search` conserve les memes parametres avec `sound_search`. Le parametre C `other` de `berserk_sight` reste ignore comme dans le comportement source.
- Commentaires d'en-tete: commentaires TS verifies pour les deux fonctions avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement.
- Runtime: integre. `SP_monster_berserk` assigne `self.monsterinfo.sight = berserk_sight` et `self.monsterinfo.search = berserk_search`; le harness prouve l'appel direct et l'appel via les callbacks `monsterinfo`.
- apps/web: integre. Ces fonctions produisent des `soundEvents` gameplay; le flux web les draine depuis le runtime et resout les chemins precaches. Aucune logique parallele berserk constatee.
- renderer-three: non applicable justifie pour ce lot. Les fonctions ne produisent que des sons one-shot, sans modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene a consommer par `packages/renderer-three`.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:header`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout d'assertions dans `scripts/verify/quake2-m-berserk.ts` pour prouver le branchement `monsterinfo.sight` / `monsterinfo.search` et les sons emis par ces callbacks.

## Prochain lot recommande

- Valider `berserk_fidget` seul, avec son emission `sound_idle`, ses branches `AI_STAND_GROUND` / `random()`, et son effet `currentmove = berserk_move_stand_fidget`; garder les tables/frames/moves `stand` et `stand_fidget` pour une session separee si le lot devient trop large.
