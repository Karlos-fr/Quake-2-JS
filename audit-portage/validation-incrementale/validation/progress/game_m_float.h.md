# Progress - Quake-2-master/game/m_float.h

## Statut

- Statut: termine cote matrice.
- Lot valide: header declaratif complet, de `FRAME_actvat01` a `MODEL_SCALE`.
- Verdict: `Valide` pour les 249 macros/constantes.

## Preuves de session

- Comparaison exhaustive `Quake-2-master/game/m_float.h` vs `packages/game/src/m_float.ts`: `defs=249 missing=0 mismatch=0`.
- `npm run verify:m-float:header`: OK.
- `npm run verify:m-float:source-parity`: OK.
- `npm run verify:m-float`: OK.
- `npm run verify:full-game:render-source`: OK.
- `npm run verify:full-game:three-renderer`: OK.
- `npm run verify:full-game:server-snapshots`: OK.
- `npm run verify:full-game:audio-routing`: OK.
- `npm run verify:web-render-order`: OK.

## Decisions

- Ownership confirme sur `packages/game/src/m_float.ts`; `packages/game/src/index.ts` expose seulement le module via `floatFrames` et les exports gameplay existants.
- Noms originaux conserves pour toutes les constantes `FRAME_*` et `MODEL_SCALE`.
- Pas de doublon proprietaire bloquant: des noms de frames identiques existent dans d'autres modules monstres, mais chaque module source garde son ownership propre.
- Commentaire de module verifie dans `packages/game/src/m_float.ts`: source `game/m_float.h` et `game/m_float.c`, constantes et comportement floater documentes.
- Runtime verifie via `g_spawn.ts` / `ED_CallSpawn` / `SP_monster_floater`, puis `flymonster_start`, `monster_think`, `M_MoveFrame` et les moves floater.
- `apps/web` verifie via les flux full-game, snapshots, render source et audio-routing; pas de logique parallele masquant un manque runtime.
- `renderer-three` verifie pour les sorties visibles du floater: modele MD2 `models/monsters/float/tris.md2`, `frame`, `oldframe`, `backlerp`, `modelindex`, plus temp outputs blaster/splash consommes par les flux client/refresh/renderer.

## Prochain lot

- Aucun pour `m_float.h`: toutes les lignes de la matrice sont `Valide`.
