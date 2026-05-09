# Progress TS - packages/client/src/cl_input.ts

- Dernier lot valide: lot complet des 21 lignes presentes dans `packages_client_src_cl_input.ts.md`.
- Source C/H croisee: `audit-portage/validation-incrementale/validation/matrices/client_cl_input.c.md`, toutes les fonctions portees du lot y sont `Valide` et proprietaires de `packages/client/src/cl_input.ts`.
- Cible lue: `packages/client/src/cl_input.ts`.
- Corrections session:
  - En-tetes `Category: New` completes avec `Original name: N/A` et `Source: N/A (...)` pour les interfaces/options/factories/bridge et helpers locaux.
  - `cloneUsercmd` et `createNullUsercmd` classes comme helpers locaux `New`.
  - `bindButtonCommands` marque `Non applicable`: symbole absent du TS courant, uniquement present dans des index d'audit generes obsoletes.
- Runtime/apps-web:
  - Runtime integre: `CL_InitInput` enregistre les commandes, `CL_CreateCmd`/`CL_SendCmd` construisent les usercmds, et `createClientSendCmdBridge` branche `CL_SendCmd` depuis le flux client.
  - `apps/web` integre: `full-game.ts`, `local-client-controller.ts` et `full-game-local-session.ts` creent/utilisent le contexte input et consomment les commandes portees.
  - `renderer-three` non applicable directement: le lot produit des usercmds/paquets et modifie les angles d'entree, sans sortie renderer directe; effet visible indirect via prediction/camera du runtime.
- Tests lances:
  - `npm run verify:cl-input`: echec sur l'assertion "CL_SendCmd cinematic skip path should queue nextserver" (`-1 !== 4`), le harness lit `client.net_message` alors que le source C et `SCR_FinishCinematic` ecrivent le reliable dans `cls.netchan.message`.
  - `npm run verify:full-game:input-bindings`: ok.
  - `npm run verify:full-game:authoritative-input`: ok.
  - `npm run typecheck`: ok.
- Prochain lot recommande: aucun dans la matrice TS actuelle; si les matrices sont regenerees, auditer les wrappers `IN_*` exportes non listes actuellement.
