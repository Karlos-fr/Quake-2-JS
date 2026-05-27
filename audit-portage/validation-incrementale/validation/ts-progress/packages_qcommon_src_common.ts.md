# Progress TS - packages/qcommon/src/common.ts

## Etat courant

- Statut: Termine
- Symboles TS: 40
- Couvert C/H: 34
- Reste a auditer: 0
- Doublons: 0
- Ownership suspect: 0
- Entetes incomplets: 0

## Lot valide - session courante

- Lot: ensemble de la matrice `packages/qcommon/src/common.ts` (40 symboles), priorite aux lignes `A verifier`, `Ownership suspect`, `Entete incomplet` et `TS sans lien source`.
- Verdict:
  - 34 symboles marques `Couvert C/H` apres controle des matrices `qcommon_common.c.md` et `game_q_shared.c.md`.
  - 6 symboles `Category: New` marques `Valide` avec `Original name: N/A` et `Source declaree: N/A (<raison courte>)`.
- Corrections:
  - Ajout des metadonnees d'en-tete pour `MAX_NUM_ARGVS`, `CommonRuntime`, `ComParseResult`, `createCommonRuntime`, `parseInfoString`, `isLittleEndianHost` et `foldAsciiUpper`.
  - Mise a jour de la matrice TS pour supprimer les statuts `A verifier`, `Ownership suspect` et `Entete incomplet`.
- Ownership:
  - Les helpers issus de `game/q_shared.c` restent proprietaires dans `packages/qcommon/src/common.ts`: la matrice C/H `game_q_shared.c.md` les designe deja comme cibles TS, et ce sont des utilitaires shared consommes par client/server/game.
  - Aucun doublon proprietaire TS concurrent n'a ete trouve pour les symboles de ce lot.
- Integration:
  - Runtime qcommon: `createQcommonRuntime` initialise `CommonRuntime`; `cmd.ts`, `cvar.ts`, `qcommon.ts`, client, server et game consomment les helpers exposes.
  - apps/web: consommation indirecte via full-game command parsing/runtime; pas d'adapter web parallele proprietaire detecte.
  - renderer-three: consommation limitee a des helpers shared (`Com_sprintf` via chargement BSP); pas de sortie renderer propre a valider dans ce fichier.

## Tests de reference

- `npm run verify:qcommon:header`
- `npm run verify:q-shared:header`
- `npm run verify:cvar`
- `npm run typecheck`

## Prochain lot recommande

- Aucun pour cette matrice TS.
