# Progress - Quake-2-master/game/m_mutant.c

- Source: `Quake-2-master/game/m_mutant.c`
- Matrice: `audit-portage/validation-incrementale/validation/matrices/game_m_mutant.c.md`
- Cible TS principale: `packages/game/src/m_mutant.ts`
- Statut: En cours

## Dernier lot valide

Lot attaque/saut elargi:

- bloc melee/attack: `mutant_hit_left`, `mutant_hit_right`, `mutant_check_refire`, `mutant_frames_attack`, `mutant_move_attack`, `mutant_melee`;
- bloc jump/checkattack coherent: `mutant_jump_touch`, `mutant_jump_takeoff`, `mutant_check_landing`, `mutant_frames_jump`, `mutant_move_jump`, `mutant_jump`, `mutant_check_melee`, `mutant_check_jump`, `mutant_checkattack`;
- lignes declaratives correspondantes pour `mutant_frames_attack` et `mutant_frames_jump`.

Validation:

- comparaison C vs TS effectuee pour les vecteurs d'attaque melee, les degats aleatoires `rand() % 5`, les sons hit/swing, la branche refire nightmare/melee, les distances/thinkfunc/endfunc des moves attack/jump, les etats `AS_MELEE`/`AS_MISSILE`, `AI_DUCKED`, `attack_finished`, `touch`, `groundentity`, `nextframe`, et le degat d'impact de saut;
- commentaires d'en-tete ajoutes/verifies pour les fonctions portees du lot dans `packages/game/src/m_mutant.ts`;
- runtime verifie: `SP_monster_mutant` branche `monsterinfo.attack = mutant_jump`, `monsterinfo.melee = mutant_melee`, `monsterinfo.checkattack = mutant_checkattack`; `M_MoveFrame` atteint les thinkfunc `mutant_hit_left`, `mutant_hit_right`, `mutant_check_refire`, `mutant_jump_takeoff` et `mutant_check_landing`; `g_save.ts` retrouve les callbacks/moves exportes;
- `apps/web` verifie via le flux full-game: le navigateur declenche le runtime porte et consomme snapshots/sons sans logique parallele mutant;
- `renderer-three` verifie via le flux full-game/Three: les sorties visibles attendues du lot sont modele/frames/oldframe du mutant, sons et effet gameplay du saut via snapshots client; elles sont consommees par les adapters refresh/MD2 generiques, sans branche specifique mutant attendue.

Artefacts matrice:

- `damage` marque `Non applicable`: variable locale de `mutant_jump_touch`, pas une entite proprietaire.
- `distance` marque `Non applicable`: variable locale de `mutant_check_jump`, pas une entite proprietaire.

## Tests lances

- `npm run verify:m-mutant`
- `npm run verify:m-mutant:source-parity`
- `npm run verify:m-mutant:header`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npm run typecheck`
- `git diff --check`

## Prochain lot recommande

Continuer avec le bloc pain: `mutant_frames_pain1`, `mutant_move_pain1`, `mutant_frames_pain2`, `mutant_move_pain2`, `mutant_frames_pain3`, `mutant_move_pain3`, `mutant_pain`, puis la variable locale `r`.

## Historique

### Lot initial

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

### Prochain lot recommande precedent

Continuer avec le bloc melee/attack: `mutant_hit_left`, `mutant_hit_right`, `mutant_check_refire`, `mutant_frames_attack`, `mutant_move_attack`, `mutant_melee`, puis seulement inclure le debut du jump si le lot reste coherent.

## Blocages

Aucun blocage ouvert pour le lot valide.
