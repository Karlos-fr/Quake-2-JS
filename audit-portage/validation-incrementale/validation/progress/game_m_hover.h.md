# Progress - Quake-2-master/game/m_hover.h

- Statut: Termine
- Dernier lot valide: fermeture complete du header `m_hover.h`: toutes les macros de frames de `FRAME_stand01` a `FRAME_attak108`, plus `MODEL_SCALE`.
- Tests de reference lances:
  - `npm run verify:m-hover:header`
  - `npm run verify:m-hover`
  - `npm run verify:m-hover:source-parity`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:web-render-order`
  - `npm run typecheck`
  - `git diff --check`
- Decisions runtime/apps-web/renderer-three:
  - Runtime: les constantes sont proprietaires de `packages/game/src/m_hover.ts`; elles sont consommees par les moves `hover_move_*` et atteignables via `monster_hover` -> `SP_monster_hover` -> `flymonster_start` -> `M_MoveFrame` et callbacks `monsterinfo`.
  - apps/web: le navigateur ne porte pas de logique hover parallele; il declenche et consomme le flux full-game/runtime porte.
  - renderer-three: les sorties visibles attendues sont les entites alias `modelindex/frame/oldframe`, les effets muzzleflash/dlights/particules et temp entities deja produits par le runtime/client; le renderer les consomme via refresh frame et adapters Three.
- Blocages: aucun.
- Prochain lot recommande: aucun pour `m_hover.h`; fichier clos.
