# Progress TS - packages/game/src/g_combat.ts

- Statut: En cours
- Dernier lot valide: 9 lignes `Couvert C/H` auditees et confirmees.
- Prochain lot recommande: traiter les lignes `A verifier` restantes, en commencant par classer les helpers/adapters sans lien source (`GameCombatHooks`, `MonsterDeathUseDispatcher`, `defaultMonsterDeathUse`, `setDefaultMonsterDeathUse`).
- Tests de reference: `npx tsx ./scripts/verify/quake2-g-combat.ts`, `npm run verify:p-view`, `npm run verify:particle-sync`, `npm run typecheck`.
- Blocages: aucun pour les lignes `Couvert C/H`.

## Session courante

- Lignes traitees: `CheckPowerArmor`, `CheckArmor`, `CanDamage`, `T_RadiusDamage`, `SpawnDamage`, `Killed`, `M_ReactToDamage`, `CheckTeamDamage`, `T_Damage`.
- Verdict: `Couvert C/H` confirme pour les 9 lignes.
- Preuves: matrice C/H `game_g_combat.c.md` ouverte; chaque entite source correspond au symbole TS declare, avec `Valide` cote C/H et proprietaire `packages/game/src/g_combat.ts`.
- En-tetes: `Original name`, `Source: Quake-2-master/game/g_combat.c`, `Category: Ported`, export et fidelity verifies; les chemins `Source` ont ete renforces dans les commentaires TS.
- Ownership/doublons: proprietaire attendu `packages/game/src/g_combat.ts`; aucune autre declaration TS concurrente avec le meme `Original name` trouvee dans `packages`.
- Integration: runtime via appels directs de `g_weapon`, `g_func`, `g_misc`, `g_target`, `g_trigger`, `g_monster`, `p_view` et monstres; `apps/web` consomme les effets via le runtime server/game sans logique parallele; `renderer-three` consomme indirectement les snapshots/temp entities et particules, aucune integration directe supplementaire attendue pour ce lot.
