$HOST_NAME = "ganjavagen.beget.tech"
$USER = "ganjavagen"

Write-Host "🚀 Устанавливаем Node.js через NVM..."

# Команда делает 3 вещи:
# 1. Скачивает и ставит NVM (менеджер версий Node.js)
# 2. Активирует его
# 3. Ставит Node.js 20
# 4. Проверяет версию

$COMMAND = 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 20 && node -v && npm -v'

ssh $USER@$HOST_NAME $COMMAND

Write-Host "🏁 Если видишь версию (v20...), значит победа!"
