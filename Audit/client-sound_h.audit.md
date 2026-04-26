# Audit Portage Quake II - client/sound.h

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : faible ; `sound.h` est une facade publique et le comportement concret reste rattache a `snd_dma.ts`, avec forwarding explicite et verifie.

## Source verifiee

- Source C/H : `Quake-2-master/client/sound.h`, avec verification croisee de `Quake-2-master/client/snd_dma.c` et `Quake-2-master/client/snd_loc.h`
- Port TS : `packages/client/src/sound-public.ts`
- Consommateurs : `packages/client/src/index.ts`, `packages/client/src/snd_dma.ts`, `packages/client/src/parse.ts`, `packages/client/src/effects.ts`

## Fiche d'identification

- Fichier audite : `client/sound.h`
- Source C/H principale : `Quake-2-master/client/sound.h`
- Sources C/H secondaires : `Quake-2-master/client/snd_dma.c`, `Quake-2-master/client/snd_loc.h`, `Quake-2-master/client/client.h`
- Package : `packages/client`
- Type de fichier : header public audio
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant mise a jour
- Niveau de fidelite annonce : Close / Strict selon symbole
- Role attendu : exposer l'API publique son client, le type opaque `sfx_s` et le callback `CL_GetEntitySoundOrigin`.
- Consommateurs directs : `packages/client/src/index.ts`, `packages/client/src/snd_dma.ts`
- Consommateurs finaux : parser client des start-sound packets, effets client, pipeline audio local, adapters audio via hooks
- Tests existants : `npm run verify:sound:header`, `npm run verify:snd-dma`, `npm run verify:audio:phase11`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `struct sfx_s` | type opaque | `packages/client/src/sound-local.ts` | `sfx_t` | OK | Reutilise par `sound-public.ts`. |
| `S_Init` | fonction | `packages/client/src/sound-public.ts` | `S_Init` | OK | Forward public, implementation DMA disponible. |
| `S_Shutdown` | fonction | `packages/client/src/sound-public.ts` | `S_Shutdown` | OK | Forward public. |
| `S_StartSound` | fonction | `packages/client/src/sound-public.ts` | `S_StartSound` | OK | `origin` nullable explicite. |
| `S_StartLocalSound` | fonction | `packages/client/src/sound-public.ts` | `S_StartLocalSound` | OK | Sample name preserve. |
| `S_RawSamples` | fonction | `packages/client/src/sound-public.ts` | `S_RawSamples` | OK avec ecart | `byte *` devient `Uint8Array`. |
| `S_StopAllSounds` | fonction | `packages/client/src/sound-public.ts` | `S_StopAllSounds` | OK | Forward public. |
| `S_Update` | fonction | `packages/client/src/sound-public.ts` | `S_Update` | OK | Origine et axes preserves. |
| `S_Activate` | fonction | `packages/client/src/sound-public.ts` | `S_Activate` | OK | `qboolean` conserve. |
| `S_BeginRegistration` | fonction | `packages/client/src/sound-public.ts` | `S_BeginRegistration` | OK | Registration pass. |
| `S_RegisterSound` | fonction | `packages/client/src/sound-public.ts` | `S_RegisterSound` | OK | Retour `sfx_t | null`. |
| `S_EndRegistration` | fonction | `packages/client/src/sound-public.ts` | `S_EndRegistration` | OK | Registration close. |
| `S_FindName` | fonction | `packages/client/src/sound-public.ts` | `S_FindName` | OK | Create flag preserve. |
| `CL_GetEntitySoundOrigin` | callback | `packages/client/src/sound-public.ts` | `CL_GetEntitySoundOrigin` | OK | Copie dans le vecteur fourni. |

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

- [x] Entites creees/liberees/linkees. N/A.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour. N/A.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour. N/A.
- [x] Temp entities mises a jour. N/A.
- [x] Sons emis avec les bons parametres.
- [x] Sorties renderer/audio correctement alimentees si applicable.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`. N/A.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`. N/A.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies. Aucun test bloquant a ajouter pour ce header.

## Findings

1. [Info] Documentation de `sound-public.ts` renforcee pendant l'audit.
   - Fichier/ligne : `packages/client/src/sound-public.ts`
   - Source originale : `client/sound.h`
   - Impact : conformité README avant validation.
   - Correction recommandee : effectuee.

## Decision

- Corriger maintenant : fait, ajout d'en-tetes de fonctions portees/nouvelles.
- Reporter : non
- Documenter : forwarding public et `Uint8Array` documentes.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : oui
- Nouveau statut `Valide` : ✅
- Fichier d'audit cree dans `Audit/` : `Audit/client-sound_h.audit.md`
