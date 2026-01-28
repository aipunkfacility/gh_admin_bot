import type { APIRoute } from 'astro';
import { Telegraf } from 'telegraf';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';
import { getItem, saveItem } from '../../../lib/data-store';

export const POST: APIRoute = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const { postId } = await request.json();

        if (!postId) {
            return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 });
        }

        // Get Bot Token
        let token = import.meta.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            token = process.env.TELEGRAM_BOT_TOKEN;
        }

        if (!token) {
            return new Response(JSON.stringify({ error: 'Bot token not configured' }), { status: 500 });
        }

        // Get Channel ID from invalid source? No, getting from site meta
        // Get Channel ID from data-store (Supabase 'settings' table or JSON)
        const meta = await getItem('settings', 'site-meta') as any;
        const channelId = meta?.contacts?.telegramChannel;

        if (!channelId) {
            return new Response(JSON.stringify({ error: 'Telegram Channel ID not configured in Site Settings' }), { status: 400 });
        }

        // Get Post Data
        interface PostItem {
            id: string;
            text?: string;
            image?: string;
            status?: string;
            sentAt?: string;
            tgMessageId?: string;
            [key: string]: unknown;
        }

        const post = await getItem('posts.json', postId) as PostItem;
        if (!post) {
            return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
        }

        const bot = new Telegraf(token);
        let sentMessage;

        // Logic: Send Photo + Text OR Just Text
        const text = post.text as string;
        const image = post.image as string; // Using main image for now

        if (image) {
            // Using absolute URL or local path? Telegraf needs URL or path.
            // If image starts with /images/, we need to construct full URL or file path.
            // For simplicity/reliability in local/dev envs with public folders, using base URL is risky if localhost.
            // Better to use file stream if local?
            // Let's assume URL for now. Beget has domain.

            // To make it robust: if image is relative, prepend domain from site meta or ENV.
            // Or assume bot is running where it can access files? 
            // Telegraf sendPhoto can take { source: 'path/to/file' } 

            let source;
            if (image.startsWith('http')) {
                source = { url: image };
            } else {
                // It's a local file in public/images...
                // We can try sending by URL if domain is KNOWN
                const domain = 'https://greenhill-tours.ru';
                source = { url: `${domain}${image}` };
            }

            try {
                // Resize or use tgImage if available? For now use main image.
                sentMessage = await bot.telegram.sendPhoto(channelId, source, { caption: text, parse_mode: 'Markdown' });
            } catch (imgErr) {
                console.error('Failed to send photo, trying text only', imgErr);
                sentMessage = await bot.telegram.sendMessage(channelId, text, { parse_mode: 'Markdown' });
            }
        } else {
            sentMessage = await bot.telegram.sendMessage(channelId, text, { parse_mode: 'Markdown' });
        }

        // Update Post Status
        const updatedPost = {
            ...post,
            status: 'sent',
            sentAt: new Date().toISOString(),
            tgMessageId: sentMessage.message_id.toString()
        };

        await saveItem('posts.json', updatedPost);

        return new Response(JSON.stringify({ success: true, post: updatedPost }), { status: 200 });

    } catch (error: unknown) {
        console.error('Send Post Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send post';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};
