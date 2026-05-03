# Progress - Quake-2-master/game/game.h

## Session 2026-05-03

Lot traite:
- `GAME_API_VERSION`
- `SVF_NOCLIENT`
- `SVF_DEADMONSTER`
- `SVF_MONSTER`
- `solid_t`

Verdict:
- `Valide` pour les 5 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `GAME_API_VERSION` conserve la valeur C `3` dans `packages/game/src/game.ts`.
- `SVF_NOCLIENT`, `SVF_DEADMONSTER` et `SVF_MONSTER` conservent les valeurs C `0x00000001`, `0x00000002`, `0x00000004` via `1 << 0`, `1 << 1`, `1 << 2` dans `packages/game/src/runtime.ts`, puis sont reexportes par `packages/game/src/game.ts` et `packages/game/src/index.ts`.
- `solid_t` conserve `SOLID_NOT=0`, `SOLID_TRIGGER=1`, `SOLID_BBOX=2`, `SOLID_BSP=3` dans `packages/game/src/game.ts`, adosse aux constantes runtime equivalentes.
- Commentaires d'en-tete verifies pour `GAME_API_VERSION` et `solid_t` dans `packages/game/src/game.ts`. Les macros `SVF_*` sont des constantes runtime reexportees; pas de commentaire de fonction applicable.

Integration:
- Runtime: OK. `GAME_API_VERSION` est controle par `SV_InitGameProgs` dans `packages/server/src/sv_game.ts`; les `SVF_*` et `SOLID_*` sont utilises par les flux gameplay/serveur normaux, notamment monstres, triggers, linking, collision et emission de snapshots.
- `apps/web`: OK indirectement. `apps/web/src/full-game-server-host.ts` instancie le runtime serveur via `GetGameApiFunction`; le host consomme les snapshots et ne remplace pas ces constantes par une logique parallele.
- `renderer-three`: OK indirectement. Ces entites ne produisent pas directement de modele, image, particule, beam, dlight, temp entity, areabits, camera ou scene; elles gouvernent la presence/solidite serveur, ensuite consommee via les snapshots et frames client. `verify:full-game:three-renderer` couvre le flux renderer full-game.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:game` OK
- `npm run verify:g-monster` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run verify:server:world` KO avant exercice du lot: import manquant `packages/formats/src/bsp.js` dans le harness
- `npm run verify:server:ents` KO avant exercice du lot: meme import manquant
- `npm run verify:server:send` KO avant exercice du lot: meme import manquant

Corrections:
- Aucune correction TS necessaire.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `link_s`, puis `MAX_ENT_CLUSTERS` si le lot reste petit.

## Session 2026-05-03 - link_s / MAX_ENT_CLUSTERS

Lot traite:
- `link_s`
- `MAX_ENT_CLUSTERS`

Verdict:
- `Valide` pour les 2 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: `struct link_s` contient uniquement les pointeurs `prev` et `next`, puis est typedef en `link_t`; `MAX_ENT_CLUSTERS` vaut `16` et dimensionne `edict_t.clusternums`.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `packages/game/src/game.ts` expose maintenant `link_s = GameAreaLink` et conserve `link_t = link_s`, ce qui represente le tag struct C et son typedef.
- `GameAreaLink` conserve les champs `prev` et `next`, nullable pour l'etat detache initial.
- `MAX_ENT_CLUSTERS` conserve la valeur C `16`; `createRuntimeEntity` initialise `clusternums` avec une capacite `16`, verifiee contre la constante exportee.
- Commentaires d'en-tete verifies et ajoutes/mis a jour dans `packages/game/src/game.ts` pour `link_s`, `link_t` et `MAX_ENT_CLUSTERS`.

Integration:
- Runtime: OK. `link_s`/`link_t` est represente par `GameEntity.area`, initialise detache, puis gere avec le linking runtime (`linkGameEntity`/`unlinkGameEntity`) et les callbacks serveur `SV_LinkEdict`/`SV_UnlinkEdict`. `MAX_ENT_CLUSTERS` dimensionne la capacite runtime de `clusternums`, consommee par `SV_LinkEdict` et `SV_BuildClientFrame` pour le filtrage PVS/areabits.
- `apps/web`: OK indirectement. Le host full-game appelle le game API porte, relaie `linkentity`/`unlinkentity` au serveur local et consomme les snapshots produits; aucune logique web parallele ne remplace `link_s` ou la capacite de clusters.
- `renderer-three`: OK indirectement. Le lot ne produit pas directement modeles, frames, images, particules, beams, dlights, temp entities, camera ou scene. Il conditionne toutefois les entites visibles et areabits serveur; ces sorties sont consommees via snapshots/client frames puis par `renderer-three` (`refdef.entities`, `areabits`, scene world/brush models).

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:game` OK
- `npm run verify:server:world` OK
- `npm run verify:server:ents` OK
- `npm run verify:server:send` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `packages/game/src/game.ts`: ajout de l'alias exporte `link_s` et conservation de `link_t` comme alias du tag source.
- `scripts/verify/quake2-game-header.ts`: preuve ajoutee pour la forme `link_s`/`link_t`, l'etat detache, la reference `prev` et le stockage `Int32Array` de `clusternums`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `gclient_s`, puis ses champs `ps` et `ping` si le lot reste petit.
