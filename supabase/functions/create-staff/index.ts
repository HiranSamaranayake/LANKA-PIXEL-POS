import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // 1. Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 3. Verify caller Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header: Please sign in as an Administrator.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Retrieve environment secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      Deno.env.get('SERVICE_ROLE_KEY') ??
      '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error:
            'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing in Edge Function secrets. Please configure it in your Supabase project.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Authenticate caller JWT using userClient
    const userClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user: callerUser },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired administrator authentication session. Please sign in again.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 6. Initialize privileged Admin Client with service-role key (server-side only)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 7. Verify caller is an active Administrator in public.profiles
    const { data: callerProfile, error: profileCheckError } = await adminClient
      .from('profiles')
      .select('role, status')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (profileCheckError || !callerProfile) {
      return new Response(
        JSON.stringify({ error: 'Access Denied: Caller profile not found in system records.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (callerProfile.role !== 'Admin' || callerProfile.status !== 'Active') {
      return new Response(
        JSON.stringify({
          error: 'Access Denied: Only active Administrators have permission to provision staff accounts.',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 8. Parse and validate input payload
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, password, fullName, role } = body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return new Response(
        JSON.stringify({ error: 'Validation Error: Work email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Validation Error: Password must be at least 6 characters long' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return new Response(
        JSON.stringify({ error: 'Validation Error: Full name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const validRoles = ['Admin', 'Call Center Operator', 'Designer'];
    if (!role || !validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Validation Error: Role must be one of: ${validRoles.join(', ')}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();

    // 9. Check if user already exists in profiles
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: `An account with email "${cleanEmail}" is already registered in the system.` }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 10. Provision account via Supabase Auth Admin API
    // email_confirm: true sets email_confirmed_at = NOW(), allowing staff to sign in immediately!
    const { data: createdAuthData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanFullName,
        role,
        provisioned_by: callerUser.id,
      },
    });

    if (createAuthError || !createdAuthData?.user) {
      return new Response(
        JSON.stringify({ error: createAuthError?.message || 'Failed to create user in Auth system' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const newUserId = createdAuthData.user.id;

    // 11. Explicitly ensure profiles record is updated with verified role and Active status
    const { error: profileUpsertError } = await adminClient.from('profiles').upsert({
      id: newUserId,
      email: cleanEmail,
      full_name: cleanFullName,
      role,
      status: 'Active',
      updated_at: new Date().toISOString(),
    });

    if (profileUpsertError) {
      console.error('Profile upsert warning:', profileUpsertError);
      return new Response(
        JSON.stringify({
          error: `User account created, but profile initialization failed: ${profileUpsertError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 12. Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Staff account successfully created and confirmed.',
        user: {
          id: newUserId,
          email: cleanEmail,
          fullName: cleanFullName,
          role,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

