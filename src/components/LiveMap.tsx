import React, { useEffect, useState } from 'react';

type Props = {
  height?: number;
  zoom?: number;
};

const LiveMap: React.FC<Props> = ({ height = 360, zoom = 5 }) => {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY as string | undefined;

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCenter(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const urlWithKey = (lat: number, lng: number) =>
    `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}&maptype=roadmap`;

  const fallbackUrl = (lat?: number, lng?: number) => {
    const q = lat && lng ? `${lat},${lng}` : 'United States';
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=m&z=${zoom}&output=embed&iwloc=near`;
  };

  const src = center
    ? (apiKey ? urlWithKey(center.lat, center.lng) : fallbackUrl(center.lat, center.lng))
    : fallbackUrl();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-3">Live Map</h3>
      <div className="rounded-lg overflow-hidden border">
        <iframe
          title="Live Map"
          width="100%"
          height={height}
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={src}
        />
      </div>
      {!apiKey && (
        <p className="mt-2 text-xs text-gray-500">Tip: add VITE_GOOGLE_MAPS_KEY to use the Maps JS Embed API.</p>
      )}
    </div>
  );
};

export default LiveMap;

