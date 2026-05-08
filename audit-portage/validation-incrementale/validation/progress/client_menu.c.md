# Progress - Quake-2-master/client/menu.c

## Session 2026-05-08

- Lot traite: demarrage large du menu: etat initial du menu, sons, pile runtime, helpers de dessin communs, menu principal, bloc game/load/save.
- Matrice mise a jour: 61 `Valide`, 0 `Partiel`, 35 `Non applicable`, 266 `A verifier`.
- Corrections appliquees: ajout des commentaires d'en-tete de portage manquants pour les callbacks prives du bloc `game/load/save` dans `packages/client/src/menu-main-game.ts`.
- Runtime: `M_Init`, `M_Menu_Main_f`, `M_Draw`, `M_Keydown`, pile menu, sons et commandes menu atteignables depuis les commandes runtime et le flux web.
- apps/web: integration presente dans `apps/web/src/full-game.ts`; `verify:full-game:commands`, `verify:full-game:newgame` et `verify:full-game:bridge` passent. Le harness bridge simule explicitement un client connecte avant `loading`, conforme au guard source de `SCR_BeginLoadingPlaque`.
- renderer-three: pas d'integration directe attendue pour ce lot. Les entites validees produisent des commandes de dessin 2D menu via `ref.DrawPic`/`DrawChar` et du flux input/commande; elles ne produisent pas modeles, frames, particules, beams, dlights, areabits, camera ou scene 3D a consommer par `packages/renderer-three`.
- Tests lances:
  - `npm run verify:menu` OK
  - `npm run verify:full-game:commands` OK
  - `npm run verify:full-game:newgame` OK
  - `npm run typecheck` OK
  - `npm run verify:full-game:bridge` OK apres correction du harness connecte

## Prochain lot recommande

Reprendre le bloc credits (`idcredits`, `xatcredits`, `roguecredits`, `M_Credits_MenuDraw`, `M_Credits_Key`, `M_Menu_Credits_f` et locaux associes).
