import axios from 'axios';

// ── Base axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 10000,
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cni_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cni_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Server-side fetch helpers (use in Server Components, NOT client code) ──
// Uses native fetch so Next.js can cache/deduplicate across concurrent renders.
// Without this, every SSR page render fires fresh axios calls from the same
// server IP → 429 rate-limit responses → hero/feeds silently return null.

const SERVER_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Returns the full Laravel response: { data: Article[], meta: { current_page, ... } }
// Components access the array via .data — mirrors the old axios pattern (res.data.data)
// but without the extra nesting since we skip the axios wrapper layer.
export async function serverFetchArticles(
  params: Record<string, string | number | boolean>,
  revalidate = 60,
): Promise<{ data: unknown[] }> {
  const url = new URL('/api/v1/articles', SERVER_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) return { data: [] };
  return res.json(); // shape: { data: Article[], meta: {...} }
}

// ── Typed API helpers ──────────────────────────────────────────────────────

export const articlesApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get('/api/v1/articles', { params }),

  show: (slug: string, lang = 'en') =>
    api.get(`/api/v1/articles/${slug}`, { params: { lang } }),

  search: (q: string, lang = 'en', page = 1) =>
    api.get('/api/v1/search', { params: { q, lang, page } }),
};

export const categoriesApi = {
  list: (lang = 'en') => api.get('/api/v1/categories', { params: { lang } }),
  show: (slug: string, lang = 'en') =>
    api.get(`/api/v1/categories/${slug}`, { params: { lang } }),
};

export const authApi = {
  register:  (data: object) => api.post('/api/v1/auth/register', data),
  login:     (data: object) => api.post('/api/v1/auth/login', data),
  logout:    ()             => api.post('/api/v1/auth/logout'),
  me:        ()             => api.get('/api/v1/me'),
};

export const membershipApi = {
  plans:         ()           => api.get('/api/v1/memberships/plans'),
  myMembership:  ()           => api.get('/api/v1/my/membership'),
  validatePromo: (data: object) => api.post('/api/v1/memberships/validate-promo', data),
  subscribe:     (data: object) => api.post('/api/v1/memberships/subscribe', data),
  cancel:        ()             => api.post('/api/v1/memberships/cancel'),
};

export const liveApi = {
  streams: () => api.get('/api/v1/live-streams'),
};

export const eventsApi = {
  list: (params?: object) => api.get('/api/v1/events', { params }),
};

export const advertisingApi = {
  packages: () =>
    api.get('/api/v1/ad-packages'),

  package: (slug: string) =>
    api.get(`/api/v1/ad-packages/${slug}`),

  show: (id: string | number) =>
    api.get(`/api/v1/ad-packages/${id}`),

  create: (data: object) =>
    api.post('/api/v1/ad-packages', data),

  myAds: () =>
    api.get('/api/v1/my/ad-packages'),
};
