# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `monster_start_go`
- Prochain lot recommande: `monster_triggered_spawn`
- Tests de reference: `npm run verify:g-monster`, `npm run verify:g-ai`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

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
