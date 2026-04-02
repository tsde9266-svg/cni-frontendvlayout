'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { advertisingApi } from '@/lib/api';
import type { AdPackage } from '@/types';

interface FormState {
  advertiser_name:  string;
  advertiser_email: string;
  advertiser_phone: string;
  company_name:     string;
  company_website:  string;
  campaign_title:   string;
  creative_url:     string;
  click_url:        string;
  brief_text:       string;
  start_date:       string;
}

const EMPTY: FormState = {
  advertiser_name:  '',
  advertiser_email: '',
  advertiser_phone: '',
  company_name:     '',
  company_website:  '',
  campaign_title:   '',
  creative_url:     '',
  click_url:        '',
  brief_text:       '',
  start_date:       '',
};

export default function AdBookingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-8 w-64 bg-gray-200 animate-pulse mb-4" />
        <div className="h-96 bg-gray-100 animate-pulse" />
      </div>
    }>
      <AdBookingForm />
    </Suspense>
  );
}

function AdBookingForm() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const slug         = params.package as string;
  const cancelled    = searchParams.get('cancelled') === '1';

  const [pkg,     setPkg]     = useState<AdPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [errors,  setErrors]  = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    advertisingApi.package(slug)
      .then(r => setPkg(r.data.data as AdPackage))
      .catch(() => setPkg(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.advertiser_name.trim())  e.advertiser_name  = 'Your name is required.';
    if (!form.advertiser_email.trim()) e.advertiser_email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.advertiser_email))
      e.advertiser_email = 'Enter a valid email address.';
    if (!form.start_date) e.start_date = 'Please choose a start date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !pkg) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await advertisingApi.book({
        package_slug:     slug,
        advertiser_name:  form.advertiser_name,
        advertiser_email: form.advertiser_email,
        advertiser_phone: form.advertiser_phone || undefined,
        company_name:     form.company_name || undefined,
        company_website:  form.company_website || undefined,
        campaign_title:   form.campaign_title || undefined,
        creative_url:     form.creative_url || undefined,
        click_url:        form.click_url || undefined,
        brief_text:       form.brief_text || undefined,
        start_date:       form.start_date,
      });
      // Redirect to Stripe Checkout
      window.location.href = res.data.checkout_url;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setServerError(axiosErr?.response?.data?.message ?? 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-8 w-64 bg-gray-200 animate-pulse mb-4" />
        <div className="h-96 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="font-ui text-gray-600 mb-4">Package not found.</p>
        <Link href="/advertise" className="btn-primary text-sm no-underline">View all packages</Link>
      </div>
    );
  }

  const isSocial = pkg.category === 'social' || pkg.category === 'bundle';

  return (
    <div className="max-w-site mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm font-ui text-gray-500 mb-6">
        <Link href="/advertise" className="hover:text-cni-blue no-underline">Advertise</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Book {pkg.name}</span>
      </nav>

      {cancelled && (
        <div className="mb-6 border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm font-ui text-yellow-800">
          Your payment was cancelled. Your booking details are still here — you can try again below.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-10">

        {/* ── Left: booking form ──────────────────────────────────── */}
        <div>
          <h1 className="font-headline text-2xl font-bold text-gray-900 mb-6">
            Book: {pkg.name}
          </h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Contact details */}
            <fieldset>
              <legend className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">
                Your details
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name *" error={errors.advertiser_name}>
                  <input
                    type="text"
                    value={form.advertiser_name}
                    onChange={e => set('advertiser_name', e.target.value)}
                    className={fieldCls(!!errors.advertiser_name)}
                    placeholder="Jane Smith"
                  />
                </Field>
                <Field label="Email address *" error={errors.advertiser_email}>
                  <input
                    type="email"
                    value={form.advertiser_email}
                    onChange={e => set('advertiser_email', e.target.value)}
                    className={fieldCls(!!errors.advertiser_email)}
                    placeholder="jane@example.com"
                  />
                </Field>
                <Field label="Phone number" error={errors.advertiser_phone}>
                  <input
                    type="tel"
                    value={form.advertiser_phone}
                    onChange={e => set('advertiser_phone', e.target.value)}
                    className={fieldCls(false)}
                    placeholder="+44 7700 000000"
                  />
                </Field>
                <Field label="Company name" error={errors.company_name}>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={e => set('company_name', e.target.value)}
                    className={fieldCls(false)}
                    placeholder="Acme Ltd"
                  />
                </Field>
                <Field label="Company website" error={errors.company_website} className="sm:col-span-2">
                  <input
                    type="url"
                    value={form.company_website}
                    onChange={e => set('company_website', e.target.value)}
                    className={fieldCls(false)}
                    placeholder="https://example.com"
                  />
                </Field>
              </div>
            </fieldset>

            {/* Campaign details */}
            <fieldset>
              <legend className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">
                Campaign details
              </legend>
              <div className="space-y-4">
                <Field label="Campaign / ad title" error={errors.campaign_title}>
                  <input
                    type="text"
                    value={form.campaign_title}
                    onChange={e => set('campaign_title', e.target.value)}
                    className={fieldCls(false)}
                    placeholder="Summer sale 2026"
                  />
                </Field>

                <Field label="Start date *" error={errors.start_date}>
                  <input
                    type="date"
                    value={form.start_date}
                    min={minDate}
                    onChange={e => set('start_date', e.target.value)}
                    className={fieldCls(!!errors.start_date)}
                  />
                </Field>

                {/* Website-specific fields */}
                {!isSocial && (
                  <>
                    <Field label="Creative / banner URL" error={errors.creative_url}>
                      <input
                        type="url"
                        value={form.creative_url}
                        onChange={e => set('creative_url', e.target.value)}
                        className={fieldCls(false)}
                        placeholder="https://cdn.example.com/banner.png"
                      />
                    </Field>
                    <Field label="Click-through URL" error={errors.click_url}>
                      <input
                        type="url"
                        value={form.click_url}
                        onChange={e => set('click_url', e.target.value)}
                        className={fieldCls(false)}
                        placeholder="https://example.com/landing"
                      />
                    </Field>
                  </>
                )}

                {/* Social-specific field */}
                {isSocial && (
                  <Field
                    label="Campaign brief"
                    error={errors.brief_text}
                    hint="Tell us what you'd like us to say. Our team will write the post and send it for your approval."
                  >
                    <textarea
                      rows={5}
                      value={form.brief_text}
                      onChange={e => set('brief_text', e.target.value)}
                      className={fieldCls(false) + ' resize-y'}
                      placeholder="We're launching a new product on 1 May. Please promote our 20% launch discount..."
                    />
                  </Field>
                )}
              </div>
            </fieldset>

            {serverError && (
              <p className="text-sm font-ui text-red-600 border border-red-200 bg-red-50 px-4 py-3">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Redirecting to payment…' : `Pay ${pkg.formatted_price} securely →`}
            </button>

            <p className="text-xs font-ui text-gray-500 text-center">
              🔒 Secure payment via Stripe. We never store your card details.
            </p>
          </form>
        </div>

        {/* ── Right: order summary ─────────────────────────────────── */}
        <div className="bg-gray-50 border border-gray-200 p-6 h-fit">
          <h2 className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">
            Order Summary
          </h2>

          <div className="flex items-start gap-3 mb-4">
            {pkg.icon_emoji && (
              <span className="text-2xl mt-0.5">{pkg.icon_emoji}</span>
            )}
            <div>
              <p className="font-ui font-bold text-gray-900">{pkg.name}</p>
              {pkg.tagline && (
                <p className="text-xs font-ui text-gray-500 mt-0.5">{pkg.tagline}</p>
              )}
              {pkg.dimensions && (
                <span className="inline-block mt-1 text-[10px] font-ui bg-gray-200 text-gray-600 px-2 py-0.5">
                  {pkg.dimensions}
                </span>
              )}
            </div>
          </div>

          {pkg.features && pkg.features.length > 0 && (
            <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
              {pkg.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-ui text-gray-700">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  {f}
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between font-ui">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-bold text-xl text-gray-900">{pkg.formatted_price}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {pkg.duration_days === 1
                ? 'One-time payment.'
                : `One-time payment. Campaign runs for ${pkg.duration_days} days.`}
            </p>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 space-y-1">
            <p className="text-xs font-ui text-gray-500">
              ⏱ Campaign reviewed and activated within 24 hours of payment.
            </p>
            <p className="text-xs font-ui text-gray-500">
              Questions? Email{' '}
              <a href="mailto:advertising@cninews.co.uk" className="text-cni-blue no-underline hover:underline">
                advertising@cninews.co.uk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────

function fieldCls(hasError: boolean): string {
  return `w-full border px-3 py-2 text-sm font-ui focus:outline-none focus:ring-1 ${
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-gray-300 focus:ring-cni-blue'
  }`;
}

function Field({
  label,
  error,
  hint,
  children,
  className = '',
}: {
  label:     string;
  error?:    string;
  hint?:     string;
  children:  React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-ui font-semibold text-gray-700 mb-1">{label}</label>
      {children}
      {hint  && !error && <p className="text-xs font-ui text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs font-ui text-red-600 mt-1">{error}</p>}
    </div>
  );
}
