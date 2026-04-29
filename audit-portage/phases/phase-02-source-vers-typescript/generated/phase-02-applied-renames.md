# Renommages appliques Phase 02.D

Ce rapport trace la premiere passe de corrections structurelles simples.

## Corrections appliquees

23 renommages simples ont ete appliques avec mise a jour des imports et de `PORTAGE_QUAKE2.md`.

| Ancien fichier | Nouveau fichier |
| --- | --- |
| `packages/client/src/cinematic.ts` | `packages/client/src/cl_cin.ts` |
| `packages/client/src/entities.ts` | `packages/client/src/cl_ents.ts` |
| `packages/client/src/effects.ts` | `packages/client/src/cl_fx.ts` |
| `packages/client/src/input.ts` | `packages/client/src/cl_input.ts` |
| `packages/client/src/inventory.ts` | `packages/client/src/cl_inv.ts` |
| `packages/client/src/main.ts` | `packages/client/src/cl_main.ts` |
| `packages/client/src/newfx.ts` | `packages/client/src/cl_newfx.ts` |
| `packages/client/src/parse.ts` | `packages/client/src/cl_parse.ts` |
| `packages/client/src/screen.ts` | `packages/client/src/cl_scrn.ts` |
| `packages/client/src/tent.ts` | `packages/client/src/cl_tent.ts` |
| `packages/client/src/sound-local.ts` | `packages/client/src/snd_loc.ts` |
| `packages/game/src/g-local.ts` | `packages/game/src/g_local.ts` |
| `packages/qcommon/src/q-shared.ts` | `packages/qcommon/src/q_shared.ts` |
| `packages/qcommon/src/net-chan.ts` | `packages/qcommon/src/net_chan.ts` |
| `packages/renderer-three/src/gl-draw.ts` | `packages/renderer-three/src/gl_draw.ts` |
| `packages/renderer-three/src/gl-image.ts` | `packages/renderer-three/src/gl_image.ts` |
| `packages/renderer-three/src/gl-light.ts` | `packages/renderer-three/src/gl_light.ts` |
| `packages/renderer-three/src/gl-local.ts` | `packages/renderer-three/src/gl_local.ts` |
| `packages/renderer-three/src/gl-mesh.ts` | `packages/renderer-three/src/gl_mesh.ts` |
| `packages/renderer-three/src/gl-rmain.ts` | `packages/renderer-three/src/gl_rmain.ts` |
| `packages/renderer-three/src/gl-rmisc.ts` | `packages/renderer-three/src/gl_rmisc.ts` |
| `packages/renderer-three/src/gl-rsurf.ts` | `packages/renderer-three/src/gl_rsurf.ts` |
| `packages/renderer-three/src/gl-warp.ts` | `packages/renderer-three/src/gl_warp.ts` |

## Corrections non appliquees

Les propositions bloquees ou plus ambigues restent dans `phase-02-rename-plan.md`.
Exemples :

- plusieurs sources voulant renommer le meme fichier cible ;
- destination deja existante ;
- point d'entree public ou module trop generique ;
- cas qui ressemble a un rerattachement plutot qu'a un renommage simple.

## Verification

Commandes executees :

```text
npm run audit:phase2:apply-simple-renames
npm run typecheck
npm run audit:phase2
```

Resultat :

- `npm run typecheck` passe ;
- les rapports phase 00, phase 01 et phase 02 ont ete regeneres ;
- `PORTAGE_QUAKE2.md` a ete mis a jour pour les chemins renommes ;
- aucun verdict de validation comportementale n'a ete ajoute.
