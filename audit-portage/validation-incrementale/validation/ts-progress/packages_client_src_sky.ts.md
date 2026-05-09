# Progress TS - packages/client/src/sky.ts

- Statut: Termine
- Dernier lot valide: fichier complet, `CL_BuildSkySnapshot`.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:sky:phase2`
  - `npm run verify:sky:phase5`
  - `npm run typecheck`
- Decisions:
  - `CL_BuildSkySnapshot` est un helper `Category: New`, sans entite C/H proprietaire directe.
  - Le portage proprietaire du rendu sky reste cote renderer (`R_SetSky`/`R_DrawSkyBox`) et le parsing client reste dans `cl_parse.ts`/`view.ts`.
  - Le snapshot copie l'axe pour conserver une semantique de valeur vers `apps/web` et `renderer-three`.
- Blocages: Aucun.
