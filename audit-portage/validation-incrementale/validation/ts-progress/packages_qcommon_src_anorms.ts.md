# Progress TS croise - packages/qcommon/src/anorms.ts

- Dernier lot valide: `BYTE_DIRS`, `DirFromByte`.
- Verdict: fichier termine cote TS croise pour le lot courant.
- Tests de reference: `npm run verify:anorms`, `npm run typecheck`.
- Blocages: aucun.
- Decisions:
  - `BYTE_DIRS` est le portage proprietaire de la table `bytedirs` declaree dans `qcommon/common.c` par inclusion de `client/anorms.h`; aucune ligne C/H fine n'existe pour cette table dans la matrice.
  - `DirFromByte` est un adapter local autour de la table partagee; le portage proprietaire de `MSG_ReadDir` reste `packages/qcommon/src/messages.ts`.
- Prochain lot recommande: aucun pour ce fichier; le coordinateur peut verifier/regenerer la matrice TS si besoin.
