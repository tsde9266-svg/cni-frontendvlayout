'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { adminMediaApi } from '@/lib/adminApi';

interface MediaItem { id: number; url: string; alt: string | null; }

interface FeaturedImageUploaderProps {
  value:    MediaItem | null;
  onChange: (media: MediaItem | null) => void;
}

export function FeaturedImageUploader({ value, onChange }: FeaturedImageUploaderProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('alt_text', file.name.replace(/\.[^.]+$/, ''));
      const res = await adminMediaApi.upload(fd);
      const m   = res.data.data ?? res.data;
      onChange({ id: m.id, url: m.original_url ?? m.url, alt: m.alt_text ?? '' });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <div className="relative w-full aspect-video bg-gray-100 overflow-hidden rounded-md">
            <Image src={value.url} alt={value.alt ?? ''} fill className="object-cover" unoptimized />
          </div>
          <button
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 bg-black/60 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-md cursor-pointer transition-colors ${dragOver ? 'border-cni-blue bg-cni-blue/5' : 'border-gray-300 hover:border-cni-blue hover:bg-gray-50'}`}
        >
          {uploading ? (
            <span className="text-xs font-ui text-gray-400 animate-pulse">Uploading…</span>
          ) : (
            <>
              <span className="text-2xl text-gray-300 mb-1">↑</span>
              <span className="text-xs font-ui text-gray-400">Click or drag image here</span>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
      />
    </div>
  );
}

interface GalleryUploaderProps {
  value:    MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export function GalleryUploader({ value, onChange }: GalleryUploaderProps) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList) => {
    setUploading(true);
    try {
      const results: MediaItem[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('alt_text', file.name.replace(/\.[^.]+$/, ''));
        const res = await adminMediaApi.upload(fd);
        const m   = res.data.data ?? res.data;
        results.push({ id: m.id, url: m.original_url ?? m.url, alt: m.alt_text ?? '' });
      }
      onChange([...value, ...results]);
    } finally {
      setUploading(false);
    }
  };

  const remove = (id: number) => onChange(value.filter(m => m.id !== id));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {value.map((img, idx) => (
            <div key={img.id} className="relative group">
              <div className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                <Image src={img.url} alt={img.alt ?? ''} fill className="object-cover" unoptimized />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button onClick={() => move(idx, -1)} disabled={idx === 0}
                  className="text-white text-xs bg-black/50 rounded px-1.5 py-0.5 disabled:opacity-30">←</button>
                <button onClick={() => remove(img.id)}
                  className="text-white text-xs bg-cni-red/80 rounded px-1.5 py-0.5">✕</button>
                <button onClick={() => move(idx, 1)} disabled={idx === value.length - 1}
                  className="text-white text-xs bg-black/50 rounded px-1.5 py-0.5 disabled:opacity-30">→</button>
              </div>
              {idx === 0 && (
                <span className="absolute top-0.5 left-0.5 text-[9px] bg-cni-blue text-white px-1 rounded font-ui">Cover</span>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full text-xs font-ui text-cni-blue border border-dashed border-cni-blue/40 rounded-md py-2 hover:bg-cni-blue/5 transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : '+ Add images'}
      </button>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) upload(e.target.files); e.target.value = ''; }}
      />

      {value.length > 0 && (
        <p className="text-[10px] font-ui text-gray-400">
          {value.length} image{value.length !== 1 ? 's' : ''} · hover to reorder or remove
        </p>
      )}
    </div>
  );
}
