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

## Session 2026-05-03 - `turret_breach_fire`

- Lot traite: `turret_breach_fire` et les locaux C `damage` / `speed`.
- Statut: `turret_breach_fire` valide; `damage` et `speed` marques `Non applicable` comme artefacts de matrice pour des variables locales portees en constantes locales TS.
- Comparaison C/H vs TS: ownership confirme dans `packages/game/src/g_turret.ts`; nom conserve dans le port proprietaire; calcul du muzzle par `AngleVectors` puis trois `VectorMA` conserve; attaquant `self->teammaster->owner` conserve dans le flux normal; `fire_rocket` appele avec `damage`, `speed`, rayon `150` et radius damage `damage`; son `weapons/rocklf1a.wav` conserve.
- Correction TS: `damage` et `speed` sont maintenant tronques avec `Math.trunc` pour correspondre aux `int` C; le son de tir est desormais emis avec origine positionnee au muzzle `start`, canal `CHAN_WEAPON`, volume `1`, attenuation `ATTN_NORM` et `timeofs` `0`, au lieu d'un son seulement attache a l'entite.
- Commentaire d'en-tete: verifie et complete pour documenter la troncature C et le son positionne.
- Runtime: atteint par `turret_breach_think` quand le flag `TURRET_BREACH_FIRE` est arme par `turret_driver_think`; les spawns `turret_breach`, `turret_base`, `turret_driver` restent branches via `ED_CallSpawn`, puis `G_RunFrame`/thinks et callback projectile `fire_rocket`.
- apps/web: integration attendue indirecte via runtime full-game/local; le navigateur doit consommer le projectile rocket, les sons serveur et les snapshots issus du runtime, sans logique parallele pour ce tir. `verify:full-game:server-host`, `verify:web-render-order` et `verify:full-game:audio-routing` couvrent ce flux.
- renderer-three: sortie visible attendue via entite rocket `EF_ROCKET`, modele/sound de projectile, trail/dlight rocket, puis temp entities d'impact gerees par `fire_rocket`/`rocket_touch`; la consommation passe par packet entities, refresh client et renderer Three. `verify:full-game:three-renderer` couvre l'adapter renderer.
- Tests lances: `npm run verify:g-turret`; harnais inline `npx tsx -` ciblant `turret_breach_fire` avec `Math.random` controle, origine du son positionne, attaquant, `damage`, `speed`, rayon et metadata son; `npm run verify:full-game:server-host`; `npm run verify:web-render-order`; `npm run verify:full-game:three-renderer`; `npm run verify:full-game:audio-routing`; `npm run typecheck`.

## Session 2026-05-03 - `turret_breach_think` sous-lot `ent`/`angle`/`target_z`/`diff`

- Lot traite: `turret_breach_think` avec les locaux C `ent`, `angle`, `target_z` et `diff`.
- Statut: `turret_breach_think` valide pour ce sous-lot; les quatre locaux sont marques `Non applicable` comme artefacts de matrice portes en variables/constantes locales TS.
- Comparaison C/H vs TS: ownership confirme dans `packages/game/src/g_turret.ts`; nom conserve; normalisation/clamp pitch-yaw, calcul `delta`, limitation par `speed * FRAMETIME`, `avelocity`, `nextthink`, propagation `ent = self->teammaster; ent = ent->teamchain`, copie des vitesses angulaires driver, calculs `angle`, `target_z` par `SnapToEights`, `diff`, declenchement et effacement du flag de tir conserves.
- Commentaire d'en-tete: complete pour documenter les locaux C du sous-lot portes en locaux TypeScript.
- Preuve ciblee: harnais inline `npx tsx -` pour verifier les valeurs exactes de `avelocity`, `nextthink`, parcours complet de teamchain via `ent`, vitesses angulaires du driver, vitesse driver `[30, 370, -80]` issue de `angle`, `target_z` et `diff`, et tir rocket.
- Runtime: atteint normalement via `SP_turret_breach`, `turret_breach_finish_init`, `self.think = turret_breach_think`, puis `G_RunFrame`/`runPendingThinks`; le tir reste arme par `turret_driver_think` via `TURRET_BREACH_FIRE`.
- apps/web: pas d'appel direct attendu; l'integration attendue est indirecte via le runtime full-game/local, les snapshots d'entites pusher/driver, sons et projectiles. `verify:full-game:server-host` et `verify:web-render-order` confirment que le flux web consomme le runtime porte sans logique parallele.
- renderer-three: sorties visibles attendues indirectes via angles/origins/vitesses des brushes de tourelle et driver, entite rocket `EF_ROCKET`, puis temp entities/dlights/scene apres impact; `verify:full-game:three-renderer` confirme la consommation du flux renderer.
- Tests lances: `npm run verify:g-turret`; harnais inline `npx tsx -` exact-locals; `npm run verify:full-game:server-host`; `npm run verify:web-render-order`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.

## Session 2026-05-03 - `turret_breach_finish_init` / `SP_turret_breach`

- Lot traite: `turret_breach_finish_init`, puis `SP_turret_breach`.
- Statut: valide pour ces deux entites.
- Comparaison C/H vs TS: ownership confirme dans `packages/game/src/g_turret.ts`; noms conserves; `turret_breach_finish_init` conserve l'avertissement sans target, la resolution `G_PickTarget`, le calcul `move_origin = target_ent.s.origin - self.s.origin`, la liberation du target temporaire, la copie `dmg` vers le teammaster et l'appel immediat du think regulier. `SP_turret_breach` conserve `SOLID_BSP`, `MOVETYPE_PUSH`, `gi.setmodel` via `setGameEntityModel`, defaults `speed=50` et `dmg=10`, defaults pitch/yaw, `pos1`/`pos2`, `ideal_yaw`, `move_angles[YAW]`, `blocked`, `think`, `nextthink` et `linkentity`.
- Commentaires d'en-tete: verifies pour les deux fonctions avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement.
- Runtime: `SP_turret_breach` est declare dans `g_spawn.ts` pour classname `turret_breach`, donc atteignable via `ED_CallSpawn`; `turret_breach_finish_init` est arme comme think differe puis execute par `runPendingThinks`/`G_RunFrame`, et bascule ensuite vers `turret_breach_think`.
- apps/web: pas d'appel direct attendu; l'integration attendue passe par le runtime full-game/local, avec spawn de brush turret, snapshots serveur et ordre de rendu web existants. Aucune logique parallele web ne remplace ce spawn.
- renderer-three: sorties visibles attendues indirectes via entite brush `SOLID_BSP`/modele inline, angles et etat serveur de la tourelle; la consommation se fait via packet entities et l'adapter renderer Three. Aucun branchement renderer direct supplementaire n'est attendu pour ces fonctions serveur.
- Tests lances: `npm run verify:g-turret`; `npm run verify:full-game:server-host`; `npm run verify:web-render-order`; `npm run verify:full-game:three-renderer`.
- Typecheck: non lance, aucun fichier TS modifie pendant cette session.

## Prochain lot recommande

Continuer avec `SP_turret_base`, puis `turret_driver_die` si le lot reste petit.
