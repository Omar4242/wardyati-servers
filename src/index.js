export { SnipeObject } from './snipe-object.js';

// CORS headers - adjust allowed origin as needed
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // or 'chrome-extension://YOUR_EXTENSION_ID'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    if (url.pathname === '/schedule' && request.method === 'POST') {
      const response = await handleSchedule(request, env);
      // Add CORS headers to response
      return new Response(response.body, {
        status: response.status,
        headers: { ...response.headers, ...corsHeaders }
      });
    }
    
    return new Response('Sniper ready', { 
      status: 200,
      headers: corsHeaders 
    });
  }
};

async function handleSchedule(request, env) {
  try {
    const data = await request.json();
    
    if (data.secret !== env.SNIPER_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    const id = env.SNIPE_OBJECT.newUniqueId();
    const stub = env.SNIPE_OBJECT.get(id);
    
    await stub.fetch('https://dummy/schedule', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return new Response(JSON.stringify({ success: true, snipeId: id.toString() }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
