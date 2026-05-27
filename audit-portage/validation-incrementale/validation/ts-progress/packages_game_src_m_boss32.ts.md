# Progress TS - packages/game/src/m_boss32.ts

- Statut: En cours
- Dernier lot valide: `FRAME_stand01` a `FRAME_stand51` (51 macros de frames stand) marques `Couvert C/H`.
- Preuves consultees:
  - `packages/game/src/m_boss32.ts`
  - `Quake-2-master/game/m_boss32.h`
  - `audit-portage/validation-incrementale/validation/matrices/game_m_boss32.h.md`
  - `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_boss32.ts.md`
- Tests de reference: non lances; aucune modification de code, valeurs deja couvertes par la matrice C/H `game_m_boss32.h.md`.
- Decisions:
  - Les constantes `FRAME_attak101` a `FRAME_attak118` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`.
  - Les constantes `FRAME_attak201` a `FRAME_attak213` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`.
  - Les constantes `FRAME_death01` a `FRAME_death25` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`; valeurs TS/H alignees `31` a `55`.
  - Les constantes `FRAME_death26` a `FRAME_death50` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`; valeurs TS/H alignees `56` a `80`.
  - Les constantes `FRAME_pain101` a `FRAME_pain103` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`; valeurs TS/H alignees `81` a `83`.
  - Les constantes `FRAME_pain201` a `FRAME_pain203` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`; valeurs TS/H alignees `84` a `86`.
  - Les constantes `FRAME_pain301` a `FRAME_pain325` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`; valeurs TS/H alignees `87` a `111`.
  - Les constantes `FRAME_stand01` a `FRAME_stand51` appartiennent bien a `packages/game/src/m_boss32.ts`, source `Quake-2-master/game/m_boss32.h`, category `Ported`; valeurs TS/H alignees `112` a `162`.
  - Les doublons nominaux avec d'autres monstres, notamment `m_boss31.ts`, sont attendus: sources/proprietaires differents, pas un doublon de portage pour ce lot.
- Blocages: aucun.
## Session 2026-05-27 - lot elargi

- Lot: `FRAME_walk01` a `FRAME_walk25`, `FRAME_walk201` a `FRAME_walk217`, puis `MODEL_SCALE`.
- Verdict: `Couvert C/H` pour 43 macro(s) portee(s) depuis `Quake-2-master/game/m_boss32.h`.
- Preuves: valeurs TS comparees aux macros H, matrice C/H `game_m_boss32.h.md` avec statut `Valide` et proprietaire attendu `packages/game/src/m_boss32.ts`; ownership package `packages/game` conforme au module source `game`; pas de doublon du couple `Original name` + `Source declaree` dans ce fichier.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`. Aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: constantes de frames/scale consommees par les moves/spawn du gameplay via `G_RunFrame`/`M_MoveFrame` ou `monsterinfo.scale`; pas d'integration web/renderer directe attendue pour ces macros seules.
- Tests: non lances; modification documentaire uniquement.
- Prochain lot recommande: `MZ2_MAKRON_*`, constantes sons et handles, puis helpers/fonctions Makron selon risque.
