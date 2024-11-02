import { createClient } from '@supabase/supabase-js'

// Environment variables configuration
const REQUIRED_ENV_VARS = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Validate all required environment variables
Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      'Please check your .env file and make sure all required variables are defined.'
    )
  }
})

// Initialize Supabase client with validated environment variables
export const supabase = createClient(
  REQUIRED_ENV_VARS.VITE_SUPABASE_URL,
  REQUIRED_ENV_VARS.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Optional: Add error handling for connection issues
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in')
  }
})