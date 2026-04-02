'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Input, Select, Textarea, Button, Toggle, Card,
  StatusBadge, ConfirmModal,
} from '@/components/admin/ui/AdminUI';
import { adminArticlesApi, adminCategoriesApi, adminTagsApi, adminSocialAccountsApi, adminSocialPostsApi } from '@/lib/adminApi';
import { categoriesApi } from '@/lib/api';
import api from '@/lib/api';
import clsx from 'clsx';
// import { clsx } from 'clsx';

// ── Types local to this form ───────────────────────────────────────────────
interface Translation {
  language_id:     number;
  title:           string;
  subtitle:        string;
  summary:         string;
  body:            string;
  seo_title:       string;
  seo_description: string;
}

interface ArticleFormData {
  type:                    string;
  main_category_id:        number | '';
  featured_image_media_id: number | null;
  is_breaking:             boolean;
  is_featured:             boolean;
  allow_comments:          boolean;
  scheduled_at:            string;
  tag_ids:                 number[];
  language_id:             number;
  translations:            Record<number, Translation>;
}

const EMPTY_TRANSLATION = (): Translation => ({
  language_id: 1, title: '', subtitle: '',
  summary: '', body: '', seo_title: '', seo_description: '',
});

const ARTICLE_TYPES = ['news','opinion','interview','analysis','bulletin','sponsored'];

interface Props {
  /** If provided, editing an existing article. If null, creating new. */
  articleId?: number;
}

export default function ArticleForm({ articleId }: Props) {
  const router = useRouter();
  const qc     = useQueryClient();
  const isEdit = !!articleId;

  // ── Languages ─────────────────────────────────────────────────────────
  const { data: languages } = useQuery({
    queryKey: ['languages'],
    queryFn:  () => api.get('/api/v1/languages').then(r => r.data.data ?? [
      { id: 1, code: 'en', name: 'English', is_rtl: false },
      { id: 2, code: 'ur', name: 'اردو', is_rtl: true },
      { id: 3, code: 'pa', name: 'پنجابی', is_rtl: true },
      { id: 4, code: 'mr', name: 'Mirpuri', is_rtl: true },
    ]),
    staleTime: Infinity,
  });

  // ── Categories ────────────────────────────────────────────────────────
  const { data: categories } = useQuery({
    queryKey: ['admin-categories-simple'],
    queryFn:  () => categoriesApi.list('en').then(r => r.data.data ?? []),
    staleTime: 5 * 60_000,
  });

  // ── Tags ──────────────────────────────────────────────────────────────
  const { data: allTags } = useQuery({
    queryKey: ['admin-tags-simple'],
    queryFn:  () => adminTagsApi.list({ per_page: 200 }).then(r => r.data.data ?? []),
    staleTime: 5 * 60_000,
  });

  // ── Load existing article ─────────────────────────────────────────────
  const { data: existingData } = useQuery({
    queryKey: ['admin-article', articleId],
    queryFn:  () => adminArticlesApi.show(articleId!).then(r => r.data.data),
    enabled:  isEdit,
  });

  // ── Form state ─────────────────────────────────────────────────────────
  const [activeLangId, setActiveLangId] = useState(1);
  const [form, setForm] = useState<ArticleFormData>({
    type: 'news', main_category_id: '',
    featured_image_media_id: null,
    is_breaking: false, is_featured: false,
    allow_comments: true, scheduled_at: '',
    tag_ids: [], language_id: 1,
    translations: { 1: EMPTY_TRANSLATION() },
  });
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [discardOpen,setDiscardOpen]= useState(false);
  const [autoSaved,  setAutoSaved]  = useState(false);
  const [tagInput,   setTagInput]   = useState('');

  // Populate from existing article
  useEffect(() => {
    if (!existingData) return;
    const translMap: Record<number, Translation> = {};
    (existingData.translations ?? []).forEach((t: Translation) => {
      translMap[t.language_id] = {
        language_id:     t.language_id,
        title:           t.title ?? '',
        subtitle:        t.subtitle ?? '',
        summary:         t.summary ?? '',
        body:            t.body ?? '',
        seo_title:       t.seo_title ?? '',
        seo_description: t.seo_description ?? '',
      };
    });
    if (!translMap[1]) translMap[1] = EMPTY_TRANSLATION();

    setForm({
      type:                    existingData.type ?? 'news',
      main_category_id:        existingData.category_id ?? '',
      featured_image_media_id: existingData.featured_image?.id ?? null,
      is_breaking:             !!existingData.is_breaking,
      is_featured:             !!existingData.is_featured,
      allow_comments:          existingData.allow_comments ?? true,
      scheduled_at:            existingData.scheduled_at ?? '',
      tag_ids:                 (existingData.tags ?? []).map((t: {id:number}) => t.id),
      language_id:             1,
      translations:            translMap,
    });
  }, [existingData]);

  // ── Mutations ─────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload: object) =>
      isEdit
        ? adminArticlesApi.update(articleId!, payload)
        : adminArticlesApi.create(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-articles'] });
      if (!isEdit) {
        router.push(`/admin/articles/${res.data.data.id}/edit`);
      } else {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 3000);
      }
    },
    onError: (err: any) => {
      const apiErrors = err.response?.data?.errors ?? {};
      const flat: Record<string, string> = {};
      Object.entries(apiErrors).forEach(([k, v]: [string, any]) => {
        flat[k] = Array.isArray(v) ? v[0] : String(v);
      });
      setErrors(flat);
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => adminArticlesApi.publish(articleId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-articles'] });
      qc.invalidateQueries({ queryKey: ['admin-article', articleId] });
      // Auto-share if accounts selected
      if (shareOnSocial && selectedAccountIds.length > 0 && articleId) {
        adminSocialPostsApi.fromArticle(articleId, { account_ids: selectedAccountIds });
      }
    },
  });

  // ── Social sharing state ───────────────────────────────────────────────
  const [shareOnSocial, setShareOnSocial]       = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);

  const { data: socialAccounts } = useQuery({
    queryKey: ['social-accounts-active'],
    queryFn:  () => adminSocialAccountsApi.list().then(r =>
      (r.data.data as any[]).filter((a: any) => a.is_active)
    ),
    enabled: shareOnSocial, // only fetch when toggle is on
    staleTime: 60000,
  });

  const toggleAccountId = (id: number) =>
    setSelectedAccountIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const unpublishMutation = useMutation({
    mutationFn: () => adminArticlesApi.unpublish(articleId!),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-article', articleId] }),
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  const setTransl = (field: keyof Translation, value: string) => {
    setForm(f => ({
      ...f,
      translations: {
        ...f.translations,
        [activeLangId]: {
          ...(f.translations[activeLangId] ?? EMPTY_TRANSLATION()),
          [field]: value,
        },
      },
    }));
    if (errors[field]) setErrors(e => { const n = {...e}; delete n[field]; return n; });
  };

  const currentTransl = form.translations[activeLangId] ?? EMPTY_TRANSLATION();
  const isRtl = (languages ?? []).find((l: {id: number; is_rtl: boolean}) => l.id === activeLangId)?.is_rtl ?? false;

  const buildPayload = (extraStatus?: string) => ({
    type:                    form.type,
    main_category_id:        form.main_category_id || undefined,
    featured_image_media_id: form.featured_image_media_id || undefined,
    is_breaking:             form.is_breaking,
    is_featured:             form.is_featured,
    allow_comments:          form.allow_comments,
    scheduled_at:            form.scheduled_at || undefined,
    tag_ids:                 form.tag_ids,
    language_id:             activeLangId,
    // Spread active translation fields at root (API expects these at top level)
    title:           currentTransl.title,
    subtitle:        currentTransl.subtitle,
    summary:         currentTransl.summary,
    body:            currentTransl.body,
    seo_title:       currentTransl.seo_title,
    seo_description: currentTransl.seo_description,
    ...(extraStatus ? { status: extraStatus } : {}),
  });

  const handleSave = () => {
    setErrors({});
    saveMutation.mutate(buildPayload());
  };

  const addTag = (tagId: number) => {
    if (!form.tag_ids.includes(tagId)) {
      setForm(f => ({ ...f, tag_ids: [...f.tag_ids, tagId] }));
    }
  };

  const removeTag = (tagId: number) => {
    setForm(f => ({ ...f, tag_ids: f.tag_ids.filter(id => id !== tagId) }));
  };

  const status = existingData?.status ?? 'draft';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

      {/* ── Left: content editor ────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Language tabs */}
        {(languages ?? []).length > 1 && (
          <div className="flex items-center gap-1 border-b border-gray-200">
            {(languages ?? []).map((lang: {id: number; code: string; name: string}) => (
              <button
                key={lang.id}
                onClick={() => setActiveLangId(lang.id)}
                className={clsx(
                  'px-3 py-2 text-xs font-ui font-medium border-b-2 -mb-px transition-colors',
                  activeLangId === lang.id
                    ? 'border-cni-blue text-cni-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {lang.name}
                {form.translations[lang.id]?.title ? (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-400 inline-block" title="Has content" />
                ) : (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-gray-200 inline-block" title="Empty" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <div>
          <input
            type="text"
            value={currentTransl.title}
            onChange={e => setTransl('title', e.target.value)}
            placeholder="Article headline…"
            dir={isRtl ? 'rtl' : 'ltr'}
            className={clsx(
              'w-full font-ui text-xl font-semibold border-0 border-b-2 pb-2 bg-transparent',
              'focus:outline-none placeholder-gray-300',
              errors.title ? 'border-cni-red' : 'border-gray-200 focus:border-cni-blue',
            )}
          />
          {errors.title && <p className="text-xs text-cni-red mt-1">{errors.title}</p>}
        </div>

        {/* Subtitle */}
        <input
          type="text"
          value={currentTransl.subtitle}
          onChange={e => setTransl('subtitle', e.target.value)}
          placeholder="Sub-headline (optional)…"
          dir={isRtl ? 'rtl' : 'ltr'}
          className="w-full font-ui text-base border-0 border-b border-gray-100 pb-2 bg-transparent focus:outline-none focus:border-cni-blue placeholder-gray-300"
        />

        {/* Summary */}
        <Textarea
          label="Summary / standfirst"
          value={currentTransl.summary}
          onChange={e => setTransl('summary', e.target.value)}
          placeholder="Shown in article listings and search results…"
          rows={2}
          dir={isRtl ? 'rtl' : 'ltr'}
          error={errors.summary}
        />

        {/* Body */}
        <div className="space-y-1">
          <label className="block text-xs font-ui font-semibold text-gray-700">
            Body <span className="text-cni-red">*</span>
          </label>
          <textarea
            value={currentTransl.body}
            onChange={e => setTransl('body', e.target.value)}
            placeholder="Write article content here… HTML is supported."
            rows={18}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={clsx(
              'w-full text-sm font-body border rounded-md px-3 py-2.5 resize-y',
              'focus:outline-none focus:ring-2 focus:ring-cni-blue/30 focus:border-cni-blue',
              isRtl ? 'text-right' : '',
              errors.body ? 'border-cni-red' : 'border-gray-300',
            )}
          />
          {errors.body && <p className="text-xs text-cni-red">{errors.body}</p>}
          <p className="text-xs font-ui text-gray-400">
            {currentTransl.body.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        {/* SEO panel */}
        <details className="border border-gray-200 rounded-lg">
          <summary className="px-4 py-3 text-xs font-ui font-semibold text-gray-600 cursor-pointer hover:text-cni-blue list-none flex items-center justify-between">
            SEO settings
            <span className="text-gray-300">▾</span>
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-100">
            <Input
              label="SEO title"
              value={currentTransl.seo_title}
              onChange={e => setTransl('seo_title', e.target.value)}
              placeholder={currentTransl.title}
              maxLength={160}
              hint={`${currentTransl.seo_title.length}/160`}
            />
            <Textarea
              label="Meta description"
              value={currentTransl.seo_description}
              onChange={e => setTransl('seo_description', e.target.value)}
              placeholder={currentTransl.summary}
              rows={2}
              maxLength={320}
              hint={`${currentTransl.seo_description.length}/320`}
            />
          </div>
        </details>
      </div>

      {/* ── Right: settings sidebar ─────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Publish card */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-ui font-semibold text-gray-700 uppercase tracking-wide">Publish</h3>
            <StatusBadge status={status} />
          </div>

          {autoSaved && (
            <p className="text-xs font-ui text-green-600 mb-2">✓ Saved</p>
          )}

          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              loading={saveMutation.isPending}
              onClick={handleSave}
            >
              Save draft
            </Button>

            {isEdit && status !== 'published' && (
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                loading={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
              >
                Publish now
              </Button>
            )}

            {isEdit && status === 'published' && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center text-gray-500"
                loading={unpublishMutation.isPending}
                onClick={() => unpublishMutation.mutate()}
              >
                Unpublish
              </Button>
            )}
          </div>

          {/* Schedule */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Input
              label="Schedule publish"
              type="datetime-local"
              value={form.scheduled_at}
              onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
              hint="Leave blank to publish immediately"
            />
          </div>
        </Card>

        {/* Share on Social card — visible on new, draft, review, scheduled AND published */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-ui font-semibold text-gray-700 uppercase tracking-wide">
              Share on Social
            </h3>
            <Toggle
              checked={shareOnSocial}
              onChange={setShareOnSocial}
              label=""
            />
          </div>
          {shareOnSocial && (
            <div className="mt-2 space-y-2">
              {!socialAccounts || socialAccounts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No active accounts connected.{' '}
                  <a href="/admin/social" className="text-cni-blue hover:underline">
                    Connect one in Social Hub →
                  </a>
                </p>
              ) : (
                <>
                  {socialAccounts.map((acc: any) => (
                    <label key={acc.id}
                      className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedAccountIds.includes(acc.id)}
                        onChange={() => toggleAccountId(acc.id)}
                        className="rounded border-gray-300 text-cni-blue focus:ring-cni-blue"
                      />
                      <span className="text-xs text-gray-700 group-hover:text-gray-900"
                        style={{ fontFamily: 'var(--font-inter)' }}>
                        <span className="font-semibold capitalize">{acc.platform}</span>
                        <span className="text-gray-400"> · {acc.account_name}</span>
                      </span>
                    </label>
                  ))}

                  {selectedAccountIds.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 space-y-1.5">
                      {/* Already published — show Post Now button directly */}
                      {status === 'published' && isEdit ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full justify-center"
                          onClick={() => {
                            if (articleId) {
                              adminSocialPostsApi.fromArticle(articleId, {
                                account_ids: selectedAccountIds
                              }).then(() => {
                                setShareOnSocial(false);
                                setSelectedAccountIds([]);
                                alert('Post queued for ' + selectedAccountIds.length + ' platform(s)! Check Social Hub for status.');
                              }).catch((e: any) => {
                                alert('Error: ' + (e.response?.data?.error ?? e.message));
                              });
                            }
                          }}
                        >
                          🚀 Post to Social Now
                        </Button>
                      ) : (
                        <p className="text-[11px] text-green-600"
                          style={{ fontFamily: 'var(--font-inter)' }}>
                          ✓ Will post to {selectedAccountIds.length} platform{selectedAccountIds.length > 1 ? 's' : ''} when you publish
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        {/* Article settings */}
        <Card>
          <h3 className="text-xs font-ui font-semibold text-gray-700 uppercase tracking-wide mb-3">Settings</h3>
          <div className="space-y-3">
            <Select
              label="Type"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              options={ARTICLE_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
            <Select
              label="Category"
              value={form.main_category_id}
              onChange={e => setForm(f => ({ ...f, main_category_id: Number(e.target.value) || '' }))}
              options={(categories ?? []).map((c: {id:number; name:string}) => ({ value: c.id, label: c.name }))}
              placeholder="Select category…"
            />
            <Toggle
              checked={form.is_breaking}
              onChange={v => setForm(f => ({ ...f, is_breaking: v }))}
              label="Breaking news"
            />
            <Toggle
              checked={form.is_featured}
              onChange={v => setForm(f => ({ ...f, is_featured: v }))}
              label="Featured on homepage"
            />
            <Toggle
              checked={form.allow_comments}
              onChange={v => setForm(f => ({ ...f, allow_comments: v }))}
              label="Allow comments"
            />
          </div>
        </Card>

        {/* Tags */}
        <Card>
          <h3 className="text-xs font-ui font-semibold text-gray-700 uppercase tracking-wide mb-3">Tags</h3>

          {/* Selected tags */}
          {form.tag_ids.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tag_ids.map(tagId => {
                const tag = (allTags ?? []).find((t: {id:number; default_name:string}) => t.id === tagId);
                return (
                  <span key={tagId} className="inline-flex items-center gap-1 text-[11px] font-ui bg-cni-blue-light text-cni-blue px-2 py-0.5 rounded-full">
                    {tag?.default_name ?? tagId}
                    <button onClick={() => removeTag(tagId)} className="hover:text-cni-red">×</button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Tag search */}
          <div className="relative">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Search tags…"
              className="w-full text-xs font-ui border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cni-blue"
            />
            {tagInput && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-36 overflow-y-auto">
                {(allTags ?? [])
                  .filter((t: {id:number; default_name:string}) =>
                    t.default_name.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !form.tag_ids.includes(t.id)
                  )
                  .slice(0, 10)
                  .map((t: {id:number; default_name:string}) => (
                    <button
                      key={t.id}
                      className="w-full text-left px-3 py-1.5 text-xs font-ui text-gray-700 hover:bg-gray-50"
                      onClick={() => { addTag(t.id); setTagInput(''); }}
                    >
                      {t.default_name}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        </Card>

        {/* Discard */}
        {isEdit && (
          <button
            onClick={() => setDiscardOpen(true)}
            className="w-full text-xs font-ui text-gray-400 hover:text-cni-red text-center py-2 transition-colors"
          >
            Discard changes
          </button>
        )}
      </div>

      <ConfirmModal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => router.push('/admin/articles')}
        title="Discard changes"
        message="Any unsaved changes will be lost. Are you sure?"
        confirmLabel="Discard"
        variant="danger"
      />
    </div>
  );
}
