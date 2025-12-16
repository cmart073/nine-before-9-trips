// Cloudflare Pages Function: /api/get-leads
// Returns all leads from KV storage

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    if (!env.LEADS) {
      return new Response(JSON.stringify({ 
        error: 'KV namespace not configured',
        leads: [] 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // List all keys with 'lead_' prefix
    const list = await env.LEADS.list({ prefix: 'lead_' });
    
    // Fetch all lead data
    const leads = await Promise.all(
      list.keys.map(async (key) => {
        const value = await env.LEADS.get(key.name);
        return value ? JSON.parse(value) : null;
      })
    );

    // Filter out nulls and sort by timestamp (newest first)
    const validLeads = leads
      .filter(lead => lead !== null)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify({ 
      leads: validLeads,
      count: validLeads.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch leads',
      details: error.message,
      leads: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
