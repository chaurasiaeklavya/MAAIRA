/**
 * MAAIRA sound engine (Web Audio API).
 *
 * Signal flow:  cues ─┬─────────────► master ─► compressor ─► out
 *                     └─► reverb send ┘   ▲
 *               ambience ─────────────────┘
 *
 * - Off by default. The AudioContext is created only after the visitor turns
 *   sound on (a user gesture), which also satisfies autoplay policies.
 * - Turning sound off fades the master out and suspends the context, so
 *   nothing can keep playing.
 * - The context is suspended while the tab is hidden.
 * - Supplied recordings (see manifest.ts) are used when available; otherwise
 *   restrained procedural sounds are synthesised in the browser.
 */
import { AUDIO_ASSETS, type SoundSlot } from './manifest';

export type Cue = Exclude<SoundSlot, 'ambience'>;

export interface SoundState {
  enabled: boolean;
  ambience: boolean;
  /** 0–1, perceptual (squared before use). */
  volume: number;
}

const STORAGE_KEY = 'maaira-sound';
const DEFAULT_STATE: SoundState = { enabled: false, ambience: false, volume: 0.6 };

let state: SoundState = DEFAULT_STATE;
const listeners = new Set<() => void>();

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let cueBus: GainNode | null = null;
let ambBus: GainNode | null = null;
let reverbSend: GainNode | null = null;
let ambienceNodes: { stop: () => void } | null = null;
let suspendTimer: number | undefined;
const buffers = new Map<SoundSlot, AudioBuffer | 'failed'>();

/* ---------------- state store ---------------- */

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export const soundStore = {
  get: () => state,
  getServer: () => DEFAULT_STATE,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/** Restore saved preferences. Sound never resumes by itself: a saved "on" waits for the next user gesture. */
export function hydrateSoundPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    if (raw === 'on' || raw === 'off') {
      state = { ...state, enabled: raw === 'on' }; // legacy format
    } else {
      const saved = JSON.parse(raw) as Partial<SoundState>;
      state = {
        enabled: !!saved.enabled,
        ambience: !!saved.ambience,
        volume: typeof saved.volume === 'number' ? Math.min(1, Math.max(0, saved.volume)) : DEFAULT_STATE.volume,
      };
    }
    emit();
    if (state.enabled) {
      // Browsers only allow audio after a gesture: start on the visitor's first interaction.
      const resume = () => {
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
        if (state.enabled) setSound({});
      };
      window.addEventListener('pointerdown', resume);
      window.addEventListener('keydown', resume);
    }
  } catch {
    /* ignore malformed preference */
  }
}

/* ---------------- audio graph ---------------- */

function createImpulse(ac: AudioContext, seconds = 1.8, decay = 3.2) {
  const len = Math.floor(ac.sampleRate * seconds);
  const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      lp += ((Math.random() * 2 - 1) - lp) * 0.35; // one-pole lowpass → warmer, softer tail
      d[i] = lp * Math.pow(1 - t, decay);
    }
  }
  return ir;
}

function ensureGraph() {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  cueBus = ctx.createGain();
  cueBus.connect(master);
  reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.32;
  const convolver = ctx.createConvolver();
  convolver.buffer = createImpulse(ctx);
  cueBus.connect(reverbSend).connect(convolver).connect(master);

  ambBus = ctx.createGain();
  ambBus.gain.value = 0;
  ambBus.connect(master);

  document.addEventListener('visibilitychange', onVisibility);
  return ctx;
}

function onVisibility() {
  if (!ctx) return;
  if (document.hidden) void ctx.suspend();
  else if (state.enabled) void ctx.resume();
}

const masterLevel = () => state.volume * state.volume * 0.9;

function rampMaster(to: number, seconds = 0.25) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(to, t + seconds);
}

/* ---------------- supplied assets ---------------- */

async function loadAsset(slot: SoundSlot): Promise<AudioBuffer | null> {
  const asset = AUDIO_ASSETS[slot];
  if (!asset.supplied || !ctx) return null;
  const cached = buffers.get(slot);
  if (cached) return cached === 'failed' ? null : cached;
  const probe = document.createElement('audio');
  const file = asset.files.find((f) => probe.canPlayType(f.type) !== '');
  if (!file) {
    buffers.set(slot, 'failed');
    return null;
  }
  try {
    const res = await fetch(file.src);
    if (!res.ok) throw new Error(String(res.status));
    const buf = await ctx.decodeAudioData(await res.arrayBuffer());
    buffers.set(slot, buf);
    return buf;
  } catch (err) {
    buffers.set(slot, 'failed');
    console.warn(`[sound] could not load ${file.src}; using procedural fallback`, err);
    return null;
  }
}

function playBuffer(buf: AudioBuffer, gain: number, bus: GainNode, loop = false) {
  const src = ctx!.createBufferSource();
  src.buffer = buf;
  src.loop = loop;
  const g = ctx!.createGain();
  g.gain.value = gain;
  src.connect(g).connect(bus);
  src.start();
  return src;
}

/* ---------------- procedural sounds ---------------- */

function noise(seconds: number) {
  const len = Math.max(1, Math.floor(ctx!.sampleRate * seconds));
  const buf = ctx!.createBuffer(1, len, ctx!.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Band-passed noise brush: the sound of a hand across leather. */
function brush(from: number, to: number, dur: number, gain: number, q = 0.9, delay = 0) {
  const ac = ctx!;
  const t = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noise(dur + 0.05);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = q;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.32);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(cueBus!);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Muted body tone that gives a gesture weight without a "beep". */
function body(f0: number, f1: number, dur: number, gain: number) {
  const ac = ctx!;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(cueBus!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Soft felt-hammer pluck: sine + filtered triangle with a long natural decay. */
function pluck(freq: number, gain: number, delay = 0, decay = 1.4) {
  const ac = ctx!;
  const t = ac.currentTime + delay;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(2600, t);
  lp.frequency.exponentialRampToValueAtTime(700, t + decay);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  for (const [type, mult, level] of [
    ['sine', 1, 1],
    ['triangle', 2, 0.18],
  ] as const) {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = freq * mult;
    const og = ac.createGain();
    og.gain.value = level;
    osc.connect(og).connect(lp);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }
  lp.connect(g).connect(cueBus!);
}

function synth(cue: Cue) {
  switch (cue) {
    case 'tick':
      brush(2600, 2000, 0.045, 0.28, 1.4);
      break;
    case 'open':
      brush(320, 1500, 0.4, 0.42);
      body(140, 88, 0.3, 0.2);
      break;
    case 'close':
      brush(1400, 320, 0.32, 0.36);
      body(108, 76, 0.24, 0.16);
      break;
    case 'page':
      brush(900, 2400, 0.2, 0.16, 0.7);
      brush(1800, 900, 0.22, 0.12, 0.7, 0.07);
      break;
    case 'success':
      pluck(659.25, 0.13);
      pluck(987.77, 0.1, 0.11, 1.8);
      break;
    case 'error':
      pluck(220, 0.14, 0, 0.6);
      break;
  }
}

/** In-browser room tone: warm brown noise with a slow breathing filter. */
function startProceduralAmbience() {
  const ac = ctx!;
  const seconds = 8;
  const len = ac.sampleRate * seconds;
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.2;
    }
    // Crossfade the loop seam so it never clicks.
    const fade = Math.floor(ac.sampleRate * 0.5);
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      d[len - fade + i] = d[len - fade + i] * (1 - k) + d[i] * k;
    }
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.loopStart = 0.5;
  src.loopEnd = seconds;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.045;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 90;
  lfo.connect(lfoGain).connect(lp.frequency);
  const g = ac.createGain();
  g.gain.value = 0.22;
  src.connect(lp).connect(g).connect(ambBus!);
  src.start();
  lfo.start();
  return {
    stop: () => {
      try {
        src.stop();
        lfo.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

async function startAmbience() {
  if (!ctx || !ambBus || ambienceNodes) return;
  const buf = await loadAsset('ambience');
  if (!state.enabled || !state.ambience || ambienceNodes) return;
  if (buf) {
    const src = playBuffer(buf, AUDIO_ASSETS.ambience.gain, ambBus, true);
    ambienceNodes = { stop: () => src.stop() };
  } else {
    ambienceNodes = startProceduralAmbience();
  }
  const t = ctx.currentTime;
  ambBus.gain.cancelScheduledValues(t);
  ambBus.gain.setValueAtTime(0, t);
  ambBus.gain.linearRampToValueAtTime(1, t + 2.5);
}

function stopAmbience(fade = 1.2) {
  if (!ctx || !ambBus || !ambienceNodes) return;
  const nodes = ambienceNodes;
  ambienceNodes = null;
  const t = ctx.currentTime;
  ambBus.gain.cancelScheduledValues(t);
  ambBus.gain.setValueAtTime(ambBus.gain.value, t);
  ambBus.gain.linearRampToValueAtTime(0, t + fade);
  window.setTimeout(() => nodes.stop(), fade * 1000 + 50);
}

/* ---------------- public API ---------------- */

export function setSound(patch: Partial<SoundState>) {
  const prev = state;
  state = { ...state, ...patch };
  persist();
  emit();

  if (state.enabled) {
    const ac = ensureGraph();
    if (!ac) return;
    window.clearTimeout(suspendTimer);
    void ac.resume();
    rampMaster(masterLevel(), prev.enabled ? 0.12 : 0.35);
    if (state.ambience) void startAmbience();
    else stopAmbience();
  } else if (ctx) {
    stopAmbience(0.25);
    rampMaster(0, 0.2);
    suspendTimer = window.setTimeout(() => void ctx?.suspend(), 320);
  }
}

export function play(cue: Cue) {
  if (!state.enabled || !ctx || ctx.state !== 'running' || !cueBus) return;
  const asset = AUDIO_ASSETS[cue];
  if (asset.supplied) {
    void loadAsset(cue).then((buf) => {
      if (buf && cueBus) playBuffer(buf, asset.gain, cueBus);
      else synth(cue);
    });
    return;
  }
  synth(cue);
}

/** Whether a real recording is used for ambience (for honest UI copy). */
export const ambienceIsRecorded = () => AUDIO_ASSETS.ambience.supplied;
