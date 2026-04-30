# Inventaire runtime Phase 03 - Quake-2-master/qcommon/qfiles.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/formats/src/qfiles.ts
- Cibles TS declarees : packages/formats/src/qfiles.ts, packages/formats/src/pak.ts, packages/formats/src/pcx.ts, packages/formats/src/wal.ts, packages/formats/src/md2.ts, packages/formats/src/sp2.ts, packages/formats/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | IDPAKHEADER | 34 | a-auditer | |
| struct | dpackfile_t | 36 | a-auditer | |
| global | name | 38 | a-auditer | |
| struct | dpackheader_t | 42 | a-auditer | |
| global | ident | 44 | a-auditer | |
| global | dirofs | 45 | a-auditer | |
| global | dirlen | 46 | a-auditer | |
| macro | MAX_FILES_IN_PACK | 49 | a-auditer | |
| struct | pcx_t | 60 | a-auditer | |
| global | manufacturer | 62 | a-auditer | |
| global | version | 63 | a-auditer | |
| global | encoding | 64 | a-auditer | |
| global | bits_per_pixel | 65 | a-auditer | |
| global | palette | 68 | a-auditer | |
| global | reserved | 69 | a-auditer | |
| global | color_planes | 70 | a-auditer | |
| global | bytes_per_line | 71 | a-auditer | |
| global | palette_type | 72 | a-auditer | |
| global | filler | 73 | a-auditer | |
| global | data | 74 | a-auditer | |
| macro | IDALIASHEADER | 86 | a-auditer | |
| macro | ALIAS_VERSION | 87 | a-auditer | |
| macro | MAX_TRIANGLES | 89 | a-auditer | |
| macro | MAX_VERTS | 90 | a-auditer | |
| macro | MAX_FRAMES | 91 | a-auditer | |
| macro | MAX_MD2SKINS | 92 | a-auditer | |
| macro | MAX_SKINNAME | 93 | a-auditer | |
| struct | dstvert_t | 95 | a-auditer | |
| global | s | 97 | a-auditer | |
| global | t | 98 | a-auditer | |
| struct | dtriangle_t | 101 | a-auditer | |
| global | index_xyz | 103 | a-auditer | |
| global | index_st | 104 | a-auditer | |
| struct | dtrivertx_t | 107 | a-auditer | |
| global | v | 109 | a-auditer | |
| global | lightnormalindex | 110 | a-auditer | |
| macro | DTRIVERTX_V0 | 113 | a-auditer | |
| macro | DTRIVERTX_V1 | 114 | a-auditer | |
| macro | DTRIVERTX_V2 | 115 | a-auditer | |
| macro | DTRIVERTX_LNI | 116 | a-auditer | |
| macro | DTRIVERTX_SIZE | 117 | a-auditer | |
| struct | daliasframe_t | 119 | a-auditer | |
| global | scale | 121 | a-auditer | |
| global | translate | 122 | a-auditer | |
| global | name | 123 | a-auditer | |
| struct | dmdl_t | 137 | a-auditer | |
| global | ident | 139 | a-auditer | |
| global | version | 140 | a-auditer | |
| global | skinwidth | 142 | a-auditer | |
| global | skinheight | 143 | a-auditer | |
| global | framesize | 144 | a-auditer | |
| global | num_skins | 146 | a-auditer | |
| global | num_xyz | 147 | a-auditer | |
| global | num_st | 148 | a-auditer | |
| global | num_tris | 149 | a-auditer | |
| global | num_glcmds | 150 | a-auditer | |
| global | num_frames | 151 | a-auditer | |
| global | ofs_skins | 153 | a-auditer | |
| global | ofs_st | 154 | a-auditer | |
| global | ofs_tris | 155 | a-auditer | |
| global | ofs_frames | 156 | a-auditer | |
| global | ofs_glcmds | 157 | a-auditer | |
| global | ofs_end | 158 | a-auditer | |
| macro | IDSPRITEHEADER | 170 | a-auditer | |
| macro | SPRITE_VERSION | 172 | a-auditer | |
| struct | dsprframe_t | 174 | a-auditer | |
| global | name | 178 | a-auditer | |
| struct | dsprite_t | 181 | a-auditer | |
| global | ident | 182 | a-auditer | |
| global | version | 183 | a-auditer | |
| global | numframes | 184 | a-auditer | |
| macro | MIPLEVELS | 197 | a-auditer | |
| struct | miptex_s | 198 | a-auditer | |
| global | name | 200 | a-auditer | |
| global | offsets | 202 | a-auditer | |
| global | animname | 203 | a-auditer | |
| global | flags | 204 | a-auditer | |
| global | contents | 205 | a-auditer | |
| global | value | 206 | a-auditer | |
| macro | IDBSPHEADER | 219 | a-auditer | |
| macro | BSPVERSION | 222 | a-auditer | |
| macro | MAX_MAP_MODELS | 228 | a-auditer | |
| macro | MAX_MAP_BRUSHES | 229 | a-auditer | |
| macro | MAX_MAP_ENTITIES | 230 | a-auditer | |
| macro | MAX_MAP_ENTSTRING | 231 | a-auditer | |
| macro | MAX_MAP_TEXINFO | 232 | a-auditer | |
| macro | MAX_MAP_AREAS | 234 | a-auditer | |
| macro | MAX_MAP_AREAPORTALS | 235 | a-auditer | |
| macro | MAX_MAP_PLANES | 236 | a-auditer | |
| macro | MAX_MAP_NODES | 237 | a-auditer | |
| macro | MAX_MAP_BRUSHSIDES | 238 | a-auditer | |
| macro | MAX_MAP_LEAFS | 239 | a-auditer | |
| macro | MAX_MAP_VERTS | 240 | a-auditer | |
| macro | MAX_MAP_FACES | 241 | a-auditer | |
| macro | MAX_MAP_LEAFFACES | 242 | a-auditer | |
| macro | MAX_MAP_LEAFBRUSHES | 243 | a-auditer | |
| macro | MAX_MAP_PORTALS | 244 | a-auditer | |
| macro | MAX_MAP_EDGES | 245 | a-auditer | |
| macro | MAX_MAP_SURFEDGES | 246 | a-auditer | |
| macro | MAX_MAP_LIGHTING | 247 | a-auditer | |
| macro | MAX_MAP_VISIBILITY | 248 | a-auditer | |
| macro | MAX_KEY | 252 | a-auditer | |
| macro | MAX_VALUE | 253 | a-auditer | |
| struct | lump_t | 257 | a-auditer | |
| macro | LUMP_ENTITIES | 262 | a-auditer | |
| macro | LUMP_PLANES | 263 | a-auditer | |
| macro | LUMP_VERTEXES | 264 | a-auditer | |
| macro | LUMP_VISIBILITY | 265 | a-auditer | |
| macro | LUMP_NODES | 266 | a-auditer | |
| macro | LUMP_TEXINFO | 267 | a-auditer | |
| macro | LUMP_FACES | 268 | a-auditer | |
| macro | LUMP_LIGHTING | 269 | a-auditer | |
| macro | LUMP_LEAFS | 270 | a-auditer | |
| macro | LUMP_LEAFFACES | 271 | a-auditer | |
| macro | LUMP_LEAFBRUSHES | 272 | a-auditer | |
| macro | LUMP_EDGES | 273 | a-auditer | |
| macro | LUMP_SURFEDGES | 274 | a-auditer | |
| macro | LUMP_MODELS | 275 | a-auditer | |
| macro | LUMP_BRUSHES | 276 | a-auditer | |
| macro | LUMP_BRUSHSIDES | 277 | a-auditer | |
| macro | LUMP_POP | 278 | a-auditer | |
| macro | LUMP_AREAS | 279 | a-auditer | |
| macro | LUMP_AREAPORTALS | 280 | a-auditer | |
| macro | HEADER_LUMPS | 281 | a-auditer | |
| struct | dheader_t | 283 | a-auditer | |
| global | ident | 285 | a-auditer | |
| global | version | 286 | a-auditer | |
| global | lumps | 287 | a-auditer | |
| struct | dmodel_t | 290 | a-auditer | |
| global | origin | 293 | a-auditer | |
| global | headnode | 294 | a-auditer | |
| struct | dvertex_t | 300 | a-auditer | |
| global | point | 302 | a-auditer | |
| macro | PLANE_X | 307 | a-auditer | |
| macro | PLANE_Y | 308 | a-auditer | |
| macro | PLANE_Z | 309 | a-auditer | |
| macro | PLANE_ANYX | 312 | a-auditer | |
| macro | PLANE_ANYY | 313 | a-auditer | |
| macro | PLANE_ANYZ | 314 | a-auditer | |
| struct | dplane_t | 318 | a-auditer | |
| global | normal | 320 | a-auditer | |
| global | dist | 321 | a-auditer | |
| global | type | 322 | a-auditer | |
| macro | CONTENTS_SOLID | 333 | a-auditer | |
| macro | CONTENTS_WINDOW | 334 | a-auditer | |
| macro | CONTENTS_AUX | 335 | a-auditer | |
| macro | CONTENTS_LAVA | 336 | a-auditer | |
| macro | CONTENTS_SLIME | 337 | a-auditer | |
| macro | CONTENTS_WATER | 338 | a-auditer | |
| macro | CONTENTS_MIST | 339 | a-auditer | |
| macro | LAST_VISIBLE_CONTENTS | 340 | a-auditer | |
| macro | CONTENTS_AREAPORTAL | 344 | a-auditer | |
| macro | CONTENTS_PLAYERCLIP | 346 | a-auditer | |
| macro | CONTENTS_MONSTERCLIP | 347 | a-auditer | |
| macro | CONTENTS_CURRENT_0 | 350 | a-auditer | |
| macro | CONTENTS_CURRENT_90 | 351 | a-auditer | |
| macro | CONTENTS_CURRENT_180 | 352 | a-auditer | |
| macro | CONTENTS_CURRENT_270 | 353 | a-auditer | |
| macro | CONTENTS_CURRENT_UP | 354 | a-auditer | |
| macro | CONTENTS_CURRENT_DOWN | 355 | a-auditer | |
| macro | CONTENTS_ORIGIN | 357 | a-auditer | |
| macro | CONTENTS_MONSTER | 359 | a-auditer | |
| macro | CONTENTS_DEADMONSTER | 360 | a-auditer | |
| macro | CONTENTS_DETAIL | 361 | a-auditer | |
| macro | CONTENTS_TRANSLUCENT | 362 | a-auditer | |
| macro | CONTENTS_LADDER | 363 | a-auditer | |
| macro | SURF_LIGHT | 367 | a-auditer | |
| macro | SURF_SLICK | 369 | a-auditer | |
| macro | SURF_SKY | 371 | a-auditer | |
| macro | SURF_WARP | 372 | a-auditer | |
| macro | SURF_TRANS33 | 373 | a-auditer | |
| macro | SURF_TRANS66 | 374 | a-auditer | |
| macro | SURF_FLOWING | 375 | a-auditer | |
| macro | SURF_NODRAW | 376 | a-auditer | |
| struct | dnode_t | 381 | a-auditer | |
| global | planenum | 383 | a-auditer | |
| global | children | 384 | a-auditer | |
| global | mins | 385 | a-auditer | |
| global | maxs | 386 | a-auditer | |
| global | firstface | 387 | a-auditer | |
| global | numfaces | 388 | a-auditer | |
| struct | texinfo_s | 392 | a-auditer | |
| global | flags | 395 | a-auditer | |
| global | value | 396 | a-auditer | |
| global | texture | 397 | a-auditer | |
| global | nexttexinfo | 398 | a-auditer | |
| struct | dedge_t | 404 | a-auditer | |
| global | v | 406 | a-auditer | |
| macro | MAXLIGHTMAPS | 409 | a-auditer | |
| struct | dface_t | 410 | a-auditer | |
| global | planenum | 412 | a-auditer | |
| global | side | 413 | a-auditer | |
| global | firstedge | 415 | a-auditer | |
| global | numedges | 416 | a-auditer | |
| global | texinfo | 417 | a-auditer | |
| global | styles | 420 | a-auditer | |
| global | lightofs | 421 | a-auditer | |
| struct | dleaf_t | 424 | a-auditer | |
| global | contents | 426 | a-auditer | |
| global | cluster | 428 | a-auditer | |
| global | area | 429 | a-auditer | |
| global | mins | 431 | a-auditer | |
| global | maxs | 432 | a-auditer | |
| global | firstleafface | 434 | a-auditer | |
| global | numleaffaces | 435 | a-auditer | |
| global | firstleafbrush | 437 | a-auditer | |
| global | numleafbrushes | 438 | a-auditer | |
| struct | dbrushside_t | 441 | a-auditer | |
| global | planenum | 443 | a-auditer | |
| global | texinfo | 444 | a-auditer | |
| struct | dbrush_t | 447 | a-auditer | |
| global | firstside | 449 | a-auditer | |
| global | numsides | 450 | a-auditer | |
| global | contents | 451 | a-auditer | |
| macro | ANGLE_UP | 454 | a-auditer | |
| macro | ANGLE_DOWN | 455 | a-auditer | |
| macro | DVIS_PVS | 461 | a-auditer | |
| macro | DVIS_PHS | 462 | a-auditer | |
| struct | dvis_t | 463 | a-auditer | |
| global | numclusters | 465 | a-auditer | |
| struct | dareaportal_t | 472 | a-auditer | |
| global | portalnum | 474 | a-auditer | |
| global | otherarea | 475 | a-auditer | |
| struct | darea_t | 478 | a-auditer | |
| global | numareaportals | 480 | a-auditer | |
| global | firstareaportal | 481 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

