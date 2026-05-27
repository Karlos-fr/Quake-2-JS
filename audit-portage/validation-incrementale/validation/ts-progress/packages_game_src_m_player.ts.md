# Progression TS croisee - packages/game/src/m_player.ts

## Etat

- Statut: Termine
- Dernier lot valide: fichier complet, `FRAME_stand01` a `MODEL_SCALE`
- Symboles traites: 199
- Couvert C/H: 199
- Reste a auditer: 0

## Preuves de session

- Source C/H croisee: `Quake-2-master/game/m_player.h`.
- Matrice C/H croisee: `audit-portage/validation-incrementale/validation/matrices/game_m_player.h.md`.
- Toutes les macros `FRAME_*` et `MODEL_SCALE` sont `Valide` dans la matrice C/H avec proprietaire attendu `packages/game/src/m_player.ts`.
- Comparaison Node TS/H: 199 symboles TS, 199 macros H, aucun manquant, aucun extra, aucune valeur divergente.
- Ownership/package conforme: source `game/m_player.h` vers `packages/game/src/m_player.ts`.
- Aucun doublon proprietaire du couple `Original name` + `Source declaree` trouve; les homonymes `FRAME_*`/`MODEL_SCALE` des autres monstres ont leurs sources H propres.

## Tests de reference

- `npm run verify:m-player:header`
- `npm run typecheck`
- `git diff --check`

## Integration

- Runtime: constantes de frames joueur consommees par les flux joueur, notamment `p_view.ts` pour la frame de base; pas de logique gameplay autonome dans ce header declaratif.
- apps/web: consomme les etats joueur produits par le runtime/client, sans integration web dediee pour ces constantes seules.
- renderer-three: consomme les entites/modeles/frames produits par le runtime/client; aucun adapter renderer a corriger pour ce header de constantes seul.

## Prochain lot

Aucun dans la matrice TS actuelle.
