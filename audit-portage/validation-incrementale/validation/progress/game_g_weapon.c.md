# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `fire_rocket` et temporaire local `rocket`.
- Verdict du lot: valide pour `fire_rocket`; `rocket` est non applicable comme entite autonome.

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

## Corrections

- `packages/game/src/g_weapon.ts`: `fire_rocket` conserve maintenant le `dir` brut comme le C pour `movedir`, `velocity` et `check_dodge`; `check_dodge` est appele avant `linkGameEntity`; commentaire `fire_rocket` ajuste.
- `scripts/verify/quake2-g-weapon.ts`: ajout de `verifyFireRocketSpawnStateAndDodgeOrder` pour prouver l'etat du projectile, le modele/son/effect, le local `rocket`, l'ordre `check_dodge` puis `linkentity`, et l'exposition au runtime touch.

## Prochain lot recommande

- Continuer avec `fire_rail` et les temporaires locaux associes (`from`, `end`, `tr`, premier `ignore`, `mask`, `water`) si le lot reste coherent.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
