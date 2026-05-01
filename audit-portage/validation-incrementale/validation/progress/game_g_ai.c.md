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

## Session 2026-04-30 - ai_charge

- Lot traite: `ai_charge`.
- Verdict: valide.
- Corrections TS: commentaire d'en-tete de `ai_charge` ajuste de `Strict` a `Close` et note de portage ajoutee pour la garde defensive `!self.enemy`, absente du C mais sans impact attendu sur le flux normal d'attaque.
- Preuves: comparaison C/TS effectuee; le C calcule `v = enemy.origin - self.origin`, affecte `ideal_yaw`, appelle `M_ChangeYaw`, puis `M_walkmove` seulement si `dist` est non nul; le TS conserve cet ordre avec runtime explicite. Branchement runtime verifie via `M_MoveFrame`/tables `aifunc` des monstres et export `packages/game/src/index.ts`; `apps/web` passe par `SV_Frame`/runtime et ne remplace pas la logique; `renderer-three` consomme seulement les sorties visibles via `ClientRefreshFrame`, pas ce symbole AI directement.
- Tests: harness inline `npx tsx -` OK pour orientation, distance zero, avance avec `dist`, et garde defensive sans ennemi; `npm run verify:g-ai` OK; `npm run typecheck` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `range` et locale `len`, ou `visible` avec locale `trace`; garder `FindTarget` pour une session dediee.

## Session 2026-04-30 - range / len

- Lot traite: `range` et locale `len`.
- Verdict: `range` valide; `len` non applicable comme variable locale portee.
- Corrections TS: aucune.
- Preuves: comparaison C/TS effectuee; le C soustrait `self->s.origin - other->s.origin`, calcule `VectorLength`, puis classe avec les seuils stricts `< MELEE_DISTANCE`, `< 500`, `< 1000`; le TS conserve la meme soustraction, `Math.hypot` via `vectorLength`, les constantes `RANGE_*` et le commentaire d'en-tete `Strict`. Branchement runtime verifie via `FindTarget`, `M_CheckAttack`/`ai_run` et usages monstres directs; `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique; `renderer-three` consomme les entites visibles issues des frames client, pas ce helper AI directement.
- Tests: harness inline `npx tsx -` OK pour les bornes strictes `79.999/80/499.999/500/999.999/1000`; `npm run verify:g-ai` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `visible` avec locale `trace`, puis `infront` avec locale `dot`; garder `FindTarget` pour une session dediee.

## Session 2026-04-30 - visible / trace

- Lot traite: `visible` et locale `trace`.
- Verdict: `visible` valide; `trace` non applicable comme variable locale portee.
- Corrections TS: commentaire d'en-tete de `visible` complete avec la note adapter `runtime.collision` absent -> `false`; aucune correction comportementale.
- Preuves: comparaison C/TS effectuee; le C copie `self->s.origin` et `other->s.origin`, ajoute les `viewheight`, appelle `gi.trace(spot1, vec3_origin, vec3_origin, spot2, self, MASK_OPAQUE)`, puis retourne vrai seulement si `trace.fraction == 1.0`; le TS conserve les memes points, extents zero, passant, masque et test strict `fraction === 1.0`, avec garde defensive si le backend collision n'est pas installe. Branchement runtime verifie via `FindTarget`, `M_CheckAttack`/`ai_run` et les autres consommateurs gameplay (`g_combat`, monstres, `p_trail`); `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique; `renderer-three` consomme les sorties visibles via `ClientRefreshFrame`, pas ce helper AI directement.
- Tests: harness inline `npx tsx -` OK pour points yeux, extents, `MASK_OPAQUE`, trace bloquee et absence de collision; `npm run verify:g-ai` OK; `npm run typecheck` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `infront` avec locale `dot`; garder `FindTarget` pour une session dediee.

## Session 2026-04-30 - infront / dot

- Lot traite: `infront` et locale `dot`.
- Verdict: `infront` valide; `dot` non applicable comme variable locale portee.
- Corrections TS: aucune.
- Preuves: comparaison C/TS effectuee; le C calcule `AngleVectors(self->s.angles, forward, NULL, NULL)`, soustrait `other->s.origin - self->s.origin`, normalise le vecteur, calcule `DotProduct(vec, forward)`, puis retourne vrai seulement si `dot > 0.3`; le TS conserve le meme ordre via `AngleVectors`, `subtractVec3`, `normalizeVec3`, `dotProduct` et le seuil strict. Commentaire d'en-tete verifie avec fidelite `Strict`.
- Integration: runtime verifie via `FindTarget` et `ai_run` dans `g_ai.ts`, plus consommateurs gameplay `g_weapon` dodge et `m_boss2`; export public verifie dans `packages/game/src/index.ts`. `apps/web` passe par `SV_Frame`/runtime et ne reference pas `infront` directement. `renderer-three` consomme les sorties visibles via `ClientRefreshFrame`, sans integration directe attendue pour ce helper AI purement decisionnel.
- Tests: harness inline `npx tsx -` OK pour cible devant, derriere, cote, seuil strict `dot == 0.3`, seuil juste au-dessus, yaw 90 et zero-vector; `npm run verify:g-ai` OK; `npm run typecheck` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `HuntTarget` puis `FoundTarget`, ou `FacingIdeal` avec locale `delta` si l'on veut garder un lot tres petit; garder `FindTarget` pour une session dediee.

## Session 2026-05-01 - FacingIdeal / delta

- Lot traite: `FacingIdeal` et locale `delta`.
- Verdict: `FacingIdeal` valide; `delta` non applicable comme variable locale portee.
- Corrections TS: aucune correction comportementale; couverture `scripts/verify/quake2-g-ai.ts` etendue pour les seuils 45/46/314/315 et le wrap 0/360.
- Preuves: comparaison C/TS effectuee; le C calcule `anglemod(self->s.angles[YAW] - self->ideal_yaw)`, retourne `false` seulement si `delta > 45 && delta < 315`, sinon `true`; le TS conserve le meme calcul et le meme test inverse. Commentaire d'en-tete verifie avec fidelite `Strict`.
- Integration: runtime verifie via `ai_run_melee` et `ai_run_missile`, eux-memes appeles par `ai_run` selon `attack_state`, puis par les fonctions `checkattack`/frames monstres depuis le flux `G_RunFrame`; export public verifie dans `packages/game/src/index.ts`. `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique. `renderer-three` consomme les sorties visibles via `ClientRefreshFrame`, sans integration directe attendue pour ce helper decisionnel.
- Tests: `npm run verify:g-ai` OK; `npm run typecheck` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `HuntTarget` puis `FoundTarget`, ou `M_CheckAttack` avec locales `chance`/`tr` si l'on veut continuer le bloc attaque.

## Session 2026-05-01 - HuntTarget / FoundTarget

- Lot traite: `HuntTarget`, `FoundTarget`.
- Verdict: valide.
- Corrections TS: commentaires d'en-tete mis a jour pour documenter la fidelite `Close` et la garde defensive `!self.enemy` absente du C; couverture `scripts/verify/quake2-g-ai.ts` etendue pour les branches du lot.
- Preuves: comparaison C/TS effectuee; `HuntTarget` conserve `goalentity = enemy`, choix `stand`/`run`, calcul `ideal_yaw` et `AttackFinished(self, 1)` hors `AI_STAND_GROUND`. `FoundTarget` conserve la diffusion `sight_entity` pour ennemi client, `show_hostile`, `last_sighting`, `trail_time`, branche sans `combattarget`, selection/fallback `G_PickTarget`, consommation du `combattarget`, reservation du `targetname`, `AI_COMBAT_POINT`, `pausetime = 0` et transition `run`.
- Integration: runtime verifie via `FindTarget`, `ai_checkattack`/`ai_run`, reactions `g_combat`, `g_monster` et `m_medic`, puis flux `G_RunFrame`/frames monstres. `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique. `renderer-three` consomme les sorties visibles d'entites apres simulation (`origin`, `angles`, frame/model), sans integration directe attendue pour ces fonctions decisionnelles.
- Tests: `npm run verify:g-ai` OK; `npm run typecheck` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `FindTarget` avec locales `client`, `heardit` et `r`, ou `M_CheckAttack` avec locales `chance`/`tr` si l'on veut eviter le gros bloc acquisition.

## Session 2026-05-01 - FindTarget / client / heardit / r

- Lot traite: `FindTarget` avec locales `client`, `heardit`, `r`.
- Verdict: `FindTarget` valide; `client`, `heardit` et `r` non applicables comme variables locales portees.
- Corrections TS: commentaire d'en-tete de `FindTarget` complete avec les notes runtime explicite et adapter collision/PHS; aucune correction comportementale.
- Preuves: comparaison C/TS effectuee; selection `sight_entity`/`sound_entity`/`sound2_entity`/`sight_client`, filtres `inuse`, `FL_NOTARGET`, monstres hostiles, `heardit`, calcul `r = range`, refus `RANGE_FAR`, lumiere basse, `visible`, `infront`, resolution des monstres vers leur ennemi client, chemin son avec PHS, distance, areaportals, yaw et `AI_SOUND_TARGET` conserves.
- Integration: runtime verifie via `ai_stand`, `ai_walk`, `ai_turn`, `ai_run`, `g_turret` et exports `packages/game/src/index.ts`, atteignables depuis `G_RunFrame`/frames monstres. `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique. `renderer-three` ne consomme pas `FindTarget` directement; il consomme les sorties visibles apres simulation via `ClientRefreshFrame`/`refresh-entity-sync` (`origin`, `angles`, `frame`, `modelindex`), controle par `verify:full-game:three-renderer`.
- Tests: `npm run verify:g-ai` OK; `npm run typecheck` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `M_CheckAttack` avec locales `chance` et `tr`.

## Session 2026-05-01 - M_CheckAttack / chance / tr

- Lot traite: `M_CheckAttack` avec locales `chance` et `tr`.
- Verdict: `M_CheckAttack` valide; `chance` et `tr` non applicables comme variables locales portees.
- Corrections TS: commentaire d'en-tete de `M_CheckAttack` complete pour documenter le runtime collision adapter et la garde defensive `!self.enemy`; couverture `scripts/verify/quake2-g-ai.ts` etendue pour le trace d'attaque et les seuils de chance.
- Preuves: comparaison C/TS effectuee; le C trace des yeux du monstre aux yeux de l'ennemi avec `CONTENTS_SOLID|CONTENTS_MONSTER|CONTENTS_SLIME|CONTENTS_LAVA|CONTENTS_WINDOW` et refuse si `tr.ent != enemy`; le TS conserve les points, le passant, un extent null-equivalent `[0,0,0]`, le masque et le test `tr.ent !== enemy`. Les branches melee, absence d'attaque missile, cooldown `attack_finished`, refus `RANGE_FAR`, chances `AI_STAND_GROUND`/melee/near/mid, multiplicateurs skill, tirage strict `< chance`, cooldown missile aleatoire et etat `FL_FLY` sont conformes.
- Integration: runtime verifie via `g_monster.monster_start` qui installe `M_CheckAttack`, puis `ai_checkattack`/`ai_run` depuis les frames monstres et `G_RunFrame`; export public verifie dans `packages/game/src/index.ts`. `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique. `renderer-three` consomme seulement les sorties visibles de la simulation (`origin`, `angles`, `frame`, `modelindex`) via `ClientRefreshFrame`/`refresh-entity-sync`, sans logique gameplay parallele attendue.
- Tests: `npm run verify:g-ai` OK; `npm run typecheck` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `ai_run_melee`, `ai_run_missile`, puis `ai_run_slide` avec les locales `ofs`.

## Session 2026-05-01 - ai_run_melee / ai_run_missile / ai_run_slide / ofs

- Lot traite: `ai_run_melee`, `ai_run_missile`, `ai_run_slide` et locales generees `ofs`.
- Verdict: `ai_run_melee`, `ai_run_missile` et `ai_run_slide` valides; `ofs` non applicable comme variable locale portee.
- Corrections TS: commentaires d'en-tete de `ai_run_melee` et `ai_run_missile` ajustes en fidelite `Close` pour documenter le passage du `runtime` explicite et les gardes defensives de callback; couverture `scripts/verify/quake2-g-ai.ts` etendue pour rotation avant attaque, non-declenchement hors `FacingIdeal`, strafe lateral et fallback oppose.
- Preuves: comparaison C/TS effectuee; les trois fonctions conservent `ideal_yaw = enemy_yaw`, `M_ChangeYaw`, puis callback melee/missile seulement si `FacingIdeal`, ou strafe `ideal_yaw +/- ofs` avec inversion `lefty` si le premier `M_walkmove` echoue. `ofs` est porte en `const` locale TS.
- Integration: runtime verifie via `ai_checkattack`/`ai_run` et etats `AS_MELEE`, `AS_MISSILE`, `AS_SLIDING`, atteignables depuis les frames monstres sous `G_RunFrame`; export public verifie dans `packages/game/src/index.ts`. `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique. `renderer-three` consomme les sorties visibles apres simulation via `ClientRefreshFrame`/`refresh-entity-sync`, sans integration directe attendue pour ces fonctions decisionnelles/deplacement.
- Tests: `npm run verify:g-ai` OK; `npm run typecheck` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `ai_checkattack` avec locales `temp` et `hesDeadJim`, puis `ai_run` par petits sous-lots.

## Session 2026-05-01 - ai_checkattack / temp / hesDeadJim

- Lot traite: `ai_checkattack` avec locales generees `temp` et `hesDeadJim`; `ai_run` laisse au prochain lot.
- Verdict: `ai_checkattack` valide; `temp` et `hesDeadJim` non applicables comme variables locales portees.
- Corrections TS: commentaire d'en-tete de `ai_checkattack` complete pour documenter le runtime explicite et les gardes defensives de callback/ennemi; couverture `scripts/verify/quake2-g-ai.ts` etendue pour combat point, sound target frais/expire, branches `AI_MEDIC`, `AI_BRUTAL`, movetarget/stand et seuil de gib.
- Preuves: comparaison C/TS effectuee; le TS conserve la sortie combat point, l'expiration `AI_SOUND_TARGET`, le reset `enemy_vis`, le calcul `hesDeadJim`, la reprise `oldenemy` via `HuntTarget`, les chemins `movetarget`/`stand`, `show_hostile`, `visible`, `search_time`, `last_sighting`, caches `enemy_infront`/`enemy_range`/`enemy_yaw`, puis delegation `AS_MISSILE`, `AS_MELEE` ou `checkattack`. Les gardes TS restent defensives par rapport au setup runtime normal.
- Integration: runtime verifie via `ai_stand` et `ai_run`, eux-memes appeles depuis `M_MoveFrame`/frames monstres sous `G_RunFrame`; `monster_start` installe `M_CheckAttack` par defaut et certains monstres specialisent `checkattack`. `apps/web` passe par `SV_Frame`/runtime et ne remplace pas cette logique. `renderer-three` consomme les sorties visibles apres simulation via `ClientRefreshFrame`/`refresh-entity-sync`, sans integration gameplay directe attendue.
- Tests: `npm run verify:g-ai` OK; `npm run typecheck` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK.
- Blocage: aucun pour le lot traite.
- Prochain lot recommande: `ai_run` en sous-lots, en commencant par les branches initiales `AI_SOUND_TARGET`, `attack_state == AS_SLIDING` et le retour `ai_checkattack`, puis garder la poursuite `AI_LOST_SIGHT`/`PlayerTrail` pour un lot separe.
