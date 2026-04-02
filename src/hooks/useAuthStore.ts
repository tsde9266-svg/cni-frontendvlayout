import { create } from 'zustand';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user:      User | null;
  token:     string | null;
  // ── CRITICAL FIX ────────────────────────────────────────────────────────
  // loading starts as TRUE, not false.
  //
  // Why: AdminGuard checks `if (loading) return` before deciding whether to
  // redirect. If loading starts false, the guard sees user=null + loading=false
  // on first render (before hydrate() has even been called) and immediately
  // redirects to /admin/login. The login page then mounts, hydration completes,
  // user is set, login page redirects back to /admin, guard redirects back to
  // /admin/login — infinite loop.
  //
  // With loading=true from the start, the guard shows a spinner and waits.
  // hydrate() resolves (either populating user or not), sets loading=false,
  // and the guard makes exactly one redirect decision — no loop possible.
  loading:   boolean;
  hydrated:  boolean;  // true once hydrate() has completed at least once
  hydrate:   () => Promise<void>;
  login:     (email: string, password: string) => Promise<void>;
  logout:    () => void;
  setToken:  (token: string, user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:     null,
  token:    null,
  loading:  true,   // ← starts TRUE — guard waits for hydration
  hydrated: false,

  hydrate: async () => {
    // Only run in the browser
    if (typeof window === 'undefined') {
      set({ loading: false, hydrated: true });
      return;
    }

    const token = localStorage.getItem('cni_token');

    if (!token) {
      // No token — nothing to restore, but hydration is complete
      set({ loading: false, hydrated: true });
      return;
    }

    // Token exists — verify it with the API
    set({ loading: true });
    try {
      const res  = await authApi.me();
      const user = res.data.data as User;
      set({ user, token, loading: false, hydrated: true });
    } catch {
      // Token invalid/expired — clear it
      localStorage.removeItem('cni_token');
      set({ user: null, token: null, loading: false, hydrated: true });
    }
  },

  login: async (email, password) => {
    const res   = await authApi.login({ email, password });
    const token = res.data.token as string;
    const user  = res.data.data  as User;
    localStorage.setItem('cni_token', token);
    set({ user, token, loading: false, hydrated: true });
  },

  logout: () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('cni_token');
    set({ user: null, token: null });
  },

  setToken: (token, user) => {
    localStorage.setItem('cni_token', token);
    set({ user, token });
  },
}));
