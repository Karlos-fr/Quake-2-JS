# Progress - Quake-2-master/game/g_save.c

## Dernier lot traite

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
