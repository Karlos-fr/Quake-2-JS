# Progress TS - packages/renderer-three/src/gl_light.ts

- Statut: Termine
- Dernier lot valide: gros lot complet `gl_light.ts` (`DLIGHT_CUTOFF`, runtime/hooks, fonctions portees `R_*`, adapters `createGlLight*`, setters et helpers locaux).
- Prochain lot recommande: aucun pour cette matrice TS.
- Tests de reference:
  - `npm run verify:gl-light`
  - `npm run verify:dlight-sync`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Decisions:
  - Les fonctions et la macro proprietaires de `ref_gl/gl_light.c` sont marquees `Couvert C/H` uniquement parce que `ref_gl_gl_light.c.md` les valide avec `packages/renderer-three/src/gl_light.ts` comme proprietaire attendu.
  - `R_MarkModelLights` reste un adapter TS sans entite source directe: il expose le chemin `R_DrawInlineBModel -> R_MarkLights` pour les brush models sans se presenter comme portage proprietaire de `R_DrawInlineBModel`.
  - Les setters, hooks, runtime explicite et helpers prives sont `Category: New` avec `Original name: N/A` et une `Source declaree: N/A (...)`.
- Integration:
  - Renderer-three verifie: dlights flashblend via `three-dlight-sync`, dlights/lightmaps/world via `gl-world-scene-adapter`.
  - Runtime/apps-web consomment indirectement via les refresh frames et le renderer Three.
- Blocages: aucun.
