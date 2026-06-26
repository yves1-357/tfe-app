'use client';

import { Stop } from '@/types';

interface StopListProps {
  stops: Stop[];
  onRemoveStop: (id: string) => void;
}

export default function StopList({ stops, onRemoveStop }: StopListProps) {
  if (stops.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;
        return (
          <div key={stop.id} className="relative flex items-center gap-3 py-2.5 group animate-row">
            {/* Marker + connecting line */}
            <div className="relative flex-shrink-0 flex flex-col items-center self-stretch">
              <span className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-[11px] font-bold shadow-md shadow-blue-900/40">
                {index + 1}
              </span>
              {!isLast && (
                <span className="absolute top-6 w-0.5 h-full bg-gradient-to-b from-blue-500/50 to-blue-500/10" />
              )}
            </div>

            {/* Address */}
            <div className="flex-1 min-w-0">
              <p className="text-1 text-[15px] truncate">{stop.address}</p>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemoveStop(stop.id)}
              className="flex-shrink-0 w-8 h-8 text-2 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors flex items-center justify-center opacity-60 group-hover:opacity-100"
              aria-label="Remove stop"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
