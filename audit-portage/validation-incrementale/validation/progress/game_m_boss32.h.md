# Progress - Quake-2-master/game/m_boss32.h

## Etat courant

- Dernier lot valide: macros `FRAME_attak101` a `FRAME_attak213`.
- Verdict: `Valide` pour les 31 constantes du lot.
- Fichier TS proprietaire: `packages/game/src/m_boss32.ts`.
- Commentaire d'en-tete: commentaire de module `m_boss32.ts` verifie pour le port conjoint `game/m_boss32.h` et `game/m_boss32.c`; macros declaratives sans commentaire individuel attendu.

## Preuves de la session

- Comparaison C/H vs TS: `FRAME_attak101` a `FRAME_attak118` valent `0..17`; `FRAME_attak201` a `FRAME_attak213` valent `18..30` dans `Quake-2-master/game/m_boss32.h` et `packages/game/src/m_boss32.ts`.
- Ownership/renommage/doublons: cibles proprietaires conservees dans `packages/game/src/m_boss32.ts`, noms originaux conserves, pas de doublon proprietaire trouve dans le perimetre du lot.
- Usages/moves: les frames du lot ne sont pas consommees par les moves Makron de `m_boss32.c`; les moves Makron valides utilisent les autres familles (`attak301+`, `attak401+`, `attak501+`, etc.). Le lot reste une table declarative de frames visibles du modele rider.
- Runtime: flux attendu verifie via Jorg/Makron (`m_boss31.ts` importe `MakronPrecache`/`MakronToss`, `MakronToss` planifie `MakronSpawn`, `SP_monster_makron` initialise le modele, `M_MoveFrame` avance `s.frame`). Pas de branchement direct attendu pour ces constantes non utilisees par un move.
- `apps/web`: le navigateur consomme les frames via le runtime serveur/client et les snapshots d'entites (`full-game-server-host`, `full-game-render-source`, `packages/client/src/cl_ents.ts`); aucune logique parallele specifique a ces macros.
- `packages/renderer-three`: frames de modele visibles consommees via `refresh-entity-sync` puis interpolation MD2 dans `md2-mesh-builder`; aucune integration supplementaire specifique a ces macros.

## Tests lances

- `npm run verify:m-boss32:header` -> ok.
- `npm run verify:m-boss32:source-parity` -> ok.
- `npm run verify:m-boss32` -> ok.
- Controle cible `npx tsx -e ...` sur `FRAME_attak101` a `FRAME_attak213` contre `Quake-2-master/game/m_boss32.h` -> ok, 31 constantes.

## Blocages

- Aucun.

## Prochain lot recommande

- Continuer avec la prochaine famille coherente de macros: `FRAME_death01` a `FRAME_death50`.
