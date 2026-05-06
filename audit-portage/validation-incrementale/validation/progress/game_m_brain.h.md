# Progress - Quake-2-master/game/m_brain.h

## Etat courant

- Fichier source: `Quake-2-master/game/m_brain.h`
- Fichier TS proprietaire: `packages/game/src/m_brain.ts`
- Dernier lot valide: `FRAME_walk101` a `FRAME_walk225`
- Prochain lot recommande: `FRAME_walk226` a `FRAME_walk240`, puis `FRAME_attak101` a `FRAME_attak118` si le lot reste confortable.

## Validation du lot `FRAME_walk101` a `FRAME_walk225`

- Entites: macros de frames du modele `models/monsters/brain/tris.md2`.
- Ownership: port proprietaire dans `packages/game/src/m_brain.ts`, export groupe via `brainFrames` dans `packages/game/src/index.ts`; pas de renommage ni de deplacement.
- Doublons: seules collisions de noms attendues avec d'autres monstres dans leurs modules propres; pas de doublon proprietaire `m_brain`.
- Parite C/H vs TS: comparaison directe effectuee pendant la session pour les 38 constantes; valeurs TS egales aux `#define` C.
- Commentaires d'en-tete: commentaire de module `m_brain.ts` verifie pour ce bloc declaratif genere; les macros declaratives ne necessitent pas d'entete par constante.
- Runtime: `SP_monster_brain` est branche dans `g_spawn.ts`; `walkmonster_start`/`M_MoveFrame` consomment les moves. `brain_walk` et `brain_run` utilisent `brain_move_walk1` (`FRAME_walk101` a `FRAME_walk111`) comme le C actif. `FRAME_walk112`, `FRAME_walk113` et `FRAME_walk201` a `FRAME_walk225` restent des constantes de modele; le move `brain_move_walk2` C est sous `#if 0` avec commentaire "walk2 is FUBAR, do not use", donc il ne doit pas etre reactive pour valider ce lot.
- `apps/web`: le navigateur consomme le flux via la session full-game, snapshots serveur et `CL_BuildRefreshFrame`; pas d'integration web specifique aux constantes de header.
- `packages/renderer-three`: les frames visibles sortent via `entity_state_t.frame/oldframe`, sont projetees en refresh entities et consommees par `refresh-entity-sync`/`md2-mesh-builder`; pas de branche renderer specifique a ajouter pour ces constantes.

## Tests de reference

- Comparaison ciblee one-off C header vs TS pour `FRAME_walk101` a `FRAME_walk225`: OK, 38 constantes.
- `npm run verify:m-brain:header`: OK.
- `npm run verify:m-brain`: OK.
- `npm run verify:m-brain:source-parity`: OK.

## Blocages / decisions

- Aucun blocage.
- Laisser `brain_move_walk2` absent du runtime TS est conforme au C compile, car le bloc source est desactive par `#if 0`.
