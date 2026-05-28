# Plan de redecoupage des cibles TS de portage

Objectif : remettre en conformite les fichiers portes dont la cible TypeScript
principale ne garde pas un rattachement suffisamment clair avec le fichier C/H
original.

Reference de regle : `README.md`, sections "Regles de rattachement des fichiers
portes" et "Regles de nommage des fichiers portes".

Controle initial :

- Matrices analysees : 142
- Matrices avec au moins une cible TS au meme basename que le C/H source : 134
- Matrices sans cible TS au meme basename : 8

## Principes

- Garder le comportement existant intact pendant le redecoupage.
- Preferer des renommages ou fichiers de rattachement simples avant tout refactor.
- Ne pas deplacer du comportement source original vers `apps/web` ou `platform`.
- Conserver les headers de portage avec `File`, `Source`, `Category`,
  `Fidelity level` et deviations explicites.
- Mettre a jour les imports, exports, matrices C/H, matrices TS si presentes,
  index de validation et avancement global apres chaque lot.
- Valider par `npm run typecheck` et, quand pertinent, par `npm run build`.

## Ecarts identifies

| Source original | Cible actuelle | Probleme | Action cible |
| --- | --- | --- | --- |
| `client/cl_pred.c` | `packages/client/src/view.ts` | Fusion avec `cl_view.c`, pas de `cl_pred.ts` | Extraire la prediction dans `packages/client/src/cl_pred.ts` |
| `client/cl_view.c` | `packages/client/src/view.ts` | Nom trop abstrait | Renommer/rattacher en `packages/client/src/cl_view.ts` |
| `client/screen.h` | `packages/client/src/screen.ts` | Point header cree | Fait |
| `client/sound.h` | `packages/client/src/sound.ts` | Point header strict restaure | Fait |
| `qcommon/crc.c` | `packages/qcommon/src/qcommon.ts` | Mauvais rattachement principal | Creer `packages/qcommon/src/crc.ts` |
| `qcommon/crc.h` | `packages/qcommon/src/qcommon.ts` | Mauvais rattachement principal | Rattacher les declarations CRC a `packages/qcommon/src/crc.ts` |
| `ref_gl/gl_model.c` | `packages/renderer-three/src/gl-model-loader.ts`, `packages/renderer-three/src/gl-model.ts` | Nom modernise, rupture avec convention `gl_*` | Renommer/rattacher en `packages/renderer-three/src/gl_model.ts` ou justifier explicitement |
| `ref_gl/gl_model.h` | `packages/renderer-three/src/gl-model.ts` | Nom modernise, rupture avec convention `gl_*` | Renommer/rattacher en `packages/renderer-three/src/gl_model.ts` ou `gl_model_h.ts` selon decoupage retenu |

## Lots proposes

### Lot 1 - CRC qcommon

But : sortir le portage CRC de `qcommon.ts`.

Actions :

- [x] Creer `packages/qcommon/src/crc.ts`.
- [x] Deplacer les symboles issus de `qcommon/crc.c` et `qcommon/crc.h`.
- [x] Garder les reexports necessaires depuis `packages/qcommon/src/index.ts` et,
  si besoin temporaire, depuis `qcommon.ts`.
- [x] Verifier que `qcommon.ts` reste le point de rattachement de `qcommon.h`, pas
  un fichier fourre-tout.
- [x] Mettre a jour `qcommon_crc.c.md` et `qcommon_crc.h.md`.

Validation :

- [x] `npm run typecheck`
- [x] `npm run build --workspace @quake2js/web`

### Lot 2 - Vue client et prediction

But : separer `client/cl_view.c` et `client/cl_pred.c`.

Actions :

- [x] Renommer ou recreer `packages/client/src/cl_view.ts` comme cible principale de
  `client/cl_view.c`.
- [x] Creer `packages/client/src/cl_pred.ts` pour les fonctions et helpers issus de
  `client/cl_pred.c`.
- [x] Supprimer `view.ts` apres recablage direct vers `cl_view.ts` et `cl_pred.ts`.
- [x] Mettre a jour les imports depuis le client, le web et les exports publics.
- [x] Mettre a jour `client_cl_view.c.md` et `client_cl_pred.c.md`.

Validation :

- [x] `npm run typecheck`
- [x] `npm run build --workspace @quake2js/web`

### Lot 3 - Headers client screen/sound

But : donner un point de rattachement principal clair aux headers publics.

Actions :

- [x] Creer `packages/client/src/screen.ts` comme facade/header principal.
- [x] Renommer `sound-public.ts` en `sound.ts`.
- [x] Deplacer l'ancien flux d'enregistrement de sons dans `sound-registration.ts`.
- [x] Mettre a jour tous les imports/exports.
- [x] Mettre a jour `client_screen.h.md` et `client_sound.h.md`.

Validation :

- [x] `npm run typecheck`
- [x] `npm run build --workspace @quake2js/web`

### Lot 4 - Renderer gl_model

But : restaurer une convention claire pour `ref_gl/gl_model.c` et
`ref_gl/gl_model.h`.

Actions :

- Decider le decoupage cible :
  - option A : `gl_model.ts` pour `gl_model.h` et `gl_model_loader.ts` pour
    `gl_model.c`;
  - option B : `gl_model.ts` comme point principal, avec sous-fichier
    `gl_model_loader.ts` si le fichier devient trop gros.
- Eviter les noms kebab-case pour le port direct du source original.
- Garder les fichiers adapter Three.js separes (`gl-world-scene-adapter.ts`,
  `sky-scene-adapter.ts`, etc.).
- Mettre a jour les imports/exports renderer.
- Mettre a jour `ref_gl_gl_model.c.md` et `ref_gl_gl_model.h.md`.

Validation :

- `npm run typecheck`
- `npm run build --workspace @quake2js/web`

## Verification finale

Apres les quatre lots :

- Rejouer le controle des matrices : chaque fichier source C/H doit avoir au
  moins une cible TS dont le basename correspond au basename source, sauf
  exception explicitement documentee.
- Verifier que les matrices ne contiennent plus de verdict haut de fichier
  incoherent comme `wrong-name` ou `Partiel` pour ces cas.
- Verifier que les headers TS annoncent le bon fichier source et la bonne
  categorie.
- Mettre a jour `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`.
- Faire un commit dedie au redecoupage.
