import { readJsonFile, writeJsonFile } from '../../../lib/bot/utils.js';

export const prerender = false;

export async function GET({ cookies }) {
    // Проверяем авторизацию
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
    const isAuth = ADMIN_PASSWORD && cookies.get('gh_admin_auth')?.value === ADMIN_PASSWORD;

    if (!isAuth) {
        return new Response(null, {
            status: 302,
            headers: { Location: '/admin/login' }
        });
    }

    return new Response(null, { status: 200 });
}

export async function POST({ request, cookies }) {
    // Проверяем авторизацию
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
    const isAuth = ADMIN_PASSWORD && cookies.get('gh_admin_auth')?.value === ADMIN_PASSWORD;

    if (!isAuth) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const data = await request.json();
        const { type, payload } = data;

        if (type === 'rates') {
            // Сохранение курсов валют
            await writeJsonFile('rates.json', payload);
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (type === 'admins') {
            // Сохранение списка администраторов
            await writeJsonFile('admins.json', payload);
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid type' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Settings API error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
