'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { eventsApi, articlesApi } from '@/lib/api';
import type { Article } from '@/types';

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

function CalendarIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function EventCard({ event }: { event: Event }) {
  const start = new Date(event.starts_at);
  const isPast = start < new Date();

  return (
    <Link
      href={`/events/${event.id}`}
      className="no-underline group block"
    >
      <div className="border border-gray-200 hover:border-cni-blue transition-colors bg-white h-full flex flex-col">
        {/* Date banner */}
        <div
          className="px-4 py-3 flex items-center gap-3 text-white"
          style={{ backgroundColor: isPast ? '#6B7280' : '#012169' }}
        >
          <div className="text-center shrink-0">
            <p className="text-2xl font-black leading-none">{start.getDate()}</p>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">
              {start.toLocaleDateString('en-GB', { month: 'short' })}
            </p>
          </div>
          <div className="w-px h-10 bg-white/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium opacity-80">{start.getFullYear()}</p>
            <p className="text-sm font-bold">{formatTime(event.starts_at)}</p>
            {isPast && (
              <span className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-sm mt-0.5 inline-block">
                PAST EVENT
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <h3 className="font-headline font-bold text-gray-900 text-base leading-snug group-hover:text-cni-blue transition-colors line-clamp-2">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {event.description}
            </p>
          )}

          <div className="mt-auto space-y-1.5 text-xs text-gray-500">
            {(event.location_name || event.city) && (
              <div className="flex items-center gap-1.5">
                <LocationIcon />
                <span>{[event.location_name, event.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <TicketIcon />
              <span>{event.is_free ? 'Free Entry' : `£${event.ticket_price}`}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <span
            className="block text-center text-xs font-semibold py-2 transition-colors"
            style={{ backgroundColor: isPast ? '#F3F4F6' : '#DC2626', color: isPast ? '#6B7280' : '#FFFFFF' }}
          >
            {isPast ? 'View Details' : 'View Event'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleEventCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`} className="no-underline group flex gap-3 py-3 border-b border-gray-100 last:border-0">
      {article.featured_image && (
        <img
          src={article.featured_image}
          alt={article.title}
          className="w-20 h-16 object-cover shrink-0 bg-gray-100"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-cni-red font-semibold uppercase tracking-wide mb-0.5">
          {article.categories?.[0]?.name ?? 'Events'}
        </p>
        <h4 className="text-sm font-bold text-gray-800 group-hover:text-cni-blue leading-snug line-clamp-2 transition-colors">
          {article.title}
        </h4>
        <p className="text-xs text-gray-400 mt-1">
          {article.published_at
            ? new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : ''}
        </p>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: () => eventsApi.list({ per_page: 20 }).then(r => r.data.data as Event[]),
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ['event-articles'],
    queryFn: () =>
      articlesApi.list({ category: 'culture', per_page: 12 }).then(r => r.data.data as Article[]),
    staleTime: 5 * 60 * 1000,
  });

  const now = new Date();
  const upcoming = eventsData?.filter(e => new Date(e.starts_at) >= now) ?? [];
  const past     = eventsData?.filter(e => new Date(e.starts_at) <  now) ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">

      {/* Page heading */}
      <div className="border-l-4 border-cni-red pl-4 mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 mt-1">CNI News Network community events, celebrations and gatherings</p>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-8 items-start">

        {/* ── Left: Upcoming + Past events ── */}
        <div>
          {/* Upcoming Events */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-5 bg-cni-red inline-block" />
              <h2 className="font-headline text-xl font-bold text-gray-900">Upcoming Events</h2>
              {upcoming.length > 0 && (
                <span className="bg-cni-red text-white text-xs font-bold px-2 py-0.5 rounded-sm">
                  {upcoming.length}
                </span>
              )}
            </div>

            {eventsLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-56 bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : upcoming.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {upcoming.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-sm p-8 text-center">
                <CalendarIcon />
                <p className="text-gray-500 text-sm mt-3">No upcoming events scheduled.</p>
                <p className="text-gray-400 text-xs mt-1">Check back soon for new events from CNI News Network.</p>
              </div>
            )}
          </section>

          {/* Past Events */}
          {(eventsLoading || past.length > 0) && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1 h-5 bg-gray-400 inline-block" />
                <h2 className="font-headline text-xl font-bold text-gray-900">Past Events</h2>
              </div>
              {eventsLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1,2].map(i => <div key={i} className="h-56 bg-gray-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {past.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Right sidebar: Event news/articles ── */}
        <aside className="lg:sticky lg:top-[120px]">
          <div className="border border-gray-200 bg-white">
            <div className="bg-gray-900 text-white px-4 py-3">
              <h2 className="font-headline font-bold text-base">Event Coverage & News</h2>
              <p className="text-xs text-gray-400 mt-0.5">Articles about CNI events</p>
            </div>
            <div className="px-4 py-2">
              {articlesLoading ? (
                <div className="space-y-3 py-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}
                </div>
              ) : eventArticles && eventArticles.length > 0 ? (
                eventArticles.map(article => (
                  <ArticleEventCard key={article.id} article={article} />
                ))
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">No event articles yet.</p>
              )}
            </div>
          </div>

          {/* Organise an event CTA */}
          <div className="mt-4 bg-gray-900 text-white p-5">
            <h3 className="font-headline font-bold text-base mb-2">Host an Event?</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              CNI News Network partners with community organisations to promote and cover events
              across Birmingham and the UK.
            </p>
            <Link
              href="/contact"
              className="block text-center bg-cni-red text-white text-sm font-semibold py-2 no-underline hover:bg-red-700 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
