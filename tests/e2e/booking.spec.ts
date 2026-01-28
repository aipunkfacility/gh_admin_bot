import { test, expect } from '@playwright/test';

test.describe('Landing Page Content', () => {
    test('should display excursions and booking buttons', async ({ page }) => {
        // 1. Открываем главную страницу
        await page.goto('/');

        // 2. Проверяем заголовок (site meta) - может быть "Green Hill Tours" или кастомный
        // Вместо жесткого regex используем более гибкий подход
        await expect(page).toHaveTitle(/Green Hill/i);

        // 3. Проверяем наличие секции экскурсий по ID
        const excursionsSection = page.locator('section#excursions');
        await expect(excursionsSection).toBeVisible();

        // 4. Проверяем заголовок секции (<h1> или <h2> в зависимости от верстки)
        // В Excursions.astro это <h2>
        const sectionHeader = excursionsSection.locator('h2');
        await expect(sectionHeader).toContainText(/экскурсии/i);

        // 5. Проверяем наличие карточек услуг
        const serviceCards = page.locator('.service-card');
        await expect(serviceCards.first()).toBeVisible();

        // 6. Проверяем кнопку заказа (WhatsApp)
        // В ServiceCard.astro это кнопка с текстом "Заказать"
        const orderButton = serviceCards.first().locator('button:has-text("Заказать")');
        await expect(orderButton).toBeVisible();

        // Проверка, что кнопка имеет атрибут с WhatsApp ссылкой (через onclick в данном случае)
        const onclickAttr = await orderButton.getAttribute('onclick');
        expect(onclickAttr).toContain('openWhatsApp');
    });
});
