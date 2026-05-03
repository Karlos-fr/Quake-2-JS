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

## Session 2026-05-03 - `turret_blocked`

- Lot traite: `turret_blocked` et le local C `attacker`.
- Statut: `turret_blocked` valide; `attacker` marque `Non applicable` comme artefact de matrice pour une variable locale portee en constante locale TS.
- Comparaison C/H vs TS: ownership confirme dans `packages/game/src/g_turret.ts`; nom conserve; `other->takedamage` correspond au retour anticipe TS; choix `self->teammaster->owner` sinon `self->teammaster` conserve via `teammaster.owner ?? teammaster`; appel `T_Damage` conserve avec `vec3_origin`, `other.s.origin`, degats `teammaster.dmg`, knockback `10`, dflags `0`, `MOD_CRUSH`.
- Commentaire d'en-tete: verifie pour `turret_blocked` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement.
- Runtime: callback branche par `SP_turret_breach` et `SP_turret_base`; atteignable normalement par `ED_CallSpawn`, mouvement pusher `SV_Physics_Pusher`, puis appel `part.blocked` quand une tourelle/base est bloquee.
- apps/web: pas d'appel direct attendu; l'integration web doit consommer le runtime full-game/local, les changements de sante/death messages et snapshots issus du serveur. `verify:full-game:server-host` et `verify:web-render-order` confirment que le flux web ne remplace pas cette logique.
- renderer-three: pas de sortie renderer directe produite par `turret_blocked`; les effets visibles attendus sont indirects via etat serveur apres crush damage/death, entites/snapshots et scene existante. `verify:full-game:three-renderer` couvre la consommation du flux full-game renderer.
- Tests lances: `npm run verify:g-turret`; `npm run verify:full-game:server-host`; `npm run verify:web-render-order`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.

## Prochain lot recommande

Continuer avec `turret_breach_fire` puis les locaux `damage` et `speed` si le lot reste petit, en verifiant l'attaquant owner, le calcul du muzzle, `fire_rocket`, le son de tir, et les sorties visibles rocket/temp entities cote web/renderer.
