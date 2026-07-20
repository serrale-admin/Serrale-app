import { isAuthReplaySafe, isCustomerScopedPath } from '../http';

describe('isCustomerScopedPath', () => {
  it('marks customer activity and profile routes', () => {
    expect(isCustomerScopedPath('/public-directory/customers/me')).toBe(true);
    expect(isCustomerScopedPath('/public-directory/customers/me/activity')).toBe(true);
    expect(isCustomerScopedPath('/public-directory/customers/me/activity/request/x')).toBe(true);
  });

  it('marks leads/request as customer-scoped', () => {
    expect(isCustomerScopedPath('/public-directory/leads/request')).toBe(true);
  });

  it('does not mark public catalog or review routes', () => {
    expect(isCustomerScopedPath('/public-directory/providers')).toBe(false);
    expect(isCustomerScopedPath('/public-directory/providers/abc/reviews')).toBe(false);
    expect(isCustomerScopedPath('/public-directory/providers/abc/reviews/eligibility')).toBe(false);
    expect(isCustomerScopedPath('/public-directory/categories')).toBe(false);
  });
});

describe('isAuthReplaySafe', () => {
  it('treats GET as safe', () => {
    expect(isAuthReplaySafe('GET')).toBe(true);
    expect(isAuthReplaySafe('get')).toBe(true);
  });

  it('treats Idempotency-Key writes as safe', () => {
    expect(isAuthReplaySafe('POST', { 'Idempotency-Key': 'abc' })).toBe(true);
    expect(isAuthReplaySafe('POST', { 'idempotency-key': 'abc' })).toBe(true);
  });

  it('treats plain POST without idempotency as unsafe', () => {
    expect(isAuthReplaySafe('POST')).toBe(false);
    expect(isAuthReplaySafe('POST', {})).toBe(false);
    expect(isAuthReplaySafe('POST', { 'Idempotency-Key': '  ' })).toBe(false);
  });
});
