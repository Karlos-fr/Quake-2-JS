# Progress - Quake-2-master/qcommon/crc.c

## Session 2026-05-06

- Lot traite: fichier complet `crc.c`, incluant `CRC_INIT_VALUE`, `CRC_XOR_VALUE`, `crctable`, `CRC_Init`, `CRC_ProcessByte`, `CRC_Value`, `CRC_Block` et la variable locale `crc`.
- Comparaison C/H vs TS: bloc compare dans `Quake-2-master/qcommon/crc.c`, declaration associee consultee dans `Quake-2-master/qcommon/crc.h`, cible proprietaire verifiee dans `packages/qcommon/src/qcommon.ts`.
- Commentaires d'en-tete: fonctions `CRC_*` verifiees avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement; commentaire ajoute pour les constantes/table internes du bloc CRC.
- Runtime: integre. `CRC_Block` est appele par `COM_BlockSequenceCRCByte`, lui-meme atteint par le flux normal client input (`CL_SendCmd`) et serveur usercmd (`SV_ExecuteClientMessage`).
- apps/web: integre via le runtime full-game/authoritative input; le navigateur n'a pas de logique CRC parallele attendue et passe par le runtime client/serveur porte.
- renderer-three: non applicable. Le CRC ne produit aucune sortie visible de type modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene.
- Corrections appliquees: commentaire de bloc CRC ajoute dans `packages/qcommon/src/qcommon.ts`; tests `scripts/verify/quake2-crc.ts` renforces avec reference bit-a-bit CCITT/XMODEM, seed final-xor, bloc vide et fixtures multi-octets.
- Tests lances: `npm run verify:crc` OK; `npm run verify:crc:header` OK; `npm run verify:qcommon:header` OK; `npm run typecheck` OK; `npm run verify:cl-input` OK; `npm run verify:server:user` OK; `npm run verify:full-game:authoritative-input` OK.
- Decision matrice: 7 entrees `Valide`; 1 entree `Non applicable` car `crc` est une variable locale C de `CRC_Block`.

## Prochain lot recommande

Aucun lot restant dans `qcommon/crc.c`; auditer `qcommon/crc.h` dans une session separee si le coordinateur veut fermer l'API header.

## Session 2026-05-28 - redecoupage lot 1

- Lot traite: redecoupage de la cible principale CRC.
- Correction appliquee: creation de `packages/qcommon/src/crc.ts` comme point de rattachement principal pour `qcommon/crc.c` et `qcommon/crc.h`.
- Deplacement: `CRC_INIT_VALUE`, `CRC_XOR_VALUE`, `crcTable`, `CRC_Init`, `CRC_ProcessByte`, `CRC_Value` et `CRC_Block` sortis de `packages/qcommon/src/qcommon.ts`.
- Raccord conservatoire: `packages/qcommon/src/qcommon.ts` importe maintenant `CRC_Block` depuis `./crc.js` pour `COM_BlockSequenceCRCByte`, qui reste proprietaire de `qcommon/common.c`.
- Export package: `packages/qcommon/src/index.ts` reexporte les API `CRC_*` depuis `./crc.js`.
- Matrice: `qcommon_crc.c.md` mise a jour vers `packages/qcommon/src/crc.ts`, verdict `strict-ok`.
- Validations lancees: `npm run typecheck` OK; `npm run build --workspace @quake2js/web` OK.
- Controle de rattachement: le nombre de matrices sans cible TS au meme basename passe de 8 a 6.
