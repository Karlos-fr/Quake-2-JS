# Progress - Quake-2-master/game/m_move.c

- Statut: Termine
- Dernier lot valide: validation complete de `m_move.c`: `STEPSIZE`, `DI_NODIR`, compteurs `c_yes`/`c_no`, `M_CheckBottom`, `SV_movestep`, `M_ChangeYaw`, `SV_StepDirection`, `SV_FixCheckBottom`, `SV_NewChaseDir`, `SV_CloseEnough`, `M_MoveToGoal`, `M_walkmove`; variables locales generees et doublon `SV_movestep` reclasses `Non applicable`.
- Tests de reference lances:
  - `npm run verify:m-move`
  - `npm run verify:g-ai`
  - `npm run verify:g-monster`
  - `npm run verify:g-phys`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:web-render-order`
- Decisions runtime/apps-web/renderer-three:
  - Runtime: les helpers sont atteignables via `G_RunFrame` puis les callbacks de frames monstres dans `g_ai.ts`, le demarrage des monstres dans `g_monster.ts`, la physique `g_phys.ts`, le tonneau `g_misc.ts` et le mutant; `SV_movestep` passe par le bridge collision runtime, relink et triggers comme le `gi.*` original.
  - apps/web: le navigateur declenche ces chemins via le host full-game/local qui delegue a `SV_Frame`/runtime; aucune logique parallele de deplacement monstre n'a ete identifiee dans `apps/web`.
  - renderer-three: sorties visibles attendues indirectes via origines, angles, frames et snapshots d'entites monstres; elles sont consommees par le client refresh puis `packages/renderer-three/src/refresh-entity-sync.ts`. Pas de branchement gameplay direct attendu dans le renderer.
- Commentaires d'en-tete: verifies pour toutes les fonctions portees de `packages/game/src/m_move.ts`; les helpers internes restent non proprietaires et couverts par les commentaires des fonctions sources.
- Blocages: aucun.
- Prochain lot recommande: aucun pour `m_move.c`; matrice terminee.
