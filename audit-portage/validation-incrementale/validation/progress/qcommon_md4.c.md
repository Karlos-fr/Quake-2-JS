# Progress - Quake-2-master/qcommon/md4.c

## Etat courant

- Statut: Termine
- Dernier lot valide: finalisation MD4 et checksum (`MD4Final`, `Encode`, `Decode`, `Com_BlockChecksum`) avec locaux/faux positifs `bits`, `digest`, `val`, `ctx` et doublons associes.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_md4.c.md`
- Fichier TS proprietaire: `packages/qcommon/src/md4.ts`

## Preuves de cette session

- Source C comparee: `Quake-2-master/qcommon/md4.c`
- Cible TS comparee: `packages/qcommon/src/md4.ts`
- Commentaires verifies: `MD4Final`, `Com_BlockChecksum`; commentaires ajoutes pour les helpers prives `Encode` et `Decode`.
- Tests lances: `npm run verify:md4`, `npm run verify:qcommon:header`, `npm run verify:files`, `npm run verify:full-game:render-source`, `npm run verify:gl-rmain`, `npm run typecheck`.
- Assertions ajoutees: `MD4Final` remet aussi `buffer` a zero; `Com_BlockChecksum` respecte l'argument `length` explicite.

## Integration runtime / web / renderer

- Runtime: integre via `Com_BlockChecksum`, export `packages/qcommon/src/qcommon.ts`, usage `CM_LoadMap`/checksum BSP et chemins historiques `qcommon/common.c` / `qcommon/files.c` equivalents.
- `apps/web`: pas d'adapter MD4 parallele attendu; le navigateur passe par les flux full-game/runtime et les tests `verify:files` / `verify:full-game:render-source`.
- `packages/renderer-three`: pas de sortie visible directe produite par les helpers MD4. L'impact attendu est indirect via validation/chargement de map et checksum; `verify:gl-rmain` passe.

## Prochain lot recommande

Aucun lot restant dans `qcommon_md4.c.md`: toutes les lignes sont `Valide` ou `Non applicable`.

## Blocages

- Aucun blocage connu.
