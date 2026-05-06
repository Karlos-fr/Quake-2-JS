# Progress - Quake-2-master/game/q_shared.c

## Session 2026-05-06

- Lot traite: debut math/vector de `DEG2RAD` a `Q_log2`, incluant `RotatePointAroundVector`, `AngleVectors`, `ProjectPointOnPlane`, `PerpendicularVector`, `R_ConcatRotations`, `R_ConcatTransforms`, `Q_fabs`, `LerpAngle`, `anglemod`, `BoxOnPlaneSide2`, `BoxOnPlaneSide`, `ClearBounds`, `AddPointToBounds`, `VectorCompare`, `VectorNormalize`, `VectorNormalize2`, `VectorMA`, `_DotProduct`, `_VectorSubtract`, `_VectorAdd`, `_VectorCopy`, `CrossProduct`, `VectorLength`, `VectorInverse`, `VectorScale` et `Q_log2`.
- Comparaison C/H vs TS: fonctions comparees dans `Quake-2-master/game/q_shared.c`, `packages/math/src/q_shared.ts` et `packages/qcommon/src/q_shared.ts`; signatures TS mutables/tuple jugees equivalentes au style out-param C.
- Commentaires d'en-tete: `packages/math/src/q_shared.ts` mis a jour pour pointer vers `game/q_shared.c` quand la fonction y est definie; commentaires `AngleVectors`/`LerpAngle` deja conformes dans `packages/qcommon/src/q_shared.ts`.
- Runtime: helpers exportes via `packages/qcommon/src/index.ts` et appeles par `PMove`, modules game/client, collision et ref_gl/renderer-three selon leur role; pas de racine autonome attendue pour ces helpers bas niveau.
- apps/web: `AngleVectors` est consomme par `apps/web/src/full-game.ts` et `apps/web/src/local-client-controller.ts`; les autres helpers du lot sont atteignables via runtime client/game/renderer, pas via une logique web parallele attendue.
- renderer-three: les helpers visibles attendus sont consommes (`AngleVectors`, `BoxOnPlaneSide`, `PerpendicularVector`, `RotatePointAroundVector`, `VectorNormalize`, `VectorMA`, `VectorScale`, `VectorLength`, etc.) par `packages/renderer-three` pour camera/frustum, entites, sprites, beams et eclairage.
- Corrections appliquees: commentaires `Source` dans `packages/math/src/q_shared.ts`; harness `scripts/verify/quake2-q-shared-header.ts` complete pour `VectorNormalize`, `VectorLength`, `VectorScale`, `VectorMA`, `CrossProduct` et corrige vers l'import `packages/math/src/q_shared.ts`.
- Tests lances: `npm run verify:q-shared:header` OK; `npm run typecheck` a d'abord echoue pendant les runs concurrents sur `packages/qcommon/src/cmd.ts(611,5)`, puis repasse OK au controle central apres consolidation.
- Decision matrice: 26 entites `Valide`; 19 entrees generees `Non applicable` car macro locale inlined, variables locales/temporaires C, declaration libc `sqrt`, ou reliquat i386 non runtime TS.

## Session 2026-05-06 - chemins et endianess

- Lot traite: helpers de chemins/extensions de `COM_SkipPath` a `COM_DefaultExtension`, puis byte order de `bigendien`/`BigShort` a `Swap_Init`, incluant `ShortSwap`, `ShortNoSwap`, `LongSwap`, `LongNoSwap`, `FloatSwap` et `FloatNoSwap`.
- Comparaison C/H vs TS: bloc compare dans `Quake-2-master/game/q_shared.c` et `packages/qcommon/src/common.ts`; les helpers TS gardent les noms C, avec retours string explicites a la place des out-buffers C pour les `COM_*`.
- Commentaires d'en-tete: commentaires existants verifies pour `COM_*`, `Big*`, `Little*` et `Swap_Init`; commentaires ajoutes pour `ShortSwap`, `ShortNoSwap`, `LongSwap`, `LongNoSwap`, `FloatSwap` et `FloatNoSwap`.
- Runtime: helpers exportes par `packages/qcommon/src/index.ts`; `LittleLong` est atteint par le flux client demo, les helpers de byte order servent au chargement/serialization bas niveau et `Swap_Init().bigendien` remplace le global C sans setup de pointeurs mutable.
- apps/web: pas de logique web parallele attendue; ces helpers sont consommes via le runtime/fichiers/assets quand le navigateur charge ou manipule les donnees Quake II.
- renderer-three: pas de sortie visible directe produite par ces helpers; les sorties visibles de modeles/images/scene passent par les loaders `memory/binary-io` et renderer existants, pas par un manque renderer de ce lot.
- Corrections appliquees: `COM_FileBase` preserve le cas C de basename d'un seul caractere; helpers endian explicites ajoutes dans `packages/qcommon/src/common.ts`; exports ajoutes dans `packages/qcommon/src/index.ts`; tests ciblees ajoutes dans `scripts/verify/quake2-q-shared-header.ts`.
- Tests lances: `npm run verify:q-shared:header` OK; `npm run typecheck` OK.
- Decision matrice: 20 entrees `Valide`; 8 entrees generees `Non applicable` car variables locales, static buffer C remplace par string TS ou union locale C.

## Prochain lot recommande

Traiter `va`, `COM_Parse` et `Com_PageInMemory`, avec les temporaires locaux associes, si le lot reste coherent.
