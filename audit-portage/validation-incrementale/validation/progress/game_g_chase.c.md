# Progress - Quake-2-master/game/g_chase.c

## Dernier lot valide

- 2026-04-30: `UpdateChaseCam` valide.
- Variables generees `targ`, `trace`, `i`, `old`: non applicables, ce sont des locales C de `UpdateChaseCam`.
- 2026-04-30: `ChaseNext` valide.
- Variables generees `i`, `e`: non applicables, ce sont des locales C de `ChaseNext`.

## Tests de reference

- `npm run verify:g-chase` (ok le 2026-04-30)

## Decisions importantes

- `UpdateChaseCam` est branche via `p_client.ts`/`g_cmds.ts`/`p_hud.ts`; aucune reference directe trouvee dans `apps/web` ou `packages/renderer-three` pour ce lot.
- Aucune correction TS appliquee sur ce lot.
- `ChaseNext` correspond au parcours C de la cible courante vers le prochain client actif non-spectateur; branchement via `g_cmds.ts`/`p_client.ts`; aucune reference directe trouvee dans `apps/web` ou `packages/renderer-three` pour ce lot.
- Aucune correction TS appliquee sur ce lot.

## Prochain lot recommande

- `ChasePrev` et ses variables locales generees `i`/`e`.

## Blocages

- Aucun.
