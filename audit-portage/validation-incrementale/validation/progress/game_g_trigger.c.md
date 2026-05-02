# Progress - Quake-2-master/game/g_trigger.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `trigger_counter_use`, `SP_trigger_counter`, `SP_trigger_always`.
- Verdict du lot: valide.

## Preuves session

- C source compare: `Quake-2-master/game/g_trigger.c`
- TS cible compare: `packages/game/src/g_trigger.ts`
- Runtime verifie: `trigger_counter_use` branche comme callback `use`; `SP_trigger_counter` est dans `ED_CallSpawn`; `SP_trigger_always` est dans `ED_CallSpawn` et passe par `G_UseTargets` avec delai minimum 0.2.
- `apps/web`: pas de branchement direct attendu dans ce lot; `apps/web` declenche le runtime serveur via `SV_Frame`, et ces triggers ne remplacent pas la logique runtime principale.
- `packages/renderer-three`: non applicable pour ce lot; `trigger_counter` et `trigger_always` ne produisent ni modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ni scene visible.

## Tests lances

- `npm run verify:g-trigger`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-trigger.ts`: renforcement de `verifyTriggerCounter` pour couvrir messages/sons et `spawnflags & 1`; ajout de `verifyTriggerAlways` pour couvrir le delai minimum et le dispatch differe.

## Prochain lot recommande

- Continuer avec `PUSH_ONCE`, `windsound`, `trigger_push_touch` et `SP_trigger_push` si le lot reste petit.

## Blocages

- Aucun.
