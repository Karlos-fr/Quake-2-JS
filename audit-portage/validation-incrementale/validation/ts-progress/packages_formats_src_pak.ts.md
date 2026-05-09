# Progress TS - packages/formats/src/pak.ts

- Statut: Termine
- Dernier lot traite: fichier complet, 14 symboles.
- Prochain lot recommande: Aucun.

## Decisions

- `IDPAKHEADER`, `MAX_FILES_IN_PACK`, `dpackfile_t` et `dpackheader_t` sont les proprietaires attendus des entites PAK de `Quake-2-master/qcommon/qfiles.h`; la matrice C/H `qcommon_qfiles.h.md` les marque `Valide`.
- `PakEntry` est accepte comme deplacement format legitime de la metadata `packfile_t`: il etend `dpackfile_t` et ajoute seulement `normalizedName`. La logique filesystem proprietaire reste dans `packages/filesystem/src/files.ts`.
- `parsePak` n'est pas le proprietaire de `FS_LoadPackFile`: il est classe `Adapter`, avec `Original name: N/A` et `Source: N/A (PAK archive parser used by FS_LoadPackFile)`. Le portage proprietaire de `FS_LoadPackFile` reste `packages/filesystem/src/files.ts`.
- Les helpers locaux `DPACKFILE_SIZE`, `DPACKHEADER_SIZE`, `DPACKFILENAME_SIZE`, `PakArchive`, `findPakEntry`, `readPakEntryData`, `decodePakName` et `normalizePakPath` sont explicites en `Category: New` avec metadonnees `N/A (...)`.

## Tests

- `npm run verify:qfiles`
- `npm run verify:files`
- `npm run golden:pak0`
- `npm run typecheck`

## Integration

- Runtime: integre via `packages/filesystem/src/files.ts`, qui appelle `parsePak`, `findPakEntry` et `readPakEntryData` dans `mountPak`, `FS_LoadPackFile` et `readMountedFile`.
- apps/web: integre via `apps/web/src/main.ts` et les flux full-game qui montent `pak0.pak` par le filesystem porte.
- renderer-three: pas proprietaire; il consomme indirectement les donnees chargees depuis le filesystem/PAK, notamment BSP, images et modeles, sans remplacer la logique de parsing PAK.
