# Progress - Quake-2-master/game/g_main.c

## Dernier lot traite

- 2026-04-30: globals initiaux `sm_meat_index`, `snd_fry`, `meansOfDeath`.

## Verdict du lot

- `meansOfDeath`: valide. Le global C est porte comme `runtime.meansOfDeath` dans `packages/game/src/runtime.ts`, initialise a `0`, ecrit par `g_combat.ts`/`g_cmds.ts` et lu par `p_client.ts`.
- `sm_meat_index`: partiel. Le comportement consommateur est remplace par une comparaison de chemin de modele dans `g_misc.ts`, mais aucun champ runtime/global explicite ne porte l'index stocke par `g_main.c`/`g_spawn.c`.
- `snd_fry`: partiel. `p_view.ts` utilise directement l'index du son `player/fry.wav` via le registre runtime, mais aucun champ runtime/global explicite ne porte l'index stocke par `g_main.c`/`g_spawn.c`.

## Tests de reference

- `npm run verify:g-misc`: ok.
- `npm run verify:g-main`: ok apres correction coordinateur de l'import de harness `g-local.js` vers `g_local.js`.
- `npm run verify:p-view`: ok apres correction coordinateur des imports de harness `q-shared.js` vers `q_shared.js` et `g-local.js` vers `g_local.js`.

## Blocages / decisions

- Pas de correction appliquee: une correction fidele de `sm_meat_index`/`snd_fry` toucherait probablement `runtime.ts`, `g_spawn.ts`, `g_misc.ts` et `p_view.ts`, donc au-dela du fichier TS cible principal de ce lot.
- `apps/web` et `packages/renderer-three` ne remplacent pas ces globals d'apres la recherche de references.
- Les blocages de harness initiaux ont ete leves cote coordinateur; les statuts `Partiel` restent intentionnels pour absence de champ global/runtime explicite.

## Prochain lot recommande

- Continuer au debut de la matrice avec le groupe d'etat runtime/cvars suivant: `g_edicts`, `deathmatch`, `coop`, `dmflags`, `skill`.
