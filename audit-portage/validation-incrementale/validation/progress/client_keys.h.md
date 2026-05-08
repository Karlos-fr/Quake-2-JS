# Progress - Quake-2-master/client/keys.h

## Etat courant

- Statut: En cours
- Dernier lot valide: macros clavier generales `K_TAB` a `K_END` dans `client/keys.h`.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/client_keys.h.md`
- Cible TS proprietaire: `packages/client/src/keys.ts`

## Preuves de session

- Comparaison source: `Quake-2-master/client/keys.h`
- Comparaison cible: `packages/client/src/keys.ts`, `packages/client/src/index.ts`
- Runtime: constantes exportees, utilisees par `Key_Event`, `Key_Console`, `Key_Message`, `Key_Init`, menus et bindings; atteignables depuis l'input web via `Key_Event(runtime.menu.keys, ...)`.
- apps/web: `apps/web/src/full-game.ts` mappe les DOM keys du lot vers les constantes TS, puis route vers `Key_Event` pour le flux jeu/console; `verify:full-game:input-bindings` couvre ce branchement.
- renderer-three: non applicable justifie pour ce lot; ces macros ne produisent pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene.
- Tests lances:
  - `npm run verify:keys`
  - `npm run verify:keys:header`
  - `npm run verify:full-game:input-bindings`
  - `npm run typecheck`

## Decisions

- Les commentaires d'en-tete de fonction ne s'appliquent pas aux macros de ce lot; l'en-tete de fichier `keys.ts` indique la source `client/keys.c` et `client/keys.h`.
- Aucun doublon proprietaire trouve pour ces macros: ownership conserve dans `packages/client/src/keys.ts`, reexport dans `packages/client/src/index.ts`.

## Prochain lot recommande

- Continuer avec les macros keypad `K_KP_HOME` a `K_KP_PLUS`, puis `K_PAUSE` si le jugement `apps/web` reste coherent.
