# Phase 04 - Audit de `apps/web` comme integration

## Objectif

Verifier que `apps/web` orchestre le jeu porte sans devenir le lieu principal de la logique Quake II.

La phase 04 ne doit pas corriger les manques runtime en ajoutant de la logique jeu dans `apps/web`.
Si un manque concerne `game`, `server`, `client` ou `qcommon`, il doit revenir en phase 03.

## Mode d'execution LLM

Mission de la phase :

- verifier que `apps/web` est un integrateur ;
- tracer le chemin full-game authoritative ;
- detecter les contournements du runtime porte.

Deroule optimal :

1. Verifier que la phase 03 fournit un runtime suffisamment branche ou des blocages explicites.
2. Creer ou completer les outils `P04-TOOL-*`.
3. Generer le graphe d'imports web.
4. Detecter violations de frontiere, fuites gameplay et anciens harnais.
5. Tracer le chemin `command -> client -> transport -> server -> snapshot -> refresh -> renderer`.
6. Classer chaque module `apps/web/src`.
7. Relier les chemins critiques aux tests `verify:full-game:*`.
8. Produire le rapport web et renvoyer les blocages aux phases responsables.

Stop conditions :

- runtime phase 03 non branche et non documente ;
- logique gameplay trouvee dans `apps/web` ;
- chemin full-game impossible a tracer ;
- dependance a un harnais legacy comme chemin principal ;
- renderer non alimentable par le client runtime.

Sortie de phase attendue pour le LLM suivant :

- chaque module web est classe ;
- le chemin full-game est trace ou bloque ;
- les sujets renderer sont transmis a la phase 05.

## Entrees

- sorties phase 03 : matrice runtime, rapport runtime, findings ouverts ;
- `apps/web/src/**/*.ts`
- `packages/platform/src/**/*.ts`
- chemins runtime valides : `qcommon`, `client`, `server`, `game`, `renderer-three`
- tests existants `verify:full-game:*`
- page cible `apps/web/full-game.html`

Si la phase 03 indique que le chemin authoritative local n'est pas suffisamment branche, la phase 04 doit le noter comme blocage au lieu de le contourner.

## Sous-phase 04.A - Creer les outils de controle d'integration web

Avant l'audit manuel de `apps/web`, creer les outils qui detectent les contournements du runtime porte.

Entrees :

- `apps/web/src/**/*.ts` ;
- sorties phase 03.

Actions :

- creer les outils `P04-TOOL-*` ;
- produire le graphe d'imports web.

Sorties :

- outils dans `tools/` ;
- `generated/phase-04-web-import-graph.json`

Critere de fin :

- chaque fichier web peut etre classe automatiquement ou signale ambigu.

Outils attendus :

- `P04-TOOL-01-web-import-graph` : analyseur d'import depuis `apps/web`.
- `P04-TOOL-02-boundary-violation-detector` : detecteur d'import direct vers modules interdits ou suspects.
- `P04-TOOL-03-web-gameplay-leak-detector` : detecteur de logique gameplay locale dans `apps/web` par symboles et marqueurs.
- `P04-TOOL-04-legacy-harness-detector` : detecteur des usages de `FullGameLocalSession` et anciens harnais demo.
- `P04-TOOL-05-full-game-path-tracer` : traceur du chemin `command -> client -> transport -> server -> snapshot -> refresh -> renderer`.
- `P04-TOOL-06-full-game-test-linker` : relieur modules web -> tests `verify:full-game:*`.
- `P04-TOOL-07-web-integration-report-generator` : generateur de rapport `phase-04-web-integration-report.md`.

Ces outils doivent aider a prouver que `apps/web` integre le runtime au lieu de le remplacer.

## Sous-phase 04.B - Verifier les frontieres web/runtime

Entrees :

- graphe d'imports ;
- regles de frontiere.

Actions :

- detecter les contournements runtime ;
- detecter les fuites gameplay dans `apps/web`.

Sorties :

- `generated/phase-04-boundary-violations.json`

Critere de fin :

- chaque violation est classee ou renvoyee vers phase 03.

## Sous-phase 04.C - Tracer le chemin full-game

Entrees :

- `full-game.html` ;
- modules `apps/web/src/full-game*` ;
- runtime valide phase 03.

Actions :

- tracer `command -> client -> transport -> server -> snapshot -> refresh -> renderer`.

Sorties :

- `generated/phase-04-full-game-path.md`

Critere de fin :

- le chemin authoritative est trace ou le blocage est documente.

## Sous-phase 04.D - Auditer module web par module web

Entrees :

- graphe imports ;
- violations ;
- chemin full-game.

Actions :

- classer chaque fichier web ;
- isoler les anciens harnais ;
- relier les tests `verify:full-game:*`.

Sorties :

- verdict par module web ;
- findings web.

Critere de fin :

- chaque fichier `apps/web/src/*.ts` est classe.

## Sous-phase 04.E - Fermer la phase integration web

Entrees :

- verdicts module ;
- scenarios d'integration ;
- tests full-game.

Actions :

- produire le rapport final phase 04 ;
- renvoyer les blocages runtime/renderer vers phase 03/05.

Sorties :

- `generated/phase-04-web-integration-report.md`

Critere de fin :

- le verdict global de phase 04 est choisi parmi les verdicts autorises.

## Frontieres autorisees

`apps/web` peut contenir :

- bootstrap HTML/Vite ;
- creation des runtimes ;
- orchestration de la boucle navigateur ;
- transport loopback local ;
- input navigateur ;
- stockage web config/save ;
- branchement audio web ;
- branchement renderer ;
- UI minimale, menus ou shell quand ils appellent les commandes runtime.

`apps/web` ne doit pas contenir :

- logique gameplay source ;
- physique, collision ou prediction source a titre principal ;
- spawn d'entites source ;
- regles items/armes/degats/mort/changelevel ;
- parsing snapshots source ;
- comportement IA ;
- compensation locale d'un manque serveur/client/game/qcommon.

## Verification du chemin full-game

Verifier le chemin :

```text
Game/Menu/Console
-> command buffer qcommon/client
-> client local
-> transport loopback
-> server authoritative
-> game
-> snapshots
-> client parse/refresh
-> renderer
```

Verifier aussi :

- `apps/web` ne compense pas les trous de `game`, `client`, `server` ou `qcommon` ;
- le chemin full-game utilise bien les packages runtime ;
- les anciens harnais demo/local-session ne sont pas le chemin gameplay principal ;
- les saves, config, input, audio et bootstrap restent des adapters web ;
- les tests `verify:full-game:*` couvrent les chemins critiques.

Outils de reference :

- `P04-TOOL-05-full-game-path-tracer`
- `P04-TOOL-06-full-game-test-linker`
- `P04-TOOL-07-web-integration-report-generator`

## Procedure par module web

Pour chaque fichier `apps/web/src/*.ts` :

1. Generer ses imports avec `P04-TOOL-01-web-import-graph`.
2. Verifier les violations de frontiere avec `P04-TOOL-02-boundary-violation-detector`.
3. Scanner les marqueurs de logique gameplay avec `P04-TOOL-03-web-gameplay-leak-detector`.
4. Verifier l'usage eventuel d'anciens harnais avec `P04-TOOL-04-legacy-harness-detector`.
5. Classer le fichier :
   - `adapter-ok` : integration web legitime ;
   - `bootstrap-ok` : bootstrap/shell sans logique source ;
   - `legacy-demo-only` : harnais conserve mais hors chemin principal ;
   - `runtime-bypass` : contournement de client/server/game/qcommon ;
   - `gameplay-leak` : logique source presente dans `apps/web` ;
   - `ambiguous` : decision humaine requise.
6. Relier les tests `verify:full-game:*` avec `P04-TOOL-06-full-game-test-linker`.
7. Reporter tout manque runtime vers phase 03.
8. Reporter tout manque renderer vers phase 05.

## Verification des scenarios d'integration

Scenarios minimum :

- chargement de `full-game.html` ;
- `newgame` / `gamemap` ;
- connexion locale client/serveur ;
- input joueur via commandes runtime ;
- frame serveur authoritative ;
- snapshot serveur ;
- parsing client ;
- source refresh client ;
- rendu via renderer ;
- son event route vers audio adapter ;
- save/load/config via adapters web ;
- absence de dependance au chemin legacy local-session pour le gameplay principal.

Chaque scenario doit indiquer :

- fichiers `apps/web` traverses ;
- packages runtime appeles ;
- tests existants ;
- findings ouverts.

## Findings typiques

- Gameplay implemente dans `apps/web`.
- Etat jeu duplique hors serveur/client.
- Raccourcis web qui contournent `Cbuf`, `CL_Frame`, `SV_Frame` ou le parsing snapshots.
- Renderer alimente par une source locale non authoritative au lieu du client runtime.

## Sorties attendues

- `audit-portage/phases/phase-04-apps-web-integration/generated/phase-04-web-import-graph.json` produit par `P04-TOOL-01-web-import-graph`.
- `audit-portage/phases/phase-04-apps-web-integration/generated/phase-04-boundary-violations.json` produit par `P04-TOOL-02-boundary-violation-detector`.
- `audit-portage/phases/phase-04-apps-web-integration/generated/phase-04-full-game-path.md` produit par `P04-TOOL-05-full-game-path-tracer`.
- `audit-portage/phases/phase-04-apps-web-integration/generated/phase-04-web-integration-report.md` produit par `P04-TOOL-07-web-integration-report-generator`.
- Liste des contournements runtime a renvoyer en phase 03.
- Liste des sujets renderer a renvoyer en phase 05.

## Verdicts autorises

- `Integration OK` : `apps/web` orchestre correctement le runtime porte.
- `OK avec legacy isole` : anciens harnais presents mais exclus du chemin principal.
- `Runtime bypass` : contournement du runtime source.
- `Gameplay leak` : logique jeu source presente dans `apps/web`.
- `Bloque par phase 03` : le runtime n'est pas assez complet pour conclure.
- `Bloque par phase 05` : le renderer empeche la validation du chemin complet.

## Definition de termine

La phase 04 est terminee quand :

- chaque fichier `apps/web/src/*.ts` est classe ;
- le chemin full-game authoritative est trace ;
- les anciens harnais demo/local-session sont isoles ou signales ;
- aucune logique gameplay source principale ne reste dans `apps/web` sans finding ;
- chaque contournement runtime est renvoye vers phase 03 ;
- chaque blocage renderer est renvoye vers phase 05 ;
- les tests `verify:full-game:*` critiques sont identifies ou crees ;
- le verdict global est documente.
