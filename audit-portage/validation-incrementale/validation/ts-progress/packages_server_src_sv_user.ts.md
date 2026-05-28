# Progress TS croise - packages/server/src/sv_user.ts

## Etat courant

- Statut: Termine
- Dernier lot valide: les 7 symboles top-level de la matrice TS ont ete audites.
- Matrice C/H croisee: `audit-portage/validation-incrementale/validation/matrices/server_sv_user.c.md`.
- Decision: `MAX_STRINGCMDS` est le portage proprietaire du macro C valide dans `server_sv_user.c.md`; les autres symboles top-level sont des helpers, constantes ou factories TypeScript locaux classes `New`/`Hors C/H`.
- Entites nouvelles explicitees: `DOWNLOAD_CHUNK_SIZE`, `ServerUserContext`, `createServerUserProcedures`, `createNullUsercmd`, `writeDownloadRefusal`, `truncateOsPath`.

## Tests de reference

- `npm run verify:server:user`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run typecheck`
- `git diff --check`

## Integration

- Runtime serveur: applicable et couvert par `verify:server:user`, `verify:server:runtime` et `verify:full-game:server-host`.
- `apps/web`: applicable via le host serveur complet, couvert par `verify:full-game:server-host`; pas de logique web parallele dans ce lot.
- `renderer-three`: non applicable, ce fichier ne produit pas directement de donnees renderer.

## Prochain lot recommande

Aucun pour ce fichier.

## Blocages

Aucun blocage identifie.
