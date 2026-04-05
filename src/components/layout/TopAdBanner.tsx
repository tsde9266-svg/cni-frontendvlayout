import AdBanner from '@/components/ui/AdBanner';

/**
 * Leaderboard ad strip — sits between the sticky header and page content.
 * Rendered server-side in layout.tsx but the inner AdBanner is a client
 * component that fetches and rotates live ads from the backend.
 */
export default function TopAdBanner() {
  return (
    <div className="w-full border-b border-gray-100 bg-gray-50 py-2">
      <div className="max-w-[1280px] mx-auto px-4">
        <AdBanner placement="leaderboard" />
      </div>
    </div>
  );
}
