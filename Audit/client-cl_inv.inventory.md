# Inventaire Portage Quake II - client/cl_inv.c

Date : 2026-04-26

## Identification

- Source C/H principale : `Quake-2-master/client/cl_inv.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, `Quake-2-master/game/q_shared.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/inventory.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/parse.ts`, `packages/client/src/screen.ts`, `packages/client/src/index.ts`, `packages/renderer-three/src/gl-draw.ts`, `packages/renderer-three/src/three-gl-draw-adapter.ts`
- Domaine : client / inventaire HUD et parsing `svc_inventory`
- Niveau de fidelite attendu : Strict pour `CL_ParseInventory` et `SetStringHighBit`, Close pour `CL_DrawInventoryRef` via `refexport_t` ; la projection renderer-neutral de `CL_DrawInventory` reste disponible pour snapshots/tests.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`.
- Exception de decoupage documentee : `CL_ParseInventory` est rattache a `packages/client/src/parse.ts`, car il consomme `net_message` avec les autres parseurs client ; `screen.ts` orchestre l'affichage comme facade HUD ; `gl_draw.ts` et l'adapter Three consomment les appels `refexport_t`.
- Justification si `1 fichier C != 1 fichier TS` : le fichier source mele un parseur reseau et le rendu HUD immediat. Le port conserve `inventory.ts` comme cible principale pour le comportement inventaire visible, tout en gardant le parsing dans le module parse existant.

## Inventaire source

### Fonctions

- [x] Nom : `CL_ParseInventory`
  - Source : `client/cl_inv.c`
  - Role : lire `MAX_ITEMS` shorts depuis `net_message` et remplir `cl.inventory`.
  - Cible TS pressentie : `packages/client/src/parse.ts`
  - Statut : porte.
  - Notes : boucle `0..MAX_ITEMS-1`, mutation in-place de `runtime.cl.inventory`.

- [x] Nom : `Inv_DrawString`
  - Source : `client/cl_inv.c`
  - Role : dessiner une chaine avec `re.DrawChar` tous les 8 pixels.
  - Cible TS pressentie : `packages/client/src/inventory.ts`
  - Statut : porte.
  - Notes : rendu conserve en `HudTextCommand` pour snapshots/tests et en appels immediats `ref.DrawChar` via `Inv_DrawStringRef`.

- [x] Nom : `SetStringHighBit`
  - Source : `client/cl_inv.c`
  - Role : positionner le bit 128 de chaque caractere non selectionne.
  - Cible TS pressentie : `packages/client/src/inventory.ts`
  - Statut : porte.
  - Notes : retourne une nouvelle chaine, adaptation TS immutable documentee.

- [x] Nom : `CL_DrawInventory`
  - Source : `client/cl_inv.c`
  - Role : composer l'overlay inventaire, calculer le scroll, afficher bindings, quantites, noms d'items et curseur clignotant.
  - Cible TS pressentie : `packages/client/src/inventory.ts`, appele par `packages/client/src/screen.ts`
  - Statut : porte et branche.
  - Notes : chemin runtime immediat conserve via `CL_DrawInventoryRef`; commandes HUD conservees pour snapshots/tests.

### Structures / types

- [x] Nom : `cl.inventory`
  - Source : `client/client.h`
  - Role : tableau de `MAX_ITEMS` compteurs d'inventaire client.
  - Representation TS pressentie : `ClientRuntime.cl.inventory`
  - Statut : porte.
  - Notes : initialise a `MAX_ITEMS` entrees dans `types.ts`.

- [x] Nom : `ClientInventoryBindingMap`
  - Source : adaptation TS de la recherche `keybindings[256]`.
  - Role : injecter les hotkeys resolues sans coupler l'inventaire au backend input.
  - Representation TS pressentie : `packages/client/src/inventory.ts`
  - Statut : nouveau helper acceptable.
  - Notes : preserve le resultat visible de la recherche `use <item>`.

- [x] Nom : `ClientInventoryContext`
  - Source : adaptation TS de `viddef` et de l'etat client actif.
  - Role : fournir dimensions et gating d'affichage.
  - Representation TS pressentie : `packages/client/src/inventory.ts`
  - Statut : nouveau helper acceptable.
  - Notes : `screen.ts` renseigne `active` depuis `cls.state`.

### Enums / constantes / flags / macros utiles

- [x] Nom : `DISPLAY_ITEMS`
  - Source : `client/cl_inv.c`
  - Valeur / role : `17`, nombre de lignes visibles dans l'overlay.
  - Cible TS pressentie : `packages/client/src/inventory.ts`
  - Statut : porte.
  - Notes : constante locale.

- [x] Nom : `MAX_ITEMS`
  - Source : `game/q_shared.h`
  - Valeur / role : `256`, taille du tableau inventaire.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : reexporte par `packages/qcommon/src/index.ts`.

- [x] Nom : `STAT_SELECTED_ITEM`
  - Source : `game/q_shared.h`
  - Valeur / role : `12`, stat du joueur indiquant l'item selectionne.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : consomme par `CL_DrawInventory`.

- [x] Nom : `STAT_LAYOUTS`
  - Source : `game/q_shared.h`
  - Valeur / role : `13`, bit `2` active l'inventaire.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`, `packages/client/src/screen.ts`
  - Statut : porte et branche.
  - Notes : `SCR_DrawHudRef` appelle `CL_DrawInventoryRef` en runtime ; `SCR_BuildHudDrawCommands` appelle `CL_DrawInventory` pour snapshots/tests.

- [x] Nom : `CS_ITEMS`
  - Source : `game/q_shared.h`
  - Valeur / role : base des configstrings de noms d'items.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : `CL_DrawInventory` lit `runtime.cl.configstrings[CS_ITEMS + item]`.

- [x] Nom : `svc_inventory`
  - Source : protocole serveur/client Quake II.
  - Valeur / role : message declenchant `CL_ParseInventory`.
  - Cible TS pressentie : `packages/qcommon/src/protocol.ts`, `packages/client/src/parse.ts`
  - Statut : porte et branche.
  - Notes : dispatch dans `CL_ParseServerMessage`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CL_ParseInventory` | fonction | `packages/client/src/parse.ts` | `CL_ParseInventory` | Porte | Lit `MAX_ITEMS` shorts. |
| `Inv_DrawString` | fonction | `packages/client/src/inventory.ts` | `Inv_DrawString`, `Inv_DrawStringRef` | Porte | Commande texte 8x8 et chemin immediat `ref.DrawChar`. |
| `SetStringHighBit` | fonction | `packages/client/src/inventory.ts` | `SetStringHighBit` | Porte | Chaine immutable TS. |
| `CL_DrawInventory` | fonction | `packages/client/src/inventory.ts` | `CL_DrawInventory`, `CL_DrawInventoryRef` | Porte et branche | Appele par `screen.ts`. |
| `DISPLAY_ITEMS` | macro locale | `packages/client/src/inventory.ts` | `DISPLAY_ITEMS` | Porte | Valeur `17`. |
| `cl.inventory` | state | `packages/client/src/types.ts` | `ClientRuntime.cl.inventory` | Porte | Taille `MAX_ITEMS`. |
| `STAT_LAYOUTS & 2` | branchement HUD | `packages/client/src/screen.ts` | `SCR_DrawHudRef`, `SCR_BuildHudDrawCommands` | Porte | Declenche l'overlay inventaire en runtime et en snapshots/tests. |
| `"inventory"` | asset | `packages/renderer-three/src/gl-image.ts` | image `pics/inventory.pcx` via `ref.DrawPic` | Porte | Pic source `CL_DrawInventory`. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/types.ts`, `packages/client/src/parse.ts`
- Client : `packages/client/src/inventory.ts`, `packages/client/src/screen.ts`, `packages/client/src/index.ts`
- Server : `packages/game/src/g_cmds.ts` emet `svc_inventory`
- Renderer common : non applicable pour le runtime HUD actuel.
- Renderer three : `packages/renderer-three/src/gl-draw.ts`, `packages/renderer-three/src/three-gl-draw-adapter.ts`, `packages/renderer-three/src/ref-gl-host.ts`
- Web / platform : consommation HUD via `SCR_DrawHudRef` et `refexport_t`
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-screen-header.ts`, `scripts/verify/quake2-gl-draw.ts`, `scripts/verify/quake2-three-gl-draw-adapter.ts`
