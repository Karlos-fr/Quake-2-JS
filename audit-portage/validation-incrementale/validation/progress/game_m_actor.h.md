# Progress - Quake-2-master/game/m_actor.h

## Etat courant

- Statut: Termine
- Dernier lot valide: `FRAME_bl_swk01` a `FRAME_crbl_w07`, plus `MODEL_SCALE` (97 macros/constantes).
- Tests de reference: `npm run verify:m-actor:header`, `npm run verify:m-actor`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Corrections appliquees: extension du harness `scripts/verify/quake2-m-actor-header.ts` pour couvrir explicitement toutes les constantes du header, dont le lot final `FRAME_bl_swk01..FRAME_crbl_w07` et `MODEL_SCALE`.

## Checklist appliquee au dernier lot

- Ownership: constantes proprietaires dans `packages/game/src/m_actor.ts`; export namespace `actorFrames` via `packages/game/src/index.ts`.
- Comparaison C/H vs TS: valeurs `385..480` et `MODEL_SCALE = 1.0` comparees avec `Quake-2-master/game/m_actor.h`.
- Commentaires d'en-tete: le fichier TS contient l'en-tete de portage pour `m_actor.h` / `m_actor.c`; pas de commentaire individuel requis pour ces macros generees.
- Runtime: les plages finales `FRAME_bl_swk01..FRAME_crbl_w07` sont des constantes generees du header actor non referencees par les moves/callbacks portes dans `m_actor.c`; le runtime n'a donc pas de branchement specifique attendu au-dela de leur disponibilite dans `packages/game/src/m_actor.ts`. `MODEL_SCALE` est consomme par `SP_misc_actor` via `self.monsterinfo.scale`.
- apps/web: pas d'appel direct attendu pour ces constantes; le navigateur declenche le flux par runtime/packages et consomme les sorties `frame`, `oldframe`, `backlerp` et l'etat d'entite sans logique parallele actor.
- renderer-three: les frames visibles actor/joueur sont consommees generiquement comme `entity.frame` / `oldframe` / `backlerp` par le chemin client refresh puis alias renderer/MD2; `MODEL_SCALE` reste une donnee monsterinfo runtime et ne necessite pas d'adapter renderer specifique pour ce lot.

## Prochain lot recommande

Aucun: `m_actor.h` est clos.

## Blocages

- Aucun.

## Mise a jour AVANCEMENT_GLOBAL recommandee

- `Statut`: `Termine`
- `Validees`: `482`
- `Prochain lot`: Aucun lot restant dans `game_m_actor.h.md`: toutes les lignes sont `Valide`.
