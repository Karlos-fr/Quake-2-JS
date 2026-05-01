# Progress - Quake-2-master/game/g_save.c

## Dernier lot traite

- 2026-05-01: macro `Function`, global `mmove_reloc`, table `fields`.

## Verdict du lot

- `Function`: valide. La macro C `{#f, f}` est portee par `registerGameSaveFunction` et les registres `saveFunctionByName`/`saveFunctionNameByRef`, avec restauration via `findGameSaveFunction`. Le commentaire d'en-tete porte `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement et notes de portage.
- `mmove_reloc`: valide. L'ancre C de relocation data segment est remplacee par `mmove_reloc` symbolique et par les registres `registerGameSaveMove`/`findGameSaveMove`. Le comportement attendu de restauration `F_MMOVE` est couvert par le round-trip de `monsterinfo.currentmove`.
- `fields`: valide. La table TS conserve les 80 entrees C dans le meme ordre, avec noms, offsets symboliques, types `fieldtype_t` et flags `FFL_NOSPAWN`/`FFL_SPAWNTEMP`; le sentinel C `{0,0,0,0}` est remplace par la fin du tableau TS.

## Branchement et integrations

- Runtime: attendu et branche. Les entites du lot participent au flux save/load via `g_main.ts` `WriteGame`/`ReadGame`/`WriteLevel`/`ReadLevel`, expose par `GetGameApi`, puis appele par les chemins serveur `SV_WriteLevelFile`/`SV_ReadLevelFile` et savegame.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` fournit les hooks `readFile`/`writeFile` vers le stockage web et appelle les slots `ge.WriteLevel`/`ge.ReadLevel`; aucune logique parallele ne remplace la serialisation gameplay.
- renderer-three: pas de branchement direct attendu pour ce lot. `Function`, `mmove_reloc` et `fields` ne produisent ni modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ni scene; les sorties visibles viennent seulement des entites restaurees, ensuite consommees par les snapshots runtime habituels.

## Corrections appliquees

- Renforcement de `scripts/verify/quake2-g-save.ts`: preuve complete de la table `fields`, round-trip de `registerGameSaveFunction`/`findGameSaveFunction`, verification de `mmove_reloc` et round-trip `registerGameSaveMove`/`findGameSaveMove`.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec `levelfields` global/table, puis `clientfields` global/table si le lot reste petit.
