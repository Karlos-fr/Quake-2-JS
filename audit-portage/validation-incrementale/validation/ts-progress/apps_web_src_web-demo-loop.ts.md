# Progress TS - apps/web/src/web-demo-loop.ts

## Etat

- Statut: Termine
- Dernier lot traite: `WebDemoLoopOptions`, `startWebDemoLoop`
- Verdict: `Valide`

## Preuves

- Checklist TS appliquee aux 2 symboles du fichier.
- En-tetes completes avec `Original name: N/A`, `Source: N/A (web demo adapter)`, `Category: New`.
- Matrice TS mise a jour avec `Original name: N/A`, `Source declaree: N/A (web demo adapter)`, `Category: New`, `Statut croise: TS sans lien source`, `Validation TS: Valide`.
- Aucun lien C/H proprietaire declare dans la matrice; pas de matrice C/H a ouvrir pour ce lot.
- References verifiees: `startWebDemoLoop` est consomme par `apps/web/src/main.ts`; les symboles ne sont pas dupliques ailleurs dans `apps/` ou `packages/`.
- Le fichier delegue le rendu a `createFullGameRenderLoop`, deja proprietaire de l'orchestration renderer web partagee.

## Tests

- `npm run verify:web-render-order`
- `npm run typecheck`

## Integration

- Runtime: adapter de boucle web; il consomme le controller/runtime deja cree et ne remplace pas une entite C/H proprietaire.
- apps/web: integre depuis `main.ts` pour piloter la demo navigateur.
- renderer-three: integre indirectement via les adapters Three.js et `createFullGameRenderLoop`; le fichier ne porte pas `ref_gl`.

## Prochain lot

- Aucun.
