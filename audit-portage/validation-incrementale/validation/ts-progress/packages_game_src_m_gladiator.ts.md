# Progression TS croisee - packages/game/src/m_gladiator.ts

- Fichier TS: `packages/game/src/m_gladiator.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_gladiator.ts.md`
- Statut: Termine
- Dernier lot valide: tous les 151 symboles de la matrice actuelle, de `FRAME_stand1` a `randomInt`.
- Prochain lot recommande: aucun dans la matrice TS actuelle.

## Session 2026-05-27

Validation TS croisee complete du fichier.

Verdicts:
- `Couvert C/H`: 132 symboles proprietaires du portage `m_gladiator`, croises avec `game_m_gladiator.h.md` ou `game_m_gladiator.c.md` en statut C/H `Valide`.
- `Valide`: 19 symboles `Category: New`, avec `Original name: N/A` et `Source declaree: N/A (...)`: alias muzzle flash local, caches runtime de sons et helpers locaux.
- `A auditer`: 0.

Preuves:
- Macros H: valeurs TS `FRAME_*` et `MODEL_SCALE` alignees sur `Quake-2-master/game/m_gladiator.h`, proprietaire attendu `packages/game/src/m_gladiator.ts` dans `game_m_gladiator.h.md`.
- C: constantes sons, tables/moves, fonctions et spawn croises avec `Quake-2-master/game/m_gladiator.c` et `game_m_gladiator.c.md`, proprietaire attendu confirme.
- Ownership/package: module source `game` vers `packages/game`, pas de mauvais package detecte pour les symboles du lot.
- Helpers locaux: classes `Category: New`, sans pretendre a un portage proprietaire C/H.

Tests de reference:
- `npm run verify:m-gladiator:header` OK
- `npm run verify:m-gladiator:source-parity` OK
- `npm run verify:m-gladiator` OK
- `npm run typecheck` OK
- `git diff --check` cible OK, avec avertissements LF/CRLF habituels
