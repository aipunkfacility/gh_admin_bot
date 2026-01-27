
$HostName = "85.198.68.12"
$User = "root"
$RemotePath = "/var/www/greenhill"

Write-Host "🚀 Starting FINAL Deployment..." -ForegroundColor Green

# 1. Upload Configuration Files
Write-Host "📄 Uploading .env..."
scp .env "$User@$HostName`:$RemotePath/.env"

Write-Host "⚙️  Uploading ecosystem.config.cjs..."
scp ecosystem.config.cjs "$User@$HostName`:$RemotePath/ecosystem.config.cjs"

# 2. Remote Execution
$Commands = "
    echo '📂 Navigating...'
    cd $RemotePath
    
    echo '⬇️  Git Pull...'
    git pull
    
    echo '📦 Installing...'
    npm ci
    
    echo '🏗️  Building...'
    npm run build
    
    echo '🛑 Stopping old processes...'
    pm2 stop greenhill || true
    pm2 delete greenhill || true
    
    echo '🚀 Starting with Ecosystem Config...'
    pm2 start ecosystem.config.cjs
    pm2 save
    
    echo '✅ Deployment Complete!'
"

# Sanitize for Linux
$LinuxCommands = $Commands -replace "`r", ""

Write-Host "2️⃣  Executing Remote Build & Restart. Please enter password for SSH:"
ssh $User@$HostName $LinuxCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host "✨ SUCCESS! Site should be live with Supabase data." -ForegroundColor Green
}
