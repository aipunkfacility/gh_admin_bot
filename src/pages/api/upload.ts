import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { checkAuth, unauthorizedResponse } from '../../lib/auth';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FOLDERS = ['uploads', 'tours', 'hotels', 'rentals', 'services', 'transport', 'posts'];

export const POST: APIRoute = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        let folder = (formData.get('folder') as string) || 'uploads';

        console.log(`[Upload] Starting upload. Folder request: ${folder}`);

        if (!file || !(file instanceof File)) {
            console.error('[Upload] No file received');
            return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
        }

        console.log(`[Upload] File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

        if (file.size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({ error: 'Файл слишком большой (макс 5МБ)' }), { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return new Response(JSON.stringify({ error: 'Неверный формат (только JPG, PNG, WEBP)' }), { status: 400 });
        }

        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return new Response(JSON.stringify({ error: 'Неверное расширение файла' }), { status: 400 });
        }

        // Validate folder
        if (!ALLOWED_FOLDERS.includes(folder)) {
            console.warn(`[Upload] Invalid folder '${folder}', fallback to 'uploads'`);
            folder = 'uploads';
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate safe unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `file-${uniqueSuffix}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public/images', folder);
        console.log(`[Upload] Target dir: ${uploadDir}`);

        try {
            await fs.access(uploadDir);
        } catch {
            console.log(`[Upload] Creating directory: ${uploadDir}`);
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        console.log(`[Upload] Saved to: ${filePath}`);

        return new Response(JSON.stringify({
            url: `/images/${folder}/${filename}`,
            success: true
        }), { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Upload Error:', error);
        return new Response(JSON.stringify({ error: 'Upload failed: ' + errorMessage }), { status: 500 });
    }
};
