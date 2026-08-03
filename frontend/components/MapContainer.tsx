/// <reference types="@types/google.maps" />
'use client';

import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';
import type { Stop } from '@/types';
import RouteOverlay from './RouteOverlay';

/** Adapte le zoom de la carte à chaque nouveau stop ajouté. */
function MapAutoFit({ stops, userLocation }: {
  stops: Stop[];
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!map) return;
    const valid = stops.filter(s => s.lat !== undefined && s.lng !== undefined);
    if (valid.length === 0 || valid.length <= prevCountRef.current) {
      prevCountRef.current = valid.length;
      return;
    }
    prevCountRef.current = valid.length;

    if (valid.length === 1) {
      map.panTo({ lat: valid[0].lat!, lng: valid[0].lng! });
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    valid.forEach(s => bounds.extend({ lat: s.lat!, lng: s.lng! }));
    if (userLocation) bounds.extend(userLocation);
    map.fitBounds(bounds, 80);
  }, [map, stops, userLocation]);

  return null;
}

const BRUSSELS_CENTER = { lat: 50.8503, lng: 4.3517 };
const DEFAULT_ZOOM = 12;
const USER_ZOOM = 14;

const USER_DOT_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
       <circle cx="11" cy="11" r="7" fill="#4285F4" stroke="white" stroke-width="3"/>
     </svg>`
  );

type GeoStatus = 'loading' | 'granted' | 'denied' | 'unavailable';

function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<GeoStatus>(() => {
    if (typeof window === 'undefined') return 'loading';
    if (!navigator.geolocation) return 'unavailable';
    return 'loading';
  });

  const fetchPosition = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  const retry = useCallback(() => {
    setStatus('loading');
    fetchPosition();
  }, [fetchPosition]);

  return { location, status, retry };
}

interface MapControllerProps {
  location: { lat: number; lng: number } | null;
  status: GeoStatus;
  onRetry: () => void;
}

function MapController({ location, status, onRetry }: MapControllerProps) {
  const map = useMap();
  const hasAutoCenteredRef = useRef(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!map || !location || hasAutoCenteredRef.current) return;
    map.panTo(location);
    map.setZoom(USER_ZOOM);
    hasAutoCenteredRef.current = true;
  }, [map, location]);

  const handleClick = () => {
    if (location && map) {
      map.panTo(location);
      map.setZoom(USER_ZOOM);
      return;
    }
    if (status === 'denied' || status === 'unavailable') {
      setShowHelp(true);
      onRetry(); // tentative silencieuse — succède si l'utilisateur a re-autorisé entre-temps
      return;
    }
    onRetry();
  };

  const isLoading = status === 'loading';
  const isDenied = status === 'denied' || status === 'unavailable';
  const tooltip =
    status === 'granted' && location
      ? 'Recentrer sur ma position'
      : isLoading
      ? 'Recherche de votre position…'
      : status === 'denied'
      ? 'Géolocalisation refusée — cliquer pour voir comment réactiver'
      : 'Géolocalisation indisponible — cliquer pour réessayer';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={tooltip}
        title={tooltip}
        className={`absolute bottom-6 right-6 z-20 w-12 h-12 rounded-full glass-soft flex items-center justify-center transition-all
          ${isLoading ? 'opacity-60 cursor-wait' : 'hover:scale-105 active:scale-95 cursor-pointer'}
          ${isDenied ? 'text-red-500' : 'text-2'}`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
        )}
      </button>

      {showHelp && isDenied && (
        <div
          role="dialog"
          aria-labelledby="geoloc-help-title"
          className="absolute bottom-24 right-6 z-30 w-80 max-w-[calc(100vw-3rem)] glass-soft rounded-2xl p-4 text-sm text-1 shadow-lg"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 id="geoloc-help-title" className="font-semibold">
              Réactiver la géolocalisation
            </h3>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              aria-label="Fermer"
              className="text-2 hover:text-1 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-2 mb-3">
            Votre navigateur bloque la géolocalisation pour ce site. Pour la réactiver :
          </p>
          <ol className="list-decimal list-inside space-y-1 text-2 mb-3">
            <li>Cliquez sur l&apos;icône <b>cadenas</b> dans la barre d&apos;adresse</li>
            <li>Trouvez <b>Localisation</b> dans les autorisations</li>
            <li>Choisissez <b>Autoriser</b> ou <b>Demander</b></li>
            <li>Rechargez la page</li>
          </ol>
          <p className="text-xs text-2 opacity-70">
            La carte reste utilisable manuellement, mais elle ne pourra pas se centrer sur vous.
          </p>
        </div>
      )}
    </>
  );
}

interface MapContainerProps {
  stops?: Stop[];
  polyline?: string | null;
  currentStopIndex?: number; // -1 = aucun highlight
}

export default function MapContainer({ stops = [], polyline = null, currentStopIndex = -1 }: MapContainerProps) {
  const { isDark } = useTheme();
  const { location, status, retry } = useUserLocation();

  return (
    <div className="absolute inset-0">
      <Map
        defaultCenter={BRUSSELS_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        colorScheme={isDark ? 'DARK' : 'LIGHT'}
        className="w-full h-full"
      >
        {location && (
          <Marker position={location} icon={USER_DOT_SVG} title="Vous êtes ici" />
        )}
        {stops.map((stop, index) =>
          stop.lat !== undefined && stop.lng !== undefined ? (
            <Marker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              label={{
                text: String(stop.order),
                color: 'white',
                fontWeight: 'bold',
                fontSize: index === currentStopIndex ? '14px' : '12px',
              }}
              title={stop.address}
              zIndex={index === currentStopIndex ? 10 : 1}
            />
          ) : null
        )}
        {polyline && <RouteOverlay encodedPolyline={polyline} />}
        <MapAutoFit stops={stops} userLocation={location} />
      </Map>
      <MapController location={location} status={status} onRetry={retry} />

      {status === 'loading' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-soft px-3 py-1.5 rounded-full text-xs text-2 z-10">
          Recherche de votre position…
        </div>
      )}
    </div>
  );
}



