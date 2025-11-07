# Deploy Backend a Render.com (PowerShell)

Write-Host "🚀 Deploy Backend a Render.com" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si render CLI está instalado
$renderInstalled = Get-Command render -ErrorAction SilentlyContinue

if (-not $renderInstalled) {
    Write-Host "📦 Instalando Render CLI..." -ForegroundColor Yellow
    Write-Host "   Por favor, instala manualmente desde: https://render.com/docs/cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   O ejecuta:" -ForegroundColor Yellow
    Write-Host "   winget install Render.RenderCLI" -ForegroundColor Green
    Write-Host ""
    exit 1
}

# Verificar si está logueado
try {
    render whoami | Out-Null
    Write-Host "✅ Render CLI configurado" -ForegroundColor Green
} catch {
    Write-Host "🔐 Necesitas hacer login en Render" -ForegroundColor Yellow
    Write-Host "   Ejecuta: render login" -ForegroundColor Green
    exit 1
}

Write-Host ""
Write-Host "📝 Para crear el servicio, necesitas hacerlo desde el dashboard:" -ForegroundColor Yellow
Write-Host "   1. Ve a https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "   2. Click en 'New +' → 'Web Service'" -ForegroundColor Cyan
Write-Host "   3. Conecta tu repositorio GitHub" -ForegroundColor Cyan
Write-Host "   4. Configura:" -ForegroundColor Cyan
Write-Host "      - Root Directory: backend" -ForegroundColor White
Write-Host "      - Build Command: pip install -r requirements.txt" -ForegroundColor White
Write-Host "      - Start Command: uvicorn app.main:app --host 0.0.0.0 --port `$PORT" -ForegroundColor White
Write-Host "   5. Agrega variables de entorno:" -ForegroundColor Cyan
Write-Host "      - DATABASE_URL" -ForegroundColor White
Write-Host "      - ALLOWED_ORIGINS: https://hackaton-santex.vercel.app,http://localhost:3000" -ForegroundColor White
Write-Host ""

