import fs from 'node:fs/promises';
import path from 'node:path';
import { checkAuth, unauthorizedResponse } from '../../lib/auth';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FOLDERS = ['uploads', 'tours', 'hotels', 'rentals', 'services', 'transport'];

export const POST = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        let folder = formData.get('folder') || 'uploads';

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({ error: 'File too large. Maximum size is 5MB' }), { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return new Response(JSON.stringify({ error: 'Invalid file type. Only images allowed' }), { status: 400 });
        }

        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return new Response(JSON.stringify({ error: 'Invalid file extension' }), { status: 400 });
        }

        // Validate folder
        if (!ALLOWED_FOLDERS.includes(folder)) {
            folder = 'uploads';
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Sanitize filename: remove .., /, \ and special characters, keep only letters, numbers, dashes, dots
        const baseName = path.basename(file.name);
        const sanitizedName = baseName
            .replace(/[\\/]/g, '') // Remove slashes
            .replace(/\.\.+/g, '.') // Remove multiple dots
            .replace(/[^a-zA-Z0-9.-]/g, ''); // Keep only safe characters
        
        const filename = sanitizedName;
        const uploadDir = path.join(process.cwd(), 'public/images', folder);

        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);

        return new Response(JSON.stringify({
            url: `/images/${folder}/${filename}`,
            success: true
        }), { status: 200 });

    } catch (error) {
        console.error('Upload Error:', error);
        return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
    }
};
