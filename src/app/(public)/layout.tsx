import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TopAdBanner from '@/components/layout/TopAdBanner';

/**
 * Public layout — wraps all (public) routes with Header + TopAdBanner + Footer.
 * Each page manages its own padding/container.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <TopAdBanner />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
