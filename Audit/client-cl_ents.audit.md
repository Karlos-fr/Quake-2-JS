# Audit Portage Quake II - client/cl_ents.c

Date : 2026-04-26

## Verdict

Statut : Partiel, non ISO bloque
Risque principal : les bitmasks support `U_*` utilises par `cl_ents.c` divergent du C source pour ce chemin, puis plusieurs effets runtime de `CL_AddPacketEntities` restent incomplets.

## Source verifiee

- Source C/H : `Quake-2-master/client/cl_ents.c`, `Quake-2-master/client/client.h`
- Port TS : `packages/client/src/entities.ts` principal pressenti ; secondaires `packages/client/src/parse.ts`, `packages/client/src/refresh.ts`, `packages/client/src/view.ts`, `packages/client/src/effects.ts`
- Consommateurs : `packages/client/src/view.ts`, `packages/client/src/refresh.ts`, `packages/client/src/snd_dma.ts`, `packages/renderer-three/src/refresh-entity-sync.ts`, `apps/web/src/local-client-controller.ts`

## Fiche d'identification

- Fichier audite : `client/cl_ents.c`
- Source C/H principale : `Quake-2-master/client/cl_ents.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, fragments `qcommon/qcommon.h` et `game/q_shared.h` utilises par `cl_ents.c`
- Package : `packages/client`
- Type de fichier : client runtime, parsing snapshots, composition entites refresh
- Statut dans `PORTAGE_QUAKE2.md` : ligne presente, annonce portage ferme
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : `✅` avant redemarrage ; doit etre redecide apres audit complet
- Niveau de fidelite annonce : ISO avec hooks renderer/audio
- Role attendu : parser les entites serveur, interpoler les snapshots et alimenter les scenes, effets et sons
- Consommateurs directs : `parse.ts`, `entities.ts`, `refresh.ts`, `view.ts`, `snd_dma.ts`
- Consommateurs finaux : `renderer-three`, `apps/web`, audio client
- Tests existants : `quake2-cl-parse.ts`, `quake2-entities-phase5.ts`, `quake2-entities-phase8-scene.ts`, `quake2-cl-view.ts`, `quake2-entities-phase9.ts`, `quake2-snd-dma.ts`
- Conclusion audit : Partiel, non ISO bloque

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CL_ParseEntityBits` | Fonction | `packages/client/src/parse.ts` | `CL_ParseEntityBits` | Non valide | structure fidele mais support `U_MOREBITS2/3` divergent pour ce chemin |
| `CL_ParseDelta` | Fonction | `packages/client/src/parse.ts` | `CL_ParseDelta` | Non valide | structure fidele mais depend des `U_*` divergents |
| `CL_DeltaEntity` | Fonction | `packages/client/src/parse.ts` | `CL_DeltaEntity` | Non valide | depend de `CL_ParseDelta` / `U_*` |
| `CL_ParsePacketEntities` | Fonction | `packages/client/src/parse.ts` | `CL_ParsePacketEntities` | Non valide | depend de `CL_ParseEntityBits` / `U_*` ; logs shownet/debug non portes |
| `CL_ParsePlayerstate` | Fonction | `packages/client/src/parse.ts` | `CL_ParsePlayerstate` | Verifie | Lecture et mutations conformes |
| `CL_FireEntityEvents` | Fonction | `packages/client/src/entities.ts` | `CL_FireEntityEvents` | Non valide | `EF_TELEPORTER` extrait puis ignore par le builder d'effets |
| `CL_ParseFrame` | Fonction | `packages/client/src/parse.ts` | `CL_ParseFrame` | Non valide | manque equivalent `SCR_EndLoadingPlaque` |
| `S_RegisterSexedModel` | Fonction | Aucun port direct | Aucun | Verifie non consomme | Aucune reference appelee dans le depot C original |
| `CL_AddPacketEntities` | Fonction | `packages/client/src/entities.ts`, `packages/client/src/refresh.ts` | `CL_BuildPacketEntitySnapshots`, `CL_BuildRefreshFrame` | Non valide | custom models web, color-shell, powerscreen, trails/particules, `RF_BEAM`, `EF_TRAP` et branches `vidref_val` incomplets |
| `CL_AddViewWeapon` | Fonction | `packages/client/src/refresh.ts` | `appendViewWeapon` | Non valide | garde modele introuvable non confirmee |
| `CL_CalcViewValues` | Fonction | `packages/client/src/view.ts` | `CL_CalcViewValues` | Verifie | |
| `CL_AddEntities` | Fonction | `packages/client/src/refresh.ts`, `packages/client/src/view.ts` | `CL_BuildRefreshFrame`, `V_RenderView` | Non valide | depend des items ouverts ; ordre `Run*`/`Add*` a justifier |
| `CL_GetEntitySoundOrigin` | Fonction | `packages/client/src/refresh.ts` | `CL_GetEntitySoundOrigin` | Verifie | |
| `frame_t`, `centity_t`, `client_state_t` | Types | `packages/client/src/types.ts` | memes noms | Verifie pour `cl_ents.c` | adaptations documentees |
| `entity_state_t`, `player_state_t` | Types | `packages/qcommon/src/q-shared.ts` | memes noms | Verifie pour `cl_ents.c` | fragments utilises par ce fichier uniquement |
| `MAX_PARSE_ENTITIES`, `U_*`, `EF_*`, `RF_*` | Constantes | `packages/client/src/types.ts`, `packages/qcommon/src/*` | memes noms | Non valide pour `cl_ents.c` | `MAX_PARSE_ENTITIES`, `EF_*`, `RF_*` OK dans ce perimetre ; `U_*` diverge pour le parsing de ce fichier |

## Checklist README

### Fidelite de portage

- [ ] Le fichier garde le code C original comme source de verite.
- [ ] Les comportements critiques sont portes avant toute modernisation.
- [ ] L'ordre logique des appels correspond au source.
- [ ] Les branches speciales du source sont conservees.
- [ ] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [ ] Les conversions numeriques sont explicites.
- [x] Les structures de donnees restent proches du source quand la fidelite compte.
- [ ] Les globals C sont remplaces par un runtime/contexte clair.
- [x] Les ecarts volontaires sont documentes.

### Nommage, decoupage, rattachement

- [x] Le nom du fichier preserve la tracabilite avec la source.
- [ ] Les fonctions portees conservent le style original.
- [ ] Les fonctions nouvelles utilisent `camelCase`.
- [ ] Les types/interfaces modernes utilisent `PascalCase`.
- [ ] Les constantes source conservent leurs noms et valeurs.
- [x] Le fichier TS a une source C/H principale claire.
- [x] Le rattachement est coherent avec `PORTAGE_QUAKE2.md`.
- [x] Le fichier principal de rattachement est identifiable.
- [ ] Le decoupage ne masque pas la lecture du comportement original.
- [ ] Le fichier ne devient pas un fourre-tout.
- [ ] Les helpers nouveaux restent locaux et subordonnes au portage.

### Commentaires et documentation

- [x] Le fichier a un header de module conforme.
- [x] Le header indique `File`, `Source`, `Purpose`, `Porting policy`, `Deviations`, `Notes`.
- [ ] Les fonctions portees ont un header conforme.
- [ ] Les fonctions nouvelles ont un header conforme.
- [ ] Les deviations importantes sont documentees pres du code concerne.

### Separation runtime / adapter

- [ ] Le fichier ne melange pas logique moteur, rendu et UI.
- [ ] Un module `Strict` ou `Close` ne depend pas d'un module `Adapter`.
- [x] `packages/platform` ne porte pas le comportement principal audite.
- [x] `apps/web` ne porte pas le comportement principal audite.
- [x] Les hooks remplacent seulement les appels renderer/audio/OS.

## Checklist ISO source

### Comparaison structurelle

- [x] Les fonctions sources correspondantes ont ete lues.
- [x] Les headers `.h` associes ont ete verifies.
- [ ] Les constantes utilisees viennent du bon header/source.
- [x] Les structs source ont une representation TS equivalente.
- [ ] Les enums et flags conservent leurs valeurs.
- [x] Les variables globales source ont un equivalent runtime clair.
- [ ] Les macros utiles sont portees ou documentees.
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes.

### Comparaison comportementale

- [ ] Les entrees correspondent au source.
- [ ] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source.
- [x] Les retours anticipes sont conserves.
- [x] Les boucles et leur ordre sont conserves.
- [ ] Les timings sont fideles.
- [ ] Les randomisations conservent l'intention source.
- [ ] Les listes/pools sont manipules comme dans le source.

### Effets secondaires

- [ ] Entites creees/liberees/linkees.
- [ ] `think`, `touch`, `use`, `nextthink` mis a jour.
- [x] Etats runtime synchronises.
- [ ] Configstrings mises a jour.
- [ ] Temp entities mises a jour.
- [x] Sons emis avec les bons parametres.
- [ ] Sorties renderer/audio correctement alimentees si applicable.

## Audit item par item

### Parsing frame et packet entities

- [ ] `CL_ParseEntityBits`
  - Verifie contre `Quake-2-master/client/cl_ents.c` lignes 202-240 et `packages/client/src/parse.ts` lignes 318-335.
  - Meme ordre `MSG_ReadByte`, extensions `U_MOREBITS1/2/3`, lecture `MSG_ReadShort` si `U_NUMBER16`, sinon `MSG_ReadByte`.
  - Non valide en l'etat : les constantes support `U_MOREBITS2/3` utilisees par ce parseur divergent du source C.
  - Ecart secondaire : `bitcounts[32]` de profiling reseau n'est pas porte ; aucun effet runtime sur l'etat client.
- [ ] `CL_ParseDelta`
  - Verifie contre `Quake-2-master/client/cl_ents.c` lignes 247-317 et `packages/client/src/parse.ts` lignes 350-425.
  - Meme base copy, `old_origin = from.origin`, `number`, ordre des modelindex/frame/skinnum/effects/renderfx/origin/angles/oldorigin/sound/event/solid.
  - Non valide en l'etat : logique structurelle fidele, mais les champs lus dependent des bitmasks `U_*` divergents.
- [ ] `CL_DeltaEntity`
  - Verifie contre `Quake-2-master/client/cl_ents.c` lignes 327-381 et `packages/client/src/parse.ts` lignes 1544-1592.
  - Meme index ring `cl.parse_entities & (MAX_PARSE_ENTITIES - 1)`, increment parse count, increment `frame.num_entities`, appel `CL_ParseDelta`.
  - Meme invalidation lerp : changement modelindex1-4, saut origine `> 512`, `EV_PLAYER_TELEPORT`, `EV_OTHER_TELEPORT`.
  - Non valide en l'etat : depend de `CL_ParseDelta`.
- [ ] `CL_ParsePacketEntities`
  - Verifie contre `Quake-2-master/client/cl_ents.c` lignes 388-505 et `packages/client/src/parse.ts` lignes 1596-1682.
  - Meme initialisation `parse_entities` / `num_entities`, sentinelle `99999`, boucle jusqu'a `newnum == 0`, rejet `newnum >= MAX_EDICTS`, rejet fin de message.
  - Meme traitement des entites inchangees, `U_REMOVE`, delta depuis oldstate, delta depuis baseline, puis copie des anciens restants.
  - Non valide en l'etat : depend de `CL_ParseEntityBits` / `CL_ParseDelta`.
  - Ecarts secondaires : `cl_shownet->value == 3` / `Com_Printf` non portes ; le TS garde aussi `oldframe`/`oldstate` pour eviter une dereference nulle.
- [x] `CL_ParsePlayerstate`
  - Verifie contre `Quake-2-master/client/cl_ents.c` lignes 515-631 et `packages/client/src/parse.ts` lignes 440-524.
  - Meme copie initiale depuis `oldframe->playerstate` ou zero-state, lecture `flags = MSG_ReadShort`, puis meme ordre `PS_M_*`, `PS_VIEWOFFSET`, `PS_VIEWANGLES`, `PS_KICKANGLES`, `PS_WEAPONINDEX`, `PS_WEAPONFRAME`, `PS_BLEND`, `PS_FOV`, `PS_RDFLAGS`.
  - Meme conversion `MSG_ReadChar * 0.25`, `MSG_ReadByte / 255`, `MSG_ReadAngle16`, `PM_FREEZE` si `cl.attractloop`, puis boucle `MAX_STATS` sur `statbits`.
- [ ] `CL_ParseFrame`
  - Comparaison commencee contre `Quake-2-master/client/cl_ents.c` lignes 663-764 et `packages/client/src/parse.ts` lignes 1321-1392.
  - Reste ouvert : le port TS ne reproduit pas le `SCR_EndLoadingPlaque()` conditionnel lorsque la premiere frame valide active le client ; `ClientParseHooks` n'expose pas de hook equivalent dans ce chemin.

### Events, snapshots et refresh

- [ ] `CL_FireEntityEvents`
  - Comparaison commencee contre `Quake-2-master/client/cl_ents.c` lignes 639-657, `packages/client/src/entities.ts` lignes 110-145 et `packages/client/src/effects.ts` lignes 1388-1428.
  - Reste ouvert : le port extrait bien les `state.event` et expose `EF_TELEPORTER` comme evenement structure, mais `CL_BuildFrameEntityEventEffects` ignore explicitement cet evenement et `CL_ParseFrame` ne declenche pas `CL_TeleporterParticles(runtime, state)` comme le C.
- [ ] `CL_AddPacketEntities`
  - Comparaison commencee contre `Quake-2-master/client/cl_ents.c` lignes 834-1288, `packages/client/src/entities.ts` lignes 210-347, `packages/client/src/refresh.ts` lignes 146-503 et `packages/client/src/effects.ts` lignes 1323-1355.
  - Valide partiellement : `autorotate`, `autoanim`, promotions `EF_PENT/EF_QUAD/EF_DOUBLE/EF_HALF_DAMAGE`, interpolation origine/angles, `RF_BEAM`, viewer entity skip avec lumieres, linked models `modelindex2/3/4` et lumieres dynamiques principales.
  - Reste ouvert / non conforme : custom player/weapon resolus par `V_RenderView` mais pas par le consommateur direct `renderer-three`, entite color-shell separee absente du refresh, powerscreen non resolu comme `cl_mod_powerscreen`, plusieurs trails/particules automatiques du source ne sont pas executes par `CL_ExecutePacketEntityEffects`, `RF_BEAM` ne reprend pas la randomisation source, `EF_TRAP` ne reproduit pas la mutation d'origine, et les branches `vidref_val` des trackers ne sont pas representees.
- [x] `S_RegisterSexedModel`
  - Verifie par recherche globale : seule definition dans `Quake-2-master/client/cl_ents.c:780`, aucun appel dans le depot C original.
  - Pas de port direct requis pour le runtime actuel ; les chemins effectivement consommes par `CL_AddPacketEntities` (`modelindex == 255`, `modelindex2 == 255`, `RF_USE_DISGUISE`) sont rattaches a `view.ts`.
- [ ] `CL_AddViewWeapon`
  - Comparaison commencee contre `Quake-2-master/client/cl_ents.c` lignes 1293-1344, `packages/client/src/refresh.ts` lignes 274-333 et `packages/client/src/view.ts` lignes 841-849.
  - Conforme : garde `cl_gun` via `drawGun`, garde `fov > 90`, interpolation `gunoffset/gunangles`, overrides debug `gun_model/gun_frame`, `oldframe` si `gunframe == 0`, flags `RF_MINLIGHT | RF_DEPTHHACK | RF_WEAPONMODEL`, `backlerp`, `oldorigin = origin`.
  - Reste ouvert : le C retourne si `gun.model` est nul ; le port peut emettre l'entite refresh avant resolution finale du modele.
- [x] `CL_CalcViewValues`
  - Verifie contre `Quake-2-master/client/cl_ents.c` lignes 1352-1431 et `packages/client/src/view.ts` lignes 983-1048.
  - Meme selection oldframe `(serverframe - 1) & UPDATE_MASK`, fallback frame courante, garde teleport `> 256*8`, prediction avec `PMF_NO_PREDICTION`, `prediction_error`, smoothing step `< 100`, origine non predite, angles predits si `pm_type < PM_DEAD`, kick angles, `AngleVectors`, interpolation FOV et blend courant sans interpolation.
- [ ] `CL_AddEntities`
  - Comparaison commencee contre `Quake-2-master/client/cl_ents.c` lignes 1438-1478, `packages/client/src/refresh.ts` lignes 146-238 et `packages/client/src/view.ts` lignes 819-858.
  - Le garde `cls.state != ca_active` existe dans `V_RenderView` avant appel au builder refresh, mais `CL_BuildRefreshFrame` exporte lui-meme une surface sans ce garde.
  - Le calcul `cl.time` / `cl.lerpfrac` est proche du source, hors logs `cl_showclamp`.
  - Reste a justifier : le C appelle `CL_CalcViewValues`, puis `CL_AddPacketEntities`, `CL_AddTEnts`, `CL_AddParticles`, `CL_AddDLights`, `CL_AddLightStyles`; le port appelle aussi `CL_RunDLights` et `CL_RunLightStyles` dans `CL_BuildRefreshFrame`, avant `CL_BuildPacketEntitySnapshots` / `CL_BuildTEntRefresh`.
  - Verification croisee : dans le C, `CL_RunDLights` / `CL_RunLightStyles` sont appeles par `CL_Frame` apres `SCR_UpdateScreen`, `S_Update` et `CDAudio_Update`; le port expose aussi `onRunDLights` / `onRunLightStyles` dans `CL_Frame`.
  - Reste ouvert car `CL_AddEntities` depend de `CL_AddPacketEntities` et `CL_FireEntityEvents`, qui ont des findings ouverts.
- [x] `CL_GetEntitySoundOrigin`
  - Verifie contre `Quake-2-master/client/cl_ents.c` lignes 1490-1501 et `packages/client/src/refresh.ts` lignes 254-260.
  - Meme rejet d'index hors bornes et meme copie de `cl_entities[ent].lerp_origin`; le port retourne un clone au lieu de muter un `vec3_t` de sortie.

### Blocs compile-out

- [x] `CL_ClearProjectiles`, `CL_ParseProjectiles`, `CL_AddProjectiles` sont documentes comme `#if 0`
  - Verifie dans `Quake-2-master/client/cl_ents.c` lignes 34-190 : bloc integralement compile-out, aucune cible TS requise pour le comportement actif.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [ ] Les donnees ne restent pas dans une structure intermediaire non lue.
- [ ] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
  - Verifie : pas de consommateur principal `renderer-common` requis pour `ClientRefreshFrame`; le chemin audite va directement vers client refdef et `renderer-three`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
  - Verifie : `packages/renderer-three/src/refresh-entity-sync.ts`, `particle-sync.ts`, `gl-world-scene-adapter.ts` consomment `ClientRefreshFrame`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
  - Verifie : `apps/web/src/local-client-controller.ts` construit `CL_BuildRefreshFrame`, `web-demo-loop.ts` et `web-shell.ts` consomment/affichent les sorties.
- [ ] L'effet est visible/consomme et pas seulement present en memoire.

### Audio

- [x] Si applicable, le son source est enregistre.
  - Verifie : `S_Spatialize` consomme `onGetEntitySoundOrigin` pour les sons attaches a une entite, comme le C appelle `CL_GetEntitySoundOrigin` quand `fixed_origin` est faux.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.
  - Verifie : `S_AddLoopSounds` consomme les sons de frame depuis `cl_parse_entities[num].sound` comme `snd_dma.c`; `verify:snd-dma` couvre le cas loop sound.

## Tests

- [ ] Les tests existants couvrent les fonctions principales.
- [ ] Les tests couvrent les effets secondaires.
- [ ] Les tests couvrent le branchement jusqu'au consommateur final.
- [ ] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

### Tests executes pendant cette reprise

- [x] `npm run verify:cl-parse`
  - Resultat : OK.
- [x] `npm run verify:entities:phase5`
  - Resultat : OK.
- [x] `npm run verify:entities:phase8:scene`
  - Resultat : OK.
- [x] `npx tsx ./scripts/verify/quake2-cl-view.ts`
  - Resultat : OK. Note : il n'existe pas de script npm `verify:cl-view`.
- [x] `npm run verify:entities:phase9`
  - Resultat : OK.
- [x] `npm run verify:snd-dma`
  - Resultat : OK.

### Tests manquants identifies

- [ ] Couvrir `CL_ParseFrame` premiere frame valide avec equivalent `SCR_EndLoadingPlaque`.
- [ ] Couvrir `EF_TELEPORTER -> CL_TeleporterParticles` dans le chemin runtime, pas seulement l'extraction d'evenement.
- [ ] Couvrir l'entite color-shell separee `EF_COLOR_SHELL` / `EF_PENT` / `EF_QUAD` / `EF_DOUBLE` / `EF_HALF_DAMAGE`.
- [ ] Couvrir les trails/particules automatiques manquants de `CL_AddPacketEntities`.
- [ ] Couvrir la garde `CL_AddViewWeapon` quand `gun.model` est introuvable.

## Findings

1. [Info] Audit redemarre
   - Fichier/ligne : `Audit/client-cl_ents.audit.md`
   - Source originale : demande utilisateur du 2026-04-26
   - Impact : les validations precedentes ne sont pas reprises comme acquises
   - Correction recommandee : re-cocher uniquement apres verification item par item

2. [Info] Ecart profiling `CL_ParseEntityBits`
   - Fichier/ligne : `packages/client/src/parse.ts:318`
   - Source originale : `bitcounts[32]` incremente dans `Quake-2-master/client/cl_ents.c:204`
   - Impact : perte du comptage de profiling protocole, pas d'impact observe sur l'etat runtime ou le parsing
   - Correction recommandee : laisser documente sauf besoin futur de shownet/profiling equivalent

3. [Info] Logs shownet de `CL_ParsePacketEntities` absents
   - Fichier/ligne : `packages/client/src/parse.ts:1596`
   - Source originale : traces `unchanged`, `remove`, `delta`, `baseline` sous `cl_shownet->value == 3`
   - Impact : perte de diagnostic console, pas d'impact sur le flux d'entites
   - Correction recommandee : documenter ou ajouter un hook debug si le port vise aussi le diagnostic protocole

4. [Moyenne] `CL_ParseFrame` ne semble pas appeler l'equivalent de `SCR_EndLoadingPlaque`
   - Fichier/ligne : `packages/client/src/parse.ts:1369`
   - Source originale : `Quake-2-master/client/cl_ents.c:755`
   - Impact : la transition premiere frame valide -> client actif peut ne pas retirer la plaque de chargement via le meme effet secondaire que le C
   - Verification : `ClientParseHooks` ne contient pas de callback equivalent ; les hooks `onEndLoadingPlaque` trouves sont rattaches a `CL_Drop` / cinematic, pas a `CL_ParseFrame`
   - Correction recommandee : ajouter un hook explicite ou documenter le rattachement equivalent si ce comportement est gere ailleurs

5. [Haute] `EF_TELEPORTER` extrait par `CL_FireEntityEvents` mais pas consomme comme particules runtime dans le chemin verifie
   - Fichier/ligne : `packages/client/src/entities.ts:132`
   - Source originale : `Quake-2-master/client/cl_ents.c:653`
   - Impact : les particules teleporter permanentes peuvent etre absentes meme si l'evenement structure est visible dans les tests ; `CL_BuildFrameEntityEventEffects` saute le cas `event.event === 0 && EF_TELEPORTER`
   - Correction recommandee : raccorder l'evenement `EF_TELEPORTER` a `CL_TeleporterParticles(runtime, state)` ou documenter et verifier le consommateur equivalent

6. [Haute] `CL_AddPacketEntities` ne semble pas emettre l'entite color-shell separee
   - Fichier/ligne : `packages/client/src/refresh.ts:169`
   - Source originale : `Quake-2-master/client/cl_ents.c:1057`
   - Impact : les effets `EF_COLOR_SHELL`, y compris les promotions `EF_PENT`, `EF_QUAD`, `EF_DOUBLE`, `EF_HALF_DAMAGE`, gardent l'entite principale sans flags mais ne generent pas la deuxieme entite translucide avec `renderfx | RF_TRANSLUCENT`
   - Correction recommandee : apres l'entite principale, ajouter une entite refresh shell separee avec flags `snapshot.renderfx | RF_TRANSLUCENT` et `alpha = 0.30`

7. [Haute] Trails/particules automatiques incomplets dans `CL_AddPacketEntities`
   - Fichier/ligne : `packages/client/src/effects.ts:1323`
   - Source originale : `Quake-2-master/client/cl_ents.c:1121`
   - Impact : plusieurs effets visuels source peuvent manquer malgre les lumieres correspondantes : `EF_FLIES`, particules BFG, `EF_TRAP`, `EF_FLAG1/2`, `EF_TAGTRAIL`, `EF_TRACKERTRAIL`, `EF_TRACKER`, `EF_IONRIPPER`
   - Precision perimetre : les helpers existent deja pour plusieurs cas dans `effects.ts` / `newfx.ts`; l'ecart audite ici est leur non-consommation par le chemin porte de `CL_AddPacketEntities`
   - Correction recommandee : completer `CL_ExecutePacketEntityEffects` avec les helpers deja portes (`CL_FlyEffect`, `CL_BfgParticles`, `CL_TrapParticles`, `CL_FlagTrail`, `CL_TagTrail`, `CL_TrackerTrail`, `CL_Tracker_Shell`, `CL_IonripperTrail`) ou documenter les equivalents consommes

8. [Haute] `EF_POWERSCREEN` ajoute une entite sans modele resolvable
   - Fichier/ligne : `packages/client/src/refresh.ts:175`
   - Source originale : `Quake-2-master/client/cl_ents.c:1130`
   - Impact : le C ajoute une entite avec `ent.model = cl_mod_powerscreen`, frames `0`, flags `RF_TRANSLUCENT | RF_SHELL_GREEN`, alpha `0.30`; le port ajoute une entite slot `5` avec `modelindex = 0` et sans `resolvedModelPath`, que les consommateurs verifies resolvent comme absence de modele
   - Correction recommandee : fournir le modele powerscreen equivalent (`models/items/armor/effect/tris.md2` / ressource enregistree) dans l'entite refresh ou un champ dedie resolu par le consommateur

9. [Haute] Custom player/weapon de `CL_AddPacketEntities` non resolus par le consommateur renderer direct
   - Fichier/ligne : `packages/renderer-three/src/refresh-entity-sync.ts:324`
   - Source originale : `Quake-2-master/client/cl_ents.c:934`
   - Impact : le C resout immediatement `modelindex == 255` via `clientinfo.model/skin` et `modelindex2 == 255` via `clientinfo.weaponmodel`; le port transporte `customPlayerSkin` / `customWeaponModel` et `V_RenderView` sait les resoudre, mais le chemin web verifie consomme directement `ClientRefreshFrame` via `createThreeRefreshEntitySync`, qui ignore ces marqueurs et tente de resoudre `modelindex` dans `CS_MODELS`
   - Correction recommandee : faire consommer les marqueurs custom par `refresh-entity-sync`, ou passer le chemin web par une resolution equivalente a `V_RenderView`

10. [Moyenne] `RF_BEAM` ne reprend pas la selection aleatoire source du byte de couleur
   - Fichier/ligne : `packages/client/src/entities.ts:310`
   - Source originale : `Quake-2-master/client/cl_ents.c:927`
   - Impact : le C choisit `((rand() % 4) * 8)` dans `skinnum`, alors que le port choisit un byte deterministe derive de `runtime.cl.time`; l'apparence des beams peut etre trop stable ou synchronisee par rapport au source
   - Correction recommandee : utiliser le generateur aleatoire runtime equivalent au `rand()` source, ou documenter explicitement une deviation intentionnelle si la reproductibilite est voulue

11. [Haute] `EF_TRAP` ne reproduit pas la mutation d'origine et l'intensite aleatoire source
   - Fichier/ligne : `packages/client/src/refresh.ts:451`
   - Source originale : `Quake-2-master/client/cl_ents.c:1201`
   - Impact : le C fait `ent.origin[2] += 32`, declenche `CL_TrapParticles(&ent)`, utilise une intensite `(rand()%100)+100`, puis copie cette origine mutee dans `cent->lerp_origin`; le port decale seulement l'origine de la lumiere, garde `lerp_origin = snapshot.origin`, n'appelle pas `CL_TrapParticles` dans ce chemin et fixe l'intensite a `150`
   - Correction recommandee : porter la mutation temporaire de l'entite dans le chemin `CL_AddPacketEntities`, raccorder `CL_TrapParticles`, et utiliser l'intensite aleatoire source

12. [Moyenne] Branches `vidref_val` des trackers non representees dans le chemin porte
   - Fichier/ligne : `packages/client/src/refresh.ts:473`
   - Source originale : `Quake-2-master/client/cl_ents.c:1233`
   - Impact : le C emet des lumieres differentes selon `VIDREF_GL` ou soft renderer pour `EF_TRACKERTRAIL | EF_TRACKER` et `EF_TRACKER`; le port emet toujours la variante negative type GL
   - Correction recommandee : exposer le choix renderer historique necessaire au chemin audite ou documenter que le port ne supporte que la variante GL

13. [Moyenne] `CL_AddEntities` melange des phases `Run*` non presentes dans ce point source
   - Fichier/ligne : `packages/client/src/refresh.ts:151`
   - Source originale : `Quake-2-master/client/cl_ents.c:1469`
   - Impact : le point source `CL_AddEntities` ne fait pas `CL_RunDLights` / `CL_RunLightStyles` ici ; le C les appelle dans `CL_Frame` apres screen/audio, tandis que le port les execute dans `CL_BuildRefreshFrame` avant packet/temp entities et expose aussi `onRunDLights` / `onRunLightStyles` dans `CL_Frame`, avec risque d'ordre different ou de double vieillissement selon le branchement hote
   - Correction recommandee : garder un seul point d'appel equivalent au `CL_Frame` original, ou documenter pourquoi l'appel dans le builder est exclusif et equivalent

14. [Moyenne] `CL_AddViewWeapon` ne reproduit pas clairement la garde `if (!gun.model) return`
   - Fichier/ligne : `packages/client/src/refresh.ts:291`
   - Source originale : `Quake-2-master/client/cl_ents.c:1312`
   - Impact : une arme avec `gunindex` non nul mais modele non resolu peut entrer dans la scene avec `model = null`, alors que le C ne l'ajoute pas
   - Correction recommandee : verifier `runtime.cl.model_draw[ps.gunindex]` quand il n'y a pas d'override debug, ou filtrer avant `V_AddEntity`

15. [Moyenne] Header de fonction incomplet pour le port principal de `CL_AddPacketEntities`
   - Fichier/ligne : `packages/client/src/entities.ts:202`
   - Source originale : `Quake-2-master/client/cl_ents.c:834`
   - Impact : `CL_BuildPacketEntitySnapshots` porte une grande partie de `CL_AddPacketEntities` mais son header n'indique pas `Original name: CL_AddPacketEntities`, ce qui affaiblit la tracabilite demandee par le README
   - Correction recommandee : ajouter un header ported conforme ou une note explicite de rattachement a `CL_AddPacketEntities`

16. [Critique] Les bitmasks support `U_*` utilises par `cl_ents.c` ne correspondent pas au source original
   - Fichier/ligne : `packages/qcommon/src/protocol.ts:79`
   - Source originale : `Quake-2-master/qcommon/qcommon.h:300`
   - Impact : les fonctions de `cl_ents.c` qui lisent les deltas d'entites ne sont pas ISO pour les messages originaux ; `U_EFFECTS8`, `U_MOREBITS2`, `U_SKIN8`, `U_FRAME16`, `U_RENDERFX16`, `U_EFFECTS16`, `U_MODEL2`, `U_MODEL3`, `U_MODEL4`, `U_MOREBITS3`, `U_OLDORIGIN`, `U_SKIN16`, `U_SOUND`, `U_SOLID` sont decales d'un bit par rapport au C source
   - Correction recommandee : realigner le support `U_*` utilise par `CL_ParseEntityBits` / `CL_ParseDelta`, puis verifier ce chemin client avec les encodeurs qui l'alimentent

## Decision

- Corriger maintenant : non demande dans cette passe ; ecarts critiques confirmes a corriger avant validation
- Reporter : aucun passage final OK tant que `U_*`, `CL_AddPacketEntities`, `CL_FireEntityEvents`, `CL_ParseFrame` et `CL_AddViewWeapon` restent ouverts
- Documenter : dispersion source -> TS, chemins `#if 0`, tests existants et findings ci-dessus

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : non
- Nouveau statut `Valide` : non modifie pendant audit partiel
- Fichier d'audit cree dans `Audit/` : `Audit/client-cl_ents.audit.md`
