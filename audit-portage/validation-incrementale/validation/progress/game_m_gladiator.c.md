# Progress - Quake-2-master/game/m_gladiator.c

## Statut

- Statut: termine cote `m_gladiator.c`
- Dernier lot valide: fichier complet, du bloc sons `sound_pain1` a `SP_monster_gladiator`, incluant stand/walk/run, melee, railgun, pain, death, spawn et tables/moves declaratives.
- Prochain lot recommande: aucun pour `game_m_gladiator.c.md`; toutes les lignes sont `Valide` ou `Non applicable`.

## Preuves de validation

- Comparaison C vs TS: `Quake-2-master/game/m_gladiator.c` compare a `packages/game/src/m_gladiator.ts` pour sons, callbacks, distances de frames, fonctions think, moves, railgun, melee, pain, death, gib death, spawn, model/sound precache et champs `monsterinfo.currentmove`.
- Ownership: port proprietaire dans `packages/game/src/m_gladiator.ts`; branchement spawn dans `packages/game/src/g_spawn.ts`; save registry via `packages/game/src/g_save.ts`; exports publics dans `packages/game/src/index.ts`.
- Commentaires: les fonctions portees ont un en-tete avec `Original name`, `Source`, `Category`, `Fidelity level` et comportement. Le helper local TS n'est pas marque comme portage proprietaire d'une entite C.
- Runtime: integre via `ED_CallSpawn` -> `SP_monster_gladiator`, puis `walkmonster_start`, `monster_think`, `G_RunFrame`/`M_MoveFrame`, callbacks `stand/walk/run/attack/melee/sight/idle/search/pain/die`, save/restore et sons runtime.
- `apps/web`: integre via host full-game/local, snapshots/configstrings/render source et routage audio; pas de logique parallele masquante identifiee pour `monster_gladiator`.
- `renderer-three`: integre via sorties visibles `modelindex`, `frame`, `oldframe`, `skinnum`, gibs et temp outputs du railgun; consommation verifiee par les flux snapshots/refresh entities/renderer-three.

## Tests lances

- `npm run verify:m-gladiator` -> OK
- `npm run verify:m-gladiator:header` -> OK
- `npm run verify:m-gladiator:source-parity` -> OK
- `npm run verify:full-game:server-snapshots` -> OK
- `npm run verify:full-game:three-renderer` -> OK
- `npm run verify:full-game:audio-routing` -> OK
- `npm run verify:web-render-order` -> OK
- `npm run verify:full-game:render-source` -> OK
- `npm run verify:full-game:server-host` -> OK
- `npm run verify:local-gameplay-sync` -> OK
- `npm run verify:g-spawn` -> OK

## Decisions

- `range` est marque `Non applicable`: variable locale C de `gladiator_attack`, validee via la fonction proprietaire.
- `n` est marque `Non applicable`: variable locale C de `gladiator_die`, validee via la fonction proprietaire.
- Les doublons `global`/`table`/`declarative:monster-tables` des frames sont conserves et marques `Valide`; ils representent la meme table declarative C verifiee via les moves TS et les tests source-parity.
- Aucune correction TS necessaire pendant cette session.
