import { maskEthiopianPhone, normalizeEthiopianPhone } from '../phone';

describe('normalizeEthiopianPhone', () => {
  it('normalizes a local 0-prefixed number to +251 form', () => {
    expect(normalizeEthiopianPhone('0912345678')).toBe('+251912345678');
  });

  it('normalizes an already-international number, stripping punctuation/spaces', () => {
    expect(normalizeEthiopianPhone('+251 91 234 5678')).toBe('+251912345678');
  });

  it('normalizes a bare 9-prefixed local number with no leading 0', () => {
    expect(normalizeEthiopianPhone('912345678')).toBe('+251912345678');
  });

  it('returns null when the digit count is wrong', () => {
    expect(normalizeEthiopianPhone('12345')).toBeNull();
  });

  it('returns null when the local part does not start with 9', () => {
    expect(normalizeEthiopianPhone('0812345678')).toBeNull();
  });
});

describe('maskEthiopianPhone', () => {
  it('formats a valid number into spaced groups', () => {
    expect(maskEthiopianPhone('0912345678')).toBe('912 345 678');
  });

  it('formats a partial in-progress input without padding it', () => {
    expect(maskEthiopianPhone('912')).toBe('912');
  });

  it('falls back to the placeholder for empty input', () => {
    expect(maskEthiopianPhone('')).toBe('9XX XXX XXX');
  });
});
