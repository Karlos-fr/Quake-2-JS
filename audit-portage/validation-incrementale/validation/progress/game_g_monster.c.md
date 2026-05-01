# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `M_WorldEffects` avec locale `dmg`
- Prochain lot recommande: `M_droptofloor` avec locales `end` et `trace` si le lot reste petit
- Tests de reference: `npm run verify:g-monster`, `npm run verify:g-ai`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

- Lot traite: `M_WorldEffects` avec locale `dmg`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaire d'en-tete TS mis a jour, constante `DAMAGE_NO_ARMOR` explicitee, test cible ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, `npm run verify:g-ai` OK, `npm run verify:local-gameplay-sync` OK, `npm run verify:full-game:three-renderer` OK, `npm run typecheck` OK.
- Runtime: atteignable depuis `G_RunFrame` via `G_RunEntity`/`monster_think`; branches verifiees pour air timer non-nageur, noyade plafonnee, suffocation `FL_SWIM`, lave, slime, immunites, sons entree/sortie et `FL_INWATER`.
- apps/web: pas d'appel direct attendu; le flux navigateur utilise le runtime porte et consomme les evenements sons emis par `M_WorldEffects` via `drainGameSoundEvents`/local full-game loop.
- renderer-three: pas de sortie visible directe propre a l'entite; les sorties runtime visibles restent les scenes/snapshots des monstres existants, et les sons d'eau/lave/slime sont hors renderer.
