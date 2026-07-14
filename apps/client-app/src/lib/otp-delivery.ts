import type { OtpDelivery } from '../api/shared';

/** Normalize backend otp/request `delivery` for local store / UI. */
export function parseOtpDelivery(raw: unknown): OtpDelivery | null {
  if (raw === 'review_code' || raw === 'sms') return raw;
  return null;
}

/** True when the challenge deliberately skipped SMS (Play review path). */
export function isReviewCodeDelivery(delivery: OtpDelivery | null | undefined): boolean {
  return delivery === 'review_code';
}
