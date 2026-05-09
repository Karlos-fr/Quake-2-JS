# Progress TS - packages/client/src/input.ts

## Etat

- Statut: Termine
- Lot valide pendant cette session: tout `packages/client/src/input.ts`.
- Entites validees: `ClientInputDeviceHooks`, `ClientInputDeviceContext`, `ClientInputDeviceMainHooks`, `createClientInputDeviceContext`, `IN_Init`, `IN_Shutdown`, `IN_Commands`, `IN_Frame`, `IN_Move`, `IN_Activate`, `createClientInputDeviceMainHooks`.

## Preuves de validation

- Matrice TS ouverte et croisee avec `audit-portage/validation-incrementale/validation/matrices/client_input.h.md`.
- Source C/H comparee: `Quake-2-master/client/input.h`.
- Les six procedures `IN_*` sont les proprietaires TS attendus pour `client/input.h` et la matrice C/H les marque `Valide`.
- Les interfaces/factories/adapters TS sont classés `New` ou `Adapter` avec `Original name: N/A` et `Source: N/A (...)` explicites.
- Recherche de doublons/ownership/imports effectuee sur le repo: pas de portage proprietaire concurrent pour `client/input.h`; package client attendu.
- Integration runtime: `IN_Move` est consomme par `CL_CreateCmd`/`CL_SendCmd`; `createClientInputDeviceMainHooks` branche init/frame/commands/shutdown dans le lifecycle client.
- Integration `apps/web`: `full-game.ts` cree le contexte, active/desactive et shutdown le device input porte sans logique parallele remplacant les wrappers `IN_*`.
- Integration `renderer-three`: aucune sortie de rendu directe; effet indirect via commandes client/prediction/camera couvert par les tests full-game.

## Tests lances

- `npm run verify:input:header`
- `npm run verify:cl-input` bloque sur l'assertion hors lot connue `CL_SendCmd cinematic skip path should queue nextserver`.
- `npm run verify:full-game:input-bindings`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections appliquees

- `packages/client/src/input.ts`: entetes completes pour les entites `New` et `Adapter`.
- `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_input.ts.md`: matrice fermee, avec ajout des deux adapters exportes absents de la matrice courante.
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`: ligne `input.ts` passee a `Termine`.

## Prochain lot recommande

Aucun pour `packages/client/src/input.ts`.
