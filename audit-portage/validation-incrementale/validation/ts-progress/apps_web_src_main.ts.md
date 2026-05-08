# Progress TS croise - apps/web/src/main.ts

- Fichier TS: `apps/web/src/main.ts`
- Matrice TS: `../ts-matrices/apps_web_src_main.ts.md`
- Statut: Termine
- Dernier lot traite: `bootstrap`, `createNoopQglBindings`, `createWebRefImports`, `requireCvar`
- Prochain lot recommande: aucun
- Tests de reference: `npm run typecheck`
- Blocages: aucun

## 2026-05-08 - Constantes de bootstrap web

- Lot valide: `BASEQ2_PAK_CANDIDATES` et `DEFAULT_MAP_PATH`.
- Classification: `Category: New`, `Original name: N/A`, `Source declaree: N/A (web app bootstrap)`.
- Preuve: symboles non exportes, utilises seulement par `bootstrap` dans `apps/web/src/main.ts`; aucun lien C/H indique dans la matrice TS; pas de matrice C/H a ouvrir.
- Ownership: conforme `apps/web`; constantes de configuration du bootstrap navigateur, sans portage proprietaire C/H attendu.
- Doublons/package/imports/helpers: aucune fonction portee masquee; un symbole homonyme `BASEQ2_PAK_CANDIDATES` existe dans `apps/web/src/full-game.ts`, mais il reste un parametre local d'un autre bootstrap web et ne partage pas de couple `Original name` + `Source declaree` ported.
- Runtime/apps-web/renderer-three: integre via le flux web de `bootstrap`; `renderer-three` consomme seulement les donnees chargees ensuite et n'a pas de branchement direct attendu pour ces constantes.
- Corrections: entetes `New` ajoutes aux constantes et entete fichier corrige de `cl_main.ts` vers `main.ts`.
- Tests lances: `npm run typecheck`.

## 2026-05-08 - Bootstrap et adapters ref_gl web

- Lot valide: `bootstrap`, `createNoopQglBindings`, `createWebRefImports`, `requireCvar`.
- Classification: `Category: New`, `Original name: N/A`, `Source declaree: N/A (...)`; aucune matrice C/H liee dans la matrice TS.
- Preuve: symboles non exportes et references uniquement dans `apps/web/src/main.ts`; `reportCameraSnapshot` n'existe pas dans ce fichier.
- Ownership: conforme `apps/web`; `bootstrap` orchestre le shell navigateur, les assets, le runtime local, l'audio et les adapters Three.js sans revendiquer un portage C/H proprietaire.
- Doublons/package/imports/helpers: `bootstrap` et `createNoopQglBindings` ont des homologues locaux dans `apps/web/src/full-game.ts`, mais ce sont des bootstraps/adapters web distincts, pas des doublons de portage C/H. `createWebRefImports` compose les imports `ref_gl` autour des ports proprietaires `createRefGlHost`, `createRefImport` et du runtime cvar qcommon.
- Runtime/apps-web/renderer-three: integre comme point d'entree demo web; `renderer-three` est appele via `createRefGlHost`, `createThree*` adapters et QGL no-op local, sans deplacement d'ownership renderer.
- Corrections: entetes `New` ajoutes aux fonctions restantes et matrice TS terminee.
- Tests lances: `npm run typecheck`, `npm run verify:ref-gl-host`.
