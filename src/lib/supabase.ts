/**
 * Supabase client configuration
 * This module provides the Supabase client for authentication and database operations
 */

import { createClient } from '@supabase/supabase-js';


// Create Supabase client
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
export const supabaseAdmin = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
// Database types (you can expand these based on your schema)
export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  google_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

// Export commonly used types from Supabase
export type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
