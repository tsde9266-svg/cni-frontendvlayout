import type { Metadata } from 'next';
import { Playfair_Display, Source_Serif_4, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const playfair = Playfair_Display({
  subsets: ['latin'], variable: '--font-playfair', display: 'swap',
});
const sourceSerif = Source_Serif_4({
  subsets: ['latin'], variable: '--font-source-serif',
  weight: ['300', '400', '600'], display: 'swap',
});
const inter = Inter({
  subsets: ['latin'], variable: '--font-inter', display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | CNI News Network',
    default:  'CNI News Network — Your Voice, Your News',
  },
  description: 'CNI News Network — UK-based multilingual news platform for South Asian diaspora.',
  openGraph: { type: 'website', locale: 'en_GB', siteName: 'CNI News Network' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSerif.variable} ${inter.variable}`}
    >
      <body suppressHydrationWarning className="bg-white text-gray-900 antialiased" style={{ fontFamily: 'var(--font-source-serif), Georgia, serif' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
