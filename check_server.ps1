$HOST_NAME = "ganjavagen.beget.tech"
$USER = "ganjavagen"

Write-Host "🔍 Проверяем подключение к серверу..."
Write-Host "➡️ Выполняем: ssh $USER@$HOST_NAME 'pwd; ls -F'"
Write-Host "🔑 Введи пароль, когда попросит:"

ssh $USER@$HOST_NAME "pwd; ls -F"

Write-Host "🏁 Если видишь список папок — подключение работает."
