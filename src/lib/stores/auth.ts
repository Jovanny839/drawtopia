/**
 * Authentication store
 * This module provides reactive authentication state management
 */

import { writable } from 'svelte/store';
import { supabase } from '../supabase';
import { registerUser, registerGoogleOAuthUser } from '../auth';
import type { User, Session } from '@supabase/supabase-js';

// Auth state interface
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true
};

// Create the auth store
export const auth = writable<AuthState>(initialState);

// Initialize auth state and listen for changes
export function initAuth() {
  // Get initial session
  console.log("initAuth");
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log("session", session);
    console.log("user", session?.user);
    auth.update(state => ({
      ...state,
      session,
      user: session?.user ?? null,
      loading: false
    }));
  });

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      // Handle Google OAuth user registration
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        
        // Check if this is a Google OAuth sign-in
        if (user.app_metadata?.provider === 'google') {
          console.log('Google OAuth user detected, registering to database...');
          
          try {
            // Check for pending signup data from sessionStorage
            const pendingSignupData = sessionStorage.getItem('pendingGoogleSignup');
            let result;

            if (pendingSignupData) {
              // User came from signup page with form data
              const formData = JSON.parse(pendingSignupData);
              const userData = {
                id: user.id,
                email: user.email?.toLowerCase().trim(),
                first_name: formData.firstName?.trim(),
                last_name: formData.lastName?.trim(),
                role: formData.accountType,
                google_id: user.user_metadata?.provider_id || user.id,
                created_at: new Date(),
                updated_at: new Date()
              };
              
              // Clear the pending data
              sessionStorage.removeItem('pendingGoogleSignup');
              
              console.log('Registering user with signup form data:', userData);
              result = await registerUser(userData);
            } else {
              // No pending signup data - user signed in directly with Google
              // Register them using data from Google OAuth response
              console.log('No pending signup data found - registering with Google OAuth data');
              result = await registerGoogleOAuthUser(user);
            }

            console.log('User registration result:', result);
            
            if (result.success) {
              console.log('Google OAuth user successfully registered to database');
            } else {
              console.error('Failed to register Google OAuth user:', result.error);
            }
          } catch (error) {
            console.error('Error during Google OAuth user registration:', error);
          }
        }
      }
      
      auth.update(state => ({
        ...state,
        session,
        user: session?.user ?? null,
        loading: false
      }));
    }
  );

  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

// Derived stores for convenience
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const isAuthenticated = writable<boolean>(false);
export const authLoading = writable<boolean>(true);

// Subscribe to main auth store and update derived stores
auth.subscribe(state => {
  console.log("state", state);
  user.set(state.user);
  session.set(state.session);
  isAuthenticated.set(!!state.user);
  authLoading.set(state.loading);
});
