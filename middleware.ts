import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const ADMIN_EMAILS = ['filatei@gtsng.com', 'filatei@gmail.com', 'filatei@torama.ng'];

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

        if (isAdminRoute) {
            if (!token) {
                return NextResponse.redirect(new URL('/auth/signin', req.url));
            }

            const isAdmin = ADMIN_EMAILS.includes(token.email as string);
            if (!isAdmin) {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ['/admin/:path*'],
}; 