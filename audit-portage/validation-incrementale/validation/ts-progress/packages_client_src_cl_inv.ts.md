# Progress TS - packages/client/src/cl_inv.ts

- 2026-05-28: ajout de `CL_ParseInventory` comme proprietaire `client/cl_inv.c`, deplace depuis `cl_parse.ts`; `cl_parse.ts` garde le dispatch `svc_inventory`.

- Fichier TS: `packages/client/src/cl_inv.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_inv.ts.md`
- Lot courant: tous les symboles du fichier (`DISPLAY_ITEMS`, `ClientInventoryBindingMap`, `ClientInventoryContext`, `Inv_DrawString`, `Inv_DrawStringRef`, `SetStringHighBit`, `CL_DrawInventory`, `CL_DrawInventoryRef`, `createPictureCommand`)
- Dernier lot valide: classement TS croise complet du fichier.
- Prochain lot recommande: aucun pour `cl_inv.ts`; verifier ensuite `packages/client/src/cl_main.ts` ou le prochain fichier indique par `AVANCEMENT_GLOBAL_TS.md`.
- Tests de reference: `npm run verify:cl-inv`; `npm run typecheck`.
- Blocages: aucun.
- Decisions:
  - `Inv_DrawString` et `CL_DrawInventory` sont les proprietaires TS attendus par la matrice C/H; les variantes `Ref` sont classees `Adapter`.
  - Les helpers et interfaces nouveaux declarent explicitement `Original name: N/A`, `Source: N/A (...)`, `Category: New`.
