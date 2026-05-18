import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const url = request.nextUrl
        
        // Skip middleware for API routes - they handle their own auth
        if (pathname.startsWith('/api')) {
            return NextResponse.next()
        }
        
        const hasToken = request.cookies.has('access_token')

        // Capture UTM parameters, fbclid, ttclid, and gclid
        const utmParams = {
            utm_source: url.searchParams.get('utm_source'),
            utm_medium: url.searchParams.get('utm_medium'),
            utm_campaign: url.searchParams.get('utm_campaign'),
            utm_term: url.searchParams.get('utm_term'),
            utm_content: url.searchParams.get('utm_content'),
            fbclid: url.searchParams.get('fbclid'),
            ttclid: url.searchParams.get('ttclid'),
            gclid: url.searchParams.get('gclid')
        }

        // Store UTM parameters in cookies if they exist (30 days)
        const response = NextResponse.next()
        
        Object.entries(utmParams).forEach(([key, value]) => {
            if (value && !request.cookies.has(key)) {
                const maxAge = key === 'gclid' ? 90 * 24 * 60 * 60 : 30 * 24 * 60 * 60 // gclid: 90 days, others: 30 days
                response.cookies.set(key, value, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: maxAge
                })
            }
        })

        // Google Conversion Linker: Auto-add gclid to internal links if present
        const gclidCookie = request.cookies.get('gclid')?.value
        if (gclidCookie) {
            const url = request.nextUrl
            // Don't add gclid to API routes or static assets
            if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
                if (!url.searchParams.has('gclid')) {
                    url.searchParams.set('gclid', gclidCookie)
                    return NextResponse.redirect(url)
                }
            }
        }

        // Check for protected routes
        if (!hasToken) {
            // Public routes that don't require authentication
            const publicRoutes = ['/', '/shop', '/product-details', '/profile', '/about', '/contact', '/blog']
            const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
            
            // Allow access to public routes and auth routes without login
            if (isPublicRoute || pathname.startsWith('/auth')) {
                return response
            }
            
            // Protect admin routes
            const adminRoutes = ['/admin']
            const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
            
            // Protect user account routes
            const userProtectedRoutes = ['/my-account']
            const isUserProtectedRoute = userProtectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
            
            if (isAdminRoute || isUserProtectedRoute) {
                return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
            }
            
            return response
        }

        // verify token 
        const access_token = request.cookies.get('access_token').value
        const jwtResult = await jwtVerify(access_token, new TextEncoder().encode(process.env.SECRET_KEY))
        const payload = jwtResult?.payload

        const role = payload?.role

        // prevent logged-in users from accessing auth routes 
        if (pathname.startsWith('/auth')) {
            return NextResponse.redirect(new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl))
        }


        // protect admin routes (dashboard, product, product-variant, category, coupon, media, customers, review, admin-orders, trash)
        const adminRoutes = ['/dashboard', '/product', '/product-variant', '/category', '/coupon', '/media', '/customers', '/review', '/admin-orders', '/trash']
        const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
        if (isAdminRoute && role !== 'admin') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }


        // protect user route  

        if (pathname.startsWith('/my-account') && role !== 'user') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }

        return response

    } catch (error) {
        console.error('Middleware error:', error)
        return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
    }
}

export const config = {
    matcher: [
        // Match all routes except API routes, static files, and images
        '/((?!api|_next|favicon|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
    ]
}