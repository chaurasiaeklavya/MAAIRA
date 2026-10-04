import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalisePhone, validateEnquiry } from '../src/lib/enquiry/schema.ts';

const PIECES = ['mfb-sample-01', 'mfb-sample-02'];
const base = {
  kind: 'enquiry',
  name: 'Asha Rao',
  email: 'Asha@Example.com ',
  message: 'I would like to know more about this piece, please.',
  consent: true,
  website: '',
  elapsedMs: 8000,
  idempotencyKey: 'a1b2c3d4-e5f6',
};

test('accepts a complete enquiry and normalises fields', () => {
  const r = validateEnquiry({ ...base, pieceId: 'mfb-sample-01' }, PIECES);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.email, 'asha@example.com');
    assert.equal(r.value.pieceId, 'mfb-sample-01');
    assert.equal(r.value.callbackWindow, null);
  }
});

test('requires email and a meaningful message for enquiries', () => {
  const r = validateEnquiry({ ...base, email: '', message: 'hi' }, PIECES);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.email);
    assert.ok(r.errors.message);
  }
});

test('requires phone and a preferred time for callbacks, email optional', () => {
  const bad = validateEnquiry({ ...base, kind: 'callback', email: '', message: '' }, PIECES);
  assert.equal(bad.ok, false);
  if (!bad.ok) {
    assert.ok(bad.errors.phone);
    assert.ok(bad.errors.callbackWindow);
    assert.equal(bad.errors.email, undefined);
  }
  const good = validateEnquiry(
    { ...base, kind: 'callback', email: '', message: '', phone: '98711 71112', callbackWindow: 'evening' },
    PIECES,
  );
  assert.equal(good.ok, true);
  if (good.ok) assert.equal(good.value.phone, '+919871171112');
});

test('rejects unknown pieces, missing consent and bad idempotency keys', () => {
  const r = validateEnquiry({ ...base, pieceId: 'invented-bag', consent: false, idempotencyKey: 'x' }, PIECES);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.pieceId);
    assert.ok(r.errors.consent);
    assert.ok(r.errors.form);
  }
});

test('flags honeypot and too-fast submissions as spam', () => {
  const honey = validateEnquiry({ ...base, website: 'http://spam.example' }, PIECES);
  assert.equal(honey.ok, false);
  if (!honey.ok) assert.equal(honey.spam, true);
  const fast = validateEnquiry({ ...base, elapsedMs: 200 }, PIECES);
  assert.equal(fast.ok, false);
  if (!fast.ok) assert.equal(fast.spam, true);
});

test('strips control characters and collapses whitespace in names', () => {
  const r = validateEnquiry({ ...base, name: '  Asha\u0007   Rao ' }, PIECES);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.name, 'Asha Rao');
});

test('phone normalisation', () => {
  assert.equal(normalisePhone('9871171112'), '+919871171112');
  assert.equal(normalisePhone('09871171112'), '+919871171112');
  assert.equal(normalisePhone('+91 98711 71112'), '+919871171112');
  assert.equal(normalisePhone('+44 20 7946 0958'), '+442079460958');
  assert.equal(normalisePhone('12345'), null);
  assert.equal(normalisePhone('+91 12345 67890'), null);
  assert.equal(normalisePhone('call me'), null);
});
