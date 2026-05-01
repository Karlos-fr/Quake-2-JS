# Progress TS - apps/web/src/full-game-local-session.ts

- Dernier lot traite: toutes les entites restantes: `createFullGameLocalSession`, `resolveFullGameMapTarget`, `stepFullGameLocalSession`, `buildRefreshFrame`, `applyFullGameOverlayBits`, `createIdleInputState`.
- Verdict: fichier termine. Les 9 symboles sont `Valide` comme entites `Category: New` du harnais legacy local-session; pas de matrice C/H applicable.
- Tests de reference: `npm run verify:full-game:newgame`, `npm run verify:full-game:demo-cleanup`, `npm run verify:full-game:input-bindings`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Decisions: le fichier est un adapter web legacy pour demo/tests et ne doit pas redevenir proprietaire du chemin `full-game.html` actif. Les helpers internes deleguent aux packages portes et ne revendiquent aucun ownership C/H.
- Blocages: aucun.
- Prochain lot recommande: aucun.
