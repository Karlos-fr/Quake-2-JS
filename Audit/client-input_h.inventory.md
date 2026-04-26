# Inventaire Portage Quake II - client/input.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/input.h`
- Sources C/H secondaires : `Quake-2-master/client/cl_input.c`, `Quake-2-master/client/client.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/input-device.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/input.ts`, `packages/client/src/index.ts`
- Domaine : client / peripheriques d'entree externes non-clavier
- Niveau de fidelite attendu : Close, avec preservation stricte du contrat public et de la mutation in-place du `usercmd_t`.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : valide

## Regles de rattachement

- Regle cible attendue : `1 fichier .h -> 1 fichier .ts`.
- Exception de decoupage documentee : aucune pour le header ; `cl_input.c` reste rattache separement a `packages/client/src/input.ts`.
- Justification si `1 fichier C != 1 fichier TS` : non applicable pour ce header declaratif ; les backends plateforme sont remplaces par un contexte de hooks explicite.

## Inventaire source

### Fonctions

- [x] Nom : `IN_Init`
  - Source : `client/input.h`
  - Role : initialiser les peripheriques d'entree externes.
  - Cible TS pressentie : `packages/client/src/input-device.ts`
  - Statut : porte.
  - Notes : forward vers `onInit`.

- [x] Nom : `IN_Shutdown`
  - Source : `client/input.h`
  - Role : arreter les peripheriques d'entree externes.
  - Cible TS pressentie : `packages/client/src/input-device.ts`
  - Statut : porte.
  - Notes : forward vers `onShutdown`.

- [x] Nom : `IN_Commands`
  - Source : `client/input.h`
  - Role : permettre aux peripheriques d'ajouter des commandes au script buffer.
  - Cible TS pressentie : `packages/client/src/input-device.ts`
  - Statut : porte.
  - Notes : forward vers `onCommands`, sans melanger avec le frame tick.

- [x] Nom : `IN_Frame`
  - Source : `client/input.h`
  - Role : avancer un frame des peripheriques externes.
  - Cible TS pressentie : `packages/client/src/input-device.ts`
  - Statut : porte.
  - Notes : forward vers `onFrame`.

- [x] Nom : `IN_Move`
  - Source : `client/input.h`
  - Role : ajouter du mouvement externe au-dessus de la commande clavier.
  - Cible TS pressentie : `packages/client/src/input-device.ts`
  - Statut : porte.
  - Notes : preserve la mutation in-place de `usercmd_t`; consomme depuis `packages/client/src/input.ts`.

- [x] Nom : `IN_Activate`
  - Source : `client/input.h`
  - Role : activer ou desactiver les peripheriques externes selon l'etat client/focus.
  - Cible TS pressentie : `packages/client/src/input-device.ts`
  - Statut : porte.
  - Notes : conserve le flag public `qboolean`.

### Structures / types

- [x] Nom : `usercmd_t`
  - Source : `client/input.h` via `client.h` / qcommon
  - Role : commande de mouvement mutabile recue par `IN_Move`.
  - Representation TS pressentie : `usercmd_t`
  - Statut : porte dans `packages/qcommon/src/index.ts`, consomme par `input-device.ts`.
  - Notes : le header depend du type sans le definir.

- [x] Nom : `qboolean`
  - Source : `client/input.h` via headers communs
  - Role : flag d'activation pour `IN_Activate`.
  - Representation TS pressentie : `qboolean`
  - Statut : porte dans `packages/qcommon/src/index.ts`, consomme par `input-device.ts`.
  - Notes : frontiere publique conservee.

- [x] Nom : `ClientInputDeviceHooks`
  - Source : nouveau wrapper TS du contrat `input.h`
  - Role : representer les backends souris/joystick/plateforme injectes.
  - Representation TS pressentie : interface `ClientInputDeviceHooks`
  - Statut : nouveau support conforme.
  - Notes : remplace les globals/backends plateforme par hooks explicites.

- [x] Nom : `ClientInputDeviceContext`
  - Source : nouveau wrapper TS du contrat `input.h`
  - Role : contexte stable groupant les procedures du header.
  - Representation TS pressentie : interface `ClientInputDeviceContext`
  - Statut : nouveau support conforme.
  - Notes : permet des no-op sûrs sans adapter branche.

### Enums / constantes / flags / macros utiles

- [x] Nom : aucune constante propre a `client/input.h`
  - Source : `client/input.h`
  - Valeur / role : header declaratif uniquement.
  - Cible TS pressentie : N/A
  - Statut : N/A
  - Notes : `qboolean` et `usercmd_t` viennent des headers partages.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `IN_Init` | fonction | `packages/client/src/input-device.ts` | `IN_Init` | Porte | Forward hook `onInit`. |
| `IN_Shutdown` | fonction | `packages/client/src/input-device.ts` | `IN_Shutdown` | Porte | Forward hook `onShutdown`. |
| `IN_Commands` | fonction | `packages/client/src/input-device.ts` | `IN_Commands` | Porte | Forward hook `onCommands`. |
| `IN_Frame` | fonction | `packages/client/src/input-device.ts` | `IN_Frame` | Porte | Forward hook `onFrame`. |
| `IN_Move` | fonction | `packages/client/src/input-device.ts` | `IN_Move` | Porte | Mutation in-place de `usercmd_t`. |
| `IN_Activate` | fonction | `packages/client/src/input-device.ts` | `IN_Activate` | Porte | Flag `qboolean` conserve. |
| `usercmd_t *cmd` | type parametre | `packages/client/src/input-device.ts` | `usercmd_t` | Porte | Type importe depuis qcommon. |
| `qboolean active` | type parametre | `packages/client/src/input-device.ts` | `qboolean` | Porte | Type importe depuis qcommon. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/input-device.ts`
- Client : `packages/client/src/input.ts`, `packages/client/src/index.ts`
- Server : non applicable
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : adapter d'entree potentiel via hooks, pas port principal
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-input-header.ts`, `scripts/verify/quake2-cl-input.ts`
