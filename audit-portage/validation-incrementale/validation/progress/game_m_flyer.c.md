# Progress - Quake-2-master/game/m_flyer.c

## Statut

- Statut fichier: termine cote matrice `game_m_flyer.c.md`.
- Lot valide pendant cette session: fermeture complete de `m_flyer.c`, depuis `nextmove` et les sons jusqu'a `SP_monster_flyer`, incluant stand/walk/run, transitions start/stop, roll/bank/defense, pain, attaque blaster, melee, death, spawn et tables/moves declaratives.
- Verdict: `98 Valide`, `9 Non applicable`, `0 A verifier`.

## Decisions

- Les declarations forward C initiales `flyer_check_melee`, `flyer_loop_melee`, `flyer_melee`, `flyer_setstart`, `flyer_stand`, `flyer_nextmove` sont `Non applicable`; les definitions proprietaires correspondantes sont validees plus bas dans la matrice.
- Les variables locales C `effect` dans `flyer_fire` et `n` dans `flyer_pain` sont `Non applicable`; leur comportement est valide avec les fonctions proprietaires.
- Aucun correctif TS necessaire dans `packages/game/src/m_flyer.ts`, `g_spawn.ts`, `g_save.ts` ou `index.ts`.
- `AVANCEMENT_GLOBAL.md` non modifie dans cette mission fichier unique.

## Checklist appliquee

- Ownership confirme sur `packages/game/src/m_flyer.ts`; `g_spawn.ts`, `g_save.ts` et `index.ts` ne servent qu'au branchement registre/export.
- Doublons verifies: declarations forward et variables locales justifiees `Non applicable`; pas de doublon proprietaire TS concurrent detecte.
- Comparaison C vs TS faite pour sons, precache, frames/moves, callbacks, `monsterinfo.currentmove`, effets `EF_HYPERBLASTER`, degats, sons, explosion et spawn.
- Commentaires d'en-tete des fonctions portees verifies dans `m_flyer.ts`.
- Runtime verifie: `ED_CallSpawn` -> `SP_monster_flyer` -> `flymonster_start` -> `G_RunFrame`/`monster_think`/`M_MoveFrame`, callbacks `stand/walk/run/attack/melee/sight/idle/pain/die`, save registry des callbacks et moves.
- `apps/web` verifie via les tests full-game/local/web: consommation par runtime full-game, snapshots, sons et sorties temp/muzzleflash.
- `renderer-three` verifie: les sorties visibles attendues passent par modeles MD2, `modelindex`, `frame`, `oldframe`, `skinnum`, temp entities/muzzleflash et snapshots/refresh entities.

## Tests lances

- `npm run verify:m-flyer` -> OK
- `npm run verify:m-flyer:header` -> OK
- `npm run verify:m-flyer:source-parity` -> OK
- `npm run verify:full-game:render-source` -> OK
- `npm run verify:full-game:server-snapshots` -> OK
- `npm run verify:full-game:three-renderer` -> OK
- `npm run verify:full-game:audio-routing` -> OK
- `npm run verify:web-render-order` -> OK
- `npm run verify:local-gameplay-sync` -> OK

## Prochain lot

- Aucun pour `m_flyer.c`; toutes les lignes sont `Valide` ou `Non applicable`.
