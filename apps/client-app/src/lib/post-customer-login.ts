import { useAppStore } from '../store/appStore';

export async function resolvePostCustomerLogin(_phone: string): Promise<{ needsProfileSetup: boolean }> {
  const hint = useAppStore.getState().pendingAccountHint;
  if (hint?.has_provider) {
    useAppStore.getState().setPhoneHasProvider(true);
  }
  useAppStore.getState().setPendingAccountHint(null);

  const profileComplete = useAppStore.getState().user?.profileComplete;
  return { needsProfileSetup: profileComplete !== true };
};
