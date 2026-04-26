# Inventaire Portage Quake II - client/anorms.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/anorms.h`
- Sources C/H secondaires : `Quake-2-master/qcommon/common.c`, `Quake-2-master/client/cl_tent.c`, `Quake-2-master/client/cl_fx.c`, copies `ref_gl/anorms.h` et `ref_soft/anorms.h`
- Package cible principal : `packages/qcommon`
- Fichier TS principal pressenti : `packages/qcommon/src/anorms.ts`
- Fichiers TS secondaires pressentis : `packages/qcommon/src/messages.ts`, `packages/qcommon/src/index.ts`, `packages/client/src/parse.ts`, `packages/client/src/tent.ts`
- Domaine : table canonique de normales encodees Quake II, directions byte pour reseau/temp entities/model normals
- Niveau de fidelite attendu : Strict pour les 162 vecteurs et leur ordre
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 header C = 1 fichier TS principal`
- Exception de decoupage documentee : rattachement dans `packages/qcommon/src/anorms.ts` au lieu de `packages/client`, car le C inclut `client/anorms.h` dans `qcommon/common.c` pour `bytedirs`.
- Justification si `1 fichier C != 1 fichier TS` : le comportement principal est centralise dans `anorms.ts`; `messages.ts`, `parse.ts` et `tent.ts` ne sont que consommateurs.

## Inventaire source

### Fonctions

- [x] Nom : aucune fonction source
  - Source : `client/anorms.h`
  - Role : header d'initialiseur uniquement.
  - Cible TS pressentie : non applicable
  - Statut : confirme
  - Notes : le helper TS `DirFromByte` est nouveau et subordonne a la table.

### Structures / types

- [x] Nom : initialiseur `vec3_t bytedirs[NUMVERTEXNORMALS]`
  - Source : `qcommon/common.c:272` inclut `client/anorms.h`
  - Role : table de 162 directions normalisees indexees par byte.
  - Representation TS pressentie : `BYTE_DIRS: readonly vec3_t[]`
  - Statut : porte Strict
  - Notes : les 162 entrees source correspondent aux 162 premieres entrees parsees dans `anorms.ts`.

- [x] Nom : `vec3_t`
  - Source : `qcommon/q_shared.h`
  - Role : triplet flottant x/y/z.
  - Representation TS pressentie : `vec3_t` dans `q-shared.ts`
  - Statut : consomme
  - Notes : chaque entree est un tuple de trois nombres.

### Enums / constantes / flags / macros utiles

- [x] Nom : `NUMVERTEXNORMALS`
  - Source : `qcommon/common.c`, `ref_gl/gl_mesh.c`, `ref_soft/r_alias.c`
  - Valeur / role : `162`, taille de table.
  - Cible TS pressentie : `BYTE_DIRS.length`, `NUMVERTEXNORMALS` dans `qcommon.ts`
  - Statut : porte/consomme
  - Notes : le harnais verifie `BYTE_DIRS.length === 162`.

- [x] Nom : `bytedirs`
  - Source : `qcommon/common.c:272`
  - Valeur / role : nom source de la table runtime qcommon.
  - Cible TS pressentie : `BYTE_DIRS`
  - Statut : renomme documente
  - Notes : nom TS explicite et exporte depuis `qcommon`.

- [x] Nom : valeurs flottantes de directions
  - Source : `client/anorms.h:20-181`
  - Valeur / role : 162 vecteurs unitaires approximes.
  - Cible TS pressentie : `BYTE_DIRS`
  - Statut : porte Strict
  - Notes : ordre et precision decimale conserves.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `client/anorms.h` initializer | table | `packages/qcommon/src/anorms.ts` | `BYTE_DIRS` | OK Strict | 162 entrees identiques |
| `bytedirs` | global C cree par include | `packages/qcommon/src/anorms.ts` | `BYTE_DIRS` | OK Close | nom modernise |
| `NUMVERTEXNORMALS` | constante | `packages/qcommon/src/qcommon.ts` / `anorms.ts` | `NUMVERTEXNORMALS`, `BYTE_DIRS.length` | OK | valeur 162 |
| acces byte direction | helper nouveau | `packages/qcommon/src/anorms.ts` | `DirFromByte` | OK avec ecart | copie + fallback documente |
| `MSG_WriteDir` usage | consommateur qcommon | `packages/qcommon/src/messages.ts` | `MSG_WriteDir` | OK | quantization par dot product |
| `MSG_ReadDir` usage | consommateur qcommon | `packages/qcommon/src/messages.ts` | `MSG_ReadDir` | OK | range check puis copie |
| temp entities direction byte | consommateur client | `packages/client/src/parse.ts`, `packages/client/src/tent.ts` | `DirFromByte` | OK | particules/impacts/sustains |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/qcommon/src/messages.ts`, `packages/qcommon/src/index.ts`
- Client : `packages/client/src/parse.ts`, `packages/client/src/tent.ts`, temp entities/effects
- Server : `packages/server/src/sv_game.ts` via `MSG_WriteDir`
- Renderer common : indirect, via donnees client et renderer adapters
- Renderer three : indirect, via sorties refresh client
- Web / platform : indirect, via pipeline client/renderer
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-anorms.ts`, `scripts/verify/quake2-qcommon-header.ts`
