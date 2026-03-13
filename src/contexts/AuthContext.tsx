import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getPermissions, Permission, UserRole } from '../lib/permissions';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  plan: UserRole;
  role?: string;
  two_factor_enabled?: boolean;
  reputation_score: number;
  permissions: Permission[];
  contract_accepted: boolean;
  bio?: string;
  phone?: string;
  created_at?: string;
  credits?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    console.log('Checking session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Session:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        console.log('No session, setting loading to false');
        setLoading(false);
      }
    }).catch(err => {
      console.error('Unexpected error getting session:', err);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If the user row doesn't exist yet (e.g. trigger failed or is delayed),
        // we still want to let them log in. We'll set a basic profile.
        if (error.code === 'PGRST116') {
          console.warn('User profile not found in database. Attempting to create one.');
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const plan: UserRole = 'free';
            const role: UserRole = user.email === 'marcelodasilvareis30@gmail.com' ? 'admin' : plan;
            
            const newProfile = {
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0],
              email: user.email || '',
              avatar_url: user.user_metadata?.avatar_url,
              plan,
              role,
              reputation_score: 0,
              contract_accepted: false
            };

            // Try to insert the new profile
            const { error: insertError } = await supabase.from('users').insert([newProfile]);
            if (insertError) {
              console.error('Failed to create user profile:', insertError);
            }

            setProfile({
              ...newProfile,
              permissions: getPermissions(role)
            });
          }
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        const plan: UserRole = data.plan || 'free';
        const role: UserRole = (data.role === 'admin' || data.email === 'marcelodasilvareis30@gmail.com') ? 'admin' : plan;
        setProfile({
          ...data,
          role,
          permissions: getPermissions(role),
          contract_accepted: data.contract_accepted || false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
