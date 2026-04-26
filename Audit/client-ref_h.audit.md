# Audit Portage Quake II - client/ref.h

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : faible ; le header est un contrat de donnees et callbacks, avec des ecarts TS limites aux pointeurs opaques, tableaux et out-parameters documentes.

## Source verifiee

- Source C/H : `Quake-2-master/client/ref.h`
- Port TS : `packages/client/src/ref.ts`
- Consommateurs : `packages/client/src/view.ts`, `packages/client/src/index.ts`, `packages/renderer-three/src/gl-rmain.ts`, `packages/renderer-three/src/ref-gl-host.ts`, `apps/web/src/full-game.ts`

## Fiche d'identification

- Fichier audite : `client/ref.h`
- Source C/H principale : `Quake-2-master/client/ref.h`
- Sources C/H secondaires : `Quake-2-master/qcommon/qcommon.h`, `Quake-2-master/game/q_shared.h`
- Package : `packages/client`
- Type de fichier : header public renderer / refresh API
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : deja `OK` avant cet audit formel
- Niveau de fidelite annonce : Strict pour constantes et structs simples, Close pour contrats adaptes TypeScript
- Role attendu : exposer les structures renderer-facing, constantes publiques, API exportee par le refresh module et API importee depuis le client.
- Consommateurs directs : `packages/client/src/view.ts`, `packages/client/src/menu-types.ts`, `packages/client/src/index.ts`
- Consommateurs finaux : `packages/renderer-three/src/gl-rmain.ts`, `packages/renderer-three/src/gl-light.ts`, `packages/renderer-three/src/ref-gl-host.ts`, `apps/web/src/full-game.ts`
- Tests existants : `npm run verify:ref:header`, `npm run verify:ref-gl-host`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `MAX_DLIGHTS` | macro | `packages/client/src/ref.ts` | `MAX_DLIGHTS` / `REF_MAX_DLIGHTS` | OK | Valeur `32`. |
| `MAX_ENTITIES` | macro | `packages/client/src/ref.ts` | `MAX_ENTITIES` / `REF_MAX_ENTITIES` | OK | Valeur `128`. |
| `MAX_PARTICLES` | macro | `packages/client/src/ref.ts` | `MAX_PARTICLES` / `REF_MAX_PARTICLES` | OK | Valeur `4096`. |
| `MAX_LIGHTSTYLES` | macro | `packages/qcommon/src/q-shared.ts`, `packages/client/src/ref.ts` | `MAX_LIGHTSTYLES` / `REF_MAX_LIGHTSTYLES` | OK | Valeur `256`, source partagee. |
| `POWERSUIT_SCALE` | macro | `packages/client/src/ref.ts` | `POWERSUIT_SCALE` | OK | Valeur `4.0`. |
| `SHELL_*_COLOR` | macros | `packages/client/src/ref.ts` | `SHELL_*_COLOR` | OK | Valeurs hex conservees. |
| `ENTITY_FLAGS` | macro | `packages/client/src/ref.ts` | `ENTITY_FLAGS` | OK | Valeur `68`. |
| `API_VERSION` | macro | `packages/client/src/ref.ts` | `API_VERSION` | OK | Valeur `3`. |
| `model_s` / `image_s` | opaques | `packages/client/src/ref.ts` | `model_s`, `image_s` | OK avec ecart | `unknown` documente. |
| `entity_t` | struct | `packages/client/src/ref.ts` | `entity_t`, `createEntity` | OK | Champs preserves, y compris usages `RF_BEAM`. |
| `dlight_t` | struct | `packages/client/src/ref.ts` | `dlight_t`, `createDlight` | OK | Champs preserves. |
| `particle_t` | struct | `packages/client/src/ref.ts` | `particle_t`, `createParticle` | OK | Champs preserves. |
| `lightstyle_t` | struct | `packages/client/src/ref.ts` | `lightstyle_t`, `createLightstyle` | OK | `rgb[3]` represente par tuple. |
| `refdef_t` | struct | `packages/client/src/ref.ts` | `refdef_t`, `createRefDef` | OK avec ecart | Pointeurs de tableaux remplaces par arrays TS avec compteurs. |
| `refexport_t` | function table | `packages/client/src/ref.ts` | `refexport_t`, `createRefExport` | OK avec ecart | Out-parameter `DrawGetPicSize` remplace par `RefPictureSize`. |
| `refimport_t` | function table | `packages/client/src/ref.ts` | `refimport_t`, `createRefImport` | OK avec ecart | `FS_LoadFile` et `Vid_GetModeInfo` retournent des valeurs nullables. |
| `GetRefAPI_t` | function typedef | `packages/client/src/ref.ts`, `packages/renderer-three/src/gl-rmain.ts` | `GetRefAPI_t`, `GetRefAPI` | OK branche | Host renderer expose un `refexport_t`. |

## Checklist README

### Fidelite de portage

- [x] Le fichier garde le code C original comme source de verite.
- [x] Les comportements critiques sont portes avant toute modernisation.
- [x] L'ordre logique des appels correspond au source.
- [x] Les branches speciales du source sont conservees.
- [x] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [x] Les conversions numeriques sont explicites.
- [x] Les structures de donnees restent proches du source quand la fidelite compte.
- [x] Les globals C sont remplaces par un runtime/contexte clair. N/A direct, header sans global mutable propre.
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
- [x] Les fonctions portees ont un header conforme. Les surfaces portees sont des signatures d'interface ; les factories nouvelles sont testees et localisees.
- [x] Les fonctions nouvelles ont un header conforme pour les ecarts de contrat structures.
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
- [x] Les variables globales source ont un equivalent runtime clair. N/A.
- [x] Les macros utiles sont portees ou documentees.
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes. `ROGUE` shell colors conserves comme constantes.

### Comparaison comportementale

- [x] Les entrees correspondent au source.
- [x] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source. N/A pour le header, factories zero-initialisees.
- [x] Les retours anticipes sont conserves. N/A.
- [x] Les boucles et leur ordre sont conserves. N/A.
- [x] Les timings sont fideles. `refdef_t.time` conserve.
- [x] Les randomisations conservent l'intention source. N/A.
- [x] Les listes/pools sont manipules comme dans le source. Arrays TS avec compteurs `num_*` preserves.

### Effets secondaires

- [x] Entites creees/liberees/linkees. N/A.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour. N/A.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour. N/A.
- [x] Temp entities mises a jour. N/A.
- [x] Sons emis avec les bons parametres. N/A.
- [x] Sorties renderer/audio correctement alimentees si applicable.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`. N/A direct.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

### Audio

- [x] Si applicable, le son source est enregistre. N/A.
- [x] Si applicable, l'evenement audio est emis et consomme correctement. N/A.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies. Aucun test bloquant a ajouter pour ce header.

## Findings

1. [Info] `PORTAGE_QUAKE2.md` validait deja `client/ref.h`, mais les fichiers d'audit formels etaient absents.
   - Fichier/ligne : `PORTAGE_QUAKE2.md`, ligne `client\ref.h`
   - Source originale : `client/ref.h`
   - Impact : tracabilite d'audit incomplete malgre un port valide.
   - Correction recommandee : creer `Audit/client-ref_h.inventory.md` et `Audit/client-ref_h.audit.md`, puis referencer ces fichiers dans la ligne de suivi.

## Decision

- Corriger maintenant : oui, creation de l'inventaire et de l'audit formels ; ajout de leur reference dans le suivi.
- Reporter : non
- Documenter : ecarts TypeScript acceptes pour opaques, arrays et out-parameters.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : oui, ajout des fichiers d'audit a la liste des artefacts.
- Nouveau statut `Valide` : conserve valide
- Fichier d'audit cree dans `Audit/` : `Audit/client-ref_h.audit.md`
