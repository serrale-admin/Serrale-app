/**
 * Localization completeness contract.
 *
 * These tests are the guard the plan asks for: they fail the build if the
 * English and Amharic label sets ever drift out of parity — a missing AM key, an
 * orphan key, an empty translation, or an interpolation token that exists in one
 * language but not the other. Because both languages are produced by the SAME
 * object literal (ternaries inside `labelsFor`), a structural mismatch is only
 * possible via a typo/half-edit — exactly what this catches.
 */
import { fill, labelsFor } from '../labels';

type Leaf = { path: string; value: string };

/** Flatten a labels tree into [{ path, value }] leaves (path = dotted key). */
function leaves(obj: unknown, prefix = ''): Leaf[] {
  if (typeof obj === 'string') return [{ path: prefix, value: obj }];
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).flatMap(([k, v]) =>
      leaves(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [];
}

/** Interpolation tokens ({name}, {area}, …) in a template, sorted + deduped. */
function tokens(value: string): string[] {
  return [...new Set(value.match(/\{\w+\}/g) ?? [])].sort();
}

const en = leaves(labelsFor('en'));
const am = leaves(labelsFor('am'));
const enByPath = new Map(en.map((l) => [l.path, l.value]));
const amByPath = new Map(am.map((l) => [l.path, l.value]));

describe('labels EN/AM completeness', () => {
  it('every leaf is a string in both languages (no null/undefined/nested-only)', () => {
    expect(en.length).toBeGreaterThan(0);
    for (const { path, value } of en) {
      expect(typeof value).toBe('string');
      expect(amByPath.get(path)).toBeDefined();
      expect(typeof amByPath.get(path)).toBe('string');
    }
  });

  it('has identical key shape — no missing AM key, no orphan AM key', () => {
    const enPaths = en.map((l) => l.path).sort();
    const amPaths = am.map((l) => l.path).sort();
    expect(amPaths).toEqual(enPaths);
  });

  it('has no blank/whitespace-only values in either language', () => {
    for (const { value } of en) expect(value.trim().length).toBeGreaterThan(0);
    for (const { path, value } of am) {
      // Punctuation-only affixes (e.g. verify.sentToSuffix ".") are legitimate.
      expect(value.length).toBeGreaterThan(0);
      if (!path.includes('sentToSuffix')) expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('preserves every interpolation token across EN and AM', () => {
    for (const { path, value } of en) {
      const amValue = amByPath.get(path)!;
      expect({ path, tokens: tokens(amValue) }).toEqual({ path, tokens: tokens(value) });
    }
  });

  it('translates every key — the only leaves identical across languages are brand names', () => {
    const identical = en
      .filter((l) => amByPath.get(l.path) === l.value)
      .map((l) => l.path);
    // Brand names (WhatsApp) are intentionally identical in both languages.
    for (const path of identical) {
      expect(enByPath.get(path)).toBe('WhatsApp');
    }
  });
});

describe('fill() interpolation', () => {
  it('substitutes named tokens and leaves unknown ones intact', () => {
    expect(fill('Save {name}', { name: 'Tekle' })).toBe('Save Tekle');
    expect(fill('{count} providers', { count: 12 })).toBe('12 providers');
    expect(fill('Resend code in {seconds}s', { seconds: 60 })).toBe('Resend code in 60s');
    expect(fill('{a} {b}', { a: 'x' })).toBe('x {b}');
  });

  it('drives the rate-limit wait copy identically in both languages (token parity)', () => {
    const enMsg = fill(labelsFor('en').errors.rateLimitedMessageWait, { wait: '42 seconds' });
    const amMsg = fill(labelsFor('am').errors.rateLimitedMessageWait, { wait: '42 ሰከንድ' });
    expect(enMsg).toContain('42 seconds');
    expect(amMsg).toContain('42 ሰከንድ');
    expect(enMsg).not.toContain('{wait}');
    expect(amMsg).not.toContain('{wait}');
  });
});
