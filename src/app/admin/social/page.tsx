'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, StatusBadge, Card,
  Modal, ConfirmModal, EmptyState, Select, Textarea, Input,
} from '@/components/admin/ui/AdminUI';
import { RefreshIcon, TrashIcon, PlusIcon, ExternalLinkIcon } from '@/components/admin/ui/Icons';
import { adminSocialAccountsApi, adminSocialPostsApi } from '@/lib/adminApi';

// ── Types ──────────────────────────────────────────────────────────────────
interface SocialAccount {
  id: number;
  platform: string;
  account_name: string;
  platform_username: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  deactivation_reason: string | null;
  token_expires_soon: boolean;
  last_used_at: string | null;
}

interface SocialPost {
  id: number;
  platform: string;
  status: string;
  post_type: string;
  content_text: string | null;
  link_url: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  platform_post_url: string | null;
  attempt_count: number;
  error_message: string | null;
  can_retry: boolean;
  created_at: string;
  account: { id: number; account_name: string; platform: string } | null;
  article: { id: number; slug: string; title: string } | null;
  created_by: string | null;
}

interface FbPage {
  id: string;
  name: string;
  access_token: string;
  category: string | null;
  picture_url: string | null;
}

// ── Platform helpers ───────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  facebook:  'bg-blue-600',
  instagram: 'bg-gradient-to-br from-pink-500 to-purple-600',
  youtube:   'bg-red-600',
  tiktok:    'bg-gray-900',
  twitter:   'bg-sky-500',
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram',
  youtube: 'YouTube', tiktok: 'TikTok', twitter: 'Twitter / X',
};

const STATUS_COLORS: Record<string, string> = {
  published:  'bg-green-100 text-green-800',
  queued:     'bg-blue-100 text-blue-800',
  publishing: 'bg-amber-100 text-amber-800',
  scheduled:  'bg-purple-100 text-purple-800',
  failed:     'bg-red-100 text-red-800',
  cancelled:  'bg-gray-100 text-gray-500',
  draft:      'bg-gray-100 text-gray-600',
};

function PlatformPill({ platform }: { platform: string }) {
  const color = PLATFORM_COLORS[platform] ?? 'bg-gray-500';
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold text-white px-2.5 py-0.5 rounded-full ${color}`}>
      {PLATFORM_LABELS[platform] ?? platform}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${color}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ── Page picker modal (shown after Facebook OAuth redirect back) ───────────
function FbPagePickerModal({
  pages,
  onClose,
  onSaved,
}: {
  pages: FbPage[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (page: FbPage) => {
    setSaving(page.id);
    setError('');
    try {
      await adminSocialAccountsApi.saveFacebookPage({
        page_id:      page.id,
        page_name:    page.name,
        access_token: page.access_token,
        picture_url:  page.picture_url,
        category:     page.category,
      });
      qc.invalidateQueries({ queryKey: ['social-accounts'] });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save page. Please try again.');
      setSaving(null);
    }
  };

  return (
    <Modal open={true} title="Choose a Facebook Page" onClose={onClose}>
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">{error}</div>
        )}
        <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
          Select the Facebook Page to connect to CNI News:
        </p>
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => handleSave(page)}
            disabled={!!saving}
            className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left disabled:opacity-60"
          >
            {page.picture_url ? (
              <img src={page.picture_url} alt="" className="w-10 h-10 rounded-full shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{page.name[0]}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
                {page.name}
              </p>
              {page.category && (
                <p className="text-xs text-gray-400">{page.category}</p>
              )}
            </div>
            {saving === page.id ? (
              <span className="text-xs text-blue-600 shrink-0">Connecting...</span>
            ) : (
              <span className="text-xs text-gray-400 shrink-0">Select →</span>
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ── Connect platform modal ─────────────────────────────────────────────────
function ConnectPlatformModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError]     = useState('');

  const handleFacebook = async () => {
    setLoading('facebook');
    setError('');
    try {
      const res = await adminSocialAccountsApi.connectFacebook();
      if (!res.data?.redirect_url) {
        setError('No redirect URL returned. Check FACEBOOK_APP_ID in .env');
        setLoading(null);
        return;
      }
      window.location.href = res.data.redirect_url;
    } catch (err: any) {
      const status = err.response?.status ?? 'no response';
      const msg    = err.response?.data?.error ?? err.message ?? 'Unknown error';
      setError(`Error ${status}: ${msg}`);
      setLoading(null);
    }
  };

  const handleYouTube = async () => {
    setLoading('youtube');
    setError('');
    try {
      const res = await adminSocialAccountsApi.connectYouTube();
      if (!res.data?.redirect_url) {
        setError('No redirect URL returned. Check YOUTUBE_CLIENT_ID in .env');
        setLoading(null);
        return;
      }
      window.location.href = res.data.redirect_url;
    } catch (err: any) {
      const status = err.response?.status ?? 'no response';
      const msg    = err.response?.data?.error ?? err.message ?? 'Unknown error';
      setError(`Error ${status}: ${msg}`);
      setLoading(null);
    }
  };

  return (
    <Modal open={true} title="Connect Social Account" onClose={onClose}>
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Facebook */}
        <button onClick={handleFacebook} disabled={!!loading}
          className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-60 group">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 group-hover:text-blue-700" style={{ fontFamily: 'var(--font-inter)' }}>
              {loading === 'facebook' ? 'Redirecting to Facebook...' : 'Connect Facebook Page'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Also enables Instagram posting</p>
          </div>
        </button>

        {/* YouTube */}
        <button onClick={handleYouTube} disabled={!!loading}
          className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-left disabled:opacity-60 group">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 group-hover:text-red-700" style={{ fontFamily: 'var(--font-inter)' }}>
              {loading === 'youtube' ? 'Redirecting to Google...' : 'Connect YouTube Channel'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Upload videos and sync channel feed</p>
          </div>
        </button>

        {/* Instagram info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
            <span className="font-semibold text-gray-700">Instagram</span> — connected automatically via Facebook above
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ── Post Composer ──────────────────────────────────────────────────────────
function ComposerModal({
  accounts,
  onClose,
}: {
  accounts: SocialAccount[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [text, setText]               = useState('');
  const [linkUrl, setLinkUrl]         = useState('');
  const [mediaUrl, setMediaUrl]       = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError]             = useState('');

  const activeAccounts = accounts.filter(a => a.is_active);
  const twitterSelected = activeAccounts.some(a => selectedIds.includes(a.id) && a.platform === 'twitter');
  const instagramSelected = activeAccounts.some(a => selectedIds.includes(a.id) && a.platform === 'instagram');

  const toggleAccount = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const mutation = useMutation({
    mutationFn: () => adminSocialPostsApi.create({
      account_ids:  selectedIds,
      text:         text || undefined,
      link_url:     linkUrl || undefined,
      media_url:    mediaUrl || undefined,
      scheduled_at: scheduledAt || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-posts'] });
      qc.invalidateQueries({ queryKey: ['social-stats'] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.error ?? 'Failed to create post.'),
  });

  const charCount = text.length;
  const overLimit = twitterSelected && charCount > 256;

  return (
    <Modal open={true} title="Create Social Post" onClose={onClose}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">{error}</div>
        )}

        {/* Account selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
            style={{ fontFamily: 'var(--font-inter)' }}>Post to</label>
          {activeAccounts.length === 0 ? (
            <p className="text-sm text-gray-400">No active accounts. Connect one in the Accounts tab first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeAccounts.map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleAccount(acc.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    selectedIds.includes(acc.id)
                      ? 'border-cni-blue bg-cni-blue text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{PLATFORM_LABELS[acc.platform]}</span>
                  <span className="opacity-60">· {acc.account_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-inter)' }}>Text</label>
            {twitterSelected && (
              <span className={`text-xs ${overLimit ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {charCount}/256 Twitter limit
              </span>
            )}
          </div>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            placeholder="What's the story?"
            className={overLimit ? 'border-red-400' : ''}
          />
        </div>

        {/* Link + Media */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Link URL"
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://cninews.co.uk/..."
          />
          <div>
            <Input
              label="Image / Video URL"
              type="url"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder="https://..."
            />
            {instagramSelected && !mediaUrl && (
              <p className="text-xs text-amber-600 mt-1">⚠ Instagram requires an image or video URL</p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <Input
          label="Schedule for later (leave empty to post now)"
          type="datetime-local"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || selectedIds.length === 0 || (!text && !mediaUrl) || overLimit}
          >
            {mutation.isPending ? 'Posting...' : scheduledAt ? '📅 Schedule' : '🚀 Post Now'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── YouTube channel confirm modal ──────────────────────────────────────────
function YtChannelConfirmModal({
  channel,
  onClose,
  onSaved,
}: {
  channel: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await adminSocialAccountsApi.saveYouTubeChannel({
        channel_id:           channel.channel_id,
        channel_name:         channel.channel_name,
        access_token:         channel.access_token,
        refresh_token:        channel.refresh_token,
        expires_in:           channel.expires_in,
        channel_handle:       channel.channel_handle,
        thumbnail_url:        channel.thumbnail_url,
        uploads_playlist_id:  channel.uploads_playlist_id,
      });
      qc.invalidateQueries({ queryKey: ['social-accounts'] });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message ?? 'Failed to save channel');
      setSaving(false);
    }
  };

  return (
    <Modal open={true} title="Connect YouTube Channel" onClose={onClose}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">{error}</div>
        )}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {channel.thumbnail_url && (
            <img src={channel.thumbnail_url} alt="" className="w-14 h-14 rounded-full shrink-0" />
          )}
          <div>
            <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
              {channel.channel_name}
            </p>
            {channel.channel_handle && (
              <p className="text-sm text-gray-500">{channel.channel_handle}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">ID: {channel.channel_id}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-inter)' }}>
          Connect this YouTube channel to CNI News? You'll be able to post videos and sync your channel feed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Connecting...' : '✓ Connect Channel'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SocialHubPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <SocialHubInner />
    </Suspense>
  );
}

function SocialHubInner() {
  const qc           = useQueryClient();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab]         = useState<'posts' | 'accounts'>('posts');
  const [statusFilter, setStatusFilter]   = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [composerOpen, setComposerOpen]   = useState(false);
  const [connectOpen, setConnectOpen]     = useState(false);
  const [fbPages, setFbPages]             = useState<FbPage[] | null>(null);
  const [ytChannelData, setYtChannelData] = useState<any | null>(null);
  const [disconnectId, setDisconnectId]   = useState<number | null>(null);
  const [page, setPage]                   = useState(1);
  const [oauthError, setOauthError]       = useState('');

  // ── Handle OAuth redirect back from Facebook ──────────────────────────
  useEffect(() => {
    const fbPagesParam = searchParams.get('fb_pages');
    const fbError      = searchParams.get('fb_error');
    const ytChannel    = searchParams.get('yt_channel');
    const ytError      = searchParams.get('yt_error');

    if (fbPagesParam) {
      try {
        const decoded = JSON.parse(atob(fbPagesParam));
        setFbPages(decoded);
        setActiveTab('accounts');
      } catch {
        setOauthError('Invalid response from Facebook. Please try connecting again.');
      }
      router.replace('/admin/social', { scroll: false });
    }

    if (fbError) {
      setOauthError(decodeURIComponent(fbError));
      setActiveTab('accounts');
      router.replace('/admin/social', { scroll: false });
    }

    if (ytChannel) {
      try {
        const decoded = JSON.parse(atob(ytChannel));
        setYtChannelData(decoded);
        setActiveTab('accounts');
      } catch {
        setOauthError('Invalid response from Google. Please try connecting again.');
      }
      router.replace('/admin/social', { scroll: false });
    }

    if (ytError) {
      setOauthError(decodeURIComponent(ytError));
      setActiveTab('accounts');
      router.replace('/admin/social', { scroll: false });
    }
  }, [searchParams, router]);

  // ── Queries ───────────────────────────────────────────────────────────
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn:  () => adminSocialAccountsApi.list().then(r => r.data.data as SocialAccount[]),
    staleTime: 30000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['social-stats'],
    queryFn:  () => adminSocialPostsApi.stats().then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['social-posts', { status: statusFilter, platform: platformFilter, page }],
    queryFn:  () => adminSocialPostsApi.list({
      status:   statusFilter   || undefined,
      platform: platformFilter || undefined,
      page,
      per_page: 20,
    }).then(r => r.data),
    placeholderData: (prev: any) => prev,
    refetchInterval: 20000,
  });

  const accounts = accountsData ?? [];
  const posts: SocialPost[] = postsData?.data ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────
  const validateMutation = useMutation({
    mutationFn: (id: number) => adminSocialAccountsApi.validate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-accounts'] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: number) => adminSocialAccountsApi.disconnect(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-accounts'] });
      setDisconnectId(null);
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: number) => adminSocialPostsApi.retry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-posts'] });
      qc.invalidateQueries({ queryKey: ['social-stats'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => adminSocialPostsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-posts'] }),
  });

  return (
    <AdminShell>
      <PageHeader
        title="Social Hub"
        subtitle="Manage all social media accounts and posts"
        actions={
          <Button variant="primary" size="sm" onClick={() => setComposerOpen(true)}>
            <PlusIcon /> New Post
          </Button>
        }
      />

      {/* OAuth error banner */}
      {oauthError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md flex items-start justify-between">
          <span>⚠ {oauthError}</span>
          <button onClick={() => setOauthError('')} className="ml-3 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Published',  value: statsData?.counts?.published  ?? 0, color: 'text-green-600'  },
          { label: 'Queued',     value: statsData?.counts?.queued     ?? 0, color: 'text-blue-600'   },
          { label: 'Scheduled',  value: statsData?.counts?.scheduled  ?? 0, color: 'text-purple-600' },
          { label: 'Failed',     value: statsData?.counts?.failed     ?? 0, color: 'text-red-600'    },
          { label: 'Publishing', value: statsData?.counts?.publishing ?? 0, color: 'text-amber-600'  },
        ].map(s => (
          <Card key={s.label} className="p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: 'var(--font-inter)' }}>{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide" style={{ fontFamily: 'var(--font-inter)' }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {(['posts', 'accounts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-cni-blue text-cni-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {tab === 'accounts' ? `Accounts (${accounts.length})` : 'Post History'}
          </button>
        ))}
      </div>

      {/* ── Posts tab ──────────────────────────────────────────────────── */}
      {activeTab === 'posts' && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select label="" value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'queued',     label: 'Queued'     },
                { value: 'publishing', label: 'Publishing' },
                { value: 'published',  label: 'Published'  },
                { value: 'scheduled',  label: 'Scheduled'  },
                { value: 'failed',     label: 'Failed'     },
                { value: 'cancelled',  label: 'Cancelled'  },
              ]}
              className="w-40"
            />
            <Select label="" value={platformFilter}
              onChange={e => { setPlatformFilter(e.target.value); setPage(1); }}
              options={[
                { value: '',          label: 'All platforms' },
                { value: 'facebook',  label: 'Facebook'      },
                { value: 'instagram', label: 'Instagram'     },
                { value: 'youtube',   label: 'YouTube'       },
                { value: 'tiktok',    label: 'TikTok'        },
                { value: 'twitter',   label: 'Twitter / X'   },
              ]}
              className="w-40"
            />
            <button onClick={() => qc.invalidateQueries({ queryKey: ['social-posts'] })}
              className="p-2 text-gray-400 hover:text-gray-700 transition-colors" title="Refresh">
              <RefreshIcon />
            </button>
          </div>

          {postsLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts yet"
              description="Create your first social post using the New Post button above, or share an article from the Articles section."
              action={<Button variant="primary" size="sm" onClick={() => setComposerOpen(true)}><PlusIcon /> New Post</Button>}
            />
          ) : (
            <div className="space-y-2">
              {posts.map(post => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1.5 shrink-0 w-28">
                      <PlatformPill platform={post.platform} />
                      <StatusPill status={post.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {post.content_text && (
                        <p className="text-sm text-gray-800 line-clamp-2 mb-1.5"
                          style={{ fontFamily: 'var(--font-inter)' }}>
                          {post.content_text}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400"
                        style={{ fontFamily: 'var(--font-inter)' }}>
                        {post.article && (
                          <span>📰 {post.article.title}</span>
                        )}
                        {post.account && <span>→ {post.account.account_name}</span>}
                        {post.scheduled_at && post.status !== 'published' && (
                          <span className="text-purple-600">🕐 {format(new Date(post.scheduled_at), 'd MMM HH:mm')}</span>
                        )}
                        {post.published_at && (
                          <span className="text-green-600">✓ {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
                        )}
                        {post.error_message && (
                          <span className="text-red-500 max-w-xs truncate" title={post.error_message}>
                            ✗ {post.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {post.platform_post_url && (
                        <a href={post.platform_post_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors" title="View post">
                          <ExternalLinkIcon />
                        </a>
                      )}
                      {post.can_retry && (
                        <button
                          onClick={() => retryMutation.mutate(post.id)}
                          disabled={retryMutation.isPending}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                          style={{ fontFamily: 'var(--font-inter)' }}
                        >
                          Retry
                        </button>
                      )}
                      {['queued', 'scheduled', 'failed'].includes(post.status) && (
                        <button
                          onClick={() => cancelMutation.mutate(post.id)}
                          disabled={cancelMutation.isPending}
                          className="text-xs font-semibold text-gray-400 hover:text-red-600 px-2.5 py-1 border border-gray-200 rounded-md hover:border-red-300 transition-colors"
                          style={{ fontFamily: 'var(--font-inter)' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {postsData?.meta && postsData.meta.last_page > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-inter)' }}>
                    Showing {postsData.meta.from}–{postsData.meta.to} of {postsData.meta.total}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                    <Button variant="ghost" size="sm" disabled={page >= postsData.meta.last_page} onClick={() => setPage(p => p + 1)}>Next →</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Accounts tab ───────────────────────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button variant="primary" size="sm" onClick={() => setConnectOpen(true)}>
              <PlusIcon /> Connect Account
            </Button>
          </div>

          {accountsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              title="No accounts connected"
              description="Connect your Facebook Page to start publishing. Instagram is enabled automatically through the same connection."
              action={
                <Button variant="primary" size="sm" onClick={() => setConnectOpen(true)}>
                  <PlusIcon /> Connect Facebook Page
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {accounts.map(account => (
                <Card key={account.id} className={`p-4 ${!account.is_active ? 'border-red-200 bg-red-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                      {account.profile_picture_url ? (
                        <img src={account.profile_picture_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-gray-300">{account.account_name[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PlatformPill platform={account.platform} />
                        <span className="font-semibold text-sm text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
                          {account.account_name}
                        </span>
                        {!account.is_active && (
                          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            ⚠ Reconnect needed
                          </span>
                        )}
                      </div>
                      {account.deactivation_reason && (
                        <p className="text-xs text-red-600 mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
                          {account.deactivation_reason}
                        </p>
                      )}
                      {account.last_used_at && (
                        <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>
                          Last used {formatDistanceToNow(new Date(account.last_used_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!account.is_active ? (
                        <button
                          onClick={() => setConnectOpen(true)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                          style={{ fontFamily: 'var(--font-inter)' }}
                        >
                          Reconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => validateMutation.mutate(account.id)}
                          disabled={validateMutation.isPending}
                          className="text-xs font-semibold text-gray-500 hover:text-blue-600 px-3 py-1.5 border border-gray-200 rounded-md hover:border-blue-300 transition-colors"
                          style={{ fontFamily: 'var(--font-inter)' }}
                        >
                          <RefreshIcon className="w-3 h-3 inline mr-1" />
                          Test token
                        </button>
                      )}
                      <button
                        onClick={() => setDisconnectId(account.id)}
                        className="text-xs font-semibold text-gray-400 hover:text-red-600 px-3 py-1.5 border border-gray-200 rounded-md hover:border-red-300 transition-colors"
                        style={{ fontFamily: 'var(--font-inter)' }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {composerOpen && (
        <ComposerModal accounts={accounts} onClose={() => setComposerOpen(false)} />
      )}
      {connectOpen && (
        <ConnectPlatformModal onClose={() => setConnectOpen(false)} />
      )}
      {fbPages && (
        <FbPagePickerModal
          pages={fbPages}
          onClose={() => setFbPages(null)}
          onSaved={() => { setFbPages(null); setActiveTab('accounts'); }}
        />
      )}
      {ytChannelData && (
        <YtChannelConfirmModal
          channel={ytChannelData}
          onClose={() => setYtChannelData(null)}
          onSaved={() => { setYtChannelData(null); setActiveTab('accounts'); }}
        />
      )}
      {disconnectId !== null && (
        <ConfirmModal
          open={disconnectId !== null}
          title="Disconnect account"
          message="This removes the account and its stored token. Pending posts will be cancelled. Are you sure?"
          confirmLabel="Disconnect"
          variant="danger"
          onConfirm={() => disconnectMutation.mutate(disconnectId!)}
          onClose={() => setDisconnectId(null)}
        />
      )}
    </AdminShell>
  );
}
