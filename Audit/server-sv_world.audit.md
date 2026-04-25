# Audit Portage Quake II - server/sv_world.c

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : le remplacement de `STRUCT_FROM_LINK` par `WeakMap<link_t, edict_t>` doit rester local au portage et ne pas devenir un deuxieme systeme de ownership.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_world.c`, `server.h`, types game/qcommon associes
- Port TS : `packages/server/src/sv_world.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/sv_ents.ts`, `packages/server/src/index.ts`, `scripts/verify/quake2-sv-world.ts`

## Fiche d'identification

- Fichier audite : `server/sv_world.c`
- Source C/H principale : `Quake-2-master/server/sv_world.c`
- Sources C/H secondaires : `server/server.h`, `game` edicts/link_t, `qcommon` collision/contents
- Package : `packages/server`
- Type de fichier : port serveur monde/collision
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict
- Role attendu : lier/delier les entites, requetes area, point contents, traces monde/entites
- Consommateurs directs : `runtime.ts`, `sv_game.ts`, `sv_init.ts`, `sv_ents.ts`
- Consommateurs finaux : gameplay serveur via imports `linkentity`, `BoxEdicts`, `trace`, `pointcontents`; spawn/init serveur; frames serveur
- Tests existants : `scripts/verify/quake2-sv-world.ts`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `ClearLink` | helper | `sv_world.ts` | `ClearLink` | Valide | list head circulaire |
| `RemoveLink` | helper | `sv_world.ts` | `RemoveLink` | Valide | unlink double chaine |
| `InsertLinkBefore` | helper | `sv_world.ts` | `InsertLinkBefore` | Valide | insertion avant head |
| `SV_CreateAreaNode` | helper | `sv_world.ts` | `SV_CreateAreaNode` | Valide | arbre area |
| `SV_ClearWorld` | procedure | `sv_world.ts` | `SV_ClearWorld` | Valide | contexte explicite |
| `SV_UnlinkEdict` | procedure | `sv_world.ts` | `SV_UnlinkEdict` | Valide | retire link |
| `SV_LinkEdict` | procedure | `sv_world.ts` | `SV_LinkEdict` | Valide | solid/absbox/PVS/link |
| `SV_AreaEdicts_r` | helper | `sv_world.ts` | `SV_AreaEdicts_r` | Valide | query recursif |
| `SV_AreaEdicts` | procedure | `sv_world.ts` | `SV_AreaEdicts` | Valide | state explicite |
| `SV_PointContents` | procedure | `sv_world.ts` | `SV_PointContents` | Valide | preserve `hit.s.angles` |
| `moveclip_t` | struct | `sv_world.ts` | `moveclip_t` | Valide | interface locale |
| `SV_HullForEntity` | helper | `sv_world.ts` | `SV_HullForEntity` | Valide | BSP ou bbox hull |
| `SV_ClipMoveToEntities` | helper | `sv_world.ts` | `SV_ClipMoveToEntities` | Valide | clip entites |
| `SV_TraceBounds` | helper | `sv_world.ts` | `SV_TraceBounds` | Valide | bbox mouvement |
| `SV_Trace` | procedure | `sv_world.ts` | `SV_Trace` | Valide | trace monde puis entites |

## Checklist README

### Fidelite de portage

- [x] Le fichier garde le code C original comme source de verite.
- [x] Les comportements critiques sont portes avant toute modernisation.
- [x] L'ordre logique des appels correspond au source.
- [x] Les branches speciales du source sont conservees.
- [x] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [x] Les conversions numeriques sont explicites.
- [x] Les structures de donnees restent proches du source quand la fidelite compte.
- [x] Les globals C sont remplaces par un runtime/contexte clair.
- [x] Les ecarts volontaires sont documentes.

### Nommage, decoupage, rattachement

- [x] Le nom du fichier preserve la tracabilite avec la source.
- [x] Les fonctions portees conservent le style original.
- [x] Les fonctions nouvelles utilisent `camelCase`.
- [x] Les types/interfaces modernes utilisent `PascalCase`.
- [x] Les constantes source conservent leurs noms et valeurs.
- [x] Le fichier TS a une source C/H principale claire.
- [x] Le rattachement est coherent avec `PORTAGE_QUAKE2.md`.
- [x] Le fichier principal de rattachement est identifiable.
- [x] Le decoupage ne masque pas la lecture du comportement original.
- [x] Le fichier ne devient pas un fourre-tout.
- [x] Les helpers nouveaux restent locaux et subordonnes au portage.

### Commentaires et documentation

- [x] Le fichier a un header de module conforme.
- [x] Le header indique `File`, `Source`, `Purpose`, `Porting policy`, `Deviations`, `Notes`.
- [x] Les fonctions portees ont un header conforme.
- [x] Les fonctions nouvelles ont un header conforme.
- [x] Les deviations importantes sont documentees pres du code concerne.

### Separation runtime / adapter

- [x] Le fichier ne melange pas logique moteur, rendu et UI.
- [x] Un module `Strict` ou `Close` ne depend pas d'un module `Adapter`.
- [x] `packages/platform` ne porte pas le comportement principal audite.
- [x] `apps/web` ne porte pas le comportement principal audite.
- [x] Les hooks remplacent seulement les appels renderer/audio/OS.

## Checklist ISO source

### Comparaison structurelle

- [x] Les fonctions sources correspondantes ont ete lues.
- [x] Les headers `.h` associes ont ete verifies.
- [x] Les constantes utilisees viennent du bon header/source.
- [x] Les structs source ont une representation TS equivalente.
- [x] Les enums et flags conservent leurs valeurs.
- [x] Les variables globales source ont un equivalent runtime clair.
- [x] Les macros utiles sont portees ou documentees.
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes.

### Comparaison comportementale

- [x] Les entrees correspondent au source.
- [x] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source.
- [x] Les retours anticipes sont conserves.
- [x] Les boucles et leur ordre sont conserves.
- [x] Les timings sont fideles.
- [x] Les randomisations conservent l'intention source.
- [x] Les listes/pools sont manipules comme dans le source.

### Effets secondaires

- [x] Entites creees/liberees/linkees.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour.
- [x] Temp entities mises a jour.
- [x] Sons emis avec les bons parametres.
- [x] Sorties renderer/audio correctement alimentees si applicable.

Notes : `think`/`touch`/configstrings/temp entities/audio/renderer sont non applicables a ce fichier ; les effets pertinents sont links, absboxes, clusters, areas, traces et contents.

## Audit item par item

### Link helpers et area tree

- [x] `ClearLink` initialise `prev`/`next` sur soi.
- [x] `RemoveLink` reconnecte voisins puis `SV_UnlinkEdict` annule `ent.area`.
- [x] `InsertLinkBefore` conserve l'ordre source.
- [x] `SV_CreateAreaNode` conserve `AREA_DEPTH`, axis x/y et ordre enfants `[mins2,maxs2]` puis `[mins1,maxs1]`.
- [x] `SV_ClearWorld` reinitialise nodes/count puis reconstruit depuis `sv.models[1]`.

### `SV_LinkEdict`

- [x] Unlink ancien lien avant relink.
- [x] Ignore world entity et entites non `inuse`.
- [x] Calcule `size = maxs - mins`.
- [x] Encode `s.solid` pour `SOLID_BBOX` non deadmonster avec clamps `i/j/k`.
- [x] Encode `SOLID_BSP` en `31`, autres en `0`.
- [x] Calcule absbox normale ou expansion rotation BSP.
- [x] Ajoute l'epsilon `-1/+1`.
- [x] Remet clusters/areas a zero.
- [x] Appelle `CM_BoxLeafnums`, `CM_LeafCluster`, `CM_LeafArea`.
- [x] Gere deux areas et warning 3 areas en loading.
- [x] Gere trop de leafs ou trop de clusters par `num_clusters = -1` + `headnode`.
- [x] Initialise `old_origin` au premier link et incremente `linkcount`.
- [x] N'ajoute pas les `SOLID_NOT` aux listes area.
- [x] Lie triggers dans `trigger_edicts`, autres solides dans `solid_edicts`.

### `SV_AreaEdicts`

- [x] Stocke mins/maxs/list/maxcount/type dans l'etat de requete.
- [x] Parcourt la bonne liste solid/trigger.
- [x] Ignore `SOLID_NOT` et bboxes hors intersection.
- [x] Respecte `MAXCOUNT` avec callback print.
- [x] Recurse selon `area_maxs > dist` et `area_mins < dist`.

### `SV_PointContents`

- [x] Lit les contents monde depuis `CM_PointContents(point, sv.models[1].headnode)`.
- [x] Requete les entites solides via `SV_AreaEdicts(point, point, ..., AREA_SOLID)`.
- [x] Combine les contents avec OR bitwise.
- [x] Le C passe `hit->s.angles` a `CM_TransformedPointContents`, meme apres avoir mis `angles = vec3_origin` pour les non-BSP; le TS preserve ce comportement ISO.

### `SV_HullForEntity`

- [x] `SOLID_BSP` retourne le headnode du modele `sv.models[modelindex]`.
- [x] Modele BSP manquant devient erreur fatale adaptee en exception.
- [x] Les autres solides utilisent `CM_HeadnodeForBox(mins,maxs)`.

### `SV_ClipMoveToEntities`

- [x] Requete candidates via `SV_AreaEdicts(boxmins, boxmaxs, AREA_SOLID)`.
- [x] Ignore `SOLID_NOT`, `passedict`, owners missiles et owner.
- [x] Retourne si `clip.trace.allsolid`.
- [x] Filtre deadmonster si `CONTENTS_DEADMONSTER` absent.
- [x] Utilise `mins2/maxs2` pour `SVF_MONSTER`, sinon `mins/maxs`.
- [x] Passe `vec3_origin` pour les non-BSP, `touch.s.angles` pour BSP.
- [x] Met a jour `trace.ent`, `allsolid`, `startsolid`, `fraction` comme le source.

### `SV_TraceBounds` et `SV_Trace`

- [x] `SV_TraceBounds` conserve les trois axes, ordre start/end et epsilon.
- [x] `SV_Trace` remplace mins/maxs null par `vec3_origin`.
- [x] Trace monde via `CM_BoxTrace(..., headnode 0, contentmask)`.
- [x] Assigne `trace.ent = ge.edicts[0]`.
- [x] Retourne immediatement si `fraction == 0`.
- [x] Initialise `moveclip_t`, calcule bounds puis appelle `SV_ClipMoveToEntities`.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` branche les procedures monde dans la facade serveur ; `sv_init.ts` appelle `SV_ClearWorld`; `sv_game.ts` expose `linkentity`, `BoxEdicts`, `trace`, `pointcontents`; `sv_ents.ts` utilise link/query pour frame visibility.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : non applicable.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-world.ts` charge `base1.bsp`, couvre `SV_ClearWorld`, `SV_LinkEdict`, `SV_AreaEdicts`, `SV_PointContents`, `SV_Trace`, `SV_UnlinkEdict`.

Tests a ajouter : cas `SV_PointContents` avec entite non-BSP ayant `s.angles` non nul pour verrouiller explicitement la fidelite exacte au source.

## Findings

1. [Info] `SV_PointContents` conserve un detail source surprenant sur les angles.
   - Fichier/ligne : `packages/server/src/sv_world.ts:352`
   - Source originale : `sv_world.c:435` appelle `CM_TransformedPointContents(p, headnode, hit->s.origin, hit->s.angles)`.
   - Impact : comportement ISO preserve, meme si la variable locale `angles` calculee juste avant n'est pas utilisee par le C.
   - Correction recommandee : aucune ; ajouter un test cible si une regression future menace ce detail.

## Decision

- Corriger maintenant : correction ISO appliquee dans `SV_PointContents`
- Reporter : ajouter un test cible sur le cas angles non-BSP si possible
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_world.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_world.audit.md`
