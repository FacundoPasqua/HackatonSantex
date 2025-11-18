# Script para iniciar backend y frontend localmente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO SERVICIOS LOCALES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend")) {
    Write-Host "[ERROR] No se encuentra el directorio backend" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raiz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Iniciar Backend
Write-Host "`n[1/2] Iniciando Backend en puerto 8000..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    & .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
}

Start-Sleep -Seconds 3

# Verificar que el backend esté corriendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/tests/bases" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Backend iniciado correctamente en http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Backend puede estar iniciando, espera unos segundos..." -ForegroundColor Yellow
    Write-Host "   Verifica manualmente: http://localhost:8000/api/tests/bases" -ForegroundColor Yellow
}

# Iniciar Frontend
Write-Host "`n[2/2] Iniciando Frontend en puerto 3000..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend
    & npm run dev
}

Start-Sleep -Seconds 5

# Verificar que el frontend esté corriendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Frontend iniciado correctamente en http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Frontend puede estar iniciando, espera unos segundos..." -ForegroundColor Yellow
    Write-Host "   Verifica manualmente: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SERVICIOS INICIADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nPara detener los servicios, presiona Ctrl+C o cierra esta ventana" -ForegroundColor Yellow
Write-Host "`nPresiona cualquier tecla para ver el estado de los servicios..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Mantener el script corriendo y mostrar logs
while ($true) {
    Start-Sleep -Seconds 10
    Write-Host "`n[INFO] Servicios corriendo... (Ctrl+C para detener)" -ForegroundColor Gray
}

