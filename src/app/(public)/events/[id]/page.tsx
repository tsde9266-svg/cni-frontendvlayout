'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Event {
  id: number;
  title: string;
  description: string | null;
  location_name: string | null;
  city: string | null;
  country: string;
  starts_at: string;
  ends_at: string | null;
  ticket_price: number;
  is_free: boolean;
  max_capacity: number | null;
  image_url?: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: event, isLoading, isError } = useQuery<Event>({
    queryKey: ['event', id],
    queryFn: () => api.get(`/api/v1/events/${id}`).then(r => r.data.data ?? r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 w-48 bg-gray-100 animate-pulse" />
        <div className="h-64 bg-gray-100 animate-pulse" />
        <div className="h-32 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Event not found.</p>
        <Link href="/events" className="text-cni-blue no-underline text-sm hover:underline">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const start  = new Date(event.starts_at);
  const isPast = start < new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-ui">
        <Link href="/" className="hover:text-cni-blue no-underline">Home</Link>
        <span>/</span>
        <Link href="/events" className="hover:text-cni-blue no-underline">Events</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{event.title}</span>
      </nav>

      {/* Status badge */}
      {isPast && (
        <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Past Event
        </div>
      )}
      {!isPast && (
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Upcoming Event
        </div>
      )}

      {/* Title */}
      <h1 className="font-headline text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6">
        {event.title}
      </h1>

      {/* Optional image */}
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-64 object-cover mb-6 bg-gray-100"
        />
      )}

      {/* Event info grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Date & Time */}
        <div className="bg-gray-50 border border-gray-200 p-4 flex gap-3 items-start">
          <div
            className="w-10 h-10 flex items-center justify-center shrink-0 rounded-sm"
            style={{ backgroundColor: '#012169' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Date &amp; Time</p>
            <p className="text-gray-600 text-sm mt-0.5">{formatDate(event.starts_at)}</p>
            <p className="text-gray-600 text-sm">
              {formatTime(event.starts_at)}
              {event.ends_at && ` – ${formatTime(event.ends_at)}`}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-50 border border-gray-200 p-4 flex gap-3 items-start">
          <div className="w-10 h-10 bg-cni-red flex items-center justify-center shrink-0 rounded-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Location</p>
            {event.location_name && (
              <p className="text-gray-600 text-sm mt-0.5">{event.location_name}</p>
            )}
            <p className="text-gray-600 text-sm">
              {[event.city, event.country].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        {/* Ticket */}
        <div className="bg-gray-50 border border-gray-200 p-4 flex gap-3 items-start">
          <div className="w-10 h-10 bg-green-600 flex items-center justify-center shrink-0 rounded-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Admission</p>
            <p className="text-gray-600 text-sm mt-0.5">
              {event.is_free ? 'Free Entry' : `£${event.ticket_price} per person`}
            </p>
          </div>
        </div>

        {/* Capacity */}
        {event.max_capacity && (
          <div className="bg-gray-50 border border-gray-200 p-4 flex gap-3 items-start">
            <div className="w-10 h-10 bg-purple-600 flex items-center justify-center shrink-0 rounded-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Capacity</p>
              <p className="text-gray-600 text-sm mt-0.5">{event.max_capacity} people</p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div className="mb-8">
          <h2 className="font-headline text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-cni-red inline-block" />
            About this Event
          </h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
            {event.description}
          </div>
        </div>
      )}

      {/* Contact / CTA */}
      <div className="bg-gray-900 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-base">Interested in this event?</p>
          <p className="text-gray-400 text-sm mt-0.5">Contact CNI News Network for more information.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/contact"
            className="bg-cni-red text-white text-sm font-semibold px-5 py-2 no-underline hover:bg-red-700 transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/events"
            className="bg-white/10 text-white text-sm font-semibold px-5 py-2 no-underline hover:bg-white/20 transition-colors"
          >
            All Events
          </Link>
        </div>
      </div>
    </div>
  );
}
