'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import styles from './SoundControl.module.css';
import { ambienceIsRecorded, play, setSound, soundStore } from '@/lib/sound/engine';

/**
 * Header sound control: a bars button that opens a small settings panel with
 * an on/off switch, an optional ambience switch and a volume slider.
 * Sound is always off until the visitor turns it on.
 */
export function SoundControl() {
  const state = useSyncExternalStore(soundStore.subscribe, soundStore.get, soundStore.getServer);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const toggleEnabled = () => {
    setSound({ enabled: !state.enabled });
    if (!state.enabled) window.setTimeout(() => play('tick'), 380);
  };

  return (
    <div className={styles.wrap}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Sound settings (sound ${state.enabled ? 'on' : 'off'})`}
        title={state.enabled ? 'Sound on' : 'Sound off'}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.bars} data-on={state.enabled || undefined} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            className={styles.panel}
            role="group"
            aria-label="Sound settings"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Switch label="Sound" checked={state.enabled} onChange={toggleEnabled} autoFocus />
            <Switch
              label="Ambience"
              hint={ambienceIsRecorded() ? 'Studio recording' : 'Soft room tone, generated in your browser'}
              checked={state.ambience}
              disabled={!state.enabled}
              onChange={() => setSound({ ambience: !state.ambience })}
            />
            <label className={styles.volume}>
              <span>Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(state.volume * 100)}
                disabled={!state.enabled}
                onChange={(e) => setSound({ volume: Number(e.target.value) / 100 })}
                onPointerUp={() => play('tick')}
                onKeyUp={() => play('tick')}
                aria-valuetext={`${Math.round(state.volume * 100)} percent`}
              />
            </label>
            <p className={styles.note}>Sound is optional and stays off until you choose otherwise.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Switch({
  label,
  hint,
  checked,
  disabled,
  onChange,
  autoFocus,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  autoFocus?: boolean;
}) {
  const hintId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={hint ? hintId : undefined}
      disabled={disabled}
      className={styles.switch}
      onClick={onChange}
      // Moves focus into the panel the visitor just opened.
      autoFocus={autoFocus}
    >
      <span className={styles.switchText}>
        <span>{label}</span>
        {hint && (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        )}
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
