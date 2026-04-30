# Progress - Quake-2-master/game/g_combat.c

## Correction des partielles

- 2026-04-30: correction de l'integration visible `SpawnDamage` (deux lignes matrice).
  - Correction appliquee: `packages/game/src/g_main.ts` ecrit maintenant `WriteDir(payload.dir)` pour les temp entities qui sont parsees cote client comme `position + direction` (`TE_BLOOD`, sparks, blaster/flechette et variantes proches), en plus des cas `TE_SPLASH`/`TE_LASER_SPARKS` deja specifiques.
  - Checklist reprise: source C/TS deja comparee sur `SpawnDamage`; commentaire d'en-tete TS conserve; branchement runtime verifie via `SpawnDamage` -> evenement temp entity -> `flushRuntimeEngineEvents`; `apps/web` consomme ce flux via le client full-game; `renderer-three` reste consommateur indirect des effets client, sans branchement direct attendu.
  - Tests lances: `npm run verify:g-main` (nouvelle assertion sur `TE_BLOOD` origin + dir), `npx tsx ./scripts/verify/quake2-g-combat.ts`, `npm run typecheck`.

## Passe rapide post-validation

- 2026-04-30: controle cible des lignes deja marquees `Valide` (`CanDamage`, `Killed`, `SpawnDamage` x2), sans revalidation comportementale complete C/TS. `CanDamage` et `Killed` restent coherents: branchement runtime via `T_RadiusDamage`/`T_Damage` et appels gameplay constates; aucune integration directe `apps/web` ou `renderer-three` attendue, les effets visibles passent par les etats/evenements client existants. `SpawnDamage` avait ete retrograde en `Partiel` pendant cette passe: le chemin local-gameplay-sync preservait bien `origin` et `dir`, mais le pont serveur/apps web (`g_main.ts`) serialisait les temp entities generiques avec seulement `origin`, alors que `CL_ParseTEnt` attend aussi une direction pour `TE_BLOOD`, `TE_SPARKS`, `TE_BULLET_SPARKS`, `TE_SCREEN_SPARKS` et `TE_SHIELD_SPARKS`; point corrige dans la section precedente.

## Dernier lot valide

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

- `M_ReactToDamage`, avec jugement cible sur `visible`/`FoundTarget` et les changements `enemy`/`oldenemy`.

## Blocages

- Aucun pour le lot traite.

## Decisions importantes

- La matrice conserve le statut automatique `A redecouper`; les deux lignes `SpawnDamage` ont ete repassees en `Valide` apres correction du pont serveur/apps web.
