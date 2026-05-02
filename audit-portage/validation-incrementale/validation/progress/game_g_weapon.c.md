# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `fire_bullet`, `fire_shotgun` et temporaire local `i`.
- Verdict du lot: valide pour `fire_bullet` et `fire_shotgun`; `i` non applicable comme entite autonome.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaires d'en-tete verifies sur `fire_bullet` et `fire_shotgun` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`).
- Comparaison C/TS: `fire_bullet` appelle strictement `fire_lead` avec `TE_GUNSHOT`; `fire_shotgun` boucle `count` fois et appelle `fire_lead` avec `TE_SHOTGUN`. Le temporaire C `i` est porte comme compteur de boucle local TS.
- Runtime verifie: chemins joueur via `p_weapon.ts` (`Weapon_Machinegun`, `Weapon_Chaingun`, `weapon_shotgun_fire`, `weapon_supershotgun_fire`) et chemins monstres via `g_monster.ts` (`monster_fire_bullet`, `monster_fire_shotgun`). Les wrappers restent atteignables depuis le runtime local/serveur par les tables d'armes et callbacks monstres.
- `apps/web`: pas de logique parallele attendue dans `apps/web`; le navigateur doit declencher ces tirs via le runtime local/serveur porte. `verify:local-gameplay-sync` confirme la consommation du flux runtime cote client.
- `packages/renderer-three`: sortie visible indirecte attendue par les temp entities produites par `fire_lead` (`TE_GUNSHOT`, `TE_SHOTGUN`, et effets eau deja couverts par le lot precedent). Pas de branchement direct `renderer-three` attendu depuis `g_weapon.ts`; `verify:full-game:three-renderer` confirme que la chaine renderer reste branchee.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-weapon.ts`: ajout d'une preuve ciblee `fire_shotgun` validant que la boucle appelle `fire_lead` une fois par pellet et emet `TE_SHOTGUN`.

## Prochain lot recommande

- Continuer avec `blaster_touch` et ses temporaires locaux `mod` si le lot reste coherent.

## Blocages

- Aucun.
