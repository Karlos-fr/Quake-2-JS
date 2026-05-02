# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `fire_lead` et temporaires locaux `tr`, `dir`, `end`, `r`, `u`, `water_start`, `water`, `content_mask`, `color`.
- Verdict du lot: valide pour `fire_lead`; temporaires non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaire d'en-tete verifie sur `fire_lead` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Runtime verifie: `fire_lead` est interne et atteint via `fire_bullet`/`fire_shotgun`, eux-memes appeles par `p_weapon.c` porte (`Weapon_Machinegun`, `Weapon_Chaingun`, `weapon_shotgun_fire`, `weapon_supershotgun_fire`) et par les tirs monstres (`monster_fire_bullet`, `monster_fire_shotgun`). Le harness couvre le trace initial depuis `self.s.origin`, le trace `MASK_SHOT | MASK_WATER`, `DAMAGE_BULLET`, l'impact non damageable, l'entree dans l'eau, `TE_SPLASH` et `TE_BUBBLETRAIL`.
- `apps/web`: pas de logique parallele attendue; le navigateur declenche les tirs via le runtime local/serveur porte et `local-gameplay-sync` consomme les temp entities du runtime pour le client.
- `packages/renderer-three`: integration indirecte attendue et verifiee via les sorties client temp entities/particules (`TE_GUNSHOT`, `TE_SHOTGUN`, `TE_SPLASH`, `TE_BUBBLETRAIL`) consommees par la chaine client puis renderer; pas de branchement direct `renderer-three` attendu depuis `g_weapon.ts`.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:g-main`
- `npm run verify:g-target`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-weapon.ts`: extension du harness cible pour `fire_lead` via `fire_bullet` (impact sec, damage, eau, splash, bubble trail).
- `packages/game/src/g_main.ts`: correction du flush runtime `TE_SPLASH` pour ecrire `payload.color` quand il est produit par `fire_lead`, avec fallback `sounds` pour `target_splash`.
- `scripts/verify/quake2-g-main.ts`: assertion serveur dediee au flush `TE_SPLASH.color`.

## Prochain lot recommande

- Continuer avec `fire_bullet` et `fire_shotgun`; valider leurs wrappers vers `fire_lead`, leurs commentaires, les chemins `p_weapon`/monstres et les tests existants.

## Blocages

- Aucun.
