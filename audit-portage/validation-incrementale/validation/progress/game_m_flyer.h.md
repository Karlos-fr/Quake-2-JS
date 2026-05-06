# Progress - Quake-2-master/game/m_flyer.h

## Etat courant

- Statut: Termine
- Dernier lot valide: toutes les macros restantes `FRAME_attak101..FRAME_pain304` et `MODEL_SCALE`.
- Entites validees: 157 / 157.

## Preuves de session

- Comparaison source C/H vs TS: `Quake-2-master/game/m_flyer.h` compare a `packages/game/src/m_flyer.ts` pour 63 macros du lot; valeurs exactes confirmees par harness `tsx` ad hoc.
- Ownership/doublons: cible proprietaire confirmee dans `packages/game/src/m_flyer.ts`; exports de memes noms trouves ailleurs seulement pour d'autres monstres avec ownership distinct.
- Commentaires d'en-tete: commentaire de fichier `m_flyer.ts` verifie; pas de commentaire par constante attendu pour ces macros declaratives generees.
- Runtime: `monster_flyer` branche dans `g_spawn.ts`; `SP_monster_flyer` initialise `flyer_move_stand`; `M_MoveFrame` consomme `firstframe`/`lastframe` et met a jour `s.frame`.
- apps/web: le flux full-game pompe le runtime et synchronise les `entity_state_t` visibles via le chemin client/local; pas de logique web parallele identifiee pour ces constantes.
- renderer-three: les frames et modelindex sortent via les entites visibles, puis `renderer-three` consomme `refdef.entities` et dessine les alias models; pas d'adapter specifique necessaire pour les constantes seules.

## Preuves de session du lot final

- Comparaison source C/H vs TS: `scripts/verify/quake2-m-flyer-header.ts` renforce pour parser les 157 macros de `Quake-2-master/game/m_flyer.h` et comparer chaque export de `packages/game/src/m_flyer.ts`; lot restant `FRAME_attak101..FRAME_pain304` et `MODEL_SCALE` couvert exhaustivement.
- Ownership/doublons: cible proprietaire confirmee dans `packages/game/src/m_flyer.ts`; les collisions de noms `FRAME_*`/`MODEL_SCALE` dans d'autres monstres restent dans leurs modules proprietaires, et `packages/game/src/index.ts` n'exporte pas les constantes communes pour eviter les collisions.
- Commentaires d'en-tete: commentaire de fichier `m_flyer.ts` verifie; constantes declaratives generees, pas de commentaire par constante attendu.
- Runtime: les constantes restantes sont consommees par `flyer_move_attack2`, `flyer_move_start_melee`, `flyer_move_loop_melee`, `flyer_move_end_melee`, `flyer_move_bankleft`, `flyer_move_bankright`, `flyer_move_rollleft`, `flyer_move_rollright`, `flyer_move_defense`, `flyer_move_pain1`, `flyer_move_pain2`, `flyer_move_pain3` et `SP_monster_flyer`; atteignable via `monster_flyer` dans `g_spawn.ts`, `ED_CallSpawn`, `flymonster_start` et `M_MoveFrame`.
- apps/web: le flux full-game utilise le runtime/server/client portes; `createFullGameServerRenderSource` consomme les `entity_state_t` et les modeles via les configstrings, sans logique parallele flyer.
- renderer-three: les sorties visibles attendues sont modeles et frames MD2; `refresh-entity-sync` consomme `modelindex`, `frame` et `oldframe`, sanitize les paires de frames MD2 et met a jour les meshes alias. Aucun branchement specifique flyer manquant.

## Tests lances

- `npm run verify:m-flyer:header`
- `npm run verify:m-flyer:source-parity`
- `npm run verify:m-flyer`
- Harness ad hoc `npx tsx -` comparant les 63 macros du lot contre `m_flyer.h`
- Lot final:
  - `npm run verify:m-flyer:header`
  - `npm run verify:m-flyer:source-parity`
  - `npm run verify:m-flyer`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:web-render-order`

## Prochain lot recommande

- Aucun dans `m_flyer.h`: toutes les macros de frame/action et `MODEL_SCALE` sont validees.

## Blocages

- Aucun.
