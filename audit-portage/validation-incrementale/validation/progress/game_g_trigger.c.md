# Progress - Quake-2-master/game/g_trigger.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `PUSH_ONCE`, `windsound`, `trigger_push_touch`, `SP_trigger_push`.
- Verdict du lot: valide.

## Preuves session

- C source compare: `Quake-2-master/game/g_trigger.c`
- TS cible compare: `packages/game/src/g_trigger.ts`
- Runtime verifie: `SP_trigger_push` branche `trigger_push_touch` via `ED_CallSpawn`; callback `touch` couvert pour grenade, acteur vivant, acteur mort ignore, son `misc/windfly.wav`, debounce strict, copie `oldvelocity`, vitesse `movedir * speed * 10` et `PUSH_ONCE`.
- `apps/web`: integration attendue indirecte via runtime serveur/full-game; le trigger modifie vitesse/snapshots joueur et ne doit pas etre reimplemente dans `apps/web`.
- `packages/renderer-three`: integration attendue indirecte via trajectoire/camera issue des snapshots full-game; pas de modele, particule, beam, dlight, temp entity ou areabit propre au trigger, mais la camera visible depend de la vitesse appliquee.

## Tests lances

- `npm run verify:g-trigger`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-trigger.ts`: renforcement de `verifyTriggerPush` pour couvrir spawn, soundindex, grenade, joueur vivant, debounce sonore, acteur mort ignore et `PUSH_ONCE`.

## Prochain lot recommande

- Continuer avec `hurt_use`, `hurt_touch`, les temporaires locaux `dflags` et `SP_trigger_hurt` si le lot reste petit.

## Blocages

- Aucun.
