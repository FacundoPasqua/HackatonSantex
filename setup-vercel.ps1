# Script simple para configurar Vercel automáticamente

Write-Host "🔧 Configurando Vercel para el Frontend" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host ""
}

# Verificar login
try {
    $user = vercel whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logueado como: $user" -ForegroundColor Green
    } else {
        throw "Not logged in"
    }
} catch {
    Write-Host "🔐 Necesitas hacer login en Vercel" -ForegroundColor Yellow
    Write-Host "   Abriendo navegador para login..." -ForegroundColor White
    vercel login
    Write-Host ""
}

Write-Host ""
Write-Host "📝 Ingresa la URL de tu backend:" -ForegroundColor Yellow
Write-Host "   Ejemplo: https://hackaton-backend.onrender.com" -ForegroundColor Gray
Write-Host "   O: https://hackatonsantex-production.up.railway.app" -ForegroundColor Gray
Write-Host ""
$backendUrl = Read-Host "URL del backend"

if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Host "❌ URL no puede estar vacía" -ForegroundColor Red
    exit 1
}

# Remover trailing slash
$backendUrl = $backendUrl.TrimEnd('/')

Write-Host ""
Write-Host "🔧 Configurando variable de entorno..." -ForegroundColor Yellow

# Ir al directorio frontend
Push-Location frontend

# Agregar variable de entorno
Write-Host "   Agregando: VITE_API_URL = $backendUrl" -ForegroundColor White
Write-Host "   (Te pedirá el valor, pega: $backendUrl)" -ForegroundColor Gray
Write-Host ""

vercel env add VITE_API_URL production

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Variable configurada!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Haciendo redeploy..." -ForegroundColor Yellow
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Deploy completado!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  El redeploy falló, pero la variable está configurada" -ForegroundColor Yellow
        Write-Host "   Puedes hacer redeploy manual desde el dashboard de Vercel" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "⚠️  No se pudo agregar la variable automáticamente" -ForegroundColor Yellow
    Write-Host "   Configúrala manualmente:" -ForegroundColor White
    Write-Host "   1. Ve a: https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host "   2. Selecciona tu proyecto" -ForegroundColor Cyan
    Write-Host "   3. Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host "   4. Agrega: VITE_API_URL = $backendUrl" -ForegroundColor Cyan
}

Pop-Location

Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor Cyan
Write-Host "   Backend URL: $backendUrl" -ForegroundColor White
Write-Host "   Frontend: Ve a tu dashboard de Vercel para ver la URL" -ForegroundColor White
Write-Host ""

