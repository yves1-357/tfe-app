'use client';

export default function MapContainer() {
  return (
    <div className="absolute inset-0 map-canvas">
      {/* Map placeholder badge */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-map-float">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl glass-soft flex items-center justify-center animate-subtle-pulse">
            <svg className="w-8 h-8 text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          
        </div>
      </div>
    </div>
  );
}
