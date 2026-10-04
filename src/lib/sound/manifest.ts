/**
 * Audio asset slots.
 *
 * No licensed audio has been supplied for MAAIRA yet, so every slot is
 * `supplied: false` and the engine uses its in-browser procedural fallback.
 * To use real recordings: add the files under `public/audio/`, record their
 * licence, and set `supplied: true`. Files are fetched lazily — only after the
 * visitor turns sound on — and the first format the browser can play is used.
 * Nothing is requested while a slot is unsupplied, so there are no 404s.
 */
export type SoundSlot = 'ambience' | 'open' | 'close' | 'tick' | 'page' | 'success' | 'error';

export interface AudioAsset {
  files: { src: string; type: string }[];
  supplied: boolean;
  /** Licence / source note, required before `supplied` is set to true. */
  licence: string | null;
  /** Linear gain applied to this asset (0–1). */
  gain: number;
}

const slot = (name: string, gain: number): AudioAsset => ({
  files: [
    { src: `/audio/${name}.webm`, type: 'audio/webm; codecs="opus"' },
    { src: `/audio/${name}.mp3`, type: 'audio/mpeg' },
  ],
  supplied: false,
  licence: null,
  gain,
});

export const AUDIO_ASSETS: Record<SoundSlot, AudioAsset> = {
  ambience: slot('ambience', 0.5),
  open: slot('open', 0.7),
  close: slot('close', 0.7),
  tick: slot('tick', 0.5),
  page: slot('page', 0.6),
  success: slot('success', 0.6),
  error: slot('error', 0.6),
};
