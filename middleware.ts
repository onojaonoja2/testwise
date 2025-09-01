import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to auth pages without token
        if (pathname.startsWith('/login') || 
            pathname.startsWith('/register')) {
          return true
        }
        
        // Require token for protected routes (dashboard pages and tests)
        if (pathname.startsWith('/tests')) {
          return !!token
        }
        
        // For the root path, check if it's the dashboard (authenticated) or landing (public)
        if (pathname === '/') {
          // If user has token, allow access to dashboard
          // If no token, they should be redirected to landing page
          return true // Let the component handle the logic
        }
        
        // Default allow for other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
