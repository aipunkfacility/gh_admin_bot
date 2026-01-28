/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['src/**/*.test.ts', 'tests/**/*.test.{js,ts}'],
    },
    define: {
        'import.meta.env.ADMIN_PASSWORD': JSON.stringify('test-password'),
    },
});
