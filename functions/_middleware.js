// Cloudflare Worker - Handles lead capture and affiliate redirects

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Lead Capture API Endpoint
    if (url.pathname === '/api/submit-lead' && request.method === 'POST') {
      return handleLeadSubmission(request, env);
    }

    // Affiliate Redirects - /go/* paths
    if (url.pathname.startsWith('/go/')) {
      return handleAffiliateRedirect(url.pathname);
    }

    // Pass through to Pages for all other requests
    return env.ASSETS.fetch(request);
  }
};

// Handle Lead Form Submissions
async function handleLeadSubmission(request, env) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.groupSize || !data.targetDates) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store in KV storage (if configured)
    if (env.LEADS) {
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await env.LEADS.put(leadId, JSON.stringify(data), {
        metadata: {
          email: data.email,
          destination: data.destination,
          timestamp: data.timestamp
        }
      });
    }

    // Send notification email via email worker or service
    // You can integrate with Mailgun, SendGrid, Resend, etc.
    await sendLeadNotification(data, env);

    return new Response(JSON.stringify({ success: true, message: 'Lead captured successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Lead submission error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle Affiliate Link Redirects
function handleAffiliateRedirect(pathname) {
  // Map of affiliate redirect destinations
  // Update these with your actual affiliate URLs
  const affiliateMap = {
    '/go/bandon-hotels': 'https://www.booking.com/searchresults.html?ss=Bandon+Dunes+Golf+Resort',
    '/go/bandon-flights': 'https://www.google.com/flights?q=flights+to+north+bend+oregon',
    '/go/bandon-car': 'https://www.rentalcars.com/SearchResults.do?city=North+Bend+Oregon',
    // Add more affiliate links as needed
  };

  const destination = affiliateMap[pathname];

  if (destination) {
    return Response.redirect(destination, 302);
  }

  // Fallback for undefined affiliate links
  return new Response('Affiliate link not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Send Lead Notification Email
async function sendLeadNotification(data, env) {
  // This is a placeholder - integrate with your email service
  // Options: Cloudflare Email Workers, Resend, SendGrid, Mailgun, etc.
  
  // Example using fetch to an email API:
  /*
  const emailPayload = {
    to: 'contact@ninebefore9.us',
    from: 'leads@ninebefore9.us',
    subject: `New Trip Planning Lead: ${data.destination}`,
    text: `
      New trip planning inquiry:
      
      Name: ${data.name}
      Email: ${data.email}
      Group Size: ${data.groupSize}
      Target Dates: ${data.targetDates}
      Destination: ${data.destination}
      Source: ${data.source}
      Timestamp: ${data.timestamp}
    `
  };

  await fetch('YOUR_EMAIL_API_ENDPOINT', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.EMAIL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });
  */

  // For now, just log it
  console.log('New lead:', data);
}
