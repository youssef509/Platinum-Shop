export { lightweightAuth as middleware } from '@/auth-lightweight';

export const config = {
  // Matcher telling Next.js which routes use Middleware
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - images (public images)
     * - api routes that shouldn't be protected
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}