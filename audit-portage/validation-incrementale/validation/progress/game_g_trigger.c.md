# Progress - Quake-2-master/game/g_trigger.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `hurt_use`, `hurt_touch`, les temporaires locaux `dflags`, `SP_trigger_hurt`.
- Verdict du lot: valide.

## Preuves session

- C source compare: `Quake-2-master/game/g_trigger.c`
- TS cible compare: `packages/game/src/g_trigger.ts`
- Runtime verifie: `SP_trigger_hurt` branche `hurt_touch` via `ED_CallSpawn`; `hurt_use` toggle `solid` et supprime `use` hors `TOGGLE`; `hurt_touch` couvre `takedamage`, timestamp `FRAMETIME`, `SLOW`, `SILENT`, son `world/electro.wav`, `dflags` avec/sans `NO_PROTECTION`, `T_Damage` et `MOD_TRIGGER_HURT`.
- `apps/web`: integration attendue indirecte via runtime serveur/full-game; le trigger produit degats, son serveur et etat joueur/HUD via snapshots/runtime, sans logique parallele attendue dans `apps/web`.
- `packages/renderer-three`: integration attendue indirecte via snapshots/camera/HUD damage consommes par le flux full-game; pas de modele, frame, image, particule, beam, dlight, temp entity ou areabit propre a `trigger_hurt`.

## Tests lances

- `npm run verify:g-trigger`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-trigger.ts`: renforcement de `verifyTriggerHurt` pour couvrir spawn/defaults, soundindex, dommage, `MOD_TRIGGER_HURT`, cadence, debounce, `SLOW`, `SILENT`, `NO_PROTECTION`/godmode et `hurt_use` hors `TOGGLE`.

## Prochain lot recommande

- Continuer avec `trigger_gravity_touch` et `SP_trigger_gravity`.

## Blocages

- Aucun.
