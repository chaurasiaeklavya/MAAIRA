/**
 * Original, synthesised interface sounds (Web Audio API) — no audio files,
 * no licensing dependencies. Disabled by default; only plays after the visitor
 * turns sound on, which also satisfies browser autoplay rules (user gesture).
 */
export type SoundName = 'open' | 'close' | 'tick';

let ctx: AudioContext | null = null;
let enabled = false;
const MASTER = 0.07;

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on) ensureContext();
}

function ensureContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noiseBuffer(ac: AudioContext, seconds: number) {
  const len = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Soft, leather-like brush: band-passed noise swept up (open) or down (close). */
function brush(ac: AudioContext, from: number, to: number, dur: number, gain: number) {
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, dur + 0.05);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain * MASTER, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Muted low body tone — gives the gesture weight without a "beep". */
function body(ac: AudioContext, f0: number, f1: number, dur: number, gain: number) {
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain * MASTER, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function play(name: SoundName) {
  if (!enabled) return;
  const ac = ensureContext();
  if (!ac) return;
  switch (name) {
    case 'open':
      brush(ac, 380, 1700, 0.32, 0.9);
      body(ac, 150, 92, 0.26, 0.55);
      break;
    case 'close':
      brush(ac, 1500, 360, 0.26, 0.75);
      body(ac, 110, 80, 0.2, 0.4);
      break;
    case 'tick':
      brush(ac, 2400, 1800, 0.05, 0.55);
      break;
  }
}
