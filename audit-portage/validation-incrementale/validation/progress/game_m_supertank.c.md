# Progress - Quake-2-master/game/m_supertank.c

## Etat courant

- Statut: Termine
- Dernier lot valide: fin du fichier `m_supertank.c`: blocs turn/pain/death/backward/attack/end-attack, `supertank_pain`, `supertank_attack`, `supertank_die`, `SP_monster_supertank`, et lignes declaratives associees.
- Lignes matrice validees dans cette session: 52 nouvelles lignes; matrice finale: 87 lignes `Valide`.

## Preuves obtenues

- Comparaison C vs TS: `Quake-2-master/game/m_supertank.c` contre `packages/game/src/m_supertank.ts`.
- Ownership: port proprietaire confirme dans `packages/game/src/m_supertank.ts`; `BossExplode` est reutilise par `m_boss2.ts` et `m_boss31.ts` mais reste defini et possede par `m_supertank.ts`, comme dans le port actuel.
- Commentaires d'en-tete: ajoutes/verifies pour `TreadSound`, `supertank_search`, `supertank_stand`, `supertank_forward`, `supertank_walk`, `supertank_run`, `supertank_reattack1`, `supertank_pain`, `supertankRocket`, `supertankMachineGun`, `supertank_attack`, `supertank_dead`, `BossExplode`, `supertank_die`, `SP_monster_supertank`.
- Runtime: spawn `monster_supertank` branche par `ED_CallSpawn`/`g_spawn.ts`; callbacks atteignables via `walkmonster_start`, `monster_think`, `M_MoveFrame` et `G_RunFrame`/think runtime. Sorties sons, muzzle flashes et temp entity explosion exposees par `GameRuntime`.
- apps/web: le flux full-game consomme le runtime via `syncLocalGameplayFrame`, `syncLocalGameplayTransientEffects` et `full-game-render-source`; pas de logique web parallele pour masquer ce lot.
- renderer-three: les sorties visibles attendues passent par `ClientRefreshFrame` puis `refresh-entity-sync`, `particle-sync`, `three-dlight-sync` et le full-game renderer; `TE_EXPLOSION1` et muzzle flashes sont consommes via client effects/local gameplay sync.
- Decisions importantes: les lignes de matrice `flash_number`, `range` et `n` ont ete retirees car elles correspondent uniquement a des variables locales C internes a `supertankRocket`, `supertankMachineGun`, `supertank_attack` et `BossExplode`, pas a des entites source proprietaires autonomes.

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

Aucun lot restant dans `game_m_supertank.c.md`: toutes les lignes sont `Valide`.
