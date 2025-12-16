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
  // Email notification to cmart073@gmail.com
  // Using Cloudflare Email Workers or external email API
  
  const emailBody = `
New Trip Planning Inquiry

Name: ${data.name}
Email: ${data.email}
Destination: ${data.destination || 'Not specified'}
Group Size: ${data.groupSize || 'Not specified'}
Target Dates: ${data.targetDates || 'Not specified'}
${data.notes ? `Additional Notes: ${data.notes}` : ''}

Source: ${data.source}
Timestamp: ${data.timestamp}

Reply directly to ${data.email} to follow up.
  `.trim();

  // Option 1: Using Cloudflare Email Workers (if configured)
  // Requires email routing setup in Cloudflare dashboard
  if (env.EMAIL_ENABLED) {
    try {
      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: 'cmart073@gmail.com', name: 'Nine Before 9 Trips' }],
            reply_to: { email: data.email, name: data.name }
          }],
          from: {
            email: 'leads@ninebefore9.us',
            name: 'Nine Before 9 Trips Lead Form'
          },
          subject: `New Trip Inquiry: ${data.destination || 'General'} - ${data.name}`,
          content: [{
            type: 'text/plain',
            value: emailBody
          }]
        })
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
  }
  
  // Always log to console (visible in Cloudflare Workers logs)
  console.log('New lead submission:', JSON.stringify(data, null, 2));
}
