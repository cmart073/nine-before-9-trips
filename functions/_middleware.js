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
    '/go/bandon-hotels': 'https://www.booking.com/searchresults.html?ss=Bandon+Dunes+Golf+Resort',
    '/go/bandon-flights': 'https://www.google.com/flights?q=flights+to+north+bend+oregon',
    '/go/bandon-car': 'https://www.rentalcars.com/SearchResults.do?city=North+Bend+Oregon',
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

