
// Helper to read env vars in both Vite (Client/SSR) and Node (Scripts/Adapter)
import dotenv from 'dotenv';
import path from 'path';

// Load .env in Node context if needed
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
        dotenv.config({ path: path.join(process.cwd(), '.env') });
    } catch (e) { }
}

export const getEnv = (key: string): string | undefined => {
    // 1. Node (process.env) - PRIORITY for SSR/Scripts
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    // 2. Vite (import.meta.env) - Client fallback
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    return undefined;
};
