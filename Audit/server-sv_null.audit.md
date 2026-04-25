# Audit Portage Quake II - server/sv_null.c

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : le re-export package passe par `host.ts` plutot que directement par `sv_null.ts`; c'est acceptable car le comportement par defaut reste strictement no-op et le bridge est teste.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_null.c`
- Port TS : `packages/server/src/sv_null.ts`
- Consommateurs : `packages/server/src/host.ts`, `packages/server/src/index.ts`, `scripts/verify/quake2-sv-null.ts`

## Fiche d'identification

- Fichier audite : `server/sv_null.c`
- Source C/H principale : `Quake-2-master/server/sv_null.c`
- Sources C/H secondaires : signatures serveur historiques, type `qboolean`
- Package : `packages/server`
- Type de fichier : stubs serveur nul
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict pour `sv_null.ts`, Close pour le bridge host
- Role attendu : fournir des entrees serveur no-op quand aucun serveur local n'est branche
- Consommateurs directs : `host.ts`, `index.ts`
- Consommateurs finaux : host/qcommon et runtime serveur configure via `configureServerHost`
- Tests existants : `scripts/verify/quake2-sv-null.ts`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SV_Init` | fonction | `sv_null.ts` | `SV_Init` | Valide Strict | corps vide |
| `SV_Shutdown` | fonction | `sv_null.ts` | `SV_Shutdown` | Valide Strict | ignore les deux parametres |
| `SV_Frame` | fonction | `sv_null.ts` | `SV_Frame` | Valide Strict | ignore `time` |
| `SV_Init` top-level | bridge | `host.ts` | `SV_Init` | Valide Close | no-op par defaut, forwarding si configure |
| `SV_Shutdown` top-level | bridge | `host.ts` | `SV_Shutdown` | Valide Close | no-op par defaut, forwarding si configure |
| `SV_Frame` top-level | bridge | `host.ts` | `SV_Frame` | Valide Close | no-op par defaut, forwarding si configure |
| facade package | export | `index.ts` | `SV_Init`, `SV_Shutdown`, `SV_Frame` | Valide | reexport du bridge host |

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

Notes : plusieurs items sont non applicables car `sv_null.c` ne contient ni donnees, ni globals, ni constantes ; ils sont valides comme absence conforme au source.

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

Notes : aucun header n'est inclus par le fichier C, aucune constante/struct/global/macro locale.

### Comparaison comportementale

- [x] Les entrees correspondent au source.
- [x] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source.
- [x] Les retours anticipes sont conserves.
- [x] Les boucles et leur ordre sont conserves.
- [x] Les timings sont fideles.
- [x] Les randomisations conservent l'intention source.
- [x] Les listes/pools sont manipules comme dans le source.

Notes : les trois fonctions ne font rien et retournent `undefined` en TS, equivalent no-op de `void` C.

### Effets secondaires

- [x] Entites creees/liberees/linkees.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour.
- [x] Temp entities mises a jour.
- [x] Sons emis avec les bons parametres.
- [x] Sorties renderer/audio correctement alimentees si applicable.

Notes : aucun effet secondaire attendu dans `sv_null.c`; le bridge host ne produit un effet que si un runtime serveur est explicitement configure.

## Audit item par item

### `SV_Init`

- [x] Signature source `void SV_Init(void)` representee par `SV_Init(): void`.
- [x] Corps source vide conserve dans `sv_null.ts`.
- [x] Chemin top-level `host.ts` reste no-op tant qu'aucune binding n'est configuree.
- [x] Reexport package verifie dans `index.ts`.

### `SV_Shutdown`

- [x] Signature source `void SV_Shutdown(char *finalmsg, qboolean reconnect)` representee par `SV_Shutdown(finalmsg: string, reconnect: boolean): void`.
- [x] Parametres ignores comme dans le source.
- [x] Corps source vide conserve dans `sv_null.ts`.
- [x] Bridge `host.ts` preserve le no-op par defaut et forward uniquement si configure.

### `SV_Frame`

- [x] Signature source `void SV_Frame(float time)` representee par `SV_Frame(time: number): void`.
- [x] Parametre ignore comme dans le source.
- [x] Corps source vide conserve dans `sv_null.ts`.
- [x] Bridge `host.ts` preserve le no-op par defaut et forward uniquement si configure.

### Bridge host / facade package

- [x] `configureServerHost` et `resetServerHost` sont nouveaux et documentes.
- [x] Le bridge ne deplace pas le port strict hors de `sv_null.ts`.
- [x] `index.ts` expose les entrees attendues du package serveur.
- [x] Le harnais verifie le no-op par defaut, le forwarding configure et le reset.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `sv_null.ts` porte les no-op stricts ; `host.ts` est l'entree top-level configurable pour le package serveur, avec comportement no-op par defaut compatible source.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable, aucun renderer/web dans `sv_null.c`.

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

Tests existants verifies : `scripts/verify/quake2-sv-null.ts` couvre les trois no-op, les reexports `index.ts`, le forwarding configure du bridge host et le reset vers no-op.

Tests a ajouter plus tard : aucun test bloquant identifie ; le fichier source ne contient pas de comportement supplementaire.

## Findings

1. [Info] Les entrees package `SV_*` sont reexportees depuis `host.ts` plutot que directement depuis `sv_null.ts`.
   - Fichier/ligne : `packages/server/src/index.ts:35`, `packages/server/src/host.ts:86`
   - Source originale : `server/sv_null.c` expose directement trois fonctions vides.
   - Impact : comportement par defaut identique au source ; le forwarding configure est une extension necessaire au runtime serveur porte.
   - Correction recommandee : aucune, garder le rattachement strict `sv_null.ts` documente et le bridge host teste.

## Decision

- Corriger maintenant : non
- Reporter : rien
- Documenter : inventaire et audit crees ; statut `Valide` a mettre a jour

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_null.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_null.audit.md`
