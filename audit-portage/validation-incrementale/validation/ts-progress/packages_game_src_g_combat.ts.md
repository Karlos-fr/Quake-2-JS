# Progress TS - packages/game/src/g_combat.ts

- Statut: Termine
- Dernier lot valide: helpers locaux vecteur/bookkeeping (`addVec3`, `subtractVec3`, `scaleVec3`, `vectorLength`, `normalizeVec3`, `incrementKilledMonsters`) classes; type local superflu `GameCombatRuntimeBookkeeping` retire.
- Prochain lot recommande: aucun pour `packages/game/src/g_combat.ts`.
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

## Session helpers locaux combat

- Lignes traitees: `dotProduct`, `ClientTeam`, `OnSameTeam`, `traceCanDamage`, `emitCombatTempEntity`.
- Verdict: `Valide` pour `dotProduct`, `traceCanDamage` et `emitCombatTempEntity`; `ClientTeam`/`OnSameTeam` retires de `g_combat.ts` car leur port proprietaire est `packages/game/src/g_cmds.ts`.
- Preuves: matrice C/H `game_g_combat.c.md` ouverte pour `CanDamage`, `CheckPowerArmor`, `T_Damage` et `SpawnDamage`; matrice C/H `game_g_cmds.c.md` ouverte et confirme `ClientTeam`/`OnSameTeam` proprietaires dans `g_cmds.ts`.
- En-tetes: metadonnees ajoutees avec `Original name: N/A`, `Source declaree: N/A (...)`, `Category: New` pour les trois helpers conserves.
- Ownership/doublons: suppression du doublon prive `ClientTeam`/`OnSameTeam`; `T_Damage` importe maintenant `OnSameTeam` depuis `g_cmds.ts`.
- Integration: runtime integre via `T_Damage`, `CheckPowerArmor`, `CanDamage` et `SpawnDamage`; `apps/web` consomme les effets via le runtime server/game; `renderer-three` consomme indirectement les temp entities/particules, aucune integration directe supplementaire attendue pour ces helpers locaux.
- Tests: `npx tsx ./scripts/verify/quake2-g-combat.ts`, `npm run verify:g-cmds`, `npm run typecheck`.

## Session helpers locaux vecteur/bookkeeping

- Lignes traitees: `addVec3`, `subtractVec3`, `scaleVec3`, `vectorLength`, `normalizeVec3`, `GameCombatRuntimeBookkeeping`, `incrementKilledMonsters`.
- Verdict: `Valide` pour les 5 wrappers vecteur et `incrementKilledMonsters`; `GameCombatRuntimeBookkeeping` retire car `GameRuntime` porte deja le champ `killed_monsters`.
- Preuves: `g_combat.c` relu pour les appels `VectorAdd`, `VectorSubtract`, `VectorScale`, `VectorLength`, `VectorNormalize` et `level.killed_monsters++`; `packages/math/src/q_shared.ts`/`packages/qcommon/src/index.ts` confirment les portages proprietaires des helpers vecteur; `packages/game/src/runtime.ts` confirme `GameRuntime.killed_monsters`.
- En-tetes: metadonnees ajoutees avec `Original name: N/A`, `Source declaree: N/A (...)`, `Category: New`.
- Ownership/doublons: les wrappers restent locaux, prives et immutables; ils ne se presentent pas comme portage proprietaire des `Vector*`, qui restent dans `packages/math/src/q_shared.ts`. Le helper bookkeeping ne duplique plus le type runtime.
- Integration: runtime integre via `CheckPowerArmor`, `CanDamage`, `T_RadiusDamage`, `T_Damage` et `Killed`; `apps/web` consomme les resultats via le runtime server/game; `renderer-three` consomme indirectement les temp entities/particules et etats client deja produits par le runtime, aucune integration directe supplementaire attendue pour ces helpers locaux.
- Tests: `npx tsx ./scripts/verify/quake2-g-combat.ts`, `npm run typecheck`.
