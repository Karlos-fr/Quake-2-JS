/**
 * File: quake2-snd-mix.ts
 * Purpose: Verify the `client/snd_mix.c` port for paintbuffer mixing and DMA transfer behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the `snd_mix.c` runtime port.
 *
 * Dependencies:
 * - packages/client/src/snd_mix.ts
 * - packages/client/src/snd_loc.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  PAINTBUFFER_SIZE,
  S_InitScaletable,
  S_PaintChannelFrom8,
  S_PaintChannelFrom16,
  S_PaintChannels,
  S_TransferPaintBuffer,
  createChannel,
  createClientSoundLocalContext,
  createClientSoundMixState,
  createSfx
} from "../../packages/client/src/index.js";

assert.equal(PAINTBUFFER_SIZE, 2048, "PAINTBUFFER_SIZE mismatch");

const mix = createClientSoundMixState();
assert.equal(mix.paintbuffer.length, PAINTBUFFER_SIZE, "paintbuffer size mismatch");
assert.equal(mix.snd_scaletable.length, 32, "snd_scaletable row count mismatch");
assert.equal(mix.snd_scaletable[0].length, 256, "snd_scaletable column count mismatch");

const scaleContext = createClientSoundLocalContext();
scaleContext.state.s_volume = { value: 0.5, modified: true } as never;
S_InitScaletable(scaleContext);
assert.equal(scaleContext.state.s_volume?.modified, false, "S_InitScaletable modified flag mismatch");
assert.equal(scaleContext.state.mix.snd_scaletable[4][255], -4 * 8 * 256 * 0.5, "S_InitScaletable signed byte mismatch");
assert.equal(scaleContext.state.mix.snd_scaletable[4][127], 127 * 4 * 8 * 256 * 0.5, "S_InitScaletable positive mismatch");

const paint16Context = createClientSoundLocalContext();
paint16Context.state.s_volume = { value: 1, modified: false } as never;
paint16Context.state.mix.snd_vol = 256;
const paint16Channel = createChannel();
paint16Channel.leftvol = 2;
paint16Channel.rightvol = 1;
paint16Channel.pos = 0;
const sfx16 = {
  length: 2,
  loopstart: -1,
  speed: 11025,
  width: 2,
  stereo: 0,
  data: new Uint8Array([0xe8, 0x03, 0x18, 0xfc])
};
S_PaintChannelFrom16(paint16Context, paint16Channel, sfx16, 2, 0);
assert.equal(paint16Context.state.mix.paintbuffer[0].left, 2000, "S_PaintChannelFrom16 left sample 0 mismatch");
assert.equal(paint16Context.state.mix.paintbuffer[0].right, 1000, "S_PaintChannelFrom16 right sample 0 mismatch");
assert.equal(paint16Context.state.mix.paintbuffer[1].left, -2000, "S_PaintChannelFrom16 left sample 1 mismatch");
assert.equal(paint16Context.state.mix.paintbuffer[1].right, -1000, "S_PaintChannelFrom16 right sample 1 mismatch");
assert.equal(paint16Channel.pos, 2, "S_PaintChannelFrom16 pos mismatch");

const transferContext = createClientSoundLocalContext();
transferContext.state.dma.buffer = new Uint8Array(16);
transferContext.state.dma.channels = 2;
transferContext.state.dma.samples = 8;
transferContext.state.dma.samplebits = 16;
transferContext.state.paintedtime = 0;
transferContext.state.mix.paintbuffer[0].left = 100 << 8;
transferContext.state.mix.paintbuffer[0].right = -100 << 8;
transferContext.state.mix.paintbuffer[1].left = 50 << 8;
transferContext.state.mix.paintbuffer[1].right = -50 << 8;
S_TransferPaintBuffer(transferContext, 2);
assert.deepEqual(
  Array.from(new Int16Array(transferContext.state.dma.buffer.buffer)),
  [100, -100, 50, -50, 0, 0, 0, 0],
  "S_TransferPaintBuffer stereo16 mismatch"
);

const wrapTransferContext = createClientSoundLocalContext();
wrapTransferContext.state.dma.buffer = new Uint8Array(16);
wrapTransferContext.state.dma.channels = 2;
wrapTransferContext.state.dma.samples = 8;
wrapTransferContext.state.dma.samplebits = 16;
wrapTransferContext.state.paintedtime = 3;
for (let i = 0; i < 4; i += 1) {
  wrapTransferContext.state.mix.paintbuffer[i].left = (10 + i * 10) << 8;
  wrapTransferContext.state.mix.paintbuffer[i].right = -(10 + i * 10) << 8;
}
S_TransferPaintBuffer(wrapTransferContext, 7);
assert.deepEqual(
  Array.from(new Int16Array(wrapTransferContext.state.dma.buffer.buffer)),
  [20, -20, 30, -30, 40, -40, 10, -10],
  "S_TransferPaintBuffer stereo16 wrap mismatch"
);

const transfer8Context = createClientSoundLocalContext();
transfer8Context.state.dma.buffer = new Uint8Array(4);
transfer8Context.state.dma.channels = 1;
transfer8Context.state.dma.samples = 4;
transfer8Context.state.dma.samplebits = 8;
transfer8Context.state.paintedtime = 1;
transfer8Context.state.mix.paintbuffer[0].left = 0;
transfer8Context.state.mix.paintbuffer[1].left = 0x7fff << 8;
transfer8Context.state.mix.paintbuffer[2].left = -0x8000 << 8;
S_TransferPaintBuffer(transfer8Context, 4);
assert.deepEqual(
  Array.from(transfer8Context.state.dma.buffer),
  [0, 128, 255, 0],
  "S_TransferPaintBuffer mono8 ring mismatch"
);

const paint8Context = createClientSoundLocalContext();
paint8Context.state.s_volume = { value: 1, modified: false } as never;
S_InitScaletable(paint8Context);
const paint8Channel = createChannel();
paint8Channel.leftvol = 255;
paint8Channel.rightvol = 255;
paint8Channel.pos = 1;
const sfx8 = {
  length: 3,
  loopstart: -1,
  speed: 11025,
  width: 1,
  stereo: 0,
  data: new Uint8Array([0, 127, 255])
};
S_PaintChannelFrom8(paint8Context, paint8Channel, sfx8, 2, 0);
assert.equal(paint8Channel.pos, 3, "S_PaintChannelFrom8 pos mismatch");
assert.equal(paint8Channel.leftvol, 255, "S_PaintChannelFrom8 left clamp mismatch");
assert.equal(paint8Context.state.mix.paintbuffer[0].left, 0, "S_PaintChannelFrom8 scale row mismatch");

const issueLog: string[] = [];
const mixContext = createClientSoundLocalContext({
  onS_IssuePlaysound: () => {
    issueLog.push("issue");
  }
});
mixContext.state.s_volume = { value: 1, modified: false } as never;
mixContext.state.dma.buffer = new Uint8Array(16);
mixContext.state.dma.channels = 2;
mixContext.state.dma.samples = 8;
mixContext.state.dma.samplebits = 16;
mixContext.state.dma.speed = 11025;
const activeSfx = createSfx();
activeSfx.name = "misc/mix16.wav";
activeSfx.cache = {
  length: 2,
  loopstart: -1,
  speed: 11025,
  width: 2,
  stereo: 0,
  data: new Uint8Array([0xe8, 0x03, 0x18, 0xfc])
};

mixContext.state.channels[0].sfx = activeSfx;
mixContext.state.channels[0].leftvol = 1;
mixContext.state.channels[0].rightvol = 1;
mixContext.state.channels[0].end = 2;
mixContext.state.channels[0].pos = 0;

mixContext.state.s_pendingplays.next = {
  ...createChannelPendingPlay(activeSfx),
  begin: 0
};
mixContext.state.s_pendingplays.next.prev = mixContext.state.s_pendingplays;

S_PaintChannels(mixContext, 2);
assert.deepEqual(issueLog, ["issue"], "S_PaintChannels pending plays mismatch");
assert.equal(mixContext.state.paintedtime, 2, "S_PaintChannels paintedtime mismatch");
assert.deepEqual(
  Array.from(new Int16Array(mixContext.state.dma.buffer.buffer)),
  [3, 3, -4, -4, 0, 0, 0, 0],
  "S_PaintChannels mixed DMA mismatch"
);
assert.equal(mixContext.state.channels[0].sfx, null, "S_PaintChannels channel stop mismatch");
assert.equal(mixContext.state.s_pendingplays.next, null, "S_PaintChannels pending unlink mismatch");

console.log("quake2-snd-mix: ok");

function createChannelPendingPlay(sfx: ReturnType<typeof createSfx>) {
  return {
    prev: null,
    next: null,
    sfx,
    volume: 1,
    attenuation: 0,
    entnum: 0,
    entchannel: 0,
    fixed_origin: false,
    origin: [0, 0, 0] as [number, number, number],
    begin: 0
  };
}
