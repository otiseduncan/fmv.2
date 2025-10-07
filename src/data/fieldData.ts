export interface Field {
  id: string;
  name: string;
  location: string;
  size: number; // estimated hours
  cropType: string; // service type
  plantingDate: string; // booked date
  harvestDate: string; // next appointment date
  status: 'healthy' | 'needs-attention' | 'critical' | 'harvested'; // harvested -> calibrating
  irrigationStatus: 'active' | 'scheduled' | 'off'; // on-site status
  soilMoisture: number; // readiness %
  lastInspection: string; // last visit
  yield: number; // estimated hours mirror
  image: string;
  coordinates: { lat: number; lng: number };
}

export const fields: Field[] = [
  {
    id: 'f1',
    name: '2020 Toyota Camry — Front Camera Cal',
    location: 'Chicago, IL',
    size: 2.5,
    cropType: 'Front Camera Calibration',
    plantingDate: '2025-10-07',
    harvestDate: '2025-10-10',
    status: 'healthy',
    irrigationStatus: 'active',
    soilMoisture: 85,
    lastInspection: '2025-10-05',
    yield: 2.5,
    image: 'https://images.unsplash.com/photo-1542228262-3d663b306e4b?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 41.8781, lng: -87.6298 }
  },
  {
    id: 'f2',
    name: '2018 Ford F-150 — Radar Alignment',
    location: 'Evanston, IL',
    size: 3.0,
    cropType: 'Front Radar Calibration',
    plantingDate: '2025-10-06',
    harvestDate: '2025-10-09',
    status: 'needs-attention',
    irrigationStatus: 'scheduled',
    soilMoisture: 60,
    lastInspection: '2025-10-06',
    yield: 3.0,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 42.0451, lng: -87.6877 }
  },
  {
    id: 'f3',
    name: '2021 Honda CR-V — 360° Camera Cal',
    location: 'Naperville, IL',
    size: 3.5,
    cropType: 'Surround View Calibration',
    plantingDate: '2025-10-08',
    harvestDate: '2025-10-12',
    status: 'healthy',
    irrigationStatus: 'active',
    soilMoisture: 78,
    lastInspection: '2025-10-07',
    yield: 3.5,
    image: 'https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 41.7508, lng: -88.1535 }
  },
  {
    id: 'f4',
    name: '2019 BMW X5 — Rear Radar Cal',
    location: 'Schaumburg, IL',
    size: 2.0,
    cropType: 'Rear Radar Calibration',
    plantingDate: '2025-10-05',
    harvestDate: '2025-10-08',
    status: 'critical',
    irrigationStatus: 'active',
    soilMoisture: 35,
    lastInspection: '2025-10-05',
    yield: 2.0,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 42.0334, lng: -88.0834 }
  },
  {
    id: 'f5',
    name: '2022 Tesla Model 3 — Camera Cal',
    location: 'Oak Park, IL',
    size: 2.0,
    cropType: 'Multi-Camera Calibration',
    plantingDate: '2025-10-09',
    harvestDate: '2025-10-11',
    status: 'healthy',
    irrigationStatus: 'scheduled',
    soilMoisture: 90,
    lastInspection: '2025-10-07',
    yield: 2.0,
    image: 'https://images.unsplash.com/photo-1511396275271-2a58f1f53304?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 41.8850, lng: -87.7845 }
  },
  {
    id: 'f6',
    name: '2017 Subaru Outback — Stereo Camera Cal',
    location: 'Aurora, IL',
    size: 2.5,
    cropType: 'Stereo Camera Calibration',
    plantingDate: '2025-10-07',
    harvestDate: '2025-10-10',
    status: 'healthy',
    irrigationStatus: 'active',
    soilMoisture: 72,
    lastInspection: '2025-10-07',
    yield: 2.5,
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 41.7606, lng: -88.3201 }
  },
  {
    id: 'f7',
    name: '2020 Mercedes C-Class — Front Radar Cal',
    location: 'Elgin, IL',
    size: 2.0,
    cropType: 'Front Radar Calibration',
    plantingDate: '2025-10-06',
    harvestDate: '2025-10-09',
    status: 'healthy',
    irrigationStatus: 'active',
    soilMoisture: 66,
    lastInspection: '2025-10-07',
    yield: 2.0,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 42.0354, lng: -88.2826 }
  },
  {
    id: 'f8',
    name: '2016 Toyota RAV4 — Blind Spot Sensor Cal',
    location: 'Skokie, IL',
    size: 1.5,
    cropType: 'Blind Spot Calibration',
    plantingDate: '2025-10-04',
    harvestDate: '2025-10-07',
    status: 'harvested',
    irrigationStatus: 'off',
    soilMoisture: 50,
    lastInspection: '2025-10-04',
    yield: 1.5,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 42.0324, lng: -87.7416 }
  },
  {
    id: 'f9',
    name: '2019 Chevrolet Silverado — Rear Radar Cal',
    location: 'Joliet, IL',
    size: 2.0,
    cropType: 'Rear Radar Calibration',
    plantingDate: '2025-10-08',
    harvestDate: '2025-10-12',
    status: 'healthy',
    irrigationStatus: 'active',
    soilMoisture: 79,
    lastInspection: '2025-10-06',
    yield: 2.0,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 41.5250, lng: -88.0817 }
  },
  {
    id: 'f10',
    name: '2015 Audi A4 — Lane Camera Cal',
    location: 'Wheaton, IL',
    size: 1.8,
    cropType: 'Lane Camera Calibration',
    plantingDate: '2025-10-05',
    harvestDate: '2025-10-08',
    status: 'needs-attention',
    irrigationStatus: 'scheduled',
    soilMoisture: 55,
    lastInspection: '2025-10-05',
    yield: 1.8,
    image: 'https://images.unsplash.com/photo-1549921296-3b4a6b74a099?q=80&w=1200&auto=format&fit=crop',
    coordinates: { lat: 41.8661, lng: -88.1070 }
  }
];
