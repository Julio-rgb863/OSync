import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login']
const ADMIN_ONLY = ['/usuarios']

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session?.user
  const isPublic = PUBLIC_ROUTES.some((r) => nextUrl.pathname.startsWith(r))

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  if (ADMIN_ONLY.some((r) => nextUrl.pathname.startsWith(r))) {
    const role = (session?.user as { role?: string })?.role
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
