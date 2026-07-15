import { customerDisplayName, isCustomerProfileComplete } from '../customer-profile';

describe('customer-profile', () => {
  it('prefers display_name over company and phone', () => {
    expect(
      customerDisplayName({
        display_name: 'Abebe Kebede',
        company_name: 'ACME',
        phone: '+251912345678',
      }),
    ).toBe('Abebe Kebede');
  });

  it('falls back to formatted phone when no name', () => {
    const name = customerDisplayName({ display_name: null, company_name: null, phone: '+251912345678' });
    expect(name).toMatch(/912/);
  });

  it('reads profile_complete flag', () => {
    expect(isCustomerProfileComplete({ profile_complete: true })).toBe(true);
    expect(isCustomerProfileComplete({ profile_complete: false })).toBe(false);
  });
});
