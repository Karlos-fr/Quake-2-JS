# Inventaire Portage Quake II - server/sv_world.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_world.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, structures `edict_t`, `link_t`, constantes solid/svflags/contents, collision model `CM_*`
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_world.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/server.ts`, `packages/server/src/runtime.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/index.ts`
- Domaine : serveur, spatial links, area queries, point contents, traces collision monde/entites
- Niveau de fidelite attendu : Strict
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le port principal ; les consommateurs passent par la procedure table et la facade package.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `sv_world.ts` reste le point principal, `runtime.ts`/`sv_game.ts`/`sv_init.ts` ne font que consommer les procedures.

## Inventaire source

### Fonctions

- [x] Nom : `ClearLink`
  - Source : `sv_world.c:60`
  - Role : initialise une link list circulaire vide.
  - Cible TS pressentie : `sv_world.ts:429`
  - Statut : porte helper local
  - Notes : `prev` et `next` pointent vers la link elle-meme.

- [x] Nom : `RemoveLink`
  - Source : `sv_world.c:65`
  - Role : retire une link de sa liste doublement chainee.
  - Cible TS pressentie : `sv_world.ts:434`
  - Statut : porte helper local
  - Notes : garde defensive TS si link incomplete.

- [x] Nom : `InsertLinkBefore`
  - Source : `sv_world.c:71`
  - Role : insere une link avant une tete de liste.
  - Cible TS pressentie : `sv_world.ts:442`
  - Statut : porte helper local
  - Notes : garde defensive `ClearLink(before)`.

- [x] Nom : `SV_CreateAreaNode`
  - Source : `sv_world.c:84`
  - Role : construit l'arbre spatial uniforme `AREA_DEPTH`.
  - Cible TS pressentie : `sv_world.ts:456`
  - Statut : porte helper local
  - Notes : conserve split axe x/y, ordre enfants, limites `AREA_DEPTH`/`AREA_NODES`.

- [x] Nom : `SV_ClearWorld`
  - Source : `sv_world.c:123`
  - Role : reinitialise les area nodes et reconstruit l'arbre depuis le world model.
  - Cible TS pressentie : `sv_world.ts:116`
  - Statut : porte
  - Notes : contexte explicite `sv`; garde TS si model absent.

- [x] Nom : `SV_UnlinkEdict`
  - Source : `sv_world.c:136`
  - Role : retire une entite des listes area si elle est liee.
  - Cible TS pressentie : `sv_world.ts:129`
  - Statut : porte
  - Notes : remet `area.prev`/`area.next` a `null`.

- [x] Nom : `SV_LinkEdict`
  - Source : `sv_world.c:151`
  - Role : encode solid, calcule absbox, PVS leafs/areas/clusters, link area.
  - Cible TS pressentie : `sv_world.ts:138`
  - Statut : porte
  - Notes : conserve bbox encoding, epsilon, clusters, areas, linkcount et solid/trigger list.

- [x] Nom : `SV_AreaEdicts_r`
  - Source : `sv_world.c:327`
  - Role : parcours recursif de l'arbre area pour collecter les edicts touchants.
  - Cible TS pressentie : `sv_world.ts:500`
  - Statut : porte helper local
  - Notes : `STRUCT_FROM_LINK` remplace par `WeakMap<link_t, edict_t>`.

- [x] Nom : `SV_AreaEdicts`
  - Source : `sv_world.c:388`
  - Role : initialise les globals de requete area puis appelle le parcours recursif.
  - Cible TS pressentie : `sv_world.ts:313`
  - Statut : porte
  - Notes : globals remplaces par `ServerWorldState`.

- [x] Nom : `SV_PointContents`
  - Source : `sv_world.c:409`
  - Role : combine contents monde et contents des entites solides touchantes.
  - Cible TS pressentie : `sv_world.ts:335`
  - Statut : porte Strict
  - Notes : source calcule `angles` mais passe `hit->s.angles`; TS preserve ce comportement.

- [x] Nom : `SV_HullForEntity`
  - Source : `sv_world.c:467`
  - Role : retourne le headnode BSP ou un hull temporaire bbox.
  - Cible TS pressentie : `sv_world.ts:547`
  - Statut : porte helper local
  - Notes : erreur C `ERR_FATAL` adaptee en exception.

- [x] Nom : `SV_ClipMoveToEntities`
  - Source : `sv_world.c:497`
  - Role : clippe un mouvement contre les entites solides candidates.
  - Cible TS pressentie : `sv_world.ts:560`
  - Statut : porte helper local
  - Notes : conserve skip passedict/owner/deadmonster, choix mins2 pour monstres et mise a jour trace.

- [x] Nom : `SV_TraceBounds`
  - Source : `sv_world.c:581`
  - Role : calcule la bbox englobante d'un mouvement.
  - Cible TS pressentie : `sv_world.ts:638`
  - Statut : porte helper local
  - Notes : branche debug `#if 0` non portee, documentee comme inactive.

- [x] Nom : `SV_Trace`
  - Source : `sv_world.c:616`
  - Role : trace une bbox dans le monde puis contre les entites solides.
  - Cible TS pressentie : `sv_world.ts:366`
  - Statut : porte
  - Notes : conserve fallback mins/maxs, trace monde, early return fraction 0, puis clip entites.

### Structures / types

- [x] Nom : `areanode_t`
  - Source : `sv_world.c:39`
  - Role : noeud d'arbre area avec listes trigger/solid.
  - Representation TS pressentie : `sv_world.ts:41`
  - Statut : porte local
  - Notes : `children` typés nullable.

- [x] Nom : `moveclip_t`
  - Source : `sv_world.c:443`
  - Role : contexte temporaire de trace.
  - Representation TS pressentie : `sv_world.ts:49`
  - Statut : porte local
  - Notes : champs source preserves.

- [x] Nom : globals area query
  - Source : `sv_world.c:50`
  - Role : etat file-static pour `SV_AreaEdicts`.
  - Representation TS pressentie : `ServerWorldState`
  - Statut : porte
  - Notes : contexte explicite conforme README.

- [x] Nom : `edict_t`, `link_t`
  - Source : game/server headers
  - Role : entites runtime et listes area.
  - Representation TS pressentie : `packages/game/src/index.js`
  - Statut : consomme
  - Notes : `WeakMap` remplace la macro pointer arithmetic.

- [x] Nom : `ServerWorldContext`
  - Source : nouveau contexte TS
  - Role : regroupe `sv`, `ge`, `collisionWorld` et callbacks print.
  - Representation TS pressentie : `sv_world.ts:81`
  - Statut : nouveau contexte
  - Notes : adaptation des globals C autorisee.

### Enums / constantes / flags / macros utiles

- [x] Nom : `AREA_DEPTH`
  - Source : `sv_world.c:46`
  - Valeur / role : `4`, profondeur arbre area.
  - Cible TS pressentie : `sv_world.ts:33`
  - Statut : porte
  - Notes : valeur identique.

- [x] Nom : `AREA_NODES`
  - Source : `sv_world.c:47`
  - Valeur / role : `32`, nombre maximal de noeuds area.
  - Cible TS pressentie : `sv_world.ts:34`
  - Statut : porte
  - Notes : valeur identique, garde de borne TS.

- [x] Nom : `MAX_TOTAL_ENT_LEAFS`
  - Source : `sv_world.c:150`
  - Valeur / role : `128`, leafs temporaires pour link edict.
  - Cible TS pressentie : `sv_world.ts:35`
  - Statut : porte
  - Notes : valeur identique.

- [x] Nom : `STRUCT_FROM_LINK` / `EDICT_FROM_AREA`
  - Source : `sv_world.c:32`
  - Valeur / role : recupere l'edict proprietaire depuis `link_t`.
  - Cible TS pressentie : `ServerWorldState.linkOwners`
  - Statut : adapte
  - Notes : pointer arithmetic remplacee par `WeakMap`, deviation documentee.

- [x] Nom : `AREA_SOLID`, `SOLID_*`, `SVF_*`, `CONTENTS_DEADMONSTER`, `MAX_ENT_CLUSTERS`, `MAX_EDICTS`
  - Source : headers game/qcommon/server
  - Valeur / role : filtres de link, query et trace.
  - Cible TS pressentie : imports qcommon/game
  - Statut : consomme
  - Notes : valeurs conservees par les modules sources respectifs.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `ClearLink` | helper | `sv_world.ts` | `ClearLink` | OK | local |
| `RemoveLink` | helper | `sv_world.ts` | `RemoveLink` | OK | local |
| `InsertLinkBefore` | helper | `sv_world.ts` | `InsertLinkBefore` | OK | local |
| `SV_CreateAreaNode` | helper | `sv_world.ts` | `SV_CreateAreaNode` | OK | local |
| `SV_ClearWorld` | procedure | `sv_world.ts` | `SV_ClearWorld` | OK | exposee via procedure table |
| `SV_UnlinkEdict` | procedure | `sv_world.ts` | `SV_UnlinkEdict` | OK | exposee via procedure table |
| `SV_LinkEdict` | procedure | `sv_world.ts` | `SV_LinkEdict` | OK | exposee via procedure table |
| `SV_AreaEdicts_r` | helper | `sv_world.ts` | `SV_AreaEdicts_r` | OK | local |
| `SV_AreaEdicts` | procedure | `sv_world.ts` | `SV_AreaEdicts` | OK | exposee via procedure table |
| `SV_PointContents` | procedure | `sv_world.ts` | `SV_PointContents` | OK | preserve le passage de `hit.s.angles` |
| `SV_HullForEntity` | helper | `sv_world.ts` | `SV_HullForEntity` | OK | local |
| `SV_ClipMoveToEntities` | helper | `sv_world.ts` | `SV_ClipMoveToEntities` | OK | local |
| `SV_TraceBounds` | helper | `sv_world.ts` | `SV_TraceBounds` | OK | local |
| `SV_Trace` | procedure | `sv_world.ts` | `SV_Trace` | OK | exposee via procedure table |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : non applicable direct
- Server : `packages/server/src/sv_init.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_ents.ts`, `packages/server/src/index.ts`
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : non applicable direct
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-sv-world.ts`, integrations `quake2-sv-game.ts`, `quake2-sv-init.ts`, `quake2-sv-ents.ts`, `quake2-server-runtime.ts`
