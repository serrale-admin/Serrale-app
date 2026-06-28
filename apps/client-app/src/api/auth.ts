import { delay } from './client';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
}

/** Normalizes Ethiopian phone input to +2519XXXXXXXX. Returns null if invalid. */
export function normalizeEthiopianPhone(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, '');
  let local = digits;
  if (local.startsWith('251')) local = local.slice(3);
  if (local.startsWith('0')) local = local.slice(1);
  if (local.length !== 9 || !local.startsWith('9')) return null;
  return '+251' + local;
}

/** Requests an OTP for a phone number (mock: always succeeds for valid numbers). */
export function requestOtp(phone: string): Promise<{ sent: true; phone: string }> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error('Enter a valid Ethiopian phone number.'));
  return delay({ sent: true, phone: normalized }, 500);
}

/** Verifies an OTP code (mock: any 6-digit code is accepted). */
export function verifyOtp(phone: string, code: string): Promise<AuthUser> {
  if (code.replace(/[^0-9]/g, '').length !== 6) {
    return Promise.reject(new Error('Enter the 6-digit code.'));
  }
  const normalized = normalizeEthiopianPhone(phone) || '+251911234567';
  const display = '+251 ' + normalized.slice(4).replace(/(\d{3})(\d{3})(\d{0,3})/, '$1 $2 $3').trim();
  return delay({ id: 'user-1', name: 'Natnael', phone: display }, 500);
}
