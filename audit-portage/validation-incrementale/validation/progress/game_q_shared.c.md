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

## Session 2026-05-06 - parse et page-in

- Lot traite: `va`, `COM_Parse`, `Com_PageInMemory`, le global `paged_total`, et les temporaires associes `argptr`, `string`, `com_token`, `c`, `len`, `data`, `i`.
- Comparaison C/H vs TS: bloc compare dans `Quake-2-master/game/q_shared.c`, `packages/qcommon/src/common.ts` et `packages/qcommon/src/system.ts`; `COM_Parse` garde le tokenizer C via un couple `{ token, nextIndex }`, et `Com_PageInMemory` garde le pas `size - 1`, puis `-4096`, avec accumulation dans `SystemRuntime.paged_total`.
- Commentaires d'en-tete: commentaires verifies pour `COM_Parse`, `va`, `Com_PageInMemory`; `va` documente l'ecart volontaire d'absence de buffer statique reusable.
- Runtime: `COM_Parse` est atteint par le chargement d'entites `g_spawn`; `Com_PageInMemory` est atteint par `snd_dma` lors du chargement cache son; `va` reste un helper exporte sans racine obligatoire tant qu'aucun appel runtime ne l'exige.
- apps/web: les flux web full-game consomment le parsing d'entites via le runtime serveur; `Com_PageInMemory` est disponible via le contexte system/audio client, sans logique web parallele attendue.
- renderer-three: pas de sortie visible directe produite par `va` ou `Com_PageInMemory`; `COM_Parse` peut conditionner les entites map chargees en amont, et les sorties visibles restent relayees par le pipeline serveur/client/renderer existant.
- Corrections appliquees: `va` emule maintenant les formats `printf` courants du port au lieu de concatener les fragments; tests limites ajoutes pour `COM_Parse` et le pas de page de `Com_PageInMemory`.
- Tests lances: `npm run verify:q-shared:header` OK; `npm run typecheck` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:server:ents` OK; `npm run verify:snd-dma` OK.
- Decision matrice: 4 entrees `Valide`; 7 entrees generees `Non applicable` car variables locales, buffers statiques C remplaces par retours explicites TS ou variable d'iteration locale.

## Session 2026-05-06 - comparateurs et Com_sprintf

- Lot traite: `Q_stricmp`, `_stricmp`, `Q_strncasecmp`, `Q_strcasecmp`, la seconde entree generee `Q_strncasecmp`, `Com_sprintf`, et les temporaires `len`, `argptr`, `bigbuffer`.
- Comparaison C/H vs TS: bloc compare dans `Quake-2-master/game/q_shared.c`, declarations dans `Quake-2-master/game/q_shared.h`, cible `packages/qcommon/src/common.ts`; `Q_strncasecmp` garde le pliage ASCII C et le retour `-1`/`0`, `Q_strcasecmp` conserve la borne `99999`, `Q_stricmp` reste un alias portable, et `Com_sprintf` represente le couple `vsprintf`/`strncpy(dest, size - 1)` par une chaine deja materialisee bornee a `size - 1`.
- Commentaires d'en-tete: commentaires verifies pour `Q_stricmp`, `Q_strncasecmp`, `Q_strcasecmp` et `Com_sprintf`; ils indiquent `Original name`, `Source: game/q_shared.c`, `Category: Ported`, `Fidelity level` et les notes de portage utiles.
- Ownership et doublons: ownership conserve dans `packages/qcommon/src/common.ts`; `_stricmp` retire de la matrice car c'est un appel externe WIN32/libc, pas une entite definie dans `q_shared.c`; la seconde entree `Q_strncasecmp` est classee `Non applicable` comme doublon genere.
- Runtime: `Q_stricmp` est maintenant consomme par les comparateurs runtime de `packages/qcommon/src/cmd.ts`, `packages/game/src/g_cmds.ts`, `g_items.ts`, `g_main.ts`, `g_spawn.ts`, `g_svcmds.ts`, `g_target.ts`, `g_utils.ts`, `m_flyer.ts` et `p_client.ts`; `Com_sprintf` reste exporte et utilise par le chargement modele/texture du renderer.
- apps/web: pas de logique web parallele attendue pour ces helpers; les flux web les atteignent via les commandes/full-game runtime et via la source de rendu full-game.
- renderer-three: `Com_sprintf` est consomme par `packages/renderer-three/src/gl-model-loader.ts` pour produire les chemins `maps/*.bsp` et `textures/*.wal`, donc les sorties visibles modeles/images restent branchees; les comparateurs `Q_str*` ne produisent pas de sortie visible directe.
- Corrections appliquees: `Q_strncasecmp` corrige pour ne traiter que `count === 0` comme borne, ce qui preserve le comportement C pour `count < 0`; tests ajoutes pour `Q_strncasecmp` zero/negatif et `Com_sprintf`; comparateurs runtime locaux raccordes a `Q_stricmp`.
- Tests lances: `npm run verify:q-shared:header` OK; `npm run verify:cmd` OK; `npm run verify:g-cmds` OK; `npm run verify:g-items` OK; `npm run verify:g-svcmds` OK; `npm run verify:g-main` OK; `npm run verify:g-spawn` OK; `npm run verify:g-target` OK; `npm run verify:g-utils` OK; `npm run verify:p-client` OK; `npm run verify:m-flyer` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:gameplay` OK; `npm run typecheck` OK.
- Decision matrice: 4 entrees `Valide`, 4 entrees `Non applicable`, et 1 ligne externe `_stricmp` retiree de la matrice du fichier courant.

## Prochain lot recommande

Traiter `Info_ValueForKey`, `Info_RemoveKey`, `Info_Validate`, `Info_SetValueForKey` et leurs temporaires/faux positifs (`pkey`, `valueindex`, `o`, `start`, `value`, `c`, `maxsize`) en gardant `Info_Print` pour une session separee si le lot devient trop large.
