# Progress TS - apps/web/src/web-map-bootstrap.ts

- Statut: Termine
- Dernier lot valide: fichier complet (`getRequestedMapPath`, `setRequestedMapPath`, `loadFirstAvailablePak`, `listPakMapPaths`, `getDisplayMapName`)
- Prochain lot recommande: aucun pour ce fichier
- Tests de reference: `npm run typecheck`
- Blocages: aucun
- Decisions:
  - Les 5 symboles sont `Category: New`, `Original name: N/A`, `Source declaree: N/A (web map bootstrap)`.
  - Le fichier est un bootstrap web pour selection URL, chargement navigateur de `pak0.pak` et liste UI de maps BSP; aucune matrice C/H proprietaire n'est applicable.
  - `getDisplayMapName` a un helper homonyme local dans `apps/web/src/web-shell.ts`; ce doublon UI n'est pas un portage C/H masque et doit etre traite dans la validation de `web-shell.ts`.
