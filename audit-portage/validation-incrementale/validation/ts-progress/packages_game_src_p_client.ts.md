# Progress TS - packages/game/src/p_client.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 66 symboles (39 Couvert C/H, 27 Valide adapters/New).
- Prochain lot recommande: Aucun dans la matrice TS actuelle.

## Session

### Validation fichier complet

Lot traite: tous les symboles de `packages/game/src/p_client.ts`, de `PLAYER_MINS` a `equalsIgnoreCase`.

Preuves:
- Matrice C/H `game_p_client.c.md` relue: les 39 fonctions proprietaires `p_client.c` sont `Valide` et pointent vers `packages/game/src/p_client.ts`.
- Matrice C/H `game_g_misc.c.md` relue pour `ThrowClientHead` et `VelocityForDamage`; les deux usages locaux restent classes `Adapter` pour ne pas masquer l ownership `g_misc`.
- En-tetes TS verifies et completes pour les entites `Category: New`: `Original name: N/A`, `Source: N/A (<raison>)`, `Category: New`.
- Ownership/package verifie: module source `game` vers `packages/game`; aucun mauvais package detecte pour le lot.
- Doublons verifies par recherche de symboles: les helpers locaux homonymes `addVec3`/`equalsIgnoreCase` restent prives et classes `New`; `velocityForDamage` est un adapter local documente.

Tests de reference:
- `npm run verify:p-client` OK.
- `npm run typecheck` OK.
- `git diff --check` relance apres correction EOF: OK, avec seulement les avertissements LF/CRLF habituels.

Integration:
- Runtime: `p_client.ts` est branche via `g_main.ts` pour `ClientConnect`, `ClientDisconnect`, `ClientThink` et `ClientBeginServerFrame`; les helpers locaux sont atteints par ces chemins ou par les tests de verification.
- apps/web: consomme le runtime full-game via l export game; aucune logique parallele a corriger dans ce lot.
- renderer-three: consomme les entites/sons/temp entities produits par runtime; aucune correction renderer directe attendue pour ces helpers de cycle client.

Blocages: aucun.
