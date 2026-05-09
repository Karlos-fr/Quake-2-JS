# Progress TS - packages/client/src/download.ts

## Dernier lot valide

Fichier complet : `ClientDownloadHooks`, `CL_DownloadFileName`, `CL_CheckOrDownloadFile`, `CL_Download_f`, `stripExtension`.

## Preuves obtenues

- Matrice TS lue : `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_download.ts.md`.
- Source C/H croisee : `audit-portage/validation-incrementale/validation/matrices/client_cl_parse.c.md`.
- Source originale comparee : `Quake-2-master/client/cl_parse.c` pour `CL_DownloadFileName`, `CL_CheckOrDownloadFile`, `CL_Download_f`.
- `client_cl_parse.c.md` marque les trois proprietaires download `Valide`, avec cible proprietaire `packages/client/src/download.ts`.
- Entetes TS verifies/corriges : les deux entites `New` declarent maintenant `Original name: N/A`, `Source: N/A (...)`, `Category: New`.
- Doublons/ownership : aucun doublon proprietaire injustifie detecte pour `CL_DownloadFileName`, `CL_CheckOrDownloadFile` ou `CL_Download_f`; `resolveDownloadFileName` dans `cl_parse.ts` est documente comme adapter local pour eviter un cycle d'import.
- Runtime : `CL_CheckOrDownloadFile` est appele par `CL_RequestNextDownload`; `CL_Download_f` est enregistre par `CL_InitLocal`; `CL_DownloadFileName` est appele depuis `CL_CheckOrDownloadFile`.
- `apps/web` : le chemin full-game fournit les hooks filesystem/download via le contexte client; pas de logique web parallele masquante dans ce fichier.
- `renderer-three` : pas de sortie visible directe; impact indirect seulement via assets ensuite disponibles pour les flux de registration/rendu.

## Tests lances

- `npm run verify:cl-parse`
- `npm run verify:cl-main`
- `npm run typecheck`

## Decisions

- `ClientDownloadHooks` est une interface de services host, classee `New`.
- `stripExtension` est un helper local prive, classe `New`.
- Les trois fonctions portees sont marquees `Couvert C/H` car la matrice C/H liee les marque `Valide` et l'ownership TS pointe vers ce fichier.

## Prochain lot recommande

Aucun.

## Blocages

Aucun.
