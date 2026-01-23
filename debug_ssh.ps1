$HOST_NAME = "ganjavagen.beget.tech"
$USER = "ganjavagen"

Write-Host "🔍 Probing SSH shell..."
# -tt forces TTY allocation, which helps with some restricted shells
ssh -tt $USER@$HOST_NAME "echo 'SHELL_ACTIVE'; echo 'PATH: '$PATH; which node; node -v; npm -v; echo 'DONE'"
