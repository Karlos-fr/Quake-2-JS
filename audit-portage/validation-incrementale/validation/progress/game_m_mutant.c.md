# Progress - Quake-2-master/game/m_mutant.c

- Source: `Quake-2-master/game/m_mutant.c`
- Matrice: `audit-portage/validation-incrementale/validation/matrices/game_m_mutant.c.md`
- Cible TS principale: `packages/game/src/m_mutant.ts`
- Statut: En cours

## Dernier lot valide

Lot initial elargi:

- sons/precache initiaux `sound_swing` a `sound_thud` / `SOUND_*`;
- callbacks sonores `mutant_step`, `mutant_sight`, `mutant_search`, `mutant_swing`;
- bloc stand/idle/walk/run: `mutant_frames_stand`, `mutant_move_stand`, `mutant_stand`, `mutant_idle_loop`, `mutant_frames_idle`, `mutant_move_idle`, `mutant_idle`, `mutant_frames_walk`, `mutant_move_walk`, `mutant_walk_loop`, `mutant_frames_start_walk`, `mutant_move_start_walk`, `mutant_walk`, `mutant_frames_run`, `mutant_move_run`, `mutant_run`.

Validation:

- comparaison C vs TS effectuee pour constantes sons, paths precaches, callbacks sonores, distances/frames/thinkfunc/endfunc des moves stand/idle/walk/start_walk/run, transitions de `currentmove` et branche `AI_STAND_GROUND`;
- commentaires d'en-tete ajoutes/verifies pour les fonctions du lot dans `packages/game/src/m_mutant.ts`;
- runtime verifie: `monster_mutant` est branche par `g_spawn.ts`, `SP_monster_mutant` assigne les callbacks, `M_MoveFrame` atteint les thinkfunc de moves, et `g_save.ts` enregistre les callbacks/moves exportes;
- `apps/web` juge non modifie pour ce lot: le navigateur consomme le runtime porte via la session full-game/local-controller et ne doit pas dupliquer ces callbacks gameplay;
- `renderer-three` juge couvert comme adapter de sortie visible: le lot produit `modelindex`, `s.frame`/`skinnum` et sons via le runtime; le renderer consomme les entites client/modeles/skins generiques, sans branche specifique mutant attendue dans ce lot.

Artefacts matrice:

- `n` marque `Non applicable`: variable locale de `mutant_step`, pas une entite proprietaire.
- premiere ligne `mutant_walk` marquee `Non applicable`: declaration anticipee C; la definition reelle est validee sur sa ligne dediee.

## Tests lances

- `npm run verify:m-mutant`
- `npm run verify:m-mutant:source-parity`
- `npm run verify:m-mutant:header`
- `npm run typecheck`

## Prochain lot recommande

Continuer avec le bloc melee/attack: `mutant_hit_left`, `mutant_hit_right`, `mutant_check_refire`, `mutant_frames_attack`, `mutant_move_attack`, `mutant_melee`, puis seulement inclure le debut du jump si le lot reste coherent.

## Blocages

Aucun blocage ouvert pour le lot valide.
