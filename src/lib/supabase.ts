import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          favorite_destinations: string[];
          travel_preferences: any;
          phone: string | null;
          location: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          favorite_destinations?: string[];
          travel_preferences?: any;
          phone?: string | null;
          location?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          favorite_destinations?: string[];
          travel_preferences?: any;
          phone?: string | null;
          location?: string | null;
        };
      };
      itineraries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          cities: string[];
          start_date: string;
          end_date: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          cities: string[];
          start_date: string;
          end_date: string;
          is_public?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          cities?: string[];
          start_date?: string;
          end_date?: string;
          is_public?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          city_id: string;
          attraction_id: string | null;
          rating: number;
          comment: string;
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          city_id: string;
          attraction_id?: string | null;
          rating: number;
          comment: string;
          images?: string[];
        };
        Update: {
          rating?: number;
          comment?: string;
          images?: string[];
        };
      };
    };
  };
}