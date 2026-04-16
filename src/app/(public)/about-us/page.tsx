import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — CNI News Network',
  description:
    'Communication Network International — a leading multilingual news platform delivering timely, accurate news in Urdu, English, and Punjabi.',
};

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Page heading */}
      <div className="border-l-4 border-cni-red pl-4 mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          CNI News Network
        </h1>
        <p className="text-cni-red font-semibold text-lg mt-1">
          Bridging News Across Languages
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 mb-8">
        <p className="text-gray-700 text-base leading-relaxed">
          <strong>Communication Network International</strong> is a leading multilingual news
          platform delivering timely, accurate news in <strong>Urdu</strong>,{' '}
          <strong>English</strong>, and <strong>Punjabi</strong> for audiences in Pakistan, the UK,
          Europe, and worldwide.
        </p>
      </div>

      {/* Stats banner */}
      <div
        className="text-white py-8 px-6 mb-8 flex flex-col md:flex-row items-center justify-around gap-6"
        style={{ backgroundColor: '#012169' }}
      >
        <div className="text-center">
          <p className="text-4xl font-black">20M+</p>
          <p className="text-blue-200 text-sm font-ui mt-1">Users Influenced</p>
        </div>
        <div className="hidden md:block w-px h-16 bg-white/20" />
        <div className="text-center">
          <p className="text-4xl font-black">#1</p>
          <p className="text-blue-200 text-sm font-ui mt-1">Multilingual News Platform</p>
        </div>
        <div className="hidden md:block w-px h-16 bg-white/20" />
        <div className="text-center">
          <p className="text-4xl font-black">3</p>
          <p className="text-blue-200 text-sm font-ui mt-1">Languages: Urdu · English · Punjabi</p>
        </div>
      </div>

      {/* Coverage areas */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="font-headline text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-cni-red inline-block" />
            Coverage Areas
          </h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            {[
              'Politics & Government',
              'Economy & Business',
              'Kashmir News',
              'Technology & Innovation',
              'Environment',
              'Sports — Cricket & Football',
              'Health & Wellbeing',
              'Entertainment & Culture',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cni-red shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-cni-red inline-block" />
            Our Audience
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            CNI News serves the <strong>Pakistani and Punjabi diaspora globally</strong> —
            connecting communities in Pakistan, the United Kingdom, Europe, and beyond.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            Our digital presence spans <strong>YouTube</strong>, <strong>Facebook</strong>,{' '}
            <strong>Instagram</strong>, and <strong>TikTok</strong>, keeping our audiences informed
            in their preferred language.
          </p>
        </div>
      </div>

      {/* Contact quick info */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="font-headline text-xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
            <p className="font-semibold text-gray-900 mb-1">Address</p>
            <p className="text-gray-600">
              Fairgate House<br />
              205 Kings Road<br />
              Birmingham, B11 2AA
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
            <p className="font-semibold text-gray-900 mb-1">Phone</p>
            <p className="text-gray-600">
              <a href="tel:+442036338749" className="hover:text-cni-blue no-underline">
                (+44) 020 3633 8749
              </a>
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
            <p className="font-semibold text-gray-900 mb-1">Email</p>
            <p className="text-gray-600 break-all">
              <a href="mailto:cninewsnetworkltd@gmail.com" className="hover:text-cni-blue no-underline">
                cninewsnetworkltd@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Social media */}
      <div className="mt-8">
        <h2 className="font-headline text-xl font-bold text-gray-900 mb-4">Follow Us</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Facebook', href: 'https://www.facebook.com/CNINEWSNETWORK', color: '#1877F2' },
            { label: 'YouTube', href: 'https://www.youtube.com/@CNINEWSUK', color: '#FF0000' },
            { label: 'Instagram', href: 'https://www.instagram.com/cninewsnetwork', color: '#E1306C' },
            { label: 'X / Twitter', href: 'https://twitter.com/cni_cninews', color: '#000000' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/cni-news-b39b3866/', color: '#0A66C2' },
          ].map(({ label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-ui font-semibold text-white rounded-sm no-underline transition-opacity hover:opacity-90"
              style={{ backgroundColor: color }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
