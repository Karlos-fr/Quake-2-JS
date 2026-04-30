# Progress - Quake-2-master/game/g_ai.c

## Session 2026-04-30

- Lot traite: preambule simple `maxclients`, `enemy_vis`, `enemy_infront`, `enemy_range`, `enemy_yaw`, `AI_SetSightClient`, locales generees `ent`/`start`, `ai_move`.
- Verdict: valide pour les caches `enemy_*`, `AI_SetSightClient` et `ai_move`; non applicable pour `maxclients`, `ent` et `start`.
- Corrections TS: aucune.
- Preuves: comparaison C/TS effectuee; commentaires d'en-tete verifies pour `AI_SetSightClient` et `ai_move`; branchement runtime verifie via `G_RunFrame` pour `AI_SetSightClient` et via tables de frames monstres pour `ai_move`; `apps/web` passe par `SV_Frame`/runtime, pas de logique de remplacement; pas d'impact renderer-three.
- Tests: `npm run typecheck` OK; test inline `npx tsx -` OK pour cycle `AI_SetSightClient` et deplacement `ai_move`; `npm run verify:g-ai` OK apres correction coordinateur de l'import `g-local.js` vers `g_local.js` dans `scripts/verify/quake2-g-ai.ts`.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `ai_stand`, puis `ai_walk`/`ai_charge`/`ai_turn` si le lot reste petit, en gardant `FindTarget` pour une session separee.

## Session 2026-04-30 - ai_stand

- Lot traite: `ai_stand`.
- Verdict: valide.
- Corrections TS: aucune.
- Preuves: comparaison C/TS effectuee; commentaire d'en-tete verifie; branchement runtime verifie via `M_MoveFrame`/tables de frames monstres et exports `packages/game/src/index.ts`; `apps/web` appelle le runtime via `SV_Frame`/`G_RunFrame` et ne contient pas de remplacement; aucune reference `renderer-three`.
- Tests: harness inline `npx tsx -` OK pour mouvement d'animation, `AI_STAND_GROUND`, sortie stand-ground sans ennemi, transition `walk`, idle, initialisation `idle_time` et blocage `spawnflags & 1`; `npm run verify:g-ai` OK; `npm run typecheck` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `ai_walk` et `ai_turn` peuvent etre traites ensemble si le lot reste petit; garder `ai_charge` sous attention separee a cause de la garde TS `!self.enemy` absente du C; garder `FindTarget` pour une session dediee.

## Session 2026-04-30 - ai_walk / ai_turn

- Lot traite: `ai_walk`, `ai_turn`; `ai_charge` laisse a part.
- Verdict: valide.
- Corrections TS: aucune.
- Preuves: comparaison C/TS effectuee; commentaires d'en-tete verifies; branchement runtime verifie via `M_MoveFrame`/tables de frames monstres et exports `packages/game/src/index.ts`; `apps/web` passe par `SV_Frame` et ne remplace pas la logique; aucune reference `renderer-three`.
- Tests: harness inline `npx tsx -` OK pour ordre mouvement puis `FindTarget`, branches `idle_time` de `ai_walk`, retour avant `search` quand cible trouvee, mouvement d'animation de `ai_turn`, retour avant `M_ChangeYaw` quand cible trouvee et changement de yaw quand aucune cible; `npm run verify:g-ai` OK; `npm run typecheck` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `ai_charge` separement, en documentant/validant la garde TS `!self.enemy` absente du C; garder `range`/`visible`/`infront` ou `FindTarget` pour des sessions dediees.

## Session 2026-04-30 - passe rapide post-validation

- Controle cible des lignes deja `Valide`: `enemy_vis`, `enemy_infront`, `enemy_range`, `enemy_yaw`, `AI_SetSightClient`, `ai_move`, `ai_stand`, `ai_walk`, `ai_turn`.
- Verdict: statut conserve. Branchement runtime confirme via `G_RunFrame` -> `AI_SetSightClient` et via `M_MoveFrame`/frames monstres -> fonctions `ai_*`; `apps/web` attend seulement le chemin serveur `SV_Frame`/`RunFrame` et ne contient pas de remplacement local; `packages/renderer-three` attend seulement les sorties visibles (`ClientRefreshFrame`/entites avec origin, angles, frame, modelindex) et ne doit pas integrer ces symboles AI directement.
- Corrections TS: aucune. Matrice inchangee, aucune ligne `Valide` retrogradee.
- Commandes: `rg` cible sur symboles `g_ai`, runtime, `apps/web`, `packages/renderer-three`; lectures ciblées de `g_ai.ts`, `g_main.ts`, `g_monster.ts`, `full-game-server-host.ts`, `full-game-render-loop.ts`, `refresh-entity-sync.ts`.
