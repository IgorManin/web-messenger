import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const REFRESH_COOKIE_NAME = 'refresh'

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (!pathname.startsWith('/chat')) return NextResponse.next()

    const hasRefresh = req.cookies.has(REFRESH_COOKIE_NAME)

    if (!hasRefresh) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/chat/:path*'],
}
