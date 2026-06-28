/** Normalizes Ethiopian phone input to +2519XXXXXXXX. Returns null if invalid. */
export function normalizeEthiopianPhone(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, '');
  let local = digits;
  if (local.startsWith('251')) local = local.slice(3);
  if (local.startsWith('0')) local = local.slice(1);
  if (local.length !== 9 || !local.startsWith('9')) return null;
  return '+251' + local;
}

/** Spaced display form for the local part, e.g. "9XX XXX XXX". */
export function maskEthiopianPhone(raw: string): string {
  const local = (normalizeEthiopianPhone(raw) || raw.replace(/[^0-9]/g, '')).replace('+251', '');
  return local.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1 $2 $3').trim() || '9XX XXX XXX';
}
