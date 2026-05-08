# Progress TS - packages/game/src/g_ai.ts

- Statut: En cours
- Dernier lot valide: helpers locaux vectoriels `subtractVec3`, `vectorLength`, `normalizeVec3`, `dotProduct` classes `New`.
- Prochain lot recommande: classer les helpers locaux collision/PHS encore `A verifier` (`setEntityOrigin`, `inPHS`, `pointArea`, `getEntityArea`, `areasConnected`, `randomInt`).
- Tests de reference: `npm run verify:g-ai`, `npm run typecheck`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`.
- Blocages: aucun pour les lignes `Couvert C/H`.

## Session courante

- Lignes traitees: `AI_SetSightClient`, `ai_move`, `ai_stand`, `ai_walk`, `ai_charge`, `ai_turn`, `range`, `visible`, `infront`, `HuntTarget`, `FoundTarget`, `FindTarget`, `FacingIdeal`, `M_CheckAttack`, `ai_run_melee`, `ai_run_missile`, `ai_run_slide`, `ai_checkattack`, `ai_run`.
- Verdict: `Couvert C/H` confirme pour les 19 lignes.
- Preuves: matrice C/H `game_g_ai.c.md` ouverte; chaque entite source correspond au symbole TS declare, avec `Valide` cote C/H. En-tetes TS verifies et alignes sur `Source: Quake-2-master/game/g_ai.c`.
- Ownership/doublons: proprietaire attendu `packages/game/src/g_ai.ts`; aucune autre declaration `Original name` concurrente trouvee dans `packages/game/src` pour ces entites.
- Integration: runtime via callbacks monstres et `G_RunFrame`; `apps/web` consomme le runtime game/server sans logique parallele; `renderer-three` consomme indirectement les sorties serveur/client, aucune integration directe attendue pour ce lot AI.

## Session globals/helpers AI

- Lignes traitees: `enemy_vis`, `enemy_infront`, `enemy_range`, `enemy_yaw`, `ATTACK_TRACE_MASK`.
- Verdict: `enemy_*` confirmes `Couvert C/H` via matrice C/H `game_g_ai.c.md` (`Valide` cote C/H) et source `Quake-2-master/game/g_ai.c`; `ATTACK_TRACE_MASK` classe `Valide` / `Category: New`.
- Corrections: commentaires de metadonnees ajoutes dans `packages/game/src/g_ai.ts`; matrice TS mise a jour avec `Original name`, `Source declaree`, `Category`, matrice C/H et statut.
- Ownership/doublons: proprietaire attendu `packages/game/src/g_ai.ts`; aucun doublon `enemy_*` hors variantes locales boss; `ATTACK_TRACE_MASK` est une constante locale non exportee qui nomme l'expression inline de `M_CheckAttack`.
- Integration: runtime via `ai_checkattack`, `M_CheckAttack`, `ai_run_*` et callbacks monstres depuis `G_RunFrame`; `apps/web` et `renderer-three` n'ont pas d'integration directe attendue pour ces caches internes AI.
- Tests: `npm run verify:g-ai`, `npm run typecheck`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer` OK.

## Session helpers vectoriels locaux

- Lignes traitees: `subtractVec3`, `vectorLength`, `normalizeVec3`, `dotProduct`.
- Verdict: `Valide` / `Category: New`; metadonnees `Original name: N/A`, `Source declaree: N/A (local vector helper)` ajoutees aux en-tetes et a la matrice.
- Preuves: usages lus dans `packages/game/src/g_ai.ts`; equivalents C `VectorSubtract`, `VectorLength`, `VectorNormalize`, `DotProduct` identifies dans `Quake-2-master/game/q_shared.h`/`.c`; port proprietaire confirme dans `packages/math/src/q_shared.ts` et matrices `game_q_shared.h.md`/`game_q_shared.c.md`.
- Ownership/doublons: helpers non exportes, limites a `g_ai.ts`; ils ne revendiquent pas le portage proprietaire des operations `q_shared`.
- Integration: runtime via les fonctions AI deja branchees (`FindTarget`, `ai_checkattack`, `ai_run`, callbacks monstres); aucune integration directe `apps/web` ou `renderer-three` attendue pour ces helpers de calcul internes.
- Tests: `npm run verify:g-ai`, `npm run typecheck` OK.
