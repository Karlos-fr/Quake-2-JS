# Progress TS - packages/game/src/m_rider.ts

## Etat

- Statut: Termine
- Symboles: 61
- Couvert C/H: 61
- A auditer: 0
- Dernier lot valide: tout le fichier, `FRAME_stand201` a `FRAME_stand260` et `MODEL_SCALE`.

## Preuves

- Source C/H: `Quake-2-master/game/m_rider.h`.
- Matrice C/H: `audit-portage/validation-incrementale/validation/matrices/game_m_rider.h.md`, lignes `Valide` avec proprietaire `packages/game/src/m_rider.ts`.
- Valeurs TS/H comparees pendant la session: frames `0..59`, `MODEL_SCALE = 1.0` vs `1.000000`.
- Ownership conforme: module source `game` vers package `packages/game`.
- Doublons: homonymes de frames/`MODEL_SCALE` existent dans d'autres monstres, mais pas avec la meme source declaree `Quake-2-master/game/m_rider.h`; pas de doublon proprietaire detecte.

## Tests

- `npm run verify:m-rider:header` : OK.

## Integration

- Runtime: constantes de header declaratives utilisees via les exports du package et le modele rider/boss3; pas de logique runtime autonome dans ce fichier.
- apps/web: consomme les sorties runtime/entites, aucune integration directe attendue pour ces constantes seules.
- renderer-three: consomme modeles/frames produits par le runtime; aucune correction renderer dediee attendue pour ce header declaratif.

## Prochain lot

Aucun. Matrice TS actuelle terminee.
