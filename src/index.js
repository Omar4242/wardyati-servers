export { SnipeObject } from './snipe-object.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/schedule' && request.method === 'POST') {
      return await handleSchedule(request, env);
    }
    
    return new Response('Sniper ready', { status: 200 });
  }
};

async function handleSchedule(request, env) {
  const data = await request.json(); // { targetTime, wardyatiEndpoint, method, headers, body, secret }
  
  // Security: only accept from your extension
  if (data.secret !== env.SNIPER_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const id = env.SNIPE_OBJECT.newUniqueId();
  const stub = env.SNIPE_OBJECT.get(id);
  
  // Tell the Durable Object to store the request and set alarm
  await stub.fetch('https://dummy/schedule', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  return new Response(JSON.stringify({ success: true, snipeId: id.toString() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
