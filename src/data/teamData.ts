export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  tasksCompleted: number;
  tasksAssigned: number;
  efficiency: number;
  joinedDate: string;
  avatar: string;
  specialization: string[];
  currentField?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 't1',
    name: 'John Martinez',
    role: 'ADAS Lead Technician',
    email: 'john.martinez@syferfield.com',
    phone: '+1 555-0101',
    status: 'available',
    tasksCompleted: 145,
    tasksAssigned: 8,
    efficiency: 94,
    joinedDate: '2023-01-15',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/68e4e477d6530059857ccb68_1759831245134_14e6136d.webp',
    specialization: ['ADAS Calibration', 'Radar Alignment', 'Team Management'],
    currentField: '2020 Toyota Camry — Front Camera Cal'
  },
  {
    id: 't2',
    name: 'Sarah Chen',
    role: 'Collision Estimator',
    email: 'sarah.chen@syferfield.com',
    phone: '+1 555-0102',
    status: 'busy',
    tasksCompleted: 132,
    tasksAssigned: 12,
    efficiency: 91,
    joinedDate: '2023-03-20',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/68e4e477d6530059857ccb68_1759831246950_db0adfb1.webp',
    specialization: ['Diagnostics', 'OEM Procedures', 'Estimating'],
    currentField: '2018 Ford F-150 — Radar Alignment'
  },
  {
    id: 't3',
    name: 'Mike Thompson',
    role: 'Mobile Calibration Tech',
    email: 'mike.thompson@syferfield.com',
    phone: '+1 555-0103',
    status: 'available',
    tasksCompleted: 198,
    tasksAssigned: 5,
    efficiency: 88,
    joinedDate: '2022-11-10',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/68e4e477d6530059857ccb68_1759831248855_e722639e.webp',
    specialization: ['Pre/Post Scans', 'ADAS Targets', 'Shop Setup'],
    currentField: '2021 Honda CR-V — 360° Camera Cal'
  },
  {
    id: 't4',
    name: 'Emily Rodriguez',
    role: 'Radar Specialist',
    email: 'emily.rodriguez@syferfield.com',
    phone: '+1 555-0104',
    status: 'available',
    tasksCompleted: 167,
    tasksAssigned: 7,
    efficiency: 92,
    joinedDate: '2023-02-01',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/68e4e477d6530059857ccb68_1759831250592_1d695288.webp',
    specialization: ['Front/Rear Radar', 'Sensor Alignment', 'Test Drives'],
    currentField: '2019 BMW X5 — Rear Radar Cal'
  },
  {
    id: 't5',
    name: 'David Park',
    role: 'ADAS Technician',
    email: 'david.park@syferfield.com',
    phone: '+1 555-0105',
    status: 'offline',
    tasksCompleted: 112,
    tasksAssigned: 0,
    efficiency: 86,
    joinedDate: '2023-06-15',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/68e4e477d6530059857ccb68_1759831252348_09b50ac9.webp',
    specialization: ['Camera Calibration', 'OEM Procedures', 'Service Documentation']
  },
  {
    id: 't6',
    name: 'Lisa Johnson',
    role: 'Calibration Coordinator',
    email: 'lisa.johnson@syferfield.com',
    phone: '+1 555-0106',
    status: 'busy',
    tasksCompleted: 154,
    tasksAssigned: 10,
    efficiency: 95,
    joinedDate: '2022-09-01',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/68e4e477d6530059857ccb68_1759831254184_41392c22.webp',
    specialization: ['Scheduling', 'Customer Updates', 'Parts Coordination'],
    currentField: '2022 Tesla Model 3 — Camera Cal'
  }
];

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  fieldId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  createdDate: string;
  category: string;
}

export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'Pre-Scan — 2020 Camry',
    description: 'Perform diagnostic pre-scan before calibration',
    assignedTo: 't4',
    fieldId: 'f1',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-10-08',
    createdDate: '2025-10-05',
    category: 'Diagnostics'
  },
  {
    id: 'task2',
    title: 'Set Targets — F-150 Radar',
    description: 'Set radar targets and verify alignment',
    assignedTo: 't2',
    fieldId: 'f4',
    priority: 'critical',
    status: 'pending',
    dueDate: '2025-10-07',
    createdDate: '2025-10-06',
    category: 'Calibration'
  },
  {
    id: 'task3',
    title: 'Target Board Setup — CR-V',
    description: 'Set up surround view target boards',
    assignedTo: 't2',
    fieldId: 'f7',
    priority: 'critical',
    status: 'in-progress',
    dueDate: '2025-10-07',
    createdDate: '2025-10-06',
    category: 'Calibration'
  },
  {
    id: 'task4',
    title: 'Equipment Check',
    description: 'Inspect target stands, levels, and sensors',
    assignedTo: 't3',
    fieldId: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '2025-10-09',
    createdDate: '2025-10-04',
    category: 'Equipment'
  },
  {
    id: 'task5',
    title: 'Post-Scan — 2015 Audi A4',
    description: 'Verify no DTCs after calibration',
    assignedTo: 't1',
    fieldId: 'f10',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-10-10',
    createdDate: '2025-10-05',
    category: 'Diagnostics'
  }
];
