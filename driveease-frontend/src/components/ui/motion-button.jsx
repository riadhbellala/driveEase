import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * MotionButton — a pill-shaped CTA with a sliding circle + arrow animation.
 *
 * Props:
 *  - label    (string)   — button text
 *  - classes  (string)   — additional className overrides
 *  - onClick  (function) — click handler
 */
export default function MotionButton({ label, classes, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative h-auto w-50 cursor-pointer rounded-full border-none p-1 outline-none bg-[#F7F5F0]',
        classes
      )}
    >
      {/* Sliding circle — expands on hover */}
      <span
        className="block h-12 w-12 overflow-hidden rounded-full bg-[#E8542E] m-0 transition-all duration-500 group-hover:w-full"
        aria-hidden="true"
      />

      {/* Arrow icon — shifts right on hover */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 translate-x-0 transition-transform duration-500 group-hover:translate-x-[0.4rem]">
        <ArrowRight className="size-6 text-[#F7F5F0]" />
      </div>

      {/* Label text — recolors on hover */}
      <span className="absolute top-1/2 left-1/2 ml-4 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-lg font-medium tracking-tight font-body text-[#0B0D10] transition-colors duration-500 group-hover:text-[#F7F5F0]">
        {label}
      </span>
    </button>
  );
}
