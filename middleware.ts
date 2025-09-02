import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware() {
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
        
        // For the root path, redirect to login if not authenticated
        if (pathname === '/') {
          if (!token) {
            const url = req.nextUrl.clone()
            url.pathname = '/login'
            return false // Redirect to login
          }
          return true // Allow access to dashboard
        }
        
        // Deny access to all other routes by default
        return false
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
