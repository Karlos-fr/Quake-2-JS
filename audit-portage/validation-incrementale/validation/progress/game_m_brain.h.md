# Progress - Quake-2-master/game/m_brain.h

## Etat courant

- Fichier source: `Quake-2-master/game/m_brain.h`
- Fichier TS proprietaire: `packages/game/src/m_brain.ts`
- Dernier lot valide: `FRAME_walk226` a `MODEL_SCALE`
- Prochain lot recommande: aucun lot restant dans `game_m_brain.h.md`; toutes les lignes sont `Valide`.

## Validation du lot `FRAME_walk226` a `MODEL_SCALE`

- Entites: 185 macros restantes du header, de `FRAME_walk226` a `FRAME_stand60`, plus `MODEL_SCALE`.
- Ownership: port proprietaire confirme dans `packages/game/src/m_brain.ts`; export groupe via `brainFrames` dans `packages/game/src/index.ts`; pas de renommage ni de deplacement pour les constantes du header.
- Doublons: seules collisions nominales attendues avec les headers d'autres monstres dans leurs modules propres; aucun doublon proprietaire `m_brain` detecte.
- Parite C/H vs TS: comparaison exhaustive effectuee pendant la session pour les 223 `#define` de `m_brain.h`; valeurs TS egales aux macros C, donc le lot restant est couvert integralement.
- Commentaires d'en-tete: commentaire de module `m_brain.ts` verifie pour le bloc declaratif genere; les macros declaratives ne necessitent pas d'entete par constante. Les fonctions qui consomment les moves ont des commentaires `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`/`Porting notes` quand utile.
- Runtime: `SP_monster_brain` est branche via `g_spawn.ts` / `ED_CallSpawn`; `walkmonster_start`, `monster_think` et `M_MoveFrame` consomment les moves. Les familles actives `stand`, `idle`, `walk1`, `defense`, `pain`, `duck`, `death`, `attack1`, `attack2` et `run` conservent les bornes C. `brain_move_walk2` reste absent du runtime TS comme dans le C compile, car le bloc source est desactive sous `#if 0` avec "walk2 is FUBAR, do not use".
- `apps/web`: le navigateur consomme les sorties via le runtime full-game/local, snapshots serveur et ordre de rendu web; pas de logique parallele a corriger pour ces constantes declaratives.
- `packages/renderer-three`: les sorties visibles attendues sont le modele brain MD2, `frame`, `oldframe`, `backlerp` et `modelindex`; elles passent par snapshots/refresh entities et sont consommees par le renderer three. Pas de branche renderer specifique a ajouter.

## Tests de reference

- Comparaison exhaustive one-off C header vs TS pour les 223 `#define` de `m_brain.h`: OK.
- `npm run verify:m-brain:header`: OK.
- `npm run verify:m-brain:source-parity`: OK.
- `npm run verify:m-brain`: OK.
- `npm run verify:full-game:server-snapshots`: OK.
- `npm run verify:full-game:three-renderer`: OK.
- `npm run verify:web-render-order`: OK.

## Blocages / decisions

- Aucun blocage.
- Le fichier `m_brain.h` est clos cote matrice: toutes les constantes de frame et `MODEL_SCALE` sont validees.
