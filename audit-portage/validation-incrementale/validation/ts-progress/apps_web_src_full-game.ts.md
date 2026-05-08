# Progress TS - apps/web/src/full-game.ts

## Etat

- Statut: En cours
- Dernier lot traite: `BASEQ2_PAK_CANDIDATES`, `LOOSE_VIDEO_CANDIDATES`, `STARTUP_CINEMATICS`, `LOGICAL_WIDTH`, `LOGICAL_HEIGHT`
- Verdict: 5 symboles `Valide`; constantes de bootstrap web `Category: New`, sans proprietaire C/H attendu.

## Preuves de la session

- Checklist TS appliquee: identification TS, export non, `Original name: N/A`, `Source: N/A (web adapter)`, `Category: New`, absence de matrice C/H liee, ownership `apps/web`.
- Recherche de doublons: `BASEQ2_PAK_CANDIDATES` existe aussi dans `apps/web/src/main.ts`, comme constante locale de page demo; pas un doublon de portage C/H proprietaire.
- En-tete ajoute dans `apps/web/src/full-game.ts` pour expliciter le lot de constantes `New`.

## Jugement integration

- Runtime: non applicable justifie; ces constantes parametrent le chargement navigateur et la taille logique, sans remplacer une entite C/H proprietaire.
- apps/web: integre dans `createMountedFilesystem`, `createPage`, les refs de dessin et les renderers frontend/game du meme fichier.
- renderer-three: integre indirectement via les dimensions logiques transmises aux adapters Three.js; aucune logique renderer proprietaire remplacee.

## Tests lances

- `npm run typecheck` passe.

## Prochain lot recommande

Traiter `DrawCommand`, `FullGamePage`, `CanvasAssetCache`, `FullGameRuntime`, `FullGameAudioDebugState`.
