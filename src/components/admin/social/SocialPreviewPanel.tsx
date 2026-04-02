'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminSocialAccountsApi, adminSocialPostsApi, adminMediaApi } from '@/lib/adminApi';
import { Button } from '@/components/admin/ui/AdminUI';

const LIMITS: Record<string, number> = {
  facebook: 2000, instagram: 2200, twitter: 256, tiktok: 2200,
};

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2', instagram: '#E1306C',
  youtube: '#FF0000', tiktok: '#010101', twitter: '#000000',
};

interface Props {
  articleId?: number;
  articleTitle?: string;
  articleSummary?: string;
  articleUrl?: string;
  articleImageUrl?: string;
}

export default function SocialPreviewPanel({
  articleId,
  articleTitle = '',
  articleSummary = '',
  articleUrl = '',
  articleImageUrl,
}: Props) {
  const qc = useQueryClient();
  const [customText, setCustomText] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // YouTube-specific state
  const [ytTitle, setYtTitle] = useState(articleTitle);
  const [ytTags, setYtTags] = useState('CNI News, Pakistan, News');
  const [ytPrivacy, setYtPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [ytVideoUrl, setYtVideoUrl] = useState<string | null>(null);   // internal_path for backend
  const [ytVideoName, setYtVideoName] = useState<string | null>(null); // filename for display
  const [ytUploading, setYtUploading] = useState(false);
  const [ytUploadProgress, setYtUploadProgress] = useState(0);
  const ytTitleManual = useRef(false);

  useEffect(() => {
    if (!ytTitleManual.current) setYtTitle(articleTitle);
  }, [articleTitle]);

  const { data: accounts } = useQuery({
    queryKey: ['social-accounts-active'],
    queryFn: () => adminSocialAccountsApi.list().then(r =>
      (r.data.data as any[]).filter((a: any) => a.is_active)
    ),
    staleTime: 60000,
  });

  const activeAccounts = accounts ?? [];

  const autoText = (platform: string): string => {
    switch (platform) {
      case 'facebook':
        return `📰 ${articleTitle}\n\n${articleSummary}\n\n🔗 Read more: ${articleUrl}`;
      case 'instagram':
        return `${articleTitle}\n\n${articleSummary}\n\n🔗 Link in bio\n\n#CNINews #Pakistan #News`;
      case 'twitter':
        return `${articleTitle} ${articleUrl}`.slice(0, 279);
      case 'tiktok':
        return `${articleTitle} #CNINews #Pakistan #News #BreakingNews`;
      case 'youtube':
        return articleSummary ? `${articleSummary}\n\n${articleUrl}` : articleTitle;
      default:
        return articleTitle;
    }
  };

  const getText = (platform: string) =>
    customText[platform] !== undefined ? customText[platform] : autoText(platform);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setYtUploading(true);
    setYtUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', ytTitle || articleTitle);
      const res = await adminMediaApi.uploadVideo(fd, setYtUploadProgress);
      setYtVideoUrl(res.data.data.internal_path);  // local disk path for YouTubePublisher
      setYtVideoName(file.name);
    } catch {
      setResult({ ok: false, msg: 'Video upload failed. Check file size (max 500MB) and format (mp4/mov/webm).' });
    } finally {
      setYtUploading(false);
    }
  };

  const toggleId = (id: number, platform: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setActivePlatform(platform);
  };

  const handlePost = async () => {
    if (selectedIds.length === 0) return;
    setPosting(true);
    setResult(null);
    try {
      const platformOptions: Record<string, any> = {};
      activeAccounts
        .filter((a: any) => selectedIds.includes(a.id))
        .forEach((a: any) => {
          if (a.platform === 'youtube') {
            platformOptions.youtube = {
              title:          ytTitle || articleTitle,
              description:    getText('youtube'),
              tags:           ytTags.split(',').map((t: string) => t.trim()).filter(Boolean),
              privacy_status: ytPrivacy,
              ...(ytVideoUrl ? { media_url: ytVideoUrl } : {}),
            };
          } else if (customText[a.platform] !== undefined) {
            platformOptions[a.platform] = { text: customText[a.platform] };
          }
        });

      if (articleId) {
        await adminSocialPostsApi.fromArticle(articleId, {
          account_ids: selectedIds,
          platform_options: platformOptions,
        });
      } else {
        const platform = activeAccounts.find((a: any) => selectedIds[0] === a.id)?.platform ?? 'facebook';
        await adminSocialPostsApi.create({
          account_ids: selectedIds,
          text: getText(platform),
          link_url: articleUrl || undefined,
          media_url: articleImageUrl || undefined,
        });
      }
      qc.invalidateQueries({ queryKey: ['social-posts'] });
      setResult({ ok: true, msg: `✓ Queued for ${selectedIds.length} platform(s) — check Social Hub for status` });
      setSelectedIds([]);
      setActivePlatform(null);
    } catch (e: any) {
      setResult({ ok: false, msg: e.response?.data?.error ?? e.message ?? 'Failed to post' });
    } finally {
      setPosting(false);
    }
  };

  if (activeAccounts.length === 0) {
    return (
      <div className="text-xs text-gray-400 p-3 border border-dashed border-gray-200 rounded-lg text-center">
        No social accounts.{' '}
        <a href="/admin/social" className="text-cni-blue hover:underline">Connect one →</a>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Platform toggle buttons */}
      <div className="flex flex-wrap gap-1.5">
        {activeAccounts.map((acc: any) => {
          const active = selectedIds.includes(acc.id);
          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => toggleId(acc.id, acc.platform)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all capitalize ${
                active
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
              }`}
              style={active ? { backgroundColor: PLATFORM_COLORS[acc.platform] } : {}}
            >
              {acc.platform} · {acc.account_name}
            </button>
          );
        })}
      </div>

      {/* Text editor for active platform */}
      {activePlatform && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
            <span
              className="text-xs font-semibold capitalize"
              style={{ color: PLATFORM_COLORS[activePlatform], fontFamily: 'var(--font-inter)' }}
            >
              {activePlatform}
            </span>
            <span className="ml-auto text-[10px] text-gray-400">
              {getText(activePlatform).length}/{LIMITS[activePlatform] ?? 2000} chars
            </span>
            {customText[activePlatform] !== undefined && (
              <button
                onClick={() => setCustomText(p => { const n = { ...p }; delete n[activePlatform!]; return n; })}
                className="text-[10px] text-blue-500 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <textarea
            value={getText(activePlatform)}
            onChange={e => setCustomText(p => ({ ...p, [activePlatform!]: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none"
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          {/* YouTube-specific options */}
          {activePlatform === 'youtube' && (
            <div className="border-t border-gray-100 px-3 py-2 space-y-2">
              {/* Video upload */}
              <div>
                <label className="text-[10px] font-ui text-gray-500 uppercase tracking-wide block mb-1">Video File (mp4 / mov / webm)</label>
                {ytVideoUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">✓ {ytVideoName ?? 'Video uploaded'}</span>
                    <button type="button" onClick={() => { setYtVideoUrl(null); setYtVideoName(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
                  </div>
                ) : ytUploading ? (
                  <div className="text-xs text-gray-500">Uploading… {ytUploadProgress}%
                    <div className="mt-1 h-1 bg-gray-200 rounded"><div className="h-1 bg-red-500 rounded transition-all" style={{ width: `${ytUploadProgress}%` }} /></div>
                  </div>
                ) : (
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} className="text-xs text-gray-600" />
                )}
              </div>
              {/* Title */}
              <div>
                <label className="text-[10px] font-ui text-gray-500 uppercase tracking-wide block mb-1">Title <span className="text-gray-400">(max 100)</span></label>
                <input
                  type="text"
                  value={ytTitle}
                  onChange={e => { ytTitleManual.current = true; setYtTitle(e.target.value); }}
                  maxLength={100}
                  placeholder={articleTitle}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
              </div>
              {/* Tags */}
              <div>
                <label className="text-[10px] font-ui text-gray-500 uppercase tracking-wide block mb-1">Tags <span className="text-gray-400">(comma-separated)</span></label>
                <input
                  type="text"
                  value={ytTags}
                  onChange={e => setYtTags(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
              </div>
              {/* Privacy */}
              <div>
                <label className="text-[10px] font-ui text-gray-500 uppercase tracking-wide block mb-1">Privacy</label>
                <select
                  value={ytPrivacy}
                  onChange={e => setYtPrivacy(e.target.value as 'public' | 'unlisted' | 'private')}
                  className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {/* Link preview for Facebook/Twitter */}
          {['facebook', 'twitter'].includes(activePlatform) && articleUrl && (
            <div className="mx-3 mb-3 border border-gray-200 rounded overflow-hidden flex">
              {articleImageUrl && (
                <img src={articleImageUrl} alt="" className="w-20 h-16 object-cover shrink-0" />
              )}
              <div className="p-2 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase truncate">
                  {articleUrl.replace(/https?:\/\//, '').split('/')[0]}
                </p>
                <p className="text-xs font-semibold text-gray-900 line-clamp-1">{articleTitle}</p>
                <p className="text-[10px] text-gray-400 line-clamp-1">{articleSummary}</p>
              </div>
            </div>
          )}
          {/* Instagram image preview */}
          {activePlatform === 'instagram' && articleImageUrl && (
            <div className="mx-3 mb-3">
              <img src={articleImageUrl} alt="" className="w-full h-24 object-cover rounded" />
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <p className={`text-xs px-2 py-1.5 rounded ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          style={{ fontFamily: 'var(--font-inter)' }}>
          {result.msg}
        </p>
      )}

      {/* Post button */}
      {selectedIds.length > 0 && (
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center"
          onClick={handlePost}
          disabled={posting}
        >
          {posting
            ? 'Posting...'
            : `🚀 Post to ${selectedIds.length} platform${selectedIds.length > 1 ? 's' : ''} now`
          }
        </Button>
      )}
    </div>
  );
}
