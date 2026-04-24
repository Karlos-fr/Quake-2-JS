# Checklist d'audit d'un fichier porte Quake2JS

Date de creation : 2026-04-24

## 1. Objet

Cette checklist sert de grille d'audit pour verifier un fichier porte ou un groupe de fichiers associes a une source Quake II originale.

Elle doit etre utilisee quand une demande ressemble a :

> Verifie le portage de `packages/.../x.ts` par rapport au source original.

L'audit ne doit pas seulement verifier le contenu du fichier. Il doit aussi verifier que le comportement est ISO avec Quake II original, que le code respecte les regles du `README.md`, que le decoupage est coherent, et que le resultat est correctement branche jusqu'aux consommateurs finaux : runtime, client, rendu, audio, web.

## 2. Fiche d'identification

A remplir au debut de chaque audit.

```md
Fichier audite :
Source C/H principale :
Sources C/H secondaires :
Package :
Type de fichier :
Statut dans PORTAGE_QUAKE2.md :
Niveau de fidelite annonce :
Role attendu :
Consommateurs directs :
Consommateurs finaux :
Tests existants :
Conclusion audit :
```

Types de fichier possibles :

- `Strict` : port runtime proche du source original.
- `Close` : port proche avec adaptations TypeScript documentees.
- `Adapter` : pont renderer, web, audio ou plateforme.
- `NewTooling` : outil, verification ou generation.
- `Mixed` : fichier suspect a redecouper ou clarifier.

## 3. Checklist README - Regles generales

### 3.1 Fidelite de portage

- [ ] Le fichier garde le code C original comme source de verite.
- [ ] Les comportements critiques sont portes avant toute modernisation.
- [ ] L'ordre logique des appels correspond au source.
- [ ] Les branches speciales du source sont conservees.
- [ ] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [ ] Les conversions numeriques sont explicites : troncature, signe, byte, short, int, float.
- [ ] Les structures de donnees restent proches du source quand la fidelite compte.
- [ ] Les globals C sont remplaces par un runtime/contexte clair, pas disperses sans controle.
- [ ] Les ecarts volontaires sont documentes dans le fichier ou la fonction.

### 3.2 Separation moteur / rendu / UI

- [ ] Le fichier ne melange pas logique moteur, rendu et UI.
- [ ] Un port `client`, `game`, `server` ou `qcommon` n'importe pas d'adapter web/platform.
- [ ] Un module `Strict` ou `Close` ne depend pas d'un module `Adapter`.
- [ ] Le sens de dependance va du port source vers l'adapter, jamais l'inverse.
- [ ] `apps/web` ne contient pas le comportement principal d'un fichier source original.
- [ ] `packages/platform` ne contient pas le comportement principal d'un fichier source original.
- [ ] `packages/renderer-three` ne porte que du comportement renderer original ou de l'adaptation renderer.
- [ ] Les hooks remplacent seulement les appels renderer/audio/OS, pas la logique source elle-meme.

### 3.3 Decoupage et rattachement source

- [ ] Le fichier TS a une source C/H principale claire.
- [ ] Le rattachement est coherent avec `PORTAGE_QUAKE2.md`.
- [ ] Le fichier principal de rattachement est identifiable.
- [ ] Si le fichier C est decoupe, les sous-fichiers restent rattaches au meme domaine source.
- [ ] Le decoupage ne masque pas la lecture du comportement original.
- [ ] Le fichier ne devient pas un fourre-tout.
- [ ] Les helpers nouveaux restent locaux et subordonnes au portage.
- [ ] Les helpers structurants ou transverses sont extraits dans un fichier clairement rattache.
- [ ] Aucun comportement source principal n'est porte a titre principal dans un adapter.

### 3.4 Nommage

- [ ] Le nom du fichier preserve la tracabilite avec la source originale ou son role.
- [ ] Les fonctions portees conservent le style original : `SV_RunThink`, `G_Spawn`, `CL_Parse...`.
- [ ] Les fonctions nouvelles utilisent `camelCase`.
- [ ] Les types/interfaces modernes utilisent `PascalCase`.
- [ ] Les constantes source conservent leurs noms et valeurs.
- [ ] Les nouvelles constantes utilisent `UPPER_SNAKE_CASE`.
- [ ] Les fichiers purement nouveaux utilisent `kebab-case`.
- [ ] Les noms modernes ne remplacent pas des noms source si cela nuit a la tracabilite.
- [ ] Les exports publics sont homogenes avec les fichiers voisins du package.

### 3.5 Commentaires et documentation dans le code

- [ ] Le fichier a un header de module conforme.
- [ ] Le header indique `File`, `Source` si fichier porte, `Purpose`, `Porting policy`, `Deviations`, `Notes`.
- [ ] Un fichier nouveau indique clairement qu'il n'est pas un port direct.
- [ ] Les fonctions portees ont un header avec `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`.
- [ ] Les fonctions nouvelles ont un header avec `Category: New`, `Purpose`, `Constraints`.
- [ ] Les classes nouvelles ont un header de responsabilite.
- [ ] Les fonctions modifiees substantiellement ont un commentaire mis a jour.
- [ ] Les deviations importantes sont documentees pres du code concerne.
- [ ] Il n'y a pas de documentation laterale inutile si un commentaire local suffit.

## 4. Checklist ISO source

### 4.1 Comparaison structurelle avec le source C

- [ ] Les fonctions sources correspondantes ont ete lues.
- [ ] Les headers `.h` associes ont ete verifies.
- [ ] Les constantes utilisees viennent du bon header/source.
- [ ] Les structs source ont une representation TS equivalente.
- [ ] Les enums et flags conservent leurs valeurs.
- [ ] Les variables globales source ont un equivalent runtime clair.
- [ ] Les macros utiles sont portees ou documentees.
- [ ] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes.

### 4.2 Comparaison comportementale

- [ ] Les entrees de la fonction correspondent au source.
- [ ] Les sorties correspondent au source.
- [ ] Les mutations d'etat correspondent au source.
- [ ] Les erreurs/exceptions remplacent correctement les `Com_Error`, `Sys_Error` ou retours source.
- [ ] Les conditions de retour anticipe sont conservees.
- [ ] Les boucles et leur ordre sont conserves.
- [ ] Les randomisations conservent l'intention source.
- [ ] Les timings sont fideles : `cl.time`, `servertime`, `level.time`, `FRAMETIME`.
- [ ] Les interpolations sont fideles : `lerpfrac`, `backlerp`, `oldorigin`, `oldframe`.
- [ ] Les listes/pools sont manipules comme dans le source.

### 4.3 Effets secondaires obligatoires

Verifier selon le domaine :

- [ ] Entites creees/liberees/linkees.
- [ ] `think`, `touch`, `use`, `nextthink` mis a jour.
- [ ] `s.origin`, `origin`, `old_origin`, `angles`, `velocity` synchronises.
- [ ] Configstrings model/sound/image mises a jour.
- [ ] Modelindex, soundindex, imageindex coherents.
- [ ] Particules active/free modifiees.
- [ ] Dynamic lights allouees, decay et die corrects.
- [ ] Temp entities ajoutees et consommees.
- [ ] Beams, lasers, explosions, sustains mis a jour.
- [ ] Sons emis avec canal, volume, attenuation corrects.
- [ ] Stats HUD/inventaire mises a jour.
- [ ] Cvars/commands respectent les valeurs par defaut source.

## 5. Checklist branchement dans le code porte

### 5.1 Branchement amont

- [ ] Le fichier est appele depuis le bon systeme amont.
- [ ] Les appels remplacent bien le point d'appel source original.
- [ ] Les hooks/injections ne contournent pas le comportement source.
- [ ] Les donnees d'entree sont au bon format et a la bonne unite.
- [ ] Les index protocol/configstrings sont initialises avant consommation.
- [ ] Les evenements locaux et reseau suivent le meme chemin logique quand possible.

### 5.2 Branchement aval

- [ ] Les resultats sont consommes par le module attendu.
- [ ] Les donnees ne restent pas dans une structure intermediaire non lue.
- [ ] Les consumers runtime/client/server sont identifies.
- [ ] Les consumers renderer/audio/web sont identifies.
- [ ] Les sorties inutilisees sont documentees ou branchees.
- [ ] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### 5.3 Branchement client / refresh / rendu

Verifier quand le fichier produit du visible :

- [ ] Le gameplay produit bien les entites, events ou configstrings.
- [ ] Le client parse/sync les transforme en etat client.
- [ ] `ClientRefreshFrame` contient les entites attendues.
- [ ] `ClientRefreshFrame` contient les lights attendues.
- [ ] `ClientRefreshFrame` contient les particles attendues.
- [ ] `ClientRefreshFrame` contient beams/explosions/forceWalls/sustains si applicable.
- [ ] `refresh-entity-sync` consomme les entites/sprites/MD2.
- [ ] `particle-sync` consomme les particules.
- [ ] `gl-world-scene-adapter` consomme les lightstyles/dlights si le monde doit etre affecte.
- [ ] `web-demo-loop` appelle les synchronisations dans le bon ordre.
- [ ] L'effet est visible dans la demo 3D et pas seulement present en memoire.

### 5.4 Branchement audio

Verifier quand le fichier produit du son :

- [ ] Le son source est enregistre dans les assets/configstrings.
- [ ] Le son est emis avec le bon canal.
- [ ] L'attenuation source est conservee.
- [ ] Le volume source est conserve ou documente.
- [ ] Les sons loop sont synchronises et arretes.
- [ ] Les sons positionnes utilisent la bonne origine.
- [ ] Le web audio adapter consomme bien l'evenement.

## 6. Checklist rendu specifique

### 6.1 Monde BSP et brush models

- [ ] Les surfaces visibles passent par le port `gl_rsurf`.
- [ ] Les lightmaps statiques sont chargees.
- [ ] Les lightstyles sont synchronisees.
- [ ] Les dynamic lights passent par `R_PushDlights`.
- [ ] Les dynamic lightmaps sont upload et appliquees.
- [ ] Les UV lightmap sont correctes, y compris pour texture dynamique.
- [ ] Les brush models inline sont rendus et transformes.
- [ ] Les surfaces alpha, sky, water, flowing sont traitees.
- [ ] Les cvars renderer critiques ont une valeur conforme ou documentee.

### 6.2 Alias MD2, sprites et entites refresh

- [ ] Les model paths viennent des configstrings ou d'une sortie source traceable.
- [ ] Les MD2 chargent le bon skin.
- [ ] Les frames et oldframes sont corrects.
- [ ] Le `backlerp` est correct.
- [ ] Les rotations Quake -> Three sont correctes.
- [ ] Les flags `RF_*` sont appliques : fullbright, translucent, depthhack, weaponmodel, shell.
- [ ] L'alias lighting integre l'eclairage statique/dynamique attendu.
- [ ] Les sprites SP2 sont billboards correctement.
- [ ] Les entites temporaires visibles sont converties vers un rendu consomme.

### 6.3 Particules et effets

- [ ] Les particules utilisent les couleurs palette source.
- [ ] Les tailles/triangles/points sont conformes au renderer original ou documentes.
- [ ] Les alpha/alphavel sont fideles.
- [ ] Les trails sont generes au bon moment.
- [ ] Les explosions ont model, frames, skinnum, alpha et light corrects.
- [ ] Les beams/lasers ont endpoints et model corrects.
- [ ] Aucun effet debug web ne remplace un effet source.

## 7. Checklist tests et verification

### 7.1 Tests existants

- [ ] Les tests existants couvrent les fonctions principales.
- [ ] Les tests couvrent les effets secondaires, pas seulement les retours.
- [ ] Les tests couvrent le branchement jusqu'au consommateur final.
- [ ] Les tests ne figent pas un comportement non ISO.
- [ ] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.

### 7.2 Tests a ajouter si manquants

- [ ] Test source -> runtime.
- [ ] Test runtime -> client.
- [ ] Test client -> `ClientRefreshFrame`.
- [ ] Test `ClientRefreshFrame` -> renderer adapter.
- [ ] Test audio si effet sonore.
- [ ] Test regression pour chaque bug trouve.
- [ ] Fixture/golden si comparaison binaire ou comportementale pertinente.

### 7.3 Commandes minimales d'audit

A adapter selon le fichier :

```powershell
npm run typecheck
npm run verify:<domaine>
npx tsx ./scripts/verify/<harnais-cible>.ts
```

Ne pas conclure OK si seuls les types passent.

## 8. Checklist PORTAGE_QUAKE2.md et suivi

- [ ] `PORTAGE_QUAKE2.md` reference la bonne cible principale.
- [ ] La premiere cible listee est la cible principale.
- [ ] Le statut est coherent avec le code reel.
- [ ] Un fichier partiel reste marque en cours ou a analyser.
- [ ] Les ecarts residuels sont notes.
- [ ] Les hooks/stubs temporaires empechent le statut termine.
- [ ] Les plans/TODO ne contredisent pas le statut.

## 9. Niveaux de conclusion

Utiliser une conclusion claire :

- `OK ISO branche` : port fidele, regles README respectees, rendu/audio/web branche si applicable, tests passes.
- `OK avec ecarts documentes` : comportement acceptable mais deviations explicites.
- `Partiel` : port principal present, manque une branche ou un consommateur.
- `Non ISO` : comportement divergent du source.
- `Non branche` : comportement present mais non consomme.
- `Non conforme README` : probleme de decoupage, nommage, dependance ou commentaire.
- `A redecouper` : fichier melange trop de responsabilites.

## 10. Format de reponse attendu pour un audit

Quand cette checklist est appliquee a un fichier, la reponse doit contenir :

```md
## Verdict

Statut :
Risque principal :

## Source verifiee

- Source C/H :
- Port TS :
- Consommateurs :

## Findings

1. [Severite] Probleme
   - Fichier/ligne :
   - Source originale :
   - Impact :
   - Correction recommandee :

## Checklist README

- Conforme :
- Non conforme :
- A verifier :

## Branchement

- Amont :
- Aval :
- Rendu :
- Audio :
- Web :

## Tests

- Passes :
- Manquants :
- A ajouter :

## Decision

- Corriger maintenant :
- Reporter :
- Documenter :
```

## 11. Point d'attention principal

La question centrale de chaque audit est :

> Le comportement original existe-t-il encore, au bon endroit, avec le bon nom, dans le bon ordre, et arrive-t-il jusqu'au joueur ?

Si la reponse est non, le fichier ne doit pas etre considere stable, meme si le code compile.

