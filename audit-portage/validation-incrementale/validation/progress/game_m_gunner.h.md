# Progress - Quake-2-master/game/m_gunner.h

- Statut: Termine
- Dernier lot valide: toutes les macros restantes apres `FRAME_runs06`, de `FRAME_attak101` a `FRAME_duck08`, plus `MODEL_SCALE`.
- Preuves session: comparaison exhaustive des 210 macros de `Quake-2-master/game/m_gunner.h` contre les exports de `packages/game/src/m_gunner.ts`; comparaison des moves et callbacks `gunner_move_attack_grenade`, `gunner_move_attack_chain`, `gunner_move_fire_chain`, `gunner_move_endfire_chain`, `gunner_move_pain1`, `gunner_move_pain2`, `gunner_move_pain3`, `gunner_move_death`, `gunner_move_duck`; runtime verifie via `SP_monster_gunner`, `ED_CallSpawn`, `walkmonster_start`, `M_MoveFrame`, callbacks `monsterinfo`, events sons/muzzleflash et save/restore.
- Checklist session: ownership confirme dans `packages/game/src/m_gunner.ts`; pas de doublon proprietaire retenu avec `packages/game/src/index.ts`; commentaire fichier verifie pour les constantes declaratives; commentaires d'en-tete des fonctions C associees deja presents quand critiques et comportement source-parity couvert; `apps/web` consomme le runtime porte via le flux full-game sans logique gunner parallele; `packages/renderer-three` consomme les sorties visibles attendues `modelindex`, `frame` et `oldframe` via `refresh-entity-sync`.
- Tests lances: `npm run verify:m-gunner:header`, `npm run verify:m-gunner`, `npm run verify:m-gunner:source-parity`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`.
- Corrections: renforcement de `scripts/verify/quake2-m-gunner-header.ts` pour lire `Quake-2-master/game/m_gunner.h`, compter les 210 macros et comparer chaque valeur exportee par `packages/game/src/m_gunner.ts`.
- Blocages: aucun.
- Prochain lot recommande: aucun pour `m_gunner.h`; fichier termine.
