@echo off
chcp 65001 > nul
echo ========================================================
echo 🚀 STARTING MANUAL DEPLOYMENT
echo ========================================================
echo.
echo 🔑 PASSWORD FOR ROOT: oVp89bZUg3N%%
echo (Copy this password if asked)
echo.
echo 1. Copying utils.js to server...
scp src/lib/bot/utils.js root@85.198.68.12:/var/www/greenhill/src/lib/bot/utils.js
if %errorlevel% neq 0 (
    echo ❌ SCP Failed!
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Restarting Bot process...
ssh root@85.198.68.12 "pm2 restart greenhill-bot"
if %errorlevel% neq 0 (
    echo ❌ SSH Failed!
    pause
    exit /b %errorlevel%
)

echo.
echo 3. Checking logs...
ssh root@85.198.68.12 "pm2 logs greenhill-bot --lines 20 --nostream"

echo.
echo ✅ DEPLOY FINISHED SUCCESSFULLY!
pause
