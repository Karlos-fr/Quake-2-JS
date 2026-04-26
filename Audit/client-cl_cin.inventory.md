# Inventaire Portage Quake II - client/cl_cin.c

Date : 2026-04-26

## Identification

- Source C/H principale : `Quake-2-master/client/cl_cin.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, `Quake-2-master/client/screen.h`, `Quake-2-master/client/sound.h`, `Quake-2-master/client/cdaudio.h`, `Quake-2-master/client/ref.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/cinematic.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/screen.ts`, `packages/client/src/types.ts`, `packages/formats/src/pcx.ts`, `packages/renderer-three/src/gl-draw.ts`, `apps/web/src/full-game.ts`
- Domaine : client, cinematics, image PCX, flux `.cin`, audio brut, pont renderer
- Niveau de fidelite attendu : `Close`, avec sous-blocs Huffman et `SCR_FinishCinematic` en `Strict`
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` ✅, `Porte` ✅
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : facade `screen.ts` conservee pour l'API historique `screen.h`; parsing PCX reutilise le parseur binaire `packages/formats`.
- Justification si `1 fichier C != 1 fichier TS` : le comportement principal de `cl_cin.c` reste dans `cinematic.ts`; les fichiers secondaires ne portent que l'etat client, la facade publique, le parseur format ou les adapters de consommation.

## Inventaire source

### Fonctions

- [x] Nom : `SCR_LoadPCX`
  - Source : `client/cl_cin.c`
  - Role : charge, valide et decode une image PCX 8-bit plus palette.
  - Cible TS pressentie : `packages/formats/src/pcx.ts` via `parsePcx`, appele depuis `SCR_PlayCinematic`.
  - Statut : Valide avec decoupage documente.
  - Notes : le chargement fichier passe par `loadBinaryFile`, le decodage PCX est partage avec le package formats.

- [x] Nom : `SCR_StopCinematic`
  - Source : `client/cl_cin.c`
  - Role : arrete la cinematic, libere image/frame/table Huffman, remet la palette renderer et restaure le son.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`, facade `packages/client/src/screen.ts`
  - Statut : Valide Close.
  - Notes : liberation memoire remplacee par remise a zero runtime; palette et restart son exposes via hooks/adapters.

- [x] Nom : `SCR_FinishCinematic`
  - Source : `client/cl_cin.c`
  - Role : ecrit `nextserver <servercount>\n` dans le message client.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`, facade `packages/client/src/screen.ts`
  - Statut : Valide Strict.
  - Notes : conserve `clc_stringcmd` et la chaine source.

- [x] Nom : `SmallestNode1`
  - Source : `client/cl_cin.c`
  - Role : choisit le plus petit noeud Huffman non utilise et non nul.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`
  - Statut : Valide Strict.
  - Notes : helper local, parametre avec tableaux runtime explicites.

- [x] Nom : `Huff1TableInit`
  - Source : `client/cl_cin.c`
  - Role : lit les 256 lignes de compteurs et construit les arbres Huffman ordre 1.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`
  - Statut : Valide Strict.
  - Notes : tables `hnodes1` et `numhnodes1` conservees en `Int32Array`.

- [x] Nom : `Huff1Decompress`
  - Source : `client/cl_cin.c`
  - Role : decompresse un bloc Huffman ordre 1 en pixels indexes.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`
  - Statut : Valide Close.
  - Notes : deroule en boucle `bit < 8` au lieu de huit blocs copies; l'ordre de lecture bits/feuilles est conserve.

- [x] Nom : `SCR_ReadNextFrame`
  - Source : `client/cl_cin.c`
  - Role : lit commande frame, palette optionnelle, bloc compresse, audio brut, decompresse l'image et incremente `cinematicframe`.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`
  - Statut : Valide Close.
  - Notes : `S_RawSamples` devient `onCinematicRawSamples`; les erreurs de taille sont explicites.

- [x] Nom : `SCR_RunCinematic`
  - Source : `client/cl_cin.c`
  - Role : avance la timeline 14 Hz, pause hors `key_game`, gere drop frame, fin de stream et loading plaque.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`, facade `packages/client/src/screen.ts`
  - Statut : Valide Close.
  - Notes : `Com_Printf` de drop frame non reproduit; comportement d'etat conserve.

- [x] Nom : `SCR_DrawCinematic`
  - Source : `client/cl_cin.c`
  - Role : signale cinematic active, gere palette, dessine raw plein ecran ou ecran noir menu.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`, rendu consomme par `screen.ts` / renderer adapters.
  - Statut : Valide Close.
  - Notes : `re.CinematicSetPalette` et `re.DrawStretchRaw` deviennent snapshot renderer-neutral.

- [x] Nom : `SCR_PlayCinematic`
  - Source : `client/cl_cin.c`
  - Role : stoppe CD audio, lance `.pcx` statique ou `.cin`, lit header, initialise Huffman, ajuste backend son.
  - Cible TS pressentie : `packages/client/src/cinematic.ts`, facade `packages/client/src/screen.ts`
  - Statut : Valide Close.
  - Notes : filesystem, CD audio et restart son passent par hooks; chemins `pics/` et `video/` conserves.

### Structures / types

- [x] Nom : `cblock_t`
  - Source : `client/cl_cin.c`
  - Role : paire pointeur/longueur pour bloc compresse/decompresse.
  - Representation TS pressentie : `Uint8Array` plus longueur implicite.
  - Statut : Valide adapte.
  - Notes : pas de type dedie necessaire.

- [x] Nom : `cinematics_t cin`
  - Source : `client/cl_cin.c`
  - Role : etat prive cinematic : son, dimensions, frames, Huffman, compteurs temporaires.
  - Representation TS pressentie : `client_cinematic_t` dans `packages/client/src/types.ts`.
  - Statut : Valide Close.
  - Notes : `h_used` / `h_count` deviennent locaux a `Huff1TableInit`; l'etat global passe dans `runtime.cl.cinematic`.

- [x] Nom : champs cinematic de `client_state_t`
  - Source : `client/client.h`
  - Role : `cinematic_file`, `cinematictime`, `cinematicframe`, `cinematicpalette`, `cinematicpalette_active`.
  - Representation TS pressentie : `client_cinematic_t` rattache a `client_state_t.cinematic`.
  - Statut : Valide Close.
  - Notes : `FILE *` remplace par bytes + cursor.

- [x] Nom : `ClientCinematicSnapshot`
  - Source : nouveau contrat TS derive de `SCR_DrawCinematic`.
  - Role : expose pixels indexes et palette au renderer sans deplacer le portage.
  - Representation TS pressentie : `packages/client/src/cinematic.ts`
  - Statut : Valide Adapter local.
  - Notes : permet le branchement renderer/web.

### Enums / constantes / flags / macros utiles

- [x] Nom : cadence cinematic `14`
  - Source : `cl_cin.c`
  - Valeur / role : conversion frame <-> temps et decoupage audio.
  - Cible TS pressentie : constantes inline dans `cinematic.ts`.
  - Statut : Valide.
  - Notes : meme valeur dans `SCR_RunCinematic` et `SCR_ReadNextFrame`.

- [x] Nom : palette cinematic `768`
  - Source : `client_state_t.cinematicpalette[768]`
  - Valeur / role : palette RGB 256 couleurs.
  - Cible TS pressentie : `new Uint8Array(768)`.
  - Statut : Valide.
  - Notes : longueur reutilisee pour la lecture de palette.

- [x] Nom : Huffman `256`, `512`, `511`, `256*256*2`
  - Source : `cinematics_t`, `Huff1TableInit`.
  - Valeur / role : table ordre 1 et noeuds internes.
  - Cible TS pressentie : `cinematic.ts`.
  - Statut : Valide.
  - Notes : tailles conservees.

- [x] Nom : taille compressee max `0x20000`
  - Source : `byte compressed[0x20000]`.
  - Valeur / role : borne de frame compressee.
  - Cible TS pressentie : `SCR_ReadNextFrame`.
  - Statut : Valide.
  - Notes : rejet `size < 1 || size > 0x20000`.

- [x] Nom : commandes frame `0`, `1`, `2`
  - Source : `SCR_ReadNextFrame`.
  - Valeur / role : frame normale, frame avec palette, marqueur fin.
  - Cible TS pressentie : `SCR_ReadNextFrame`.
  - Statut : Valide.
  - Notes : `1` lit palette, `2` termine.

- [x] Nom : `clc_stringcmd`
  - Source : `SCR_FinishCinematic`.
  - Valeur / role : opcode message client.
  - Cible TS pressentie : `clc_ops_e.clc_stringcmd`.
  - Statut : Valide.
  - Notes : opcode issu de `qcommon`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SCR_LoadPCX` | fonction | `packages/client/src/cinematic.ts` / `packages/formats/src/pcx.ts` | `SCR_PlayCinematic` + `parsePcx` | Valide adapte | helper format extrait |
| `SCR_StopCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_StopCinematic` | Valide Close | hooks palette/son |
| `SCR_FinishCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_FinishCinematic` | Valide Strict | message `nextserver` |
| `SmallestNode1` | fonction | `packages/client/src/cinematic.ts` | `SmallestNode1` | Valide Strict | local |
| `Huff1TableInit` | fonction | `packages/client/src/cinematic.ts` | `Huff1TableInit` | Valide Strict | local |
| `Huff1Decompress` | fonction | `packages/client/src/cinematic.ts` | `Huff1Decompress` | Valide Close | boucle par bits |
| `SCR_ReadNextFrame` | fonction | `packages/client/src/cinematic.ts` | `SCR_ReadNextFrame` | Valide Close | local + raw samples hook |
| `SCR_RunCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_RunCinematic` | Valide Close | facade screen |
| `SCR_DrawCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_DrawCinematic` | Valide Close | snapshot renderer |
| `SCR_PlayCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_PlayCinematic` | Valide Close | hooks FS/audio |
| `cinematics_t cin` | global/struct | `packages/client/src/types.ts` | `client_cinematic_t` | Valide Close | runtime explicite |
| `cl.cinematic*` | champs client | `packages/client/src/types.ts` | `client_cinematic_t` | Valide Close | groupe dedie |
| `re.DrawStretchRaw` | side effect renderer | `packages/renderer-three/src/gl-draw.ts` | `Draw_StretchRaw` | Valide branche | consomme snapshot |
| `S_RawSamples` | side effect audio | `packages/platform` / `apps/web` | `onCinematicRawSamples` | Valide adapte | hook audio web |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/types.ts`, `createClientCinematicState`
- Client : `packages/client/src/screen.ts`, `packages/client/src/parse.ts`, `packages/client/src/input.ts`, `packages/client/src/menu-runtime.ts`
- Server : `server/sv_user.c` cote source consomme `nextserver`; port TS couvert par `packages/server/src/sv_user.ts`
- Renderer common : snapshots et draw commands passent par contrats HUD/client
- Renderer three : `packages/renderer-three/src/gl-draw.ts`, HUD/resource adapters pour draw commands
- Web / platform : `apps/web/src/full-game.ts`, audio web via hooks cinematic
- Audio : `onCinematicRawSamples`, `onCinematicSoundRestart`, `onCDAudioStop`
- Tests existants : `scripts/verify/quake2-screen-header.ts`, `scripts/verify/quake2-cinematic-audio-sync.ts`, `scripts/verify/quake2-cl-input.ts`, `scripts/verify/quake2-cl-parse.ts`, `scripts/verify/quake2-cl-scrn.ts`
