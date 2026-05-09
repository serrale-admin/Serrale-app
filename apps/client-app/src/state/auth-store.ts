import { create } from "zustand";

import type { UserRole } from "@serrale/auth";

interface AuthStore {
  role: UserRole | null;
  displayName: string;
  setRole: (role: UserRole | null) => void;
  setDisplayName: (value: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  role: null,
  displayName: "Nati",
  setRole: (role) => set({ role }),
  setDisplayName: (displayName) => set({ displayName })
}));
