
import { defineMiddleware } from 'astro/middleware';

const PROTECTED_ROUTES = ['/admin'];
const COOKIE_NAME = 'gh_admin_auth';
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route));

    // Allow access to login page
    if (url.pathname === '/admin/login') {
        // If already logged in with correct token, redirect to dashboard
        if (ADMIN_PASSWORD && cookies.get(COOKIE_NAME)?.value === ADMIN_PASSWORD) {
            return redirect('/admin');
        }
        return next();
    }

    if (isProtectedRoute) {
        const auth = cookies.get(COOKIE_NAME);
        // Verify both existence and value of the cookie
        if (!ADMIN_PASSWORD || auth?.value !== ADMIN_PASSWORD) {
            return redirect('/admin/login');
        }
    }

    return next();
});
