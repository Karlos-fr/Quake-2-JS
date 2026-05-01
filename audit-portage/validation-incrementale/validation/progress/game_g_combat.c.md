# Progress - Quake-2-master/game/g_combat.c

## Correction des partielles

- 2026-04-30: correction de l'integration visible `SpawnDamage` (deux lignes matrice).
  - Correction appliquee: `packages/game/src/g_main.ts` ecrit maintenant `WriteDir(payload.dir)` pour les temp entities qui sont parsees cote client comme `position + direction` (`TE_BLOOD`, sparks, blaster/flechette et variantes proches), en plus des cas `TE_SPLASH`/`TE_LASER_SPARKS` deja specifiques.
  - Checklist reprise: source C/TS deja comparee sur `SpawnDamage`; commentaire d'en-tete TS conserve; branchement runtime verifie via `SpawnDamage` -> evenement temp entity -> `flushRuntimeEngineEvents`; `apps/web` consomme ce flux via le client full-game; `renderer-three` reste consommateur indirect des effets client, sans branchement direct attendu.
  - Tests lances: `npm run verify:g-main` (nouvelle assertion sur `TE_BLOOD` origin + dir), `npx tsx ./scripts/verify/quake2-g-combat.ts`, `npm run typecheck`.

## Passe rapide post-validation

- 2026-04-30: controle cible des lignes deja marquees `Valide` (`CanDamage`, `Killed`, `SpawnDamage` x2), sans revalidation comportementale complete C/TS. `CanDamage` et `Killed` restent coherents: branchement runtime via `T_RadiusDamage`/`T_Damage` et appels gameplay constates; aucune integration directe `apps/web` ou `renderer-three` attendue, les effets visibles passent par les etats/evenements client existants. `SpawnDamage` avait ete retrograde en `Partiel` pendant cette passe: le chemin local-gameplay-sync preservait bien `origin` et `dir`, mais le pont serveur/apps web (`g_main.ts`) serialisait les temp entities generiques avec seulement `origin`, alors que `CL_ParseTEnt` attend aussi une direction pour `TE_BLOOD`, `TE_SPARKS`, `TE_BULLET_SPARKS`, `TE_SCREEN_SPARKS` et `TE_SHIELD_SPARKS`; point corrige dans la section precedente.

## Dernier lot valide

- 2026-05-01: `T_RadiusDamage` avec locales `points`/`ent`
  - Source comparee: `Quake-2-master/game/g_combat.c`.
  - Cible comparee: `packages/game/src/g_combat.ts`; appels runtime controles dans `packages/game/src/g_misc.ts`, `packages/game/src/g_target.ts` et l'adapter `packages/game/src/g_weapon.ts`.
  - Correction runtime appliquee: aucune. Test cible ajoute dans `scripts/verify/quake2-g-combat.ts`.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`, `Porting notes`.
  - Comparaison comportementale: la boucle conserve le curseur `ent = findradius(...)`; ignore l'entite `ignore`; saute les entites sans `takedamage`; calcule le centre `origin + 0.5 * (mins + maxs)`; calcule `points = damage - 0.5 * distance`; applique le demi-degat si `ent == attacker`; ne dispatch que si `points > 0` et `CanDamage`; transmet `dir = ent.origin - inflictor.origin`, `point = inflictor.origin`, `normal = vec3_origin`, `damage/knockback = (int)points`, `DAMAGE_RADIUS` et `mod`.
  - Branchement runtime verifie: appels portes depuis explosions/debris/barrels/bombes dans `g_misc.ts`, explosions/splash dans `g_target.ts`, et adapter armes `fireRadiusDamage` dans `g_weapon.ts`; le chemin par defaut dispatch vers `T_Damage`.
  - `apps/web`: aucune logique parallele constatee par recherche; le flux navigateur attendu passe indirectement par le runtime game puis les temp entities/client damage deja produits par `T_Damage`/`SpawnDamage`. Tentative `npm run verify:full-game:gameplay` bloquee par `ERR_MODULE_NOT_FOUND` sur `packages/client/src/main.js`, sans correction dans ce lot.
  - `renderer-three`: aucune integration gameplay directe attendue; les sorties visibles du radius damage sont celles de `T_Damage`/`SpawnDamage` et sont consommees indirectement via temp entities, particules et feedback client.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; `npm run verify:g-misc`; `npm run verify:g-main`; `npm run verify:particle-sync`; `npm run verify:p-view`; `npm run typecheck`. `npm run verify:g-target` echoue hors lot sur `target_goal`/`misc/secret.wav`; `npm run verify:full-game:gameplay` echoue au chargement du module client indique ci-dessus.
  - Statut matrice: `T_RadiusDamage`, `points` et `ent` passent `Valide`.

- 2026-05-01: fin de `T_Damage`: callbacks pain et accumulation finale `client.damage_*`
  - Source comparee: `Quake-2-master/game/g_combat.c`.
  - Cible comparee: `packages/game/src/g_combat.ts`; integration feedback controlee via `packages/game/src/p_view.ts`, `apps/web` et `packages/renderer-three`.
  - Correction runtime appliquee: aucune. Test cible ajoute dans `scripts/verify/quake2-g-combat.ts`.
  - Commentaire d'en-tete TS mis a jour: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, `Behavior`, `Porting notes`; les hooks y sont decrits comme points de test/adaptation, le chemin par defaut utilisant les helpers portes.
  - Comparaison comportementale: pour les monstres survivants, `M_ReactToDamage` precede le callback `pain`; `AI_DUCKED` supprime le callback; le mode nightmare pousse `pain_debounce_time` a `level.time + 5`. Pour les clients, `pain` n'est appele que hors godmode et quand `take` reste non nul. Pour les autres entites, `pain` est appele seulement si `take` reste non nul. L'accumulation finale ajoute `psave`, `asave`, `take`, `knockback` et copie `point` dans `client.damage_from` apres les callbacks pain, comme le C.
  - Branchement runtime verifie: `T_Damage` reste atteint depuis `T_RadiusDamage`, armes, triggers, fonctions, monstres, world effects et `p_view`; les callbacks `pain` sont les callbacks entite/monstre/joueur portes et enregistres via le runtime.
  - `apps/web`: aucune logique parallele constatee; le navigateur passe par le runtime game/full-game et consomme ensuite les effets client produits par `P_DamageFeedback`.
  - `renderer-three`: aucune integration gameplay directe attendue; les sorties visibles du lot sont consommees indirectement via `P_DamageFeedback`/playerstate, view kick/polyblend, particules ou entites visibles selon les callbacks.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; `npm run verify:p-view`; `npm run verify:particle-sync`; `npm run typecheck`.
  - Statut matrice: `T_Damage` passe `Valide`, ferme par les validations cumulees des lots precedents plus ce lot final.

- 2026-05-01: suite de `T_Damage`: `SpawnDamage` pour `take`, retrait de `health`, mort via `Killed`
  - Source comparee: `Quake-2-master/game/g_combat.c`.
  - Cible comparee: `packages/game/src/g_combat.ts`; integration visible controlee via `packages/game/src/g_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/cl_tent.ts`, `packages/client/src/cl_fx.ts`, `apps/web` et `packages/renderer-three`.
  - Correction runtime appliquee: aucune. Test cible ajoute dans `scripts/verify/quake2-g-combat.ts`.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, `Behavior`, `Porting notes`.
  - Comparaison comportementale: si `take` reste non nul, le port emet `TE_BLOOD` pour monstre/client et `teSparks` pour les autres entites, retire `take` de `targ.health`, applique `FL_NO_KNOCKBACK` avant la mort des monstres/clients, appelle `Killed` avec le `take` final et le point d'impact, puis retourne sans appeler les callbacks pain.
  - Branchement runtime verifie: `T_Damage` est atteint depuis `T_RadiusDamage`, armes, triggers, fonctions, monstres, world effects et `p_view`; `Killed` relaye ensuite vers `die`/hooks de mort existants.
  - `apps/web`: aucune logique parallele constatee; le flux navigateur attendu passe par le runtime game et les packets temp entities (`TE_BLOOD`/sparks) deja serialises avec direction.
  - `renderer-three`: integration directe gameplay non attendue; les sorties visibles du lot passent indirectement par `CL_ParseTEnt`/`CL_AddTEntPacket`, `CL_ParticleEffect`, `CL_AddParticles` et `particle-sync`.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; `npm run verify:g-main`; `npm run verify:particle-sync`; `npm run verify:p-view`; `npm run typecheck`.
  - Statut matrice: `T_Damage` reste `Partiel`; la tranche `SpawnDamage`/`health`/`Killed` est validee.

- 2026-05-01: suite de `T_Damage`: `te_sparks`, knockback/momentum avec `mass`
  - Source comparee: `Quake-2-master/game/g_combat.c`.
  - Cible comparee: `packages/game/src/g_combat.ts`; integration visible controlee via `packages/game/src/g_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/cl_tent.ts`, `apps/web` et `packages/renderer-three`.
  - Correction runtime appliquee: aucune. Test cible ajoute dans `scripts/verify/quake2-g-combat.ts`.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, `Behavior`, `Porting notes`.
  - Comparaison comportementale: `te_sparks` choisit `TE_BULLET_SPARKS` sous `DAMAGE_BULLET`, sinon `TE_SPARKS`; `VectorNormalize(dir)` est porte par `normalizeVec3(dir)` sans mutation du vecteur d'appel; `FL_NO_KNOCKBACK` force `knockback = 0`; `DAMAGE_NO_KNOCKBACK` et les movetypes `NONE`/`BOUNCE`/`PUSH`/`STOP` bloquent le momentum; `mass` est plancher a 50; l'echelle est `500 * knockback / mass`, ou `1600 * knockback / mass` pour le self-knockback client.
  - Branchement runtime verifie: `T_Damage` est atteint depuis `T_RadiusDamage`, armes, triggers, fonctions, monstres, world effects et `p_view`; le momentum modifie `targ.velocity`, ensuite consommee par la physique/snapshots joueur.
  - `apps/web`: aucune logique parallele constatee; le flux navigateur attendu passe par le runtime game et les packets temp entities (`TE_SPARKS`/`TE_BULLET_SPARKS`) deja serialises avec direction.
  - `renderer-three`: integration directe gameplay non attendue; les sorties visibles du lot passent indirectement par `CL_ParseTEnt`/`CL_AddTEntPacket`, `CL_SmokeAndFlash`, `CL_AddParticles` et `particle-sync`.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; `npm run verify:g-main`; `npm run verify:particle-sync`; `npm run verify:p-view`; `npm run typecheck`.
  - Statut matrice: `T_Damage` reste `Partiel`; les lignes `te_sparks` x2, `mass` x2 et `VectorScale` sont `Valide`.

- 2026-05-01: debut de `T_Damage` avec locales `take`/`save`/`asave`/`psave`
  - Source comparee: `Quake-2-master/game/g_combat.c`.
  - Cible comparee: `packages/game/src/g_combat.ts`; appels runtime references depuis armes, trigger, fonctions, monstres, world effects et radius damage controles par recherche.
  - Correction appliquee: `runtime.meansOfDeath = mod` est maintenant execute apres le bloc friendly-fire et apres le retour `!takedamage`, comme le C original; le cas friendly-fire ajoute donc `MOD_FRIENDLY_FIRE` avant stockage.
  - Test ajuste: `scripts/verify/quake2-p-view.ts` marque l'entite joueur du harness comme damageable avant `P_FallingDamage`, ce qui correspond au flux joueur runtime attendu.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, `Behavior`, `Porting notes`.
  - Comparaison comportementale: `take = damage` et `save = 0`; godmode/invincibility mettent `take = 0` et conservent `damage` dans `save`; `psave` est retire avant l'appel armor; `asave` est retire puis additionne avec `save`; les compteurs client `damage_parmor`, `damage_armor`, `damage_blood`, `damage_knockback` et `damage_from` consomment ces valeurs comme attendu pour ce lot.
  - Branchement runtime verifie: `T_Damage` est atteint depuis `T_RadiusDamage`, `g_weapon.ts`, `g_func.ts`, `g_trigger.ts`, `g_target.ts`, `g_turret.ts`, `g_monster.ts`, `g_misc.ts` et `p_view.ts`; pas de manque de branchement ouvert pour ce lot.
  - `apps/web`: aucune logique parallele constatee; le flux navigateur attendu passe par le runtime game, les temp entities de `SpawnDamage` et les etats client repris par le client full-game.
  - `renderer-three`: aucune integration gameplay directe attendue pour les seules locales `take`/`save`/`asave`/`psave`; les sorties visibles concernees restent indirectes via `client.damage_*` -> `p_view` et temp entities/particules deja verifiees.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; `npm run verify:p-view`; `npm run verify:particle-sync`; `npm run typecheck`.
  - Statut matrice: `T_Damage` reste `Partiel` car seule la premiere tranche de la fonction est validee; les locales `take`/`save`/`asave`/`psave` sont `Valide`.

- 2026-04-30: `CheckTeamDamage`
  - Source comparee: `Quake-2-master/game/g_combat.c`.
  - Cible comparee: `packages/game/src/g_combat.ts`.
  - Correction appliquee: aucune. Le C original garde le bloc reel en FIXME/commentaire et retourne toujours `false`; le TS conserve ce stub strict, avec arguments neutralises par `void`.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`.
  - Branchement runtime verifie: `T_Damage` appelle `CheckTeamDamage` seulement hors `DAMAGE_NO_PROTECTION`; le stub ne bloque jamais les degats, comme le C. La logique effective de friendly fire reste le bloc precedent `OnSameTeam`/`DF_NO_FRIENDLY_FIRE` de `T_Damage`.
  - `apps/web`: aucune logique parallele constatee et aucun branchement direct attendu; ce helper ne produit pas de sortie navigateur, il influence uniquement l'absence de retour anticipe dans le runtime combat.
  - `renderer-three`: aucune integration directe attendue; le helper ne produit ni temp entity, ni etat de modele/frame/particule/dlight, et les effets visibles restent ceux de `T_Damage`/`SpawnDamage`.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline couvrant retour `false`, non-blocage par defaut dans `T_Damage`, et absence d'appel sous `DAMAGE_NO_PROTECTION`; `npm run typecheck`.

- 2026-04-30: `M_ReactToDamage`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`; dependances directes `visible` et `FoundTarget` verifiees dans `packages/game/src/g_ai.ts`.
  - Correction appliquee: aucune. Le port conserve les gardes attaquant non-client/non-monstre, self/current enemy, good-guy; la branche client avec conservation de l'ennemi client visible; les exclusions tank/supertank/makron/jorg; les cas tir intentionnel et aide du buddy; et la suppression de `FoundTarget` quand `AI_DUCKED`.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, `Behavior`.
  - Branchement runtime verifie: `T_Damage` appelle `M_ReactToDamage` pour les monstres survivants; les appels armes, radius damage, trigger/eau/lava/fall portes deleguent ensuite vers `T_Damage`.
  - `apps/web`: aucune logique parallele constatee; pas de branchement direct attendu, car le lot modifie l'etat IA serveur (`enemy`/`oldenemy`/`monsterinfo`) qui est ensuite observe via le runtime game et les snapshots.
  - `renderer-three`: aucune integration directe attendue; les effets visibles resultent indirectement des changements d'IA, de mouvement et d'attaque des monstres deja exposes comme entites visibles.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; `npm run verify:g-ai`; verification inline couvrant good-guy, ennemi client visible, changement monster-vers-monster, exclusion tank accidentelle, tir intentionnel ducked, adoption de l'ennemi du buddy; `npm run typecheck`.

- 2026-04-30: `CheckArmor` et locales associees (`save`, `index`, `armor`)
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`; dependances `ArmorIndex`, `GetItemByIndex` et `GetArmorInfoByItem` verifiees dans `packages/game/src/g_items.ts`.
  - Correction appliquee: aucune. Le port conserve les sorties `damage == 0`, absence de client, `DAMAGE_NO_ARMOR`, absence d'armor; le choix `DAMAGE_ENERGY` vs normal; le `ceil`; le plafonnement par inventaire; la consommation d'armor; et l'emission `SpawnDamage(te_sparks, point, normal, save)`.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`.
  - Branchement runtime verifie: `T_Damage` appelle `CheckArmor` apres `CheckPowerArmor`; `asave` alimente ensuite `client.damage_armor`, la sante retire seulement le reliquat non absorbe, et les flux armes/trigger/eau/fall dispatchent vers `T_Damage`.
  - `apps/web`: aucune logique parallele constatee; le flux attendu est indirect via le runtime game et le client full-game, avec armor visible par les stats/HUD (`p_hud`) et les effets view damage (`p_view`).
  - `renderer-three`: pas de branchement gameplay direct attendu; les effets visibles attendus passent par les temp entities `TE_SPARKS`/`TE_BULLET_SPARKS` produites par `SpawnDamage`, serialisees avec direction puis consommees indirectement via la synchronisation particules.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `CheckArmor` couvrant armor normale, energy, plafonnement inventaire, `DAMAGE_NO_ARMOR` et integration `T_Damage`; `npm run verify:p-view`; `npm run verify:particle-sync`; `npm run typecheck`.

- 2026-04-30: `CheckPowerArmor`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`; dependance `PowerArmorType`/`FindItem("Cells")` verifiee dans `packages/game/src/g_items.ts`.
  - Correction appliquee: aucune. Le port conserve les retours `damage == 0`/`DAMAGE_NO_ARMOR`, le split client/monstre, le test frontal `POWER_ARMOR_SCREEN`, les ratios d'absorption et la consommation de cellules.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`.
  - Branchement runtime verifie: `T_Damage` appelle `CheckPowerArmor`; les appels armes et entites portees dispatchent vers `T_Damage`; `SpawnDamage` produit les temp entities `TE_SCREEN_SPARKS`/`TE_SHIELD_SPARKS` avec position et direction.
  - `apps/web`: aucune logique parallele; le client full-game consomme les temp entities parsees et demarre les sons/effects associes.
  - `renderer-three`: integration indirecte attendue via particules du `ClientRefreshFrame` et `particle-sync`; pas de branchement direct gameplay attendu.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `CheckPowerArmor` couvrant bouclier client, ecran client frontal, ecran arriere refuse, monstre `DAMAGE_NO_ARMOR`; `npm run typecheck`.

- 2026-04-30: `SpawnDamage`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`
  - Correction appliquee: commentaire d'en-tete clarifie; le cap `damage > 255` est conserve mais le damage n'est pas serialise, comme la ligne `gi.WriteByte(damage)` commentee dans le C original.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`, `Porting notes`.
  - Branchement runtime verifie: `SpawnDamage` est appele par `CheckPowerArmor`, `CheckArmor` et `T_Damage`; les flux armes passent le hook `emitTempEntity` vers `T_Damage`; `local-game-bootstrap` convertit ce hook en evenement runtime `MULTICAST_PVS`; `local-gameplay-sync` reconstruit le packet client avec `origin` et `dir`.
  - `apps/web`: aucune reference directe trouvee pour `SpawnDamage`; `apps/web/src/full-game.ts` consomme les temp entities cote client, sans remplacer la logique gameplay.
  - `renderer-three`: aucune reference directe trouvee; non applicable pour ce lot.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `SpawnDamage` couvrant type, origin, dir et absence de payload `damage` avec entree `300`; `npm run typecheck`.

- 2026-04-30: `Killed`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`
  - Correction appliquee: le bookkeeping monstre (`killed_monsters`, score coop, owner medic) est maintenant execute avant le retour special `MOVETYPE_PUSH` / `MOVETYPE_STOP` / `MOVETYPE_NONE`, comme dans le C original.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, `Behavior`, `Porting notes`; l'ecart `monster_death_use` via hook reste documente.
  - Branchement runtime verifie: `Killed` est appele par `T_Damage`; `T_Damage` est appele par `T_RadiusDamage` et par les flux armes/runtime references dans `packages/game/src`.
  - `apps/web`: aucune reference directe trouvee pour `Killed`; pas de remplacement de logique gameplay constate pour ce lot.
  - `renderer-three`: aucune reference directe trouvee; non applicable pour ce lot.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `Killed` couvrant le bookkeeping avant retour `MOVETYPE_NONE`; `npm run typecheck`.

- 2026-04-30: `CanDamage`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`
  - Correction appliquee: les traces des cibles non-`MOVETYPE_PUSH` ne valident plus `trace.ent == targ`; seul le cas bmodel conserve ce special-case comme le C original.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`, `Porting notes`.
  - Branchement runtime verifie: `CanDamage` est appele par `T_RadiusDamage` et par les chemins armes dans `g_weapon.ts`; `T_Damage`/`T_RadiusDamage` sont appeles depuis plusieurs flux game runtime.
  - `apps/web`: aucune reference directe trouvee pour `CanDamage`; pas de remplacement de logique gameplay constate pour ce lot.
  - `renderer-three`: aucune reference directe trouvee; non applicable pour ce lot.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `CanDamage` couvrant probes normaux, refus `trace.ent == targ` hors bmodel, et centre `MOVETYPE_PUSH`; `npm run typecheck`.

## Prochain lot recommande

- Reconciliation des locales encore `A verifier` en matrice, en commencant par `trace` de `CanDamage`, puis les locales restantes de `CheckPowerArmor`.

## Blocages

- Aucun pour le lot traite.

## Decisions importantes

- La matrice conserve le statut automatique `A redecouper`; les deux lignes `SpawnDamage` ont ete repassees en `Valide` apres correction du pont serveur/apps web.
