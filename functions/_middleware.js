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
    '/go/bandon-hotels': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060',
    '/go/bandon-flights': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=flights&ued=https%3A%2F%2Fwww.booking.com%2Fflights%2Findex.html',
    '/go/bandon-car': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=CarRentals&ued=https%3A%2F%2Fwww.booking.com%2Fcars%2Findex.html',
    
    // Scottsdale
    '/go/scottsdale-hotels': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060',
    '/go/scottsdale-flights': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=flights&ued=https%3A%2F%2Fwww.booking.com%2Fflights%2Findex.html',
    '/go/scottsdale-car': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=CarRentals&ued=https%3A%2F%2Fwww.booking.com%2Fcars%2Findex.html',
    
    // Las Vegas
    '/go/vegas-hotels': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060',
    '/go/vegas-flights': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=flights&ued=https%3A%2F%2Fwww.booking.com%2Fflights%2Findex.html',
    '/go/vegas-car': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=CarRentals&ued=https%3A%2F%2Fwww.booking.com%2Fcars%2Findex.html',
    
    // Palm Springs
    '/go/palmsprings-hotels': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060',
    '/go/palmsprings-flights': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=flights&ued=https%3A%2F%2Fwww.booking.com%2Fflights%2Findex.html',
    '/go/palmsprings-car': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=CarRentals&ued=https%3A%2F%2Fwww.booking.com%2Fcars%2Findex.html',
    
    // San Diego
    '/go/sandiego-hotels': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060',
    '/go/sandiego-flights': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=flights&ued=https%3A%2F%2Fwww.booking.com%2Fflights%2Findex.html',
    '/go/sandiego-car': 'https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2697060&campaign=CarRentals&ued=https%3A%2F%2Fwww.booking.com%2Fcars%2Findex.html',
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

