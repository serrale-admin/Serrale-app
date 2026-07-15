import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

/** Legacy route — unified client login at /auth/login. */
export default function ProviderLoginRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();

  useEffect(() => {
    router.replace({ pathname: '/auth/login', params: { next: params.next, role: 'provider' } });
  }, [router, params.next]);

  return null;
}
