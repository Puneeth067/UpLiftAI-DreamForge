import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders 
    })
  }

  try {
    // Ensure it's a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('DATABASE_URL') ?? '',
      Deno.env.get('DATABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the incoming request body
    const { user_id } = await req.json()

    // Validate user_id is present
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Delete user from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id)
    
    if (authError) {
      throw authError
    }

    // Delete related records in other tables
    await supabase.from('profiles').delete().eq('id', user_id)
    await supabase.from('user_settings').delete().eq('user_id', user_id)
    // Add more table deletions as needed for your specific application

    return new Response(JSON.stringify({ 
      message: 'Account deleted successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Account deletion error:', error)

    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to delete account' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})