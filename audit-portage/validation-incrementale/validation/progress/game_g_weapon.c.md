# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `check_dodge` et temporaires locaux `tr`, `eta`.
- Verdict du lot: valide pour `check_dodge`; `tr` et `eta` non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Runtime verifie: `check_dodge` est appele par defaut depuis `fire_blaster`, `fire_rocket` et `fire_bfg` quand `self.client` est present; le test couvre le trace `MASK_SHOT` sur 8192 unites, le filtre easy skill, les conditions monstre vivant/dodge/infront, et le calcul `eta`.
- `apps/web`: pas de branchement direct attendu pour ce lot; le navigateur passe par le runtime serveur/jeu porte, et `check_dodge` ne remplace aucune logique web.
- `packages/renderer-three`: non applicable pour ce lot; `check_dodge` ne produit ni modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ni scene. Les projectiles visibles qui appellent ce helper seront juges dans leurs lots propres.

## Tests lances

- `npm run verify:g-weapon`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-weapon.ts`: ajout d'un harness cible pour `check_dodge`.
- `package.json`: ajout du script `verify:g-weapon`.

## Prochain lot recommande

- Continuer avec `fire_hit` et ses temporaires locaux (`tr`, `v`, `point`, `range`, `dir`, `aim`) si le lot reste petit.

## Blocages

- Aucun.
