# Inventaire runtime Phase 03 - Quake-2-master/game/m_player.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_player.ts
- Cibles TS declarees : packages/game/src/m_player.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | FRAME_stand01 | 24 | a-auditer | |
| macro | FRAME_stand02 | 25 | a-auditer | |
| macro | FRAME_stand03 | 26 | a-auditer | |
| macro | FRAME_stand04 | 27 | a-auditer | |
| macro | FRAME_stand05 | 28 | a-auditer | |
| macro | FRAME_stand06 | 29 | a-auditer | |
| macro | FRAME_stand07 | 30 | a-auditer | |
| macro | FRAME_stand08 | 31 | a-auditer | |
| macro | FRAME_stand09 | 32 | a-auditer | |
| macro | FRAME_stand10 | 33 | a-auditer | |
| macro | FRAME_stand11 | 34 | a-auditer | |
| macro | FRAME_stand12 | 35 | a-auditer | |
| macro | FRAME_stand13 | 36 | a-auditer | |
| macro | FRAME_stand14 | 37 | a-auditer | |
| macro | FRAME_stand15 | 38 | a-auditer | |
| macro | FRAME_stand16 | 39 | a-auditer | |
| macro | FRAME_stand17 | 40 | a-auditer | |
| macro | FRAME_stand18 | 41 | a-auditer | |
| macro | FRAME_stand19 | 42 | a-auditer | |
| macro | FRAME_stand20 | 43 | a-auditer | |
| macro | FRAME_stand21 | 44 | a-auditer | |
| macro | FRAME_stand22 | 45 | a-auditer | |
| macro | FRAME_stand23 | 46 | a-auditer | |
| macro | FRAME_stand24 | 47 | a-auditer | |
| macro | FRAME_stand25 | 48 | a-auditer | |
| macro | FRAME_stand26 | 49 | a-auditer | |
| macro | FRAME_stand27 | 50 | a-auditer | |
| macro | FRAME_stand28 | 51 | a-auditer | |
| macro | FRAME_stand29 | 52 | a-auditer | |
| macro | FRAME_stand30 | 53 | a-auditer | |
| macro | FRAME_stand31 | 54 | a-auditer | |
| macro | FRAME_stand32 | 55 | a-auditer | |
| macro | FRAME_stand33 | 56 | a-auditer | |
| macro | FRAME_stand34 | 57 | a-auditer | |
| macro | FRAME_stand35 | 58 | a-auditer | |
| macro | FRAME_stand36 | 59 | a-auditer | |
| macro | FRAME_stand37 | 60 | a-auditer | |
| macro | FRAME_stand38 | 61 | a-auditer | |
| macro | FRAME_stand39 | 62 | a-auditer | |
| macro | FRAME_stand40 | 63 | a-auditer | |
| macro | FRAME_run1 | 64 | a-auditer | |
| macro | FRAME_run2 | 65 | a-auditer | |
| macro | FRAME_run3 | 66 | a-auditer | |
| macro | FRAME_run4 | 67 | a-auditer | |
| macro | FRAME_run5 | 68 | a-auditer | |
| macro | FRAME_run6 | 69 | a-auditer | |
| macro | FRAME_attack1 | 70 | a-auditer | |
| macro | FRAME_attack2 | 71 | a-auditer | |
| macro | FRAME_attack3 | 72 | a-auditer | |
| macro | FRAME_attack4 | 73 | a-auditer | |
| macro | FRAME_attack5 | 74 | a-auditer | |
| macro | FRAME_attack6 | 75 | a-auditer | |
| macro | FRAME_attack7 | 76 | a-auditer | |
| macro | FRAME_attack8 | 77 | a-auditer | |
| macro | FRAME_pain101 | 78 | a-auditer | |
| macro | FRAME_pain102 | 79 | a-auditer | |
| macro | FRAME_pain103 | 80 | a-auditer | |
| macro | FRAME_pain104 | 81 | a-auditer | |
| macro | FRAME_pain201 | 82 | a-auditer | |
| macro | FRAME_pain202 | 83 | a-auditer | |
| macro | FRAME_pain203 | 84 | a-auditer | |
| macro | FRAME_pain204 | 85 | a-auditer | |
| macro | FRAME_pain301 | 86 | a-auditer | |
| macro | FRAME_pain302 | 87 | a-auditer | |
| macro | FRAME_pain303 | 88 | a-auditer | |
| macro | FRAME_pain304 | 89 | a-auditer | |
| macro | FRAME_jump1 | 90 | a-auditer | |
| macro | FRAME_jump2 | 91 | a-auditer | |
| macro | FRAME_jump3 | 92 | a-auditer | |
| macro | FRAME_jump4 | 93 | a-auditer | |
| macro | FRAME_jump5 | 94 | a-auditer | |
| macro | FRAME_jump6 | 95 | a-auditer | |
| macro | FRAME_flip01 | 96 | a-auditer | |
| macro | FRAME_flip02 | 97 | a-auditer | |
| macro | FRAME_flip03 | 98 | a-auditer | |
| macro | FRAME_flip04 | 99 | a-auditer | |
| macro | FRAME_flip05 | 100 | a-auditer | |
| macro | FRAME_flip06 | 101 | a-auditer | |
| macro | FRAME_flip07 | 102 | a-auditer | |
| macro | FRAME_flip08 | 103 | a-auditer | |
| macro | FRAME_flip09 | 104 | a-auditer | |
| macro | FRAME_flip10 | 105 | a-auditer | |
| macro | FRAME_flip11 | 106 | a-auditer | |
| macro | FRAME_flip12 | 107 | a-auditer | |
| macro | FRAME_salute01 | 108 | a-auditer | |
| macro | FRAME_salute02 | 109 | a-auditer | |
| macro | FRAME_salute03 | 110 | a-auditer | |
| macro | FRAME_salute04 | 111 | a-auditer | |
| macro | FRAME_salute05 | 112 | a-auditer | |
| macro | FRAME_salute06 | 113 | a-auditer | |
| macro | FRAME_salute07 | 114 | a-auditer | |
| macro | FRAME_salute08 | 115 | a-auditer | |
| macro | FRAME_salute09 | 116 | a-auditer | |
| macro | FRAME_salute10 | 117 | a-auditer | |
| macro | FRAME_salute11 | 118 | a-auditer | |
| macro | FRAME_taunt01 | 119 | a-auditer | |
| macro | FRAME_taunt02 | 120 | a-auditer | |
| macro | FRAME_taunt03 | 121 | a-auditer | |
| macro | FRAME_taunt04 | 122 | a-auditer | |
| macro | FRAME_taunt05 | 123 | a-auditer | |
| macro | FRAME_taunt06 | 124 | a-auditer | |
| macro | FRAME_taunt07 | 125 | a-auditer | |
| macro | FRAME_taunt08 | 126 | a-auditer | |
| macro | FRAME_taunt09 | 127 | a-auditer | |
| macro | FRAME_taunt10 | 128 | a-auditer | |
| macro | FRAME_taunt11 | 129 | a-auditer | |
| macro | FRAME_taunt12 | 130 | a-auditer | |
| macro | FRAME_taunt13 | 131 | a-auditer | |
| macro | FRAME_taunt14 | 132 | a-auditer | |
| macro | FRAME_taunt15 | 133 | a-auditer | |
| macro | FRAME_taunt16 | 134 | a-auditer | |
| macro | FRAME_taunt17 | 135 | a-auditer | |
| macro | FRAME_wave01 | 136 | a-auditer | |
| macro | FRAME_wave02 | 137 | a-auditer | |
| macro | FRAME_wave03 | 138 | a-auditer | |
| macro | FRAME_wave04 | 139 | a-auditer | |
| macro | FRAME_wave05 | 140 | a-auditer | |
| macro | FRAME_wave06 | 141 | a-auditer | |
| macro | FRAME_wave07 | 142 | a-auditer | |
| macro | FRAME_wave08 | 143 | a-auditer | |
| macro | FRAME_wave09 | 144 | a-auditer | |
| macro | FRAME_wave10 | 145 | a-auditer | |
| macro | FRAME_wave11 | 146 | a-auditer | |
| macro | FRAME_point01 | 147 | a-auditer | |
| macro | FRAME_point02 | 148 | a-auditer | |
| macro | FRAME_point03 | 149 | a-auditer | |
| macro | FRAME_point04 | 150 | a-auditer | |
| macro | FRAME_point05 | 151 | a-auditer | |
| macro | FRAME_point06 | 152 | a-auditer | |
| macro | FRAME_point07 | 153 | a-auditer | |
| macro | FRAME_point08 | 154 | a-auditer | |
| macro | FRAME_point09 | 155 | a-auditer | |
| macro | FRAME_point10 | 156 | a-auditer | |
| macro | FRAME_point11 | 157 | a-auditer | |
| macro | FRAME_point12 | 158 | a-auditer | |
| macro | FRAME_crstnd01 | 159 | a-auditer | |
| macro | FRAME_crstnd02 | 160 | a-auditer | |
| macro | FRAME_crstnd03 | 161 | a-auditer | |
| macro | FRAME_crstnd04 | 162 | a-auditer | |
| macro | FRAME_crstnd05 | 163 | a-auditer | |
| macro | FRAME_crstnd06 | 164 | a-auditer | |
| macro | FRAME_crstnd07 | 165 | a-auditer | |
| macro | FRAME_crstnd08 | 166 | a-auditer | |
| macro | FRAME_crstnd09 | 167 | a-auditer | |
| macro | FRAME_crstnd10 | 168 | a-auditer | |
| macro | FRAME_crstnd11 | 169 | a-auditer | |
| macro | FRAME_crstnd12 | 170 | a-auditer | |
| macro | FRAME_crstnd13 | 171 | a-auditer | |
| macro | FRAME_crstnd14 | 172 | a-auditer | |
| macro | FRAME_crstnd15 | 173 | a-auditer | |
| macro | FRAME_crstnd16 | 174 | a-auditer | |
| macro | FRAME_crstnd17 | 175 | a-auditer | |
| macro | FRAME_crstnd18 | 176 | a-auditer | |
| macro | FRAME_crstnd19 | 177 | a-auditer | |
| macro | FRAME_crwalk1 | 178 | a-auditer | |
| macro | FRAME_crwalk2 | 179 | a-auditer | |
| macro | FRAME_crwalk3 | 180 | a-auditer | |
| macro | FRAME_crwalk4 | 181 | a-auditer | |
| macro | FRAME_crwalk5 | 182 | a-auditer | |
| macro | FRAME_crwalk6 | 183 | a-auditer | |
| macro | FRAME_crattak1 | 184 | a-auditer | |
| macro | FRAME_crattak2 | 185 | a-auditer | |
| macro | FRAME_crattak3 | 186 | a-auditer | |
| macro | FRAME_crattak4 | 187 | a-auditer | |
| macro | FRAME_crattak5 | 188 | a-auditer | |
| macro | FRAME_crattak6 | 189 | a-auditer | |
| macro | FRAME_crattak7 | 190 | a-auditer | |
| macro | FRAME_crattak8 | 191 | a-auditer | |
| macro | FRAME_crattak9 | 192 | a-auditer | |
| macro | FRAME_crpain1 | 193 | a-auditer | |
| macro | FRAME_crpain2 | 194 | a-auditer | |
| macro | FRAME_crpain3 | 195 | a-auditer | |
| macro | FRAME_crpain4 | 196 | a-auditer | |
| macro | FRAME_crdeath1 | 197 | a-auditer | |
| macro | FRAME_crdeath2 | 198 | a-auditer | |
| macro | FRAME_crdeath3 | 199 | a-auditer | |
| macro | FRAME_crdeath4 | 200 | a-auditer | |
| macro | FRAME_crdeath5 | 201 | a-auditer | |
| macro | FRAME_death101 | 202 | a-auditer | |
| macro | FRAME_death102 | 203 | a-auditer | |
| macro | FRAME_death103 | 204 | a-auditer | |
| macro | FRAME_death104 | 205 | a-auditer | |
| macro | FRAME_death105 | 206 | a-auditer | |
| macro | FRAME_death106 | 207 | a-auditer | |
| macro | FRAME_death201 | 208 | a-auditer | |
| macro | FRAME_death202 | 209 | a-auditer | |
| macro | FRAME_death203 | 210 | a-auditer | |
| macro | FRAME_death204 | 211 | a-auditer | |
| macro | FRAME_death205 | 212 | a-auditer | |
| macro | FRAME_death206 | 213 | a-auditer | |
| macro | FRAME_death301 | 214 | a-auditer | |
| macro | FRAME_death302 | 215 | a-auditer | |
| macro | FRAME_death303 | 216 | a-auditer | |
| macro | FRAME_death304 | 217 | a-auditer | |
| macro | FRAME_death305 | 218 | a-auditer | |
| macro | FRAME_death306 | 219 | a-auditer | |
| macro | FRAME_death307 | 220 | a-auditer | |
| macro | FRAME_death308 | 221 | a-auditer | |
| macro | MODEL_SCALE | 223 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

