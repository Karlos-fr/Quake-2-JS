# Progress - Quake-2-master/game/g_chase.c

## Dernier lot valide

- 2026-04-30: `UpdateChaseCam` valide.
- Variables generees `targ`, `trace`, `i`, `old`: non applicables, ce sont des locales C de `UpdateChaseCam`.
- 2026-04-30: `ChaseNext` valide.
- Variables generees `i`, `e`: non applicables, ce sont des locales C de `ChaseNext`.
- 2026-04-30: `ChasePrev` valide.
- Variables generees `i`, `e`: non applicables, ce sont des locales C de `ChasePrev`.
- 2026-04-30: `GetChaseTarget` valide.
- Variables generees `i`, `other`: non applicables, ce sont des locales C de `GetChaseTarget`.

## Tests de reference

- `npm run verify:g-chase` (ok le 2026-04-30)

## Decisions importantes

- `UpdateChaseCam` est branche via `p_client.ts`/`g_cmds.ts`/`p_hud.ts`; aucune reference directe trouvee dans `apps/web` ou `packages/renderer-three` pour ce lot.
- Aucune correction TS appliquee sur ce lot.
- `ChaseNext` correspond au parcours C de la cible courante vers le prochain client actif non-spectateur; branchement via `g_cmds.ts`/`p_client.ts`; aucune reference directe trouvee dans `apps/web` ou `packages/renderer-three` pour ce lot.
- Aucune correction TS appliquee sur ce lot.
- `ChasePrev` correspond au parcours C de la cible courante vers le client actif non-spectateur precedent; branchement via `g_cmds.ts`; aucune reference directe trouvee dans `apps/web` ou `packages/renderer-three` pour ce lot.
- Aucune correction TS appliquee sur ce lot.
- Passe rapide post-validation du 2026-04-30: controle limite aux lignes deja `Valide` (`UpdateChaseCam`, `ChaseNext`, `ChasePrev`). Branchement runtime confirme dans `packages/game`; pas de branchement direct attendu dans `apps/web`/`packages/renderer-three`, car les sorties visibles transitent par `playerstate`, `CL_CalcViewValues`/`ClientRefreshFrame`, puis camera/refdef renderer. Aucun statut degrade.
- `GetChaseTarget` correspond a la boucle C sur les clients 1..maxclients, selectionne le premier client actif non-spectateur, force `update_chase`, appelle `UpdateChaseCam`, ou emet le message "No other players to chase."; branchement runtime confirme via `p_client.ts` (attaque ou saut spectateur sans cible).
- Aucune reference directe attendue dans `apps/web` ou `packages/renderer-three` pour `GetChaseTarget`: l'effet visible passe par `playerstate`/refresh puis camera/refdef renderer.
- Aucune correction TS appliquee sur ce lot.

## Prochain lot recommande

- Fichier termine cote `g_chase.c`; prochain lot recommande hors fichier: reprendre le prochain fichier prioritaire dans `AVANCEMENT_GLOBAL.md`.

## Blocages

- Aucun.
