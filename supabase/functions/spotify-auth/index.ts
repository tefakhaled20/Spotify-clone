
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = '91ba0b65211441fda19b2be218c83971';
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

    if (!clientSecret) {
      console.error('SPOTIFY_CLIENT_SECRET not found');
      return new Response(
        JSON.stringify({ error: 'Spotify configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get access token using Client Credentials flow
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get Spotify token:', tokenResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Spotify' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokenData: SpotifyTokenResponse = await tokenResponse.json();
    
    console.log('Successfully obtained Spotify access token');
    
    return new Response(
      JSON.stringify({ 
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in spotify-auth function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
