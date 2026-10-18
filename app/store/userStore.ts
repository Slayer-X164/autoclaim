import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface UserStore {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setRole: (role: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setRole: (role) => set({ role }),
  clearUser: () => set({ user: null, role: null, isAuthenticated: false }),
}));
