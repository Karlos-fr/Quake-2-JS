# Progress - Quake-2-master/game/m_parasite.c

- Source: `Quake-2-master/game/m_parasite.c`
- Matrice: `audit-portage/validation-incrementale/validation/matrices/game_m_parasite.c.md`
- Cible TS proprietaire: `packages/game/src/m_parasite.ts`
- Statut: En cours

## Dernier lot valide

Validation du lot initial agrandi:

- sons initiaux `sound_pain1` a `sound_search` et constantes TS `SOUND_*`;
- callbacks sonores simples `parasite_launch`, `parasite_reel_in`, `parasite_sight`, `parasite_tap`, `parasite_scratch`, `parasite_search`;
- transitions fidget/idle/stand/run/walk `parasite_end_fidget`, `parasite_do_fidget`, `parasite_refidget`, `parasite_idle`, `parasite_stand`, `parasite_start_run`, `parasite_run`, `parasite_start_walk`, `parasite_walk`;
- tables et moves associes `parasite_frames_start_fidget` a `parasite_move_stop_walk`, plus lignes declaratives correspondantes.

## Preuves obtenues

- Comparaison C/TS faite contre `Quake-2-master/game/m_parasite.c` et `packages/game/src/m_parasite.ts`.
- Ownership confirme: les entites du lot appartiennent a `packages/game/src/m_parasite.ts`; exposition publique via `packages/game/src/index.ts` verifiee.
- Runtime confirme: `SP_monster_parasite` est branche dans `packages/game/src/g_spawn.ts` pour `monster_parasite`; les callbacks sont atteignables via `walkmonster_start`, `M_MoveFrame` et `monsterinfo`.
- Save/runtime callbacks confirmes par le harness existant pour les moves/fonctions critiques deja registres dans `g_save.ts`.
- `apps/web` juge applicable indirectement: le navigateur declenche le serveur/local runtime et consomme les sons et entites via les flux full-game, sans logique parallele parasite.
- `renderer-three` juge applicable indirectement: le renderer consomme les entites visibles via `refresh-entity-sync` a partir de `modelindex`, `frame`, `oldframe` et `skinnum`; pas de branchement specifique parasite necessaire pour ce lot.
- Commentaires d'en-tete ajoutes ou verifies pour les fonctions portees du lot dans `packages/game/src/m_parasite.ts`.

## Tests lances

- `npm run verify:m-parasite`
- `npm run verify:m-parasite:source-parity`
- `npm run verify:m-parasite:header`
- `npm run typecheck`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:audio-routing`

## Blocages

- Aucun blocage ouvert pour le lot valide.

## Prochain lot recommande

Reprendre avec `parasite_frames_pain1`, `parasite_move_pain1`, `parasite_pain`, puis `parasite_drain_attack_ok`, `parasite_drain_attack`, `tr` et `damage` si le lot reste coherent.

## Session suivante - finalisation du fichier

Validation du lot final agrandi:

- douleur: `parasite_frames_pain1`, `parasite_move_pain1`, `parasite_pain`;
- attaque drain: `parasite_drain_attack_ok`, `parasite_drain_attack`, `parasite_frames_drain`, `parasite_move_drain`, plus ligne declarative;
- break/death/spawn: `parasite_frames_break`, `parasite_move_break`, `parasite_attack`, `parasite_dead`, `parasite_frames_death`, `parasite_move_death`, `parasite_die`, `SP_monster_parasite`, plus lignes declaratives;
- variables locales `tr`, `damage` et `n` classees `Non applicable`.

## Preuves obtenues - finalisation

- Comparaison C/TS faite contre `Quake-2-master/game/m_parasite.c` et `packages/game/src/m_parasite.ts`.
- Ownership confirme: le port proprietaire du lot est dans `packages/game/src/m_parasite.ts`; exports publics verifies via `packages/game/src/index.ts`.
- Commentaires d'en-tete ajoutes pour `parasite_drain_attack_ok`, `parasite_drain_attack`, `parasite_attack`, `parasite_dead`, `parasite_die` et `SP_monster_parasite`; commentaire existant de `parasite_pain` verifie.
- Runtime confirme: `SP_monster_parasite` est branche via `g_spawn.ts`; callbacks `pain`, `die`, `monsterinfo.attack` et moves sont atteignables par spawn, `G_RunFrame`/`M_MoveFrame`, combat et callbacks monsterinfo; save registry couvert par `g_save.ts`.
- `apps/web` juge applicable indirectement: le navigateur passe par le runtime full-game/local et consomme snapshots, sons et temp entities sans logique parasite parallele.
- `renderer-three` juge applicable: les sorties visibles attendues sont le modele parasite, frames/oldframe/skinnum, gibs et la temp entity `TE_PARASITE_ATTACK`; elles sont consommees par les flux render-source/Three existants, sans branche parasite specifique requise.

## Tests lances - finalisation

- `npm run verify:m-parasite`
- `npm run verify:m-parasite:source-parity`
- `npm run verify:m-parasite:header`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:audio-routing`
- `npm run verify:web-render-order`
- `npm run typecheck`

## Blocages - finalisation

- Aucun blocage ouvert pour `m_parasite.c`.

## Prochain lot recommande - finalisation

Aucun pour `m_parasite.c`: toutes les lignes sont `Valide` ou `Non applicable`.
