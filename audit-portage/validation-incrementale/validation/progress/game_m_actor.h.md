# Progress - Quake-2-master/game/m_actor.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `FRAME_attak01` a `FRAME_death315` (39 macros).
- Tests de reference: `npm run verify:m-actor:header`, `npm run verify:m-actor`.
- Corrections appliquees: extension du harness `scripts/verify/quake2-m-actor-header.ts` pour couvrir explicitement le premier bloc de frames.

## Checklist appliquee au dernier lot

- Ownership: constantes proprietaires dans `packages/game/src/m_actor.ts`; export namespace `actorFrames` via `packages/game/src/index.ts`.
- Comparaison C/H vs TS: valeurs `0..38` comparees avec `Quake-2-master/game/m_actor.h`.
- Commentaires d'en-tete: le fichier TS contient l'en-tete de portage pour `m_actor.h` / `m_actor.c`; pas de commentaire individuel requis pour ces macros generees.
- Runtime: `FRAME_attak01..04` est branche via `actor_move_attack`; `FRAME_death101..107` via `actor_move_death1`; `FRAME_death201..213` via `actor_move_death2`; `FRAME_death301..315` est un bloc genere du header actor non reference par `m_actor.c`.
- apps/web: pas d'appel direct attendu pour ces constantes; le navigateur doit seulement recevoir les snapshots runtime/client.
- renderer-three: les frames visibles sont consommees generiquement comme `entity.frame` / `oldframe` par le chemin client refresh puis alias renderer; pas d'adapter specifique actor attendu pour ce lot.

## Prochain lot recommande

Continuer avec le bloc compact suivant de macros generees: `FRAME_flip01` a `FRAME_grenad15`, puis verifier `FRAME_flip01..14` via `actor_move_flipoff` et documenter si `FRAME_grenad01..15` reste seulement une plage generee non referencee par `m_actor.c`.

## Blocages

- Aucun.

## Mise a jour AVANCEMENT_GLOBAL recommandee

- `Statut`: `En cours`
- `Validees`: `39`
- `Prochain lot`: `FRAME_flip01` a `FRAME_grenad15`
