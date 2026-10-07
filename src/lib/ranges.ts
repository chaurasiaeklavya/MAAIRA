/**
 * Keyframe windows for scroll-linked transforms. Motion may hand these to the
 * Web Animations API as keyframe offsets (native scroll timelines), which must
 * stay within [0, 1] and be non-decreasing — and must run the full 0 → 1
 * range: a keyframe list that stops short of 1 gets an implicit end keyframe
 * at the element's underlying value, so a faded-out item drifts back in near
 * the end of the scroll. Every window therefore spans [0, 1], holding its
 * edge values outside the active part.
 */

/** Visible window for item `index` of `count`, fading over `fade` at each edge. */
export function windowRange(index: number, count: number, fade: number) {
  const span = 1 / count;
  const a = index * span;
  const b = (index + 1) * span;
  const first = index === 0;
  const last = index === count - 1;
  const lo = (x: number) => Math.max(0, x);
  const hi = (x: number) => Math.min(1, x);
  if (count === 1) return { input: [0, 1], output: [1, 1] };
  if (first) return { input: [0, hi(b - fade), hi(b + fade), 1], output: [1, 1, 0, 0] };
  if (last) return { input: [0, lo(a - fade), lo(a + fade), 1], output: [0, 0, 1, 1] };
  return { input: [0, lo(a - fade), lo(a + fade), hi(b - fade), hi(b + fade), 1], output: [0, 0, 1, 1, 0, 0] };
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
  // Hold the edge values across the rest of the scroll range (see above).
  if (input[0] > 0) {
    input.unshift(0);
    output.unshift(output[0]);
  }
  if (input[input.length - 1] < 1) {
    input.push(1);
    output.push(output[output.length - 1]);
  }
  return { input, output };
}
