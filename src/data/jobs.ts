export type JobStatus =
  | "Submitted"
  | "Assigned"
  | "Working"
  | "Hold"
  | "Completed"
  | "Cancelled";

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  details?: string;
  category?: string;
};

export type Attachment = {
  id: string;
  type: "photo" | "scan" | "document";
  name: string;
  url?: string; // may be local blob URL in prototype
  createdAt: string;
};

export type Job = {
  id: string; // internal id
  roNumber: string;
  status: JobStatus;
  statusDate: string; // ISO
  year: number;
  make: string;
  model: string;
  vin: string;
  insurance?: string;
  location: string;
  technicianIds: string[];
  services: ServiceItem[];
  attachments: Attachment[];
  notes?: string;
};

export const demoJobs: Job[] = [
  {
    id: "932661",
    roNumber: "2400711020",
    status: "Assigned",
    statusDate: new Date().toISOString(),
    year: 2024,
    make: "Infiniti",
    model: "QX80 Luxe AWD",
    vin: "JN8AZ2AC0R9501417",
    insurance: "TRAVELERS",
    location: "Gerber Collision & Glass - Warner Robins",
    technicianIds: ["tech_otis"],
    services: [
      { id: "svc1", name: "Pre & Post Scan - OE", price: 195, category: "Scans" },
      { id: "svc2", name: "ADAS L3 Static Calibration", price: 450, category: "ADAS Calibration" },
    ],
    attachments: [],
    notes: "Submitted - OK",
  },
  {
    id: "835563",
    roNumber: "2400711020",
    status: "Hold",
    statusDate: new Date().toISOString(),
    year: 2024,
    make: "Hyundai",
    model: "Elantra SEL",
    vin: "SNPLMAGASN0N59821",
    insurance: "AMFAM",
    location: "Gerber Collision & Glass - Kennesaw",
    technicianIds: [],
    services: [
      { id: "svc3", name: "Front Radar - Dynamic Calibration (L2)", price: 325, category: "ADAS Calibration" },
    ],
    attachments: [],
    notes: "On Hold: Alignment",
  },
];

export const jobStatuses: JobStatus[] = [
  "Submitted",
  "Assigned",
  "Working",
  "Hold",
  "Completed",
  "Cancelled",
];

