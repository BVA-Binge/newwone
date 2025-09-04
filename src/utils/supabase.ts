import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, profile: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profile,
      },
    });
    return { data, error };
  },
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },
};

// Database helpers
export const db = {
  // Projects
  getProjects: async (filters?: any) => {
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    
    return query;
  },
  
  createProject: async (project: any) => {
    return supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
  },
  
  updateProject: async (id: string, updates: any) => {
    return supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  // Users
  createUserProfile: async (profile: any) => {
    return supabase
      .from('users')
      .insert([profile])
      .select()
      .single();
  },
  
  getUserProfile: async (id: string) => {
    return supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  // Blockchain events
  logBlockchainEvent: async (event: any) => {
    return supabase
      .from('blockchain_events')
      .insert([event]);
  },
  
  getBlockchainEvents: async (project_id: string) => {
    return supabase
      .from('blockchain_events')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });
  },
};