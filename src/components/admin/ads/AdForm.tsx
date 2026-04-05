'use client';

/**
 * AdForm — reusable form for creating / editing a display ad.
 *
 * Features:
 *  - Upload image (jpeg/png/gif/webp) or video (mp4/webm/mov)
 *  - Canvas-based image crop (drag to select crop area)
 *  - Placement selector (leaderboard / sidebar / in-feed / all)
 *  - Campaign timeline (starts_at / ends_at date pickers)
 *  - Active toggle, display order, click URL, alt text
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAdsApi } from '@/lib/adminApi';

// ── Placement helpers ───────────────────────────────────────────────────────
const PLACEMENTS = [
  { value: 'all',         label: 'All placements' },
  { value: 'leaderboard', label: 'Leaderboard (top banner)' },
  { value: 'sidebar',     label: 'Sidebar' },
  { value: 'in-feed',     label: 'In-feed (between articles)' },
];

// Recommended pixel dimensions per placement
const PLACEMENT_DIMS: Record<string, string> = {
  all:         '728 × 90 px or 300 × 250 px',
  leaderboard: '728 × 90 px',
  sidebar:     '300 × 250 px',
  'in-feed':   '600 × 160 px',
};

// ── Crop state ──────────────────────────────────────────────────────────────
interface CropRect { x: number; y: number; w: number; h: number; }

const EMPTY_CROP: CropRect = { x: 0, y: 0, w: 100, h: 100 };

// ── Types ───────────────────────────────────────────────────────────────────
export interface AdFormData {
  id?:           number;
  title?:        string;
  click_url?:    string;
  alt_text?:     string;
  placement?:    string;
  is_active?:    boolean;
  display_order?: number;
  starts_at?:    string;
  ends_at?:      string;
  image_url?:    string;
  media_type?:   string;
  video_url?:    string;
}

interface Props {
  initialData?: AdFormData;
  onSaved?: () => void;
}

// ── Canvas crop helper ──────────────────────────────────────────────────────
async function cropImageToBlob(
  imgEl: HTMLImageElement,
  crop: CropRect,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = imgEl.naturalWidth  / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;

  canvas.width  = (crop.w / 100) * imgEl.width  * scaleX;
  canvas.height = (crop.h / 100) * imgEl.height * scaleY;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    imgEl,
    (crop.x / 100) * imgEl.width  * scaleX,
    (crop.y / 100) * imgEl.height * scaleY,
    canvas.width,
    canvas.height,
    0, 0,
    canvas.width,
    canvas.height,
  );

  return new Promise(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92),
  );
}

// ── Component ───────────────────────────────────────────────────────────────
export default function AdForm({ initialData, onSaved }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  // ── Form fields ───────────────────────────────────────────────────────────
  const [title,         setTitle]         = useState(initialData?.title         ?? '');
  const [clickUrl,      setClickUrl]      = useState(initialData?.click_url     ?? '');
  const [altText,       setAltText]       = useState(initialData?.alt_text      ?? '');
  const [placement,     setPlacement]     = useState(initialData?.placement     ?? 'all');
  const [isActive,      setIsActive]      = useState(initialData?.is_active     ?? true);
  const [displayOrder,  setDisplayOrder]  = useState(initialData?.display_order ?? 0);
  const [startsAt,      setStartsAt]      = useState(initialData?.starts_at     ? initialData.starts_at.slice(0, 16) : '');
  const [endsAt,        setEndsAt]        = useState(initialData?.ends_at       ? initialData.ends_at.slice(0, 16)   : '');

  // ── Media ─────────────────────────────────────────────────────────────────
  const [mediaType,   setMediaType]   = useState<'image' | 'video'>(
    (initialData?.media_type as 'image' | 'video') ?? 'image',
  );
  const [previewSrc,  setPreviewSrc]  = useState<string>(
    initialData?.video_url ?? initialData?.image_url ?? '',
  );
  const [rawFile,     setRawFile]     = useState<File | null>(null);
  const [cropMode,    setCropMode]    = useState(false);
  const [crop,        setCrop]        = useState<CropRect>(EMPTY_CROP);
  const [cropStart,   setCropStart]   = useState<{ x: number; y: number } | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  const imgRef    = useRef<HTMLImageElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // ── Saving ─────────────────────────────────────────────────────────────────
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // ── File pick ─────────────────────────────────────────────────────────────
  const onFile = (file: File) => {
    const isVid = file.type.startsWith('video/');
    setMediaType(isVid ? 'video' : 'image');
    setRawFile(file);
    setCroppedBlob(null);
    setCrop(EMPTY_CROP);
    setCropMode(false);
    setPreviewSrc(URL.createObjectURL(file));
  };

  // ── Drag-to-crop ──────────────────────────────────────────────────────────
  const onCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setCropStart({ x, y });
    setCrop({ x, y, w: 0, h: 0 });
  };

  const onCropMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropMode || !cropStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ex = Math.min(100, Math.max(0, ((e.clientX - rect.left)  / rect.width)  * 100));
    const ey = Math.min(100, Math.max(0, ((e.clientY - rect.top)   / rect.height) * 100));
    setCrop({
      x: Math.min(cropStart.x, ex),
      y: Math.min(cropStart.y, ey),
      w: Math.abs(ex - cropStart.x),
      h: Math.abs(ey - cropStart.y),
    });
  }, [cropMode, cropStart]);

  const onCropMouseUp = () => setCropStart(null);

  const applyCrop = async () => {
    if (!imgRef.current || crop.w < 2 || crop.h < 2) return;
    const blob = await cropImageToBlob(imgRef.current, crop);
    setCroppedBlob(blob);
    setPreviewSrc(URL.createObjectURL(blob));
    setCropMode(false);
  };

  const resetCrop = () => {
    setCrop(EMPTY_CROP);
    setCroppedBlob(null);
    setCropMode(false);
    if (rawFile) setPreviewSrc(URL.createObjectURL(rawFile));
    else setPreviewSrc(initialData?.video_url ?? initialData?.image_url ?? '');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('title',         title);
      fd.append('click_url',     clickUrl);
      fd.append('alt_text',      altText);
      fd.append('placement',     placement);
      fd.append('is_active',     isActive ? '1' : '0');
      fd.append('display_order', String(displayOrder));
      if (startsAt) fd.append('starts_at', startsAt);
      if (endsAt)   fd.append('ends_at',   endsAt);
      fd.append('media_type',    mediaType);

      if (croppedBlob) {
        fd.append('file', croppedBlob, 'ad-cropped.jpg');
      } else if (rawFile) {
        fd.append('file', rawFile);
      }

      if (isEdit) {
        await adminAdsApi.update(initialData!.id!, fd);
      } else {
        await adminAdsApi.create(fd);
      }

      if (onSaved) onSaved();
      else router.push('/admin/ads');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Save failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-cni-blue';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* ── Media upload ──────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-ui font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Ad Creative
        </label>

        {/* Drop zone */}
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
          className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-cni-blue hover:bg-gray-50 transition-colors"
        >
          <span className="text-2xl text-gray-300 mb-1">↑</span>
          <span className="text-xs font-ui text-gray-400">
            Click or drag — image (JPEG/PNG/GIF/WebP) or video (MP4/WebM)
          </span>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
        />

        {/* Preview + crop controls */}
        {previewSrc && (
          <div className="mt-3 space-y-2">

            {/* Image preview with optional crop overlay */}
            {mediaType === 'image' ? (
              <div className="relative inline-block w-full select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={previewSrc}
                  alt="Ad preview"
                  className="w-full max-h-64 object-contain rounded border border-gray-200 bg-gray-50"
                  draggable={false}
                />

                {cropMode && (
                  <div
                    className="absolute inset-0 cursor-crosshair"
                    onMouseDown={onCropMouseDown}
                    onMouseMove={onCropMouseMove}
                    onMouseUp={onCropMouseUp}
                    onMouseLeave={onCropMouseUp}
                  >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/40" />
                    {/* Crop selection */}
                    {crop.w > 0 && crop.h > 0 && (
                      <div
                        className="absolute border-2 border-white shadow-lg"
                        style={{
                          left:   `${crop.x}%`,
                          top:    `${crop.y}%`,
                          width:  `${crop.w}%`,
                          height: `${crop.h}%`,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <video
                src={previewSrc}
                controls
                className="w-full max-h-64 rounded border border-gray-200 bg-black"
              />
            )}

            {/* Crop toolbar (images only) */}
            {mediaType === 'image' && (
              <div className="flex items-center gap-2 flex-wrap">
                {!cropMode ? (
                  <button
                    type="button"
                    onClick={() => { setCropMode(true); setCrop(EMPTY_CROP); }}
                    className="text-xs font-ui px-3 py-1.5 border border-gray-300 rounded hover:border-cni-blue hover:text-cni-blue transition-colors"
                  >
                    ✂ Crop image
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={applyCrop}
                      disabled={crop.w < 2}
                      className="text-xs font-ui px-3 py-1.5 bg-cni-blue text-white rounded hover:bg-cni-blue-dark transition-colors disabled:opacity-40"
                    >
                      Apply crop
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropMode(false)}
                      className="text-xs font-ui px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {croppedBlob && (
                  <button
                    type="button"
                    onClick={resetCrop}
                    className="text-xs font-ui text-gray-400 hover:text-cni-red transition-colors"
                  >
                    Reset crop
                  </button>
                )}
                {croppedBlob && (
                  <span className="text-xs font-ui text-green-600">✓ Crop applied</span>
                )}
              </div>
            )}

            {/* Hint: recommended dimensions */}
            <p className="text-[10px] font-ui text-gray-400">
              Recommended for {PLACEMENTS.find(p => p.value === placement)?.label ?? placement}:{' '}
              {PLACEMENT_DIMS[placement]}
            </p>
          </div>
        )}

        {/* Existing image/video URL if no new file chosen */}
        {!rawFile && !previewSrc && (
          <div className="mt-2">
            <input
              type="url"
              placeholder="Or paste image/video URL"
              value={previewSrc}
              onChange={e => setPreviewSrc(e.target.value)}
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* ── Title ──────────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-ui font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Title <span className="text-cni-red">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Pak Mecca Meats — Summer Sale"
          className={inputCls}
        />
      </div>

      {/* ── Click URL ──────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-ui font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Click URL (destination)
        </label>
        <input
          type="url"
          value={clickUrl}
          onChange={e => setClickUrl(e.target.value)}
          placeholder="https://example.com"
          className={inputCls}
        />
      </div>

      {/* ── Alt text ───────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-ui font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Alt text (accessibility)
        </label>
        <input
          type="text"
          value={altText}
          onChange={e => setAltText(e.target.value)}
          placeholder="Describe the ad for screen readers"
          className={inputCls}
        />
      </div>

      {/* ── Placement ─────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-ui font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Placement <span className="text-cni-red">*</span>
        </label>
        <select
          required
          value={placement}
          onChange={e => setPlacement(e.target.value)}
          className={inputCls}
        >
          {PLACEMENTS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* ── Campaign timeline ──────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-ui font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Campaign Timeline
          <span className="ml-1.5 text-gray-400 normal-case font-normal">
            (leave blank = always show)
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-ui text-gray-500 mb-1">Start date / time</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={e => setStartsAt(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[10px] font-ui text-gray-500 mb-1">End date / time</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={e => setEndsAt(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Active + display order ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-ui font-semibold text-gray-700 uppercase tracking-wide">Active</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
        <div>
          <label className="block text-xs font-ui font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Display order
          </label>
          <input
            type="number"
            min={0}
            value={displayOrder}
            onChange={e => setDisplayOrder(Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <p className="text-sm text-cni-red bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* ── Submit ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-cni-blue text-white font-ui font-semibold text-sm px-6 py-2 rounded hover:bg-cni-blue-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create ad'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/ads')}
          className="text-sm font-ui text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
