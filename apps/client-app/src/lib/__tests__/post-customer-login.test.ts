import { useAppStore } from '../../store/appStore';
import { resolvePostCustomerLogin } from '../post-customer-login';

describe('resolvePostCustomerLogin', () => {
  beforeEach(() => {
    useAppStore.getState().logout();
    useAppStore.getState().setPhoneHasProvider(false);
    useAppStore.getState().setPendingAccountHint(null);
  });

  it('marks phoneHasProvider from account hint without forcing profile setup', async () => {
    useAppStore.getState().login({
      id: 'c1',
      phone: '+251938064841',
      name: 'Natnael Asnake',
      profileComplete: true,
    });
    useAppStore.getState().setPendingAccountHint({
      has_customer: true,
      has_provider: true,
      customer_profile_complete: true,
    });

    const result = await resolvePostCustomerLogin('+251938064841');

    expect(result.needsProfileSetup).toBe(false);
    expect(useAppStore.getState().phoneHasProvider).toBe(true);
    expect(useAppStore.getState().pendingAccountHint).toBeNull();
  });

  it('requires profile setup when customer profile is incomplete', async () => {
    useAppStore.getState().login({
      id: 'c2',
      phone: '+251912345678',
      name: '0912 345 678',
      profileComplete: false,
    });

    const result = await resolvePostCustomerLogin('+251912345678');

    expect(result.needsProfileSetup).toBe(true);
  });
});
