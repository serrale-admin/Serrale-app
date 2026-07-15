/** Customer OTP paths: login requires an existing account; request may create one. */
export type CustomerOtpIntent = 'login' | 'request';
export type CustomerOtpPurpose = 'directory_customer_login' | 'directory_customer_request';

export function customerOtpPurposeForIntent(intent: CustomerOtpIntent): CustomerOtpPurpose {
  return intent === 'request' ? 'directory_customer_request' : 'directory_customer_login';
}

/** Derive customer OTP intent from login route params. */
export function resolveCustomerOtpIntent(params: {
  intent?: string;
  next?: string;
  reason?: string;
}): CustomerOtpIntent {
  if (params.intent === 'login') return 'login';
  if (params.intent === 'request') return 'request';
  const next = String(params.next || '');
  if (next.includes('request') || next === '/(tabs)/request') return 'request';
  return 'login';
}
