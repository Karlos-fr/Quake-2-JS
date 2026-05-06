# Progress - Quake-2-master/qcommon/md4.c

## Etat courant

- Statut: En cours
- Dernier lot valide: demarrage MD4 initial (`POINTER`, `UINT2`, `UINT4`, `MD4_CTX`, `buffer`, `MD4Init`, `MD4Update`, constantes `S11`-`S34`, `PADDING`, helpers `F`, `G`, `H`, `ROTATE_LEFT`, `FF`, `GG`, `HH`, `MD4Transform` et doublons/faux positifs associes).
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_md4.c.md`
- Fichier TS proprietaire: `packages/qcommon/src/md4.ts`

## Preuves de cette session

- Source C comparee: `Quake-2-master/qcommon/md4.c`
- Cible TS comparee: `packages/qcommon/src/md4.ts`
- Commentaires verifies: `MD4_CTX`, `MD4Init`, `MD4Update`; commentaires ajoutes pour les helpers prives `F`, `G`, `H`, `ROTATE_LEFT`, `FF`, `GG`, `HH`.
- Tests lances: `npm run verify:md4`, `npm run verify:qcommon:header`, `npm run verify:files`, `npm run verify:full-game:render-source`, `npm run verify:gl-rmain`, `npm run typecheck`.

## Integration runtime / web / renderer

- Runtime: integre via `Com_BlockChecksum`, export `packages/qcommon/src/qcommon.ts`, usage `CM_LoadMap`/checksum BSP et chemins historiques `qcommon/common.c` / `qcommon/files.c` equivalents.
- `apps/web`: pas d'adapter MD4 parallele attendu; le navigateur passe par les flux full-game/runtime et les tests `verify:files` / `verify:full-game:render-source`.
- `packages/renderer-three`: pas de sortie visible directe produite par les helpers MD4. L'impact attendu est indirect via validation/chargement de map et checksum; `verify:gl-rmain` passe.

## Prochain lot recommande

Valider `MD4Final`, `bits`, `Encode`, `Decode`, puis `Com_BlockChecksum` et ses locaux `digest`, `val`, `ctx` si le lot reste coherent.

## Blocages

- Aucun blocage connu.
