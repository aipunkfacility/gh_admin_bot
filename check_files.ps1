$HOST_NAME = "ganjavagen.beget.tech"
$USER = "ganjavagen"
$REMOTE_PATH = "tours.ganjavagen.beget.tech/public_html"

Write-Host "🔍 Проверяем файлы на сервере..."
ssh $USER@$HOST_NAME "ls -la $REMOTE_PATH"

Write-Host "🏁 Проверь, есть ли в списке index.html"
