import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login']
  
  // API routes that require API key authentication
  const apiRoutes = ['/api/gemini', '/api/v1', '/api/hf']
  
  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Check if it's an API route that requires API key
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next() // Let the API route handle authentication
  }
  
  // For dashboard routes, check session
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
    const session = await getSession()
    
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}