'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { advertisingApi } from '@/lib/api';
import type { AdBooking } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  pending_review:  'Paid — under review',
  confirmed:       'Confirmed',
  active:          'Live',
  completed:       'Completed',
  cancelled:       'Cancelled',
  rejected:        'Rejected',
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  pending_review:  'bg-blue-100 text-blue-800',
  confirmed:       'bg-green-100 text-green-800',
  active:          'bg-green-600 text-white',
  completed:       'bg-gray-100 text-gray-700',
  cancelled:       'bg-red-100 text-red-700',
  rejected:        'bg-red-100 text-red-700',
};

export default function AdvertiseConfirmationPage() {
  const params    = useParams();
  const reference = params.reference as string;

  const [booking, setBooking]  = useState<AdBooking | null>(null);
  const [loading, setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    advertisingApi.bookingStatus(reference)
      .then(r => setBooking(r.data.data as AdBooking))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="h-8 w-48 bg-gray-200 animate-pulse mx-auto mb-4" />
        <div className="h-40 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="font-ui text-gray-600 mb-4">Booking not found.</p>
        <Link href="/advertise" className="btn-primary text-sm no-underline">
          View advertising packages
        </Link>
      </div>
    );
  }

  const isPaid = booking.payment_status === 'paid';

  return (
    <div className="max-w-xl mx-auto px-4 py-16">

      {/* Success icon */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{isPaid ? '✅' : '⏳'}</div>
        <h1 className="font-headline text-2xl font-bold text-gray-900 mb-2">
          {isPaid
            ? 'Booking received — thank you!'
            : 'Booking reference saved'}
        </h1>
        <p className="font-body text-gray-600 text-sm max-w-sm mx-auto">
          {isPaid
            ? 'Your payment was successful. Our team will review and activate your campaign within 24 hours.'
            : 'Complete payment to confirm your booking.'}
        </p>
      </div>

      {/* Booking summary card */}
      <div className="border border-gray-200 bg-gray-50 p-6 space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500">Reference</span>
          <span className="font-ui font-bold text-gray-900">{booking.reference}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500">Package</span>
          <span className="font-ui text-gray-900 text-sm">{booking.package_name}</span>
        </div>

        {booking.campaign_title && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500">Campaign</span>
            <span className="font-ui text-gray-900 text-sm">{booking.campaign_title}</span>
          </div>
        )}

        {booking.start_date && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500">Start date</span>
            <span className="font-ui text-gray-900 text-sm">
              {new Date(booking.start_date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
        )}

        {booking.end_date && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500">End date</span>
            <span className="font-ui text-gray-900 text-sm">
              {new Date(booking.end_date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500">Amount paid</span>
          <span className="font-ui font-bold text-gray-900">
            {booking.price_currency === 'GBP' ? '£' : booking.price_currency}
            {Number(booking.price_amount).toFixed(0)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500">Status</span>
          <span
            className={`text-xs font-ui font-bold px-2 py-0.5 ${
              STATUS_COLOR[booking.booking_status] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {STATUS_LABEL[booking.booking_status] ?? booking.booking_status}
          </span>
        </div>

        {booking.rejection_reason && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-ui font-bold uppercase tracking-wide text-gray-500 mb-1">Rejection reason</p>
            <p className="text-sm font-body text-red-700">{booking.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Next steps */}
      {isPaid && (
        <div className="border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-ui text-blue-800 mb-8">
          <p className="font-bold mb-1">What happens next?</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Our advertising team reviews your campaign (within 24h).</li>
            <li>You&apos;ll receive a confirmation email when it&apos;s approved.</li>
            <li>Your ad goes live on your chosen start date.</li>
          </ol>
        </div>
      )}

      <div className="text-center space-y-3">
        <Link href="/" className="btn-primary text-sm no-underline block">
          Return to CNI News
        </Link>
        <p className="text-xs font-ui text-gray-500">
          Questions?{' '}
          <a href="mailto:advertising@cninews.co.uk" className="text-cni-blue no-underline hover:underline">
            advertising@cninews.co.uk
          </a>
        </p>
      </div>
    </div>
  );
}
