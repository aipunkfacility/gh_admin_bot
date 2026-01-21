# Green Hill Tours - Developer Documentation

Техническая документация для разработчиков проекта.

## Архитектура

Проект построен на **Astro SSR** с Node.js адаптером в standalone режиме.

### Режим работы

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' })
});
```

### Структура страниц

```
src/pages/
├── index.astro                    # Главная (публичная)
├── admin/
│   ├── index.astro                # Дашборд админки
│   ├── login.astro                # Страница входа
│   └── [collection]/
│       ├── index.astro            # Список записей
│       ├── [id].astro             # Редактирование
│       └── create.astro           # Создание
└── api/
    ├── auth.js                    # POST /api/auth
    ├── upload.js                  # POST /api/upload
    ├── site-meta/settings.js      # GET|PUT /api/site-meta/settings
    └── [collection]/
        ├── [id].js                # GET|PUT|DELETE /api/{collection}/{id}
        └── reorder.js             # POST /api/{collection}/reorder
```

### Коллекции данных

| Коллекция | Файл | Описание |
|-----------|------|----------|
| excursions | `public/data/excursions.json` | Экскурсии и туры |
| transport-items | `public/data/transport-items.json` | Транспорт для аренды |
| accommodations | `public/data/accommodations.json` | Жилье |
| services | `public/data/services.json` | Дополнительные услуги |
| site-meta | `public/data/site-meta.json` | Настройки сайта |

### Layouts

- **MainLayout.astro** — публичный сайт (Tailwind theme, шрифты, скрипты)
- **AdminLayout.astro** — админ-панель (сайдбар, авторизация)

## Разработка

### Команды

```bash
npm run dev      # Dev-сервер с HMR (порт 4321)
npm run build    # Сборка в dist/
npm run preview  # Просмотр сборки локально
```

### Переменные окружения

```env
ADMIN_PASSWORD=your_secure_password_here
```

### API Endpoints

#### Авторизация
```
POST /api/auth
Body: { password: string }
Response: { success: boolean }
Set-Cookie: admin_token (если успешно)
```

#### CRUD операции
```
GET    /api/{collection}/{id}     # Получить запись
PUT    /api/{collection}/{id}     # Обновить запись
DELETE /api/{collection}/{id}     # Удалить запись
POST   /api/{collection}/reorder  # Изменить порядок
```

#### Загрузка файлов
```
POST /api/upload
Body: FormData { file: File }
Response: { url: string }
```

## Деплой на Beget

### Требования

- Beget VPS или выделенный сервер с SSH доступом
- Node.js 18+ установлен на сервере
- PM2 для управления процессами

### Шаг 1: Подготовка сервера

```bash
# Подключение по SSH
ssh user@your-server.beget.tech

# Установка Node.js (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2
sudo npm install -g pm2
```

### Шаг 2: Настройка GitHub Deploy Key

1. На сервере сгенерируйте SSH-ключ:
   ```bash
   ssh-keygen -t ed25519 -C "deploy@beget"
   cat ~/.ssh/id_ed25519.pub
   ```

2. Добавьте публичный ключ в GitHub:
   - Репозиторий → Settings → Deploy keys → Add deploy key
   - Вставьте ключ, отметьте "Allow write access" если нужно

### Шаг 3: Клонирование и первоначальная настройка

```bash
# Создание директории
mkdir -p /var/www/greenhill
cd /var/www/greenhill

# Клонирование репозитория
git clone git@github.com:YOUR_USERNAME/gh_admin.git .

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
nano .env  # Установите ADMIN_PASSWORD

# Сборка проекта
npm run build
```

### Шаг 4: Настройка PM2

```bash
# Создание ecosystem файла
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'greenhill',
    script: 'dist/server/entry.mjs',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 4321
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
};
EOF

# Запуск приложения
pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
pm2 save

# Автозапуск при перезагрузке сервера
pm2 startup
```

### Шаг 5: Настройка Nginx (прокси)

```bash
sudo nano /etc/nginx/sites-available/greenhill
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location /images/ {
        alias /var/www/greenhill/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/greenhill /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 6: SSL сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Шаг 7: Автоматический деплой через GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Beget

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.BEGET_HOST }}
          username: ${{ secrets.BEGET_USER }}
          key: ${{ secrets.BEGET_SSH_KEY }}
          script: |
            cd /var/www/greenhill
            git pull origin main
            npm install --production
            npm run build
            pm2 restart greenhill
```

Добавьте секреты в GitHub (Settings → Secrets and variables → Actions):
- `BEGET_HOST` — адрес сервера (например: s1.beget.com)
- `BEGET_USER` — имя пользователя SSH
- `BEGET_SSH_KEY` — приватный SSH-ключ

### Ручной деплой

```bash
ssh user@your-server.beget.tech
cd /var/www/greenhill
git pull
npm install
npm run build
pm2 restart greenhill
```

### Полезные команды PM2

```bash
pm2 status              # Статус процессов
pm2 logs greenhill      # Логи приложения
pm2 restart greenhill   # Перезапуск
pm2 stop greenhill      # Остановка
pm2 delete greenhill    # Удаление из PM2
```

## Troubleshooting

### Проблема: Приложение не запускается

```bash
# Проверьте логи
pm2 logs greenhill --lines 50

# Проверьте порт
sudo lsof -i :4321
```

### Проблема: 502 Bad Gateway

```bash
# Убедитесь что приложение запущено
pm2 status

# Проверьте конфиг nginx
sudo nginx -t
```

### Проблема: Права на запись файлов

```bash
# Дайте права на директорию данных
sudo chown -R www-data:www-data /var/www/greenhill/public/data
sudo chmod -R 755 /var/www/greenhill/public
```

---
*Powered by Astro & Antigravity.*
