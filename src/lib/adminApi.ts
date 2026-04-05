/**
 * adminApi.ts  — REPLACE src/lib/adminApi.ts with this file (Session 3 update)
 * Adds: show, bulk, publish, unpublish, approve, reject to adminArticlesApi
 */
import api from './api';
import type { AdminListResponse } from '@/types/admin';
import type { AdminArticle, AdminUser } from '@/types/admin';

type Params = Record<string, string | number | boolean | undefined | null>;

// ── Dashboard ──────────────────────────────────────────────────────────────
export const adminDashboardApi = {
  stats: () => api.get('/api/v1/admin/dashboard'),
};

// ── Articles ───────────────────────────────────────────────────────────────
export const adminArticlesApi = {
  list: (params?: Params) =>
    api.get<AdminListResponse<AdminArticle>>('/api/v1/admin/articles', { params }),

  show: (id: number) =>
    api.get(`/api/v1/admin/articles/${id}`),

  create: (data: object) =>
    api.post('/api/v1/articles', data),

  update: (id: number, data: object) =>
    api.patch(`/api/v1/articles/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/v1/articles/${id}`),

  bulk: (ids: number[], action: string) =>
    api.post('/api/v1/admin/articles/bulk', { ids, action }),

  publish: (id: number) =>
    api.post(`/api/v1/admin/articles/${id}/publish`),

  unpublish: (id: number) =>
    api.post(`/api/v1/admin/articles/${id}/unpublish`),

  approve: (id: number) =>
    api.post(`/api/v1/admin/articles/${id}/approve`),

  reject: (id: number, reason?: string) =>
    api.post(`/api/v1/admin/articles/${id}/reject`, { reason }),

  submit: (id: number) =>
    api.post(`/api/v1/articles/${id}/submit`),

  importRss: (limit = 4) =>
    api.post('/api/v1/admin/articles/import-rss', { limit }),

  toggleBreaking: (id: number) =>
    api.post(`/api/v1/articles/${id}/breaking`),

  versions: (id: number) =>
    api.get(`/api/v1/articles/${id}/versions`),
};

// ── Users ──────────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list: (params?: Params) =>
    api.get<AdminListResponse<AdminUser>>('/api/v1/admin/users', { params }),

  show: (id: number) =>
    api.get(`/api/v1/admin/users/${id}`),

  create: (data: object) =>
    api.post('/api/v1/admin/users', data),

  update: (id: number, data: object) =>
    api.patch(`/api/v1/admin/users/${id}`, data),

  suspend: (id: number) =>
    api.post(`/api/v1/admin/users/${id}/suspend`),

  activate: (id: number) =>
    api.post(`/api/v1/admin/users/${id}/activate`),

  assignRole: (id: number, roleSlug: string) =>
    api.post(`/api/v1/admin/users/${id}/assign-role`, { role: roleSlug }),
};

// ── Categories ─────────────────────────────────────────────────────────────
export const adminCategoriesApi = {
  list:   ()                           => api.get('/api/v1/admin/categories'),
  create: (data: object)               => api.post('/api/v1/admin/categories', data),
  update: (id: number, data: object)   => api.patch(`/api/v1/admin/categories/${id}`, data),
  delete: (id: number)                 => api.delete(`/api/v1/admin/categories/${id}`),
};

// ── Tags ───────────────────────────────────────────────────────────────────
export const adminTagsApi = {
  list:   (params?: Params)            => api.get('/api/v1/admin/tags', { params }),
  create: (data: object)               => api.post('/api/v1/admin/tags', data),
  update: (id: number, data: object)   => api.patch(`/api/v1/admin/tags/${id}`, data),
  delete: (id: number)                 => api.delete(`/api/v1/admin/tags/${id}`),
};

// ── Memberships ────────────────────────────────────────────────────────────
export const adminMembershipsApi = {
  plans:            ()                         => api.get('/api/v1/admin/membership-plans'),
  updatePlan:       (id: number, data: object) => api.patch(`/api/v1/admin/membership-plans/${id}`, data),
  members:          (params?: Params)          => api.get('/api/v1/admin/memberships', { params }),
  cancelMembership: (id: number)               => api.post(`/api/v1/admin/memberships/${id}/cancel`),
  promoCodes:       (params?: Params)          => api.get('/api/v1/admin/promo-codes', { params }),
  createPromo:      (data: object)             => api.post('/api/v1/admin/promo-codes', data),
  updatePromo:      (id: number, data: object) => api.patch(`/api/v1/admin/promo-codes/${id}`, data),
  deletePromo:      (id: number)               => api.delete(`/api/v1/admin/promo-codes/${id}`),
  deactivatePromo:  (id: number)               => api.post(`/api/v1/admin/promo-codes/${id}/deactivate`),
};

// ── Comments ───────────────────────────────────────────────────────────────
export const adminCommentsApi = {
  list:        (params?: Params)          => api.get('/api/v1/admin/comments', { params }),
  approve:     (id: number)               => api.post(`/api/v1/admin/comments/${id}/approve`),
  reject:      (id: number)               => api.post(`/api/v1/admin/comments/${id}/reject`),
  delete:      (id: number)               => api.delete(`/api/v1/admin/comments/${id}`),
  bulkAction:  (ids: number[], action: string) =>
    api.post('/api/v1/admin/comments/bulk-action', { ids, action }),
};

// ── Live Streams ───────────────────────────────────────────────────────────
export const adminLiveApi = {
  list:   (params?: Params)            => api.get('/api/v1/admin/live-streams', { params }),
  create: (data: object)               => api.post('/api/v1/admin/live-streams', data),
  update: (id: number, data: object)   => api.patch(`/api/v1/admin/live-streams/${id}`, data),
  goLive: (id: number)                 => api.post(`/api/v1/admin/live-streams/${id}/go-live`),
  end:    (id: number)                 => api.post(`/api/v1/admin/live-streams/${id}/end`),
  delete: (id: number)                 => api.delete(`/api/v1/admin/live-streams/${id}`),
};

// ── Events ─────────────────────────────────────────────────────────────────
export const adminEventsApi = {
  list:   (params?: Params)            => api.get('/api/v1/admin/events', { params }),
  create: (data: object)               => api.post('/api/v1/admin/events', data),
  update: (id: number, data: object)   => api.patch(`/api/v1/admin/events/${id}`, data),
  delete: (id: number)                 => api.delete(`/api/v1/admin/events/${id}`),
};

// ── Display Ads ────────────────────────────────────────────────────────────
export const adminAdsApi = {
  list:   ()                          => api.get('/api/v1/admin/display-ads'),
  show:   (id: number)                => api.get(`/api/v1/admin/display-ads/${id}`),
  create: (formData: FormData)        =>
    api.post('/api/v1/admin/display-ads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, formData: FormData) =>
    api.post(`/api/v1/admin/display-ads/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  toggle: (id: number)                => api.post(`/api/v1/admin/display-ads/${id}/toggle`),
  delete: (id: number)                => api.delete(`/api/v1/admin/display-ads/${id}`),
};

// ── Media ──────────────────────────────────────────────────────────────────
export const adminMediaApi = {
  list:   (params?: Params) => api.get('/api/v1/admin/media', { params }),
  upload: (formData: FormData) =>
    api.post('/api/v1/admin/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadVideo: (formData: FormData, onProgress?: (pct: number) => void) =>
    api.post('/api/v1/admin/media/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // 10 minutes — video uploads can be slow
      onUploadProgress: (e: any) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),
  update: (id: number, data: object) => api.patch(`/api/v1/admin/media/${id}`, data),
  delete: (id: number)               => api.delete(`/api/v1/admin/media/${id}`),
};

// ── SEO Redirects ──────────────────────────────────────────────────────────
export const adminSeoApi = {
  list:   (params?: Params)            => api.get('/api/v1/admin/seo-redirects', { params }),
  create: (data: object)               => api.post('/api/v1/admin/seo-redirects', data),
  update: (id: number, data: object)   => api.patch(`/api/v1/admin/seo-redirects/${id}`, data),
  delete: (id: number)                 => api.delete(`/api/v1/admin/seo-redirects/${id}`),
};

// ── Settings ───────────────────────────────────────────────────────────────
export const adminSettingsApi = {
  get:    ()             => api.get('/api/v1/admin/settings'),
  update: (data: object) => api.patch('/api/v1/admin/settings', data),
};

// ── Social Accounts ────────────────────────────────────────────────────────
export const adminSocialAccountsApi = {
  list:             ()              => api.get('/api/v1/admin/social-accounts'),
  connectFacebook:  ()              => api.get('/api/v1/admin/social-accounts/connect/facebook'),
  saveFacebookPage: (data: object)  => api.post('/api/v1/admin/social-accounts/facebook/save-page', data),
  connectYouTube:   ()              => api.get('/api/v1/admin/social-accounts/connect/youtube'),
  saveYouTubeChannel:(data: object) => api.post('/api/v1/admin/social-accounts/youtube/save-channel', data),
  validate:         (id: number)    => api.post(`/api/v1/admin/social-accounts/${id}/check-token`),
  disconnect:       (id: number)    => api.delete(`/api/v1/admin/social-accounts/${id}`),
};

// ── Social Posts ───────────────────────────────────────────────────────────
export const adminSocialPostsApi = {
  stats:       ()                        => api.get('/api/v1/admin/social-posts/stats'),
  list:        (params?: Params)         => api.get('/api/v1/admin/social-posts', { params }),
  show:        (id: number)              => api.get(`/api/v1/admin/social-posts/${id}`),
  create:      (data: object)            => api.post('/api/v1/admin/social-posts', data),
  fromArticle: (articleId: number, data: object) =>
                                            api.post(`/api/v1/admin/social-posts/from-article/${articleId}`, data),
  cancel:      (id: number)              => api.post(`/api/v1/admin/social-posts/${id}/cancel`),
  retry:       (id: number)              => api.post(`/api/v1/admin/social-posts/${id}/retry`),
  destroy:     (id: number)              => api.delete(`/api/v1/admin/social-posts/${id}`),
};
