# Progress - Quake-2-master/game/g_turret.c

## Session 2026-05-03

- Lot traite: helpers `AnglesNormalize` et `SnapToEights`.
- Statut: valide pour ces deux entites.
- Comparaison C/H vs TS: noms conserves, ownership dans `packages/game/src/g_turret.ts`, comportement strictement equivalent (`while` pitch/yaw pour `AnglesNormalize`, arrondi signe puis `Math.trunc` pour `SnapToEights`).
- Commentaires d'en-tete: verifies, avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement.
- Runtime: atteint par `turret_breach_think`; `AnglesNormalize` est aussi atteint par `turret_driver_link`. Les spawns `turret_breach`, `turret_base`, `turret_driver` sont declares dans `g_spawn.ts`, et le flux normal passe par `ED_CallSpawn` puis thinks/G_RunFrame.
- apps/web: pas de declenchement direct attendu pour ces helpers; le navigateur consomme le runtime porte via le flux full-game existant, sans logique parallele pour ces helpers.
- renderer-three: pas de consommation directe attendue pour ces helpers; leurs effets sont les angles/origins/velocites d'entites serveur visibles, consommes via les packet entities et l'adapter refresh/brush existant.
- Tests lances: `npm run verify:g-turret`; `npx tsx -e "..."` ciblant les cas limites de `AnglesNormalize` et `SnapToEights`.

## Prochain lot recommande

Continuer avec `turret_blocked` puis le local `attacker` associe si le lot reste petit, en verifiant `T_Damage`, l'ownership du crush damage, le branchement `blocked` depuis `SP_turret_breach`/`SP_turret_base`, et l'absence d'attente renderer directe.
