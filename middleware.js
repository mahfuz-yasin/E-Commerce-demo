import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const url = request.nextUrl
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
            // if the user is not loggedin and trying to access a protected route, redirect to login page. 
            if (!pathname.startsWith('/auth')) {
                return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
            }
            return response // Allow access to auth routes if not logged in. 
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
        console.log(error)
        return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
    }
}

// Apply security headers to all responses
export async function securityMiddleware(request) {
    const response = NextResponse.next()
    
    // Content Security Policy
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://res.cloudinary.com https://*.facebook.com https://*.google.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://*.facebook.com https://*.google-analytics.com https://*.google.com",
        "frame-src 'self' https://www.facebook.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ].join('; ')
    
    // Set security headers
    response.headers.set('Content-Security-Policy', cspDirectives)
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()')
    
    return response
}


export const config = {
    matcher: [
        // Admin routes - include /admin prefix
        '/admin/:path*',
        // Legacy admin routes for compatibility
        '/dashboard', '/dashboard/:path*',
        '/product', '/product/add', '/product/edit/:path*',
        '/product-variant', '/product-variant/:path*',
        '/category', '/category/:path*',
        '/coupon', '/coupon/:path*',
        '/media', '/media/:path*',
        '/customers', '/customers/:path*',
        '/review', '/review/:path*',
        '/admin-orders', '/admin-orders/:path*',
        '/trash', '/trash/:path*',
        '/slider', '/slider/:path*',
        // User routes
        '/my-account/:path*',
        '/auth/:path*'
    ]
}