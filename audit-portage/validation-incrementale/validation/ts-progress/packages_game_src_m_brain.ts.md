# Progress TS - packages/game/src/m_brain.ts

- Statut: Termine
- Dernier lot valide: lot elargi final `MODEL_SCALE` a `randomInt` (84 symboles restants).
- Prochain lot recommande: aucun dans la matrice TS actuelle; les lignes restantes sont deja classees `Valide` hors C/H par validations anterieures.


## Preuves de session

- Matrice TS lue: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_brain.ts.md`.
- Matrice C/H lue: `audit-portage/validation-incrementale/validation/matrices/game_m_brain.h.md`.
- Sources C/H lues: `Quake-2-master/game/m_brain.h`.
- Fichier TS lu: `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_walk101|Original name: FRAME_walk101|FRAME_walk113" packages audit-portage/validation-incrementale/validation/ts-matrices audit-portage/validation-incrementale/validation/ts-progress`.
- Lot `FRAME_walk201` a `FRAME_walk240`: valeurs TS comparees aux macros `Quake-2-master/game/m_brain.h` (`13` a `52`).
- Matrice C/H `game_m_brain.h.md`: lignes `FRAME_walk201` a `FRAME_walk240` deja `Valide`, proprietaire `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_walk20[1-9]|FRAME_walk2[1-3][0-9]|FRAME_walk240" packages audit-portage/validation-incrementale/validation/ts-matrices -g "*.ts" -g "*.md"`.
- Lot `FRAME_attak101` a `FRAME_attak118`: valeurs TS comparees aux macros `Quake-2-master/game/m_brain.h` (`53` a `70`).
- Matrice C/H `game_m_brain.h.md`: lignes `FRAME_attak101` a `FRAME_attak118` deja `Valide`, proprietaire `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_attak10[1-9]|FRAME_attak11[0-8]|Original name: FRAME_attak10|Original name: FRAME_attak11" packages audit-portage/validation-incrementale/validation/ts-matrices -g "*.ts" -g "*.md"`.
- Lot `FRAME_attak201` a `FRAME_attak208`: valeurs TS comparees aux macros `Quake-2-master/game/m_brain.h` (`71` a `78`).
- Matrice C/H `game_m_brain.h.md`: lignes `FRAME_attak201` a `FRAME_attak208` deja `Valide`, proprietaire `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_attak20[1-8]|Original name: FRAME_attak20[1-8]" packages audit-portage/validation-incrementale/validation/ts-matrices -g "*.ts" -g "*.md"`.

- Lot `FRAME_attak209` a `FRAME_attak217`: valeurs TS comparees aux macros `Quake-2-master/game/m_brain.h` (`79` a `87`).
- Matrice C/H `game_m_brain.h.md`: lignes `FRAME_attak209` a `FRAME_attak217` deja `Valide`, proprietaire `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_attak20[9]|FRAME_attak21[0-7]|Original name: FRAME_attak20[9]|Original name: FRAME_attak21[0-7]" packages audit-portage/validation-incrementale/validation/ts-matrices -g "*.ts" -g "*.md"`.
- Lot `FRAME_pain101` a `FRAME_pain121`: valeurs TS comparees aux macros `Quake-2-master/game/m_brain.h` (`88` a `108`).
- Matrice C/H `game_m_brain.h.md`: lignes `FRAME_pain101` a `FRAME_pain121` deja `Valide`, proprietaire `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_pain10[1-9]|FRAME_pain11[0-9]|FRAME_pain12[0-1]|Original name: FRAME_pain10[1-9]|Original name: FRAME_pain11[0-9]|Original name: FRAME_pain12[0-1]" packages audit-portage/validation-incrementale/validation/ts-matrices -g "*.ts" -g "*.md"`.
- Lot `FRAME_pain201` a `FRAME_defens08`: valeurs TS comparees aux macros `Quake-2-master/game/m_brain.h` (`109` a `161`) pour les familles `pain201-208`, `pain301-306`, `death101-118`, `death201-205`, `duck01-08`, `defens01-08`.
- Matrice C/H `game_m_brain.h.md`: lignes `FRAME_pain201` a `FRAME_defens08` deja `Valide`, proprietaire `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_pain20[1-8]|FRAME_pain30[1-6]|FRAME_death10[1-9]|FRAME_death11[0-8]|FRAME_death20[1-5]|FRAME_duck0[1-8]|FRAME_defens0[1-8]" packages audit-portage/validation-incrementale/validation/ts-matrices -g "*.ts" -g "*.md"`.
- Lot `FRAME_stand01` a `FRAME_stand60`: valeurs TS comparees aux macros `Quake-2-master/game/m_brain.h` (`162` a `221`).
- Matrice C/H `game_m_brain.h.md`: lignes `FRAME_stand01` a `FRAME_stand60` deja `Valide`, proprietaire `packages/game/src/m_brain.ts`.
- Recherche doublons: `rg "FRAME_stand0[1-9]|FRAME_stand[1-5][0-9]|FRAME_stand60|Original name: FRAME_stand" packages audit-portage/validation-incrementale/validation/ts-matrices -g "*.ts" -g "*.md"`.
## Decisions

- `FRAME_walk101` a `FRAME_walk113` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Le doublon nominal avec `packages/game/src/m_soldier.ts` n'est pas un doublon de portage pour ce lot: source/proprietaire distincts (`m_brain.h` vs `m_soldier`).
- Aucun code `Category: New` dans ce lot.
- `FRAME_walk201` a `FRAME_walk240` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Les homonymes releves dans `packages/game/src/m_boss32.ts` et `packages/game/src/m_soldier.ts` relevent de leurs propres headers/monstres; pas de doublon meme `Original name` + meme `Source declaree` pour ce lot `m_brain`.
- `FRAME_attak101` a `FRAME_attak118` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Les homonymes releves dans d'autres monstres (`m_boss31`, `m_boss32`, `m_chick`, `m_float`, `m_flyer`, `m_gunner`, `m_hover`, `m_infantry`, `m_soldier`, `m_tank`) relevent de leurs propres headers/monstres; pas de doublon meme `Original name` + meme `Source declaree` pour ce lot `m_brain`.
- `FRAME_attak201` a `FRAME_attak208` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Les homonymes releves dans d'autres monstres (`m_boss31`, `m_boss32`, `m_chick`, `m_float`, `m_flyer`, `m_gunner`, `m_infantry`, `m_soldier`, `m_tank`) relevent de leurs propres headers/monstres; pas de doublon meme `Original name` + meme `Source declaree` pour ce lot `m_brain`.

- `FRAME_attak209` a `FRAME_attak217` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Les homonymes releves dans d'autres monstres (`m_boss32`, `m_chick`, `m_flyer`, `m_float`, `m_gunner`, `m_soldier`) relevent de leurs propres headers/monstres; pas de doublon meme `Original name` + meme `Source declaree` pour ce lot `m_brain`.
- `FRAME_pain101` a `FRAME_pain121` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Les homonymes releves dans d'autres monstres (`m_actor`, `m_boss31`, `m_boss32`, `m_chick`, `m_float`, `m_flyer`, `m_gunner`, `m_hover`, `m_infantry`, `m_parasite`, `m_mutant`, `m_player`, `m_soldier`, `m_tank`) relevent de leurs propres headers/monstres; pas de doublon meme `Original name` + meme `Source declaree` pour ce lot `m_brain`.
- `FRAME_pain201` a `FRAME_defens08` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Les homonymes releves dans d'autres monstres (`m_actor`, `m_boss31`, `m_boss32`, `m_chick`, `m_float`, `m_flyer`, `m_gunner`, `m_hover`, `m_infantry`, `m_mutant`, `m_parasite`, `m_player`, `m_soldier`, `m_tank`) relevent de leurs propres headers/monstres; pas de doublon meme `Original name` + meme `Source declaree` pour ce lot `m_brain`.
- `FRAME_stand01` a `FRAME_stand60` sont les proprietaires TS attendus des macros homonymes de `Quake-2-master/game/m_brain.h`, deja marquees `Valide` dans la matrice C/H `game_m_brain.h.md`.
- Les homonymes releves dans d'autres monstres (`m_actor`, `m_boss2`, `m_boss31`, `m_boss32`, `m_mutant`, `m_soldier`) relevent de leurs propres headers/monstres; pas de doublon meme `Original name` + meme `Source declaree` pour ce lot `m_brain`.
## Tests

- Non lances: aucune correction de code ni d'import; mise a jour documentaire TS uniquement.

## Blocages

- Aucun.

## Session 2026-05-27 - lot elargi final

- Lot: `MODEL_SCALE`, `BRAIN_TENTACLE_REATTACK`, constantes `SOUND_*`, handles `sound_*`, fonctions/moves/tables `brain_*`, `SP_monster_brain`, et helpers locaux `makeFrames`, `indexedThinks`, `precacheBrainAssets`, `soundOptions`, `setVec3`, `randomInt`.
- Verdicts: `Couvert C/H` pour `MODEL_SCALE`, les constantes `SOUND_*`, les fonctions/moves/tables `brain_*` et `SP_monster_brain`; `Valide` / `Hors C/H` pour les 21 entites `Category: New`.
- Preuves: matrices C/H `game_m_brain.h.md` et `game_m_brain.c.md` lues; entites C/H marquees `Valide` avec proprietaire attendu `packages/game/src/m_brain.ts`; conventions de sons croisees avec `m_berserk` (`SOUND_*` proprietaires des globals C `sound_*`, handles `sound_*` TS en `New`); ownership package `packages/game` conforme au module source `game`; aucun champ `Original name` ou `Source declaree` laisse vide pour les entites `New`.
- Corrections: commentaires d'entete ajoutes dans `packages/game/src/m_brain.ts` pour `BRAIN_TENTACLE_REATTACK`, le groupe des handles runtime `sound_*`, et les helpers locaux `makeFrames`, `indexedThinks`, `precacheBrainAssets`, `soundOptions`, `setVec3`, `randomInt`; matrice TS mise a jour a 306 symboles, 285 `Couvert C/H`, 0 `A verifier`.
- Integration runtime/apps-web/renderer-three: runtime integre via callbacks `monsterinfo`, moves `GameMonsterMove`, precache/register sound/model et `walkmonster_start` depuis `SP_monster_brain`; `apps/web` consomme le runtime porte sans logique parallele attendue pour ce monstre; `renderer-three` consomme les entites/modeles/frames produits par le runtime, aucune integration renderer specifique supplementaire n'est attendue pour ce lot.
- Tests: `npm run verify:m-brain:header`, `npm run verify:m-brain:source-parity`, `npm run typecheck`, `npm run verify:m-brain`.
- Prochain lot recommande: aucun dans la matrice TS actuelle; les lignes restantes sont deja classees `Valide` hors C/H par validations anterieures.
