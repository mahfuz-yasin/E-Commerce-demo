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
        const { payload } = await jwtVerify(access_token, new TextEncoder().encode(process.env.SECRET_KEY))

        const role = payload.role

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


export const config = {
    matcher: [
        // Admin routes - specific paths to avoid conflicts with website
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