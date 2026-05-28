# Progress - Quake-2-master/qcommon/crc.h

## Session courante

- Lot traite: fichier complet `qcommon/crc.h`, soit les quatre prototypes `CRC_Init`, `CRC_ProcessByte`, `CRC_Value` et `CRC_Block`.
- Comparaison C/H vs TS: declarations consultees dans `Quake-2-master/qcommon/crc.h`, implementation de reference consultee dans `Quake-2-master/qcommon/crc.c`, cible proprietaire verifiee dans `packages/qcommon/src/qcommon.ts`, export package verifie dans `packages/qcommon/src/index.ts`.
- Commentaires d'en-tete: mis a jour dans `packages/qcommon/src/qcommon.ts` pour declarer `Source: qcommon/crc.h / qcommon/crc.c`; adaptation TS de `CRC_Init` et `CRC_ProcessByte` documentee, car elles retournent le CRC au lieu de muter un pointeur `unsigned short *`.
- Ownership et doublons: cible proprietaire `packages/qcommon/src/qcommon.ts` coherente avec le rattachement qcommon existant; aucun doublon proprietaire trouve dans `packages`, `apps` ou `scripts`.
- Runtime: integre. `CRC_Block` est appele par `COM_BlockSequenceCRCByte`; flux atteint depuis `packages/client/src/cl_input.ts` (`CL_SendCmd`) et `packages/server/src/sv_user.ts` (`SV_ExecuteClientMessage`).
- apps/web: integre indirectement. Le navigateur utilise le runtime client/serveur et le transport local dans `apps/web`, qui conserve le flux qcommon/netchan sans reimplementation parallele CRC.
- renderer-three: non applicable justifie. Les API CRC ne produisent ni entites visibles, ni modeles/frames/images, ni particules/beams/dlights/temp entities/areabits/camera/scene; aucune consommation renderer attendue.
- Tests prevus/lances: `npm run verify:crc:header`, `npm run verify:crc`, `npm run verify:qcommon:header`, `npm run typecheck`.
- Decision matrice: 4 entrees `Valide`.

## Prochain lot recommande

Aucun lot restant dans `qcommon/crc.h`; le coordinateur peut marquer ce fichier termine dans `AVANCEMENT_GLOBAL.md`.

## Session 2026-05-28 - redecoupage lot 1

- Lot traite: redecoupage de la cible principale du header CRC.
- Correction appliquee: les prototypes `CRC_Init`, `CRC_ProcessByte`, `CRC_Value` et `CRC_Block` sont maintenant rattaches a `packages/qcommon/src/crc.ts`.
- Export package: `packages/qcommon/src/index.ts` reexporte les API `CRC_*` depuis `./crc.js`.
- Matrice: `qcommon_crc.h.md` mise a jour vers `packages/qcommon/src/crc.ts`, verdict `strict-ok`.
- Validations lancees: `npm run typecheck` OK; `npm run build --workspace @quake2js/web` OK.
- Controle de rattachement: `qcommon/crc.h` possede maintenant une cible TS principale au meme basename.
