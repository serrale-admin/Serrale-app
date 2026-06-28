import { create } from 'zustand';
import type { Provider } from '../types';

type ContactMode = 'call' | 'wa' | null;

interface ContactState {
  mode: ContactMode;
  provider: Provider | null;
  openCall(provider: Provider): void;
  openWhatsapp(provider: Provider): void;
  close(): void;
}

/** Drives the global Call / WhatsApp confirmation sheets from anywhere. */
export const useContactStore = create<ContactState>((set) => ({
  mode: null,
  provider: null,
  openCall: (provider) => set({ mode: 'call', provider }),
  openWhatsapp: (provider) => set({ mode: 'wa', provider }),
  close: () => set({ mode: null, provider: null }),
}));
