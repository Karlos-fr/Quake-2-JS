# Progress - Quake-2-master/game/g_save.c

## Dernier lot traite

- 2026-05-02: fonction `ReadGame` et temporaires locaux auto-detectes `i`, `str`.

## Verdict du lot

- `ReadGame`: valide. Dans le C, la fonction libere `TAG_GAME`, ouvre le fichier, lit le tampon `str[16]`, rejette les versions dont `str` differe de `__DATE__`, restaure les donnees `game`, alloue les clients puis lit exactement `game.maxclients` blocs avec `ReadClient`.
- Dans le port TS, le fichier binaire est remplace par un snapshot JSON structure. `ReadGame` appelle `FreeTags(TAG_GAME)`, lit via le hook host, valide `format`/`date`, restaure les champs cross-level (`helpmessage*`, `spawnpoint`, `maxclients`, `maxentities`, `serverflags`, `num_items`, `autosaved`), synchronise le miroir runtime, puis reconstruit les clients via `restoreClient`.
- `i`: valide. Le compteur C de boucle sur `game.maxclients` est porte par les entrées de `save.clients` ecrites par `WriteGame`; le harness verifie un fichier a deux slots, la longueur restauree et le miroir `runtime.maxclients`.
- `str`: valide. Le tampon C fixe contenant `__DATE__` est porte par `SAVEGAME_DATE` dans le payload structure et controle par `validateSaveFile`; le harness verifie qu'une date incorrecte declenche l'erreur `Savegame from an older version.`.
- Commentaires d'en-tete: commentaire de `ReadGame` verifie avec `Original name`, source, categorie, niveau de fidelite et comportement; l'en-tete fichier documente le remplacement du `FILE *` binaire par JSON structure.

## Branchement et integrations

- Runtime: attendu et branche. `ReadGame` est expose par `packages/game/src/g_main.ts` dans `GetGameApi`, appele par `SV_ReadServerFile` dans `packages/server/src/sv_ccmds.ts`, et reste atteignable depuis les commandes serveur de chargement.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` injecte les hooks `readFile`/`writeFile` vers `web-save-storage` et utilise le meme export runtime; aucune logique web parallele ne remplace `ReadGame`.
- renderer-three: non applicable directement. `ReadGame`, `i` et `str` ne produisent pas de modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene. Les clients/items restaures peuvent seulement influencer ulterieurement les snapshots/HUD/viewmodel apres reprise runtime.

## Corrections appliquees

- Aucune correction TS proprietaire necessaire pour ce lot.
- `scripts/verify/quake2-g-save.ts`: ajout de preuves `ReadGame` pour `FreeTags(TAG_GAME)`, restauration de deux slots clients, miroir `runtime.maxclients` et rejet d'une date de sauvegarde incorrecte.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: validation des lignes `ReadGame`, `i`, `str`.
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`: compteur `Validees` et prochain lot mis a jour.

## Tests

- `npm run verify:g-save`: ok le 2026-05-02.
- `npm run verify:full-game:server-host`: ok le 2026-05-02.
- `npm run verify:web-save-storage`: ok le 2026-05-02.
- `npm run verify:full-game:save-slots`: ok le 2026-05-02.
- `npm run typecheck`: ok le 2026-05-02.

## Prochain lot recommande

- Continuer avec `WriteEdict`, puis ses temporaires locaux `field` et `temp` si le lot reste coherent.

---

- 2026-05-02: fonction `WriteGame` et temporaires locaux auto-detectes `i`, `str`.

## Verdict du lot

- `WriteGame`: valide. Dans le C, la fonction appelle `SaveClientData` pour les sauvegardes manuelles, ouvre le fichier, ecrit un tampon date fixe de 16 octets, positionne `game.autosaved`, ecrit le bloc `game`, remet `game.autosaved` a faux, puis ecrit exactement `game.maxclients` clients avec `WriteClient`.
- Dans le port TS, le fichier binaire est remplace par un snapshot JSON structure avec `format`, `date`, `autosave`, `game` et `clients`. Correction appliquee: `WriteGame` construit maintenant les clients via une boucle de longueur `game.maxclients`, en recuperant les clients attaches aux edicts runtime quand `game.clients` n'est pas pre-rempli, ce qui preserve l'intention de la boucle C.
- `i`: valide. Le compteur C `for (i=0 ; i<game.maxclients ; i++)` est porte par l'index de `Array.from({ length: game.maxclients }, (_, i) => ...)`; le harness verifie deux slots ecrits pour `maxclients = 2`.
- `str`: valide. Le tampon C `str[16]` contenant `__DATE__` est porte par `SAVEGAME_DATE` dans le payload structure et controle par `validateSaveFile` cote lecture; l'ecart de format est documente dans l'en-tete de `packages/game/src/g_save.ts`.
- Commentaires d'en-tete: commentaire de `WriteGame` verifie avec `Original name`, source, categorie, niveau de fidelite et comportement; l'en-tete fichier documente le remplacement du `FILE *` binaire par JSON structure.

## Branchement et integrations

- Runtime: attendu et branche. `WriteGame` est expose par `packages/game/src/g_main.ts` dans `GetGameApi`, appele par `SV_WriteServerFile` dans `packages/server/src/sv_ccmds.ts`, et reste atteignable depuis les commandes save/changement de niveau serveur.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` injecte les hooks `readFile`/`writeFile` vers `web-save-storage` et utilise le meme export runtime; aucune logique web parallele ne remplace `WriteGame`.
- renderer-three: non applicable directement. `WriteGame`, `i` et `str` ne produisent pas de modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene. Les clients et items sauvegardes peuvent seulement influencer ulterieurement les snapshots/HUD/viewmodel apres restauration.

## Corrections appliquees

- `packages/game/src/g_save.ts`: `WriteGame` ecrit exactement `game.maxclients` snapshots clients et synchronise les slots manquants depuis les edicts runtime.
- `scripts/verify/quake2-g-save.ts`: ajout d'une preuve `maxclients = 2` couvrant la boucle client, la recuperation d'un client edict-backed et l'appel `SaveClientData`.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: validation des lignes `WriteGame`, `i`, `str`.
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`: compteur `Validees` et prochain lot mis a jour.

## Tests

- `npm run verify:g-save`: ok le 2026-05-02.
- `npm run verify:full-game:server-host`: ok le 2026-05-02.
- `npm run verify:web-save-storage`: ok le 2026-05-02.
- `npm run typecheck`: ok le 2026-05-02.

## Prochain lot recommande

- Continuer avec `ReadGame`, puis ses temporaires locaux `i` et `str` si le lot reste coherent.

---

- 2026-05-01: fonction `ReadClient` et temporaire local auto-detecte `field`.

## Verdict du lot

- `ReadClient`: valide. Dans le C, la fonction lit le bloc `gclient_t` par `fread`, puis itere `clientfields` pour appliquer `ReadField` aux trois pointeurs `F_ITEM` (`pers.weapon`, `pers.lastweapon`, `newweapon`). Dans le port TS, le format binaire est remplace par `restoreClient`: l'etat client est restaure depuis le snapshot JSON structure, les tableaux/vecteurs sont clones, et les trois pointeurs d'items sont resolus par `GetItemByIndex`.
- `field`: valide. Le pointeur d'iteration C sur `clientfields` est porte par les trois lookups explicites dans `restoreClient`; le harness verifie maintenant que `ReadGame` restaure `pers.weapon`, `pers.lastweapon` et `newweapon` depuis les index ecrits par `snapshotClient`.
- Commentaires d'en-tete: commentaire ajoute sur `restoreClient` dans `packages/game/src/g_save.ts` avec `Original name: ReadClient`, source, categorie, niveau de fidelite, comportement et notes de portage.

## Branchement et integrations

- Runtime: attendu et branche. Le role de `ReadClient` est atteint par `ReadGame`, expose par `g_main.ts` dans l'API game et appele par le serveur via `SV_ReadServerFile`; la reprise niveau separee passe par `ReadLevel`.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` connecte les flux save/load au `web-save-storage` et appelle le runtime porte; aucune logique web parallele ne remplace la restauration client.
- renderer-three: non applicable directement. `ReadClient` restaure l'etat gameplay client et des pointeurs d'items; il ne produit pas directement modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene. Les armes/items restaures peuvent ensuite influencer HUD/viewmodel/snapshots via le runtime client/serveur.

## Corrections appliquees

- `packages/game/src/g_save.ts`: ajout du commentaire d'en-tete de `restoreClient`.
- `scripts/verify/quake2-g-save.ts`: ajout d'assertions pour la restauration de `pers.weapon`, `pers.lastweapon` et `newweapon`.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: validation des lignes `ReadClient` et `field`.
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`: compteur `Validees` et prochain lot mis a jour.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:web-save-storage`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec `WriteGame`, puis ses temporaires locaux `i` et `str` si le lot reste coherent.

---

- 2026-05-01: fonction `WriteClient` et temporaire local auto-detecte `field`.

## Verdict du lot

- `WriteClient`: valide. Dans le C, la fonction copie le `gclient_t` dans `temp`, passe les entrees `clientfields` par `WriteField1`, ecrit le bloc client, puis repasse les memes champs par `WriteField2`. Dans le port TS, le format binaire est remplace par `snapshotClient`: l'etat client est capture dans un objet JSON structure et les pointeurs `F_ITEM` actifs de `clientfields` (`pers.weapon`, `pers.lastweapon`, `newweapon`) sont encodes en index stables via `itemIndex`.
- `field`: valide. Le pointeur d'iteration C sur `clientfields` est porte par les trois encodages explicites dans `snapshotClient`; la table `clientfields` conserve l'ordre et les types C, et le harness verifie les index JSON produits.
- Commentaires d'en-tete: commentaire ajoute sur `snapshotClient` dans `packages/game/src/g_save.ts` avec `Original name: WriteClient`, source, categorie, niveau de fidelite, comportement et notes de portage.

## Branchement et integrations

- Runtime: attendu et branche. Le role de `WriteClient` est atteint par `WriteGame`, expose par `g_main.ts` dans l'API game et appele par le serveur via `SV_WriteServerFile`/`SV_WriteLevelFile`; `SaveClientData` reste appele avant les saves manuels comme dans le C.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` connecte les slots save/load au `web-save-storage`; aucune logique web parallele ne remplace la serialization client.
- renderer-three: non applicable directement. `WriteClient` serialize l'etat gameplay client et les pointeurs d'items; il ne produit pas directement modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene. Les armes/items restaures peuvent seulement influencer ensuite HUD/viewmodel/snapshots via le runtime.

## Corrections appliquees

- `packages/game/src/g_save.ts`: ajout du commentaire d'en-tete de `snapshotClient`.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: validation des lignes `WriteClient` et `field`.
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`: compteur `Validees` et prochain lot mis a jour.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:web-save-storage`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec `ReadClient`, puis son temporaire local `field` si le lot reste coherent.

---

- 2026-05-01: fonction `ReadField` et temporaires locaux auto-detectes `p`, `len`, `index`.

## Verdict du lot

- `ReadField`: valide. Dans le C, la fonction ignore les champs `FFL_SPAWNTEMP`, laisse les scalaires/vecteurs deja lus en place, rematerialise les `F_LSTRING` depuis leur longueur, resout les `F_EDICT`, `F_CLIENT`, `F_ITEM`, `F_FUNCTION` et `F_MMOVE` depuis les index/offsets de la premiere passe. Dans le port TS, le format binaire est remplace par un snapshot JSON structure: `restoreLevel`, `restoreClient` et `restoreEntity` assignent directement les scalaires/vecteurs/chaines, resout les edicts avec `edictByIndex`, les items avec `GetItemByIndex`, les callbacks avec `findGameSaveFunction` et les moves avec `findGameSaveMove`. `F_CLIENT` n'a pas d'entree active dans les tables `g_save.c` actuelles.
- `p`: valide. Le pointeur C `base + field->ofs` est remplace par des acces structures et assignations directes sur les objets runtime level/client/entite.
- `len`: valide. La longueur binaire C des `F_LSTRING` n'existe plus dans l'adaptateur JSON; les chaines sont restaurees comme valeurs deja materialisees.
- `index`: valide. Les index/offsets C sont portes par les index edict/item et les noms stables callback/mmove, avec resolution pendant la restauration.
- Commentaires d'en-tete: pas de fonction TS directe `ReadField`; l'en-tete de `packages/game/src/g_save.ts` documente l'adaptateur JSON structure, les pointeurs d'entites/items et les noms stables de callbacks/mmove.

## Branchement et integrations

- Runtime: attendu et branche. Le role de `ReadField` est atteint par `ReadGame`/`ReadLevel`, exposes par l'API game via `g_main.ts` et appeles par les flux serveur `SV_ReadServerFile`/`SV_ReadLevelFile` ou la reprise de niveau depuis `SV_InitGame`.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` connecte `ge.ReadLevel` au stockage `web-save-storage`; aucune logique web parallele ne remplace la restauration gameplay.
- renderer-three: non applicable directement. `ReadField` et ses temporaires restaurent des donnees gameplay mais ne produisent pas directement modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene; les entites restaurees alimentent ensuite les snapshots visibles consommes par le renderer.

## Corrections appliquees

- Aucune correction TS necessaire pour ce lot.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: validation des lignes `ReadField`, `p`, `len` et `index`.
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`: compteur `Validees` et prochain lot mis a jour.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:web-save-storage`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec `WriteClient`, puis son temporaire local `field` si le lot reste coherent.

---

- 2026-05-01: temporaires locaux auto-detectes de `WriteField2`: `len` et `p`, rattaches a l'adaptateur JSON structure.

## Verdict du lot

- `len`: valide. Dans le C, `len = strlen(*(char **)p) + 1` determine la taille du payload `F_LSTRING` ecrit par `fwrite`, terminateur inclus. Dans le port TS, il n'y a pas de seconde passe binaire: la chaine est conservee directement comme payload JSON; les preuves verifient que les champs `classname` et `message` restent des chaines, pas des longueurs numeriques.
- `p`: valide. Dans le C, `p = (void *)(base + field->ofs)` relit le champ original sur `base`, apres que la copie temporaire a ete transformee par `WriteField1`. Dans le port TS, ce role est porte par les acces structures aux champs de `snapshotLevel` et `snapshotEntity`; les preuves verifient `changemap` cote level et `target`/`message` cote entite, et que l'entite source n'est pas mutee en longueur.
- Commentaires d'en-tete: pas de fonction TS directe pour ces temporaires; l'en-tete de `packages/game/src/g_save.ts` documente l'adaptateur JSON structure qui remplace les passes binaires C.

## Branchement et integrations

- Runtime: attendu et branche via `WriteLevel`, expose par `g_main.ts` puis appele par le flux serveur `SV_WriteLevelFile`; la restauration correspondante passe par `ReadLevel`.
- apps/web: attendu et branche via `apps/web/src/full-game-server-host.ts`, qui connecte `ge.WriteLevel` au `web-save-storage`; aucune logique web parallele ne remplace ce flux.
- renderer-three: non applicable directement. `len` et `p` dans `WriteField2` ne produisent ni modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene; les entites restaurees peuvent seulement alimenter ensuite les snapshots visibles.

## Corrections appliquees

- `scripts/verify/quake2-g-save.ts`: preuves explicites que l'adaptateur `WriteField2` conserve les payloads `F_LSTRING` en chaines JSON et lit les champs source level/entite sans mutation.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: validation des lignes `len` et `p` de `WriteField2`.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:web-save-storage`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec `ReadField`, puis ses temporaires locaux `p`, `len`, `index` si le lot reste coherent.

---

- 2026-05-01: fonction `WriteField2`, centree sur l'ecriture des chaines apres la premiere passe.

## Verdict du lot

- `WriteField2`: valide. Dans le C, la fonction ignore les champs `FFL_SPAWNTEMP`, relit le pointeur original dans `base + field->ofs`, et ecrit seulement les payloads `F_LSTRING` non nuls avec leur terminateur apres l'ecriture de la copie temporaire par `WriteField1`.
- Le port TS n'a pas de seconde passe binaire litterale: l'adaptateur de `packages/game/src/g_save.ts` ecrit un snapshot JSON structure ou les chaines `F_LSTRING` de niveau et d'entite sont directement conservees comme valeurs de chaines. La deviation est documentee dans l'en-tete du fichier (`FILE *` binaire remplace par JSON structure).
- Commentaires d'en-tete: pas de commentaire fonction direct a ajouter pour `WriteField2`, car l'equivalent est l'adaptateur structure prive; l'en-tete de `g_save.ts` documente le remplacement du format binaire.

## Branchement et integrations

- Runtime: attendu et branche. Le role de `WriteField2` est atteint par `WriteLevel`, exporte par l'API game via `g_main.ts` et appele par le flux serveur `SV_WriteLevelFile`; les chaines sauvegardees sont restaurees par `ReadLevel`.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` connecte `ge.WriteLevel` au stockage `web-save-storage`; aucune logique web parallele ne remplace la serialization gameplay.
- renderer-three: non applicable directement. `WriteField2` ne produit ni modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene; les entites restaurees peuvent seulement alimenter ensuite les snapshots visibles.

## Corrections appliquees

- `scripts/verify/quake2-g-save.ts`: ajout de preuves explicites pour les payloads chaines `F_LSTRING` d'entite (`classname`, `target`, `targetname`, `message`, `team`, `map`) dans le snapshot de niveau.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: ligne `WriteField2` marquee `Valide`.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec les temporaires locaux auto-detectes de `WriteField2`: `len` puis `p`, en les rattachant a l'adaptateur JSON structure.

---

- 2026-05-01: temporaires locaux de `WriteField1`: `p`, `len`, `index`.

## Verdict du lot

- `p`: valide. Dans le C, `p = (void *)(base + field->ofs)` pointe vers le champ de la copie temporaire avant mutation. Dans le port TS, ce role est remplace par les acces proprietes structures de `snapshotGame`/`snapshotClient`/`snapshotLevel`/`snapshotEntity`, sans arithmetique de pointeur.
- `len`: valide. Dans le C, `len` remplace temporairement les pointeurs `F_LSTRING`/`F_GSTRING` par une longueur avant l'ecriture du contenu par `WriteField2`. Dans le port TS, le buffer save est JSON structure et conserve directement les chaines; les preuves couvrent les chaines game/level sauvegardees et restaurees.
- `index`: valide. Dans le C, `index` remplace les pointeurs `F_EDICT`, `F_CLIENT`, `F_ITEM`, `F_FUNCTION` et `F_MMOVE` par des offsets/index. Dans le port TS, `entityIndex`, `itemIndex`, `callbackName` et `moveName` produisent les equivalents stables; `F_CLIENT` n'a pas d'entree active dans les tables actuelles.
- Commentaires d'en-tete: pas de commentaire fonction direct a ajouter pour ces temporaires; l'en-tete de `packages/game/src/g_save.ts` documente explicitement l'adapter JSON structure, les pointeurs d'entites/items et les noms stables de callbacks/mmove.

## Branchement et integrations

- Runtime: attendu et branche. Les temporaires `WriteField1` sont couverts par le chemin `WriteGame`/`WriteLevel`, expose par l'API game et appele par `SV_WriteServerFile`/`SV_WriteLevelFile`.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` connecte les hooks `readFile`/`writeFile` au `web-save-storage` et appelle le runtime porte; aucune logique parallele ne masque le save gameplay.
- renderer-three: non applicable directement. Ces temporaires n'emettent ni modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene; les donnees restaurees peuvent seulement alimenter ensuite les snapshots rendus.

## Corrections appliquees

- Aucune correction TS necessaire pour ce lot.
- `audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md`: validation des lignes `p`, `len`, `index` de `WriteField1`.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:web-save-storage`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec `WriteField2` si le lot reste centre sur l'ecriture des chaines apres la premiere passe.

---

- 2026-05-01: fonction `WriteField1`.

## Verdict du lot

- `WriteField1`: valide. La fonction C mute une copie temporaire avant ecriture binaire: ignore `FFL_SPAWNTEMP`, laisse int/float/vector/angle/ignore tels quels, encode les chaines par longueur, les edicts/clients/items par index, les fonctions par offset relatif a `InitGame`, et les `mmove_t` par offset relatif a `mmove_reloc`.
- Le port TS n'a pas de fonction `WriteField1` litterale; l'equivalent est le snapshot structure `snapshotGame`/`snapshotClient`/`snapshotLevel`/`snapshotEntity` et les helpers `entityIndex`, `itemIndex`, `callbackName`, `moveName`. Les pointeurs C actifs dans les tables `g_save.c` sont remplaces par index numeriques ou noms stables; la branche C `F_CLIENT` n'a pas d'entree active dans les tables actuelles. Ces deviations sont documentees dans l'en-tete de `packages/game/src/g_save.ts`.
- Commentaires d'en-tete: pas de commentaire fonction direct a ajouter, car il s'agit d'un adapter structure prive; l'en-tete du fichier documente explicitement le remplacement des offsets/pointeurs de `WriteField1`.

## Branchement et integrations

- Runtime: attendu et branche. `WriteField1` est appele en C par `WriteClient`, `WriteEdict` et `WriteLevelLocals`; en TS, le meme role est atteint via `WriteGame`/`WriteLevel`, eux-memes exposes par l'API game puis appeles par `SV_WriteServerFile` et `SV_WriteLevelFile`.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` fournit les hooks persistence vers `web-save-storage`, appelle `ge.WriteLevel`, et connecte le chemin serveur save/load au meme runtime porte; aucune logique parallele ne remplace la serialization gameplay.
- renderer-three: pas de branchement direct attendu. `WriteField1` ne produit pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ni scene; seules les entites restaurees peuvent ensuite produire des snapshots visibles consommes par le renderer.

## Corrections appliquees

- `scripts/verify/quake2-g-save.ts`: ajout de preuves explicites pour l'encodage type `WriteField1` des items client, references edict niveau/entite, callbacks `F_FUNCTION` et `F_MMOVE`, puis restauration des references.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:web-save-storage`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec les temporaires locaux auto-detectes de `WriteField1`: `p`, `len`, `index`.
