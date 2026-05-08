# Progress TS croise - apps/web/src/main.ts

- Fichier TS: `apps/web/src/main.ts`
- Matrice TS: `../ts-matrices/apps_web_src_main.ts.md`
- Statut: En cours
- Dernier lot traite: `BASEQ2_PAK_CANDIDATES`, `DEFAULT_MAP_PATH`
- Prochain lot recommande: `bootstrap`
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
