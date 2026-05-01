# Progress TS - apps/web/src/full-game-render-loop.ts

## Dernier lot traite

- 2026-05-01: `LOCAL_DEMO_HUD_WEAPON_BINDINGS`, `FullGameRenderSource`, `FullGameRenderUi`, `FullGameRenderLoop`, `FullGameRenderLoopOptions`.
- Verdict: `Valide`.
- Preuve: matrice TS ouverte; absence de matrice C/H liee confirmee; recherche de doublons TS/C-H par symboles du lot; usages limites a `apps/web` et scripts de verification; en-tetes `Category: New` ajoutes.
- 2026-05-01: `createFullGameRenderLoop`, `createCanvasOverlay`, `getRenderableViewportSize`, `disposeObjectTree`, `updateAudioListener`, `flushLocalGameplaySounds`, `syncLocalLoopSounds`, `spatializeLoopSound`.
- Verdict: `Valide`.
- Preuve: checklist TS appliquee a chaque entite restante; aucune matrice C/H liee; tous les symboles classes `Category: New` avec `Original name: N/A` et `Source: N/A (...)` dans les en-tetes et la matrice; recherches de doublons par symbole propres; ownership `apps/web` coherent pour orchestration renderer/audio navigateur; `createFullGameRenderLoop` consomme par `full-game.ts` et `web-demo-loop.ts`; helpers prives limites au fichier; chemin audio WAV explicitement coupe dans le full-game autoritaire par `enableRenderSourceAudio: false`.

## Tests de reference

- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:demo-cleanup`
- `npm run verify:full-game:audio-routing`
- `npm run verify:web-render-order`
- `npm run typecheck`

## Prochain lot recommande

- Aucun, fichier termine.

## Blocages / decisions

- Aucun blocage connu.
- `AVANCEMENT_GLOBAL_TS.md` non modifie par cette session; mise a jour a centraliser par le coordinateur principal.
