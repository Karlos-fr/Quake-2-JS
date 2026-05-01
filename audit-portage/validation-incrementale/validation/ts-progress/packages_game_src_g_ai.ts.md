# Progress TS - packages/game/src/g_ai.ts

- Statut: En cours
- Dernier lot valide: 19 lignes `Couvert C/H` auditees et confirmees.
- Prochain lot recommande: classer les helpers/globals encore `A verifier` (`enemy_vis`, `enemy_infront`, `enemy_range`, `enemy_yaw`, `ATTACK_TRACE_MASK`, puis helpers locaux).
- Tests de reference: `npm run verify:g-ai`, `npm run typecheck`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`.
- Blocages: aucun pour les lignes `Couvert C/H`.

## Session courante

- Lignes traitees: `AI_SetSightClient`, `ai_move`, `ai_stand`, `ai_walk`, `ai_charge`, `ai_turn`, `range`, `visible`, `infront`, `HuntTarget`, `FoundTarget`, `FindTarget`, `FacingIdeal`, `M_CheckAttack`, `ai_run_melee`, `ai_run_missile`, `ai_run_slide`, `ai_checkattack`, `ai_run`.
- Verdict: `Couvert C/H` confirme pour les 19 lignes.
- Preuves: matrice C/H `game_g_ai.c.md` ouverte; chaque entite source correspond au symbole TS declare, avec `Valide` cote C/H. En-tetes TS verifies et alignes sur `Source: Quake-2-master/game/g_ai.c`.
- Ownership/doublons: proprietaire attendu `packages/game/src/g_ai.ts`; aucune autre declaration `Original name` concurrente trouvee dans `packages/game/src` pour ces entites.
- Integration: runtime via callbacks monstres et `G_RunFrame`; `apps/web` consomme le runtime game/server sans logique parallele; `renderer-three` consomme indirectement les sorties serveur/client, aucune integration directe attendue pour ce lot AI.
