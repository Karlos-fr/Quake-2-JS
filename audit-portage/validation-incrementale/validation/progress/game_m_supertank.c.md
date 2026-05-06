# Progress - Quake-2-master/game/m_supertank.c

## Etat courant

- Statut: En cours
- Dernier lot valide: globals sons (`sound_pain1/2/3`, `sound_death`, `sound_search1/2`, `tread_sound`), fonctions initiales (`BossExplode`, `TreadSound`, `supertank_search`, `supertank_dead`, `supertankRocket`, `supertankMachineGun`, `supertank_reattack1`) et bloc stand/run/forward (`supertank_frames_stand`, `supertank_move_stand`, `supertank_stand`, `supertank_frames_run`, `supertank_move_run`, `supertank_frames_forward`, `supertank_move_forward`, `supertank_forward`, `supertank_walk`, `supertank_run`), y compris lignes declaratives dupliquees pour les tables stand/run/forward.
- Lignes matrice validees dans cette session: 35.

## Preuves obtenues

- Comparaison C vs TS: `Quake-2-master/game/m_supertank.c` contre `packages/game/src/m_supertank.ts`.
- Ownership: port proprietaire confirme dans `packages/game/src/m_supertank.ts`; `BossExplode` est reutilise par `m_boss2.ts` et `m_boss31.ts` mais reste defini et possede par `m_supertank.ts`, comme dans le port actuel.
- Commentaires d'en-tete: ajoutes/verifies pour `TreadSound`, `supertank_search`, `supertank_stand`, `supertank_forward`, `supertank_walk`, `supertank_run`, `supertank_reattack1`, `supertankRocket`, `supertankMachineGun`, `supertank_dead`, `BossExplode`.
- Runtime: spawn `monster_supertank` branche par `ED_CallSpawn`/`g_spawn.ts`; callbacks atteignables via `walkmonster_start`, `monster_think`, `M_MoveFrame` et `G_RunFrame`/think runtime. Sorties sons, muzzle flashes et temp entity explosion exposees par `GameRuntime`.
- apps/web: le flux full-game consomme le runtime via `syncLocalGameplayFrame`, `syncLocalGameplayTransientEffects` et `full-game-render-source`; pas de logique web parallele pour masquer ce lot.
- renderer-three: les sorties visibles attendues passent par `ClientRefreshFrame` puis `refresh-entity-sync`, `particle-sync`, `three-dlight-sync` et le full-game renderer; `TE_EXPLOSION1` et muzzle flashes sont consommes via client effects/local gameplay sync.

## Tests de reference

- `npm run verify:m-supertank`
- `npm run verify:m-supertank:source-parity`
- `npm run verify:m-supertank:header`
- `npm run verify:local-gameplay-sync`
- `npm run verify:cl-fx`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages

- Aucun blocage ouvert pour le lot valide.

## Prochain lot recommande

Valider le bloc turn/pain/death suivant: `supertank_frames_turn_right`, `supertank_move_turn_right`, `supertank_frames_turn_left`, `supertank_move_turn_left`, `supertank_frames_pain3`, `supertank_move_pain3`, `supertank_frames_pain2`, `supertank_move_pain2`, `supertank_frames_pain1`, `supertank_move_pain1`, `supertank_frames_death1`, `supertank_move_death`, puis `supertank_pain` si le lot reste coherent.
