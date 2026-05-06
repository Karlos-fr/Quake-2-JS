# Progress - Quake-2-master/game/m_tank.h

## Statut

- Statut: Termine
- Dernier lot valide: toutes les macros de frames `FRAME_stand01` a `FRAME_recln140`, plus `MODEL_SCALE`.
- Prochain lot recommande: aucun; toutes les constantes de frame et `MODEL_SCALE` sont validees.

## Preuves de session

- Comparaison C/H vs TS: `scripts/verify/quake2-m-tank-header.ts` parse `Quake-2-master/game/m_tank.h` et compare exhaustivement les 294 `FRAME_*` aux exports de `packages/game/src/m_tank.ts`, plus `MODEL_SCALE`.
- Ownership: constantes portees dans `packages/game/src/m_tank.ts`, fichier proprietaire attendu.
- Runtime: `SP_monster_tank` / `monster_tank_commander` sont branches via `g_spawn.ts`; les moves tank utilisent les bornes de frames du header, puis `monster_think` / `M_MoveFrame` produit `self.s.frame`.
- apps/web: le flux full-game consomme le runtime client/serveur porte et le render source sans logique parallele pour ces frames.
- renderer-three: les sorties visibles `modelindex`, `frame` et `oldframe` passent par `ClientRefreshFrame` et sont consommees par `refresh-entity-sync` / MD2.

## Tests de reference

- `npm run verify:m-tank:header`
- `npm run verify:m-tank:source-parity`
- `npm run verify:m-tank`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:refresh-entity:alias-flags`
- `npm run typecheck`

## Blocages

- Aucun.

## Decisions

- Les constantes du header genere par qdata sont validees comme donnees declaratives. Les commentaires d'en-tete de fonction ne s'appliquent pas aux macros individuelles; l'en-tete de fichier TS documente la source `game/m_tank.h` et les fonctions runtime associees portent leurs commentaires dans `m_tank.ts`.
