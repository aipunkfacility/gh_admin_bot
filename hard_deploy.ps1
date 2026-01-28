
$HostName = "85.198.68.12"
$User = "root"
$RemotePath = "/var/www/greenhill"

Write-Host "🔥 Starting HARD DEPLOY..." -ForegroundColor Red

# Commands to run on server
$Commands = "
    echo '📂 Navigating to $RemotePath...'
    cd $RemotePath
    
    echo '🛑 Stopping PM2...'
    pm2 stop all
    pm2 delete all
    
    echo '🧹 Cleaning...'
    rm -rf node_modules
    rm -rf dist
    rm -rf .astro
    
    echo '⬇️  Git Pull...'
    git pull
    
    echo '📦 Re-installing...'
    npm ci
    
    echo '🏗️  Re-building...'
    npm run build
    
    echo '🚀 Starting PM2 FRESH...'
    # Use ecosystem config if exists, else start script
    if [ -f ecosystem.config.cjs ]; then
        pm2 start ecosystem.config.cjs
    else
        pm2 start dist/server/entry.mjs --name greenhill
    fi
    
    pm2 save
    
    echo '✅ HARD DEPLOY DONE!'
"

# Sanitize
$LinuxCommands = $Commands -replace "`r", ""

Write-Host "2️⃣  Executing Remote Commands. Please enter password for SSH:"
ssh $User@$HostName $LinuxCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host "✨ Success!" -ForegroundColor Green
}
