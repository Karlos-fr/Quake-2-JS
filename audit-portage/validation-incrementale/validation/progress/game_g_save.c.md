# Progress - Quake-2-master/game/g_save.c

## Dernier lot traite

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
