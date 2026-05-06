# Progress - Quake-2-master/game/m_flyer.h

## Etat courant

- Statut: En cours
- Dernier lot valide: macros `ACTION_*`, `FRAME_start01..06`, `FRAME_stop01..07`, `FRAME_stand01..45`.
- Entites validees: 63 / 157.

## Preuves de session

- Comparaison source C/H vs TS: `Quake-2-master/game/m_flyer.h` compare a `packages/game/src/m_flyer.ts` pour 63 macros du lot; valeurs exactes confirmees par harness `tsx` ad hoc.
- Ownership/doublons: cible proprietaire confirmee dans `packages/game/src/m_flyer.ts`; exports de memes noms trouves ailleurs seulement pour d'autres monstres avec ownership distinct.
- Commentaires d'en-tete: commentaire de fichier `m_flyer.ts` verifie; pas de commentaire par constante attendu pour ces macros declaratives generees.
- Runtime: `monster_flyer` branche dans `g_spawn.ts`; `SP_monster_flyer` initialise `flyer_move_stand`; `M_MoveFrame` consomme `firstframe`/`lastframe` et met a jour `s.frame`.
- apps/web: le flux full-game pompe le runtime et synchronise les `entity_state_t` visibles via le chemin client/local; pas de logique web parallele identifiee pour ces constantes.
- renderer-three: les frames et modelindex sortent via les entites visibles, puis `renderer-three` consomme `refdef.entities` et dessine les alias models; pas d'adapter specifique necessaire pour les constantes seules.

## Tests lances

- `npm run verify:m-flyer:header`
- `npm run verify:m-flyer:source-parity`
- `npm run verify:m-flyer`
- Harness ad hoc `npx tsx -` comparant les 63 macros du lot contre `m_flyer.h`

## Prochain lot recommande

- Continuer avec `FRAME_attak101..FRAME_attak217`, en couvrant les moves `flyer_move_attack2`, `flyer_move_start_melee`, `flyer_move_loop_melee` et `flyer_move_end_melee` si le lot reste coherent.

## Blocages

- Aucun.
