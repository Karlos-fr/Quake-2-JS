# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `M_MoveFrame` avec `move` et `index`
- Prochain lot recommande: `monster_think`
- Tests de reference: `npm run verify:g-monster`, `npm run verify:g-ai`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

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
