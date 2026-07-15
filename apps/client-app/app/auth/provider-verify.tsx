import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppStore } from '../../src/store/appStore';

/** Legacy route — OTP verify is unified at /auth/verify. */
export default function ProviderVerifyRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const setPendingAuthRole = useAppStore((s) => s.setPendingAuthRole);

  useEffect(() => {
    setPendingAuthRole('provider');
    router.replace({ pathname: '/auth/verify', params: { next: params.next } });
  }, [router, params.next, setPendingAuthRole]);

  return null;
}
