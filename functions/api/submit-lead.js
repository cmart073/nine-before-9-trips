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

    // Create lead ID
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const leadData = {
      id: leadId,
      name: data.name,
      email: data.email,
      destination: data.destination || 'Not specified',
      groupSize: data.groupSize || 'Not specified',
      targetDates: data.targetDates || 'Not specified',
      notes: data.notes || '',
      source: data.source || 'Unknown',
      timestamp: timestamp,
      submitted: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
    };

    // Store in KV storage (if configured)
    if (env.LEADS) {
      try {
        await env.LEADS.put(leadId, JSON.stringify(leadData), {
          metadata: {
            email: data.email,
            destination: data.destination || 'General',
            timestamp: timestamp
          }
        });
        console.log('Lead stored in KV:', leadId);
      } catch (kvError) {
        console.error('KV storage failed:', kvError);
      }
    }

    // Log to console (visible in Cloudflare dashboard)
    console.log('=== NEW LEAD SUBMISSION ===');
    console.log(`Name: ${leadData.name}`);
    console.log(`Email: ${leadData.email}`);
    console.log(`Destination: ${leadData.destination}`);
    console.log(`Group Size: ${leadData.groupSize}`);
    console.log(`Target Dates: ${leadData.targetDates}`);
    if (leadData.notes) console.log(`Notes: ${leadData.notes}`);
    console.log(`Submitted: ${leadData.submitted}`);
    console.log('===========================');

    // Send email notification (using a working method)
    await sendEmailNotification(leadData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Thank you! Your inquiry has been submitted.',
      leadId: leadId
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

// Send Email Notification using webhook
async function sendEmailNotification(data) {
  // For now, just log. You can add webhook integration later
  // Options: Zapier webhook, Make.com webhook, or n8n
  
  console.log('Email notification would be sent to: cmart073@gmail.com');
  console.log('Lead details:', JSON.stringify(data, null, 2));
  
  // Example webhook integration (uncomment and add your webhook URL):
  /*
  try {
    await fetch('YOUR_ZAPIER_OR_MAKE_WEBHOOK_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Webhook failed:', error);
  }
  */
}
