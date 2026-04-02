'use client';
import Link from 'next/link';
import { format } from 'date-fns';
import type { LiveStream } from '@/types';

export default function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const embedUrl = stream.platform === 'youtube' && stream.platform_stream_id
    ? `https://www.youtube.com/embed/${stream.platform_stream_id}?autoplay=${stream.is_live ? 1 : 0}`
    : null;

  return (
    <div className="border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow">

      {/* Video embed or placeholder */}
      <div className="relative aspect-video bg-gray-900">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={stream.title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-5xl mb-3">📺</div>
              <p className="font-ui text-sm text-gray-300">{stream.platform.toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Live badge */}
        {stream.is_live && (
          <span className="absolute top-3 left-3 badge-breaking animate-pulse-red flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-headline text-base font-bold text-gray-900 mb-1 leading-snug">
          {stream.title}
        </h3>
        {stream.description && (
          <p className="text-sm font-body text-gray-600 line-clamp-2 mb-2">{stream.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs font-ui text-gray-500 uppercase tracking-wide">
            {stream.platform.replace('_', ' ')}
          </span>
          {!stream.is_live && stream.scheduled_start_at && (
            <span className="text-xs font-ui text-gray-500">
              {format(new Date(stream.scheduled_start_at), 'd MMM, HH:mm')}
            </span>
          )}
          {stream.is_live && (
            <span className="text-xs font-ui text-cni-red font-bold">Watching now</span>
          )}
        </div>
      </div>
    </div>
  );
}
