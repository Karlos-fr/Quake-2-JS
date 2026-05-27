# Progress TS - packages/qcommon/src/q_shared.ts

## Etat

- Statut: En cours
- Symboles: 281
- Couvert C/H: 190
- A auditer: 86
- Ownership suspect: 1
- Entetes incomplets: 0

## Lot valide cette session

- Bloc initial traite: `byte` a `MZ_SILENCED` (189 symboles).
- Ownership suspects traites: `ANGLE2SHORT`, `SHORT2ANGLE`, `LerpAngle`, `AngleVectors`.
- Helpers nouveaux traites: `createEntityState`, `createPlayerState`.
- Verdicts: 190 `Couvert C/H`; `vec3_t` et `vec5_t` valides par lecture directe de `q_shared.h` car absents de la matrice C/H generee; `createEntityState` et `createPlayerState` valides comme `Category: New`; `MAX_MAP_AREAS` marque `Partiel` pour ownership qfiles.h a trancher.

## Preuves

- Croisement avec `game_q_shared.h.md` et `game_q_shared.c.md`: lignes C/H `Valide` et proprietaire attendu `packages/qcommon/src/q_shared.ts` pour le bloc partage.
- Comparaison automatique TS/H de 172 constantes/enums du bloc initial: aucune divergence.
- Source directe verifiee dans `Quake-2-master/game/q_shared.h` pour les typedefs `vec3_t` et `vec5_t`.
- Doublons/ownership: `MAX_MAP_AREAS` provient de `Quake-2-master/qcommon/qfiles.h` et le proprietaire C/H actuel est `packages/formats/src/qfiles.ts`; pas masque sous `Couvert C/H`.

## Tests de reference

- `npm run verify:q-shared:header`
- `npm run typecheck` si `packages/qcommon/src/q_shared.ts` est modifie

## Prochain lot recommande

Continuer a partir de `temp_event_t`, puis `CHAN_*`, `ATTN_*`, `SPLASH_*`, `STAT_*`, `DF_*`, `ROGUE_VERSION_*`, `ANGLE2SHORT_SCALE` / `SHORT2ANGLE_SCALE`, `CS_*`, `entity_event_t`, `entity_state_t`, `player_state_t`. Trancher ensuite l'action sur `MAX_MAP_AREAS`.
