# Inventaire runtime Phase 03 - Quake-2-master/client/cl_input.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_input.ts
- Cibles TS declarees : packages/client/src/cl_input.ts, packages/client/src/input.ts, packages/client/src/client.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | cl_nodelta | 24 | a-auditer | |
| global | sys_frame_time | 26 | a-auditer | |
| global | frame_msec | 27 | a-auditer | |
| global | old_sys_frame_time | 28 | a-auditer | |
| global | in_impulse | 63 | a-auditer | |
| function | KeyDown | 66 | a-auditer | |
| global | k | 68 | a-auditer | |
| global | c | 69 | a-auditer | |
| global | k | 75 | a-auditer | |
| function | KeyUp | 102 | a-auditer | |
| global | k | 104 | a-auditer | |
| global | c | 105 | a-auditer | |
| global | uptime | 106 | a-auditer | |
| global | return | 123 | a-auditer | |
| function | IN_KLookDown | 142 | a-auditer | |
| function | IN_KLookUp | 143 | a-auditer | |
| function | IN_UpDown | 144 | a-auditer | |
| function | IN_UpUp | 145 | a-auditer | |
| function | IN_DownDown | 146 | a-auditer | |
| function | IN_DownUp | 147 | a-auditer | |
| function | IN_LeftDown | 148 | a-auditer | |
| function | IN_LeftUp | 149 | a-auditer | |
| function | IN_RightDown | 150 | a-auditer | |
| function | IN_RightUp | 151 | a-auditer | |
| function | IN_ForwardDown | 152 | a-auditer | |
| function | IN_ForwardUp | 153 | a-auditer | |
| function | IN_BackDown | 154 | a-auditer | |
| function | IN_BackUp | 155 | a-auditer | |
| function | IN_LookupDown | 156 | a-auditer | |
| function | IN_LookupUp | 157 | a-auditer | |
| function | IN_LookdownDown | 158 | a-auditer | |
| function | IN_LookdownUp | 159 | a-auditer | |
| function | IN_MoveleftDown | 160 | a-auditer | |
| function | IN_MoveleftUp | 161 | a-auditer | |
| function | IN_MoverightDown | 162 | a-auditer | |
| function | IN_MoverightUp | 163 | a-auditer | |
| function | IN_SpeedDown | 165 | a-auditer | |
| function | IN_SpeedUp | 166 | a-auditer | |
| function | IN_StrafeDown | 167 | a-auditer | |
| function | IN_StrafeUp | 168 | a-auditer | |
| function | IN_AttackDown | 170 | a-auditer | |
| function | IN_AttackUp | 171 | a-auditer | |
| function | IN_UseDown | 173 | a-auditer | |
| function | IN_UseUp | 174 | a-auditer | |
| function | IN_Impulse | 176 | a-auditer | |
| function | CL_KeyState | 185 | a-auditer | |
| global | val | 187 | a-auditer | |
| global | msec | 188 | a-auditer | |
| global | cl_upspeed | 222 | a-auditer | |
| global | cl_forwardspeed | 223 | a-auditer | |
| global | cl_sidespeed | 224 | a-auditer | |
| global | cl_yawspeed | 226 | a-auditer | |
| global | cl_pitchspeed | 227 | a-auditer | |
| global | cl_run | 229 | a-auditer | |
| global | cl_anglespeedkey | 231 | a-auditer | |
| function | CL_AdjustAngles | 241 | a-auditer | |
| global | speed | 243 | a-auditer | |
| global | speed | 249 | a-auditer | |
| function | CL_BaseMove | 276 | a-auditer | |
| function | CL_ClampPitch | 312 | a-auditer | |
| global | pitch | 314 | a-auditer | |
| function | CL_FinishMove | 330 | a-auditer | |
| global | ms | 332 | a-auditer | |
| global | i | 333 | a-auditer | |
| function | CL_CreateCmd | 371 | a-auditer | |
| global | cmd | 373 | a-auditer | |
| function | IN_CenterView | 397 | a-auditer | |
| function | CL_InitInput | 407 | a-auditer | |
| function | CL_SendCmd | 453 | a-auditer | |
| global | buf | 455 | a-auditer | |
| global | data | 456 | a-auditer | |
| global | i | 457 | a-auditer | |
| global | nullcmd | 459 | a-auditer | |
| global | checksumIndex | 460 | a-auditer | |
| function | MSG_WriteLong | 512 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

