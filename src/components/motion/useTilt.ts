'use client';

import { useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useExperience } from '../ExperienceProvider';

/**
 * Restrained pointer tilt with a travelling glare and a shadow that moves
 * against the light. Fine pointers only; inert under reduced motion.
 */
export function useTilt({ max = 7 }: { max?: number } = {}) {
  const { reducedMotion } = useExperience();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 120, damping: 16 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max * 1.25, max * 1.25]), { stiffness: 120, damping: 16 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(60% 50% at ${gx} ${gy}, rgb(255 255 255 / 0.22), transparent 70%)`;
  const sx = useTransform(mx, [0, 1], [18, -18]);
  const sy = useTransform(my, [0, 1], [34, 14]);
  const shadow = useMotionTemplate`${sx}px ${sy}px 60px -18px rgb(var(--shadow-rgb) / 0.55)`;

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = (instant = false) => {
    if (instant) {
      mx.jump(0.5);
      my.jump(0.5);
      rotateX.jump(0);
      rotateY.jump(0);
    } else {
      mx.set(0.5);
      my.set(0.5);
    }
  };

  return {
    enabled: !reducedMotion,
    style: reducedMotion ? undefined : { rotateX, rotateY },
    glare,
    shadow,
    onPointerMove,
    onPointerLeave: () => reset(),
    reset,
  };
}
