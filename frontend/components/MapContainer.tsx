'use client';

export default function MapContainer() {
  return (
    <div className="absolute inset-0 bg-[#0f1117] map-grid">
      {/* Subtle radial glow in center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.06)_0%,_transparent_70%)]" />

      {/* Map placeholder */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-subtle-pulse">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-800/60 border border-gray-700/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 font-medium tracking-wide uppercase">Map</p>
        </div>
      </div>
    </div>
  );
}
