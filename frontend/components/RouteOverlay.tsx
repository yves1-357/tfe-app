'use client';

import { Polyline } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';

interface RouteOverlayProps {
  encodedPolyline: string;
}

/** Décoder le format Google Encoded Polyline Algorithm en tableau {lat, lng} */
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

export default function RouteOverlay({ encodedPolyline }: RouteOverlayProps) {
  const path = useMemo(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : []),
    [encodedPolyline]
  );

  if (path.length === 0) return null;

  return (
    <>
      {/* Ombre portée légère */}
      <Polyline
        path={path}
        strokeColor="rgba(0,0,0,0.15)"
        strokeWeight={8}
        strokeOpacity={1}
      />
      {/* Tracé principal bleu */}
      <Polyline
        path={path}
        strokeColor="#3b7dff"
        strokeWeight={5}
        strokeOpacity={0.9}
      />
    </>
  );
}
