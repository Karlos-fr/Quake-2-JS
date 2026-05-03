# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `bfg_think` seul avec ses temporaires locaux de matrice (`ent`, `ignore`, `dmg`, `tr`, second `dmg`).
- Verdict du lot: valide pour `bfg_think`; temporaires locaux marques `Non applicable`.

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

## Preuves session - `bfg_explode`

- C source compare: `Quake-2-master/game/g_weapon.c`, fonction `bfg_explode`.
- TS cible compare: `packages/game/src/g_weapon.ts`, fonction `bfg_explode`.
- Commentaire d'en-tete verifie sur `bfg_explode` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Deuxieme `ignore` de matrice confirme comme doublon du temporaire local C de `fire_rail`, deja couvert par la session precedente.
- Comparaison C/TS `bfg_explode`: effet applique uniquement sur `s.frame == 0`, iteration `findradius`, filtres `takedamage`, owner, `CanDamage(ent,self)`, `CanDamage(ent,self->owner)`, calcul du centre par `ent->s.origin + 0.5 * (mins + maxs)`, distance, `points = radius_dmg * (1 - sqrt(dist / dmg_radius))`, emission `TE_BFG_EXPLOSION`, `T_Damage` avec `DAMAGE_ENERGY` et `MOD_BFG_EFFECT`, `nextthink = level.time + FRAMETIME`, increment frame, installation de `G_FreeEdict` a la frame 5.
- Temporaire local `ent`: porte comme variable locale TS; preuve de la cible issue de `findradius`, des skips owner/non-damageable/CanDamage et de la cible transmise a `T_Damage`.
- Temporaire local `v`: absent de la matrice mais traite avec le lot; porte par `center`/`offset` TS, preuve du calcul centre puis vecteur projectile-centre.
- Temporaire local `dist`: porte comme variable locale TS, preuve de la distance utilisee dans le calcul de `points`.
- Temporaire local `points`: porte comme variable locale TS, preuve du montant tronque C transmis a `T_Damage`.
- Correction TS: `fire_bfg` initialise maintenant `radius_dmg = damage`, afin que le chemin runtime normal fournisse a `bfg_explode` le champ C lu par l'effet de frame 0.
- Runtime verifie: `bfg_explode` est atteignable via `fire_bfg` -> `bfg_touch` -> `think = bfg_explode`, et `fire_bfg` est atteignable via `Weapon_BFG`, `monster_fire_bfg`, Jorg/Makron et le hook `LOCAL_GAME_WORLD_WEAPON_HOOKS`.
- `apps/web`: integration attendue indirecte via runtime full-game/local, transport des temp entities, sons/snapshots et refresh client; aucune logique web parallele ne remplace l'effet BFG.
- `packages/renderer-three`: sorties visibles attendues = entite projectile `EF_BFG`, sprite d'explosion `TE_BFG_EXPLOSION`, big explosion et lasers BFG en aval; elles passent par `CL_ParseTEnt`/`CL_ExecuteTempEntityEffects`, particules et beams exposes dans `ClientRefreshFrame`, puis consommes par les adapters Three; aucun manque ouvert observe.

## Preuves session - `bfg_touch`

- C source compare: `Quake-2-master/game/g_weapon.c`, fonction `bfg_touch`.
- TS cible compare: `packages/game/src/g_weapon.ts`, fonction `bfg_touch`.
- Commentaire d'en-tete verifie sur `bfg_touch` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `bfg_touch`: retour si `other == self->owner`, liberation sans effet si surface `SURF_SKY`, `PlayerNoise` pour owner client, degat direct `T_Damage` avec `plane->normal` et `MOD_BFG_BLAST`, splash `T_RadiusDamage` avec ignore `other`, son `weapons/bfg__x1b.wav`, passage `SOLID_NOT`, suppression `touch`, recul origine par `-FRAMETIME * velocity`, arret velocity, modele `sprites/s_bfg3.sp2`, reset frame/sound, suppression `EF_ANIM_ALLFAST`, installation `bfg_explode`, `nextthink = level.time + FRAMETIME`, `enemy = other`, emission `TE_BFG_BIGEXPLOSION`.
- Correction TS: le callback runtime installe par `fire_bfg` transmet maintenant `plane`/`surf` a `bfg_touch`, comme les callbacks `blaster_touch` et `rocket_touch`; cela preserve la branche ciel et la normale de collision du chemin `SV_Impact`/`G_RunFrame`.
- Runtime verifie: `bfg_touch` est atteignable via `fire_bfg` -> projectile `MOVETYPE_FLYMISSILE` -> `SV_Physics_Toss`/`SV_Impact`/`G_RunFrame`; le callback forwarde bien plane/surface, puis programme `bfg_explode`.
- `apps/web`: integration attendue indirecte via runtime serveur/local, snapshots et temp entities; aucune logique web parallele ne remplace l'impact BFG.
- `packages/renderer-three`: sorties visibles attendues = `TE_BFG_BIGEXPLOSION`, sprite `sprites/s_bfg3.sp2` et particules BFG client; elles passent par `CL_ParseTEnt`/`CL_ExecuteTempEntityEffects` et les adapters Three (`ClientRefreshFrame`, explosions/particules). Aucun manque ouvert observe.

## Preuves session - `bfg_think`

- C source compare: `Quake-2-master/game/g_weapon.c`, fonction `bfg_think`.
- TS cible compare: `packages/game/src/g_weapon.ts`, fonction `bfg_think`.
- Commentaire d'en-tete verifie sur `bfg_think` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `bfg_think`: choix `dmg = 5` en deathmatch sinon `10`, iteration `findradius(self->s.origin, 256)`, skips `self`, `owner`, non-damageable et non-monster/non-client hors `misc_explobox`, calcul centre `ent->absmin + 0.5 * ent->size`, direction normalisee vers la cible, trace de `self->s.origin` a `start + 2048 * dir` avec masque `CONTENTS_SOLID|CONTENTS_MONSTER|CONTENTS_DEADMONSTER`, ignore initial `self`, degats laser hors `FL_IMMUNE_LASER` et owner avec `DAMAGE_ENERGY`/`MOD_BFG_LASER`, emission `TE_LASER_SPARKS` sur hit non-monster/non-client, continuation a travers monstres/clients, emission `TE_BFG_LASER`, puis `nextthink = level.time + FRAMETIME`.
- Temporaire local `ent`: porte comme variable locale TS issue de `findradius`; preuve des filtres self/owner/takedamage/monster/client/`misc_explobox`.
- Temporaires locaux `point` et `dir` (non listés dans la matrice mais traites avec le lot): portes comme constantes locales TS; preuve du vecteur centre cible vers BFG et direction normalisee.
- Temporaire local `ignore`: porte comme variable locale TS; preuve de l'ignore initial `self`, puis mise a jour sur le monstre traverse.
- Temporaires locaux `start` et `end` (non listés dans la matrice mais traites avec le lot): portes comme variables locales TS; preuve du depart `self->s.origin`, du `end` a 2048 unites et de la copie `tr.endpos` apres hit monster/client.
- Temporaire local `dmg`: porte comme constante locale TS; preuve de la branche deathmatch `5`.
- Temporaire local `tr`: porte comme `tr`/`lastTrace`; preuve du masque de trace, de `tr.endpos` pour les degats/laser, de `tr.plane.normal` pour `TE_LASER_SPARKS` et de la fin de rayon.
- Runtime verifie: `bfg_think` est installe par `fire_bfg` comme callback `think`, atteint via projectile BFG et cadence `G_RunFrame`/think, puis se reprogramme a `level.time + FRAMETIME`.
- `apps/web`: integration attendue indirecte via runtime full-game/local, transport des temp entities et refresh client; aucune logique web parallele ne remplace les lasers BFG.
- `packages/renderer-three`: sorties visibles attendues = lasers `TE_BFG_LASER` et sparks `TE_LASER_SPARKS`; `TE_BFG_LASER` est parse cote client comme laser, stocke dans les temp lasers, expose dans `ClientRefreshFrame.beams`, puis consomme par `createThreeBeamSync`; `TE_LASER_SPARKS` passe par les temp effects/particules client. Aucun manque ouvert observe.

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
- `npm run verify:g-weapon` (session `bfg_think`)
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `npm run verify:g-weapon` (session `bfg_touch`)
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `npm run verify:g-weapon` (relance session `bfg_explode`)
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
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
- `packages/game/src/g_weapon.ts`: `fire_bfg` renseigne maintenant `radius_dmg = damage`, champ lu par `bfg_explode` comme dans le C.
- `scripts/verify/quake2-g-weapon.ts`: renforcement de `verifyBfgDamageModsAndVisibleEffects` pour couvrir l'initialisation runtime `fire_bfg` -> `bfg_explode`, les filtres `bfg_explode`, les locaux `ent`, `v`, `dist`, `points`, le montant tronque, `TE_BFG_EXPLOSION`, `DAMAGE_ENERGY`, `MOD_BFG_EFFECT`, reschedule et cleanup frame 5.
- `packages/game/src/g_weapon.ts`: `fire_bfg` forwarde maintenant `plane`/`surf` depuis le callback touch runtime vers `bfg_touch`.
- `scripts/verify/quake2-g-weapon.ts`: renforcement de `verifyBfgDamageModsAndVisibleEffects` pour couvrir `bfg_touch` (`plane->normal`, branche ciel, transition d'etat, sprite/son/effect, `bfg_explode` programme) et le forwarding runtime `fire_bfg`.
- `scripts/verify/quake2-g-weapon.ts`: renforcement de `verifyBfgDamageModsAndVisibleEffects` pour couvrir `bfg_think`, ses temporaires locaux, les filtres de rayon, la trace laser, `FL_IMMUNE_LASER`, `misc_explobox`, `TE_LASER_SPARKS`, `TE_BFG_LASER`, les payloads visibles et le reschedule `FRAMETIME`.

## Prochain lot recommande

- Continuer avec `fire_bfg` seul et son temporaire local `bfg`.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
