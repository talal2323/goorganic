import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('authToken')?.value;
    const userCookie = request.cookies.get('user')?.value;

    let user = null;
    let userRole = 'guest';

    if (userCookie) {
        try {
            user = JSON.parse(userCookie);
            const roles = Array.isArray(user.roles) ? user.roles : [];
            userRole = roles.includes('admin') ? 'admin' :
                roles.includes('vendor') ? 'vendor' :
                    roles.includes('customer') ? 'customer' : 'guest';
        } catch (e) {
            console.error('Failed to parse user cookie:', e);
        }
    }

    const { pathname } = request.nextUrl;

    // Protected routes
    const isVendorRoute = pathname.startsWith('/vendor');
    const isAdminRoute = pathname.startsWith('/admin');
    const isAuthRoute = pathname.startsWith('/auth');
    const isProfileRoute = pathname === '/profile' || pathname === '/orders';

    // Redirect authenticated users away from auth pages (only if token AND valid user data)
    if (isAuthRoute && token && user && userRole !== 'guest') {
        // Prevent redirect loop by checking if we just came from a protected route
        const referer = request.headers.get('referer');
        const isComingFromProtectedRoute = referer && (referer.includes('/admin') || referer.includes('/vendor'));

        if (!isComingFromProtectedRoute) {
            if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (userRole === 'vendor') {
                return NextResponse.redirect(new URL('/vendor', request.url));
            }
            return NextResponse.redirect(new URL('/shop', request.url));
        }
    }

    // Protect vendor routes
    if (isVendorRoute && (userRole !== 'vendor' || !token)) {
        return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }

    // Protect admin routes
    if (isAdminRoute && (userRole !== 'admin' || !token)) {
        return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }

    // Protect profile/order routes (require customer or vendor or admin)
    if (isProfileRoute && userRole === 'guest') {
        return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }

    // Add no-cache headers for protected routes to prevent back button cache
    if (isVendorRoute || isAdminRoute || isProfileRoute) {
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/vendor/:path*',
        '/admin/:path*',
        '/auth/:path*',
        '/profile',
        '/orders',
    ],
};
