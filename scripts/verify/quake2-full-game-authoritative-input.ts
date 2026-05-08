/**
 * File: quake2-full-game-authoritative-input.ts
 * Purpose: Verify that full-game active gameplay input flows through `CL_Frame -> CL_SendCmd -> SV_ClientThink`.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CL_Frame,
  CL_InitInput,
  CL_InitLocal,
  CL_PredictMovement,
  CL_PrepRefresh,
  CL_ReadPackets,
  SCR_Init,
  connstate_t,
  createClientInputContext,
  createClientMainContext,
  createClientPredictionCollisionSource,
  createClientRuntime,
  createClientScreenContext,
  createClientSendCmdBridge,
  createRefExport
} from "../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  FS_Gamedir,
  mountPak,
  readMountedFile
} from "../../packages/filesystem/src/index.js";
import {
  ANGLE2SHORT,
  Cbuf_AddText,
  Cbuf_Execute,
  Cmd_Init,
  CS_MODELS,
  RF_WEAPONMODEL,
  STAT_AMMO,
  STAT_ARMOR,
  temp_event_t,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import { createFullGameCommandBridgeState, registerFullGameCommandBridge, syncFullGameLoadingState } from "../../apps/web/src/full-game-command-bridge.js";
import { createFullGameLocalTransport } from "../../apps/web/src/full-game-local-transport.js";
import { createFullGameServerRenderSource } from "../../apps/web/src/full-game-render-source.js";
import { createFullGameServerHost } from "../../apps/web/src/full-game-server-host.js";

const repoRoot = process.cwd();
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game authoritative input verification");

let now = 1000;
let parsedFrames = 0;
let railTrailPackets = 0;
let prepRefreshCount = 0;
const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const prints: string[] = [];
const transport = createFullGameLocalTransport({
  now: () => now,
  onPrint: (message) => {
    prints.push(message);
  }
});

Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
SCR_Init(createClientScreenContext(client, cmd, cvar));

const mainContext = createClientMainContext(client, cmd, cvar);
const inputContext = createClientInputContext(client, cmd, cvar, {
  qnet: transport.clientQnet
});
const sendClientCommand = createClientSendCmdBridge(inputContext, {
  getFrameOptions: () => ({
    anykeydown: true,
    key_game_active: true
  })
});
const ref = createRefExport();

const serverHost = createFullGameServerHost({
  cmd,
  cvar,
  filesystem,
  getGameDir: () => FS_Gamedir(filesystem),
  qnet: transport.serverQnet,
  onPrint: (message) => {
    prints.push(message);
  },
  onBeginLoading: () => {
    client.cl.screen.scr_draw_loading = 1;
  }
});

const prepRefresh = (): void => {
  prepRefreshCount += 1;
  assert.ok(CL_PrepRefresh(client, {
    ref,
    viewportWidth: 640,
    viewportHeight: 480,
    crosshairValue: 0,
    onPrint: (message) => {
      prints.push(message);
    },
    onUpdateScreen: () => undefined,
    onPumpEvents: () => undefined
  }), "CL_PrepRefresh should prepare the authoritative map");
};

CL_InitLocal(mainContext, {
  getMilliseconds: () => now,
  qnet: transport.clientQnet,
  serverRunning: () => serverHost.hasActiveGameMap(),
  allowDownload: false,
  fileExists: (path) => readMountedFile(filesystem, path) !== undefined,
  loadBinaryFile: (path) => readMountedFile(filesystem, path)?.bytes ?? null,
  onPrepRefresh: prepRefresh,
  onRegisterSounds: () => undefined,
  onBegin: () => undefined,
  onPrint: (message) => {
    prints.push(message);
  }
});
CL_InitInput(inputContext);

const predictClientMovement = (): void => {
  const incomingAcknowledged = client.cls.netchan.incoming_acknowledged;
  const outgoingSequence = client.cls.netchan.outgoing_sequence;
  const predictionCollision = serverHost.hasActiveGameMap()
    ? createClientPredictionCollisionSource(client, serverHost.collisionWorld)
    : undefined;
  CL_PredictMovement(client, {
    incomingAcknowledged,
    outgoingSequence,
    predictMovement: true,
    ...(predictionCollision ? { predictionCollision } : {})
  });
};

const createClientHooks = (withReadPackets: boolean) => ({
  getMilliseconds: () => now,
  qnet: transport.clientQnet,
  serverRunning: () => serverHost.hasActiveGameMap(),
  onPrint: (message: string) => {
    prints.push(message);
  },
  onStufftext: (text: string) => {
    Cbuf_AddText(cmd, text);
  },
  onExecuteCommandBuffer: () => {
    Cbuf_Execute(cmd);
  },
  ...(withReadPackets ? {
    onReadPackets: () => {
      CL_ReadPackets(mainContext, createClientHooks(false));
    }
  } : {}),
  onSendCmd: sendClientCommand,
  onPredictMovement: predictClientMovement,
  onPrepRefresh: prepRefresh,
  onRegisterSounds: () => undefined,
  onBegin: () => undefined,
  onFrameParsed: () => {
    parsedFrames += 1;
  },
  onTempEntity: (packet) => {
    if (packet.type === temp_event_t.TE_RAILTRAIL) {
      railTrailPackets += 1;
    }
  },
  registerModel: (path: string) => path,
  registerSkin: (path: string) => path,
  registerPic: (path: string) => path,
  registerSound: (path: string) => path
});

const bridge = createFullGameCommandBridgeState();
registerFullGameCommandBridge(cmd, cvar, client, bridge, {
  onPrint: (message) => {
    prints.push(message);
  }
});

Cbuf_AddText(cmd, "loading ; killserver ; wait ; newgame\n");
Cbuf_Execute(cmd);
syncFullGameLoadingState(client, bridge);
Cbuf_Execute(cmd);

for (let frame = 0; frame < 80; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);

  if (client.cls.state === connstate_t.ca_active && client.cl.refresh_prepped) {
    break;
  }
}

assert.equal(client.cls.state, connstate_t.ca_active, "client should be active before testing gameplay input");
assert.equal(client.cl.refresh_prepped, true, "client refresh should be ready before gameplay input");
assert.equal(prepRefreshCount >= 1, true, "startup should prepare refresh through the CL_Frame path");

const framecountBeforeInput = client.cls.framecount;
const serverframeBeforeInput = client.cl.frame.serverframe;
const originBeforeInput = [...client.cl.frame.playerstate.pmove.origin];
Cbuf_AddText(cmd, "+forward\n");

now += 100;
client.cls.realtime = now;
CL_Frame(mainContext, 100, createClientHooks(true));

assert.equal(client.cls.framecount, framecountBeforeInput + 1, "CL_Frame should be the active client frame clock");
assert.equal(client.cl.cmd.forwardmove > 0, true, "CL_Frame should build a forward usercmd from +forward");
assert.equal(transport.queuedClientToServer > 0, true, "CL_SendCmd should queue a clc_move packet for the server");

serverHost.frame(100);
assert.equal(transport.queuedClientToServer, 0, "server frame should consume the client move packet");
assert.equal(serverHost.getLocalClientLastCommand()?.forwardmove, client.cl.cmd.forwardmove, "SV_ClientThink should receive the CL_SendCmd forwardmove");
assert.equal(transport.queuedServerToClient > 0, true, "server should queue a snapshot response after consuming input");

CL_ReadPackets(mainContext, createClientHooks(false));
Cbuf_Execute(cmd);
assert.equal(client.cl.frame.serverframe > serverframeBeforeInput, true, "client should parse a newer authoritative snapshot after input");
const originAfterInput = client.cl.frame.playerstate.pmove.origin;
assert.equal(
  originAfterInput.some((value, index) => value !== originBeforeInput[index]),
  true,
  "authoritative movement should advance the server player origin after +forward"
);
assert.equal(parsedFrames > 0, true, "client parser should report authoritative frames");

const yawBeforeMouse = client.cl.frame.playerstate.viewangles[1];
const renderedYawBeforeMouse = createFullGameServerRenderSource(client, { cvar }).refreshFrame?.view.viewangles[1];
const localYawCommand = client.cl.viewangles[1] - 30;
client.cl.viewangles[1] = localYawCommand;

now += 100;
client.cls.realtime = now;
CL_Frame(mainContext, 100, createClientHooks(true));
serverHost.frame(100);
CL_ReadPackets(mainContext, createClientHooks(false));
Cbuf_Execute(cmd);

assert.equal(
  (serverHost.getLocalClientLastCommand()?.angles[1] ?? 0) & 0xffff,
  ANGLE2SHORT(localYawCommand) & 0xffff,
  "mouse-look yaw should be encoded in the usercmd sent through CL_SendCmd"
);
assert.notEqual(
  client.cl.frame.playerstate.viewangles[1],
  yawBeforeMouse,
  "authoritative snapshot should reflect the mouse-look yaw command"
);
assert.notEqual(
  createFullGameServerRenderSource(client, { cvar }).refreshFrame?.view.viewangles[1],
  renderedYawBeforeMouse,
  "render source should use the predicted mouse-look yaw for the active camera"
);

Cbuf_AddText(cmd, "-forward\n");
Cbuf_Execute(cmd);

const zBeforeJump = client.cl.frame.playerstate.pmove.origin[2];
Cbuf_AddText(cmd, "+moveup\n");
Cbuf_Execute(cmd);

now += 100;
client.cls.realtime = now;
CL_Frame(mainContext, 100, createClientHooks(true));
serverHost.frame(100);
CL_ReadPackets(mainContext, createClientHooks(false));
Cbuf_Execute(cmd);

const zAfterJump = client.cl.frame.playerstate.pmove.origin[2];
assert.ok(zAfterJump > zBeforeJump, "authoritative +moveup should start a jump by raising packed Z");

Cbuf_AddText(cmd, "-moveup\n");
Cbuf_Execute(cmd);

let zPeak = zAfterJump;
let zAfterFall = zAfterJump;
for (let frame = 0; frame < 20; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
  const z = client.cl.frame.playerstate.pmove.origin[2];
  zPeak = Math.max(zPeak, z);
  zAfterFall = z;
}

assert.ok(zPeak > zAfterJump, "authoritative jump should continue upward briefly after release");
assert.ok(zAfterFall < zPeak, "authoritative gravity should pull the player back down after a jump");

Cbuf_AddText(cmd, "give all\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 4; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

assert.equal(client.cl.frame.playerstate.stats[STAT_ARMOR], 200, "give all should grant body armor through the authoritative server path");

Cbuf_AddText(cmd, "weapnext\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 12; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

assert.equal(client.cl.frame.playerstate.stats[STAT_AMMO], 100, "weapnext after give all should switch from Blaster to Shotgun with shell ammo");

Cbuf_AddText(cmd, "use Railgun\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 12; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

assert.equal(client.cl.frame.playerstate.stats[STAT_AMMO], 50, "give all should grant railgun ammo so the original use command can select it");

const railTrailPacketsBeforeAttack = railTrailPackets;
Cbuf_AddText(cmd, "+attack\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 20; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

Cbuf_AddText(cmd, "-attack\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 20; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

assert.equal(
  railTrailPackets > railTrailPacketsBeforeAttack,
  true,
  "firing the Railgun should parse the TE_RAILTRAIL start/end payload without desyncing the server message"
);

Cbuf_AddText(cmd, "use Grenade Launcher\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 12; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

let playerState = client.cl.frame.playerstate;
assert.equal(
  client.cl.configstrings[CS_MODELS + playerState.gunindex],
  "models/weapons/v_launch/tris.md2",
  "key-6 Grenade Launcher use path should select the launcher view model"
);

Cbuf_AddText(cmd, "use grenades\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 12; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

playerState = client.cl.frame.playerstate;
assert.equal(
  client.cl.configstrings[CS_MODELS + playerState.gunindex],
  "models/weapons/v_handgr/tris.md2",
  "default g bind use grenades path should select the hand grenade view model"
);

Cbuf_AddText(cmd, "use HyperBlaster\n");
Cbuf_Execute(cmd);

for (let frame = 0; frame < 12; frame += 1) {
  now += 100;
  client.cls.realtime = now;
  CL_Frame(mainContext, 100, createClientHooks(true));
  serverHost.frame(100);
  CL_ReadPackets(mainContext, createClientHooks(false));
  Cbuf_Execute(cmd);
}

playerState = client.cl.frame.playerstate;
assert.equal(
  client.cl.configstrings[CS_MODELS + playerState.gunindex],
  "models/weapons/v_hyperb/tris.md2",
  "key-8 HyperBlaster use path should select the hyperblaster view model"
);
const hyperBlasterRenderFrame = createFullGameServerRenderSource(client, { cvar }).refreshFrame;
const hyperBlasterViewWeapon = hyperBlasterRenderFrame?.entities.find((entity) => (entity.flags & RF_WEAPONMODEL) !== 0) ?? null;
assert.ok(hyperBlasterViewWeapon, "HyperBlaster should append a first-person weapon render entity");
assert.equal(
  client.cl.configstrings[CS_MODELS + hyperBlasterViewWeapon.modelindex],
  "models/weapons/v_hyperb/tris.md2",
  "HyperBlaster render entity should resolve to the hyperblaster view model"
);

console.log("quake2-full-game-authoritative-input: ok");
