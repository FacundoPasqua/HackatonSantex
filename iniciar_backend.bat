@echo off
echo ========================================
echo INICIANDO BACKEND LOCAL
echo ========================================
cd backend
call venv\Scripts\activate.bat
echo.
echo [INFO] Iniciando servidor en http://localhost:8000
echo [INFO] Presiona Ctrl+C para detener
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause

