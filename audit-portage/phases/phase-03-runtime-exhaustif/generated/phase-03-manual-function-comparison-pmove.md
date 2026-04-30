# Comparaison manuelle fonction par fonction - qcommon/pmove.c

## Portee

- Source C : `Quake-2-master/qcommon/pmove.c`
- Port TypeScript : `packages/qcommon/src/pmove.ts`
- Mode : lecture comportementale fonction par fonction, en complement du rapport outille `phase-03-function-body-comparison-report.md`
- Preprocesseur : les blocs C `#if 0` sont exclus, comme dans les outils Phase 03.

## Verdict global

`qcommon/pmove.c` est majoritairement aligne fonction par fonction avec le port TS. La comparaison a trouve un ecart runtime reel dans `Pmove` sur le chemin `PM_WaterMove` : le TS recalculait les vecteurs avec le pitch divise par 3 avant le choix eau/air, alors que le C ne fait ce recalcul que dans le chemin air. L'ecart a ete corrige dans `packages/qcommon/src/pmove.ts` et verrouille par `scripts/verify/quake2-pmove.ts`.

## Comparaison par fonction

| Fonction C | Fonction TS | Verdict | Notes |
| --- | --- | --- | --- |
| `PM_ClipVelocity` | `PM_ClipVelocity` | OK | Meme calcul `backoff`, meme correction axe par axe, meme seuil `STOP_EPSILON`. |
| `PM_StepSlideMove_` | `PM_StepSlideMove_` | OK avec adaptation | Meme boucle de 4 bumps, meme gestion `allsolid`, `fraction`, plans de clipping, crease 2 plans, `pm_time`. Le TS explicite l'absence de `trace` par exception. |
| `PM_StepSlideMove` | `PM_StepSlideMove` | OK | Meme comparaison move bas vs step-up, meme rejet si normale trop raide, meme restauration du Z depuis `down_v`. |
| `PM_Friction` | `PM_Friction` | OK | Meme decomposition sol/eau/echelle/vol, meme application du `drop`, meme preservation du Z. |
| `PM_Accelerate` | `PM_Accelerate` | OK | Meme dot product, `addspeed`, clamp `accelspeed`, accumulation par axe. |
| `PM_AirAccelerate` | `PM_AirAccelerate` | OK | Meme cap `wishspd <= 30`, meme acceleration air. |
| `PM_AddCurrents` | `PM_AddCurrents` | OK avec forme TS | Meme prise en compte ladder, water currents, conveyor ground. Le TS remplace certains `VectorClear`/`VectorMA` par mutations directes equivalentes. |
| `PM_WaterMove` | `PM_WaterMove` | OK | Meme construction `wishvel`, descente passive `-60`, courants, demi vitesse, acceleration eau, `PM_StepSlideMove`. |
| `PM_AirMove` | `PM_AirMove` | OK | Meme aplatissement forward/right, friction air/sol, acceleration sol ou air, gravite, step-slide. |
| `PM_CatagorizePosition` | `PM_CatagorizePosition` | OK avec adaptation | Meme trace sol, landing timers, clear waterjump, `touchents`, echantillons waterlevel. Le TS explicite `trace` et `pointcontents` obligatoires. |
| `PM_CheckJump` | `PM_CheckJump` | OK | Meme anti-repeat, saut sol, nage water/slime/lava et vitesse verticale. |
| `PM_CheckSpecialMovement` | `PM_CheckSpecialMovement` | OK avec adaptation | Meme detection ladder et waterjump. Le TS explicite les callbacks obligatoires. |
| `PM_FlyMove` | `PM_FlyMove` | OK avec adaptation | Meme friction spectator, acceleration, move libre ou trace clippee. Le TS valide `trace` seulement si `doclip`. |
| `PM_CheckDuck` | `PM_CheckDuck` | OK | Meme hull gib/dead/ducked, meme probe de stand-up, meme viewheight. |
| `PM_DeadMove` | `PM_DeadMove` | OK | Meme friction additionnelle au sol : longueur -20, clear si <= 0, normalize/scale sinon. |
| `PM_GoodPosition` | `PM_GoodPosition` | OK avec adaptation | Meme bypass spectator, conversion origin packed -> float, trace non solide. Le TS explicite `trace` obligatoire. |
| `PM_SnapPosition` | `PM_SnapPosition` | OK | Meme quantization en huitiemes, meme ordre `jitterbits`, meme fallback `previous_origin`. |
| `PM_InitialSnapPosition` | `PM_InitialSnapPosition` | OK | Meme version active `offset = {0,-1,1}`, meme recherche 3x3x3, meme mise a jour origin et previous_origin. |
| `PM_ClampAngles` | `PM_ClampAngles` | OK | Meme teleport yaw-only, meme clamp pitch 89/271, meme recalcul `AngleVectors`. |
| `Pmove` | `Pmove` | OK apres correction | Meme orchestration globale. Ecart corrige : le recalcul pitch/3 est maintenant limite au chemin air, comme dans le C. Les options TS restent des gates d'integration, non actives par defaut sauf choix explicite. |

## Ecart corrige

- C original : apres `PM_Friction`, si `waterlevel >= 2`, appel direct a `PM_WaterMove`; sinon recalcul des angles avec `PITCH / 3`, puis `PM_AirMove`.
- Ancien TS : recalculait les angles avec `PITCH / 3` avant le choix eau/air, donc `PM_WaterMove` utilisait une base de mouvement air.
- Correction : deplacement du recalcul `PITCH / 3` dans le seul `else` air.
- Test ajoute : `verifyPmoveKeepsFullPitchVectorsForWaterMove` dans `scripts/verify/quake2-pmove.ts`.

## Validations

- `npm run audit:phase3:functions` : OK
- `npm run verify:pmove` : OK
- `npm run typecheck` : OK

## Limite de cette passe

Cette passe manuelle couvre `qcommon/pmove.c`. La comparaison automatique globale couvre deja les 1848 fonctions C actives et identifie 1751 corps TS de meme nom, mais les autres fichiers restent a relire manuellement pour transformer `matched-name-needs-behavior-review` en verdict comportemental.
