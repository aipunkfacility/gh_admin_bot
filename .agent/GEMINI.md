# Проект: Green Hill (Admin + Bot)

## Технологии

- **Frontend/Backend**: Astro 5 (Node.js SSR), Tailwind CSS 4
- **Database**: JSON (Local files) - Migration to Supabase planned
- **Telegram**: Telegraf (Node.js), WizardScenes
- **DevOps**: Beget VPS, Nginx, Let's Encrypt (Planned)
- **Quality**: ESLint, TypeScript (Strict), Zod

## Последние обновления

- [2026-01-25]:
  - Проведен глобальный аудит кода.
  - Устранено 50+ ошибок линтинга.
  - Полная типизация Admin API и компонентов (`[id].astro`, `[...slug].astro`).
  - Рефакторинг пагинации в боте (утилита `buildPaginationKeyboard`).
  - Все обработчики бота обернуты в `wrapHandler` для безопасной работы.
  - Добавлен функционал редактора постов для бота в админку.
  - Настроен HTTPS (SSL) через Certbot, активирован редирект.
  - Успешный запуск деплоя на Beget: синхронизация Git, автоматическая сборка и перезапуск PM2.
  - Проект теперь работает в актуальном состоянии на сервере.
  - BACKLOG.md актуализирован.
