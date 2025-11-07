# Script principal para deploy completo

Write-Host "🚀 Deploy Completo - Backend y Frontend" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar herramientas
Write-Host "📋 Paso 1: Verificando herramientas..." -ForegroundColor Yellow

$tools = @{
    "Node.js" = "node"
    "npm" = "npm"
    "Git" = "git"
}

$missing = @()
foreach ($tool in $tools.GetEnumerator()) {
    $installed = Get-Command $tool.Value -ErrorAction SilentlyContinue
    if ($installed) {
        Write-Host "   ✅ $($tool.Key) instalado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($tool.Key) NO instalado" -ForegroundColor Red
        $missing += $tool.Key
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Faltan herramientas: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Paso 2: Configuración del Backend" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para el backend, tienes dos opciones:" -ForegroundColor White
Write-Host ""
Write-Host "Opción A: Render.com (Recomendado - Más simple)" -ForegroundColor Cyan
Write-Host "   1. Ve a https://render.com y crea cuenta" -ForegroundColor White
Write-Host "   2. Crea PostgreSQL Database (Free)" -ForegroundColor White
Write-Host "   3. Crea Web Service conectado a GitHub" -ForegroundColor White
Write-Host "   4. Root Directory: backend" -ForegroundColor White
Write-Host "   5. Variables: DATABASE_URL y ALLOWED_ORIGINS" -ForegroundColor White
Write-Host ""
Write-Host "Opción B: Railway (Ya lo tienes configurado)" -ForegroundColor Cyan
Write-Host "   1. Ve a https://railway.app" -ForegroundColor White
Write-Host "   2. Configura variables de entorno" -ForegroundColor White
Write-Host ""

$backendChoice = Read-Host "¿Qué backend quieres usar? (render/railway)"

if ($backendChoice -eq "render") {
    Write-Host ""
    Write-Host "📖 Sigue la guía en DEPLOY_SIMPLE.md" -ForegroundColor Yellow
    Write-Host "   O ve directamente a: https://dashboard.render.com" -ForegroundColor Cyan
} elseif ($backendChoice -eq "railway") {
    Write-Host ""
    Write-Host "📖 Sigue la guía en CONFIGURAR_VARIABLES_RAILWAY.md" -ForegroundColor Yellow
    Write-Host "   O ve directamente a: https://railway.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Opción inválida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Paso 3: Configuración del Frontend" -ForegroundColor Yellow
Write-Host ""

$backendUrl = Read-Host "Ingresa la URL de tu backend (ej: https://hackaton-backend.onrender.com)"

if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Host "❌ URL no puede estar vacía" -ForegroundColor Red
    exit 1
}

# Verificar Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login en Vercel si es necesario
try {
    vercel whoami | Out-Null
    Write-Host "✅ Vercel CLI configurado" -ForegroundColor Green
} catch {
    Write-Host "🔐 Iniciando sesión en Vercel..." -ForegroundColor Yellow
    vercel login
}

# Configurar variable de entorno
Write-Host ""
Write-Host "🔧 Configurando VITE_API_URL en Vercel..." -ForegroundColor Yellow
Set-Location frontend

# Agregar variable
Write-Host "   Valor: $backendUrl" -ForegroundColor White
vercel env add VITE_API_URL production

# Redeploy
Write-Host ""
Write-Host "🚀 Haciendo redeploy..." -ForegroundColor Yellow
vercel --prod

Set-Location ..

Write-Host ""
Write-Host "✅ ¡Deploy completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verifica:" -ForegroundColor Cyan
Write-Host "   1. Backend: $backendUrl" -ForegroundColor White
Write-Host "   2. Frontend: ve a tu dashboard de Vercel" -ForegroundColor White
Write-Host ""
