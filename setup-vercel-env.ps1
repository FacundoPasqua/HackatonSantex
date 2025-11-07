# Configurar variables de entorno en Vercel

Write-Host "🔧 Configurando Vercel" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Verificar si vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar si está logueado
try {
    vercel whoami | Out-Null
    Write-Host "✅ Vercel CLI configurado" -ForegroundColor Green
} catch {
    Write-Host "🔐 Necesitas hacer login en Vercel" -ForegroundColor Yellow
    Write-Host "   Ejecutando: vercel login" -ForegroundColor Green
    vercel login
}

Write-Host ""
Write-Host "📝 Ingresa la URL de tu backend (Render o Railway):" -ForegroundColor Yellow
$backendUrl = Read-Host "URL del backend (ej: https://hackaton-backend.onrender.com)"

if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Host "❌ URL no puede estar vacía" -ForegroundColor Red
    exit 1
}

# Remover trailing slash si existe
$backendUrl = $backendUrl.TrimEnd('/')

Write-Host ""
Write-Host "🔧 Configurando variable de entorno..." -ForegroundColor Yellow

# Ir al directorio frontend
Set-Location frontend

# Agregar variable de entorno
Write-Host "   Agregando VITE_API_URL=$backendUrl" -ForegroundColor White
vercel env add VITE_API_URL production

Write-Host ""
Write-Host "✅ Variable configurada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. El valor que ingresaste fue: $backendUrl" -ForegroundColor White
Write-Host "   2. Si necesitas cambiarlo, ejecuta: vercel env rm VITE_API_URL production" -ForegroundColor White
Write-Host "   3. Luego ejecuta este script de nuevo" -ForegroundColor White
Write-Host "   4. Haz redeploy: vercel --prod" -ForegroundColor White
Write-Host ""

Set-Location ..

