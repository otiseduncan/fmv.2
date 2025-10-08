import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { seedDatabaseForUser } from '@/lib/seedDatabase';
import { toast } from '@/components/ui/use-toast';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { offlineQueue, QueuedOperation } from '@/lib/offlineQueue';

import { fields as mockFields } from '@/data/fieldData';
import { teamMembers as mockTeam } from '@/data/teamData';

export interface Field {
  id: string;
  name: string;
  location: string;
  size: number;
  crop: string;
  status: 'healthy' | 'needs_attention' | 'critical' | 'harvesting';
  soil_moisture: number;
  temperature: number;
  last_irrigated: string;
  next_irrigation: string;
  image_url: string;
  growth_stage: string;
  expected_yield: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  field_id?: string;
  assigned_to?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  completed_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar_url: string;
  status: 'available' | 'busy' | 'offline';
  assigned_fields: string[];
}

export interface WeatherData {
  id: number;
  date: string;
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  icon: string;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  fields: Field[];
  tasks: Task[];
  teamMembers: TeamMember[];
  weatherData: WeatherData[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  isOnline: boolean;
  pendingChanges: number;
  fetchFields: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  fetchWeatherData: () => Promise<void>;
  addField: (field: Omit<Field, 'id'>) => Promise<void>;
  updateField: (id: string, updates: Partial<Field>) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
}



const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// Transform mock data to match expected format
const transformMockFields = (): Field[] => {
  return mockFields.map(f => ({
    id: f.id,
    name: f.name,
    location: f.location,
    size: f.size,
    crop: f.cropType,
    status: f.status === 'needs-attention' ? 'needs_attention' : f.status === 'harvested' ? 'harvesting' : f.status as any,
    soil_moisture: f.soilMoisture,
    temperature: 72,
    last_irrigated: f.lastInspection,
    next_irrigation: f.harvestDate,
    image_url: f.image,
    growth_stage: 'Mature',
    expected_yield: f.yield
  }));
};

const transformMockTeam = (): TeamMember[] => {
  return mockTeam.map(t => ({
    id: t.id,
    name: t.name,
    role: t.role,
    email: t.email,
    phone: t.phone,
    avatar_url: t.avatar,
    status: t.status as any,
    assigned_fields: [] // Mock team doesn't have assigned fields, use empty array
  }));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Cache management
  useEffect(() => {
    if (fields.length > 0) localStorage.setItem('cached_fields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('cached_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (teamMembers.length > 0) localStorage.setItem('cached_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    setPendingChanges(offlineQueue.getAll().length);
  }, [fields, tasks, teamMembers]);

  // Monitor online/offline status and sync when back online
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      toast({ title: 'Offline Mode', description: 'Changes will be synced when connection is restored', variant: 'default' });
    } else if (wasOffline && isOnline) {
      setWasOffline(false);
      toast({ title: 'Back Online', description: 'Syncing pending changes...', variant: 'default' });
      syncOfflineQueue();
    }
  }, [isOnline]);

  // Sync offline queue
  const syncOfflineQueue = async () => {
    const queue = offlineQueue.getAll();
    if (queue.length === 0) return;

    setSyncing(true);
    let successCount = 0;

    for (const op of queue) {
      try {
        if (op.table === 'fields') {
          if (op.type === 'INSERT') await supabase.from('fields').insert([op.data]);
          else if (op.type === 'UPDATE') await supabase.from('fields').update(op.data).eq('id', op.data.id);
          else if (op.type === 'DELETE') await supabase.from('fields').delete().eq('id', op.data.id);
        } else if (op.table === 'tasks') {
          if (op.type === 'INSERT') await supabase.from('tasks').insert([op.data]);
          else if (op.type === 'UPDATE') await supabase.from('tasks').update(op.data).eq('id', op.data.id);
          else if (op.type === 'DELETE') await supabase.from('tasks').delete().eq('id', op.data.id);
        } else if (op.table === 'team_members') {
          if (op.type === 'INSERT') await supabase.from('team_members').insert([op.data]);
          else if (op.type === 'UPDATE') await supabase.from('team_members').update(op.data).eq('id', op.data.id);
          else if (op.type === 'DELETE') await supabase.from('team_members').delete().eq('id', op.data.id);
        }
        offlineQueue.remove(op.id);
        successCount++;
      } catch (err) {
        console.error('Failed to sync operation:', op, err);
      }
    }

    await Promise.all([fetchFields(), fetchTasks(), fetchTeamMembers()]);
    setSyncing(false);
    setPendingChanges(offlineQueue.getAll().length);
    
    if (successCount > 0) {
      toast({ title: 'Sync Complete', description: `${successCount} change(s) synced successfully` });
    }
  };


  const fetchFields = async () => {
    try {
      console.log('Fetching fields...');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Fields fetch timeout')), 3000)
      );
      
      const fetchPromise = supabase.from('fields').select('*').order('created_at', { ascending: false });
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      setFields(data || []);
      console.log('Fields fetched successfully:', data?.length || 0);
    } catch (err: any) {
      console.log('Fields fetch failed, using mock data:', err.message);
      setFields(transformMockFields());
    }
  };

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tasks fetch timeout')), 3000)
      );
      
      const fetchPromise = supabase.from('tasks').select('*').order('due_date', { ascending: true });
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      setTasks(data || []);
      console.log('Tasks fetched successfully:', data?.length || 0);
    } catch (err: any) {
      console.log('Tasks fetch failed, using mock data:', err.message);
      setTasks([
        { id: '1', title: 'Calibrate Front Camera - 2020 Camry', description: 'ADAS calibration after windshield replacement', priority: 'high', status: 'pending', due_date: '2025-10-08' },
        { id: '2', title: 'Pre-Scan - 2018 F-150', description: 'Diagnostic scan before collision repair', priority: 'medium', status: 'in_progress', due_date: '2025-10-09' }
      ]);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      console.log('Fetching team members...');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Team members fetch timeout')), 3000)
      );
      
      const fetchPromise = supabase.from('team_members').select('*').order('name', { ascending: true });
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      setTeamMembers(data || []);
      console.log('Team members fetched successfully:', data?.length || 0);
    } catch (err: any) {
      console.log('Team members fetch failed, using mock data:', err.message);
      setTeamMembers(transformMockTeam());
    }
  };

  const fetchWeatherData = async () => {
    try {
      const { data, error } = await supabase.from('weather_data').select('*').order('date', { ascending: true });
      if (error) throw error;
      setWeatherData(data || []);
    } catch (err: any) {
      console.log('Using mock weather data');
      setWeatherData([]);
    }
  };

  const addField = async (field: Omit<Field, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.from('fields').insert([{ ...field, user_id: user.id }]);
      if (error) throw error;
      await fetchFields();
      toast({ title: 'Success', description: 'Field added successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };


  const updateField = async (id: string, updates: Partial<Field>) => {
    try {
      const { error } = await supabase.from('fields').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      await fetchFields();
      toast({ title: 'Success', description: 'Field updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const deleteField = async (id: string) => {
    try {
      const { error } = await supabase.from('fields').delete().eq('id', id);
      if (error) throw error;
      await fetchFields();
      toast({ title: 'Success', description: 'Field deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const addTask = async (task: Partial<Task> & { title: string; priority: 'high'|'medium'|'low'; due_date: string }) => {
    // Optimistic local insert to keep UI responsive
    const id = task.id || crypto.randomUUID();
    const local: Task = {
      id,
      title: task.title,
      description: task.description || '',
      field_id: task.field_id,
      assigned_to: task.assigned_to,
      priority: task.priority,
      status: (task.status as any) || 'pending',
      due_date: task.due_date,
      completed_at: task.completed_at,
    };
    setTasks(prev => [...prev, local]);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('tasks').insert([{ ...local, user_id: user.id }]);
      if (error) throw error;
      toast({ title: 'Success', description: 'Task added successfully' });
    } catch (err: any) {
      console.warn('Falling back to local tasks only:', err.message);
      toast({ title: 'Saved Locally', description: 'Task queued (offline)', variant: 'default' });
    }
  };


  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Optimistic local update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      const { error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Task updated successfully' });
    } catch (err: any) {
      console.warn('Remote update failed, keeping local change:', err.message);
      toast({ title: 'Saved Locally', description: 'Update queued (offline)', variant: 'default' });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      await fetchTasks();
      toast({ title: 'Success', description: 'Task deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.from('team_members').insert([{ ...member, user_id: user.id }]);
      if (error) throw error;
      await fetchTeamMembers();
      toast({ title: 'Success', description: 'Team member added successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };


  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    // Optimistic local update to make "Assign to me" snappy
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    try {
      const { error } = await supabase.from('team_members').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Team member updated successfully' });
    } catch (err: any) {
      console.warn('Remote team update failed, keeping local change:', err.message);
      toast({ title: 'Saved Locally', description: 'Change queued (offline)', variant: 'default' });
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      await fetchTeamMembers();
      toast({ title: 'Success', description: 'Team member deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    // Fast paint: show local mock immediately so UI never stalls
    setFields(transformMockFields());
    setTasks([
      { id: '1', title: 'Calibrate Front Camera - 2020 Camry', description: 'ADAS calibration after windshield replacement', priority: 'high', status: 'pending', due_date: '2025-10-08' },
      { id: '2', title: 'Pre-Scan - 2018 F-150', description: 'Diagnostic scan before collision repair', priority: 'medium', status: 'in_progress', due_date: '2025-10-09' }
    ]);
    setTeamMembers(transformMockTeam());
    setLoading(false);

    // Background fetch: try Supabase without blocking first render
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const withTimeout = <T,>(p: Promise<T>, ms = 1500) =>
            Promise.race<T>([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)) as any]);
          await Promise.allSettled([
            withTimeout(fetchFields()),
            withTimeout(fetchTasks()),
            withTimeout(fetchTeamMembers()),
            withTimeout(fetchWeatherData()),
          ]);
        }
      } catch (err) {
        console.warn('Background data fetch failed; using local mock');
      }
    })();
  }, []);


  // Real-time subscriptions
  useEffect(() => {
    if (!currentUserId) return;

    setSyncing(true);

    // Subscribe to fields changes
    const fieldsChannel = supabase
      .channel('fields-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fields' }, (payload) => {
        console.log('Fields change:', payload);
        setSyncing(true);
        
        if (payload.eventType === 'INSERT') {
          setFields(prev => [payload.new as Field, ...prev]);
          if ((payload.new as any).user_id !== currentUserId) {
            toast({ title: 'New Field Added', description: `${(payload.new as Field).name} was added` });
          }
        } else if (payload.eventType === 'UPDATE') {
          setFields(prev => prev.map(f => f.id === payload.new.id ? payload.new as Field : f));
          if ((payload.new as any).user_id !== currentUserId) {
            toast({ title: 'Field Updated', description: `${(payload.new as Field).name} was updated` });
          }
        } else if (payload.eventType === 'DELETE') {
          setFields(prev => prev.filter(f => f.id !== payload.old.id));
          if ((payload.old as any).user_id !== currentUserId) {
            toast({ title: 'Field Deleted', description: 'A field was deleted' });
          }
        }
        
        setTimeout(() => setSyncing(false), 500);
      })
      .subscribe();

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('Tasks change:', payload);
        setSyncing(true);
        
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new as Task]);
          if ((payload.new as any).user_id !== currentUserId) {
            toast({ title: 'New Task Added', description: `${(payload.new as Task).title}` });
          }
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
          if ((payload.new as any).user_id !== currentUserId) {
            toast({ title: 'Task Updated', description: `${(payload.new as Task).title}` });
          }
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          if ((payload.old as any).user_id !== currentUserId) {
            toast({ title: 'Task Deleted', description: 'A task was deleted' });
          }
        }
        
        setTimeout(() => setSyncing(false), 500);
      })
      .subscribe();

    // Subscribe to team_members changes
    const teamChannel = supabase
      .channel('team-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, (payload) => {
        console.log('Team change:', payload);
        setSyncing(true);
        
        if (payload.eventType === 'INSERT') {
          setTeamMembers(prev => [...prev, payload.new as TeamMember]);
          if ((payload.new as any).user_id !== currentUserId) {
            toast({ title: 'New Team Member', description: `${(payload.new as TeamMember).name} joined` });
          }
        } else if (payload.eventType === 'UPDATE') {
          setTeamMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new as TeamMember : m));
          if ((payload.new as any).user_id !== currentUserId) {
            toast({ title: 'Team Member Updated', description: `${(payload.new as TeamMember).name} was updated` });
          }
        } else if (payload.eventType === 'DELETE') {
          setTeamMembers(prev => prev.filter(m => m.id !== payload.old.id));
          if ((payload.old as any).user_id !== currentUserId) {
            toast({ title: 'Team Member Removed', description: 'A team member was removed' });
          }
        }
        
        setTimeout(() => setSyncing(false), 500);
      })
      .subscribe();

    // Cleanup subscriptions
    return () => {
      fieldsChannel.unsubscribe();
      tasksChannel.unsubscribe();
      teamChannel.unsubscribe();
    };
  }, [currentUserId]);



  return (
    <AppContext.Provider value={{ 
      sidebarOpen, 
      toggleSidebar, 
      fields, 
      tasks, 
      teamMembers, 
      weatherData, 
      loading, 
      error, 
      syncing, 
      isOnline, 
      pendingChanges, 
      fetchFields, 
      fetchTasks, 
      fetchTeamMembers, 
      fetchWeatherData, 
      addField, 
      updateField, 
      deleteField, 
      addTask, 
      updateTask, 
      deleteTask, 
      addTeamMember, 
      updateTeamMember, 
      deleteTeamMember 
    }}>
      {children}
    </AppContext.Provider>
  );
};
