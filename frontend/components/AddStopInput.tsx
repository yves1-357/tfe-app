/// <reference types="@types/google.maps" />
'use client';

import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface AddStopInputProps {
  onAddStop: (place: PlaceResult) => void;
}

export default function AddStopInput({ onAddStop }: AddStopInputProps) {
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  // Keep a stable ref to the callback to avoid re-creating the autocomplete
  const onAddStopRef = useRef(onAddStop);
  useEffect(() => { onAddStopRef.current = onAddStop; }, [onAddStop]);

  // Creé the Autocomplete widget once the Places library is loaded
  useEffect(() => {
    if (!places || !inputRef.current || autocompleteRef.current) return;

    const ac = new places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'place_id'],
      types: ['geocode', 'establishment'],
    });
    autocompleteRef.current = ac;

    // Bias results toward user's current location (10 km radius).
    // maximumAge:300000 = utilise navigateur cached GPS position automatique
    // (no new GPS request since MapContainer already fetched it recently).
    // Fallback: bounding box of Belgium so results still prefer BE over global.
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const circle = new google.maps.Circle({
            center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            radius: 10_000,
          });
          ac.setBounds(circle.getBounds()!);
        },
        () => {
          // Geolocation denied — fall back to Belgium bounding box
          ac.setBounds(
            new google.maps.LatLngBounds(
              { lat: 49.5, lng: 2.5 },  // SW
              { lat: 51.5, lng: 6.4 }   // NE
            )
          );
        },
        { maximumAge: 300_000, timeout: 5_000, enableHighAccuracy: false }
      );
    }

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry?.location || !place.formatted_address || !place.place_id) return;

      onAddStopRef.current({
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id,
      });

      if (inputRef.current) inputRef.current.value = '';
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [places]);

  return (
    <div className="mb-3">
      <div className="input-surface flex items-center gap-2.5 px-3.5 py-3 rounded-2xl focus-within:ring-1 focus-within:ring-white/15 transition">
        <svg className="flex-shrink-0 w-[18px] h-[18px] text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={places ? 'Enter address or place' : 'Loading…'}
          disabled={!places}
          className="no-autofill flex-1 min-w-0 bg-transparent text-1 text-[15px] placeholder-gray-500 focus:outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}

