# Progress - Quake-2-master/game/p_view.c

- Statut: Termine
- Dernier lot valide: gros lot initial complet: file-scope frame state, damage feedback, view/gun offsets, blends, falling/world effects, client effects/event/sound/frame et `ClientEndServerFrame`.
- Prochain lot recommande: aucun pour `game/p_view.c`; la matrice ne contient plus de ligne `A verifier`.

## Preuves session

- Source C/H comparee: `Quake-2-master/game/p_view.c`.
- TS proprietaire compare: `packages/game/src/p_view.ts`.
- Runtime: `ClientEndServerFrame` est appele depuis `ClientEndServerFrames` puis `G_RunFrame`; les helpers du lot sont atteignables depuis cette racine et mettent a jour `player_state_t`, sons, evenements, damage/world effects, HUD stats et animation player.
- apps/web/client: le flux full-game consomme le runtime porte; le pont local copie maintenant les sorties `blend`, `rdflags` et `STAT_FLASHES` de `player_state_t` au client frame.
- renderer-three: le renderer consomme la camera et les sorties visibles via `ClientRefreshFrame`, `CL_CalcViewValues`, `V_RenderView`, `createThreeRefreshEntitySync` et `createThreePolyblendOverlay`.

## Tests lances

- `npm run verify:p-view`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npx tsx ./scripts/verify/quake2-cl-view.ts`
- `npm run verify:polyblend-overlay`
- `npm run typecheck`

## Corrections

- `packages/game/src/p_view.ts`: alignement C de `P_DamageFeedback` pour le flash armure (`damage_armor` uniquement) et restauration des choix `rand()&1` pour les variantes de sons pain/gurp/burn.
- `scripts/verify/quake2-p-view.ts`: preuves ajoutees pour power armor sans flash armure et variante de son pain.
- `packages/client/src/local-gameplay-sync.ts`: copie des sorties p_view `blend`, `rdflags` et `STAT_FLASHES` vers le client frame local.
- `scripts/verify/quake2-local-gameplay-sync.ts`: preuve d'integration locale des sorties playerstate p_view.

## Decisions

- Les variables locales generees a tort par la matrice initiale (`side`, `value`, `i`, `delta`, etc.) ont ete retirees de la matrice: elles ne sont pas des entites proprietaires autonomes de `p_view.c`.
