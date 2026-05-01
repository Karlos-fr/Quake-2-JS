# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `AttackFinished`
- Prochain lot recommande: `M_CheckGround` avec ses locales `point` et `trace` si le lot reste petit
- Tests de reference: `npm run verify:g-monster`, `npm run verify:g-ai`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

- Lot traite: `AttackFinished`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS `Strict` verifie, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run typecheck` OK.
- Runtime: atteignable depuis `G_RunFrame` -> `G_RunEntity` -> `monster_think`/`M_MoveFrame` -> callbacks AI; `HuntTarget` appelle `AttackFinished`, et `M_CheckAttack`/`ai_run_missile` respectent `monsterinfo.attack_finished`.
- apps/web: pas d'appel direct attendu; le flux navigateur utilise le runtime porte via le host full-game/local, et ce helper ne produit pas de commande, HUD, son, temp entity ou snapshot propre.
- renderer-three: aucune consommation directe attendue; l'effet est un cooldown gameplay qui influence indirectement les futures attaques, donc les sorties visibles restent celles des attaques effectivement declenchees par les callbacks monstres.
