// Cloudflare Pages Function to handle golf registration
// Stores submissions in KV and sends email notification

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    
    const submission = {
      id: Date.now().toString(),
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      fullFoursome: formData.get('full-foursome'),
      player1: formData.get('player1'),
      player2: formData.get('player2'),
      player3: formData.get('player3'),
      player4: formData.get('player4'),
      pairingNotes: formData.get('pairing-notes'),
      handicap: formData.get('handicap'),
      notes: formData.get('notes'),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Store in KV (you'll need to bind a KV namespace called GOLF_REGISTRATIONS)
    if (context.env.GOLF_REGISTRATIONS) {
      await context.env.GOLF_REGISTRATIONS.put(
        `registration:${submission.id}`,
        JSON.stringify(submission)
      );
    }
    
    // Send email notification using MailChannels
    try {
      const toEmail = context.env.ADMIN_EMAIL || 'noreply@cmart073.com';
      
      console.log('Attempting to send golf registration email to:', toEmail);
      
      // Build team info
      let teamInfo = '';
      if (submission.fullFoursome === 'yes') {
        teamInfo = `
          <p><strong>Team Members:</strong></p>
          <ul>
            <li>Player 1: ${submission.player1 || 'N/A'}</li>
            <li>Player 2: ${submission.player2 || 'N/A'}</li>
            <li>Player 3: ${submission.player3 || 'N/A'}</li>
            <li>Player 4: ${submission.player4 || 'N/A'}</li>
          </ul>
        `;
      } else {
        teamInfo = `
          <p><strong>Registering as Individual</strong></p>
          ${submission.pairingNotes ? `<p><strong>Pairing notes:</strong> ${submission.pairingNotes}</p>` : ''}
        `;
      }
      
      const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: toEmail, name: 'Chris Martin' }],
          }],
          from: {
            email: 'golf@cmart073.com',
            name: 'Golf Registration',
          },
          subject: `Golf Registration: ${submission.name}`,
          content: [{
            type: 'text/html',
            value: `
              <h2>New Golf Tournament Registration</h2>
              <h3>Contact Information</h3>
              <p><strong>Name:</strong> ${submission.name}</p>
              <p><strong>Email:</strong> ${submission.email}</p>
              <p><strong>Phone:</strong> ${submission.phone}</p>
              
              <h3>Team Information</h3>
              ${teamInfo}
              
              <h3>Golf Level</h3>
              <p><strong>Handicap:</strong> ${submission.handicap}</p>
              
              ${submission.notes ? `
                <h3>Additional Notes</h3>
                <p>${submission.notes}</p>
              ` : ''}
              
              <p><strong>Submitted:</strong> ${new Date(submission.timestamp).toLocaleString()}</p>
              <br>
              <p><a href="https://cmart073.com/golf-admin.html">View in admin panel</a></p>
            `,
          }],
        }),
      });
      
      console.log('Email API response status:', emailResponse.status);
      const emailResult = await emailResponse.text();
      console.log('Email API response:', emailResult);
      
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Continue even if email fails - data is still in KV
    }
    
    // Redirect back with success message
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/martin-memorial-golf-outing/register.html?success=true'
      }
    });
    
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response('Error processing form', { status: 500 });
  }
}
