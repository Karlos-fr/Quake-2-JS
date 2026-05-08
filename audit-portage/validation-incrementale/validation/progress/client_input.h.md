# Progress - Quake-2-master/client/input.h

## Etat

- Statut: Termine
- Lot valide pendant cette session: tout `client/input.h`.
- Entites validees: `IN_Init`, `IN_Shutdown`, `IN_Commands`, `IN_Frame`, `IN_Move`, `IN_Activate`.

## Preuves de validation

- Source C/H comparee: `Quake-2-master/client/input.h`, appels runtime dans `client/cl_main.c` et `client/cl_input.c`, backends historiques `win32/in_win.c`, `linux/in_linux.c`, `null/in_null.c`.
- Cible TS comparee: `packages/client/src/input.ts`, exports `packages/client/src/index.ts`, appel `IN_Move` depuis `packages/client/src/cl_input.ts`.
- Commentaires d'en-tete verifies pour les six fonctions portees.
- Runtime corrige pour exposer les procedures `IN_Init`, `IN_Shutdown`, `IN_Commands` et `IN_Frame` via `createClientInputDeviceMainHooks`, et pour appeler `IN_Move` via un `inputDevice` explicite dans le flux full-game.
- `apps/web` corrige pour initialiser, activer/desactiver, fermer et pomper le device input porte, sans logique parallele masquant les wrappers `IN_*`.
- `renderer-three`: pas de sortie directe produite par `input.h`; effet indirect verifie via `CL_Frame -> CL_SendCmd -> prediction/playerstate/camera`, puis rendu Three.

## Tests lances

- `npm run verify:input:header`
- `npm run verify:cl-input`
- `npm run verify:full-game:input-bindings`
- `npm run verify:full-game:authoritative-input`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections appliquees

- `packages/client/src/input.ts`: ajout de l'adapter `createClientInputDeviceMainHooks`.
- `packages/client/src/index.ts`: export de l'adapter.
- `apps/web/src/full-game.ts`: branchement du context input device dans le lifecycle full-game, focus/blur, shutdown et `CL_Frame`.
- `scripts/verify/quake2-input-header.ts`: preuve du bridge `input.h` vers hooks `cl_main`.
- `scripts/verify/quake2-full-game-input-bindings.ts`: preuve statique du branchement web input device.

## Prochain lot recommande

Aucun pour `client/input.h`: toutes les entrees sont `Valide`.
