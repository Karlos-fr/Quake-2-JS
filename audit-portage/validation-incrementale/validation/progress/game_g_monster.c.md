# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `M_droptofloor` avec locales `end` et `trace`
- Prochain lot recommande: `M_SetEffects`
- Tests de reference: `npm run verify:g-monster`, `npm run verify:g-ai`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

- Lot traite: `M_droptofloor` avec locales `end` et `trace`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour pour l'adaptation `origin`/`s.origin`, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK.
- Runtime: atteignable depuis `walkmonster_start_go` pour les monstres marcheurs au spawn initial, et depuis `SP_misc_explobox` via le think differe des barrels; branches verifiees pour trace 256 unites vers le bas depuis l'origine relevee, sortie `fraction == 1`/`allsolid`, copie `trace.endpos`, `linkentity`, `M_CheckGround` et `M_CatagorizePosition`.
- apps/web: pas de logique parallele attendue; le navigateur consomme le runtime porte via full-game/local session, sons/refresh et snapshots d'entites. La sortie utile du lot est l'origine corrigee des entites apres spawn/drop.
- renderer-three: sortie visible attendue indirecte via modeles/origines d'entites dans les refresh frames; pas de branchement renderer dedie requis pour ce helper, qui ne produit ni particules, beams, dlights, temp entities, areabits, camera, ni scene propre.
- Tests lances: `npm run verify:g-monster` OK.
- Prochain lot recommande: `M_SetEffects`.

## Session precedente

- Lot traite: `M_WorldEffects` avec locale `dmg`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour, constante `DAMAGE_NO_ARMOR` explicitee, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run typecheck` OK.
- Runtime: atteignable depuis `G_RunFrame` via `G_RunEntity`/`monster_think`; branches verifiees pour air timer non-nageur, noyade plafonnee, suffocation `FL_SWIM`, lave, slime, immunites, sons entree/sortie et `FL_INWATER`.
- apps/web: pas d'appel direct attendu; le flux navigateur utilise le runtime porte et consomme les evenements sons emis par `M_WorldEffects` via `drainGameSoundEvents`/local full-game loop.
- renderer-three: pas de sortie visible directe propre a l'entite; les sorties runtime visibles restent les scenes/snapshots des monstres existants, et les sons d'eau/lave/slime sont hors renderer.
