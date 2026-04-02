import { Metadata } from 'next';
import Link from 'next/link';
import type { AdPackage } from '@/types';

export const metadata: Metadata = {
  title:       'Advertise with CNI News',
  description: 'Reach our audience of engaged readers and social followers. Website banners, social media posts, and bundle packages available.',
};

export const revalidate = 3600;

async function getPackages(): Promise<AdPackage[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/api/v1/ad-packages`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data as AdPackage[];
  } catch { return []; }
}

const CATEGORY_LABELS: Record<string, string> = {
  website: 'Website',
  social:  'Social Media',
  bundle:  'Bundles',
};

export default async function AdvertisePage() {
  const packages = await getPackages();

  const grouped = {
    website: packages.filter(p => p.category === 'website'),
    social:  packages.filter(p => p.category === 'social'),
    bundle:  packages.filter(p => p.category === 'bundle'),
  };

  return (
    <div className="max-w-site mx-auto px-4 py-12">

      {/* Hero */}
      <div className="text-center mb-14">
        <p className="text-xs font-ui font-bold uppercase tracking-widest text-cni-blue mb-3">
          Partner with CNI News
        </p>
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Advertise with CNI News Network
        </h1>
        <p className="text-lg font-body text-gray-600 max-w-2xl mx-auto">
          Connect your brand with our growing audience of engaged readers across our website
          and social media platforms. Choose a package that works for your campaign.
        </p>
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          {[
            ['500k+', 'Monthly page views'],
            ['50k+',  'Facebook followers'],
            ['25k+',  'YouTube subscribers'],
            ['15k+',  'Instagram followers'],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <p className="font-headline text-3xl font-bold text-cni-blue">{stat}</p>
              <p className="text-xs font-ui text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Package sections */}
      {(['website', 'social', 'bundle'] as const).map(cat => {
        const pkgs = grouped[cat];
        if (pkgs.length === 0) return null;
        return (
          <section key={cat} className="mb-14">
            <div className="section-divider mb-6">
              <h2 className="font-headline text-2xl font-bold text-gray-900">
                {CATEGORY_LABELS[cat]}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pkgs.map(pkg => (
                <div
                  key={pkg.id}
                  className={`relative border p-6 flex flex-col ${
                    pkg.is_featured
                      ? 'border-cni-blue ring-1 ring-cni-blue'
                      : 'border-gray-200'
                  }`}
                >
                  {pkg.is_featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cni-blue text-white text-[10px] font-ui font-bold uppercase tracking-widest px-3 py-0.5">
                      Best Value
                    </span>
                  )}

                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      {pkg.icon_emoji && (
                        <span className="text-2xl" aria-hidden="true">{pkg.icon_emoji}</span>
                      )}
                      <h3 className="font-headline font-bold text-lg text-gray-900">{pkg.name}</h3>
                    </div>
                    {pkg.tagline && (
                      <p className="text-sm font-ui text-gray-500">{pkg.tagline}</p>
                    )}
                    {pkg.dimensions && (
                      <span className="inline-block mt-1 text-[10px] font-ui bg-gray-100 text-gray-600 px-2 py-0.5">
                        {pkg.dimensions}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="font-headline text-3xl font-bold text-gray-900">
                      {pkg.formatted_price}
                    </span>
                    <span className="text-sm font-ui text-gray-500 ml-1">
                      / {pkg.duration_days === 1 ? 'post' : `${pkg.duration_days} days`}
                    </span>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p className="text-sm font-body text-gray-600 mb-4 flex-1">{pkg.description}</p>
                  )}

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-1.5 mb-6 flex-1">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-ui text-gray-700">
                          <span className="text-green-500 font-bold mt-0.5">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/advertise/book/${pkg.slug}`}
                    className={`block text-center text-sm font-ui font-bold py-3 px-4 no-underline transition-colors ${
                      pkg.is_featured
                        ? 'bg-cni-blue text-white hover:bg-cni-blue-dark'
                        : 'border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    Book this package →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Process section */}
      <section className="bg-gray-50 border border-gray-200 p-8 mb-12">
        <h2 className="font-headline text-2xl font-bold text-gray-900 text-center mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            ['1', 'Choose a package', 'Browse our advertising options and select the one that fits your campaign goals.'],
            ['2', 'Complete booking form', 'Fill in your campaign details, preferred start date, and upload your creative.'],
            ['3', 'Secure payment', 'Pay safely via Stripe. Your booking is confirmed instantly after payment.'],
            ['4', 'Go live within 24h', 'Our team reviews and activates your campaign within 24 hours of payment.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="text-center">
              <div className="w-10 h-10 bg-cni-blue text-white font-headline font-bold text-lg flex items-center justify-center mx-auto mb-3">
                {num}
              </div>
              <p className="font-ui font-bold text-gray-900 mb-1">{title}</p>
              <p className="text-sm font-body text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <div className="text-center">
        <h2 className="font-headline text-xl font-bold text-gray-900 mb-2">
          Need a custom package?
        </h2>
        <p className="font-body text-gray-600 mb-4">
          Contact our advertising team for bespoke campaigns, bulk discounts, or long-term partnerships.
        </p>
        <a
          href="mailto:advertising@cninews.co.uk"
          className="btn-primary text-sm no-underline"
        >
          Contact advertising team
        </a>
      </div>
    </div>
  );
}
