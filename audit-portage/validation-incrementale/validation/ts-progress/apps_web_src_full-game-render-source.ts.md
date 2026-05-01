# Progress TS - apps/web/src/full-game-render-source.ts

## Etat

- Statut: Termine
- Dernier lot traite: `buildServerBackedBrushModelSnapshots`, `resolveClientSoundPath`, `resolveClientSoundPathValue`, `resolveClientModelPath`, `normalizeServerMapName`
- Verdict: 8 symboles `Valide`; ce sont des adapters/helpers web nouveaux sans proprietaire C/H attendu.

## Preuves de la session

- Checklist TS appliquee: identification TS, absence de matrice C/H liee, classification New/web adapter, ownership apps/web, recherche de doublons par symbole, verification du branchement depuis `apps/web/src/full-game.ts`, jugement runtime/apps web/renderer-three.
- Corrections: en-tetes d'ownership ajoutes/completes dans `apps/web/src/full-game-render-source.ts`.
- Tests passes: `npm run verify:full-game:rules-transitions`, `npm run verify:full-game:authoritative-input`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Test bloque: `npm run verify:full-game:render-source` echoue avant execution utile par import inexistant `packages/client/src/types.js` dans `scripts/verify/quake2-full-game-render-source.ts`; non corrige ici pour respecter le fichier TS unique.
- Session finale: `buildServerBackedBrushModelSnapshots`, `resolveClientSoundPath` et `resolveClientSoundPathValue` confirmes comme adapters web `Category: New` avec `Original name: N/A` et `Source: N/A (web adapter)`.
- Session finale: `resolveClientModelPath` et `normalizeServerMapName` confirmes comme helpers locaux `Category: New` avec `Original name: N/A` et `Source: N/A (local helper)`.
- Session finale: aucun doublon de symbole trouve dans `apps`, `packages` ou `scripts`; `buildServerBackedBrushModelSnapshots` ne remplace pas `packages/client/src/local-brush-models.ts`, il lit les packet entities du client serveur-backed.

## Jugement integration

- Runtime: le lot ne remplace pas de logique runtime proprietaire; il lit le runtime client porte via `CL_BuildRefreshFrame`, `SCR_BuildScreenState`, `CL_BuildSkySnapshot` et `Cvar_VariableValue`.
- apps/web: integre depuis `renderFullGameFrame` et `getAuthoritativeMapPath` dans `apps/web/src/full-game.ts`.
- renderer-three: integre via `FullGameRenderSource` consomme par `createFullGameRenderLoop`; les brush model snapshots alimentent `glWorldAdapter.update`, les sons boucles passent par `syncLocalLoopSounds`, et le map path autoritaire alimente `createFullGameThreeRenderer`.

## Prochain lot recommande

Aucun pour ce fichier. Action hors perimetre fichier TS: corriger le harness `scripts/verify/quake2-full-game-render-source.ts`, qui importe encore `packages/client/src/types.js` et `packages/client/src/sound-local.js`.
