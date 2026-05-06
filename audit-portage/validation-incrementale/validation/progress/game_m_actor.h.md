# Progress - Quake-2-master/game/m_actor.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `FRAME_flip01` a `FRAME_runs12` (77 macros).
- Tests de reference: `npm run verify:m-actor:header`, `npm run verify:m-actor`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Corrections appliquees: extension du harness `scripts/verify/quake2-m-actor-header.ts` pour couvrir explicitement `FRAME_flip01..FRAME_runs12`.

## Checklist appliquee au dernier lot

- Ownership: constantes proprietaires dans `packages/game/src/m_actor.ts`; export namespace `actorFrames` via `packages/game/src/index.ts`.
- Comparaison C/H vs TS: valeurs `39..115` comparees avec `Quake-2-master/game/m_actor.h`.
- Commentaires d'en-tete: le fichier TS contient l'en-tete de portage pour `m_actor.h` / `m_actor.c`; pas de commentaire individuel requis pour ces macros generees.
- Runtime: `FRAME_flip01..14` est branche via `actor_move_flipoff`; `FRAME_pain101..303` via les trois moves pain; `FRAME_run02..07` via `actor_move_run`. `FRAME_grenad01..15`, `FRAME_jump01..06`, `FRAME_push01..09`, `FRAME_run01`, `FRAME_run08..12` et `FRAME_runs01..12` sont des plages generees du header actor non referencees par `m_actor.c`.
- apps/web: pas d'appel direct attendu pour ces constantes; le navigateur doit recevoir les snapshots runtime/client qui portent `frame`, `oldframe` et `backlerp`.
- renderer-three: les frames visibles actor sont consommees generiquement comme `entity.frame` / `oldframe` / `backlerp` par le chemin client refresh puis alias renderer; pas d'adapter specifique actor attendu pour ce lot.

## Prochain lot recommande

Continuer avec le bloc compact suivant de macros generees: `FRAME_salute01` a `FRAME_stand240`, puis verifier `FRAME_stand101..140` via `actor_move_stand` et documenter les plages generees non referencees par `m_actor.c`.

## Blocages

- Aucun.

## Mise a jour AVANCEMENT_GLOBAL recommandee

- `Statut`: `En cours`
- `Validees`: `116`
- `Prochain lot`: `FRAME_salute01` a `FRAME_stand240`
