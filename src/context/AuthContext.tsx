import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  createStaffAccount: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, userEmail?: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        return data as UserProfile;
      }

      // If profile record hasn't been created yet by trigger, fallback to metadata
      return {
        id: userId,
        email: userEmail || '',
        full_name: userEmail?.split('@')[0] || 'Staff Member',
        role: 'Admin', // First user fallback if not seeded
        status: 'Active',
      };
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id, user.email || undefined);
      setProfile(p);
    }
  };

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    // Check active session on mount
    client.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id, session.user.email);
        // If user is deactivated, sign them out immediately
        if (p?.status === 'Deactivated') {
          await client.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          setProfile(p);
        }
      }
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id, session.user.email);
        if (p?.status === 'Deactivated') {
          await client.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          setProfile(p);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error:
          'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env before signing in.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const p = await fetchProfile(data.user.id, data.user.email);
        if (p?.status === 'Deactivated') {
          await supabase.auth.signOut();
          return {
            error:
              'This staff account has been deactivated. Please contact your company administrator.',
          };
        }
        setUser(data.user);
        setProfile(p);
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured yet.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Password reset failed' };
    }
  };

  // Secure admin staff account creation using an isolated client so admin session is not lost
  const createStaffAccount = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured yet.' };
    }

    const effectiveUrl =
      localStorage.getItem('lp_supabase_url') ||
      (import.meta.env.VITE_SUPABASE_URL as string) ||
      '';
    const effectiveKey =
      localStorage.getItem('lp_supabase_anon_key') ||
      (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
      '';

    try {
      // 1. First attempt provisioning via the secure create-staff Edge Function
      try {
        const { data: funcData, error: funcError } = await supabase.functions.invoke('create-staff', {
          body: { email: email.trim(), password, fullName: fullName.trim(), role },
        });

        if (!funcError && funcData?.success) {
          return { error: null };
        }
        // If function returned an explicit validation error from backend, return it
        if (funcError && funcError.message && !funcError.message.includes('Failed to send a request') && !funcError.message.includes('not found')) {
          return { error: funcError.message };
        }
      } catch (funcErr) {
        // Fall back to client-side secondary client provisioning if Edge Function not deployed
        console.info('Edge function create-staff not available, using client-side fallback:', funcErr);
      }

      // 2. Client-side isolated provisioning fallback
      const secondaryClient = createClient(effectiveUrl, effectiveKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      const { data, error: signUpError } = await secondaryClient.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
          },
        },
      });

      if (signUpError) {
        return { error: signUpError.message };
      }

      if (data.user) {
        // Admin upserts profile record in public.profiles table
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email.trim(),
          full_name: fullName.trim(),
          role,
          status: 'Active',
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn('Profile upsert note:', profileError);
        }
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Staff account creation failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
        createStaffAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
