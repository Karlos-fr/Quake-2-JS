# Progress - Quake-2-master/game/m_boss31.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `FRAME_attak101` a `FRAME_attak213`
- Prochain lot recommande: `FRAME_death01` a `FRAME_death50`

## Session 2026-05-06 - Frames attack Jorg

- Lot traite: macros `FRAME_attak101` a `FRAME_attak213` dans `Quake-2-master/game/m_boss31.h`.
- Cible proprietaire: `packages/game/src/m_boss31.ts`; export global deja disponible via `boss31Frames` et exports nommes dans `packages/game/src/index.ts`.
- Ownership/doublons: constantes conservees sous leurs noms d'origine dans `m_boss31.ts`; aucun doublon proprietaire detecte pour ce lot.
- Parite C/H vs TS: valeurs C `0..30` comparees aux exports TS; usages verifies dans `jorg_move_start_attack1`, `jorg_move_attack1`, `jorg_move_end_attack1`, `jorg_move_attack2` et dans les bornes anti-pain de `jorg_pain`.
- Commentaires: commentaire de module `m_boss31.ts` verifie pour le port des constantes de header generees; les entites du lot sont des macros declaratives.
- Runtime: `monster_jorg` est route par `ED_CallSpawn`, `SP_monster_jorg` initialise le monstre, `jorg_attack` selectionne les moves, `M_MoveFrame` avance `s.frame` et declenche les callbacks attack; aucune integration runtime manquante pour ce lot.
- apps/web: pas de logique parallele attendue pour ces macros; le navigateur consomme le flux via runtime full-game, snapshots serveur et etats d'entites.
- renderer-three: frames visibles attendues via les champs d'entite/model frame, pas par reference directe aux constantes; le renderer consomme les sorties de snapshots/refresh entities et les tests renderer/full-game passes couvrent ce flux d'adaptation.

## Tests de reference

- `npm run verify:m-boss31:header` -> ok
- `npm run verify:m-boss31:source-parity` -> ok
- `npm run verify:m-boss31` -> ok
- `npm run verify:full-game:server-snapshots` -> ok
- `npm run verify:full-game:three-renderer` -> ok
- `npm run verify:entities:phase11` -> ok

## Blocages

- Aucun blocage ouvert pour le lot valide.
