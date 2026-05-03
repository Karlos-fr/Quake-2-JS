# Progress - Quake-2-master/game/m_actor.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `MAX_ACTOR_NAMES` et `actor_names`
- Verdict: `Valide` pour les deux entrees

## Checklist appliquee au lot

- Identification: macro et global proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`.
- Comparaison C vs TS: `MAX_ACTOR_NAMES` vaut `8`; `actor_names` conserve les huit noms C dans le meme ordre.
- Commentaires d'en-tete: pas de commentaire de fonction requis pour ce lot declaratif; le commentaire de fichier `m_actor.ts` documente le port et les deviations runtime.
- Runtime: usage verifie via `actorNameForEntity`, appele par `actor_pain` et `target_actor_touch`; flux atteignable par spawn `misc_actor`/`target_actor`, callbacks `use`/`touch`, `G_RunFrame` et le runtime full-game/local.
- apps/web: pas de logique parallele attendue pour la table; le web consomme les sorties chat et entites via le host full-game/local.
- renderer-three: la table ne produit pas directement de modele/frame/particule/dlight; les sorties visibles de l'acteur passent par l'entite `misc_actor` et les snapshots, couverts par le test renderer full-game.

## Tests de reference

- `npm run verify:m-actor`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:server-host`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Valider le bloc stand: `actor_frames_stand` (lignes global/table dupliquees), `actor_move_stand`, puis `actor_stand` si le lot reste petit.

## Blocages / decisions

- La matrice contient des doublons `global`/`table` pour les tableaux de frames; les traiter ensemble par bloc d'animation.
