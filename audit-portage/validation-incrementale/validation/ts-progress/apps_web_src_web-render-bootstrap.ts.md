# Progress TS - apps/web/src/web-render-bootstrap.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 7 symboles (`ActiveRenderer`, `createRenderer`, `createScene`, `createCamera`, `getInlineModelRenderOrigin`, `formatSkySnapshot`, `parseEntityOrigin`).
- Decision: entites `Category: New`, hors portage C/H proprietaire; metadonnees explicites `Original name: N/A`, `Source declaree: N/A (web renderer bootstrap)`.
- Verification C/H: aucune matrice C/H liee; aucun statut `Couvert C/H` applique.
- Ownership/doublons: fichier `apps/web` coherent pour le bootstrap Three.js web. `parseEntityOrigin` existe aussi dans `packages/formats/src/qfiles.ts`, mais le symbole ici est prive et limite au rendu web inline-model origin; il n'est pas presente comme portage proprietaire.
- Integration runtime: non applicable comme port C/H; consomme les donnees runtime/formats et ne remplace pas la logique moteur.
- Integration apps/web: integre via `main.ts`, `full-game.ts`, `web-demo-loop.ts` et `full-game-render-loop.ts`.
- Integration renderer-three: non applicable comme ownership; ce fichier instancie/adapte Three.js cote web, les ports `ref_gl` restent dans `packages/renderer-three`.
- Tests lances: `npx tsx ./scripts/verify/quake2-web-first-person-camera.ts` OK; `npm run verify:web-render-order` OK; `npm run typecheck` OK.
- Blocages: `npm run verify:full-game:three-renderer` echoue hors lot sur `full-game should draw the original loading picture centered` dans `scripts/verify/quake2-full-game-three-renderer.ts`.
- Prochain lot recommande: aucun.
