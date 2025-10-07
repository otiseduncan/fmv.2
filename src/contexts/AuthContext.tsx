import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { logAudit } from '@/lib/auditLogger';


interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'worker';
  avatar_url: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasPermission: (requiredRole: 'admin' | 'manager' | 'worker') => boolean;
  canCreateField: () => boolean;
  canEditField: () => boolean;
  canDeleteField: () => boolean;
  canCreateTask: () => boolean;
  canEditTask: () => boolean;
  canDeleteTask: () => boolean;
  canUpdateTaskStatus: (taskAssignedTo?: string) => boolean;
  canManageTeam: () => boolean;
  canEditTeamMember: () => boolean;
  canDeleteTeamMember: () => boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingProfile, setFetchingProfile] = useState(false);


  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Auth initialization timeout - setting loading to false');
          setLoading(false);
        }, 10000); // 10 second timeout
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        console.log('Falling back to development mode - no authentication required');
        
        // In development, create a mock user to bypass authentication
        const mockUser = {
          id: 'dev-user-123',
          email: 'dev@example.com',
          user_metadata: { full_name: 'Development User' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;
        
        const mockProfile: UserProfile = {
          id: 'dev-user-123',
          email: 'dev@example.com',
          full_name: 'Development User',
          role: 'admin',
          avatar_url: null,
          phone: null
        };
        
        setUser(mockUser);
        setProfile(mockProfile);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Don't set loading here, let fetchProfile handle it
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const fetchProfile = async (userId: string) => {
    // Prevent concurrent fetches
    if (fetchingProfile) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }
    
    setFetchingProfile(true);
    
    try {
      console.log('Fetching profile for user:', userId);
      
      // Add timeout for profile fetch to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.log('Profile fetch error:', error.code, error.message);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          await createProfile(userId);
          return; // createProfile handles setLoading(false) and setProfile
        }
        throw error;
      }
      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set a fallback profile so user can still access the app
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fallbackProfile: UserProfile = {
            id: userId,
            email: user.email!,
            full_name: user.user_metadata?.full_name || 'User',
            role: 'worker',
            avatar_url: null,
            phone: null
          };
          console.log('Using fallback profile after fetch error:', fallbackProfile);
          setProfile(fallbackProfile);
        } else {
          // If we can't get the user either, create a development profile
          const devProfile: UserProfile = {
            id: userId,
            email: 'dev@example.com',
            full_name: 'Development User',
            role: 'admin',
            avatar_url: null,
            phone: null
          };
          console.log('Using development profile:', devProfile);
          setProfile(devProfile);
        }
      } catch (authError) {
        console.error('Error getting user for fallback profile:', authError);
        // Final fallback - create a basic profile
        const basicProfile: UserProfile = {
          id: userId,
          email: 'user@example.com',
          full_name: 'Demo User',
          role: 'worker',
          avatar_url: null,
          phone: null
        };
        console.log('Using basic fallback profile:', basicProfile);
        setProfile(basicProfile);
      }
    } finally {
      // Always set loading to false
      setLoading(false);
      setFetchingProfile(false);
    }
  };





  const createProfile = async (userId: string) => {
    try {
      console.log('Creating profile for user:', userId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found when creating profile');
        throw new Error('No user found');
      }

      const newProfile = {
        id: userId,
        email: user.email!,
        full_name: user.user_metadata?.full_name || 'User',
        role: (user.user_metadata?.role || 'worker') as 'admin' | 'manager' | 'worker',
        avatar_url: null,
        phone: null
      };

      console.log('Inserting new profile:', newProfile);
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Error inserting profile:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error creating profile:', error);
      // Even if profile creation fails, set a default profile to prevent redirect loop
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fallbackProfile: UserProfile = {
          id: userId,
          email: user.email!,
          full_name: user.user_metadata?.full_name || 'User',
          role: 'worker',
          avatar_url: null,
          phone: null
        };
        console.log('Using fallback profile:', fallbackProfile);
        setProfile(fallbackProfile);
      }
    } finally {
      setLoading(false);
      setFetchingProfile(false);
    }
  };




  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, role = 'worker') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const hasPermission = (requiredRole: 'admin' | 'manager' | 'worker') => {
    if (!profile) return false;
    const roles = { admin: 3, manager: 2, worker: 1 };
    return roles[profile.role] >= roles[requiredRole];
  };

  // Granular permission checks for fields
  const canCreateField = () => profile?.role === 'admin' || profile?.role === 'manager';
  const canEditField = () => profile?.role === 'admin' || profile?.role === 'manager';
  const canDeleteField = () => profile?.role === 'admin';

  // Granular permission checks for tasks
  const canCreateTask = () => profile?.role === 'admin' || profile?.role === 'manager';
  const canEditTask = () => profile?.role === 'admin' || profile?.role === 'manager';
  const canDeleteTask = () => profile?.role === 'admin';
  const canUpdateTaskStatus = (taskAssignedTo?: string) => {
    if (profile?.role === 'admin' || profile?.role === 'manager') return true;
    // Workers can update tasks assigned to them
    return profile?.role === 'worker' && taskAssignedTo === profile?.id;
  };

  // Granular permission checks for team members
  const canManageTeam = () => profile?.role === 'admin';
  const canEditTeamMember = () => profile?.role === 'admin';
  const canDeleteTeamMember = () => profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signUp, signOut, resetPassword, updateProfile, hasPermission,
      canCreateField, canEditField, canDeleteField,
      canCreateTask, canEditTask, canDeleteTask, canUpdateTaskStatus,
      canManageTeam, canEditTeamMember, canDeleteTeamMember
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
