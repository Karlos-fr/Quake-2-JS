# Progress TS - packages/qcommon/src/q_shared.ts

## Etat

- Statut: Termine
- Symboles: 281
- Couvert C/H: 274
- A auditer: 0
- Ownership suspect: 0
- Entetes incomplets: 0

## Lot valide cette session

- Lot final traite: `VIDREF_GL`, `VIDREF_SOFT`, `VIDREF_OTHER`, `entity_event_t`, `entity_state_t`, `player_state_t` et decision `MAX_MAP_AREAS`.
- Lot suivant traite: `temp_event_t` a `MAX_CONFIGSTRINGS` (80 symboles).
- Bloc initial traite: `byte` a `MZ_SILENCED` (189 symboles).
- Ownership suspects traites: `ANGLE2SHORT`, `SHORT2ANGLE`, `LerpAngle`, `AngleVectors`.
- Helpers nouveaux traites: `createEntityState`, `createPlayerState`.
- Verdicts: 274 `Couvert C/H`; 78 nouveaux symboles du lot `temp_event_t` a `MAX_CONFIGSTRINGS` couverts par `game_q_shared.h.md`; `VIDREF_GL`, `VIDREF_SOFT`, `VIDREF_OTHER`, `entity_event_t`, `entity_state_t` et `player_state_t` couverts par `game_q_shared.h.md`; `ANGLE2SHORT_SCALE` et `SHORT2ANGLE_SCALE` valides comme adapters des macros `ANGLE2SHORT`/`SHORT2ANGLE`; `vec3_t` et `vec5_t` valides par lecture directe de `q_shared.h` car absents de la matrice C/H generee; `createEntityState` et `createPlayerState` valides comme `Category: New`; `MAX_MAP_AREAS` valide comme adapter documente sans masquer le proprietaire qfiles.

## Preuves

- Croisement avec `game_q_shared.h.md` et `game_q_shared.c.md`: lignes C/H `Valide` et proprietaire attendu `packages/qcommon/src/q_shared.ts` pour le bloc partage.
- Comparaison automatique TS/H de 172 constantes/enums du bloc initial: aucune divergence.
- Lecture directe `Quake-2-master/game/q_shared.h` lignes `temp_event_t`, `SPLASH_*`, `CHAN_*`, `ATTN_*`, `STAT_*`, `DF_*`, `ROGUE_VERSION_*`, `ANGLE2SHORT`/`SHORT2ANGLE` et `CS_*`; valeurs TS alignees avec `packages/qcommon/src/q_shared.ts`.
- Croisement `game_q_shared.h.md`: les lignes C/H du lot visees pointent vers `packages/qcommon/src/q_shared.ts` et sont `Valide`; `ANGLE2SHORT_SCALE`/`SHORT2ANGLE_SCALE` n'ont pas de ligne C propre et restent des adapters de calcul des macros validees.
- Source directe verifiee dans `Quake-2-master/game/q_shared.h` pour les typedefs `vec3_t` et `vec5_t`.
- Croisement `game_q_shared.h.md`: `VIDREF_GL`, `VIDREF_SOFT`, `VIDREF_OTHER`, `entity_event_t` et `player_state_t` ont une cible TS explicite `packages/qcommon/src/q_shared.ts`; `entity_state_t` est couvert par la ligne `struct entity_state_s` typedefee en `entity_state_t`.
- Doublons/ownership: `MAX_MAP_AREAS` provient de `Quake-2-master/qcommon/qfiles.h` et le proprietaire C/H actuel est `packages/formats/src/qfiles.ts`; pas masque sous `Couvert C/H`, conserve dans `q_shared.ts` comme adapter pour eviter une dependance qcommon -> formats.

## Tests de reference

- `npm run verify:q-shared:header`
- `npm run typecheck` si `packages/qcommon/src/q_shared.ts` est modifie

## Prochain lot recommande

Aucun dans la matrice TS actuelle.
