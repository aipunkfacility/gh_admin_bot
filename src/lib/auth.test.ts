import { describe, it, expect, vi } from 'vitest';
import { getAuthToken, checkAuth } from './auth';

describe('auth.ts', () => {
    const TEST_PASSWORD = 'test-password';

    it('should generate consistent HMAC tokens', () => {
        const token1 = getAuthToken(TEST_PASSWORD);
        const token2 = getAuthToken(TEST_PASSWORD);

        expect(token1).toBe(token2);
        expect(token1).toHaveLength(64); // SHA-256 hex length
    });

    it('should validate correct cookies', () => {
        const token = getAuthToken(TEST_PASSWORD);
        const request = new Request('http://localhost', {
            headers: {
                'cookie': `gh_admin_auth=${token}`
            }
        });

        expect(checkAuth(request)).toBe(true);
    });

    it('should reject invalid cookies', () => {
        const request = new Request('http://localhost', {
            headers: {
                'cookie': `gh_admin_auth=wrong-token`
            }
        });

        expect(checkAuth(request)).toBe(false);
    });

    it('should reject if cookie is missing', () => {
        const request = new Request('http://localhost');
        expect(checkAuth(request)).toBe(false);
    });
});
