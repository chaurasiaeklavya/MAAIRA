/**
 * Keyframe windows for scroll-linked transforms. Motion may hand these to the
 * Web Animations API as keyframe offsets, which must stay within [0, 1] and
 * be non-decreasing — so windows are clamped at the ends of the scroll range.
 */

/** Visible window for item `index` of `count`, fading over `fade` at each edge. */
export function windowRange(index: number, count: number, fade: number) {
  const span = 1 / count;
  const a = index * span;
  const b = (index + 1) * span;
  const first = index === 0;
  const last = index === count - 1;
  if (count === 1) return { input: [0, 1], output: [1, 1] };
  if (first) return { input: [0, b - fade, b + fade], output: [1, 1, 0] };
  if (last) return { input: [a - fade, a + fade, 1], output: [0, 1, 1] };
  return { input: [a - fade, a + fade, b - fade, b + fade], output: [0, 1, 1, 0] };
}

/** Linear map centred on `center` (±half), clamped to [0, 1]. */
export function centredRange(center: number, half: number, from: number, to: number) {
  const lo = center - half;
  const hi = center + half;
  const input: number[] = [];
  const output: number[] = [];
  const at = (p: number) => from + ((p - lo) / (hi - lo)) * (to - from);
  input.push(Math.max(0, lo));
  output.push(at(Math.max(0, lo)));
  if (center > 0 && center < 1) {
    input.push(center);
    output.push(at(center));
  }
  input.push(Math.min(1, hi));
  output.push(at(Math.min(1, hi)));
  return { input, output };
}
