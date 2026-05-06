# Progress - Quake-2-master/game/m_actor.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `FRAME_bl_atk01` a `FRAME_bl_swm12` (102 macros).
- Tests de reference: `npm run verify:m-actor:header`, `npm run verify:m-actor`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Corrections appliquees: extension du harness `scripts/verify/quake2-m-actor-header.ts` pour couvrir explicitement `FRAME_salute01..FRAME_stand223`, `FRAME_swim01..FRAME_wave21`, puis `FRAME_bl_atk01..FRAME_bl_swm12`.

## Checklist appliquee au dernier lot

- Ownership: constantes proprietaires dans `packages/game/src/m_actor.ts`; export namespace `actorFrames` via `packages/game/src/index.ts`.
- Comparaison C/H vs TS: valeurs `283..384` comparees avec `Quake-2-master/game/m_actor.h`.
- Commentaires d'en-tete: le fichier TS contient l'en-tete de portage pour `m_actor.h` / `m_actor.c`; pas de commentaire individuel requis pour ces macros generees.
- Runtime: les plages `FRAME_bl_atk01..FRAME_bl_swm12` sont des constantes generees du header actor non referencees par les moves/callbacks portes dans `m_actor.c`; le runtime n'a donc pas de branchement specifique attendu au-dela de leur disponibilite dans `packages/game/src/m_actor.ts`.
- apps/web: pas d'appel direct attendu pour ces constantes; le navigateur declenche le flux par runtime/packages (`Cmd_Wave_f`, snapshots serveur/client) et consomme les sorties `frame`, `oldframe` et `backlerp` sans logique parallele actor.
- renderer-three: les frames visibles actor/joueur sont consommees generiquement comme `entity.frame` / `oldframe` / `backlerp` par le chemin client refresh puis alias renderer/MD2; pas d'adapter specifique actor attendu pour ce lot.

## Prochain lot recommande

Continuer avec le bloc compact suivant de macros generees: `FRAME_bl_swk01` a `FRAME_bl_sws14`, puis verifier les plages generees non referencees par `m_actor.c`.

## Blocages

- Aucun.

## Mise a jour AVANCEMENT_GLOBAL recommandee

- `Statut`: `En cours`
- `Validees`: `385`
- `Prochain lot`: `FRAME_bl_swk01` a `FRAME_bl_sws14`
