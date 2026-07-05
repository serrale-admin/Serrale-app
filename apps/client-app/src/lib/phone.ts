/**
 * Ethiopian phone helpers.
 *
 * The backend canonical form is `+2519XXXXXXXX` (a leading-9 mobile number).
 * Accepted input formats all normalize to that single canonical string:
 *   - local:            `0912345678`
 *   - bare local:       `912345678`
 *   - international:     `+251912345678`
 *   - international, no plus: `251912345678`
 *   - any of the above with spaces, dashes, or parens as separators.
 *
 * `parsePhone` in the backend (`backend/src/lib/ethiopianPhone.ts`) applies the
 * same rule server-side; this keeps client validation in lockstep so an invalid
 * number is rejected inline BEFORE any network call is made.
 */

/** The single reason string shown inline when a number cannot be normalized. */
export const PHONE_INVALID_MESSAGE = 'Enter a valid Ethiopian phone number (e.g. 0912 345 678).';

/**
 * Normalizes Ethiopian phone input to `+2519XXXXXXXX`. Returns null if invalid.
 *
 * Strips every non-digit first, so separators (spaces, dashes, parens, dots) are
 * accepted in any position. Then removes a `251` country prefix and/or a single
 * leading `0`, and requires exactly 9 remaining digits starting with `9`.
 */
export function normalizeEthiopianPhone(raw: string): string | null {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/[^0-9]/g, '');
  let local = digits;
  if (local.startsWith('251')) local = local.slice(3);
  if (local.startsWith('0')) local = local.slice(1);
  if (local.length !== 9 || !local.startsWith('9')) return null;
  return '+251' + local;
}

/** True when `raw` is a phone number the backend will accept. */
export function isValidEthiopianPhone(raw: string): boolean {
  return normalizeEthiopianPhone(raw) !== null;
}

/**
 * Returns the inline validation message for `raw`, or null when it is valid.
 * Empty input is treated as invalid (callers gate the network call on this).
 */
export function phoneValidationError(raw: string): string | null {
  return isValidEthiopianPhone(raw) ? null : PHONE_INVALID_MESSAGE;
}

/**
 * The 9-digit local part with spaced grouping, e.g. `912 345 678`.
 *
 * For a valid number this is derived from the canonical form; for an
 * in-progress partial it groups whatever digits are present without padding.
 * Falls back to the placeholder mask only for empty input.
 */
export function maskEthiopianPhone(raw: string): string {
  const local = (normalizeEthiopianPhone(raw) || raw.replace(/[^0-9]/g, '')).replace('+251', '');
  return local.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1 $2 $3').trim() || '9XX XXX XXX';
}

/**
 * Readable local display form for a stored/normalized number, e.g.
 * `0912 345 678`. Prefers the national `0` prefix Ethiopians recognize.
 * Returns the raw input untouched if it cannot be normalized (so we never
 * hide an unexpected value behind a mask).
 */
export function displayEthiopianPhone(raw: string): string {
  const canonical = normalizeEthiopianPhone(raw);
  if (!canonical) return raw;
  const local = canonical.replace('+251', '');
  const grouped = local.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  return '0' + grouped;
}
