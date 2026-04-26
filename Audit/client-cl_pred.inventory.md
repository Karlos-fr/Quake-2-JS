# Inventaire Portage Quake II - client/cl_pred.c

Date : 2026-04-26

## Identification

- Source C/H principale : `Quake-2-master/client/cl_pred.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, `Quake-2-master/game/q_shared.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/view.ts`
- Fichiers TS secondaires pressentis : `packages/qcommon/src/pmove.ts`, `packages/qcommon/src/collision.ts`, `packages/client/src/types.ts`, `packages/client/src/parse.ts`, `packages/client/src/local-session.ts`, `apps/web/src/local-client-controller.ts`
- Domaine : client / prediction mouvement et collision
- Niveau de fidelite attendu : Close pour le port runtime avec callbacks explicites ; Strict pour constantes, branches et calculs numeriques.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`.
- Exception de decoupage documentee : le coeur `pmove` et les collisions BSP restent dans `packages/qcommon`, car ils sont partages client/server ; `local-session.ts` et l'adapter web consomment les sorties sans porter le comportement principal.
- Justification si `1 fichier C != 1 fichier TS` : `packages/client/src/view.ts` reste le fichier principal de rattachement pour tous les symboles `cl_pred.c`; les autres modules fournissent les primitives partagees ou le branchement runtime.

## Inventaire source

### Fonctions

- [x] Nom : `CL_CheckPredictionError`
  - Source : `client/cl_pred.c`
  - Role : comparer l'origine serveur au ring-buffer predit, reset teleport ou stocker `prediction_error`.
  - Cible TS pressentie : `packages/client/src/view.ts`
  - Statut : porte.
  - Notes : `cl_showmiss` represente par `showmiss` + `onPredictionMessage`.

- [x] Nom : `CL_ClipMoveToEntities`
  - Source : `client/cl_pred.c`
  - Role : clipper un mouvement contre les packet entities solides, bmodels et bbox encodees.
  - Cible TS pressentie : `packages/client/src/view.ts`
  - Statut : porte.
  - Notes : utilise `ClientPredictionCollisionSource`.

- [x] Nom : `CL_PMTrace`
  - Source : `client/cl_pred.c`
  - Role : tracer d'abord le monde puis les entites solides.
  - Cible TS pressentie : `packages/client/src/view.ts`
  - Statut : porte.
  - Notes : `trace.ent` monde non nul preserve via `source.world`.

- [x] Nom : `CL_PMpointcontents`
  - Source : `client/cl_pred.c`
  - Role : combiner contents monde et bmodels transformes.
  - Cible TS pressentie : `packages/client/src/view.ts`
  - Statut : porte.
  - Notes : filtre `solid == 31` conserve.

- [x] Nom : `CL_PredictMovement`
  - Source : `client/cl_pred.c`
  - Role : executer la prediction client de `ack` a `current`, mettre a jour origine, angles, step smoothing et viewheight.
  - Cible TS pressentie : `packages/client/src/view.ts`
  - Statut : porte et branche.
  - Notes : appelle `Pmove` partage, utilise callbacks collision explicites.

### Structures / types

- [x] Nom : `cl.predicted_origins`
  - Source : `client/client.h`
  - Role : ring-buffer `CMD_BACKUP` des origines packees predites.
  - Representation TS pressentie : `ClientRuntime.cl.predicted_origins`
  - Statut : porte.
  - Notes : taille `CMD_BACKUP`.

- [x] Nom : `cl.prediction_error`
  - Source : `client/client.h`
  - Role : erreur lisse pour interpolation de vue.
  - Representation TS pressentie : `ClientRuntime.cl.prediction_error`
  - Statut : porte.
  - Notes : consommee par `CL_CalcViewValues`.

- [x] Nom : `cl.predicted_origin`, `cl.predicted_angles`
  - Source : `client/cl_pred.c`, `client/client.h`
  - Role : sorties renderer/camera de la prediction.
  - Representation TS pressentie : `ClientRuntime.cl.predicted_origin`, `ClientRuntime.cl.predicted_angles`
  - Statut : porte.
  - Notes : branchees jusqu'a refresh/web.

- [x] Nom : `predicted_pmove`, `predicted_viewheight`
  - Source : adaptation TS issue de `pmove_t` runtime.
  - Role : conserver l'etat `pmove` predit et la hauteur de vue exacte calculee par `Pmove`.
  - Representation TS pressentie : `ClientRuntime.cl.predicted_pmove`, `ClientRuntime.cl.predicted_viewheight`
  - Statut : nouveau helper acceptable.
  - Notes : verrouille par regression viewheight.

- [x] Nom : `ClientPredictionCollisionSource`
  - Source : adaptation de `cl.frame`, `cl_parse_entities`, `cl.model_clip`, `cl.playernum`.
  - Role : fournir a `CL_PMTrace` / `CL_PMpointcontents` les donnees necessaires sans globals C.
  - Representation TS pressentie : `packages/client/src/view.ts`
  - Statut : nouveau helper acceptable.
  - Notes : construit par `createClientPredictionCollisionSource`.

### Enums / constantes / flags / macros utiles

- [x] Nom : `CMD_BACKUP`
  - Source : `client/client.h`
  - Valeur / role : `64`, taille du ring buffer de commandes/predictions.
  - Cible TS pressentie : `packages/client/src/types.ts`
  - Statut : porte.
  - Notes : garde `current - ack >= CMD_BACKUP` conservee.

- [x] Nom : `MAX_PARSE_ENTITIES`
  - Source : `client/client.h`
  - Valeur / role : `1024`, masque du ring `cl_parse_entities`.
  - Cible TS pressentie : `packages/client/src/types.ts`
  - Statut : porte.
  - Notes : `collectPredictionEntities` preserve l'ordre source.

- [x] Nom : `PMF_NO_PREDICTION`, `PMF_ON_GROUND`
  - Source : `game/q_shared.h`
  - Valeur / role : `64`, `4`.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : branches prediction et step smoothing.

- [x] Nom : `MASK_PLAYERSOLID`
  - Source : `game/q_shared.h`
  - Valeur / role : masque collision joueur.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : utilise par traces monde/entites.

- [x] Nom : `CS_AIRACCEL`
  - Source : `game/q_shared.h`
  - Valeur / role : `29`, configstring air acceleration.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : parse via `Number.parseFloat`.

- [x] Nom : `SHORT2ANGLE`
  - Source : `game/q_shared.h`
  - Valeur / role : conversion angles courts vers degres.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : branche no-prediction.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CL_CheckPredictionError` | fonction | `packages/client/src/view.ts` | `CL_CheckPredictionError` | Porte | Debug `showmiss` branche. |
| `CL_ClipMoveToEntities` | fonction | `packages/client/src/view.ts` | `CL_ClipMoveToEntities` | Porte | Bmodels et bbox encodees. |
| `CL_PMTrace` | fonction | `packages/client/src/view.ts` | `CL_PMTrace` | Porte | Monde puis entites. |
| `CL_PMpointcontents` | fonction | `packages/client/src/view.ts` | `CL_PMpointcontents` | Porte | OR contents bmodels. |
| `CL_PredictMovement` | fonction | `packages/client/src/view.ts` | `CL_PredictMovement` | Porte et branche | Boucle `Pmove`. |
| `pmove_t` callbacks | structure | `packages/qcommon/src/pmove.ts` | `Pmove`, `PmoveContext` | Porte | Partage client/server. |
| `cl_parse_entities` | ring state | `packages/client/src/types.ts`, `view.ts` | `cl_parse_entities`, `collectPredictionEntities` | Porte | Masque ring conserve. |
| collision callbacks | adapter runtime | `packages/client/src/local-session.ts` | `createClientPredictionCollisionSource` | Branche | Runtime local et web. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/types.ts`, `packages/client/src/parse.ts`, `packages/client/src/local-session.ts`
- Client : `packages/client/src/view.ts`, `packages/client/src/refresh.ts`, `packages/client/src/local-gameplay-sync.ts`
- Server : `packages/qcommon/src/pmove.ts` partage avec simulation authoritative
- Renderer common : non applicable direct
- Renderer three : consomme indirectement la vue predite via refresh/camera
- Web / platform : `apps/web/src/local-client-controller.ts`
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-cl-pred.ts`, `scripts/verify/quake2-client-pmove-viewheight.ts`, `scripts/verify/quake2-pmove-local-bmodel.ts`
