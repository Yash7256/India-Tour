import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  favoriteDestinations: string[];
  travel_preferences: any;
  phone: string | null;
  location: string | null;
  created_at: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  addToFavorites: (cityId: string) => Promise<void>;
  removeFromFavorites: (cityId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to handle post-login redirect
  const handlePostLoginRedirect = (userRole: string) => {
    console.log('🔄 Handling post-login redirect for role:', userRole);
    
    // Check if user is admin and redirect accordingly
    if (userRole === 'admin') {
      console.log('👑 Admin user detected, redirecting to admin panel');
      window.location.href = '/admin';
    } else {
      console.log('👤 Regular user, redirecting to home');
      window.location.href = '/';
    }
  };

  useEffect(() => {
    console.log('🚀 AuthProvider useEffect started');
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.log('⏰ Fallback timeout triggered - setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📱 Initial session check:', { session: !!session, error });
      
      setSession(session);
      if (session?.user) {
        console.log('👤 User found in session, fetching profile...');
        fetchUserProfile(session.user.id, false).then(() => { // false = don't redirect on initial load
          clearTimeout(fallbackTimeout);
        });
      } else {
        console.log('❌ No user in session, setting loading to false');
        setLoading(false);
        clearTimeout(fallbackTimeout);
      }
    }).catch(error => {
      console.error('💥 Error getting initial session:', error);
      setLoading(false);
      clearTimeout(fallbackTimeout);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', { event, session: !!session });
      setSession(session);
      
      if (session?.user && event === 'SIGNED_IN') {
        console.log('👤 User signed in, fetching profile and redirecting...');
        await fetchUserProfile(session.user.id, true); // true = redirect after profile fetch
        clearTimeout(fallbackTimeout);
      } else if (session?.user) {
        console.log('👤 User in auth state change, fetching profile...');
        await fetchUserProfile(session.user.id, false); // false = don't redirect
        clearTimeout(fallbackTimeout);
      } else {
        console.log('❌ No user in auth state change, clearing user and setting loading to false');
        setUser(null);
        setLoading(false);
        clearTimeout(fallbackTimeout);
      }
    });

    return () => {
      console.log('🧹 AuthProvider cleanup');
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, shouldRedirect: boolean = false) => {
    console.log('🔍 fetchUserProfile called for userId:', userId, 'shouldRedirect:', shouldRedirect);
    console.log('⏳ Current loading state before fetch:', loading);
    
    try {
      // Add timeout to the database query
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });
      
      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]).catch(err => {
        console.log('⏰ Profile fetch timed out or failed:', err);
        return { data: null, error: err };
      });

      console.log('📊 Profile query result:', { profile: !!profile, error });

      let userRole = 'user';

      if (error || !profile) {
        console.log('📝 No profile found or error, creating from auth user...');
        
        // Get user data from auth session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log('👤 Auth user data:', { authUser: !!authUser });
        
        if (authUser) {
          console.log('✅ Creating user from auth data');
          const userData = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            favoriteDestinations: [],
            travel_preferences: {},
            phone: null,
            location: null,
            created_at: authUser.created_at,
            role: 'user',
          };
          setUser(userData);
          userRole = userData.role;
        }
      } else {
        console.log('✅ Profile found, setting user data');
        const userData = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          favoriteDestinations: profile.favorite_destinations || [],
          travel_preferences: profile.travel_preferences || {},
          phone: profile.phone,
          location: profile.location,
          created_at: profile.created_at,
          role: profile.role || 'user',
        };
        setUser(userData);
        userRole = userData.role;
      }

      // Handle redirect if needed (but add a delay to ensure session is stable)
      if (shouldRedirect) {
        setTimeout(() => {
          handlePostLoginRedirect(userRole);
        }, 1000); // 1 second delay
      }
    } catch (error) {
      console.error('💥 Unexpected error in fetchUserProfile:', error);
      
      // Even on error, try to create user from auth data
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const userData = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            favoriteDestinations: [],
            travel_preferences: {},
            phone: null,
            location: null,
            created_at: authUser.created_at,
            role: 'user',
          };
          setUser(userData);
          
          if (shouldRedirect) {
            handlePostLoginRedirect(userData.role);
          }
        }
      } catch (fallbackError) {
        console.error('💥 Even auth user fetch failed:', fallbackError);
      }
    } finally {
      console.log('🏁 fetchUserProfile finally block - setting loading to false');
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`, // Keep it simple for now
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      // Fetch profile and redirect
      await fetchUserProfile(data.user.id, true);
    }

    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
      setSession(null);
      // Redirect to home page after sign out
      window.location.href = '/';
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const addToFavorites = async (cityId: string) => {
    if (!user) return;

    const updatedFavorites = [...user.favoriteDestinations, cityId];
    await updateProfile({ favorite_destinations: updatedFavorites });
  };

  const removeFromFavorites = async (cityId: string) => {
    if (!user) return;

    const updatedFavorites = user.favoriteDestinations.filter(id => id !== cityId);
    await updateProfile({ favorite_destinations: updatedFavorites });
  };

  console.log('🎨 AuthProvider rendering with loading:', loading);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updateProfile,
      addToFavorites,
      removeFromFavorites,
    }}>
      {children}
    </AuthContext.Provider>
  );
};