# Green Hill Tours & Travel

Современный сайт для туристического агентства в Муйне, Вьетнам. Построен на базе **Astro SSR** с полноценной админ-панелью для управления контентом.

## О проекте

Сайт работает в режиме Server-Side Rendering (SSR) с Node.js адаптером, что позволяет динамически управлять контентом через админ-панель без необходимости пересборки.

### Ключевые возможности

- **Astro 5.0+ SSR**: Серверный рендеринг с Node.js адаптером
- **Админ-панель**: Полноценная CMS для управления контентом
- **Tailwind CSS 4**: Современный адаптивный дизайн
- **JSON-based storage**: Данные хранятся в JSON-файлах
- **Drag & Drop**: Сортировка элементов в админке
- **Загрузка изображений**: Встроенная система загрузки файлов
- **Интеграция с WhatsApp/Telegram**: Прямая связь с менеджерами

## Технологии

- **Framework**: [Astro](https://astro.build/) (SSR mode)
- **Adapter**: @astrojs/node (standalone)
- **Styling**: Tailwind CSS 4
- **Icons**: Remix Icon
- **Drag & Drop**: SortableJS

## Быстрый старт

1. **Установка зависимостей**:
    ```bash
    npm install
    ```

2. **Настройка окружения**:
    ```bash
    cp .env.example .env
    # Установите ADMIN_PASSWORD в .env
    ```

3. **Запуск в режиме разработки**:
    ```bash
    npm run dev
    ```

4. **Сборка проекта**:
    ```bash
    npm run build
    ```

5. **Запуск production**:
    ```bash
    node dist/server/entry.mjs
    ```

## Структура проекта

```
├── src/
│   ├── pages/
│   │   ├── index.astro          # Главная страница
│   │   ├── admin/               # Админ-панель
│   │   │   ├── index.astro      # Дашборд
│   │   │   ├── login.astro      # Авторизация
│   │   │   └── [collection]/    # CRUD для коллекций
│   │   └── api/                 # API endpoints
│   │       ├── auth.js          # Авторизация
│   │       ├── upload.js        # Загрузка файлов
│   │       └── [collection]/    # CRUD API
│   ├── sections/                # Секции главной страницы
│   ├── components/              # Переиспользуемые компоненты
│   └── layouts/                 # Макеты (Main, Admin)
├── public/
│   ├── data/                    # JSON данные
│   │   ├── excursions.json
│   │   ├── transport-items.json
│   │   ├── accommodations.json
│   │   ├── services.json
│   │   └── site-meta.json
│   └── images/                  # Статические изображения
└── dist/                        # Сборка (после build)
```

## Админ-панель

Доступ: `/admin`

### Разделы управления:
- **Экскурсии** — туры и поездки
- **Транспорт** — аренда транспорта
- **Жилье** — отели и апартаменты
- **Услуги** — дополнительные сервисы
- **Настройки** — общие настройки сайта

### Возможности:
- Создание/редактирование/удаление записей
- Drag & Drop сортировка
- Загрузка изображений
- Визуальный редактор

---
*Created and maintained by Antigravity AI.*
