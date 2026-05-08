# Progress TS - packages/game/src/g_combat.ts

- Statut: En cours
- Dernier lot valide: helpers/adapters death-use (`GameCombatHooks`, `MonsterDeathUseDispatcher`, `defaultMonsterDeathUse`, `setDefaultMonsterDeathUse`) classes.
- Prochain lot recommande: traiter les helpers locaux avec entete incomplet, en commencant par `dotProduct`, `ClientTeam`, `OnSameTeam`, `traceCanDamage` et `emitCombatTempEntity`.
- Tests de reference: `npx tsx ./scripts/verify/quake2-g-combat.ts`, `npm run verify:p-view`, `npm run verify:particle-sync`, `npm run typecheck`.
- Blocages: aucun pour les lignes `Couvert C/H`.

## Session courante

- Lignes traitees: `CheckPowerArmor`, `CheckArmor`, `CanDamage`, `T_RadiusDamage`, `SpawnDamage`, `Killed`, `M_ReactToDamage`, `CheckTeamDamage`, `T_Damage`.
- Verdict: `Couvert C/H` confirme pour les 9 lignes.
- Preuves: matrice C/H `game_g_combat.c.md` ouverte; chaque entite source correspond au symbole TS declare, avec `Valide` cote C/H et proprietaire `packages/game/src/g_combat.ts`.
- En-tetes: `Original name`, `Source: Quake-2-master/game/g_combat.c`, `Category: Ported`, export et fidelity verifies; les chemins `Source` ont ete renforces dans les commentaires TS.
- Ownership/doublons: proprietaire attendu `packages/game/src/g_combat.ts`; aucune autre declaration TS concurrente avec le meme `Original name` trouvee dans `packages`.
- Integration: runtime via appels directs de `g_weapon`, `g_func`, `g_misc`, `g_target`, `g_trigger`, `g_monster`, `p_view` et monstres; `apps/web` consomme les effets via le runtime server/game sans logique parallele; `renderer-three` consomme indirectement les snapshots/temp entities et particules, aucune integration directe supplementaire attendue pour ce lot.

## Session death-use adapters

- Lignes traitees: `GameCombatHooks`, `MonsterDeathUseDispatcher`, `defaultMonsterDeathUse`, `setDefaultMonsterDeathUse`.
- Verdict: `Valide` pour classement TS; aucun portage C/H proprietaire attribue a ces symboles.
- Preuves: `monster_death_use` est proprietaire dans `packages/game/src/g_monster.ts`, couvert dans `game_g_monster.c.md`; `Killed` reste couvert dans `game_g_combat.c.md` avec dispatch death-use documente.
- En-tetes: metadonnees ajoutees/verifiees avec `Original name: N/A`, `Source: N/A (...)`; `setDefaultMonsterDeathUse` conserve `Category: Adapter`, les trois autres symboles sont `Category: New`.
- Ownership/doublons: references limitees a `packages/game/src/g_combat.ts` et enregistrement depuis `packages/game/src/g_monster.ts`; aucune logique `monster_death_use` dupliquee dans ce lot.
- Integration: runtime integre via `T_Damage` -> `Killed` -> registre `defaultMonsterDeathUse` alimente par `g_monster.ts`; `apps/web` et `renderer-three` n'ont pas d'integration directe attendue pour ce registre local.
- Tests: `npx tsx ./scripts/verify/quake2-g-combat.ts`, `npm run verify:g-monster`, `npm run typecheck`.
