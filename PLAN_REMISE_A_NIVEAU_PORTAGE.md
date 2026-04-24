# Quake2JS - Audit de conformite et plan de remise a niveau

Date de reprise : 2026-04-24

## 1. Objet

Ce document remplace l'ancien plan de remise a niveau.

Il a ete reconstruit apres relecture de :

- [README.md](C:\a\Projets\Quake-2\README.md) ;
- [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md) ;
- l'arborescence runtime `packages/*` ;
- l'application adapter `apps/web` ;
- les harnais `scripts/verify/*` ;
- les plans recents ouverts dans le depot.

Le constat principal est simple : le depot a fortement avance depuis le precedent plan. Beaucoup de chantiers qui etaient identifies comme a extraire ou a clarifier sont maintenant fermes, testes ou mieux rattaches. Le role de ce plan n'est donc plus de relancer les phases anciennes, mais de nettoyer les derniers ecarts de conformite et de securiser la suite du portage.

## 2. Methode d'audit

L'audit a verifie les axes suivants :

- coherence avec les regles du `README` ;
- absence de dependance runtime directe vers les adapters ;
- existence d'une cible principale claire par fichier source porte ;
- absence de stubs generes comme cibles architecturales ;
- coherence entre le code, les harnais et `PORTAGE_QUAKE2.md` ;
- statut reel des fichiers marques `âœ…` ou `ðŸŸ ` ;
- frontieres entre runtime, renderer dedie, platform et web app ;
- couverture de verification ciblee sur les blocs `Strict` ou proches du source.

Perimetre relu :

- `apps/web`
- `packages/client`
- `packages/filesystem`
- `packages/formats`
- `packages/game`
- `packages/math`
- `packages/memory`
- `packages/platform`
- `packages/qcommon`
- `packages/renderer-common`
- `packages/renderer-three`
- `packages/server`
- `packages/shared`
- `packages/tests-golden`
- `scripts/verify`

## 3. Diagnostic global

## 3.1 Avancees majeures depuis le precedent plan

Les chantiers suivants, precedemment ouverts, sont maintenant globalement remis a niveau :

- le noyau client principal est beaucoup plus ferme : `cl_main.c`, `cl_parse.c`, `cl_input.c`, `cl_pred.c`, `cl_scrn.c`, `cl_view.c`, `cl_ents.c`, `cl_fx.c`, `cl_tent.c`, `cl_newfx.c`, `client.h`, `screen.h`, `ref.h`, `sound.h`, `vid.h`, menus, console et son ont des cibles principales explicites et des harnais dedies ;
- les dependances runtime client vers `renderer-common` ont ete en grande partie corrigees par l'introduction des contrats runtime cote client ;
- `apps/web/src/main.ts` et `apps/web/src/local-client-controller.ts` ont ete allegees : elles jouent maintenant surtout le role de bootstrap DOM/Three.js, de wiring input/camera et de consommation des sorties runtime ;
- les headers mixtes critiques `game/g_local.h`, `game/game.h` et `qcommon/qcommon.h` ont maintenant des fichiers principaux lisibles : `packages/game/src/g-local.ts`, `packages/game/src/game.ts`, `packages/qcommon/src/qcommon.ts` ;
- les stubs generes `generated/ts-stubs/*` ne sont plus visibles comme cibles dans `PORTAGE_QUAKE2.md` ;
- le perimetre `ref_gl/*` a beaucoup progresse : `gl_draw.c`, `gl_image.c`, `gl_light.c`, `gl_mesh.c`, `gl_model.c`, `gl_rsurf.c`, `gl_warp.c` et plusieurs headers renderer ont des ports reels dans `packages/renderer-three` ;
- le sous-systeme serveur est apparu comme un nouveau bloc substantiel : `server.h`, `sv_ccmds.c`, `sv_ents.c`, `sv_game.c`, `sv_init.c`, `sv_main.c`, `sv_null.c`, `sv_send.c`, `sv_user.c`, `sv_world.c` sont maintenant fermes ou proches ;
- la couverture de verification a ete fortement etendue : client, qcommon, gameplay, renderer GL, serveur, particules, prediction, menus, son et headers disposent maintenant de nombreux harnais explicites.

## 3.2 Blocs globalement conformes

Les familles suivantes respectent maintenant bien les regles du `README` :

- `packages/formats` : parseurs binaires separes, defensifs et rattaches a `qfiles.h` ;
- `packages/memory` : buffers et IO binaires bas niveau ;
- `packages/qcommon` : commandes, cvars, protocol, messages, pmove, collision, qcommon.h et plusieurs helpers communs ;
- `packages/client` : grand socle client runtime, avec sorties renderer-neutral et hooks explicites pour les effets plateforme ;
- `packages/game` : gameplay de base, armes, items, combat, plusieurs entites, headers principaux et bootstrap local ;
- `packages/server` : serveur runtime en progression rapide, bien isole dans son package ;
- `packages/renderer-three` : port renderer dedie pour `ref_gl/*`, avec hooks backend a la place des appels OpenGL directs ;
- `scripts/verify` : verification ciblee de plus en plus systematique.

## 3.3 Ecarts encore observes

### A. Doublons obsoletes dans `PORTAGE_QUAKE2.md`

`PORTAGE_QUAKE2.md` contient des lignes dupliquees pour au moins :

- `ref_gl\gl_image.c`
- `ref_gl\gl_rmain.c`
- `ref_gl\gl_warp.c`

Les premieres occurrences, placees anormalement dans la zone client du tableau, decrivent un ancien etat `ðŸŸ `. Les occurrences plus loin dans le bloc `ref_gl` sont l'etat courant. C'est actuellement le plus gros ecart documentaire, car il peut faire croire qu'un port ferme est encore ouvert ou rattache a une mauvaise cible.

### B. Dependances runtime -> renderer

Etat initial de l'audit : `packages/client/src/local-brush-models.ts` importait le type `BrushModelSnapshot` depuis `packages/renderer-three/src/index.ts`.

Etat apres phase 2 : cet ecart est corrige. `BrushModelSnapshot` vit maintenant dans `packages/client/src/local-brush-models.ts`, et `renderer-three` consomme ce contrat runtime.

### C. `apps/web` apparait encore comme consommateur dans certaines lignes `âœ…`

Certaines lignes fermees listent encore `apps/web/*` dans la colonne `Cible`, par exemple autour de `client/cl_view.c` ou `ref_gl/gl_mesh.c`.

Ce n'est pas forcement faux si `apps/web` est cite comme consommateur, mais le referentiel ne distingue pas toujours assez visiblement :

- cible principale de portage ;
- sous-modules ;
- adapters consommateurs ;
- harnais.

La regle a conserver : `apps/web` peut etre cite comme consommateur ou integration de demo, jamais comme cible principale.

### D. `index.ts` reste tres present dans les cibles

Plusieurs lignes citent `packages/*/src/index.ts`. C'est acceptable comme facade package, mais pas comme cible de portage.

Le referentiel doit continuer a eviter toute ambiguite : `index.ts` est une facade d'export, sauf mention explicite contraire et justifiee.

### E. Ports `âœ…` avec hooks d'adaptation nombreux

Plusieurs ports fermes restent relies a des hooks explicites pour les effets plateforme, backend, IO ou rendu. C'est permis par le `README`, mais chaque fermeture `âœ…` doit rester honnete :

- pas de comportement source critique remplace par un hook temporaire non porte ;
- hook acceptable seulement pour un effet de bord plateforme ou backend ;
- deviation documentee dans la description ou le header.

Les lignes les plus sensibles sont les ports renderer GL, audio, serveur et client main/parse/view, car ils ont naturellement beaucoup de hooks.

### F. Le serveur restant est ferme

Le serveur est maintenant un vrai sous-systeme du portage. Les derniers fichiers suivis en priorite sont fermes :

- `server/sv_game.c`
- `server/sv_init.c`
- `server/sv_send.c`

La suite cote serveur releve maintenant surtout de l'integration avec les autres familles de portage.

### G. Gameplay encore ouvert autour des monstres, commandes et joueur

Le gameplay a beaucoup avance, mais plusieurs lignes importantes restent volontairement `ðŸŸ ` :

- `game/g_ai.c`
- `game/g_chase.c`
- `game/g_cmds.c`
- `game/g_func.c`
- `game/g_svcmds.c`
- `game/g_turret.c`
- `game/p_client.c`
- `game/p_hud.c`

Le risque n'est plus architectural, mais fonctionnel : les fichiers ont des cibles claires et des harnais, mais il reste de l'integration comportementale a fermer.

### H. Renderer GL encore ouvert sur le bootstrap fin

Le renderer GL original est maintenant majoritairement porte dans `packages/renderer-three`, ce qui est conforme a l'exception renderer du `README`.

Restent en `ðŸŸ ` :

- `ref_gl/gl_local.h`
- `ref_gl/gl_rmain.c`
- `ref_gl/gl_rmisc.c`
- `ref_gl/qgl.h`

Le risque principal est le bootstrap fin `R_Init` / `GLimp_*` / `QGL_*`, la detection backend et le raccord exact des extensions.

## 4. Etat par famille de regles

## 4.1 Regles respectees

- Le portage principal vit maintenant majoritairement dans les packages runtime ou dans `renderer-three` pour le cas autorise `ref_gl/*`.
- Les parseurs et formats restent decouples des adapters web.
- Les stubs generes ne sont plus des cibles architecturales visibles.
- Les headers mixtes critiques ont maintenant des points de rattachement principaux.
- Les fonctions et constantes gardent globalement les noms et valeurs source.
- La verification ciblee est devenue une pratique courante du depot.
- `apps/web` est beaucoup plus proche d'une couche adapter pure.

## 4.2 Regles partiellement respectees

- Le referentiel `PORTAGE_QUAKE2.md` est riche mais encore trop verbeux et parfois ambigu dans la colonne `Cible`.
- Les consommateurs adapters sont parfois listes sans label clair, ce qui brouille la notion de cible principale.
- Quelques fichiers `index.ts` restent cites dans des lignes de portage alors qu'ils devraient etre marques comme facades.
- Les ports `âœ…` avec hooks d'adaptation doivent rester surveilles pour ne pas masquer des comportements source non portes.

## 4.3 Regles non respectees

Les deux ecarts identifies au demarrage de ce plan ont ete corriges par les phases 1 et 2. Cette section doit etre reauditee apres les phases suivantes plutot que consideree comme une liste active.

## 5. Priorites de remise a niveau

Priorite 0 : corriger les incoherences qui faussent l'audit.

- fait en phase 1 : supprimer les doublons obsoletes `ref_gl/*` dans `PORTAGE_QUAKE2.md` ;
- fait en phase 1 : verifier qu'il n'existe pas d'autres chemins dupliques dans le tableau ;
- fait en phase 1 : clarifier dans les lignes concernees que `apps/web` et `index.ts` sont des consommateurs/facades, pas des cibles principales.

Priorite 1 : refermer la derniere dependance runtime -> renderer.

- fait en phase 2 : `BrushModelSnapshot` a ete extrait hors de `packages/renderer-three` ;
- fait en phase 2 : `renderer-three` consomme maintenant ce type runtime au lieu de le definir ;
- fait en phase 2 : aucun import runtime vers `renderer-common`, `renderer-three`, `platform` ou `apps/web` ne subsiste hors commentaire documentaire.

Priorite 2 : stabiliser le serveur restant.

- fait : `server/sv_game.c`
- fait : `server/sv_init.c`
- fait : `server/sv_send.c`

Priorite 3 : poursuivre le gameplay ouvert.

- `game/p_client.c` et `game/p_hud.c` pour la boucle joueur/intermission/scoreboard ;
- `game/g_cmds.c` pour les commandes client ;
- `game/g_ai.c`, `g_chase.c`, `g_turret.c`, `g_func.c`, `g_svcmds.c` selon dependances.

Priorite 4 : fermer le bootstrap renderer GL.

- `ref_gl/gl_rmain.c`
- `ref_gl/gl_rmisc.c`
- `ref_gl/gl_local.h`
- `ref_gl/qgl.h`

## 6. Plan de remise a niveau

## Phase 1 - Nettoyer le referentiel `PORTAGE_QUAKE2.md`

- [x] supprimer les anciennes lignes dupliquees de `ref_gl\gl_image.c`, `ref_gl\gl_rmain.c` et `ref_gl\gl_warp.c`
- [x] corriger aussi le cas associe `ref_gl\gl_mesh.c`, dont la ligne renseignee etait mal placee et dont la ligne renderer etait vide
- [x] lancer une verification simple des chemins dupliques dans le tableau
- [x] conserver une seule ligne par fichier source original
- [x] faire commencer chaque colonne `Cible` par la cible principale reelle pour les lignes touchees
- [x] deplacer editorialement les facades `index.ts`, adapters web et harnais apres la cible principale pour `ref_gl\gl_mesh.c`
- [x] annoter explicitement `apps/web` comme consommateur lorsque la description pouvait preter a confusion

Definition de termine :

- [x] aucun doublon de chemin dans `PORTAGE_QUAKE2.md` ;
- [x] aucun ancien etat `ðŸŸ ` ne contredit un etat courant `âœ…` ;
- [x] les lignes `ref_gl/*` touchees sont toutes regroupees dans le bloc renderer attendu.

Statut :

- Phase 1 realisee le 2026-04-24.
- Verification executee : script Node de comptage des chemins Markdown, resultat `NO_DUPLICATE_PATHS`.
- Les lignes `ref_gl\gl_image.c`, `ref_gl\gl_mesh.c`, `ref_gl\gl_rmain.c` et `ref_gl\gl_warp.c` n'ont plus qu'une occurrence chacune.

## Phase 2 - Supprimer la dependance client runtime vers `renderer-three`

- [x] creer ou reutiliser un type runtime neutre pour les snapshots de brush models locaux
- [x] remplacer l'import de `BrushModelSnapshot` dans `packages/client/src/local-brush-models.ts`
- [x] faire importer le meme contrat neutre par `packages/renderer-three/src/brush-model-sync.ts`
- [x] verifier que `packages/client`, `packages/game`, `packages/qcommon`, `packages/server`, `packages/formats`, `packages/filesystem`, `packages/memory` et `packages/math` n'importent plus de package renderer/platform/web

Definition de termine :

- [x] la recherche `renderer-common|renderer-three|apps/web|platform` dans les packages runtime ne trouve plus que des commentaires documentaires acceptables, ou rien ;
- [x] `npm run typecheck` passe.

Statut :

- Phase 2 realisee le 2026-04-24.
- `BrushModelSnapshot` vit maintenant cote runtime client dans `packages/client/src/local-brush-models.ts`.
- `packages/renderer-three/src/brush-model-sync.ts` et `packages/renderer-three/src/gl-world-scene-adapter.ts` consomment ce contrat runtime au lieu de le definir.
- Verification executee : recherche d'import runtime vers adapters, seul un commentaire documentaire dans `packages/client/src/view.ts` mentionne encore `apps/web`.

## Phase 3 - Requalifier les references adapters/facades

- [x] relire les lignes fermees qui citent `apps/web/*`
- [x] relire les lignes fermees qui citent `packages/*/src/index.ts`
- [x] modifier les descriptions pour dire clairement "consommateur", "facade package" ou "harnais"
- [x] verifier en priorite :
  - `client/cl_view.c`
  - `client/cl_scrn.c`
  - `ref_gl/gl_mesh.c`
  - `server/server.h`
  - les headers client et game qui citent `index.ts`

Definition de termine :

- [x] aucune ligne ne laisse penser qu'un adapter web ou un `index.ts` porte le comportement source principal.

Statut :

- Phase 3 realisee le 2026-04-24.
- Les references `packages/*/src/index.ts` sont annotees comme `facade package`.
- Les references `apps/web/src/*` sont annotees comme consommateurs adapter web.
- Verification executee : script Node de controle des cibles `apps/web` / `src/index.ts`, resultat `ADAPTER_FACADE_TARGETS_ANNOTATED`.

## Phase 4 - Fermer le serveur restant

- [x] terminer `server/sv_game.c` autour de l'integration complete `GetGameApi`, imports moteur et lifecycle game module
- [x] terminer `server/sv_init.c` autour de `SV_SpawnServer`, map loading, savegame/loading plaque et raccord collision/map
- [x] terminer `server/sv_send.c` autour du frame update, demo send path, multicast/message delivery et drop overflow
- [x] renforcer le harnais `quake2-sv-init.ts`
- [x] renforcer le harnais `quake2-sv-game.ts`
- [x] renforcer le harnais `quake2-sv-send.ts`
- [x] mettre a jour `PORTAGE_QUAKE2.md` apres chaque fermeture

Definition de termine :

- les lignes serveur restantes peuvent passer en `✅` sans hook temporaire masquant un comportement source critique.

## Phase 5 - Consolider gameplay joueur/monstres

- [ ] continuer `game/p_client.c` : scoreboard/intermission complet, drops/effets et integration bord a bord
- [ ] continuer `game/p_hud.c` : dispatch commandes HUD et branchement engine final des layouts
- [ ] continuer `game/g_cmds.c` : commandes client, chat, cheats, armes, scoreboard
- [x] continuer `game/g_ai.c` : validation de poursuite/attaque au-dela des cas deja couverts
- [ ] continuer `game/g_chase.c`, `game/g_turret.c`, `game/g_func.c`, `game/g_svcmds.c` selon les dependances ouvertes

Definition de termine :

- chaque ligne gameplay ouverte indique exactement le reste a porter ;
- chaque fermeture `âœ…` a un harnais ou une verification documentee.

## Phase 6 - Fermer le bootstrap renderer GL

- [ ] terminer `ref_gl/gl_rmain.c` autour du bootstrap fin `R_Init`, backend flags et chainage renderer
- [ ] terminer `ref_gl/gl_rmisc.c` si les hooks GL/filesystem restants peuvent etre classes comme adaptations finales
- [x] terminer `ref_gl/gl_local.h` quand les declarations partagees restantes ne dependent plus de fichiers ouverts
- [x] terminer `ref_gl/qgl.h` ou documenter precisement la part non portee volontairement des procedures Win32/QGL
- [ ] verifier que le renderer dedie n'absorbe pas de comportement `client/*`, `game/*`, `qcommon/*` ou `server/*`

Definition de termine :

- chaque ligne `ref_gl/*` a une cible principale renderer unique ;
- les hooks backend sont des adaptations assumee, pas des placeholders de comportement source.

## Phase 7 - Verifications finales d'architecture

- [ ] `npm run typecheck`
- [ ] lancer les harnais touches par les phases precedentes
- [ ] relancer au minimum les familles :
  - `verify:cl-*` pertinentes
  - `verify:server:*`
  - `verify:g-*` pertinentes
  - `verify:gl-*` pertinentes
  - `verify:qcommon:header`
- [ ] verifier les imports runtime -> adapters
- [ ] relire les lignes `âœ…` modifiees

Definition de termine :

- le plan courant ne contient plus d'actions documentaires bloquantes ;
- `PORTAGE_QUAKE2.md` redevient fiable comme referentiel architectural.

## 7. Ordre recommande

1. Phase 1 : nettoyer `PORTAGE_QUAKE2.md`.
2. Phase 2 : supprimer l'import runtime vers `renderer-three`.
3. Phase 3 : clarifier adapters/facades dans les lignes fermees.
4. Phase 4 : fermer le serveur restant.
5. Phase 5 : poursuivre gameplay joueur/monstres.
6. Phase 6 : fermer le bootstrap renderer GL.
7. Phase 7 : verifier et requalifier les statuts.

## 8. Definition de termine globale

Le depot pourra etre considere remis a niveau quand :

- `PORTAGE_QUAKE2.md` ne contient plus de doublons ni d'anciens etats contradictoires ;
- chaque fichier source porte ou en cours a une cible principale claire ;
- aucun package runtime n'importe un package adapter ou renderer, hors commentaire documentaire ;
- `apps/web` et `platform` ne sont jamais des cibles principales de port source ;
- `renderer-three` et `renderer-common` ne sont cibles principales que pour le perimetre renderer autorise `ref_gl/*` ;
- les facades `index.ts` sont identifiees comme facades, pas comme portage principal ;
- les lignes `âœ…` ne masquent pas de hook temporaire remplacant un comportement source critique ;
- chaque bloc `Strict` important ferme dispose d'un harnais ou d'une verification ciblee.
