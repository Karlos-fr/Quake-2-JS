# Progress TS - packages/game/src/g_chase.ts

- Statut: Termine
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_chase.ts.md`
- Fichier TS: `packages/game/src/g_chase.ts`
- Dernier lot traite: toutes les lignes `Couvert C/H` (`UpdateChaseCam`, `ChaseNext`, `ChasePrev`, `GetChaseTarget`).
- Prochain lot recommande: Aucun.

## Validation

- Checklist TS appliquee aux 4 lignes `Couvert C/H`.
- Matrice C/H croisee: `audit-portage/validation-incrementale/validation/matrices/game_g_chase.c.md`.
- Verdict: les 4 symboles sont les proprietaires TS attendus des fonctions C de `Quake-2-master/game/g_chase.c`.
- Ownership: conforme, package `packages/game`.
- Doublons: aucun portage proprietaire concurrent detecte pour ces `Original name`.
- En-tetes: verifies et source declaree alignee sur `Quake-2-master/game/g_chase.c`.

## Integration

- Runtime: couvert par la matrice C/H; appels via `g_cmds.ts` et `p_client.ts`.
- apps/web: pas d'integration directe attendue; consomme les sorties runtime via le flux client/refresh.
- renderer-three: pas d'integration directe attendue; la camera chase transite par `playerstate`/refdef.

## Tests

- `npm run verify:g-chase`: OK.
- `npm run typecheck`: OK.

## Blocages

- Aucun.
