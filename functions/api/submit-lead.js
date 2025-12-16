// Cloudflare Pages Function: /api/submit-lead
// This handles POST requests to /api/submit-lead

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Store in KV storage (if configured)
    if (env.LEADS) {
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await env.LEADS.put(leadId, JSON.stringify(data), {
        metadata: {
          email: data.email,
          destination: data.destination || 'General',
          timestamp: data.timestamp
        }
      });
    }

    // Send notification email
    await sendLeadNotification(data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Thank you! Your inquiry has been submitted.' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Lead submission error:', error);
    return new Response(JSON.stringify({ 
      error: 'Something went wrong. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// Send Lead Notification Email
async function sendLeadNotification(data) {
  const emailBody = `
New Trip Planning Inquiry

Name: ${data.name}
Email: ${data.email}
Destination: ${data.destination || 'Not specified'}
Group Size: ${data.groupSize || 'Not specified'}
Target Dates: ${data.targetDates || 'Not specified'}
${data.notes ? `Additional Notes: ${data.notes}` : ''}

Source: ${data.source || 'Unknown'}
Timestamp: ${data.timestamp || new Date().toISOString()}

Reply directly to ${data.email} to follow up.
  `.trim();

  // Always log to console (visible in Cloudflare Workers logs)
  console.log('New lead submission:', JSON.stringify(data, null, 2));

  // Send email using MailChannels (Cloudflare's free email service for Pages)
  try {
    const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
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
          name: 'Nine Before 9 Trips'
        },
        subject: `New Trip Inquiry: ${data.destination || 'General'} - ${data.name}`,
        content: [{
          type: 'text/plain',
          value: emailBody
        }]
      })
    });

    if (emailResponse.ok) {
      console.log('Email sent successfully to cmart073@gmail.com');
    } else {
      const errorText = await emailResponse.text();
      console.error('Email sending failed:', errorText);
    }
  } catch (emailError) {
    console.error('Email sending error:', emailError);
  }
}
