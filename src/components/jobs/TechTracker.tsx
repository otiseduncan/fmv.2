import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type GeoPoint = { lat: number; lng: number; ts: number };

type Props = {
  jobId: string;
  techId: string;
};

const TechTracker: React.FC<Props> = ({ jobId, techId }) => {
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  const start = () => {
    if (!('geolocation' in navigator)) return alert('Geolocation not supported');
    if (startedRef.current) return;
    startedRef.current = true;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const p = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: Date.now(),
        };
        setPoints((prev) => [...prev.slice(-49), p]);
        // Hook here to send to backend in production
        // console.log('track', jobId, techId, p);
      },
      (err) => {
        // eslint-disable-next-line no-alert
        alert(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    setWatchId(id);
  };

  const stop = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    startedRef.current = false;
  };

  const last = points[points.length - 1];

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">Live Tech Tracking</p>
        {watchId === null ? (
          <Button size="sm" onClick={start}>Start</Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={stop}>Stop</Button>
        )}
      </div>
      {last ? (
        <div className="text-sm text-gray-700">
          <div>Lat: {last.lat.toFixed(5)} | Lng: {last.lng.toFixed(5)}</div>
          <div>Updated: {new Date(last.ts).toLocaleTimeString()}</div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No position yet. Start tracking.</p>
      )}
      <div className="text-xs text-gray-500">Points collected: {points.length}</div>
    </div>
  );
};

export default TechTracker;

