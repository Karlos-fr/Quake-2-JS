# Progress - Quake-2-master/game/g_chase.c

## Dernier lot valide

- 2026-04-30: `UpdateChaseCam` valide.
- Variables generees `targ`, `trace`, `i`, `old`: non applicables, ce sont des locales C de `UpdateChaseCam`.

## Tests de reference

- `npm run verify:g-chase` (ok le 2026-04-30)

## Decisions importantes

- `UpdateChaseCam` est branche via `p_client.ts`/`g_cmds.ts`/`p_hud.ts`; aucune reference directe trouvee dans `apps/web` ou `packages/renderer-three` pour ce lot.
- Aucune correction TS appliquee sur ce lot.

## Prochain lot recommande

- `ChaseNext` et ses variables locales generees `i`/`e`.

## Blocages

- Aucun.
