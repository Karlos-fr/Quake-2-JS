# Progress TS - packages/qcommon/src/system.ts

- Fichier TS: `packages/qcommon/src/system.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_qcommon_src_system.ts.md`
- Statut: Termine

## Dernier lot traite

- 2026-05-28: toutes les entites restantes de la matrice TS.
- `SysFindResult`, `SystemHooks`, `SystemRuntime`, `createSystemRuntime`: classes `Category: New`, `Original name: N/A`, `Source: N/A (...)`, hors C/H.
- `get_curtime`, `Sys_Milliseconds`, `Sys_Mkdir`, `Hunk_Begin`, `Hunk_Alloc`, `Hunk_Free`, `Hunk_End`, `Sys_FindFirst`, `Sys_FindNext`, `Sys_FindClose`, `Sys_Error`, `Com_PageInMemory`: marques `Couvert C/H`.

## Preuves de session

- Matrice TS lue: `audit-portage/validation-incrementale/validation/ts-matrices/packages_qcommon_src_system.ts.md`.
- Matrices C/H lues: `game_q_shared.h.md`, `game_q_shared.c.md`, `qcommon_qcommon.h.md`.
- Les matrices C/H marquent les fonctions portees comme `Valide` avec proprietaire attendu `packages/qcommon/src/system.ts`.
- Ownership qcommon justifie: ces primitives `Sys_*`, `Hunk_*` et `Com_PageInMemory` sont du system glue partage et sont reexportees depuis `packages/qcommon/src/index.ts`.
- Aucun doublon proprietaire homonyme trouve dans `packages/`; les interfaces et la factory sont des abstractions runtime/browser, pas un portage C/H proprietaire.

## Integration runtime/apps-web/renderer-three

- Runtime: integre par reexports `qcommon`; `Com_PageInMemory` est consomme par le flux son client, et les hooks system restent injectables par les hosts.
- apps-web: integre indirectement via les hosts et adapters qui creent/consomment le runtime qcommon.
- renderer-three: non applicable directement; ces abstractions system ne produisent pas de donnees de scene.

## Tests

- `npm run verify:q-shared:header`
- `npm run typecheck`

## Prochain lot recommande

- Aucun: matrice TS close pour `packages/qcommon/src/system.ts`.

## Blocages

- Aucun.
