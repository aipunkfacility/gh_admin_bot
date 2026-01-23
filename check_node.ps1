$HOST_NAME = "ganjavagen.beget.tech"
$USER = "ganjavagen"

Write-Host "🔍 Проверяем Node.js на сервере..."
ssh $USER@$HOST_NAME "node -v; npm -v"
