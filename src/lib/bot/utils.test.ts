import { describe, it, expect } from 'vitest';
import {
    formatNumber,
    validateNumberInput,
    paginate,
    escapeMarkdown,
    validateItemId,
    buildPaginationKeyboard
} from './utils';

describe('bot/utils.js', () => {

    describe('formatNumber', () => {
        it('should format thousands with spaces', () => {
            expect(formatNumber(1000)).toBe('1 000');
            expect(formatNumber(1000000)).toBe('1 000 000');
            expect(formatNumber(123)).toBe('123');
        });
    });

    describe('validateNumberInput', () => {
        it('should clean and parse valid numeric input', () => {
            expect(validateNumberInput('1 000')).toBe(1000);
            expect(validateNumberInput('1.000')).toBe(1000);
            expect(validateNumberInput('1,000')).toBe(1000);
            expect(validateNumberInput('  500  ')).toBe(500);
        });

        it('should return null for non-numeric input', () => {
            expect(validateNumberInput('abc')).toBeNull();
            expect(validateNumberInput('100a')).toBeNull();
            expect(validateNumberInput('')).toBeNull();
        });
    });

    describe('paginate', () => {
        const items = [1, 2, 3, 4, 5, 6, 7];

        it('should return correct slice for first page', () => {
            const res = paginate(items, 1, 3) as any;
            expect(res.items).toEqual([1, 2, 3]);
            expect(res.currentPage).toBe(1);
            expect(res.totalPages).toBe(3);
            expect(res.hasNext).toBe(true);
            expect(res.hasPrev).toBe(false);
        });

        it('should return correct slice for last page', () => {
            const res = paginate(items, 3, 3) as any;
            expect(res.items).toEqual([7]);
            expect(res.currentPage).toBe(3);
            expect(res.hasNext).toBe(false);
            expect(res.hasPrev).toBe(true);
        });
    });

    describe('escapeMarkdown', () => {
        it('should escape markdown special characters', () => {
            expect(escapeMarkdown('Hello *World*')).toBe('Hello \\*World\\*');
            expect(escapeMarkdown('Price_is_low')).toBe('Price\\_is\\_low');
            expect(escapeMarkdown('Use `backticks`')).toBe('Use \\`backticks\\`');
        });

        it('should handle null or undefined', () => {
            expect(escapeMarkdown(null as any)).toBe('');
            expect(escapeMarkdown(undefined as any)).toBe('');
        });
    });

    describe('validateItemId', () => {
        it('should allow valid IDs', () => {
            expect(validateItemId('my-item-123')).toBe(true);
            expect(validateItemId('simple')).toBe(true);
        });

        it('should reject invalid IDs', () => {
            expect(validateItemId('with spaces')).toBe(false);
            expect(validateItemId('with_underscore')).toBe(false);
            expect(validateItemId('')).toBe(false);
            expect(validateItemId('a'.repeat(51))).toBe(false);
        });
    });

    describe('buildPaginationKeyboard', () => {
        it('should generate keyboard with navigation buttons', () => {
            const pagination = {
                currentPage: 2,
                totalPages: 3,
                hasNext: true,
                hasPrev: true
            };
            const kb = buildPaginationKeyboard('test', pagination);

            expect(kb[0]).toHaveLength(3); // [Back, Page, Next]
            expect(kb[0][0].text).toContain('Назад');
            expect(kb[0][0].callback_data).toBe('test_page_1');
            expect(kb[0][2].text).toContain('Далее');
            expect(kb[0][2].callback_data).toBe('test_page_3');
        });

        it('should not include nav buttons if only one page', () => {
            const pagination = {
                currentPage: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            };
            const kb = buildPaginationKeyboard('test', pagination);
            expect(kb).toHaveLength(0);
        });
    });
});
