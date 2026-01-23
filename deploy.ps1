$ErrorActionPreference = "Stop"

# Конфигурация
$HOST_NAME = "ganjavagen.beget.tech"
$SITE_URL = "tours.ganjavagen.beget.tech"
$USER = "ganjavagen"
# Используем относительный путь от домашней папки (без ~/)
$REMOTE_PATH = "tours.ganjavagen.beget.tech/public_html"

Write-Host "🚀 Начинаем деплой на $SITE_URL..." -ForegroundColor Green

# 2. Сборка проекта
Write-Host "📦 Собираем проект (npm run build)..." -ForegroundColor Yellow
cmd /c "npm run build"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Ошибка сборки!"
}

# 3. Загрузка файлов
Write-Host "📤 Загружаем файлы на сервер..." -ForegroundColor Yellow
# Используем простой формат строки без сложных переменных PowerShell внутри аргументов scp
scp -r dist/* public/.htaccess package.json "$($USER)@$($HOST_NAME):$($REMOTE_PATH)"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Ошибка загрузки файлов (scp)!"
}

# 4. Установка зависимостей
Write-Host "📦 Устанавливаем зависимости на сервере..." -ForegroundColor Yellow
$INSTALL_CMD = "export NVM_DIR=`"`$HOME/.nvm`" && [ -s `"`$NVM_DIR/nvm.sh`" ] && \. `"`$NVM_DIR/nvm.sh`" && cd $REMOTE_PATH && npm install --omit=dev"
ssh $USER@$HOST_NAME $INSTALL_CMD

Write-Host "✅ Деплой успешно завершен!" -ForegroundColor Green
Write-Host "🌐 Проверь сайт: https://$SITE_URL" -ForegroundColor Cyan
