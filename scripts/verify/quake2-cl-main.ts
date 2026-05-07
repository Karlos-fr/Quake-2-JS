/**
 * File: quake2-cl-main.ts
 * Purpose: Verify the current TypeScript port blocks of `client/cl_main.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `CL_InitLocal`, command registration and `CL_FixUpGender`.
 *
 * Dependencies:
 * - packages/client/src/cl_main.ts
 * - packages/client/src/input.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/cvar.ts
 */

import { strict as assert } from "node:assert";

import {
  Cmd_ForwardToServer,
  CL_InitInput,
  CL_CheckForResend,
  CL_ConnectionlessPacket,
  CL_Disconnect,
  CL_Disconnect_f,
  CL_DumpPackets,
  CL_Drop,
  CL_Frame,
  CL_ForwardToServer_f,
  CL_FixCvarCheats,
  CL_FixUpGender,
  CL_Init,
  CL_InitLocal,
  CL_Packet_f,
  CL_ParseStatusMessage,
  CL_Pause_f,
  CL_ReadPackets,
  CL_Record_f,
  CL_SendConnectPacket,
  CL_SendCommand,
  CL_Setenv_f,
  CL_Shutdown,
  CL_Stop_f,
  CL_Quit_f,
  createClientInputContext,
  CL_WriteDemoMessage,
  CL_WriteConfiguration,
  K_TAB,
  createClientSendCmdBridge,
  createClientMainContext,
  createClientKeyContext,
  createClientRuntime
} from "../../packages/client/src/index.js";
import {
  Cbuf_AddText,
  Cmd_AddCommand,
  Cmd_Exists,
  Cmd_ExecuteString,
  Cmd_TokenizeString,
  CS_MAXCLIENTS,
  CVAR_ARCHIVE,
  CVAR_USERINFO,
  Cvar_FindVar,
  Cvar_Set,
  Cvar_VariableString,
  MSG_BeginReading,
  MSG_ReadByte,
  MSG_ReadString,
  MSG_WriteByte,
  MSG_WriteLong,
  MSG_WriteString,
  NET_StringToAdr,
  Netchan_Init,
  PROTOCOL_VERSION,
  clc_ops_e,
  createQcommonNetRuntime,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const context = createClientMainContext(client, cmd, cvar);
const keyContext = createClientKeyContext();
const sentPackets: Array<{ text: string; port: number; type: number }> = [];
const packetQueue: Array<{ from: ReturnType<typeof qnetAddressFactory>; data: Uint8Array }> = [];
let recursiveMessage = "";
function qnetAddressFactory() {
  return {
    type: 0,
    ip: new Uint8Array(4),
    ipx: new Uint8Array(10),
    port: 0
  };
}
const qnet = createQcommonNetRuntime({
  now: () => client.cls.realtime,
  getPacket: () => packetQueue.shift() ?? null,
  sendPacket: (_sock, data, to) => {
    const text = String.fromCharCode(...data.subarray(4, data.length)).replace(/\0+$/u, "");
    sentPackets.push({ text, port: to.port, type: to.type });
  }
});
Netchan_Init(qnet);
const inputContext = createClientInputContext(client, cmd, cvar, {
  qnet,
  hooks: {
    onFixUpGender: () => {
      CL_FixUpGender(context);
    }
  }
});

CL_InitLocal(context, {
  getMilliseconds: () => 1337
});
CL_InitInput(inputContext);

assert.equal(client.cls.state, 1, "CL_InitLocal should force disconnected startup state");
assert.equal(client.cls.realtime, 1337, "CL_InitLocal should seed cls.realtime from the host clock hook");
assert.equal(context.gender?.modified, false, "CL_InitLocal should clear gender.modified after registration");
assert.equal(Cvar_VariableString(cvar, "skin"), "male/grunt", "CL_InitLocal should register the default skin userinfo");
assert.equal(Cvar_VariableString(cvar, "gender"), "male", "CL_InitLocal should register the default gender userinfo");
assert.equal(Cvar_FindVar(cvar, "adr0")?.string, "", "CL_InitLocal should register address-book cvars");
assert.equal(Cvar_FindVar(cvar, "adr8")?.string, "", "CL_InitLocal should register late address-book cvars");
assert.equal(Cvar_FindVar(cvar, "cl_stereo")?.string, "0", "CL_InitLocal should register stereo cvars from cl_main");
assert.equal(Cvar_FindVar(cvar, "cl_blend")?.string, "1", "CL_InitLocal should register render toggle cvars from cl_main");
assert.equal(Cvar_FindVar(cvar, "r_lightlevel")?.string, "0", "CL_InitLocal should register cl_main-owned lightlevel cvar");
assert.equal(context.adr.length, 9, "CL_InitLocal should preserve the cl_main.c adr0..adr8 startup globals");
assert.equal(context.cl_stereo_separation?.string, "0.4", "CL_InitLocal should expose cl_stereo_separation");
assert.equal(context.cl_add_particles?.string, "1", "CL_InitLocal should expose cl_particles");
assert.equal(context.cl_add_lights?.string, "1", "CL_InitLocal should expose cl_lights");
assert.equal(context.cl_add_entities?.string, "1", "CL_InitLocal should expose cl_entities cvar");
assert.equal(context.cl_add_blend?.string, "1", "CL_InitLocal should expose cl_blend cvar");
assert.equal(context.cl_gun?.string, "1", "CL_InitLocal should expose cl_gun like client/cl_main.c");
assert.equal(context.cl_noskins?.string, "0", "CL_InitLocal should expose cl_noskins");
assert.equal(context.cl_autoskins?.string, "0", "CL_InitLocal should expose cl_autoskins");
assert.equal(context.cl_footsteps?.string, "1", "CL_InitLocal should expose cl_footsteps");
assert.equal(context.cl_timeout?.string, "120", "CL_InitLocal should expose cl_timeout");
assert.equal(context.cl_predict?.string, "1", "CL_InitLocal should expose cl_predict");
assert.equal(context.cl_maxfps?.string, "90", "CL_InitLocal should expose cl_maxfps");
assert.equal(context.cl_shownet?.string, "0", "CL_InitLocal should expose cl_shownet");
assert.equal(context.cl_showmiss?.string, "0", "CL_InitLocal should expose cl_showmiss");
assert.equal(context.cl_showclamp?.name, "showclamp", "CL_InitLocal should keep the original showclamp cvar name");
assert.equal(context.freelook?.flags, CVAR_ARCHIVE, "CL_InitLocal should archive freelook");
assert.equal(context.lookspring?.flags, CVAR_ARCHIVE, "CL_InitLocal should archive lookspring");
assert.equal(context.lookstrafe?.flags, CVAR_ARCHIVE, "CL_InitLocal should archive lookstrafe");
assert.equal(context.sensitivity?.string, "3", "CL_InitLocal should expose sensitivity");
assert.equal(context.m_pitch?.flags, CVAR_ARCHIVE, "CL_InitLocal should archive m_pitch");
assert.equal(context.m_yaw?.string, "0.022", "CL_InitLocal should expose m_yaw");
assert.equal(context.m_forward?.string, "1", "CL_InitLocal should expose m_forward");
assert.equal(context.m_side?.string, "1", "CL_InitLocal should expose m_side");
assert.equal(context.info_password?.flags, CVAR_USERINFO, "CL_InitLocal should keep password as userinfo only");
assert.equal(context.info_spectator?.string, "0", "CL_InitLocal should expose spectator userinfo");
assert.equal(context.name?.flags, CVAR_USERINFO | CVAR_ARCHIVE, "CL_InitLocal should archive name userinfo");
assert.equal(context.rate?.string, "25000", "CL_InitLocal should expose rate");
assert.equal(context.fov?.string, "90", "CL_InitLocal should expose fov");
assert.equal(context.msg?.string, "1", "CL_InitLocal should expose msg");
assert.equal(context.hand?.flags, CVAR_USERINFO | CVAR_ARCHIVE, "CL_InitLocal should archive hand userinfo");
assert.equal(context.gender_auto?.string, "1", "CL_InitLocal should expose gender_auto");
assert.equal(context.cl_paused?.string, "0", "CL_InitLocal should expose paused");
assert.equal(context.cl_timedemo?.string, "0", "CL_InitLocal should expose timedemo");
assert.equal(context.cl_vwep?.flags, CVAR_ARCHIVE, "CL_InitLocal should archive cl_vwep");
assert.equal(context.rcon_client_password?.name, "rcon_password", "CL_InitLocal should expose rcon_password");
assert.equal(context.rcon_address?.name, "rcon_address", "CL_InitLocal should expose rcon_address");
assert.equal(client.cl_entities.length > 0 && client.cl_parse_entities.length > 0, true, "Client runtime should own cl_entities and cl_parse_entities arrays");

for (const command of [
  "cmd",
  "pause",
  "pingservers",
  "skins",
  "userinfo",
  "snd_restart",
  "changing",
  "disconnect",
  "quit",
  "connect",
  "reconnect",
  "rcon",
  "setenv",
  "precache",
  "download",
  "wave",
  "inven",
  "invuse",
  "invprev",
  "invnext",
  "invdrop",
  "weapnext",
  "weapprev"
]) {
  assert.equal(Cmd_Exists(cmd, command), true, `CL_InitLocal should register "${command}"`);
}

context.gender!.modified = true;
Cvar_Set(cvar, "gender", "female");
Cvar_Set(cvar, "skin", "male/grunt");
CL_FixUpGender(context);
assert.equal(Cvar_VariableString(cvar, "gender"), "female", "CL_FixUpGender should preserve one manual user override");
assert.equal(context.gender!.modified, false, "CL_FixUpGender should clear the manual-override marker");

Cvar_Set(cvar, "skin", "female/athena");
CL_FixUpGender(context);
assert.equal(Cvar_VariableString(cvar, "gender"), "female", "CL_FixUpGender should infer female skins");

Cvar_Set(cvar, "skin", "cyborg/oni911");
CL_FixUpGender(context);
assert.equal(Cvar_VariableString(cvar, "gender"), "male", "CL_FixUpGender should infer cyborg skins as male");

Cvar_Set(cvar, "skin", "alien/observer");
CL_FixUpGender(context);
assert.equal(Cvar_VariableString(cvar, "gender"), "none", "CL_FixUpGender should fall back to none for unknown skins");

context.client.cls.servername = "bad host";
context.client.cls.challenge = 42;
const badConnect = CL_SendConnectPacket(context, {
  qnet,
  onPrint: (line) => {
    recursiveMessage = line;
  }
});
assert.equal(badConnect, false, "CL_SendConnectPacket should reject malformed server addresses");
assert.equal(recursiveMessage, "Bad server address", "CL_SendConnectPacket should print the stock bad-address message");
assert.equal(context.client.cls.connect_time, 0, "CL_SendConnectPacket should clear connect_time on invalid address");

recursiveMessage = "";
sentPackets.length = 0;
Cvar_Set(cvar, "name", "player");
context.client.cls.servername = "127.0.0.1";
context.client.cls.challenge = 77;
const connectSent = CL_SendConnectPacket(context, { qnet });
assert.equal(connectSent, true, "CL_SendConnectPacket should send one connect packet for a valid address");
assert.equal(cvar.userinfo_modified, false, "CL_SendConnectPacket should clear userinfo_modified before sending");
assert.equal(sentPackets.length, 1, "CL_SendConnectPacket should emit one out-of-band packet");
assert.equal(sentPackets[0]?.text.startsWith(`connect ${PROTOCOL_VERSION} ${qnet.qport} 77 "`), true, "CL_SendConnectPacket should emit the stock connect prefix");
assert.equal(sentPackets[0]?.text.includes("\\name\\player"), true, "CL_SendConnectPacket should include current userinfo values");
assert.equal(sentPackets[0]?.port, 27910, "CL_SendConnectPacket should supply the default server port");

sentPackets.length = 0;
context.client.cls.state = 1;
context.client.cls.servername = "";
CL_CheckForResend(context, {
  qnet,
  serverRunning: () => true
});
assert.equal(context.client.cls.state, 2, "CL_CheckForResend should move a local-server client to connecting");
assert.equal(context.client.cls.servername, "localhost", "CL_CheckForResend should target localhost for local servers");
assert.equal(sentPackets[0]?.text.startsWith(`connect ${PROTOCOL_VERSION} ${qnet.qport} 77 "`), true, "CL_CheckForResend local-server path should reuse CL_SendConnectPacket");

sentPackets.length = 0;
recursiveMessage = "";
context.client.cls.state = 2;
context.client.cls.servername = "192.168.0.5";
context.client.cls.realtime = 7000;
context.client.cls.connect_time = 3000;
CL_CheckForResend(context, {
  qnet,
  onPrint: (line) => {
    recursiveMessage = line;
  }
});
assert.equal(context.client.cls.connect_time, 7000, "CL_CheckForResend should advance connect_time when resending");
assert.equal(recursiveMessage, "Connecting to 192.168.0.5...", "CL_CheckForResend should print the stock reconnect line");
assert.equal(sentPackets[0]?.text, "getchallenge\n", "CL_CheckForResend should request a server challenge");
assert.equal(sentPackets[0]?.port, 27910, "CL_CheckForResend should default the challenge request port");

context.client.cls.state = 4;
context.client.cls.netchan.message.cursize = 0;
context.client.cls.netchan.message.readcount = 0;
Cmd_TokenizeString(cmd, "god yes", false);
Cmd_ForwardToServer(context);
MSG_BeginReading(context.client.cls.netchan.message);
assert.equal(MSG_ReadByte(context.client.cls.netchan.message), clc_ops_e.clc_stringcmd, "Cmd_ForwardToServer should write a string command opcode");
assert.equal(MSG_ReadString(context.client.cls.netchan.message), "god yes", "Cmd_ForwardToServer should include command and args");

recursiveMessage = "";
context.client.cls.state = 3;
Cmd_TokenizeString(cmd, "+attack", false);
Cmd_ForwardToServer(context, { onPrint: (line) => { recursiveMessage = line; } });
assert.equal(recursiveMessage, "Unknown command \"+attack\"", "Cmd_ForwardToServer should reject local +/- commands");

context.client.cls.state = 3;
context.client.cls.netchan.message.cursize = 0;
context.client.cls.netchan.message.readcount = 0;
Cmd_TokenizeString(cmd, "cmd say hello", false);
CL_ForwardToServer_f(context);
MSG_BeginReading(context.client.cls.netchan.message);
assert.equal(MSG_ReadByte(context.client.cls.netchan.message), clc_ops_e.clc_stringcmd, "CL_ForwardToServer_f should write a string command opcode");
assert.equal(MSG_ReadString(context.client.cls.netchan.message), "say hello", "CL_ForwardToServer_f should drop the first cmd argument");

const env: Record<string, string> = {};
Cmd_TokenizeString(cmd, "setenv QUAKE_TEST one two", false);
CL_Setenv_f(context, { environment: env });
assert.equal(env.QUAKE_TEST, "one two ", "CL_Setenv_f should preserve the C trailing space in putenv values");
recursiveMessage = "";
Cmd_TokenizeString(cmd, "setenv QUAKE_TEST", false);
CL_Setenv_f(context, { environment: env, onPrint: (line) => { recursiveMessage = line; } });
assert.equal(recursiveMessage, "QUAKE_TEST=one two ", "CL_Setenv_f should print existing environment values");

Cvar_Set(cvar, "maxclients", "1");
Cvar_Set(cvar, "paused", "0");
CL_Pause_f(context, { serverRunning: () => true });
assert.equal(Cvar_VariableString(cvar, "paused"), "1", "CL_Pause_f should toggle pause for a local single-player server");
Cvar_Set(cvar, "maxclients", "2");
CL_Pause_f(context, { serverRunning: () => true });
assert.equal(Cvar_VariableString(cvar, "paused"), "0", "CL_Pause_f should clear pause in multiplayer");

let quitCalled = false;
context.client.cls.state = 4;
CL_Quit_f(context, { onQuit: () => { quitCalled = true; } });
assert.equal(quitCalled, true, "CL_Quit_f should request host quit after disconnecting");
assert.equal(context.client.cls.state, 1, "CL_Quit_f should disconnect before quitting");

context.client.cls.state = 4;
CL_Disconnect_f(context);
assert.equal(context.client.cls.state, 1, "CL_Disconnect_f should route through CL_Disconnect");

sentPackets.length = 0;
const disconnectAdr = qnetAddressFactory();
NET_StringToAdr("10.2.3.4:27910", disconnectAdr);
context.client.cls.state = 4;
context.client.cls.netchan.remote_address = disconnectAdr;
context.client.cls.netchan.sock = 0;
context.client.cls.netchan.message.cursize = 5;
CL_Disconnect(context, { qnet });
assert.equal(sentPackets.length, 3, "CL_Disconnect should transmit the stock triple disconnect packet");
assert.equal(context.client.cls.netchan.message.cursize, 0, "CL_Disconnect should clear the netchan message through CL_ClearState");

qnet.net_message.cursize = 0;
qnet.net_message.readcount = 0;
MSG_WriteString(qnet.net_message, "status-line");
NET_StringToAdr("10.0.0.5:27910", qnet.net_from);
let addedInfo = "";
let addedAddress = "";
const statusLine = CL_ParseStatusMessage(context, {
  qnet,
  onAddToServerList: (address, info) => {
    addedAddress = `${address.ip[0]}.${address.ip[1]}.${address.ip[2]}.${address.ip[3]}:${address.port}`;
    addedInfo = info;
  }
});
assert.equal(statusLine, "status-line", "CL_ParseStatusMessage should return the decoded status string");
assert.equal(addedInfo, "status-line", "CL_ParseStatusMessage should forward the status text to the server list hook");
assert.equal(addedAddress, "10.0.0.5:27910", "CL_ParseStatusMessage should forward the packet source address");

function writeConnectionlessPacket(headerLine: string, payload = ""): void {
  qnet.net_message.cursize = 0;
  qnet.net_message.readcount = 0;
  MSG_WriteLong(qnet.net_message, -1);
  MSG_WriteString(qnet.net_message, headerLine);
  if (payload.length > 0) {
    MSG_WriteString(qnet.net_message, payload);
  }
}

sentPackets.length = 0;
recursiveMessage = "";
writeConnectionlessPacket("info", "server-info");
NET_StringToAdr("10.0.0.9:27910", qnet.net_from);
const infoPrints: string[] = [];
let infoAdded = "";
CL_ConnectionlessPacket(context, {
  qnet,
  onPrint: (line) => {
    infoPrints.push(line);
  },
  onAddToServerList: (_address, info) => {
    infoAdded = info;
  }
});
assert.equal(infoPrints[0], "10.0.0.9:27910: info", "CL_ConnectionlessPacket should print the packet source and command");
assert.equal(infoAdded, "server-info", "CL_ConnectionlessPacket should dispatch info packets through CL_ParseStatusMessage");

writeConnectionlessPacket("cmd", "echo local");
NET_StringToAdr("localhost", qnet.net_from);
let appActivated = false;
cmd.cmd_text.cursize = 0;
CL_ConnectionlessPacket(context, {
  qnet,
  onAppActivate: () => {
    appActivated = true;
  }
});
assert.equal(appActivated, true, "CL_ConnectionlessPacket should activate the app for local cmd packets");
assert.equal(cmd.cmd_text.cursize > 0, true, "CL_ConnectionlessPacket should enqueue local cmd payloads");

writeConnectionlessPacket("cmd", "echo denied");
NET_StringToAdr("10.0.0.7:27910", qnet.net_from);
const remoteCmdPrints: string[] = [];
CL_ConnectionlessPacket(context, {
  qnet,
  onPrint: (line) => {
    remoteCmdPrints.push(line);
  }
});
assert.equal(remoteCmdPrints.at(-1), "Command packet from remote host.  Ignored.", "CL_ConnectionlessPacket should reject remote cmd packets");

sentPackets.length = 0;
writeConnectionlessPacket("ping");
NET_StringToAdr("10.0.0.3:27910", qnet.net_from);
CL_ConnectionlessPacket(context, { qnet });
assert.equal(sentPackets[0]?.text, "ack", "CL_ConnectionlessPacket should acknowledge ping packets");

sentPackets.length = 0;
context.client.cls.servername = "127.0.0.1";
writeConnectionlessPacket("challenge 345");
NET_StringToAdr("10.0.0.4:27910", qnet.net_from);
CL_ConnectionlessPacket(context, { qnet });
assert.equal(context.client.cls.challenge, 345, "CL_ConnectionlessPacket should store the received challenge");
assert.equal(sentPackets[0]?.text.startsWith(`connect ${PROTOCOL_VERSION} ${qnet.qport} 345 "`), true, "CL_ConnectionlessPacket should answer challenge packets with CL_SendConnectPacket");

sentPackets.length = 0;
writeConnectionlessPacket("echo hello");
NET_StringToAdr("10.0.0.8:27910", qnet.net_from);
CL_ConnectionlessPacket(context, { qnet });
assert.equal(sentPackets[0]?.text, "hello", "CL_ConnectionlessPacket should echo the first argument back out-of-band");

context.client.cls.state = 2;
writeConnectionlessPacket("client_connect");
NET_StringToAdr("10.0.0.6:27910", qnet.net_from);
CL_ConnectionlessPacket(context, { qnet });
assert.equal(context.client.cls.state, 3, "CL_ConnectionlessPacket should move the client to connected on client_connect");
assert.equal(context.client.cls.netchan.remote_address.port, 27910, "CL_ConnectionlessPacket should setup the netchan against the packet source");
assert.equal(context.client.cls.netchan.message.cursize > 0, true, "CL_ConnectionlessPacket should queue a new command after client_connect");
context.client.cls.netchan.message.readcount = 0;
MSG_BeginReading(context.client.cls.netchan.message);
assert.equal(MSG_ReadByte(context.client.cls.netchan.message), clc_ops_e.clc_stringcmd, "CL_ConnectionlessPacket should queue a clc_stringcmd opcode");
assert.equal(MSG_ReadString(context.client.cls.netchan.message), "new", "CL_ConnectionlessPacket should queue the stock new command");

let endedLoadingPlaque = false;
context.client.cls.state = 3;
context.client.cls.disable_servercount = 1;
CL_Drop(context, {
  onEndLoadingPlaque: () => {
    endedLoadingPlaque = true;
  }
});
assert.equal(context.client.cls.state, 1, "CL_Drop should disconnect the client");
assert.equal(endedLoadingPlaque, true, "CL_Drop should end the loading plaque after a normal drop");

context.client.cl.configstrings[CS_MAXCLIENTS] = "1";
Cvar_Set(cvar, "timescale", "5");
CL_FixCvarCheats(context);
assert.equal(Cvar_VariableString(cvar, "timescale"), "5", "CL_FixCvarCheats should not force cheat cvars in single-player");

context.client.cl.configstrings[CS_MAXCLIENTS] = "8";
CL_FixCvarCheats(context);
assert.equal(Cvar_VariableString(cvar, "timescale"), "1", "CL_FixCvarCheats should restore multiplayer cheat cvars");
assert.equal(Cvar_VariableString(cvar, "gl_lightmap"), "0", "CL_FixCvarCheats should lazily resolve and restore all cheat vars");

const sendCommandOrder: string[] = [];
cmd.cmd_text.cursize = 0;
Cmd_ExecuteString(cmd, "set timescale 9");
context.client.cl.configstrings[CS_MAXCLIENTS] = "8";
context.client.cls.state = 2;
context.client.cls.servername = "192.168.1.2";
context.client.cls.realtime = 11000;
context.client.cls.connect_time = 7000;
sentPackets.length = 0;
CL_SendCommand(context, {
  qnet,
  onSendKeyEvents: () => {
    sendCommandOrder.push("keys");
  },
  onInputCommands: () => {
    sendCommandOrder.push("input");
  },
  onSendCmd: () => {
    sendCommandOrder.push("sendcmd");
  }
});
assert.deepEqual(sendCommandOrder, ["keys", "input", "sendcmd"], "CL_SendCommand should preserve the original high-level call order around CL_SendCmd");
assert.equal(Cvar_VariableString(cvar, "timescale"), "1", "CL_SendCommand should execute the command buffer before fixing cheat cvars");
assert.equal(sentPackets[0]?.text, "getchallenge\n", "CL_SendCommand should end by running the resend-connect path");

sentPackets.length = 0;
context.client.cls.state = 4;
context.client.cls.realtime = 15000;
context.client.cls.frametime = 0.05;
context.client.cls.netchan.outgoing_sequence = 11;
context.client.cl.frame.valid = true;
context.client.cl.frame.serverframe = 321;
inputContext.old_sys_frame_time = 14950;
Cmd_ExecuteString(cmd, "+forward 17 14900");
Cvar_Set(cvar, "skin", "female/athena");
const bridgedSendCmd = createClientSendCmdBridge(inputContext, {
  getFrameOptions: () => ({
    anykeydown: true,
    key_game_active: true
  })
});
CL_SendCommand(context, {
  onSendCmd: bridgedSendCmd
});
assert.equal(sentPackets.length, 1, "CL_SendCommand bridge should route through the real CL_SendCmd packet path");
assert.equal(inputContext.sys_frame_time, 15000, "CL_SendCommand bridge should feed cls.realtime into CL_SetInputFrameTime");
assert.equal(context.client.cl.cmd_time[11], 15000, "CL_SendCommand bridge should store command timing through CL_SendCmd");
assert.equal(Cvar_VariableString(cvar, "gender"), "female", "CL_SendCommand bridge should invoke the real CL_FixUpGender path before flushing userinfo");
Cmd_ExecuteString(cmd, "-forward 17 15000");

context.client.cls.state = 3;
context.frame_extratime = 0;
const throttled = CL_Frame(context, 50, {
  getMilliseconds: () => 12000
});
assert.equal(throttled, false, "CL_Frame should throttle connected-state frames below 100ms while connecting");
assert.equal(context.frame_extratime, 50, "CL_Frame should accumulate extra time when throttled");

const frameOrder: string[] = [];
const hostSpeedMarks: string[] = [];
const logSamples: string[] = [];
context.client.cls.state = 4;
context.client.cl.refresh_prepped = false;
context.client.cls.framecount = 0;
context.frame_extratime = 0;
let currentMs = 13000;
const ranFrame = CL_Frame(context, 100, {
  getMilliseconds: () => {
    currentMs += 10;
    return currentMs;
  },
  onInputFrame: () => frameOrder.push("input-frame"),
  onSendKeyEvents: () => frameOrder.push("send-key-events"),
  onInputCommands: () => frameOrder.push("input-commands"),
  onSendCmd: () => frameOrder.push("send-cmd"),
  onReadPackets: () => frameOrder.push("read-packets"),
  onPredictMovement: () => frameOrder.push("predict"),
  onVideoCheckChanges: () => frameOrder.push("vid-check"),
  onPrepRefresh: () => {
    frameOrder.push("prep-refresh");
    context.client.cl.refresh_prepped = true;
  },
  hostSpeedsEnabled: () => true,
  onHostSpeedTimeBeforeRef: (ms) => hostSpeedMarks.push(`before:${ms}`),
  onUpdateScreen: () => frameOrder.push("screen"),
  onHostSpeedTimeAfterRef: (ms) => hostSpeedMarks.push(`after:${ms}`),
  onUpdateAudio: () => frameOrder.push("audio"),
  onCDAudioUpdate: () => frameOrder.push("cd"),
  onRunDLights: () => frameOrder.push("dlights"),
  onRunLightStyles: () => frameOrder.push("lightstyles"),
  onRunCinematic: () => frameOrder.push("cinematic"),
  onRunConsole: () => frameOrder.push("console"),
  logStatsEnabled: () => true,
  onLogStatSample: (line) => logSamples.push(line)
});
assert.equal(ranFrame, true, "CL_Frame should run once the throttle conditions are satisfied");
assert.deepEqual(frameOrder, [
  "input-frame",
  "read-packets",
  "send-key-events",
  "input-commands",
  "send-cmd",
  "predict",
  "vid-check",
  "prep-refresh",
  "screen",
  "audio",
  "cd",
  "dlights",
  "lightstyles",
  "cinematic",
  "console"
], "CL_Frame should preserve the source-level subsystem call order");
assert.equal(context.client.cls.framecount, 1, "CL_Frame should increment cls.framecount");
assert.equal(context.client.cls.frametime, 0.1, "CL_Frame should convert extra time to seconds");
assert.equal(context.client.cl.time, 100, "CL_Frame should advance cl.time by the accumulated frame time");
assert.equal(hostSpeedMarks.length, 2, "CL_Frame should mark host speed timestamps around screen update");
assert.equal(logSamples[0], "0", "CL_Frame should emit the initial zero log-stats sample");

currentMs = 20000;
const clamped = CL_Frame(context, 6000, {
  getMilliseconds: () => {
    currentMs += 5;
    return currentMs;
  },
  onUpdateScreen: () => {},
  onUpdateAudio: () => {},
  onRunDLights: () => {},
  onRunLightStyles: () => {},
  onRunCinematic: () => {},
  onRunConsole: () => {},
  logStatsEnabled: () => true,
  onLogStatSample: (line) => logSamples.push(line)
});
assert.equal(clamped, true, "CL_Frame should still execute large delayed frames");
assert.equal(context.client.cls.frametime, 0.2, "CL_Frame should clamp frametime to 1/5 second");
assert.equal(context.client.cls.netchan.last_received > 0, true, "CL_Frame should refresh last_received after a long debugger-style stall");
assert.equal(logSamples.length >= 2, true, "CL_Frame should append a follow-up log-stats sample on later active frames");

const initOrder: string[] = [];
cmd.cmd_text.cursize = 0;
context.client.cls.disable_screen = 0;
let autoexecCommandRan = false;
if (!Cmd_Exists(cmd, "markauto")) {
  Cmd_AddCommand(cmd, "markauto", () => {
    autoexecCommandRan = true;
  });
}
const initialized = CL_Init(context, {
  onConsoleInit: () => initOrder.push("console"),
  onVideoInit: () => initOrder.push("video"),
  onSoundInit: () => initOrder.push("sound"),
  onViewInit: () => initOrder.push("view"),
  onMenuInit: () => initOrder.push("menu"),
  onScreenInit: () => initOrder.push("screen"),
  onCDAudioInit: () => initOrder.push("cd"),
  onInitLocal: () => initOrder.push("local"),
  onInputInit: () => initOrder.push("input-init"),
  onExecAutoexec: () => {
    initOrder.push("autoexec");
    Cbuf_AddText(cmd, "markauto\n");
  }
});
assert.equal(initialized, true, "CL_Init should run when not dedicated");
assert.deepEqual(initOrder, ["console", "video", "sound", "view", "menu", "screen", "cd", "local", "input-init", "autoexec"], "CL_Init should preserve the original subsystem init order");
assert.equal(context.client.cls.disable_screen, 1, "CL_Init should raise cls.disable_screen during bootstrap");
assert.equal(autoexecCommandRan, true, "CL_Init should execute the command buffer after autoexec");

const dedicatedInit = CL_Init(context, {
  isDedicated: () => true
});
assert.equal(dedicatedInit, false, "CL_Init should no-op on dedicated hosts");

const demoFile = { chunks: [] as Uint8Array[], closed: false };
context.client.cls.state = 4;
context.client.cl.servercount = 12;
context.client.cl.gamedir = "baseq2";
context.client.cl.playernum = 2;
context.client.cl.configstrings[0] = "unit-test-map";
context.client.cl.configstrings[1] = "maps/unit-test.bsp";
context.client.cl_entities[1]!.baseline.number = 1;
context.client.cl_entities[1]!.baseline.modelindex = 3;
context.client.net_message.cursize = 12;
context.client.net_message.data.set([1, 2, 3, 4, 5, 6, 7, 8, 65, 66, 67, 68], 0);
Cmd_TokenizeString(cmd, "record demo-check", false);
let createdDemoPath = "";
const recordResult = CL_Record_f(context, {
  getGameDir: () => "baseq2",
  onCreateDemoPath: (path) => {
    createdDemoPath = path;
  },
  onOpenDemoFile: () => demoFile,
  onWriteDemoBytes: (handle, bytes) => {
    (handle as typeof demoFile).chunks.push(new Uint8Array(bytes));
  }
});
assert.equal(recordResult?.path, "baseq2/demos/demo-check.dm2", "CL_Record_f should resolve the target demo path");
assert.equal(createdDemoPath, "baseq2/demos/demo-check.dm2", "CL_Record_f should create the demo path before opening");
assert.equal(context.client.cls.demorecording, true, "CL_Record_f should enter demo-recording mode");
assert.equal(context.client.cls.demowaiting, true, "CL_Record_f should start in demowaiting mode");
assert.equal(demoFile.chunks.length > 0, true, "CL_Record_f should write initial startup chunks");
const firstChunkLength = new DataView(demoFile.chunks[0]!.buffer, demoFile.chunks[0]!.byteOffset, 4).getInt32(0, true);
assert.equal(firstChunkLength > 0, true, "CL_Record_f should prefix each chunk with its little-endian payload length");
assert.equal(demoFile.chunks[0]![4], 12, "CL_Record_f should begin the first payload with svc_serverdata");
assert.equal(String.fromCharCode(...demoFile.chunks.at(-1)!.subarray(4)).includes("precache\n"), true, "CL_Record_f should end startup data with the precache stufftext");

const demoMessageChunk = CL_WriteDemoMessage(context, {
  onWriteDemoBytes: (handle, bytes) => {
    (handle as typeof demoFile).chunks.push(new Uint8Array(bytes));
  }
});
assert.equal(demoMessageChunk !== null, true, "CL_WriteDemoMessage should serialize the current network message while recording");
assert.equal(new DataView(demoMessageChunk!.buffer, demoMessageChunk!.byteOffset, 4).getInt32(0, true), 4, "CL_WriteDemoMessage should prefix payload length without the 8-byte sequence header");
assert.equal(String.fromCharCode(...demoMessageChunk!.subarray(4)), "ABCD", "CL_WriteDemoMessage should skip the packet sequencing header");

const stoppedDemo = CL_Stop_f(context, {
  onWriteDemoBytes: (handle, bytes) => {
    (handle as typeof demoFile).chunks.push(new Uint8Array(bytes));
  },
  onCloseDemoFile: (handle) => {
    (handle as typeof demoFile).closed = true;
  }
});
assert.equal(stoppedDemo, true, "CL_Stop_f should stop an active demo recording");
assert.equal(context.client.cls.demorecording, false, "CL_Stop_f should clear demo-recording mode");
assert.equal(demoFile.closed, true, "CL_Stop_f should close the active demo file");
assert.equal(new DataView(demoFile.chunks.at(-1)!.buffer, demoFile.chunks.at(-1)!.byteOffset, 4).getInt32(0, true), -1, "CL_Stop_f should append the terminal demo marker");

Cmd_TokenizeString(cmd, "packet 10.1.2.3 hello\\nworld", false);
sentPackets.length = 0;
const rawPacket = CL_Packet_f(context, { qnet });
assert.equal(rawPacket !== null, true, "CL_Packet_f should build a raw packet when arguments are valid");
assert.equal(sentPackets[0]?.port, 27910, "CL_Packet_f should default the remote port");
assert.equal(sentPackets[0]?.text, "hello\nworld", "CL_Packet_f should translate escaped newlines in the payload");

const dumpPrints: string[] = [];
packetQueue.push(
  { from: NET_StringToAdr("10.0.0.1:27910", qnetAddressFactory()) ? qnetAddressFactory() : qnetAddressFactory(), data: new Uint8Array([1]) },
  { from: NET_StringToAdr("10.0.0.2:27910", qnetAddressFactory()) ? qnetAddressFactory() : qnetAddressFactory(), data: new Uint8Array([2]) }
);
NET_StringToAdr("10.0.0.1:27910", packetQueue[0]!.from);
NET_StringToAdr("10.0.0.2:27910", packetQueue[1]!.from);
const dumped = CL_DumpPackets(context, {
  qnet,
  onPrint: (line) => dumpPrints.push(line)
});
assert.equal(dumped, 2, "CL_DumpPackets should drain every pending packet");
assert.equal(dumpPrints.length, 2, "CL_DumpPackets should print once per drained packet");

const serverAdr = qnetAddressFactory();
NET_StringToAdr("10.9.8.7:27910", serverAdr);
context.client.cls.state = 4;
context.client.cls.realtime = 50000;
context.client.cls.netchan.remote_address = {
  type: serverAdr.type,
  ip: new Uint8Array(serverAdr.ip),
  ipx: new Uint8Array(serverAdr.ipx),
  port: serverAdr.port
};
context.client.cls.netchan.incoming_sequence = 0;
context.client.cls.netchan.sock = 0;
const serverMessage = new Uint8Array(9);
new DataView(serverMessage.buffer).setInt32(0, 1, true);
new DataView(serverMessage.buffer).setInt32(4, 0, true);
serverMessage[8] = 255;
let parsedServerMessages = 0;
packetQueue.push({ from: serverAdr, data: serverMessage });
const processedPackets = CL_ReadPackets(context, {
  qnet,
  onPacketParseServerMessage: () => {
    parsedServerMessages += 1;
  }
});
assert.equal(processedPackets, 1, "CL_ReadPackets should consume sequenced server packets");
assert.equal(parsedServerMessages, 1, "CL_ReadPackets should parse accepted sequenced server packets");

context.client.cls.state = 4;
context.client.cls.realtime = 200000;
context.client.cls.netchan.last_received = 0;
context.client.cl.timeoutcount = 5;
recursiveMessage = "";
CL_ReadPackets(context, {
  qnet,
  onPrint: (line) => {
    recursiveMessage = line;
  }
});
assert.equal(recursiveMessage, "\nServer connection timed out.", "CL_ReadPackets should print the stock timeout message after repeated misses");
assert.equal(context.client.cls.state, 1, "CL_ReadPackets should disconnect the client after timeout");

keyContext.state.keybindings[K_TAB] = "inven";
let writtenPath = "";
let writtenContents = "";
const configWrite = CL_WriteConfiguration(context, {
  keyContext,
  getGameDir: () => "baseq2",
  onWriteConfigFile: (path, contents) => {
    writtenPath = path;
    writtenContents = contents;
    return true;
  }
});
assert.equal(configWrite?.path, "baseq2/config.cfg", "CL_WriteConfiguration should target config.cfg in the current game dir");
assert.equal(writtenPath, "baseq2/config.cfg", "CL_WriteConfiguration should forward the resolved config path to the writer hook");
assert.equal(writtenContents.includes("// generated by quake, do not modify\n"), true, "CL_WriteConfiguration should emit the stock config header");
assert.equal(writtenContents.includes("bind TAB \"inven\"\n"), true, "CL_WriteConfiguration should serialize key bindings before cvars");
assert.equal(writtenContents.includes("set cl_vwep \"1\"\n"), true, "CL_WriteConfiguration should append archived cvars");

const shutdownCalls: string[] = [];
CL_Shutdown(context, {
  keyContext,
  getGameDir: () => "baseq2",
  onWriteConfigFile: () => true,
  onCDAudioShutdown: () => shutdownCalls.push("cd"),
  onSoundShutdown: () => shutdownCalls.push("sound"),
  onInputShutdown: () => shutdownCalls.push("input"),
  onVideoShutdown: () => shutdownCalls.push("video")
});
assert.deepEqual(shutdownCalls, ["cd", "sound", "input", "video"], "CL_Shutdown should stop backends in the original order");

recursiveMessage = "";
CL_Shutdown(context, {
  onPrint: (line) => {
    recursiveMessage = line;
  }
});
assert.equal(recursiveMessage, "recursive shutdown", "CL_Shutdown should guard against recursive shutdown");

console.log("quake2-cl-main: ok");
