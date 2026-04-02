'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/hooks/useAuthStore';
import { categoriesApi } from '@/lib/api';
import api from '@/lib/api';
import type { Category } from '@/types';

export default function WritePage() {
  const router     = useRouter();
  const { user }   = useAuthStore();

  useEffect(() => {
    if (!user) router.push('/login?redirect=/write');
  }, [user, router]);

  const [form, setForm] = useState({
    title:           '',
    subtitle:        '',
    summary:         '',
    body:            '',
    main_category_id:'',
    language_id:     '1',
    type:            'news',
    allow_comments:  true,
    seo_title:       '',
    seo_description: '',
  });

  const [saving,      setSaving]      = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [savedId,     setSavedId]     = useState<number | null>(null);
  const [lastSaved,   setLastSaved]   = useState<Date | null>(null);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesApi.list().then(r => r.data.data as Category[]),
  });

  const set = (k: string, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  // ── Auto-save draft every 30s ─────────────────────────────────────────────
  useEffect(() => {
    if (!form.title.trim()) return;
    const timer = setInterval(() => { saveDraft(false); }, 30000);
    return () => clearInterval(timer);
  }, [form, savedId]);

  const saveDraft = async (showFeedback = true) => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        ...form,
        main_category_id: form.main_category_id ? parseInt(form.main_category_id) : undefined,
        language_id:      parseInt(form.language_id),
      };

      let res;
      if (savedId) {
        res = await api.patch(`/api/v1/articles/${savedId}`, payload);
      } else {
        res = await api.post('/api/v1/articles', payload);
        setSavedId(res.data.data.id);
      }

      setLastSaved(new Date());
      if (showFeedback) alert('Draft saved!');
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors ?? {};
      const flat: Record<string, string> = {};
      Object.entries(apiErrors).forEach(([k, v]: [string, any]) => {
        flat[k] = Array.isArray(v) ? v[0] : String(v);
      });
      setErrors(flat);
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    if (!savedId) {
      await saveDraft(false);
    }
    if (!savedId) return;

    setSubmitting(true);
    try {
      await api.post(`/api/v1/articles/${savedId}/submit`);
      router.push('/account?submitted=1');
    } catch {
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-site mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">

        {/* ── Main editor ─────────────────────────────────────────────── */}
        <div>
          {/* Auto-save indicator */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-headline text-2xl font-bold text-gray-900">Write Article</h1>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-xs font-ui text-gray-400">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => saveDraft(true)}
                disabled={saving}
                className="text-xs font-ui font-semibold px-3 py-1.5 border border-gray-300
                           text-gray-600 hover:border-cni-blue hover:text-cni-blue transition-colors
                           disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Article headline…"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full font-headline text-2xl font-bold border-0 border-b-2 border-gray-200
                         focus:border-cni-blue focus:outline-none pb-2 placeholder-gray-300"
            />
            {errors.title && <p className="text-xs text-cni-red font-ui mt-1">{errors.title}</p>}
          </div>

          {/* Subtitle */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Sub-headline (optional)…"
              value={form.subtitle}
              onChange={e => set('subtitle', e.target.value)}
              className="w-full font-body text-lg border-0 border-b border-gray-100
                         focus:border-cni-blue focus:outline-none pb-2 placeholder-gray-300"
            />
          </div>

          {/* Summary */}
          <div className="mb-4">
            <textarea
              placeholder="Brief summary / standfirst (shown in article listings)…"
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
              rows={2}
              className="w-full border border-gray-200 px-3 py-2 font-body text-sm
                         focus:outline-none focus:border-cni-blue placeholder-gray-400 resize-y"
            />
          </div>

          {/* Body */}
          <div className="mb-2">
            <label className="block text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Article Body *
            </label>
            <textarea
              placeholder="Write your article here…"
              value={form.body}
              onChange={e => set('body', e.target.value)}
              rows={20}
              className={`w-full border px-4 py-3 font-body text-base leading-relaxed
                         focus:outline-none focus:border-cni-blue resize-y
                         ${errors.body ? 'border-cni-red' : 'border-gray-200'}`}
            />
            {errors.body && <p className="text-xs text-cni-red font-ui mt-1">{errors.body}</p>}
            <p className="text-xs text-gray-400 font-ui mt-1">
              {form.body.split(/\s+/).filter(Boolean).length} words
              · HTML is supported
            </p>
          </div>
        </div>

        {/* ── Sidebar controls ────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Publish actions */}
          <div className="border-2 border-cni-blue p-4">
            <h3 className="font-ui font-bold text-sm text-gray-700 mb-3">Publish</h3>
            <div className="space-y-2">
              <button
                onClick={() => saveDraft(true)}
                disabled={saving}
                className="w-full text-sm font-ui font-semibold py-2 border border-gray-300
                           text-gray-700 hover:border-cni-blue hover:text-cni-blue
                           transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save as Draft'}
              </button>
              <button
                onClick={submitForReview}
                disabled={submitting || !form.title || !form.body}
                className="w-full btn-primary text-sm py-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </button>
            </div>
            <p className="text-xs text-gray-500 font-ui mt-2">
              {user?.permissions?.includes('article.publish')
                ? '✓ You can self-publish — use Submit to go straight to editor review, or publish directly from admin.'
                : 'Your article will be reviewed by an editor before publishing.'}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Category *
            </label>
            <select
              value={form.main_category_id}
              onChange={e => set('main_category_id', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm font-ui
                         focus:outline-none focus:border-cni-blue"
            >
              <option value="">Select category…</option>
              {cats?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.main_category_id && (
              <p className="text-xs text-cni-red font-ui mt-1">{errors.main_category_id}</p>
            )}
          </div>

          {/* Article type */}
          <div>
            <label className="block text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Type
            </label>
            <select
              value={form.type}
              onChange={e => set('type', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm font-ui
                         focus:outline-none focus:border-cni-blue"
            >
              {['news','opinion','interview','analysis','bulletin','sponsored']
                .map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Language
            </label>
            <select
              value={form.language_id}
              onChange={e => set('language_id', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm font-ui
                         focus:outline-none focus:border-cni-blue"
            >
              <option value="1">English</option>
              <option value="2">اردو (Urdu)</option>
              <option value="3">پنجابی (Punjabi)</option>
              <option value="4">Mirpuri</option>
            </select>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allow_comments"
              checked={form.allow_comments}
              onChange={e => set('allow_comments', e.target.checked)}
              className="accent-cni-blue"
            />
            <label htmlFor="allow_comments" className="text-sm font-ui text-gray-700">
              Allow comments
            </label>
          </div>

          {/* SEO */}
          <details className="border border-gray-200">
            <summary className="px-3 py-2 text-xs font-ui font-semibold text-gray-600 cursor-pointer hover:text-cni-blue">
              SEO Settings
            </summary>
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-xs font-ui text-gray-500 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={form.seo_title}
                  onChange={e => set('seo_title', e.target.value)}
                  placeholder={form.title}
                  maxLength={160}
                  className="w-full border border-gray-200 px-2 py-1.5 text-xs font-ui
                             focus:outline-none focus:border-cni-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-ui text-gray-500 mb-1">Meta Description</label>
                <textarea
                  value={form.seo_description}
                  onChange={e => set('seo_description', e.target.value)}
                  placeholder={form.summary}
                  maxLength={320}
                  rows={3}
                  className="w-full border border-gray-200 px-2 py-1.5 text-xs font-ui
                             focus:outline-none focus:border-cni-blue resize-none"
                />
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
