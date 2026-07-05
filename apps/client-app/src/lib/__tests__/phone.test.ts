import {
  displayEthiopianPhone,
  isValidEthiopianPhone,
  maskEthiopianPhone,
  normalizeEthiopianPhone,
  PHONE_INVALID_MESSAGE,
  phoneValidationError,
} from '../phone';

const CANONICAL = '+251912345678';

describe('normalizeEthiopianPhone', () => {
  // Every accepted input format must collapse to the one canonical string.
  it.each([
    ['local 0-prefixed', '0912345678'],
    ['bare 9-prefixed', '912345678'],
    ['international with plus', '+251912345678'],
    ['international without plus', '251912345678'],
    ['local with spaces', '09 12 345 678'],
    ['local with dashes', '091-234-5678'],
    ['international with spaces', '+251 91 234 5678'],
    ['international no plus with spaces', '251 91 234 5678'],
    ['parens and dots mixed', '(0912).345.678'],
    ['leading/trailing whitespace', '  0912345678  '],
  ])('normalizes %s to canonical', (_label, input) => {
    expect(normalizeEthiopianPhone(input)).toBe(CANONICAL);
  });

  it.each([
    ['too short', '12345'],
    ['too long', '09123456789'],
    ['local does not start with 9', '0812345678'],
    ['bare does not start with 9', '812345678'],
    ['empty', ''],
    ['only separators', '--  --'],
    ['letters', 'not-a-phone'],
    ['landline-style 011', '0111234567'],
  ])('returns null for %s', (_label, input) => {
    expect(normalizeEthiopianPhone(input)).toBeNull();
  });

  it('returns null for non-string input', () => {
    // Defensive: form libs can hand us undefined before first change.
    expect(normalizeEthiopianPhone(undefined as unknown as string)).toBeNull();
  });
});

describe('isValidEthiopianPhone / phoneValidationError', () => {
  it('accepts every canonical-equivalent format', () => {
    expect(isValidEthiopianPhone('0912345678')).toBe(true);
    expect(isValidEthiopianPhone('+251 91 234 5678')).toBe(true);
    expect(phoneValidationError('0912345678')).toBeNull();
  });

  it('returns the generic message for invalid input (used inline before any network call)', () => {
    expect(isValidEthiopianPhone('0812345678')).toBe(false);
    expect(phoneValidationError('0812345678')).toBe(PHONE_INVALID_MESSAGE);
    expect(phoneValidationError('')).toBe(PHONE_INVALID_MESSAGE);
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

describe('displayEthiopianPhone', () => {
  it('renders a valid number in national 0-prefixed grouped form', () => {
    expect(displayEthiopianPhone('+251912345678')).toBe('0912 345 678');
    expect(displayEthiopianPhone('912345678')).toBe('0912 345 678');
  });

  it('returns the raw input unchanged when it cannot be normalized', () => {
    expect(displayEthiopianPhone('garbage')).toBe('garbage');
  });
});
