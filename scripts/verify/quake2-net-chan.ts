/**
 * File: quake2-net-chan.ts
 * Purpose: Verify the principal TypeScript attachment point for `qcommon/net_chan.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the network-channel sequencing and reliability path.
 *
 * Dependencies:
 * - packages/qcommon/src/net_chan.ts
 * - packages/qcommon/src/qcommon.ts
 * - packages/qcommon/src/messages.ts
 * - packages/memory/src/sizebuf.ts
 */

import { strict as assert } from "node:assert";

import { createSizeBuffer } from "../../packages/memory/src/index.js";
import { MSG_BeginReading, MSG_ReadByte, MSG_ReadLong, MSG_ReadShort, MSG_ReadString, MSG_WriteByte, MSG_WriteLong, MSG_WriteShort } from "../../packages/qcommon/src/messages.js";
import {
  Netchan_CanReliable,
  Netchan_Init,
  Netchan_NeedReliable,
  Netchan_OutOfBand,
  Netchan_OutOfBandPrint,
  Netchan_Process,
  Netchan_Setup,
  Netchan_Transmit
} from "../../packages/qcommon/src/net_chan.js";
import {
  MAX_MSGLEN,
  NET_AdrToString,
  createNetAdr,
  createNetchan,
  createQcommonNetRuntime,
  netadrtype_t,
  netsrc_t
} from "../../packages/qcommon/src/qcommon.js";

const printed: string[] = [];
const sentPackets: Array<{ sock: netsrc_t; data: Uint8Array; to: string }> = [];
let fakeNow = 1234;

const runtime = createQcommonNetRuntime({
  now: () => fakeNow,
  sendPacket: (sock, data, to) => {
    sentPackets.push({ sock, data: new Uint8Array(data), to: NET_AdrToString(to) });
  },
  onPrintf: (message) => {
    printed.push(message);
  }
});

const remote = createNetAdr(netadrtype_t.NA_IP);
remote.ip.set([127, 0, 0, 1]);
remote.port = 27910;

Netchan_Init(runtime);
assert.equal(runtime.qport, 1234 & 0xffff, "Netchan_Init qport mismatch");

const clientChan = createNetchan(netsrc_t.NS_CLIENT);
Netchan_Setup(runtime, netsrc_t.NS_CLIENT, clientChan, remote, 55);
assert.equal(clientChan.outgoing_sequence, 1, "Netchan_Setup outgoing_sequence mismatch");
assert.equal(clientChan.qport, 55, "Netchan_Setup qport mismatch");
assert.equal(clientChan.message.allowoverflow, true, "Netchan_Setup allowoverflow mismatch");
assert.equal(Netchan_CanReliable(clientChan), true, "Netchan_CanReliable mismatch");

clientChan.message_buf[0] = 42;
clientChan.message.cursize = 1;
assert.equal(Netchan_NeedReliable(clientChan), true, "Netchan_NeedReliable mismatch");

runtime.showpackets = true;
Netchan_Transmit(runtime, clientChan, 2, new Uint8Array([1, 2]));
assert.equal(sentPackets.length, 1, "Netchan_Transmit send mismatch");
assert.equal(
  printed.at(-1),
  "send   13 : s=1 reliable=1 ack=0 rack=0\n",
  "showpackets send trace mismatch"
);

const transmitted = sentPackets[0]!;
const transmittedMessage = createSizeBuffer(new Uint8Array(transmitted.data));
transmittedMessage.cursize = transmitted.data.length;
MSG_BeginReading(transmittedMessage);
assert.equal(MSG_ReadLong(transmittedMessage), -2147483647, "Netchan_Transmit w1 mismatch");
assert.equal(MSG_ReadLong(transmittedMessage), 0, "Netchan_Transmit w2 mismatch");
assert.equal(MSG_ReadShort(transmittedMessage), runtime.qport, "Netchan_Transmit qport mismatch");
assert.equal(MSG_ReadByte(transmittedMessage), 42, "Netchan_Transmit reliable payload mismatch");
assert.equal(MSG_ReadByte(transmittedMessage), 1, "Netchan_Transmit unreliable payload first byte mismatch");
assert.equal(MSG_ReadByte(transmittedMessage), 2, "Netchan_Transmit unreliable payload second byte mismatch");
assert.equal(clientChan.reliable_length, 1, "Netchan_Transmit reliable length mismatch");
assert.equal(clientChan.reliable_sequence, 1, "Netchan_Transmit reliable sequence toggle mismatch");
assert.equal(clientChan.last_reliable_sequence, 2, "Netchan_Transmit last reliable sequence mismatch");
assert.equal(Netchan_CanReliable(clientChan), false, "Netchan_CanReliable waiting-for-ack mismatch");
assert.equal(Netchan_NeedReliable(clientChan), false, "Netchan_NeedReliable waiting-for-ack mismatch");

clientChan.incoming_acknowledged = clientChan.last_reliable_sequence + 1;
clientChan.incoming_reliable_acknowledged = 0;
assert.equal(Netchan_NeedReliable(clientChan), true, "Netchan_NeedReliable retransmit mismatch");
Netchan_Transmit(runtime, clientChan, 0, new Uint8Array(0));
const retransmitted = sentPackets[1]!;
const retransmittedMessage = createSizeBuffer(new Uint8Array(retransmitted.data));
retransmittedMessage.cursize = retransmitted.data.length;
MSG_BeginReading(retransmittedMessage);
assert.equal(MSG_ReadLong(retransmittedMessage), -2147483646, "Netchan_Transmit retransmit w1 mismatch");
assert.equal(MSG_ReadLong(retransmittedMessage), 0, "Netchan_Transmit retransmit w2 mismatch");
assert.equal(MSG_ReadShort(retransmittedMessage), runtime.qport, "Netchan_Transmit retransmit qport mismatch");
assert.equal(MSG_ReadByte(retransmittedMessage), 42, "Netchan_Transmit retransmit reliable payload mismatch");

const overflowChan = createNetchan(netsrc_t.NS_CLIENT);
Netchan_Setup(runtime, netsrc_t.NS_CLIENT, overflowChan, remote, 55);
overflowChan.message.overflowed = true;
const sentBeforeOverflow = sentPackets.length;
Netchan_Transmit(runtime, overflowChan, 0, new Uint8Array(0));
assert.equal(overflowChan.fatal_error, true, "Netchan_Transmit overflow fatal mismatch");
assert.equal(sentPackets.length, sentBeforeOverflow, "Netchan_Transmit overflow send mismatch");

const dumpChan = createNetchan(netsrc_t.NS_CLIENT);
Netchan_Setup(runtime, netsrc_t.NS_CLIENT, dumpChan, remote, 55);
Netchan_Transmit(runtime, dumpChan, MAX_MSGLEN, new Uint8Array(MAX_MSGLEN));
assert.equal(printed.at(-2), "Netchan_Transmit: dumped unreliable\n", "Netchan_Transmit dump trace mismatch");

const serverChan = createNetchan(netsrc_t.NS_SERVER);
Netchan_Setup(runtime, netsrc_t.NS_SERVER, serverChan, remote, 0);

const incomingMessage = createSizeBuffer(MAX_MSGLEN);
MSG_WriteLong(incomingMessage, (1 | (1 << 31)) >> 0);
MSG_WriteLong(incomingMessage, 0);
MSG_WriteShort(incomingMessage, 77);
MSG_WriteByte(incomingMessage, 99);

fakeNow = 4321;
assert.equal(Netchan_Process(runtime, serverChan, incomingMessage), true, "Netchan_Process mismatch");
assert.equal(serverChan.incoming_sequence, 1, "Netchan_Process sequence mismatch");
assert.equal(serverChan.incoming_reliable_sequence, 1, "Netchan_Process reliable toggle mismatch");
assert.equal(serverChan.last_received, 4321, "Netchan_Process timestamp mismatch");
assert.equal(
  printed.at(-1),
  "recv   11 : s=1 reliable=1 ack=0 rack=0\n",
  "showpackets recv trace mismatch"
);
assert.equal(MSG_ReadByte(incomingMessage), 99, "Netchan_Process payload offset mismatch");

runtime.showdrop = true;
const staleMessage = createSizeBuffer(MAX_MSGLEN);
MSG_WriteLong(staleMessage, 1);
MSG_WriteLong(staleMessage, 0);
MSG_WriteShort(staleMessage, 77);
assert.equal(Netchan_Process(runtime, serverChan, staleMessage), false, "out-of-order packet mismatch");
assert.equal(
  printed.at(-1),
  "127.0.0.1:27910:Out of order packet 1 at 1\n",
  "showdrop out-of-order trace mismatch"
);

const droppedMessage = createSizeBuffer(MAX_MSGLEN);
MSG_WriteLong(droppedMessage, 3);
MSG_WriteLong(droppedMessage, 0);
MSG_WriteShort(droppedMessage, 77);
MSG_WriteByte(droppedMessage, 11);
assert.equal(Netchan_Process(runtime, serverChan, droppedMessage), true, "dropped packet advance mismatch");
assert.equal(serverChan.dropped, 1, "dropped packet count mismatch");
assert.equal(
  printed.at(-2),
  "recv   11 : s=3 ack=0 rack=0\n",
  "showpackets dropped recv trace mismatch"
);
assert.equal(
  printed.at(-1),
  "127.0.0.1:27910:Dropped 1 packets at 3\n",
  "showdrop dropped trace mismatch"
);

Netchan_OutOfBand(runtime, netsrc_t.NS_CLIENT, remote, 3, new Uint8Array([5, 6, 7]));
Netchan_OutOfBandPrint(runtime, netsrc_t.NS_CLIENT, remote, "ping");
assert.equal(sentPackets.length, 5, "out-of-band packet count mismatch");

const binaryMessage = createSizeBuffer(new Uint8Array(sentPackets[3]!.data));
binaryMessage.cursize = sentPackets[3]!.data.length;
MSG_BeginReading(binaryMessage);
assert.equal(MSG_ReadLong(binaryMessage), -1, "Netchan_OutOfBand header mismatch");
assert.deepEqual(Array.from(binaryMessage.data.subarray(binaryMessage.readcount, binaryMessage.cursize)), [5, 6, 7], "Netchan_OutOfBand payload mismatch");

const printMessage = createSizeBuffer(new Uint8Array(sentPackets[4]!.data));
printMessage.cursize = sentPackets[4]!.data.length;
MSG_BeginReading(printMessage);
assert.equal(MSG_ReadLong(printMessage), -1, "Netchan_OutOfBandPrint header mismatch");
assert.equal(MSG_ReadString(printMessage), "ping", "Netchan_OutOfBandPrint payload mismatch");

console.log("Verification net_chan: OK");
