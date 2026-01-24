import { createHmac } from 'node:crypto';

const COOKIE_NAME = 'gh_admin_auth';

/**
 * Генерирует защищенный токен на основе пароля
 */
export function getAuthToken(password: string): string {
    const secret = import.meta.env.ADMIN_PASSWORD || 'fallback-secret';
    return createHmac('sha256', secret)
        .update(password)
        .digest('hex');
}

/**
 * Проверяет авторизацию по кукам
 */
export function checkAuth(request: Request): boolean {
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) return false;

    const cookieHeader = request.headers.get('cookie') || '';
    if (!cookieHeader) return false;

    // Парсим куки
    const cookies: Record<string, string> = Object.fromEntries(
        cookieHeader.split(';').map(c => c.trim().split('='))
    );

    const token = cookies[COOKIE_NAME];
    if (!token) return false;

    // Ожидаемый токен - это HMAC от чистого пароля
    const expectedToken = getAuthToken(ADMIN_PASSWORD);

    return token === expectedToken;
}

/**
 * Ответ для неавторизованных запросов
 */
export function unauthorizedResponse(): Response {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
    });
}
