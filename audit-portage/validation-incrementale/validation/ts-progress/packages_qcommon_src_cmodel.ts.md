# Progress TS - packages/qcommon/src/cmodel.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 68 symboles.
- Verdict: 40 symboles Couvert C/H, 27 symboles Category: New Valide, 1 Adapter Valide.
- Preuves: matrice C/H qcommon_cmodel.c.md Valide pour les structures/fonctions/macros portees; proprietaire attendu packages/qcommon/src/cmodel.ts; package qcommon conforme; pas de doublon proprietaire detecte pour les couples Original name + Source declaree du lot.
- Corrections: en-tetes TS completes pour les entites New/Adapter et constantes/structures locales; matrice TS completee.
- Tests de reference: npx tsx ./scripts/verify/quake2-cmodel.ts; npm run verify:qcommon:header; npm run typecheck; git diff --check.
- Integration runtime/apps-web/renderer-three: runtime qcommon integre via chargement BSP, traces, contents, PVS/PHS, areabits et portals; apps/web consomme le runtime full-game; renderer-three consomme areabits/visibilite et sorties collision via client/serveur, pas de correction dediee dans ce lot.
- Prochain lot recommande: aucun.
