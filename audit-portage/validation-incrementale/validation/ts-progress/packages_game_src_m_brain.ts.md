# Progress TS - packages/game/src/m_brain.ts

- Statut: En cours
- Dernier lot valide: `FRAME_pain201` a `FRAME_defens08` (53 constantes de frames).
- Prochain lot recommande: poursuivre avec `FRAME_stand01` a `FRAME_stand60`.

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
## Tests

- Non lances: aucune correction de code ni d'import; mise a jour documentaire TS uniquement.

## Blocages

- Aucun.
