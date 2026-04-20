# Quake2JS

Portage structure de Quake II original vers TypeScript / JavaScript pour le navigateur.

Le projet repart volontairement de zero pour privilegier un portage fidele, industrialisable et pilotable, plutot qu'un prototype de rendu accumule au fil de l'eau.

## References locales

- Source C originale : [Quake-2-master](C:\a\Projets\Quake-2\Quake-2-master)
- Installation originale avec assets : [Quake 2](<C:\a\Projets\Quake-2\Quake 2>)
- Suivi fichier par fichier du depot source : [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md)
- Plan de portage du depot courant : [PLAN_QUAKE2JS.md](C:\a\Projets\Quake-2\PLAN_QUAKE2JS.md)

## Objectif

Le but n'est pas de "refaire un FPS inspire de Quake II".
Le but est de porter Quake II original en preservant d'abord :

- les comportements moteur critiques ;
- les structures de donnees et conventions du code source ;
- l'ordre logique des appels ;
- la separation entre logique moteur, bridge de rendu et backend web.

Le rendu cible est :

- `Three.js` comme backend principal ;
- `WebGPU` quand disponible ;
- fallback `WebGL` quand `WebGPU` ne l'est pas.

## Regle fondamentale

On ne reinvente pas Quake II.
On le porte.

En cas de doute entre "moderniser" et "rester fidele", on choisit d'abord la fidelite, sauf dans :

- les adaptateurs web ;
- l'outillage ;
- les couches purement plateforme ;
- le backend de rendu.

## Strategie de portage

- Garder le code C original comme source de verite.
- Porter d'abord les briques runtime dont dependent plusieurs sous-systemes.
- Conserver autant que possible les noms, le decoupage et les conventions du source.
- Construire des outils qui assistent le portage, mais ne remplacent pas la validation humaine.
- Isoler clairement le bridge moteur -> renderer -> Three.js.
- Verifier par petits harnais cibles plutot que par grosses integrations opaques.

## Regles de codage

- Preferer un portage explicite a une traduction "intelligente" trop aggressive.
- Conserver les noms originaux quand une fonction, une constante ou une structure provient directement du code C.
- Eviter les refactors structurels tant que le comportement n'est pas porte et valide.
- Limiter l'OOP dans le coeur du portage. Les classes sont surtout reservees aux adaptateurs, outils et couches d'orchestration.
- Privilegier les donnees simples, tableaux types et buffers binaires quand la fidelite memoire compte.
- Ne jamais melanger moteur, rendu et UI dans un meme module.

### Fichiers purement nouveaux

Utiliser `kebab-case` :

- `three-bsp-mesh-builder.ts`
- `binary-reader.ts`
- `render-scene-bridge.ts`
- `c-header-indexer.ts`

### Fonctions portees

Conserver le style original :

- `SV_RunThink`
- `G_Spawn`
- `PM_StepSlideMove`
- `CM_BoxTrace`

### Fonctions purement nouvelles

Utiliser `camelCase` si ce ne sont pas des copies ou ports directs :

- `buildBspMesh`
- `loadWalTexture`
- `createEntityRenderProxy`

### Types et interfaces modernes

Utiliser `PascalCase` :

- `BspMap`
- `WalTexture`
- `RenderEntity`
- `GameTickContext`

### Constantes

- conserver les constantes d'origine si elles existent ;
- utiliser `UPPER_SNAKE_CASE` pour les nouvelles constantes.

### Valeurs numeriques et fidelite binaire

- Preserver autant que possible les tailles, signes et conventions numeriques du source original.
- Ne pas remplacer implicitement un `byte`, `short`, `int`, `float` ou champ packe par un type JS plus vague sans raison documentee.
- Les conversions, troncatures, arrondis et reinterpretations signees ou non signees doivent rester explicites.
- Quand la fidelite binaire ou memoire compte, preferer `TypedArray`, `DataView` et buffers plutot qu'une modelisation objet plus abstraite.
- Toute deviation sur une convention numerique critique doit etre documentee dans le fichier ou la fonction concernee.

## Regles de documentation

- La documentation doit vivre d'abord dans le code.
- Chaque nouveau fichier source doit avoir un header de module quand son role n'est pas immediat.
- Chaque nouvelle fonction doit avoir un header de commentaire qui decrit son role.
- Chaque nouvelle classe doit avoir un header de commentaire qui decrit sa responsabilite.
- Toute fonction modifiee de maniere substantielle doit voir son commentaire de tete ajoute ou mis a jour.
- `docs/` est reserve aux sujets transverses : architecture, conventions, decisions structurantes, rapports globaux.
- Eviter de produire une documentation laterale si un commentaire de module ou de fonction suffit.

## En-tetes de fichiers

### En-tete standard pour fichier porte

```ts
/**
 * File: sv_physics.ts
 * Source: Quake II original / server/sv_phys.c
 * Purpose: Port of server-side physics routines.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - None.
 *
 * Notes:
 * - This file is intended to stay close to the original C source.
 */
```

### En-tete standard pour fichier nouveau

```ts
/**
 * File: three-bsp-mesh-builder.ts
 * Purpose: Convert Quake II BSP surfaces into Three.js geometries.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the engine data model and the rendering backend.
 *
 * Dependencies:
 * - packages/formats
 * - packages/renderer-common
 * - three
 */
```

## En-tetes de fonctions

### Fonction portee quasi directement

```ts
/**
 * Original name: SV_Physics_Step
 * Source: server/sv_phys.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Executes step-based physics for monster/entity movement.
 *
 * Porting notes:
 * - Preserve call order and side effects.
 * - Do not simplify collision checks without trace validation.
 */
```

### Fonction nouvelle

```ts
/**
 * Category: New
 * Purpose: Build a Three.js mesh from parsed BSP geometry.
 *
 * Constraints:
 * - Must not mutate source BSP data.
 * - Must preserve surface-to-material mapping.
 */
```

## Niveaux de fidelite

Chaque fichier ou fonction doit etre marque avec un niveau de fidelite cible :

- `Strict` : comportement devant rester quasi identique
- `Close` : comportement tres proche, petites adaptations techniques
- `Adapter` : code de pont, non present dans l'original
- `NewTooling` : outillage de portage, hors runtime jeu

Exemples :

- collision / traces -> `Strict`
- boucle tick serveur -> `Strict`
- parsing PAK/BSP -> `Strict`
- conversion BSP -> Three.js -> `Adapter`
- inspecteur de ressources -> `NewTooling`

## Regles de portage

- Le portage peut se faire par blocs coherents, mais chaque bloc doit rester rattachable a un fichier source principal.
- Tout nouveau portage doit viser directement une cible principale claire.
- Les adaptations web doivent etre clairement identifiees comme `Adapter` ou `NewTooling`.
- Les comportements critiques de `qcommon`, `server`, `game`, `client` et des parseurs binaires doivent viser une fidelite `Strict` ou `Close`.
- Chaque ecart volontaire au code original doit etre explicite dans le commentaire du fichier ou de la fonction concernee.

### Regles de dependance entre portage et adapters

- Un module `Strict` ou `Close` ne doit jamais importer un module `Adapter`.
- Un module `Adapter` peut dependre d'un module `Strict` ou `Close`, jamais l'inverse.
- La dependance doit toujours aller du portage source vers l'adaptation plateforme, jamais l'inverse.
- Aucun fichier `apps/web`, `platform` ou assimilable ne doit devenir le lieu principal d'un comportement source original.
- Cas particulier :
  - pour le renderer original `ref_gl/*`, une cible principale dans une couche renderer dediee est acceptable si cette couche est explicitement assumee comme zone de portage renderer et non comme simple glue plateforme.

### Ecarts autorises dans un port

- Les ecarts autorises sont :
  - l'adaptation des types, buffers et structures pour TypeScript ;
  - le remplacement des globals C par un runtime explicite ;
  - la separation en sous-fichiers pour la maintenabilite ;
  - le remplacement des appels renderer, audio, OS ou plateforme par des hooks, contrats ou interfaces.
- Les ecarts suivants sont interdits sauf justification explicite documentee :
  - changer l'ordre des appels ;
  - simplifier une branche sans verification ;
  - fusionner plusieurs comportements source dans une API moderne qui nuit a la tracabilite ;
  - deplacer un comportement coeur du portage dans un adapter.
- Exception structuree :
  - le portage principal des fichiers `ref_gl/*` peut vivre dans une couche renderer dediee lorsque le comportement source concerne directement le pipeline de rendu original.

### Regles de rattachement des fichiers portes

- Pour les fichiers `.c`, viser autant que possible `1 fichier .c -> 1 fichier .ts`.
- Si un fichier `.c` est trop gros, un decoupage en sous-fichiers est autorise pour la maintenabilite.
- En cas de decoupage d'un fichier `.c`, conserver un fichier TS principal qui porte le nom ou le role principal du fichier source et sert de point de rattachement.
- Pour les fichiers `.h` purement declaratifs, viser autant que possible `1 fichier .h -> 1 fichier .ts`.
- Si un fichier `.h` est trop gros, un decoupage en sous-fichiers est autorise pour la maintenabilite.
- En cas de decoupage d'un fichier `.h`, conserver un fichier TS principal ou un point de rattachement explicite permettant d'identifier clairement la cible principale du header source.
- Pour les fichiers `.h` mixtes, contenant declarations, constantes, structs et conventions de couplage, un decoupage est autorise si necessaire, mais un point de rattachement principal explicite doit rester identifiable.
- Le code web, `Three.js`, `WebGPU`, `WebGL` ou audio navigateur doit toujours vivre dans des fichiers `Adapter`.
- Un fichier `Adapter` ne doit jamais etre le lieu principal du portage d'un comportement source original.
- Exception renderer :
  - pour les fichiers `ref_gl/*`, une cible principale dans une couche renderer dediee est autorisee si elle reste clairement traceable au source original.

### Regles de nommage des fichiers portes

- Si un fichier TS est la cible principale d'un fichier source original, il doit autant que possible garder un nom proche du role du source.
- Eviter de renommer un fichier porte avec un nom trop moderne ou trop abstrait si cela casse la tracabilite.
- En cas de decoupage, le fichier principal doit rester celui qui preserve le mieux le rattachement au fichier source d'origine.

### Helpers nouveaux dans un fichier porte

- Un fichier porte peut contenir de petits helpers nouveaux si cela sert directement la traduction du code source.
- Ces helpers doivent rester locaux, simples et subordonnes a la structure d'origine.
- Si les helpers deviennent nombreux, structurants ou transverses, ils doivent etre extraits dans un sous-fichier clairement rattache au meme fichier source principal.
- Les helpers ne doivent pas masquer ni remplacer la lecture du comportement source original.

### Definition d'un fichier termine

- Un fichier source original ne peut passer en `✅` que si sa cible principale est claire.
- Il ne peut passer en `✅` que si ses comportements critiques sont portes.
- Il ne peut passer en `✅` que si ses ecarts residuels sont documentes.
- Il ne peut passer en `✅` que s'il n'est pas porte a titre principal dans un adapter.
- Il ne peut passer en `✅` que si `PORTAGE_QUAKE2.md` reflete correctement son rattachement.

### Statut des fichiers partiellement portes

- Un fichier `🟠` doit expliciter ce qui manque encore au minimum dans le plan courant, dans `PORTAGE_QUAKE2.md` ou dans le header du fichier principal.
- Un fichier partiellement porte ne doit pas etre laisse dans un etat ambigu ou il semble complet sans que les branches manquantes soient identifiees.
- Les stubs temporaires sont autorises pour debloquer une chaine de portage, mais ils doivent etre identifies explicitement comme temporaires et references dans le suivi.

## Decoupage en fichiers

### Regle generale

Un fichier doit contenir une responsabilite principale.

### Accepte

- un gros fichier porte quasi tel quel si cela preserve la fidelite ;
- un fichier dedie a une famille coherente de fonctions d'origine ;
- un adaptateur technique isole.

### A eviter

- un fichier fourre-tout ;
- melanger moteur, rendu et UI ;
- fusionner plusieurs anciens fichiers C trop tot.

### Recommandation

Au debut du portage :

- rester proche du decoupage C d'origine.

Dans un second temps :

- extraire prudemment certains sous-modules si cela n'altere pas la fidelite.

## Regles pour l'outillage

- Les outils de portage doivent aider a analyser, indexer, comparer, generer des stubs et valider.
- On ne vise pas un transpileur magique C -> TS totalement autonome.
- Les outils attendus sont surtout :
  - index de symboles et headers ;
  - extraction de signatures ;
  - generation de stubs ;
  - mapping structs / enums / constantes ;
  - diff de traces ou de comportements ;
  - supports de golden tests.

## Regles de verification

- Preferer des commandes courtes et ciblees.
- Valider chaque bloc important avec un harnais dedie quand c'est pertinent.
- Eviter les longues commandes monolithiques qui masquent les blocages.
- Une integration large n'est utile qu'apres validation des briques qui la composent.

### Validation minimale des blocs `Strict`

- Un bloc `Strict` important ne doit pas etre considere stable sans au moins une verification ciblee.
- Cette verification peut prendre la forme d'un test, d'une fixture, d'une trace de reference ou d'une validation manuelle documentee.
- En l'absence de verification ciblee, le bloc ne doit pas etre presente comme complet ou stabilise.

## Regles de suivi

- Maintenir [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md) au fur et a mesure.
- `PORTAGE_QUAKE2.md` n'est pas seulement un tableau de statut ; c'est aussi le referentiel architectural source -> cible principale.
- En cas de divergence entre le code et `PORTAGE_QUAKE2.md`, corriger rapidement l'un des deux.
- Dans la colonne `Cible`, la premiere cible listee doit, autant que possible, etre la cible principale de rattachement.
- Les colonnes `A porter` et `Porte` doivent utiliser des emojis.
- Convention recommandee :
  - `⬜` : pas traite
  - `🟡` : a analyser / a cadrer
  - `🟠` : en cours de portage
  - `✅` : porte
  - `⛔` : non porte volontairement
- Le fichier de suivi doit rester rattache aux fichiers source originaux, pas aux seuls modules TypeScript.
- Convention normalisee a utiliser dans les nouveaux updates :
  - `⬜` : pas traite
  - `🟡` : a analyser / a cadrer
  - `🟠` : en cours de portage
  - `✅` : porte
  - `⛔` : non porte volontairement

## Regles de debug et verification

La convention de suivi a utiliser dans tous les nouveaux updates est :

- `⬜` : pas traite
- `🟡` : a analyser / a cadrer
- `🟠` : en cours de portage
- `✅` : porte
- `⛔` : non porte volontairement

- Les fichiers portes ne doivent pas contenir de logique locale de debug non rattachee au source original.
- Les aides de test, de verification ou de demonstration doivent vivre dans `scripts/verify`, `packages/tests-golden` ou dans des adapters clairement identifies.
- Toute exception doit etre courte, documentee et facile a retirer.

## Architecture cible

```text
apps/
  web/
packages/
  memory/
  math/
  filesystem/
  formats/
  qcommon/
  server/
  game/
  client/
  renderer-common/
  renderer-three/
  platform/
  shared/
  tests-golden/
tools/
  c-analyzer/
  c-header-parser/
  stub-generator/
  llm-port-assist/
  trace-diff/
  asset-inspect/
fixtures/
  golden/
  sample-assets/
  traces/
scripts/
  dev/
  build/
  verify/
  generate/
docs/
```

## Roles des repertoires

- `apps/web` : application navigateur, bootstrap, shell HTML, integration UI minimale.
- `packages/memory` : runtime bas niveau proche du C.
- `packages/math` : types et operations geometriques de base.
- `packages/filesystem` : montage des repertoires et `.pak`.
- `packages/formats` : parseurs binaires Quake II.
- `packages/qcommon` : socle commun, messages, cvars, commandes, utilitaires.
- `packages/server` : monde, snapshots, traces, etat serveur.
- `packages/game` : logique gameplay originale.
- `packages/client` : logique client non liee au rendu.
- `packages/renderer-common` : contrats de rendu independants de Three.js.
- `packages/renderer-three` : bridge de scene et backend Three.js / WebGPU / WebGL.
- `packages/platform` : raccords web, IO hote, temps, input, audio.
- `packages/shared` : types et utilitaires partages sans couplage fort.
- `packages/tests-golden` : golden tests, fixtures de comparaison, rapports.
- `tools/*` : assistance au portage.

## Regles d'implantation dans l'architecture

### Packages runtime

Les packages suivants sont les lieux normaux du portage principal du code source original :

- `packages/memory`
- `packages/math`
- `packages/filesystem`
- `packages/formats`
- `packages/qcommon`
- `packages/server`
- `packages/game`
- `packages/client`

Le comportement source original doit etre porte en priorite dans ces packages.

### Regles de dependance entre packages runtime

- `packages/formats` ne doit pas dependre de `packages/client`, `packages/server` ou `packages/game`.
- `packages/qcommon` doit rester en dessous de `packages/client`, `packages/server` et `packages/game`.
- `packages/shared` ne doit pas devenir une zone fourre-tout recevant du comportement source principal a la place d'un package runtime mieux cible.
- Toute dependance transverse nouvelle doit etre justifiable par le sens du code source original ou par une contrainte de portage documentee.

### Regles de portage des globals C

- Le remplacement des globals C doit privilegier un runtime explicite, un contexte ou une structure d'etat clairement identifiable.
- Eviter de disperser d'anciens globals C en variables de module multiples sans point central de rattachement.
- Quand un global, une structure globale ou un bloc d'etat provient directement du source, conserver autant que possible un nom proche de l'original.

### Regles sur constantes, flags et enums source

- Les constantes, flags, bitmasks et valeurs enum issus du source doivent conserver leurs valeurs numeriques originales.
- Ne pas remplacer un ensemble de flags source par une abstraction moderne incompatible si cela nuit a la tracabilite ou au comportement.
- Toute constante absente, extension locale ou reinterpretation doit etre documentee explicitement.

### Packages et applications adapter

Les repertoires suivants sont des couches d'adaptation et ne doivent pas etre le lieu principal d'un portage source original :

- `packages/platform`
- `apps/web`

Ils peuvent :

- consommer des structures runtime deja portees ;
- projeter ces structures vers le navigateur, le rendu ou l'audio ;
- exposer des contrats et bridges techniques.

Ils ne doivent pas :

- devenir la cible principale d'un fichier `.c` ou `.h` du source original ;
- contenir le coeur logique d'un comportement moteur, gameplay ou client porte.
- reinterpreter la logique source en doublonnant des branches qui devraient vivre dans les packages runtime.

### Couches renderer dediees

Les repertoires suivants sont des couches renderer dediees :

- `packages/renderer-common`
- `packages/renderer-three`

Ils peuvent :

- servir de lieu principal de portage pour des fichiers issus de `ref_gl/*` ;
- porter des contrats et des implementations de rendu directement rattaches au renderer original ;
- exposer ensuite ces resultats au backend Three.js, WebGPU ou WebGL.

Ils ne doivent pas :

- devenir le lieu principal de portage pour `client/*`, `game/*`, `qcommon/*` ou `server/*` ;
- absorber du gameplay, de la prediction, des commandes, du HUD source hors perimetre renderer ou d'autres comportements runtime non renderer.

### Fichier principal de rattachement

Quand un fichier source original est porte :

- il doit avoir une cible TypeScript principale identifiable ;
- cette cible principale doit se trouver dans un package runtime, sauf exception explicite pour le perimetre renderer `ref_gl/*` ;
- si le portage est decoupe en plusieurs sous-fichiers, un fichier principal de rattachement doit rester explicite.

### Exemples de rattachement attendus

Exemples cibles :

- `client/cl_parse.c` -> `packages/client/src/parse.ts`
- `client/cl_main.c` -> `packages/client/src/main.ts`
- `client/cl_view.c` -> `packages/client/src/view.ts`
- `client/cl_fx.c` -> `packages/client/src/effects.ts`
- `client/cl_tent.c` -> `packages/client/src/tent.ts`
- `game/p_weapon.c` -> `packages/game/src/p_weapon.ts`
- `game/g_weapon.c` -> `packages/game/src/g_weapon.ts`
- `qcommon/pmove.c` -> `packages/qcommon/src/pmove.ts`
- `ref_gl/gl_warp.c` -> `packages/renderer-three/src/sky-scene-adapter.ts`

En cas de decoupage :

- le fichier principal reste la reference de rattachement ;
- les sous-fichiers servent seulement a isoler des sous-blocs pour la maintenabilite ;
- les adapters web / renderer consomment le resultat, mais ne portent pas le bloc source a titre principal.

## Priorites de reprise

1. Stabiliser l'architecture et les conventions.
2. Repartir des parseurs et du socle `qcommon`.
3. Construire les outils d'indexation et de generation de stubs.
4. Rebrancher ensuite le client et le bridge de rendu.
5. N'attaquer le rendu map complet, le HUD, le son et le gameplay qu'une fois les couches runtime solides.

## Ce qu'on conserve du depot actuel

- le depot source original ;
- le repertoire d'installation original et ses assets ;
- le fichier de suivi `PORTAGE_QUAKE2.md` ;
- les dependances npm deja installees, tant qu'elles restent utiles a la nouvelle architecture.

## Ce qu'on ne refait pas

- un prototype de rendu detache du vrai pipeline Quake II ;
- une reecriture libre orientee "moteur moderne" ;
- une couche Three.js qui dicte la simulation ;
- une migration sans outillage ni tracabilite par rapport au source C.
