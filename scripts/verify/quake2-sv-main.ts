/**
 * File: quake2-sv-main.ts
 * Purpose: Verify the TypeScript port target for `server/sv_main.c` (current subset).
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for server client-lifecycle, connectionless packet and read-packet paths.
 *
 * Dependencies:
 * - packages/server/src/sv_main.ts
 */

import { strict as assert } from "node:assert";

import { createSizeBuffer } from "../../packages/memory/src/index.js";
import { createRuntimeEntity } from "../../packages/game/src/index.js";
import { createGameClient } from "../../packages/game/src/runtime.js";
import type { game_export_t } from "../../packages/game/src/index.js";
import {
  createServerClient,
  createServerMainProcedures,
  createServerState,
  createServerStatic,
  createServerUserProcedures
} from "../../packages/server/src/index.js";
import { client_state_t } from "../../packages/server/src/server.js";
import {
  Cvar_Get,
  MSG_WriteLong,
  MSG_WriteShort,
  Netchan_Setup,
  createCommandRuntime,
  createCvarRuntime,
  createNetAdr,
  createQcommonNetRuntime,
  netadrtype_t,
  netsrc_t
} from "../../packages/qcommon/src/index.js";

let disconnectCalls = 0;
const executeClientMessageCalls: string[] = [];
const transmitted: Array<{ sock: netsrc_t; data: Uint8Array; to: ReturnType<typeof createNetAdr> }> = [];
const printed: string[] = [];
const incomingPackets: Array<{ from: ReturnType<typeof createNetAdr>; data: Uint8Array }> = [];
const frameEvents: string[] = [];
const sleepCalls: number[] = [];
let timeBeforeGame = -1;
let timeAfterGame = -1;
let randomFrameCalls = 0;
const HEARTBEAT_BASE_TIME = 500_000;
let shutdownGameProgsCalls = 0;
let userinfoChangedCalls = 0;
const closedDemoHandles: unknown[] = [];
const serverStates: number[] = [];

const ge = createGameExports();
const cmd = createCommandRuntime();
const cvarRuntime = createCvarRuntime();
const qnet = createQcommonNetRuntime({
  getPacket: () => incomingPackets.shift() ?? null,
  sendPacket: (sock, data, to) => {
    transmitted.push({ sock, data: new Uint8Array(data), to });
  },
  sleep: (msec) => {
    sleepCalls.push(msec);
  }
});

const sv = createServerState();
const svs = createServerStatic();
const client = createServerClient();
client.state = client_state_t.cs_spawned;
client.edict = createRuntimeEntity({}, 1);
client.edict.client = createGameClient();
client.netchan.sock = netsrc_t.NS_SERVER;
client.userinfo = "\\name\\PlÃ¤yer\\rate\\50\\msg\\2";
client.download = new Uint8Array([1, 2, 3]);
const freeClient = createServerClient();
svs.clients = [client, freeClient];

const hostname = Cvar_Get(cvarRuntime, "hostname", "quake2js", 0);
const rcon_password = Cvar_Get(cvarRuntime, "rcon_password", "secret", 0);
const sv_reconnect_limit = Cvar_Get(cvarRuntime, "sv_reconnect_limit", "3", 0);
const serverDedicated = cvar("dedicated", 1);
const serverPublic = cvar("public", 1);

const main = createServerMainProcedures({
  sv,
  svs,
  ge,
  cmd,
  cvar: cvarRuntime,
  qnet,
  maxclients: cvar("maxclients", 2),
  hostname,
  rcon_password,
  timeout: cvar("timeout", 125),
  zombietime: cvar("zombietime", 2),
  sv_paused: cvar("paused", 0),
  sv_timedemo: cvar("timedemo", 0),
  sv_showclamp: cvar("showclamp", 0),
  host_speeds: cvar("host_speeds", 1),
  sv_reconnect_limit,
  dedicated: serverDedicated,
  public_server: serverPublic,
  master_adr: [createMasterAdr(27910), createMasterAdr(27911)],
  SV_BroadcastPrintf: (_level, fmt, ...args) => {
    frameEvents.push(`broadcast:${fmt}:${args.join(",")}`);
  },
  SV_SendClientMessages: () => {
    frameEvents.push("send");
  },
  SV_RecordDemoMessage: () => {
    frameEvents.push("record");
  },
  getServerInfo: () => "\\hostname\\quake2js",
  executeRconCommand: (command) => `executed:${command}`,
  onFreeDownload: () => {},
  closeDemoFile: (demofile) => {
    closedDemoHandles.push(demofile);
  },
  setServerState: (state) => {
    serverStates.push(state);
  },
  SV_ShutdownGameProgs: () => {
    shutdownGameProgsCalls += 1;
  },
  onPrintf: (message) => {
    printed.push(message);
  },
  nowMs: () => 1000 + frameEvents.length,
  setTimeBeforeGame: (milliseconds) => {
    timeBeforeGame = milliseconds;
  },
  setTimeAfterGame: (milliseconds) => {
    timeAfterGame = milliseconds;
  },
  randomInt: () => {
    randomFrameCalls += 1;
    return 4;
  }
});

const user = createServerUserProcedures({
  sv,
  svs,
  ge,
  cmd,
  cvar: cvarRuntime,
  qnet,
  sv_paused: cvar("paused", 0),
  sv_enforcetime: cvar("sv_enforcetime", 0),
  allow_download: cvar("allow_download", 1),
  allow_download_players: cvar("allow_download_players", 1),
  allow_download_models: cvar("allow_download_models", 1),
  allow_download_sounds: cvar("allow_download_sounds", 1),
  allow_download_maps: cvar("allow_download_maps", 1),
  SV_DropClient: main.SV_DropClient,
  SV_UserinfoChanged: main.SV_UserinfoChanged,
  onPrintf: (message) => {
    printed.push(message);
  },
  onDPrintf: (message) => {
    printed.push(message);
  }
});

const mainWithUser = createServerMainProcedures({
  sv,
  svs,
  ge,
  cmd,
  cvar: cvarRuntime,
  qnet,
  maxclients: cvar("maxclients", 2),
  hostname,
  rcon_password,
  timeout: cvar("timeout", 125),
  zombietime: cvar("zombietime", 2),
  sv_paused: cvar("paused", 0),
  sv_timedemo: cvar("timedemo", 0),
  sv_showclamp: cvar("showclamp", 0),
  host_speeds: cvar("host_speeds", 0),
  sv_reconnect_limit,
  dedicated: cvar("dedicated", 1),
  public_server: cvar("public", 1),
  master_adr: [createMasterAdr(27910), createMasterAdr(27911)],
  SV_ExecuteClientMessage: (target) => {
    executeClientMessageCalls.push("called");
    user.SV_ExecuteClientMessage(target);
  },
  getServerInfo: () => "\\hostname\\quake2js",
  executeRconCommand: (command) => `executed:${command}`,
  onFreeDownload: () => {},
  onPrintf: (message) => {
    printed.push(message);
  }
});

verifyServerInit();
verifyUserinfoChanged();

main.SV_DropClient(client);
assert.equal(disconnectCalls, 1, "SV_DropClient should call game ClientDisconnect for spawned clients");
assert.equal(client.state, client_state_t.cs_zombie, "SV_DropClient should transition client to zombie");
assert.equal(client.download, null, "SV_DropClient should clear download buffer");
assert.equal(client.name, "", "SV_DropClient should clear client name");

client.state = client_state_t.cs_connected;
main.SV_FinalMessage("Server restarting", true);
assert.ok(transmitted.length >= 2, "SV_FinalMessage should transmit two passes to connected clients");

verifyMasterHeartbeat();

verifyConnectionlessPing();
verifyConnectionlessAck();
verifyConnectionlessStatus();
verifyConnectionlessInfo();
verifyConnectionlessChallengeAndConnect();
verifyConnectionlessRcon();
verifyReadPacketsDispatchAndPortFixup();
verifyTimeoutsPingsMsecPrepAndFrame();
verifyShutdownLifecycle();

console.log("quake2-sv-main: ok");

function verifyServerInit(): void {
  qnet.net_message.cursize = 12;
  qnet.net_message.readcount = 5;
  qnet.net_message.overflowed = true;

  main.SV_Init();

  assert.ok(cvarRuntime.cvar_vars.some((entry) => entry.name === "protocol"), "SV_Init should register protocol cvar");
  assert.ok(cvarRuntime.cvar_vars.some((entry) => entry.name === "maxclients"), "SV_Init should register maxclients cvar");
  assert.ok(cvarRuntime.cvar_vars.some((entry) => entry.name === "allow_download"), "SV_Init should register download policy cvars");
  assert.equal(cvarRuntime.cvar_vars.find((entry) => entry.name === "dmflags")?.string, "16", "SV_Init should use DF_INSTANT_ITEMS as the dmflags default");
  assert.equal(cvarRuntime.cvar_vars.find((entry) => entry.name === "protocol")?.string, "34", "SV_Init should register the Quake II protocol version");
  assert.equal(cvarRuntime.cvar_vars.find((entry) => entry.name === "allow_download_models")?.string, "1", "SV_Init should default model downloads on like the C source");
  assert.equal(cvarRuntime.cvar_vars.find((entry) => entry.name === "allow_download")?.string, "0", "SV_Init should default general downloads off like the C source");
  assert.equal(qnet.net_message.cursize, 0, "SV_Init should clear the shared net_message write cursor");
  assert.equal(qnet.net_message.readcount, 0, "SV_Init should reset the shared net_message read cursor");
  assert.equal(qnet.net_message.overflowed, false, "SV_Init should clear net_message overflow state");
}

function verifyUserinfoChanged(): void {
  userinfoChangedCalls = 0;
  client.userinfo = `\\name\\Pl${String.fromCharCode(0xc3)}${String.fromCharCode(0xa4)}yer\\rate\\50\\msg\\2`;
  main.SV_UserinfoChanged(client);
  assert.equal(userinfoChangedCalls, 1, "SV_UserinfoChanged should call game ClientUserinfoChanged before local copies");
  assert.equal(client.name, "PlC$yer", "SV_UserinfoChanged should strip high bits in name");
  assert.equal(client.rate, 100, "SV_UserinfoChanged should clamp rate minimum to 100");
  assert.equal(client.messagelevel, 2, "SV_UserinfoChanged should parse msg level");

  client.rate = 777;
  client.messagelevel = 9;
  client.userinfo = `\\name\\${"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"}\\rate\\abc\\msg\\nope`;
  main.SV_UserinfoChanged(client);
  assert.equal(client.name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234", "SV_UserinfoChanged should truncate cl.name to sizeof(name)-1");
  assert.equal(client.rate, 100, "SV_UserinfoChanged should treat invalid rate like atoi(...)=0 then clamp");
  assert.equal(client.messagelevel, 0, "SV_UserinfoChanged should treat invalid msg like atoi(...)=0");

  client.rate = 777;
  client.messagelevel = 3;
  client.userinfo = "\\name\\DefaultRate";
  main.SV_UserinfoChanged(client);
  assert.equal(client.rate, 5000, "SV_UserinfoChanged should default missing rate to 5000");
  assert.equal(client.messagelevel, 3, "SV_UserinfoChanged should leave messagelevel unchanged when msg is absent");

  client.userinfo = "\\name\\HighRate\\rate\\99999\\msg\\-1";
  main.SV_UserinfoChanged(client);
  assert.equal(client.rate, 15000, "SV_UserinfoChanged should clamp rate maximum to 15000");
  assert.equal(client.messagelevel, -1, "SV_UserinfoChanged should preserve atoi signed parsing for msg");
}

function verifyMasterHeartbeat(): void {
  transmitted.length = 0;
  printed.length = 0;
  serverDedicated.value = 1;
  serverPublic.value = 1;
  svs.realtime = HEARTBEAT_BASE_TIME;
  svs.last_heartbeat = 0;

  main.Master_Heartbeat();

  assert.equal(transmitted.length, 2, "Master_Heartbeat should send one packet per configured master");
  assert.equal(decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()), "heartbeat\n\\hostname\\quake2js\n0 0 \"\"\n");
  assert.equal(transmitted[0]?.to.port, 27910, "Master_Heartbeat should target the first configured master");
  assert.equal(transmitted[1]?.to.port, 27911, "Master_Heartbeat should target the second configured master");
  assert.equal(svs.last_heartbeat, HEARTBEAT_BASE_TIME, "Master_Heartbeat should stamp last_heartbeat after sending");
  assert.equal(printed.filter((line) => line.startsWith("Sending heartbeat to")).length, 2);

  main.Master_Heartbeat();
  assert.equal(transmitted.length, 2, "Master_Heartbeat should throttle until the 300 second interval elapses");

  svs.realtime = HEARTBEAT_BASE_TIME + 299_999;
  main.Master_Heartbeat();
  assert.equal(transmitted.length, 2, "Master_Heartbeat should keep throttling just before the C interval boundary");

  svs.realtime = HEARTBEAT_BASE_TIME + 300_000;
  main.Master_Heartbeat();
  assert.equal(transmitted.length, 4, "Master_Heartbeat should send again at HEARTBEAT_SECONDS * 1000");

  svs.last_heartbeat = HEARTBEAT_BASE_TIME + 10_000;
  svs.realtime = HEARTBEAT_BASE_TIME + 5_000;
  main.Master_Heartbeat();
  assert.equal(svs.last_heartbeat, svs.realtime, "Master_Heartbeat should clamp last_heartbeat on realtime wraparound");

  transmitted.length = 0;
  svs.realtime = HEARTBEAT_BASE_TIME + 700_000;
  svs.last_heartbeat = 0;
  serverDedicated.value = 0;
  main.Master_Heartbeat();
  assert.equal(transmitted.length, 0, "Master_Heartbeat should ignore non-dedicated servers");

  serverDedicated.value = 1;
  serverPublic.value = 0;
  main.Master_Heartbeat();
  assert.equal(transmitted.length, 0, "Master_Heartbeat should ignore private dedicated servers");

  serverPublic.value = 1;
}

function verifyConnectionlessPing(): void {
  transmitted.length = 0;
  printed.length = 0;
  queueConnectionlessPacket(createIpAdr(192, 168, 0, 10, 27901), "ping");

  const processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one ping packet");
  assert.equal(decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()), "ack", "SVC_Ping should reply with ack");
}

function verifyConnectionlessAck(): void {
  transmitted.length = 0;
  printed.length = 0;
  queueConnectionlessPacket(createIpAdr(192, 168, 0, 15, 27901), "ack");

  const processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one ack packet");
  assert.ok(
    printed.some((line) => line.includes("Ping acknowledge from")),
    "SVC_Ack should log the remote acknowledgement"
  );
}

function verifyConnectionlessStatus(): void {
  transmitted.length = 0;
  printed.length = 0;
  queueConnectionlessPacket(createIpAdr(192, 168, 0, 11, 27901), "status");

  const processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one status packet");
  assert.equal(
    decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()),
    'print\n\\hostname\\quake2js\n0 0 ""\n',
    "SVC_Status should answer with the assembled status string"
  );
}

function verifyConnectionlessInfo(): void {
  transmitted.length = 0;
  printed.length = 0;
  queueConnectionlessPacket(createIpAdr(192, 168, 0, 12, 27901), "info 34");

  const processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one info packet");
  assert.ok(
    decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()).startsWith("info\n"),
    "SVC_Info should answer with an info payload"
  );
}

function verifyConnectionlessChallengeAndConnect(): void {
  transmitted.length = 0;
  printed.length = 0;
  freeClient.state = client_state_t.cs_free;

  const remote = createIpAdr(10, 10, 0, 1, 27950);
  queueConnectionlessPacket(remote, "getchallenge");
  let processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one getchallenge packet");

  const challengeReply = decodePacketPayload(transmitted[0]?.data ?? new Uint8Array());
  assert.ok(challengeReply.startsWith("challenge "), "SVC_GetChallenge should answer with a challenge");
  const challenge = Number.parseInt(challengeReply.split(" ")[1] ?? "0", 10);
  transmitted.length = 0;

  queueConnectionlessPacket(remote, `connect 34 1337 ${challenge} "\\name\\RemoteUser\\rate\\2500\\msg\\1"`);
  svs.realtime = 654321;
  processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one connect packet");
  assert.equal(decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()), "client_connect", "SVC_DirectConnect should accept the client");
  assert.equal(freeClient.state, client_state_t.cs_connected, "SVC_DirectConnect should move the free slot to connected");
  assert.equal(freeClient.challenge, challenge, "SVC_DirectConnect should persist the accepted challenge");
  assert.equal(freeClient.lastconnect, 654321, "SVC_DirectConnect should stamp lastconnect");
  assert.equal(freeClient.name, "RemoteUser", "SVC_DirectConnect should parse userinfo through SV_UserinfoChanged");

  freeClient.state = client_state_t.cs_free;
  ge.ClientConnect = () => false;
  ge.ClientConnectRejectMessage = () => "Password required or incorrect.";
  const rejectedRemote = createIpAdr(10, 10, 0, 2, 27951);
  queueConnectionlessPacket(rejectedRemote, "getchallenge");
  transmitted.length = 0;
  processed = main.SV_ReadPackets();
  const rejectedChallenge = Number.parseInt(decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()).split(" ")[1] ?? "0", 10);
  transmitted.length = 0;
  queueConnectionlessPacket(rejectedRemote, `connect 34 1338 ${rejectedChallenge} "\\name\\Rejected"`);
  processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one rejected connect packet");
  assert.equal(
    decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()),
    "print\nPassword required or incorrect.\nConnection refused.\n",
    "SVC_DirectConnect should print the game-export rejection message"
  );
  ge.ClientConnect = () => true;
  ge.ClientConnectRejectMessage = () => "";
}

function verifyConnectionlessRcon(): void {
  transmitted.length = 0;
  printed.length = 0;
  queueConnectionlessPacket(createIpAdr(192, 168, 0, 13, 27901), "rcon wrong status");

  let processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one bad rcon packet");
  assert.equal(
    decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()),
    "print\nBad rcon_password.\n",
    "SVC_RemoteCommand should reject a bad password"
  );

  transmitted.length = 0;
  printed.length = 0;
  queueConnectionlessPacket(createIpAdr(192, 168, 0, 14, 27901), "rcon secret status");
  processed = main.SV_ReadPackets();
  assert.equal(processed, 1, "SV_ReadPackets should drain one valid rcon packet");
  assert.equal(
    decodePacketPayload(transmitted[0]?.data ?? new Uint8Array()),
    "print\nexecuted:status ",
    "SVC_RemoteCommand should return redirected command output"
  );
}

function verifyReadPacketsDispatchAndPortFixup(): void {
  transmitted.length = 0;
  printed.length = 0;
  executeClientMessageCalls.length = 0;

  const remote = createIpAdr(10, 0, 0, 5, 27910);
  client.state = client_state_t.cs_spawned;
  client.edict = createRuntimeEntity({}, 1);
  client.edict.client = createGameClient();
  client.lastmessage = 0;
  Netchan_Setup(qnet, netsrc_t.NS_SERVER, client.netchan, remote, 1337);

  const translated = createIpAdr(10, 0, 0, 5, 27911);
  queueSequencedPacket(translated, 1, 0, 1337, true);

  svs.realtime = 123456;
  const processed = mainWithUser.SV_ReadPackets();

  assert.equal(processed, 1, "SV_ReadPackets should drain one sequenced packet");
  assert.equal(executeClientMessageCalls.length, 1, "SV_ReadPackets should dispatch sequenced packets to SV_ExecuteClientMessage");
  assert.equal(client.lastmessage, 123456, "SV_ReadPackets should refresh the client lastmessage time");
  assert.equal(client.netchan.remote_address.port, 27911, "SV_ReadPackets should fix up translated source ports");
}

function verifyTimeoutsPingsMsecPrepAndFrame(): void {
  frameEvents.length = 0;
  sleepCalls.length = 0;
  printed.length = 0;

  client.state = client_state_t.cs_spawned;
  client.name = "TimedOut";
  client.lastmessage = 0;
  svs.realtime = 200_000;
  main.SV_CheckTimeouts();
  assert.equal(client.state, client_state_t.cs_free, "SV_CheckTimeouts should free timed out spawned clients");
  assert.ok(frameEvents.some((entry) => entry.startsWith("broadcast:")), "SV_CheckTimeouts should broadcast timeout text");

  freeClient.state = client_state_t.cs_zombie;
  freeClient.lastmessage = 0;
  svs.realtime = 200_000;
  main.SV_CheckTimeouts();
  assert.equal(freeClient.state, client_state_t.cs_free, "SV_CheckTimeouts should free old zombie clients");

  client.state = client_state_t.cs_spawned;
  client.edict = ge.edicts[1]!;
  client.edict.client = createGameClient();
  client.frame_latency.fill(0);
  client.frame_latency[0] = 90;
  client.frame_latency[1] = 150;
  main.SV_CalcPings();
  assert.equal(client.ping, 120, "SV_CalcPings should average stored frame latencies");
  assert.equal(client.edict.client?.ping, 120, "SV_CalcPings should mirror ping into the game client");

  sv.framenum = 16;
  client.commandMsec = 0;
  freeClient.state = client_state_t.cs_connected;
  main.SV_GiveMsec();
  assert.equal(client.commandMsec, 1800, "SV_GiveMsec should refill spawned client budgets every 16 frames");
  assert.equal(freeClient.commandMsec, 1800, "SV_GiveMsec should refill connected client budgets every 16 frames");

  const ent0 = ge.edicts[0]!;
  const ent1 = ge.edicts[1]!;
  ent0.s.event = 5;
  ent1.s.event = 9;
  main.SV_PrepWorldFrame();
  assert.equal(ent0.s.event, 0, "SV_PrepWorldFrame should clear one-frame entity events");
  assert.equal(ent1.s.event, 0, "SV_PrepWorldFrame should clear all active entity events");

  frameEvents.length = 0;
  timeBeforeGame = -1;
  timeAfterGame = -1;
  randomFrameCalls = 0;
  sv.framenum = 0;
  sv.time = 0;
  svs.realtime = 0;
  svs.initialized = true;
  client.state = client_state_t.cs_spawned;
  client.lastmessage = 0;
  freeClient.state = client_state_t.cs_free;
  main.SV_Frame(100);
  assert.equal(sv.framenum, 1, "SV_Frame should advance the server frame number");
  assert.equal(sv.time, 100, "SV_Frame should advance server time in 100ms ticks");
  assert.ok(frameEvents.includes("send"), "SV_Frame should send client messages");
  assert.ok(frameEvents.includes("record"), "SV_Frame should record demo multicast data");
  assert.notEqual(timeBeforeGame, -1, "SV_RunGameFrame should capture host_speeds pre-game timing");
  assert.notEqual(timeAfterGame, -1, "SV_RunGameFrame should capture host_speeds post-game timing");
  assert.equal(randomFrameCalls, 1, "SV_Frame should keep the random stream time-dependent like rand() in C");

  frameEvents.length = 0;
  sleepCalls.length = 0;
  sv.time = 500;
  svs.realtime = 450;
  main.SV_Frame(0);
  assert.equal(sleepCalls[0], 50, "SV_Frame should sleep when realtime is behind server time");
}

function verifyShutdownLifecycle(): void {
  transmitted.length = 0;
  printed.length = 0;
  shutdownGameProgsCalls = 0;
  closedDemoHandles.length = 0;
  serverStates.length = 0;
  serverDedicated.value = 1;
  serverPublic.value = 1;

  client.state = client_state_t.cs_connected;
  client.download = new Uint8Array([9, 8, 7]);
  client.downloadcount = 3;
  client.downloadsize = 3;
  freeClient.state = client_state_t.cs_connected;
  sv.state = 2;
  sv.time = 700;
  sv.framenum = 7;
  sv.name = "shutdown-test";
  sv.demofile = { tag: "sv-demo" };
  svs.initialized = true;
  svs.realtime = 7000;
  svs.last_heartbeat = 5000;
  svs.demofile = { tag: "svs-demo" };
  svs.challenges[0]!.challenge = 42;
  svs.challenges[0]!.time = 1234;
  svs.challenges[0]!.adr.port = 27910;

  main.SV_Shutdown("Server quitting", false);

  assert.ok(transmitted.length >= 4, "SV_Shutdown should send final client and master shutdown packets");
  assert.equal(
    transmitted.filter((packet) => decodePacketPayload(packet.data) === "shutdown").length,
    2,
    "Master_Shutdown should send one shutdown packet per configured master"
  );
  assert.equal(
    printed.filter((line) => line.startsWith("Sending heartbeat to")).length,
    1,
    "Master_Shutdown should preserve the C logging quirk that skips master slot zero"
  );
  assert.equal(shutdownGameProgsCalls, 1, "SV_Shutdown should shut down game progs exactly once");
  assert.equal(closedDemoHandles.length, 2, "SV_Shutdown should close both active demo handles");
  assert.equal(serverStates.at(-1), 0, "SV_Shutdown should publish the dead server state");
  assert.equal(sv.time, 0, "SV_Shutdown should clear transient server timing");
  assert.equal(sv.framenum, 0, "SV_Shutdown should clear the server frame counter");
  assert.equal(sv.name, "", "SV_Shutdown should clear the loaded map name");
  assert.equal(svs.initialized, false, "SV_Shutdown should mark the server static state uninitialized");
  assert.equal(svs.realtime, 0, "SV_Shutdown should clear server realtime");
  assert.equal(client.state, client_state_t.cs_free, "SV_Shutdown should free connected client slots");
  assert.equal(client.download, null, "SV_Shutdown should clear client download buffers");
  assert.equal(freeClient.state, client_state_t.cs_free, "SV_Shutdown should free every connected client slot");
  assert.equal(svs.challenges[0]!.challenge, 0, "SV_Shutdown should clear saved challenge numbers");

  transmitted.length = 0;
  serverPublic.value = 0;
  main.SV_Shutdown("Private shutdown", false);
  assert.equal(
    transmitted.some((packet) => decodePacketPayload(packet.data) === "shutdown"),
    false,
    "Master_Shutdown should not notify masters for private dedicated servers"
  );
  serverPublic.value = 1;
}

function queueConnectionlessPacket(from: ReturnType<typeof createNetAdr>, text: string): void {
  const data = new Uint8Array(4 + text.length + 1);
  const view = new DataView(data.buffer);
  view.setInt32(0, -1, true);
  for (let index = 0; index < text.length; index += 1) {
    data[4 + index] = text.charCodeAt(index) & 0xff;
  }
  data[data.length - 1] = 0;
  incomingPackets.push({ from, data });
}

function queueSequencedPacket(
  from: ReturnType<typeof createNetAdr>,
  sequence: number,
  ack: number,
  qport: number,
  includeNop = false
): void {
  const buffer = createSizeBuffer(new Uint8Array(32));
  MSG_WriteLong(buffer, sequence);
  MSG_WriteLong(buffer, ack);
  MSG_WriteShort(buffer, qport);
  if (includeNop) {
    buffer.data[buffer.cursize] = 1;
    buffer.cursize += 1;
  }
  incomingPackets.push({ from, data: new Uint8Array(buffer.data.subarray(0, buffer.cursize)) });
}

function decodePacketPayload(packet: Uint8Array): string {
  let text = "";
  for (let index = 4; index < packet.length; index += 1) {
    if (packet[index] === 0) {
      break;
    }
    text += String.fromCharCode(packet[index]);
  }
  return text;
}

function cvar(name: string, value: number) {
  return {
    name,
    string: `${value}`,
    latched_string: null,
    flags: 0,
    modified: false,
    value
  };
}

function createGameExports(): game_export_t {
  const worldspawn = createRuntimeEntity({}, 0);
  worldspawn.inuse = true;
  const playerOne = createRuntimeEntity({}, 1);
  playerOne.inuse = true;
  playerOne.client = createGameClient();
  const playerTwo = createRuntimeEntity({}, 2);
  playerTwo.inuse = true;
  playerTwo.client = createGameClient();

  return {
    apiversion: 3,
    Init: () => {},
    Shutdown: () => {},
    SpawnEntities: () => {},
    WriteGame: () => {},
    ReadGame: () => {},
    WriteLevel: () => {},
    ReadLevel: () => {},
    ClientConnect: () => true,
    ClientConnectRejectMessage: () => "",
    ClientBegin: () => {},
    ClientUserinfoChanged: () => {
      userinfoChangedCalls += 1;
    },
    ClientDisconnect: () => {
      disconnectCalls += 1;
    },
    ClientCommand: () => {},
    ClientThink: () => {},
    RunFrame: () => {},
    ServerCommand: () => {},
    edicts: [worldspawn, playerOne, playerTwo],
    edict_size: 0,
    num_edicts: 3,
    max_edicts: 1024
  };
}

function createMasterAdr(port: number) {
  const adr = createNetAdr();
  adr.port = port;
  return adr;
}

function createIpAdr(a: number, b: number, c: number, d: number, port: number) {
  const adr = createNetAdr(netadrtype_t.NA_IP);
  adr.ip[0] = a;
  adr.ip[1] = b;
  adr.ip[2] = c;
  adr.ip[3] = d;
  adr.port = port;
  return adr;
}
