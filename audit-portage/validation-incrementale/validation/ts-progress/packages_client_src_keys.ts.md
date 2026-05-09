# Progress TS - packages/client/src/keys.ts

- Statut: En cours
- Dernier lot valide: constantes de taille, macros `K_*`, `keydest_t`, `keyname_t`, `client_key_state_t`, contrats/factory de contexte, `keynames`, `CompleteCommand`, `Key_Console`, `Key_Message`.
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
- Blocages: aucun pour ce lot.
- Prochain lot recommande: `Key_StringToKeynum`, `Key_KeynumToString`, `Key_SetBinding`, `Key_Unbind_f`, `Key_Unbindall_f`, `Key_Bind_f`, `Key_WriteBindings`, `Key_Bindlist_f`, `Key_Init`, puis `Key_Event` si le lot reste stable.
