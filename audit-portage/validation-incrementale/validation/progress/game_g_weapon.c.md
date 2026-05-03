# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `fire_rail` avec les temporaires locaux `from`, `end`, `tr`, premier `ignore`, `mask`, `water`.
- Verdict du lot: valide pour `fire_rail`; les temporaires locaux du lot sont non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaire d'en-tete verifie et mis a jour sur `fire_rocket` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `fire_rocket`: `G_Spawn`, copie `start` vers `s.origin`, copie `dir` vers `movedir`, `vectoangles(dir)`, `VectorScale(dir, speed)`, `MOVETYPE_FLYMISSILE`, `MASK_SHOT`, `SOLID_BBOX`, `EF_ROCKET`, bbox vide, modele `models/objects/rocket/tris.md2`, owner, touch `rocket_touch`, cleanup `level.time + 8000/speed`, degats direct/splash/radius, son `weapons/rockfly.wav`, classname `rocket`, `check_dodge` pour owner client, puis `linkentity`.
- Corrections TS: suppression de la normalisation interne de `dir` pour `movedir`, `velocity` et `check_dodge`; ordre C restaure avec `check_dodge` avant `linkGameEntity`; commentaire `fire_rocket` ajuste pour ne plus decrire le touch path comme non porte.
- Temporaire local: `rocket` est une constante locale TS; l'etat projectile cree, assets, callbacks, exposition runtime touch et ordre `check_dodge`/`linkentity` sont couverts par `verifyFireRocketSpawnStateAndDodgeOrder`.
- Runtime verifie: `fire_rocket` est atteignable via `Weapon_RocketLauncher_Fire`, `monster_fire_rocket`, `turret_breach_think`, et le hook `LOCAL_GAME_WORLD_WEAPON_HOOKS`; le projectile est lie comme solide et son `touch` forwarde `plane`/`surf` vers `rocket_touch`, son `think` libere l'edict.
- `apps/web`: integration attendue indirecte via runtime full-game/local et snapshots serveur; aucune logique web parallele ne remplace le tir de rocket, le rendu ou l'impact.
- `packages/renderer-three`: sorties visibles attendues via entite rocket (`EF_ROCKET`, modele, son), puis impact/debris/temp entities consommes par le pipeline client refresh et adapters Three (`refresh-entity-sync`, particules/dlights/temp effects); aucun manque ouvert observe.

## Preuves session - `fire_rail`

- C source compare: `Quake-2-master/game/g_weapon.c`, lignes `fire_rail`.
- TS cible compare: `packages/game/src/g_weapon.ts`, fonction `fire_rail`.
- Commentaire d'en-tete verifie sur `fire_rail` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `fire_rail`: `end = start + 8192 * aimdir`, `from = start`, `ignore = self`, `water = false`, masque initial `MASK_SHOT | CONTENTS_SLIME | CONTENTS_LAVA`, boucle `trace`, retrait slime/lava du masque et flag `water`, continuation a travers monstres/clients via `ignore = tr.ent`, `T_Damage` avec `MOD_RAILGUN`, avancee de `from` vers `tr.endpos`, emission `TE_RAILTRAIL`, second `TE_RAILTRAIL` si eau/slime/lava, puis `PlayerNoise` pour un tireur client.
- Temporaire local `from`: porte comme variable locale TS; preuve de copie initiale de `start`, puis avancee apres trace slime/lava et apres monstre perce.
- Temporaire local `end`: porte comme constante locale TS; preuve du calcul `start + 8192 * aimdir`.
- Temporaire local `tr`: porte comme `trace` puis `lastTrace`; preuve de l'utilisation de la trace finale pour le rail trail, et de `tr.endpos`/`tr.plane.normal` pour les degats.
- Temporaire local `ignore`: porte comme variable locale TS; preuve de l'ignore initial `self`, maintien apres slime/lava, puis ignore du monstre perce.
- Temporaire local `mask`: porte comme variable locale TS; preuve du masque initial avec `CONTENTS_SLIME|CONTENTS_LAVA`, puis reduction a `MASK_SHOT`.
- Temporaire local `water`: porte comme booleen local TS; preuve du second `TE_RAILTRAIL` apres contenu slime/lava.
- Runtime verifie: `fire_rail` est atteignable via `Weapon_Railgun_Fire`, `monster_fire_railgun`, les monstres gladiator/makron qui utilisent `monster_fire_railgun`, et le hook `LOCAL_GAME_WORLD_WEAPON_HOOKS`; les degats passent par `T_Damage`, les effets visibles par `emitTempEntity`.
- `apps/web`: integration attendue indirecte via runtime full-game/local, transport des temp entities et refresh client; aucune logique web parallele ne remplace le tir railgun.
- `packages/renderer-three`: sortie visible attendue = `TE_RAILTRAIL`; elle est parse cote client, convertie en rail trail particulaire par `CL_ExecuteTempEntityEffects`/`CL_RailTrail`, exposee dans `ClientRefreshFrame.particles`, puis consommee par `createThreeParticleSync`/`R_DrawParticles`; aucun manque ouvert observe.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:g-turret`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `npm run verify:g-weapon` (relance session `fire_rail`)
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `packages/game/src/g_weapon.ts`: `fire_rocket` conserve maintenant le `dir` brut comme le C pour `movedir`, `velocity` et `check_dodge`; `check_dodge` est appele avant `linkGameEntity`; commentaire `fire_rocket` ajuste.
- `scripts/verify/quake2-g-weapon.ts`: ajout de `verifyFireRocketSpawnStateAndDodgeOrder` pour prouver l'etat du projectile, le modele/son/effect, le local `rocket`, l'ordre `check_dodge` puis `linkentity`, et l'exposition au runtime touch.
- `scripts/verify/quake2-g-weapon.ts`: renforcement de `verifyFireRailDamageModAndVisibleTrail` pour couvrir les locaux `from`, `end`, `tr`, premier `ignore`, `mask`, `water`, la branche slime/lava, le monstre perce, `MOD_RAILGUN` et le double `TE_RAILTRAIL`.

## Prochain lot recommande

- Continuer avec le deuxieme `ignore` de la matrice si confirme comme artefact de `fire_rail`, puis `bfg_explode` et ses temporaires locaux (`ent`, `points`, `dist`, `v`) si le lot reste coherent.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
