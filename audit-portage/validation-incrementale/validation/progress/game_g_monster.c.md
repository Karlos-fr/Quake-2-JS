# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `M_CatagorizePosition` avec locales `point` et `cont`
- Prochain lot recommande: `M_WorldEffects` avec locale `dmg` si le lot reste petit
- Tests de reference: `npm run verify:g-monster`, `npm run verify:g-ai`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

- Lot traite: `M_CatagorizePosition` avec locales `point` et `cont`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS `Strict` verifie, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Runtime: atteignable depuis `G_RunFrame` via `monster_think`, et depuis `M_droptofloor`; probes `pointcontents` verifies aux hauteurs C `origin + mins[2] + 1`, puis `+26`, puis `+22`; `waterlevel` 0/1/2/3 et conservation du premier `watertype` verifies.
- apps/web: pas d'appel direct attendu; le flux navigateur utilise le runtime porte et les adapters collision local/full-game, puis consomme les sons d'eau et les etats/snapshots produits en aval par `M_WorldEffects`.
- renderer-three: pas de sortie renderer directe; les effets visibles/sonores attendus sont indirects via positions de monstres, scenes/snapshots, sons d'eau et effets monde consommes par le client et `gl-world-scene-adapter`.
