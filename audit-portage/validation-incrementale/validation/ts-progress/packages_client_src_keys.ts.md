# Progress TS - packages/client/src/keys.ts

- Statut: Termine
- Dernier lot valide: `Key_StringToKeynum`, `Key_KeynumToString`, `Key_SetBinding`, `Key_Unbind_f`, `Key_Unbindall_f`, `Key_Bind_f`, `Key_WriteBindings`, `Key_Bindlist_f`, `Key_Init`, `Key_Event`, `Key_ClearStates`, `Key_GetKey`, puis tous les helpers prives restants de `normalizeContextOptions` a `error`.
- Matrices C/H croisees: `client_keys.h.md`, `client_keys.c.md`, `client_client.h.md`.
- Tests de reference:
  - `npm run verify:keys`
  - `npm run verify:keys:header`
  - `npm run verify:full-game:input-bindings`
  - `npm run typecheck`
- Decisions:
  - `KEY_ARRAY_SIZE` et `KEY_LINE_COUNT` sont des constantes TS `New` nommant des bornes C fixes, pas des proprietaires C/H distincts.
  - `ClientKeyHooks`, `ClientKeyContext`, `ClientKeyContextOptions`, `KeyBindingWriter` et `createClientKeyContext` sont `New` pour l'injection runtime et l'isolation des etats.
  - `client_key_state_t` est le proprietaire TS des globals `keys.c`/`keys.h` regroupes dans un contexte explicite.
  - Les fonctions publiques `Key_StringToKeynum` a `Key_GetKey` sont les proprietaires TS attendus des entites `keys.c`, deja validees dans `client_keys.c.md`; les prototypes `keys.h`/`client.h` ne creent pas d'autre proprietaire TS.
  - Les helpers prives restants sont `Category: New` avec `Original name: N/A` et une `Source` N/A explicite; ils servent l'adaptation contexte/hooks/console, sans masquer un portage proprietaire.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: aucun pour `packages/client/src/keys.ts`.
