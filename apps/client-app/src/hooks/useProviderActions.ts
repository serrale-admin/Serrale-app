import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useLabels } from '../lib/labels';
import { useAppStore } from '../store/appStore';
import { useContactStore } from '../store/contactStore';
import type { Provider } from '../types';

/** Shared provider interactions: open, save (auth-gated), call, WhatsApp. */
export function useProviderActions() {
  const router = useRouter();
  const labels = useLabels();
  const loggedIn = useAppStore((s) => s.loggedIn);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const showToast = useAppStore((s) => s.showToast);
  const openCall = useContactStore((s) => s.openCall);
  const openWhatsapp = useContactStore((s) => s.openWhatsapp);

  const open = useCallback((id: string) => router.push(`/provider/${id}`), [router]);

  const save = useCallback(
    (id: string) => {
      if (!loggedIn) {
        router.replace({
          pathname: '/auth/login',
          params: {
            next: `/provider/${id}`,
            reason: labels.auth.reasonBookmark,
          },
        });
        return;
      }
      const added = toggleSaved(id);
      showToast(added ? labels.bookmarks.savedToast : labels.bookmarks.removedToast, 'ph-bookmark-simple');
    },
    [loggedIn, toggleSaved, showToast, router, labels],
  );

  const call = useCallback((p: Provider) => openCall(p), [openCall]);
  const whatsapp = useCallback((p: Provider) => openWhatsapp(p), [openWhatsapp]);

  return { open, save, call, whatsapp };
}
