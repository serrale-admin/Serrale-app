import { SERVICE_LOCATIONS } from '../data/mock';
import { normalizeEthiopianPhone } from './phone';
import { providerSession } from './provider-session';

export function phonesMatch(a?: string | null, b?: string | null): boolean {
  const left = normalizeEthiopianPhone(a || '') || a || '';
  const right = normalizeEthiopianPhone(b || '') || b || '';
  return Boolean(left && right && left === right);
}

/** True when this phone already has a saved provider session (same person, provider role). */
export async function hasLinkedProviderSession(phone: string): Promise<boolean> {
  const session = await providerSession.read();
  if (!session?.provider?.phone) return false;
  return phonesMatch(session.provider.phone, phone);
}

export interface PhoneAccountHint {
  has_customer: boolean;
  has_provider: boolean;
  customer_profile_complete: boolean;
}

export function parsePhoneAccountHint(raw: unknown): PhoneAccountHint | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  return {
    has_customer: row.has_customer === true,
    has_provider: row.has_provider === true,
    customer_profile_complete: row.customer_profile_complete === true,
  };
}

export type AuthLoginRole = 'customer' | 'provider';

/** Match backend resolveDirectoryLoginRole — provider DB row wins over tab selection. */
export function resolveLoginRoleFromHint(
  hint: PhoneAccountHint | null | undefined,
  preferred: AuthLoginRole = 'customer',
): AuthLoginRole {
  if (!hint) return preferred;
  if (hint.has_provider) return 'provider';
  if (hint.has_customer) return 'customer';
  return preferred;
}

export function areaDisplayToSlug(areaDisplay: string | null | undefined): string {
  if (!areaDisplay) return '';
  const normalized = areaDisplay.trim().toLowerCase();
  const loc = SERVICE_LOCATIONS.find(
    (l) =>
      l.slug === normalized ||
      l.name.toLowerCase() === normalized ||
      (l.am && l.am.trim() === areaDisplay.trim()),
  );
  return loc?.slug ?? '';
}
