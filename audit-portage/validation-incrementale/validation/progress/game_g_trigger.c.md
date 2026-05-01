# Progress - Quake-2-master/game/g_trigger.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `trigger_relay_use`, `SP_trigger_relay`, `trigger_key_use`, artefacts locaux `index`/`player`/`ent`/`cube`, `SP_trigger_key`.
- Verdict du lot: valide pour les fonctions; artefacts locaux marques non applicables.

## Preuves session

- C source compare: `Quake-2-master/game/g_trigger.c`
- TS cible compare: `packages/game/src/g_trigger.ts`
- Runtime verifie: `SpawnEntities` -> `ED_CallSpawn` pour `trigger_relay`/`trigger_key`, callback `use`, propagation par `G_UseTargets`.
- `apps/web`: non applicable directement pour ce lot; le navigateur lance le flux serveur via `SV_Frame`/runtime, pas de logique parallele attendue pour ces relais.
- `packages/renderer-three`: non applicable pour ce lot; `trigger_relay` et `trigger_key` ne produisent ni modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ni scene visible.

## Tests lances

- `npm run verify:g-trigger`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-trigger.ts`: ajout d'une verification `trigger_relay` couvrant `SP_trigger_relay`, le callback `use` et la propagation de l'activator vers la cible.

## Prochain lot recommande

- Continuer avec `trigger_counter_use` et `SP_trigger_counter`, puis `SP_trigger_always` si le lot reste petit.

## Blocages

- Aucun.
