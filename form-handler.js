// Form Handler for Trip Planning Lead Capture

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('tripPlanningForm');
    
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const formMessage = document.getElementById('formMessage');
        const originalButtonText = submitButton.textContent;
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';
        
        // Collect form data
        const formData = {
            name: form.querySelector('#name').value,
            email: form.querySelector('#email').value,
            groupSize: form.querySelector('#groupSize') ? form.querySelector('#groupSize').value : '',
            targetDates: form.querySelector('#targetDates') ? form.querySelector('#targetDates').value : '',
            destination: form.querySelector('#destination') ? form.querySelector('#destination').value : '',
            notes: form.querySelector('#notes') ? form.querySelector('#notes').value : '',
            timestamp: new Date().toISOString(),
            source: window.location.href
        };
        
        try {
            // Submit to Cloudflare Workers endpoint
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                // Success
                formMessage.textContent = 'Thank you! I\'ll be in touch within 24 hours to discuss your trip.';
                formMessage.className = 'form-message success';
                form.reset();
                
                // Track conversion (if analytics available)
                if (window.gtag) {
                    gtag('event', 'generate_lead', {
                        'event_category': 'Lead Capture',
                        'event_label': formData.destination || 'General Inquiry'
                    });
                }
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            // Error handling
            formMessage.textContent = 'Sorry, something went wrong. Please try again later.';
            formMessage.className = 'form-message error';
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});
