import Link from 'next/link';

interface AdSlotProps {
  /** Label shown in corner — defaults to "Advertisement" */
  label?: string;
}

/**
 * 300×250 IAB Medium Rectangle ad slot.
 * Renders a placeholder that advertises the /advertise page.
 * Replace the inner content with a real ad server tag when ready.
 */
export default function AdSlot({ label = 'Advertisement' }: AdSlotProps) {
  return (
    <div className="w-[300px] mx-auto">
      <p className="text-[10px] font-ui text-gray-400 text-right mb-0.5 uppercase tracking-wide">
        {label}
      </p>
      {/* 300×250 placeholder — swap for real ad tag */}
      <Link
        href="/advertise"
        className="no-underline block"
        aria-label="Advertise with CNI News"
      >
        <div
          className="flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 bg-gray-50 text-center hover:bg-gray-100 transition-colors"
          style={{ width: 300, height: 250 }}
        >
          <span className="text-3xl">📢</span>
          <div>
            <p className="font-ui font-bold text-sm text-gray-800">Advertise Here</p>
            <p className="text-xs font-ui text-gray-500 mt-0.5">300×250 · From £79</p>
          </div>
          <span className="text-xs font-ui text-cni-blue font-semibold border border-cni-blue px-3 py-1 hover:bg-cni-blue hover:text-white transition-colors">
            Learn more →
          </span>
        </div>
      </Link>
    </div>
  );
}
