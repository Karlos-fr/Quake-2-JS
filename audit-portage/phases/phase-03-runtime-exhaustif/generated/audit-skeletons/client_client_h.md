# Inventaire runtime Phase 03 - Quake-2-master/client/client.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/client.ts
- Cibles TS declarees : packages/client/src/client.ts, packages/client/src/keys.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| struct | frame_t | 42 | a-auditer | |
| global | valid | 44 | a-auditer | |
| global | serverframe | 45 | a-auditer | |
| global | servertime | 46 | a-auditer | |
| global | deltaframe | 47 | a-auditer | |
| global | areabits | 48 | a-auditer | |
| global | playerstate | 49 | a-auditer | |
| global | num_entities | 50 | a-auditer | |
| global | parse_entities | 51 | a-auditer | |
| struct | centity_t | 54 | a-auditer | |
| global | baseline | 56 | a-auditer | |
| global | current | 57 | a-auditer | |
| global | prev | 58 | a-auditer | |
| global | serverframe | 60 | a-auditer | |
| global | trailcount | 62 | a-auditer | |
| global | lerp_origin | 63 | a-auditer | |
| global | fly_stoptime | 65 | a-auditer | |
| macro | MAX_CLIENTWEAPONMODELS | 68 | a-auditer | |
| struct | clientinfo_t | 70 | a-auditer | |
| global | name | 72 | a-auditer | |
| global | cinfo | 73 | a-auditer | |
| global | iconname | 76 | a-auditer | |
| global | num_cl_weaponmodels | 82 | a-auditer | |
| macro | CMD_BACKUP | 84 | a-auditer | |
| struct | client_state_t | 90 | a-auditer | |
| global | timeoutcount | 92 | a-auditer | |
| global | timedemo_frames | 94 | a-auditer | |
| global | timedemo_start | 95 | a-auditer | |
| global | refresh_prepped | 97 | a-auditer | |
| global | sound_prepped | 98 | a-auditer | |
| global | force_refdef | 99 | a-auditer | |
| global | parse_entities | 101 | a-auditer | |
| global | cmd | 103 | a-auditer | |
| global | cmds | 104 | a-auditer | |
| global | cmd_time | 105 | a-auditer | |
| global | predicted_step | 108 | a-auditer | |
| global | predicted_step_time | 109 | a-auditer | |
| global | predicted_origin | 111 | a-auditer | |
| global | predicted_angles | 112 | a-auditer | |
| global | prediction_error | 113 | a-auditer | |
| global | frame | 115 | a-auditer | |
| global | surpressCount | 116 | a-auditer | |
| global | frames | 117 | a-auditer | |
| global | viewangles | 124 | a-auditer | |
| global | time | 126 | a-auditer | |
| global | lerpfrac | 128 | a-auditer | |
| global | layout | 137 | a-auditer | |
| global | inventory | 138 | a-auditer | |
| global | cinematic_file | 143 | a-auditer | |
| global | cinematictime | 144 | a-auditer | |
| global | cinematicframe | 145 | a-auditer | |
| global | cinematicpalette | 146 | a-auditer | |
| global | cinematicpalette_active | 147 | a-auditer | |
| global | attractloop | 152 | a-auditer | |
| global | servercount | 153 | a-auditer | |
| global | gamedir | 154 | a-auditer | |
| global | playernum | 155 | a-auditer | |
| enum | connstate_t | 183 | a-auditer | |
| enum | dltype_t | 191 | a-auditer | |
| enum | keydest_t | 199 | a-auditer | |
| struct | client_static_t | 201 | a-auditer | |
| global | framecount | 206 | a-auditer | |
| global | realtime | 207 | a-auditer | |
| global | frametime | 208 | a-auditer | |
| global | disable_screen | 211 | a-auditer | |
| global | disable_servercount | 214 | a-auditer | |
| global | servername | 218 | a-auditer | |
| global | connect_time | 219 | a-auditer | |
| global | quakePort | 221 | a-auditer | |
| global | serverProtocol | 224 | a-auditer | |
| global | challenge | 226 | a-auditer | |
| global | download | 228 | a-auditer | |
| global | downloadtempname | 229 | a-auditer | |
| global | downloadname | 230 | a-auditer | |
| global | downloadnumber | 231 | a-auditer | |
| global | downloadpercent | 233 | a-auditer | |
| global | demorecording | 236 | a-auditer | |
| global | demowaiting | 237 | a-auditer | |
| global | demofile | 238 | a-auditer | |
| global | cl_stereo_separation | 248 | a-auditer | |
| global | cl_stereo | 249 | a-auditer | |
| global | cl_gun | 251 | a-auditer | |
| global | cl_add_blend | 252 | a-auditer | |
| global | cl_add_lights | 253 | a-auditer | |
| global | cl_add_particles | 254 | a-auditer | |
| global | cl_add_entities | 255 | a-auditer | |
| global | cl_predict | 256 | a-auditer | |
| global | cl_footsteps | 257 | a-auditer | |
| global | cl_noskins | 258 | a-auditer | |
| global | cl_autoskins | 259 | a-auditer | |
| global | cl_upspeed | 261 | a-auditer | |
| global | cl_forwardspeed | 262 | a-auditer | |
| global | cl_sidespeed | 263 | a-auditer | |
| global | cl_yawspeed | 265 | a-auditer | |
| global | cl_pitchspeed | 266 | a-auditer | |
| global | cl_run | 268 | a-auditer | |
| global | cl_anglespeedkey | 270 | a-auditer | |
| global | cl_shownet | 272 | a-auditer | |
| global | cl_showmiss | 273 | a-auditer | |
| global | cl_showclamp | 274 | a-auditer | |
| global | lookspring | 276 | a-auditer | |
| global | lookstrafe | 277 | a-auditer | |
| global | sensitivity | 278 | a-auditer | |
| global | m_pitch | 280 | a-auditer | |
| global | m_yaw | 281 | a-auditer | |
| global | m_forward | 282 | a-auditer | |
| global | m_side | 283 | a-auditer | |
| global | freelook | 285 | a-auditer | |
| global | cl_lightlevel | 287 | a-auditer | |
| global | cl_paused | 289 | a-auditer | |
| global | cl_timedemo | 290 | a-auditer | |
| global | cl_vwep | 292 | a-auditer | |
| struct | cdlight_t | 294 | a-auditer | |
| global | key | 296 | a-auditer | |
| global | radius | 299 | a-auditer | |
| global | die | 300 | a-auditer | |
| global | decay | 301 | a-auditer | |
| global | minlight | 302 | a-auditer | |
| macro | MAX_PARSE_ENTITIES | 311 | a-auditer | |
| global | cl_parse_entities | 312 | a-auditer | |
| global | net_message | 317 | a-auditer | |
| function | DrawString | 319 | a-auditer | |
| function | DrawAltString | 320 | a-auditer | |
| function | CL_CheckOrDownloadFile | 321 | a-auditer | |
| function | CL_AddNetgraph | 323 | a-auditer | |
| struct | cl_sustain | 326 | a-auditer | |
| global | id | 328 | a-auditer | |
| global | type | 329 | a-auditer | |
| global | endtime | 330 | a-auditer | |
| global | nextthink | 331 | a-auditer | |
| global | thinkinterval | 332 | a-auditer | |
| global | org | 333 | a-auditer | |
| global | dir | 334 | a-auditer | |
| global | color | 335 | a-auditer | |
| global | count | 336 | a-auditer | |
| global | magnitude | 337 | a-auditer | |
| macro | MAX_SUSTAINS | 341 | a-auditer | |
| function | CL_ParticleSteamEffect2 | 342 | a-auditer | |
| function | CL_TeleporterParticles | 344 | a-auditer | |
| function | CL_ParticleEffect | 345 | a-auditer | |
| function | CL_ParticleEffect2 | 346 | a-auditer | |
| function | CL_ParticleEffect3 | 349 | a-auditer | |
| struct | particle_s | 356 | a-auditer | |
| global | time | 360 | a-auditer | |
| global | org | 362 | a-auditer | |
| global | vel | 363 | a-auditer | |
| global | accel | 364 | a-auditer | |
| global | color | 365 | a-auditer | |
| global | colorvel | 366 | a-auditer | |
| global | alpha | 367 | a-auditer | |
| global | alphavel | 368 | a-auditer | |
| macro | PARTICLE_GRAVITY | 372 | a-auditer | |
| macro | BLASTER_PARTICLE_COLOR | 373 | a-auditer | |
| macro | INSTANT_PARTICLE | 375 | a-auditer | |
| function | CL_ClearEffects | 379 | a-auditer | |
| function | CL_ClearTEnts | 380 | a-auditer | |
| function | CL_BlasterTrail | 381 | a-auditer | |
| function | CL_QuadTrail | 382 | a-auditer | |
| function | CL_RailTrail | 383 | a-auditer | |
| function | CL_BubbleTrail | 384 | a-auditer | |
| function | CL_FlagTrail | 385 | a-auditer | |
| function | CL_IonripperTrail | 388 | a-auditer | |
| function | CL_BlasterParticles2 | 392 | a-auditer | |
| function | CL_BlasterTrail2 | 393 | a-auditer | |
| function | CL_DebugTrail | 394 | a-auditer | |
| function | CL_SmokeTrail | 395 | a-auditer | |
| function | CL_Flashlight | 396 | a-auditer | |
| function | CL_ForceWall | 397 | a-auditer | |
| function | CL_FlameEffects | 398 | a-auditer | |
| function | CL_GenericParticleEffect | 399 | a-auditer | |
| function | CL_BubbleTrail2 | 400 | a-auditer | |
| function | CL_Heatbeam | 401 | a-auditer | |
| function | CL_ParticleSteamEffect | 402 | a-auditer | |
| function | CL_TrackerTrail | 403 | a-auditer | |
| function | CL_Tracker_Explode | 404 | a-auditer | |
| function | CL_TagTrail | 405 | a-auditer | |
| function | CL_ColorFlash | 406 | a-auditer | |
| function | CL_Tracker_Shell | 407 | a-auditer | |
| function | CL_MonsterPlasma_Shell | 408 | a-auditer | |
| function | CL_ColorExplosionParticles | 409 | a-auditer | |
| function | CL_ParticleSmokeEffect | 410 | a-auditer | |
| function | CL_Widowbeamout | 411 | a-auditer | |
| function | CL_Nukeblast | 412 | a-auditer | |
| function | CL_WidowSplash | 413 | a-auditer | |
| function | CL_ParseEntityBits | 417 | a-auditer | |
| function | CL_ParseDelta | 418 | a-auditer | |
| function | CL_ParseFrame | 419 | a-auditer | |
| function | CL_ParseTEnt | 421 | a-auditer | |
| function | CL_ParseConfigString | 422 | a-auditer | |
| function | CL_ParseMuzzleFlash | 423 | a-auditer | |
| function | CL_ParseMuzzleFlash2 | 424 | a-auditer | |
| function | SmokeAndFlash | 425 | a-auditer | |
| function | CL_SetLightstyle | 427 | a-auditer | |
| function | CL_RunParticles | 429 | a-auditer | |
| function | CL_RunDLights | 430 | a-auditer | |
| function | CL_RunLightStyles | 431 | a-auditer | |
| function | CL_AddEntities | 433 | a-auditer | |
| function | CL_AddDLights | 434 | a-auditer | |
| function | CL_AddTEnts | 435 | a-auditer | |
| function | CL_AddLightStyles | 436 | a-auditer | |
| function | CL_PrepRefresh | 440 | a-auditer | |
| function | CL_RegisterSounds | 441 | a-auditer | |
| function | CL_Quit_f | 443 | a-auditer | |
| function | IN_Accumulate | 445 | a-auditer | |
| function | CL_ParseLayout | 447 | a-auditer | |
| function | CL_Init | 455 | a-auditer | |
| function | CL_FixUpGender | 457 | a-auditer | |
| function | CL_Disconnect | 458 | a-auditer | |
| function | CL_Disconnect_f | 459 | a-auditer | |
| function | CL_GetChallengePacket | 460 | a-auditer | |
| function | CL_PingServers_f | 461 | a-auditer | |
| function | CL_Snd_Restart_f | 462 | a-auditer | |
| function | CL_RequestNextDownload | 463 | a-auditer | |
| struct | kbutton_t | 468 | a-auditer | |
| global | down | 470 | a-auditer | |
| global | downtime | 471 | a-auditer | |
| global | msec | 472 | a-auditer | |
| global | state | 473 | a-auditer | |
| global | in_strafe | 477 | a-auditer | |
| global | in_speed | 478 | a-auditer | |
| function | CL_InitInput | 480 | a-auditer | |
| function | CL_SendCmd | 481 | a-auditer | |
| function | CL_SendMove | 482 | a-auditer | |
| function | CL_ClearState | 484 | a-auditer | |
| function | CL_ReadPackets | 486 | a-auditer | |
| function | CL_ReadFromServer | 488 | a-auditer | |
| function | CL_WriteToServer | 489 | a-auditer | |
| function | CL_BaseMove | 490 | a-auditer | |
| function | IN_CenterView | 492 | a-auditer | |
| function | CL_KeyState | 494 | a-auditer | |
| function | Key_KeynumToString | 495 | a-auditer | |
| function | CL_WriteDemoMessage | 500 | a-auditer | |
| function | CL_Stop_f | 501 | a-auditer | |
| function | CL_Record_f | 502 | a-auditer | |
| global | svc_strings | 507 | a-auditer | |
| function | CL_ParseServerMessage | 509 | a-auditer | |
| function | CL_LoadClientinfo | 510 | a-auditer | |
| function | SHOWNET | 511 | a-auditer | |
| function | CL_ParseClientinfo | 512 | a-auditer | |
| function | CL_Download_f | 513 | a-auditer | |
| global | gun_frame | 518 | a-auditer | |
| function | V_Init | 521 | a-auditer | |
| function | V_RenderView | 522 | a-auditer | |
| function | V_AddEntity | 523 | a-auditer | |
| function | V_AddParticle | 524 | a-auditer | |
| function | V_AddLight | 525 | a-auditer | |
| function | V_AddLightStyle | 526 | a-auditer | |
| function | CL_RegisterTEntSounds | 531 | a-auditer | |
| function | CL_RegisterTEntModels | 532 | a-auditer | |
| function | CL_SmokeAndFlash | 533 | a-auditer | |
| function | CL_InitPrediction | 539 | a-auditer | |
| function | CL_PredictMove | 540 | a-auditer | |
| function | CL_CheckPredictionError | 541 | a-auditer | |
| function | CL_AllocDlight | 546 | a-auditer | |
| function | CL_BigTeleportParticles | 547 | a-auditer | |
| function | CL_RocketTrail | 548 | a-auditer | |
| function | CL_DiminishingTrail | 549 | a-auditer | |
| function | CL_FlyEffect | 550 | a-auditer | |
| function | CL_BfgParticles | 551 | a-auditer | |
| function | CL_AddParticles | 552 | a-auditer | |
| function | CL_EntityEvent | 553 | a-auditer | |
| function | CL_TrapParticles | 555 | a-auditer | |
| function | M_Init | 560 | a-auditer | |
| function | M_Keydown | 561 | a-auditer | |
| function | M_Draw | 562 | a-auditer | |
| function | M_Menu_Main_f | 563 | a-auditer | |
| function | M_ForceMenuOff | 564 | a-auditer | |
| function | M_AddToServerList | 565 | a-auditer | |
| function | CL_ParseInventory | 570 | a-auditer | |
| function | CL_KeyInventory | 571 | a-auditer | |
| function | CL_DrawInventory | 572 | a-auditer | |
| function | CL_PredictMovement | 577 | a-auditer | |
| function | x86_TimerStart | 580 | a-auditer | |
| function | x86_TimerStop | 581 | a-auditer | |
| function | x86_TimerInit | 582 | a-auditer | |
| function | x86_TimerGetHistogram | 583 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

