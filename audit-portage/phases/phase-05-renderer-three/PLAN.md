# Phase 05 - Audit renderer Three.js et renderer-common

## Objectif

Verifier le decoupage, la fidelite du portage `ref_gl/*`, la separation adapter/backend et la qualite runtime.

La phase 05 ne doit pas corriger des manques client/game/server en les ajoutant au renderer.
Si le renderer manque des donnees d'entree, le finding doit revenir vers phase 03 ou phase 04 selon l'origine.

## Mode d'execution LLM

Mission de la phase :

- separer ports `ref_gl/*`, adapters Three.js et contrats renderer ;
- verifier que le renderer consomme les donnees runtime attendues ;
- nettoyer seulement apres preuve.

Deroule optimal :

1. Verifier que les sorties des phases 02, 03 et 04 existent ou que leurs blocages sont explicites.
2. Creer ou completer les outils `P05-TOOL-*`.
3. Mapper `ref_gl/*` vers `renderer-three`.
4. Classer chaque fichier renderer.
5. Decider le role de `renderer-common` avant toute suppression.
6. Inventorier les flux renderer principaux.
7. Auditer chaque module : source, frontieres, flux, tests, code mort, lifecycle.
8. Corriger les violations locales sans ajouter de logique gameplay/client/server.
9. Produire le rapport renderer et les blocages a renvoyer.

Stop conditions :

- donnees client/runtime absentes ;
- fichier renderer non classe ;
- suppression de `renderer-common` non prouvee ;
- port `ref_gl/*` sans tracabilite ;
- flux visible sans verification ou finding.

Sortie de phase attendue pour le LLM suivant :

- chaque fichier renderer a un role et un verdict ;
- chaque flux principal est couvert ou bloque ;
- le nettoyage restant est prouve ou reporte a la phase 06.

## Entrees

- sorties phase 02 : rattachements et exceptions structurelles ;
- sorties phase 03 : refresh frame, entities, particles, dlights, beams, sounds/models/images precaches ;
- sorties phase 04 : chemin full-game et source renderer utilisee par `apps/web` ;
- fichiers source originaux `Quake-2-master/ref_gl/*` ;
- `packages/renderer-three/src/**/*.ts` ;
- `packages/renderer-common/src/**/*.ts` ;
- `packages/client/src/ref.ts` et contrats renderer-facing ;
- tests existants `verify:gl-*`, `verify:three-*`, `verify:refresh-*`, `verify:web-render-*`.

Si la phase 03 ne fournit pas de donnees client/refresh fiables, la phase 05 doit le signaler comme blocage plutot que simuler ces donnees dans le renderer.

## Sous-phase 05.A - Creer les outils de cartographie renderer

Avant l'audit renderer, creer les outils qui separent les ports `ref_gl/*` des adapters Three.js.

Entrees :

- `Quake-2-master/ref_gl/*` ;
- `packages/renderer-three/src/**/*.ts` ;
- `packages/renderer-common/src/**/*.ts`.

Actions :

- creer les outils `P05-TOOL-*` ;
- mapper les ports `ref_gl`.

Sorties :

- `generated/phase-05-refgl-map.json`

Critere de fin :

- chaque fichier renderer est pret a etre classe.

Outils attendus :

- `P05-TOOL-01-refgl-map` : mappeur `ref_gl/* -> packages/renderer-three/src/*.ts`.
- `P05-TOOL-02-renderer-header-checker` : detecteur de fichiers renderer sans header `Source` ou `Fidelity level`.
- `P05-TOOL-03-renderer-boundary-checker` : detecteur d'imports interdits depuis `renderer-three` vers gameplay/server/web.
- `P05-TOOL-04-render-flow-inventory` : inventaire automatique des flux renderer : `refdef`, entities, particles, dlights, beams, sky, HUD.
- `P05-TOOL-05-dead-export-detector` : detecteur de code mort/export non consomme.
- `P05-TOOL-06-renderer-common-usage-mapper` : cartographie des imports/exports de `renderer-common`.
- `P05-TOOL-07-three-resource-lifecycle-checker` : detecteur des allocations/dispositions Three.js sensibles.
- `P05-TOOL-08-renderer-test-linker` : relieur modules renderer -> tests `verify:gl-*` / `verify:three-*`.
- `P05-TOOL-09-renderer-report-generator` : generateur de rapport `phase-05-renderer-report.md`.

Ces outils doivent preceder toute decision de suppression de `renderer-common`.

## Sous-phase 05.B - Classer les fichiers renderer

Chaque fichier `renderer-three` ou `renderer-common` doit etre classe :

Entrees :

- map `ref_gl` ;
- headers renderer ;
- imports.

Actions :

- classer chaque fichier en `refgl-port`, `three-adapter`, `renderer-contract`, `bridge`, etc.

Sorties :

- classification renderer.

Critere de fin :

- aucun fichier renderer ne reste non classe sans finding.

- `refgl-port` : port principal d'un fichier `ref_gl/*` ;
- `three-adapter` : adaptation Three.js/WebGPU/WebGL ;
- `renderer-contract` : contrat partage renderer-neutral ;
- `asset-loader` : chargement/caches d'assets renderer ;
- `bridge` : projection client/refdef vers backend ;
- `legacy-or-dead` : a supprimer ou isoler apres preuve ;
- `ambiguous` : decision humaine requise.

Outils de reference :

- `P05-TOOL-01-refgl-map`
- `P05-TOOL-02-renderer-header-checker`
- `P05-TOOL-03-renderer-boundary-checker`

Un fichier `refgl-port` doit rester tracable au source original.
Un fichier `three-adapter` ne doit pas pretendre etre un port strict.

## Sous-phase 05.C - Decider du role de `renderer-common`

Ne pas supprimer `renderer-common` avant d'avoir produit :

Entrees :

- imports/exports `renderer-common` ;
- flux renderer.

Actions :

- produire un verdict `Keep`, `Reduce`, `Merge`, `Move` ou `Remove`.

Sorties :

- `generated/phase-05-renderer-common-decision.md`

Critere de fin :

- aucune suppression/fusion n'est proposee sans preuve de consommateurs.

- la liste de ses exports ;
- la liste de ses consommateurs ;
- les responsabilites qui ne peuvent pas vivre proprement dans `renderer-three` ;
- les responsabilites qui devraient revenir dans `client` ou un contrat renderer ;
- les fichiers morts ou duplicatifs.

Outil de reference :

- `P05-TOOL-06-renderer-common-usage-mapper`

Verdicts possibles pour `renderer-common` :

- `Keep` : role contractuel clair et consomme ;
- `Reduce` : certains exports morts ou duplicatifs ;
- `Merge into renderer-three` : contenu uniquement backend Three.js ;
- `Move to client contract` : contenu appartient aux contrats client/ref ;
- `Remove` : aucun role restant apres migration documentee.

## Sous-phase 05.D - Inventorier les flux renderer

Entrees :

- sorties phase 03 ;
- chemin renderer phase 04 ;
- fichiers renderer classes.

Actions :

- inventorier refdef, world, entities, particles, dlights, beams, sky, HUD et polyblend.

Sorties :

- `generated/phase-05-render-flow-inventory.json`

Critere de fin :

- chaque flux principal a une source de donnees et un consommateur renderer identifies.

## Sous-phase 05.E - Auditer et nettoyer le renderer

Entrees :

- classification ;
- flux ;
- decision renderer-common.

Actions :

- corriger les violations de frontiere ;
- identifier le code mort ;
- reporter les blocages aux phases 03/04.

Sorties :

- plan de nettoyage renderer ;
- findings renderer.

Critere de fin :

- chaque module renderer a un verdict autorise.

## Sous-phase 05.F - Fermer la phase renderer

Entrees :

- verdicts modules ;
- tests renderer ;
- findings.

Actions :

- produire le rapport final phase 05.

Sorties :

- `generated/phase-05-renderer-report.md`

Critere de fin :

- `renderer-common` a un verdict documente et chaque flux principal est couvert ou bloque.

## Verification architecture

- Distinguer fichiers portes depuis `ref_gl/*` et fichiers nouveaux adapters Three.js.
- Verifier que les ports `ref_gl/*` restent tracables.
- Verifier que `renderer-three` ne porte pas de logique gameplay/client/server hors renderer.
- Verifier le role reel de `renderer-common`.
- Decider seulement apres audit si `renderer-common` doit rester, etre reduit, fusionne ou supprime.

## Procedure par module renderer

Pour chaque fichier renderer :

1. Classer le fichier avec la sous-phase 05.B.
2. Verifier le header avec `P05-TOOL-02-renderer-header-checker`.
3. Verifier les imports interdits avec `P05-TOOL-03-renderer-boundary-checker`.
4. Si `refgl-port`, comparer au fichier `ref_gl/*` avec `P05-TOOL-01-refgl-map`.
5. Si adapter Three.js, verifier qu'il consomme des structures runtime au lieu de creer de la logique source.
6. Relier le fichier aux flux renderer avec `P05-TOOL-04-render-flow-inventory`.
7. Relier le fichier aux tests avec `P05-TOOL-08-renderer-test-linker`.
8. Identifier code mort ou exports non consommes avec `P05-TOOL-05-dead-export-detector`.
9. Identifier risques lifecycle/performance avec `P05-TOOL-07-three-resource-lifecycle-checker`.
10. Produire un verdict module dans `P05-TOOL-09-renderer-report-generator`.

## Verification fonctionnelle

- `refdef_t` et construction de frame.
- World / BSP / surfaces.
- Textures, images, palettes, WAL, skins.
- Alias models MD2.
- Brush models inline.
- Sprites.
- Particles.
- Beams.
- Dynamic lights.
- Lightstyles.
- Sky, warp, alpha, water.
- HUD/draw pics.
- Polyblend, view weapon, render flags.

Chaque flux doit indiquer :

- source des donnees cote client/runtime ;
- modules renderer traverses ;
- backend Three.js touche ;
- tests existants ;
- manques detectes ;
- phase responsable si la donnee d'entree manque.

## Verification technique

- Code mort.
- Frontieres de responsabilite.
- Allocation et reutilisation d'objets Three.js.
- Chargement et cache assets.
- Disposition des ressources.
- Coherence WebGPU/WebGL fallback si applicable.
- Performance seulement apres validation fonctionnelle des chemins principaux.

## Verdicts autorises

- `Renderer OK` : flux porte/branche/teste de bout en bout.
- `OK avec adaptation documentee` : ecart renderer justifie par Three.js/WebGPU/WebGL.
- `Port ref_gl partiel` : source `ref_gl/*` seulement partiellement portee.
- `Adapter incomplet` : backend Three.js ne consomme pas encore correctement les donnees.
- `Boundary violation` : renderer contient ou importe une logique gameplay/client/server interdite.
- `Dead code` : fichier/export non consomme.
- `Bloque par phase 03` : donnees runtime/client absentes ou non fiables.
- `Bloque par phase 04` : chemin web/full-game ne fournit pas la source renderer attendue.

## Sorties attendues

- `audit-portage/phases/phase-05-renderer-three/generated/phase-05-refgl-map.json` produit par `P05-TOOL-01-refgl-map`.
- `audit-portage/phases/phase-05-renderer-three/generated/phase-05-render-flow-inventory.json` produit par `P05-TOOL-04-render-flow-inventory`.
- `audit-portage/phases/phase-05-renderer-three/generated/phase-05-renderer-common-decision.md` produit a partir de `P05-TOOL-06-renderer-common-usage-mapper`.
- `audit-portage/phases/phase-05-renderer-three/generated/phase-05-renderer-report.md` produit par `P05-TOOL-09-renderer-report-generator`.
- Liste des blocages a renvoyer en phase 03.
- Liste des blocages a renvoyer en phase 04.
- Plan de nettoyage renderer si code mort confirme.

## Regles de correction

- Ne pas supprimer `renderer-common` sans rapport de decision.
- Ne pas deplacer de gameplay/client/server dans `renderer-three`.
- Ne pas optimiser un flux tant que sa fidelite fonctionnelle n'est pas tranchee.
- Toute correction d'un port `ref_gl/*` doit conserver ou documenter la tracabilite source.
- Toute correction d'un adapter Three.js doit rester marquee comme `Adapter`.
- Les optimisations doivent etre accompagnees d'une verification visuelle ou harness pertinent si elles touchent le rendu visible.

## Definition de termine

La phase 05 est terminee quand :

- chaque fichier `renderer-three` et `renderer-common` est classe ;
- chaque port `ref_gl/*` cible a un mapping source -> TS ;
- chaque flux renderer principal a ete inventorie ;
- `renderer-common` a un verdict documente ;
- les violations de frontiere sont corrigees ou listées ;
- le code mort est confirme avant suppression ;
- les blocages runtime sont renvoyes vers phase 03 ;
- les blocages web/full-game sont renvoyes vers phase 04 ;
- les verdicts renderer sont relies a des tests ou verifications ciblees.
