import { describe, it, expect } from 'vitest';

/**
 * Имитация функции генерации (которую будет выполнять ИИ согласно SKILL.md)
 * Здесь мы тестируем критерии приемки.
 */
describe('SEO Generator Acceptance Criteria', () => {

    const validateSEO = (text) => {
        const length = text.length;
        const hasLocation = text.toLowerCase().includes('муйне') || text.toLowerCase().includes('вьетнам');
        const hasAction = /забронируйте|купите|узнайте|закажите/i.test(text);

        return {
            isValidLength: length >= 140 && length <= 165, // Небольшой допуск сверх 160
            hasKeywords: hasLocation,
            hasCTA: hasAction,
            length
        };
    };

    it('should meet SEO requirements for a typical excursion', () => {
        const generatedSEO = "Экскурсия в Далат из Муйне: водопады, кофейные плантации и Crazy House с русским гидом. Узнайте настоящий Вьетнам с Green Hill! Забронируйте онлайн.";
        const result = validateSEO(generatedSEO);

        expect(result.isValidLength).toBe(true);
        expect(result.hasKeywords).toBe(true);
        expect(result.hasCTA).toBe(true);
    });

    it('should fail if text is too short', () => {
        const result = validateSEO("Тур в Далат. Муйне.");
        expect(result.isValidLength).toBe(false);
    });
});
