# Progress TS - packages/game/src/m_soldier.ts

- Statut: En cours

## Session 2026-05-27 - lot elargi initial

- Lot: 200 premieres macros de frames de `FRAME_attak101` a `FRAME_stand324`.
- Verdict: `Couvert C/H` pour les 200 constantes portees depuis `Quake-2-master/game/m_soldier.h`.
- Preuves: valeurs TS comparees aux macros H; matrice C/H `game_m_soldier.h.md` avec statut `Valide` et proprietaire attendu `packages/game/src/m_soldier.ts`; ownership `packages/game` conforme au module source `game/m_soldier.h`; homonymes eventuels dans d'autres monstres traites comme sources/proprietaires distincts.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`. Aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: macros de frames consommees par les moves soldier via `G_RunFrame`/`M_MoveFrame`; pas d'integration web/renderer directe attendue pour ces constantes seules.
- Tests: non lances; modification documentaire uniquement.
- Prochain lot recommande: `FRAME_stand325` et suivants, puis les autres macros de frames contigues avant sons/helpers/fonctions.
