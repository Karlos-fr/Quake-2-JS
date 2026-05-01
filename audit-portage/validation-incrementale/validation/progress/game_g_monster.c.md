# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `walkmonster_start`, `flymonster_start_go`
- Prochain lot recommande: `flymonster_start`, puis `swimmonster_start_go` si le lot reste petit
- Tests de reference: `npm run verify:g-monster`, `npm run verify:g-ai`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

- Lot traite: `walkmonster_start`, puis `flymonster_start_go`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaires d'en-tete TS `Close` verifies, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: `walkmonster_start` est appele par les spawn routines des monstres marcheurs (`m_*.ts`), arme le think differe `walkmonster_start_go`, puis passe par `monster_start`; le test verifie l'initialisation commune et l'execution du think de startup. `flymonster_start_go` est atteint depuis `flymonster_start`, verifie le probe `M_walkmove`, les defaults `yaw_speed`/`viewheight`, l'appel `monster_start_go` et le think regulier.
- apps/web: pas de logique parallele attendue; le navigateur declenche ces spawns via le runtime local/full-game et consomme les entites, etats et snapshots produits. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sorties visibles attendues indirectes via monstres demarres ou caches, modeles MD2, frames, origines/angles, `SVF_NOCLIENT` et etats render; ces donnees passent par snapshots/client refresh et sont consommees par les adapters Three. Pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `flymonster_start`, puis `swimmonster_start_go` si le lot reste petit.

## Session precedente

- Lot traite: locales `notcombat`, `fixup`, `target` de `monster_start_go`, puis `walkmonster_start_go`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS `walkmonster_start_go` verifie, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis `walkmonster_start` puis `SV_RunThink`; les locales `notcombat`/`fixup`/`target` conservent le retag `point_combat`, l'avertissement mixed target, la validation `combattarget` et l'effacement de `target`. `walkmonster_start_go` couvre le drop initial `M_droptofloor`, le probe `M_walkmove`, les defaults `yaw_speed`/`viewheight`, l'appel `monster_start_go` et le masquage `monster_triggered_start` pour `spawnflags & 2`.
- apps/web: pas de logique parallele attendue; le navigateur declenche les spawns via le runtime local/full-game et consomme les entites, avertissements, etats et snapshots produits. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue indirecte via monstres demarres ou caches, modeles MD2, frames, origines/angles, `SVF_NOCLIENT` et etats render; ces donnees passent par snapshots/client refresh et sont consommees par les adapters Three. Pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `walkmonster_start`, puis `flymonster_start_go` si le lot reste petit.

## Session precedente

- Lot traite: `monster_start`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS complete avec la note de portage `monsterinfo.scale`, test cible renforce dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis les spawn routines de monstres (`walkmonster_start`, `flymonster_start`, `swimmonster_start`) appelees par les fichiers `m_*.ts`; le lot couvre le free deathmatch, la conversion de `spawnflags & 4`, le comptage `total_monsters`, les flags/champs de startup, `monster_use`, `M_CheckAttack`, `old_origin`, l'item drop depuis `st.item`/`properties.item` et la randomisation de frame.
- apps/web: pas de logique parallele attendue; les monstres sont crees par le runtime local/full-game, puis les entites, sons/logs et snapshots produits sont consommes par le client web. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue indirecte via monstres demarres, modeles MD2, frames, origines/angles et etats render; ces donnees passent par snapshots/client refresh et sont consommees par les adapters Three. Pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: locales `notcombat`, `fixup`, `target` de `monster_start_go`, puis `walkmonster_start_go` si le lot reste petit.

## Session precedente

- Lot traite: `monster_death_use`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS `Close` verifie, test cible renforce dans `scripts/verify/quake2-g-monster.ts`, dispatch runtime `T_Damage`/`Killed` restaure via registre `setDefaultMonsterDeathUse`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis `T_Damage` puis `Killed` pour un monstre vivant qui meurt; `Killed` efface `touch`, stocke l'attaquant comme `enemy`, appelle `monster_death_use`, puis dispatch `die`. Le lot efface `FL_FLY`/`FL_SWIM`, conserve seulement `AI_GOOD_GUY`, droppe `item`, remplace `target` par `deathtarget`, retourne sans cible et appelle `G_UseTargets` avec l'ennemi comme activateur.
- apps/web: pas de logique parallele attendue; les morts de monstres passent par le runtime local/full-game, puis les targets, items droppes, sons/evenements et snapshots sont consommes par le client web. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue indirecte par disparition/changement d'etat du monstre, item droppé et eventuels targets declenches; les modeles/origines/frames et effets passent par snapshots/client refresh et adapters Three. Pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npx tsx ./scripts/verify/quake2-g-combat.ts` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_start`.

## Session precedente

- Lot traite: `monster_triggered_start`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS `Strict` verifie, test cible renforce dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis les chemins de demarrage `walkmonster_start_go`, `flymonster_start_go` et `swimmonster_start_go` quand `spawnflags & 2`; le lot masque le monstre avec `SOLID_NOT`, `MOVETYPE_NONE`, `SVF_NOCLIENT`, annule `nextthink` et arme `monster_triggered_spawn_use` pour le callback `use`.
- apps/web: pas de logique parallele attendue; les spawns et activations passent par le runtime local/full-game, puis les entites cachees/materialisees sont consommees par le client web via snapshots/refresh. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue indirecte: absence initiale du monstre cache (`SVF_NOCLIENT`), puis apparition du modele, de l'origine et des frames apres activation/materialisation. Ces donnees passent par snapshots/client refresh et sont consommees par `refresh-entity-sync`/MD2; pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_death_use`.

## Session precedente

- Lot traite: `monster_triggered_spawn_use`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour, test cible renforce dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis les monstres a `spawnflags & 2` via `monster_triggered_start` puis le callback `use`; le lot arme `monster_triggered_spawn` avec un delai d'une frame, conserve seulement les activateurs clients comme `enemy`, puis remplace `use` par le flux normal `monster_use`. `SV_RunThink` execute ensuite la materialisation.
- apps/web: pas de logique parallele attendue; les activations et frames serveur passent par le runtime local/full-game, puis les entites materialisees sont consommees par le client web via snapshots/refresh. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue indirecte apres la materialisation du monstre: modele, origine, frames et render state. Ces donnees passent par les snapshots/client refresh et sont consommees par `refresh-entity-sync`/MD2; pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_triggered_start`.

## Session precedente

- Lot traite: `monster_triggered_spawn`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS `Close` verifie, test cible renforce dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis les monstres a `spawnflags & 2` via `walkmonster_start_go`/`flymonster_start_go`/`swimmonster_start_go`, puis `monster_triggered_spawn_use` arme le think differe d'une frame; `SV_RunThink` execute la materialisation, `KillBox`, restauration `SOLID_BBOX`/`MOVETYPE_STEP`, relink, `monster_start_go` et `FoundTarget` conditionnel.
- apps/web: pas de logique parallele attendue; les activations et frames serveur passent par le runtime local/full-game, puis les entites materialisees sont consommees par le client web via snapshots/refresh. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue indirecte par apparition du monstre, modeles, origine, solidite runtime, frames et render state; le flux snapshot/client refresh alimente `refresh-entity-sync`/MD2. Pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_triggered_spawn_use`.

## Session precedente

- Lot traite: `monster_start_go`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour, test cible renforce dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis les spawn routines de monstres (`walkmonster_start`, `flymonster_start`, `swimmonster_start`) qui arment les callbacks de demarrage, puis `monster_start_go` choisit `stand`/`walk`, cible les `path_corner`, retague les `point_combat`, arme `monster_think` et `nextthink`.
- apps/web: pas de logique parallele attendue; le navigateur declenche les spawns via le runtime local/full-game et consomme les entites, etats et logs/snapshots produits. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue indirecte via les monstres demarres, leurs modeles, positions, angles et frames; ces donnees passent par les snapshots/client refresh et sont consommees par les adapters Three. Pas de branchement gameplay renderer requis.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_triggered_spawn`.

## Session precedente

- Lot traite: `monster_use`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour, test cible renforce dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable par les callbacks `use` armes par `monster_start`, `monster_triggered_start` et `turret_driver`; branches verifiees pour ennemi deja present, monstre mort, activateur `FL_NOTARGET`, non-client hostile, monstre `AI_GOOD_GUY`, acquisition `enemy` et appel `FoundTarget`.
- apps/web: pas de logique parallele attendue; le navigateur declenche/consomme ce flux via le runtime local/full-game, commandes d'activation, snapshots et refresh. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: pas de sortie renderer directe propre a `monster_use`; l'effet attendu est gameplay (`enemy` + transition AI via `FoundTarget`) puis les changements visibles ulterieurs de frames/origines/effects passent par les snapshots runtime/client deja couverts.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_start_go`.

## Session precedente

- Lot traite: `monster_think`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis `G_RunFrame` -> `G_RunEntity` -> `SV_Physics_Step`/`SV_RunThink` -> `monster_think`; ordre C verifie pour `M_MoveFrame`, refresh ground si `linkcount` change, `M_CatagorizePosition`, `M_WorldEffects`, `M_SetEffects`.
- apps/web: pas de logique parallele attendue; le navigateur consomme le runtime porte via host local/full-game, snapshots, audio events et refresh frames/effects. Tests `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` OK.
- renderer-three: sortie visible attendue via frames MD2, origines, angles et render effects des monstres; `packages/client/src/refresh.ts` transmet `frame`/`oldframe`/`effects` et `packages/renderer-three/src/refresh-entity-sync.ts`/`md2-mesh-builder.ts` consomment ces donnees. Pas de correction renderer necessaire.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_use`.

## Session precedente

- Lot traite: `M_MoveFrame` avec les locales `move` et `index`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour pour l'adaptation runtime, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis `G_RunFrame` -> `G_RunEntity` -> `SV_Physics_Step`/`SV_RunThink` -> `monster_think` -> `M_MoveFrame`; branches verifiees pour `nextthink`, `monsterinfo.nextframe`, reset hors plage avec nettoyage `AI_HOLD_FRAME`, avance/wrap de frame, `endfunc` avec relecture de `currentmove`, retour `SVF_DEADMONSTER`, calcul `index`, appels `aifunc`/`thinkfunc` et distance `dist * scale`.
- apps/web: pas de logique parallele attendue; le navigateur consomme le runtime porte via host local/full-game, snapshots et refresh frames. Le lot produit notamment `s.frame` et mouvements AI visibles en aval; `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` couvrent ce flux.
- renderer-three: sortie visible attendue via frames MD2 de monstres, origines/angles et interpolation alias-model; `packages/client/src/refresh.ts` transmet `frame`/`oldframe` aux render entities et `packages/renderer-three/src/md2-mesh-builder.ts` consomme ces frames. Pas de correction renderer necessaire.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `monster_think`.

## Session precedente

- Lot traite: `M_SetEffects`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS `Strict` verifie, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, tests runtime/web/renderer/typecheck OK.
- Runtime: atteignable depuis `G_RunFrame` -> `G_RunEntity` -> `monster_think` apres `M_MoveFrame`, `M_CatagorizePosition` et `M_WorldEffects`; branches verifiees pour nettoyage des anciens bits `EF_COLOR_SHELL`/`EF_POWERSCREEN` et `RF_SHELL_*`, resurrection rouge, retour anticipe des monstres morts, `POWER_ARMOR_SCREEN`, `POWER_ARMOR_SHIELD` et expiration `powerarmor_time <= level.time`.
- apps/web: pas de logique parallele attendue; le navigateur consomme les `effects`/`renderfx` issus du runtime via snapshots/full-game/local sync, puis client refresh. `verify:local-gameplay-sync`, `verify:full-game:three-renderer` et `verify:web-render-order` couvrent ce flux.
- renderer-three: sortie visible attendue via modeles MD2/scene avec shell rouge ou vert et powerscreen translucide; consommation verifiee dans les adapters client/renderer (`refresh` ajoute le shell powerscreen, `renderer-three` consomme `RF_SHELL_*`). Pas de correction renderer necessaire.
- Tests lances: `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run verify:web-render-order` OK, `npm run typecheck` OK.
- Prochain lot recommande: `M_MoveFrame` avec `move` et `index` si le lot reste petit.

## Session precedente

- Lot traite: `M_WorldEffects` avec locale `dmg`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour, constante `DAMAGE_NO_ARMOR` explicitee, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run typecheck` OK.
- Runtime: atteignable depuis `G_RunFrame` via `G_RunEntity`/`monster_think`; branches verifiees pour air timer non-nageur, noyade plafonnee, suffocation `FL_SWIM`, lave, slime, immunites, sons entree/sortie et `FL_INWATER`.
- apps/web: pas d'appel direct attendu; le flux navigateur utilise le runtime porte et consomme les evenements sons emis par `M_WorldEffects` via `drainGameSoundEvents`/local full-game loop.
- renderer-three: pas de sortie visible directe propre a l'entite; les sorties runtime visibles restent les scenes/snapshots des monstres existants, et les sons d'eau/lave/slime sont hors renderer.
