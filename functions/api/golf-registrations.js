// API endpoint to list all golf registrations
export async function onRequestGet(context) {
  try {
    if (!context.env.GOLF_REGISTRATIONS) {
      return new Response(JSON.stringify({ error: 'KV not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // List all registration keys
    const list = await context.env.GOLF_REGISTRATIONS.list({ prefix: 'registration:' });
    
    // Fetch all registrations
    const registrations = await Promise.all(
      list.keys.map(async (key) => {
        const data = await context.env.GOLF_REGISTRATIONS.get(key.name);
        return JSON.parse(data);
      })
    );
    
    // Sort by timestamp, newest first
    registrations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return new Response(JSON.stringify(registrations), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
