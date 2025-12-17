// Cloudflare Pages Middleware - Handles affiliate redirects

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Affiliate Redirects - /go/* paths
  if (url.pathname.startsWith('/go/')) {
    return handleAffiliateRedirect(url.pathname);
  }

  // Pass through to other routes
  return next();
}

// Handle Affiliate Link Redirects
function handleAffiliateRedirect(pathname) {
  // Map of affiliate redirect destinations
  const affiliateMap = {
    // Bandon Dunes
    '/go/bandon-hotels': 'https://www.booking.com/searchresults.html?ss=Bandon+Dunes+Golf+Resort',
    '/go/bandon-flights': 'https://www.google.com/flights?q=flights+to+north+bend+oregon',
    '/go/bandon-car': 'https://www.rentalcars.com/SearchResults.do?city=North+Bend+Oregon',
    
    // Scottsdale
    '/go/scottsdale-hotels': 'https://www.booking.com/searchresults.html?ss=Scottsdale+Arizona',
    '/go/scottsdale-flights': 'https://www.google.com/flights?q=flights+to+phoenix',
    '/go/scottsdale-car': 'https://www.rentalcars.com/SearchResults.do?city=Phoenix+Arizona',
    
    // Las Vegas
    '/go/vegas-hotels': 'https://www.booking.com/searchresults.html?ss=Las+Vegas+Nevada',
    '/go/vegas-flights': 'https://www.google.com/flights?q=flights+to+las+vegas',
    '/go/vegas-car': 'https://www.rentalcars.com/SearchResults.do?city=Las+Vegas+Nevada',
    
    // Palm Springs
    '/go/palmsprings-hotels': 'https://www.booking.com/searchresults.html?ss=Palm+Springs+California',
    '/go/palmsprings-flights': 'https://www.google.com/flights?q=flights+to+palm+springs',
    '/go/palmsprings-car': 'https://www.rentalcars.com/SearchResults.do?city=Palm+Springs+California',
    
    // San Diego
    '/go/sandiego-hotels': 'https://www.booking.com/searchresults.html?ss=Carlsbad+California',
    '/go/sandiego-flights': 'https://www.google.com/flights?q=flights+to+san+diego',
    '/go/sandiego-car': 'https://www.rentalcars.com/SearchResults.do?city=San+Diego+California',
  };

  const destination = affiliateMap[pathname];

  if (destination) {
    return Response.redirect(destination, 302);
  }

  return new Response('Affiliate link not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  });
}

