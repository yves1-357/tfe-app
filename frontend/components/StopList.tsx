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

  const getColor = (index: number) => {
    if (index === 0) return '#22c55e';
    if (index === stops.length - 1) return '#ef4444';
    return '#3b82f6';
  };

  return (
    <div className="space-y-3">
      {stops.map((stop, index) => (
        <div
          key={stop.id}
          className="flex items-center gap-3 bg-[#1e2130] border border-gray-700/20 rounded-xl p-3 hover:bg-[#252838] transition-colors group"
        >
          {/* Order indicator */}
          <div
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm"
            style={{ backgroundColor: getColor(index) }}
          >
            {String.fromCharCode(65 + index)}
          </div>

          {/* Connector line */}
          {index < stops.length - 1 && (
            <div className="absolute left-[2.05rem] top-[2.75rem] w-px h-4 bg-gray-700/40" />
          )}

          {/* Address */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{stop.address}</p>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemoveStop(stop.id)}
            className="flex-shrink-0 w-7 h-7 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
            aria-label="Remove stop"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
