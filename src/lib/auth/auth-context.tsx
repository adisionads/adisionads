'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/types';

interface SignUpMeta {
  fullName: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, meta: SignUpMeta) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or construct profile from public.profiles
  const fetchProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    if (!isSupabaseConfigured()) {
      // Local fallback simulation profile
      const metaRole = (currentUser.user_metadata?.role as UserRole) || 'ADVERTISER';
      const metaName = currentUser.user_metadata?.full_name || 'Adision User';
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: metaName,
        phone: currentUser.user_metadata?.phone || '',
        role: metaRole,
        is_verified: true,
        created_at: currentUser.created_at,
        updated_at: currentUser.created_at,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as UserProfile);
      } else {
        // Fallback to auth metadata if profile trigger is still executing
        const metaRole = (currentUser.user_metadata?.role as UserRole) || 'COMMUNITY_PARTNER';
        const metaName = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User';
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: metaName,
          phone: currentUser.user_metadata?.phone || '',
          role: metaRole,
          is_verified: false,
          created_at: currentUser.created_at,
          updated_at: currentUser.created_at,
        });
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to load profile from DB:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        // Check localStorage for simulated session
        const savedSim = localStorage.getItem('adision_sim_user');
        if (savedSim) {
          try {
            const parsed = JSON.parse(savedSim);
            if (mounted) {
              setUser(parsed.user);
              setProfile(parsed.profile);
            }
          } catch {}
        }
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user);
        }
      } catch (err) {
        console.error('[AuthContext] Init error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth events
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser);
          } else {
            setProfile(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // Simulated local login
        const simUser = {
          id: `usr_${Date.now()}`,
          email,
          created_at: new Date().toISOString(),
          user_metadata: {
            full_name: email.split('@')[0],
            role: email.includes('admin') ? 'ADMIN' : email.includes('partner') ? 'COMMUNITY_PARTNER' : 'ADVERTISER',
          },
        } as any;
        setUser(simUser);
        await fetchProfile(simUser);
        localStorage.setItem(
          'adision_sim_user',
          JSON.stringify({ user: simUser, profile: { ...simUser.user_metadata, id: simUser.id, email } })
        );
        setIsLoading(false);
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user);
      }
      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || 'Login failed. Please check your credentials.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    meta: SignUpMeta
  ): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        const simUser = {
          id: `usr_${Date.now()}`,
          email,
          created_at: new Date().toISOString(),
          user_metadata: {
            full_name: meta.fullName,
            role: meta.role,
            phone: meta.phone,
          },
        } as any;
        setUser(simUser);
        await fetchProfile(simUser);
        localStorage.setItem(
          'adision_sim_user',
          JSON.stringify({ user: simUser, profile: { ...simUser.user_metadata, id: simUser.id, email } })
        );
        setIsLoading(false);
        return { error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: meta.fullName.trim(),
            role: meta.role,
            phone: meta.phone?.trim() || null,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user);
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || 'Registration failed. Please try again.' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('adision_sim_user');
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const role = profile?.role || (user?.user_metadata?.role as UserRole) || null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
