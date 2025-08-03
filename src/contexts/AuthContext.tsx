'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  canCreateArticles: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canCreateArticles, setCanCreateArticles] = useState(false);


  
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Set a maximum loading time to prevent hanging
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // Maximum 2 seconds loading

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // Clear timeout and set loading to false immediately after getting session
        clearTimeout(loadingTimeout);
        setLoading(false);

        if (session?.user) {
          setProfileLoading(true);
          await fetchProfile(session.user.id);
          setProfileLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setProfileLoading(true);
          await fetchProfile(session.user.id);
          setProfileLoading(false);
        } else {
          setProfile(null);
          setProfileLoading(false);
          setIsAdmin(false);
          setCanCreateArticles(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000); // 3 second timeout
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const result = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = result as { data: Profile | null; error: { code?: string; message?: string } | null };

      if (error) {
        // If table doesn't exist (42P01) or no rows found (PGRST116), that's okay
        if (error.code === '42P01') {
          console.log('Profiles table does not exist yet. This is normal for new setups.');
          return;
        }
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }
      }

      if (data) {
        setProfile(data);
        // Set admin status based on role
        const adminStatus = data.role === 'admin' || data.role === 'super_admin';
        setIsAdmin(adminStatus);
        setCanCreateArticles(adminStatus);
      } else {
        // Reset admin status if no profile
        setIsAdmin(false);
        setCanCreateArticles(false);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.log('Profile fetch timed out - continuing without profile');
      } else {
        console.error('Error fetching profile:', error);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || 'Sign up failed') };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Network error occurred') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || 'Sign in failed') };
      }

      // Manually refresh the session to ensure immediate state update
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
          setProfileLoading(true);
          await fetchProfile(session.user.id);
          setProfileLoading(false);
        }
      } catch (sessionError) {
        console.error('Error refreshing session after signin:', sessionError);
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Network error occurred') };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsAdmin(false);
      setCanCreateArticles(false);

      // Call the API to sign out
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message || 'Failed to update profile') };
      }

      // Refresh profile
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error occurred') };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    profileLoading,
    isAdmin,
    canCreateArticles,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
