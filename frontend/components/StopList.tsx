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
      {stops.map((stop) => (
        <div
          key={stop.id}
          className="flex items-center gap-3 py-2.5 group"
        >
          {/* Bullet */}
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 ml-1" />

          {/* Address */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-200 text-sm truncate">{stop.address}</p>
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
