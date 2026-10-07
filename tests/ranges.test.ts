import assert from 'node:assert/strict';
import { test } from 'node:test';
import { centredRange, windowRange } from '../src/lib/ranges';

const valid = (input: number[]) => {
  assert.equal(input[0], 0, 'starts at 0');
  assert.equal(input[input.length - 1], 1, 'ends at 1 (no implicit end keyframe)');
  for (let i = 1; i < input.length; i++) assert.ok(input[i] >= input[i - 1], 'non-decreasing');
};

test('windowRange spans the whole scroll and holds hidden items hidden', () => {
  for (const count of [1, 2, 3, 4]) {
    for (let index = 0; index < count; index++) {
      const w = windowRange(index, count, 0.05);
      valid(w.input);
      assert.equal(w.input.length, w.output.length);
      if (count > 1 && index < count - 1) assert.equal(w.output[w.output.length - 1], 0, `item ${index}/${count} stays out at the end`);
      if (count > 1 && index > 0) assert.equal(w.output[0], 0, `item ${index}/${count} starts out`);
    }
  }
});

test('centredRange spans the whole scroll and clamps at its edge values', () => {
  for (const center of [0, 1 / 3, 2 / 3, 1]) {
    const r = centredRange(center, 0.5, 140, -140);
    valid(r.input);
    assert.equal(r.input.length, r.output.length);
  }
  const first = centredRange(0, 0.5, 140, -140);
  assert.equal(first.output[first.output.length - 1], first.output[first.output.length - 2], 'holds after its window');
});
