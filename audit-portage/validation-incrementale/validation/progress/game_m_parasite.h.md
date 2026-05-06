# Progress - Quake-2-master/game/m_parasite.h

## Dernier lot valide

- 2026-05-06: gros lot initial `FRAME_break01` a `FRAME_break32`, `FRAME_death101` a `FRAME_death107`, `FRAME_drain01` a `FRAME_drain18`, plus `MODEL_SCALE`.
- 2026-05-06: fermeture du header avec toutes les macros restantes `A verifier`: `FRAME_pain101` a `FRAME_pain111`, `FRAME_run01` a `FRAME_run15`, `FRAME_stand01` a `FRAME_stand35`.

## Preuves relevees

- Source C/H: `Quake-2-master/game/m_parasite.h` compare a `packages/game/src/m_parasite.ts`.
- Valeurs numeriques: `npm run verify:m-parasite:header` parse maintenant les 119 macros du header et les compare aux exports TS.
- Consommation moves/animations: `npm run verify:m-parasite:source-parity` et `npm run verify:m-parasite` valident `parasite_move_break`, `parasite_move_drain`, `parasite_move_death`, les ranges first/last frame, distances, callbacks et `MODEL_SCALE` via `SP_monster_parasite`.
- Runtime: `monster_parasite` est branche dans `g_spawn.ts`, les callbacks/moves sont exportes et enregistres via `g_save.ts`; `G_RunFrame`/`M_MoveFrame` consomment indirectement les frames par `monsterinfo.currentmove`.
- `apps/web`: le flux attendu passe par le serveur/client porte et `CL_BuildRefreshFrame`, verifie par `npm run verify:full-game:render-source`.
- `renderer-three`: les frames visibles sont consommees indirectement comme `entity.frame`/`oldframe` par `refresh-entity-sync.ts`; l'attaque parasite produit aussi un beam `TE_PARASITE_ATTACK` consomme par `three-beam-sync.ts`, verifie par `npm run verify:beam-sync` et `npm run verify:refresh-entity:alias-flags`.
- TypeScript: `npm run typecheck`.
- Session de fermeture: `npm run verify:m-parasite:header`, `npm run verify:m-parasite:source-parity`, `npm run verify:m-parasite`, `npm run verify:beam-sync`, `npm run verify:full-game:render-source`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.

## Corrections appliquees

- `scripts/verify/quake2-m-parasite-header.ts`: passage d'un test sparse a une comparaison exhaustive des macros de `m_parasite.h`.
- Aucune correction TS necessaire pendant la session de fermeture du header.

## Blocages

- Aucun blocage ouvert pour ce lot.

## Prochain lot recommande

- Aucun: toutes les macros de `m_parasite.h` sont validees, y compris `MODEL_SCALE`.

## Mise a jour AVANCEMENT_GLOBAL a reporter

- `Statut`: `Termine`
- `Entites`: `119`
- `Validees`: `119`
- `Partielles`: `0`
- `Manquantes`: `0`
- `Non conformes`: `0`
- `Non applicables`: `0`
- `Progress`: [`game_m_parasite.h.md`](progress/game_m_parasite.h.md)
- `Prochain lot`: `Aucun: toutes les macros de frame et MODEL_SCALE de m_parasite.h sont validees.`
