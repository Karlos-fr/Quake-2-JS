# Progress - Quake-2-master/game/g_save.c

## Dernier lot traite

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
