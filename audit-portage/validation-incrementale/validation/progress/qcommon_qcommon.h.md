# Progress - Quake-2-master/qcommon/qcommon.h

## Etat courant

- Statut: En cours
- Dernier lot valide: macros d'identite initiales `VERSION`, `BASEDIRNAME`, `BUILDSTRING` conditionnel et `CPUSTRING` conditionnel.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_qcommon.h.md`

## Derniere session

- Lot traite: 15 entrees de matrice correspondant a `VERSION`, `BASEDIRNAME`, aux 5 branches C de `BUILDSTRING` et aux 8 branches C de `CPUSTRING`.
- Source comparee: `Quake-2-master/qcommon/qcommon.h`.
- Cibles comparees: `packages/qcommon/src/qcommon.ts`, `packages/qcommon/src/protocol.ts`.
- Decision: les doublons `BUILDSTRING`/`CPUSTRING` sont des branches preprocesseur exclusives dans le header C. Le port TS conserve un seul export par nom avec un libelle portable documente en fidelity `Close`; `VERSION` et `BASEDIRNAME` restent stricts.
- Runtime: `VERSION` est consomme par les flux console/client et reponse serveur; `BASEDIRNAME` est consomme par client parse/download. `BUILDSTRING` et `CPUSTRING` sont des metadonnees exportees sans flux runtime obligatoire dans le port actuel.
- apps/web: pas d'integration directe attendue pour ces macros; `apps/web` declenche les flux qcommon/client/server qui consomment les constantes de protocole ou de version pertinentes.
- renderer-three: aucune sortie visible attendue; ces macros ne produisent ni modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ni scene.
- Commentaires: en-tetes existants verifies pour `VERSION`, `BUILDSTRING`, `CPUSTRING`; en-tete ajoute pour `BASEDIRNAME`.
- Tests lances: `npm run verify:qcommon:header`, `npm run typecheck`.

## Prochain lot recommande

- `sizebuf_s` et ses champs directs (`allowoverflow`, `overflowed`, `data`, `maxsize`, `cursize`, `readcount`) avec cible proprietaire a clarifier entre `packages/qcommon/src/qcommon.ts` et `packages/memory/src/sizebuf.ts`.
- Ensuite seulement, traiter les fonctions `SZ_*` dans une session dediee si aucun autre agent ne possede `packages/memory/src/sizebuf.ts`.

## Blocages

- Aucun.
