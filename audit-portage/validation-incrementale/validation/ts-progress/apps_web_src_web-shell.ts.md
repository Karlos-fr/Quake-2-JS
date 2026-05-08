# Progress TS - apps/web/src/web-shell.ts

## Etat

- Statut: Termine
- Lot traite: fichier complet, 11 symboles.
- Dernier lot valide: `WebShell`, `requireApp`, `createWebShell`, `stopViewportInputPropagation`, `createVolumeSlider`, `appendAudioControl`, `volumeToSlider`, `sliderToVolume`, `getDisplayMapName`, `applyLiquidGlassPanel`, `createFpsTracker`.
- Prochain lot recommande: aucun.

## Decisions

- Tous les symboles sont `Category: New`, `Original name: N/A`, `Source declaree: N/A (web UI shell)`.
- Aucun symbole n'est proprietaire d'une entite C/H; aucune matrice C/H n'est liee.
- `getDisplayMapName` est un helper UI prive homonyme de `apps/web/src/web-map-bootstrap.ts`, deja note cote matrice map bootstrap; ce doublon n'est pas un portage C/H proprietaire masque.

## Tests

- `npm run verify:web-render-order`
- `npm run typecheck`

## Blocages

- Aucun.
