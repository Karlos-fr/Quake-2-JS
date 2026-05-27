# Progress TS - packages/game/src/m_flipper.ts

## Dernier lot traite

- Lot: gros bloc restant de `FLIPPER_RUN_SPEED` a `randomInt` (53 symboles).
- Verdict: 40 symboles `Couvert C/H` et 13 helpers/caches locaux `Valide` en `Category: New`.
- Preuves: matrice C/H `game_m_flipper.c.md` ouverte; toutes les entrees C/H correspondantes sont `Valide` avec proprietaire attendu `packages/game/src/m_flipper.ts`. Source C `Quake-2-master/game/m_flipper.c` et TS `packages/game/src/m_flipper.ts` compares pour `FLIPPER_RUN_SPEED`, les sons, les tables `mframe_t`, les moves `mmove_t`, les fonctions gameplay et le spawn. Les helpers nouveaux ont `Original name: N/A`, `Source declaree: N/A (...)`, `Category: New` dans la matrice et un en-tete TS explicite.
- Corrections: ajout d'en-tetes TS pour les caches/assistants locaux nouveaux; matrice TS completee; avancement global mis a jour.

## Tests de reference

- `npm run verify:m-flipper:header` -> OK.
- `npm run verify:m-flipper:source-parity` -> OK.
- `npm run verify:m-flipper` -> OK.
- `npm run typecheck` -> OK.

## Decisions importantes

- Le fichier TS proprietaire attendu reste `packages/game/src/m_flipper.ts` pour `game/m_flipper.h` et `game/m_flipper.c`.
- Les constantes `SOUND_*` portent les anciens globals C `sound_*` dans le modele TS; les variables TS `sound_*` minuscules sont seulement des caches runtime de handles et sont classees `Category: New` pour eviter un doublon de proprietaire.
- `makeFrames`, `indexedThinks`, `precacheFlipperAssets`, `setVec3` et `randomInt` sont des helpers locaux TS nouveaux avec metadonnees explicites.
- Aucun mauvais package, mauvais ownership ou doublon proprietaire non justifie n'a ete trouve dans ce lot.

## Prochain lot recommande

- Aucun: la matrice TS actuelle de `packages/game/src/m_flipper.ts` est terminee.
