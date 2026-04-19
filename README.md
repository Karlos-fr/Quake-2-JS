# Quake2JS

Portage structure de Quake II original vers TypeScript / JavaScript pour le navigateur.

Le projet repart volontairement de zero pour privilegier un portage fidele, industrialisable et pilotable, plutot qu'un prototype de rendu accumule au fil de l'eau.

## References locales

- Source C originale : [Quake-2-master](C:\a\Projets\Quake-2\Quake-2-master)
- Installation originale avec assets : [Quake 2](<C:\a\Projets\Quake-2\Quake 2>)
- Suivi fichier par fichier du depot source : [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\Quake-2-master\PORTAGE_QUAKE2.md)
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

- Le portage n'a pas besoin d'etre strictement fichier C par fichier C des le premier jour.
- En revanche, chaque bloc porte doit rester rattachable a ses sources d'origine.
- Les adaptations web doivent etre clairement identifiees comme `Adapter` ou `NewTooling`.
- Les comportements critiques de `qcommon`, `server`, `game`, `client` et des parseurs binaires doivent viser une fidelite `Strict` ou `Close`.
- Chaque ecart volontaire au code original doit etre explicite dans le commentaire du fichier ou de la fonction concernee.

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

## Regles de suivi

- Maintenir [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\Quake-2-master\PORTAGE_QUAKE2.md) au fur et a mesure.
- Les colonnes `A porter` et `Porte` doivent utiliser des emojis.
- Convention recommandee :
  - `⬜` : pas traite
  - `🟡` : a analyser / a cadrer
  - `🟠` : en cours de portage
  - `✅` : porte
  - `⛔` : non porte volontairement
- Le fichier de suivi doit rester rattache aux fichiers source originaux, pas aux seuls modules TypeScript.

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
