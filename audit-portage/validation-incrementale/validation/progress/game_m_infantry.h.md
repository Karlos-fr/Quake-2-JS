# Progress - Quake-2-master/game/m_infantry.h

## 2026-05-06 - Header complet des frames infantry

- Lot traite: toutes les macros de `m_infantry.h`, de `FRAME_gun02` a `FRAME_attak208`, plus `MODEL_SCALE`.
- Verdict: `Valide` pour 208/208 entites; fichier termine.
- Ownership: constantes proprietaires dans `packages/game/src/m_infantry.ts`; `packages/game/src/index.ts` expose aussi le module/exports mais n'est pas l'owner.
- Doublons: pas de port proprietaire concurrent identifie pour `m_infantry.h`; les collisions de noms generiques restent isolees par modules de monstres.
- Comparaison source C/H vs TS: `scripts/verify/quake2-m-infantry-header.ts` parse le header C et compare les 208 macros avec les exports TS.
- Commentaires d'en-tete: commentaire fichier `m_infantry.ts` verifie; macros declaratives generees, pas de commentaire par macro requis.
- Runtime: constantes consommees par les moves et callbacks de `m_infantry.ts`, atteignables via `SP_monster_infantry`, `ED_CallSpawn`, `walkmonster_start` et `M_MoveFrame`.
- `apps/web`: pas de logique infantry parallele; le flux web consomme le runtime/client porte et les sorties d'entites visibles.
- `packages/renderer-three`: consommation attendue des sorties visibles `modelindex`, `frame` et `oldframe` via le flux refresh entities / alias models; pas de branchement specifique infantry requis.
- Corrections: renforcement de `scripts/verify/quake2-m-infantry-header.ts` pour une verification exhaustive du header.
- Tests OK:
  - `npm run verify:m-infantry:header`
  - `npm run verify:m-infantry`
  - `npm run verify:m-infantry:source-parity`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:web-render-order`
  - `npm run typecheck`
  - `git diff --check`
- Prochain lot recommande: aucun pour `m_infantry.h`; fichier clos.
