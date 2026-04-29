import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const hasToken = request.cookies.has('access_token')

        if (!hasToken) {
            // if the user is not loggedin and trying to access a protected route, redirect to login page. 
            if (!pathname.startsWith('/auth')) {
                return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
            }
            return NextResponse.next() // Allow access to auth routes if not logged in. 
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

        return NextResponse.next()

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
        // User routes
        '/my-account/:path*',
        '/auth/:path*'
    ]
}