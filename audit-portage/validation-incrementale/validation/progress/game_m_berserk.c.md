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

## Prochain lot recommande

- Valider `berserk_sight` et `berserk_search` avec leurs emissions sonores et leur branchement via `monsterinfo.sight` / `monsterinfo.search`.
