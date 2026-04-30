# Progress - Quake-2-master/game/g_ai.c

## Session 2026-04-30

- Lot traite: preambule simple `maxclients`, `enemy_vis`, `enemy_infront`, `enemy_range`, `enemy_yaw`, `AI_SetSightClient`, locales generees `ent`/`start`, `ai_move`.
- Verdict: valide pour les caches `enemy_*`, `AI_SetSightClient` et `ai_move`; non applicable pour `maxclients`, `ent` et `start`.
- Corrections TS: aucune.
- Preuves: comparaison C/TS effectuee; commentaires d'en-tete verifies pour `AI_SetSightClient` et `ai_move`; branchement runtime verifie via `G_RunFrame` pour `AI_SetSightClient` et via tables de frames monstres pour `ai_move`; `apps/web` passe par `SV_Frame`/runtime, pas de logique de remplacement; pas d'impact renderer-three.
- Tests: `npm run typecheck` OK; test inline `npx tsx -` OK pour cycle `AI_SetSightClient` et deplacement `ai_move`; `npm run verify:g-ai` OK apres correction coordinateur de l'import `g-local.js` vers `g_local.js` dans `scripts/verify/quake2-g-ai.ts`.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `ai_stand`, puis `ai_walk`/`ai_charge`/`ai_turn` si le lot reste petit, en gardant `FindTarget` pour une session separee.
