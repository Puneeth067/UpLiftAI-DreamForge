import { createClient } from '@supabase/supabase-js'

// Environment variables configuration
const REQUIRED_ENV_VARS = {
  VITE_CHAT_URL: import.meta.env.VITE_CHAT_URL,
  VITE_CHAT_ANON_KEY: import.meta.env.VITE_CHAT_ANON_KEY,
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
export const chat = createClient(
  REQUIRED_ENV_VARS.VITE_CHAT_URL,
  REQUIRED_ENV_VARS.VITE_CHAT_ANON_KEY,
  
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)



// Optional: Add a simple connection test method if needed
export const testConnection = async () => {
  try {
    const { error } = await chat.from('messages').select('count', { count: 'exact' }).limit(1)
    return !error
  } catch {
    return false
  }
}