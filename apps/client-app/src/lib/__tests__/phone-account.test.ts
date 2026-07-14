import { resolveLoginRoleFromHint } from '../phone-account';

describe('resolveLoginRoleFromHint', () => {
  it('prefers provider when phone has a provider listing', () => {
    expect(
      resolveLoginRoleFromHint(
        { has_customer: true, has_provider: true, customer_profile_complete: false },
        'customer',
      ),
    ).toBe('provider');
  });

  it('uses customer when only a customer account exists', () => {
    expect(
      resolveLoginRoleFromHint(
        { has_customer: true, has_provider: false, customer_profile_complete: true },
        'provider',
      ),
    ).toBe('customer');
  });

  it('falls back to tab selection for new phones', () => {
    expect(
      resolveLoginRoleFromHint(
        { has_customer: false, has_provider: false, customer_profile_complete: false },
        'provider',
      ),
    ).toBe('provider');
  });
});
