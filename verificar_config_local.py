"""
Script rápido para verificar que la configuración local está lista para guardar en producción
"""
import os
from pathlib import Path

print("=" * 60)
print("VERIFICACION DE CONFIGURACION LOCAL -> PRODUCCION")
print("=" * 60)

# Verificar config.env
print("\n1. Verificando config.env...")
config_env_path = Path("config.env")
if config_env_path.exists():
    with open(config_env_path, 'r') as f:
        content = f.read()
        if "API_URL=http://localhost:8000" in content:
            print("   [OK] config.env tiene API_URL=http://localhost:8000")
        else:
            print("   [ERROR] config.env NO tiene API_URL=http://localhost:8000")
            print("   [WARNING] Necesitas cambiar API_URL a http://localhost:8000")
else:
    print("   [WARNING] config.env no existe, creando...")
    with open(config_env_path, 'w') as f:
        f.write("API_URL=http://localhost:8000\n")
        f.write("BOT_URL=https://preprod.rentascordoba.gob.ar/bot-web\n")
    print("   [OK] config.env creado con API_URL=http://localhost:8000")

# Verificar backend/.env
print("\n2. Verificando backend/.env...")
backend_env_path = Path("backend/.env")
if backend_env_path.exists():
    with open(backend_env_path, 'r') as f:
        content = f.read()
        if "DATABASE_URL" in content:
            if "railway.internal" in content:
                print("   [ERROR] backend/.env tiene URL INTERNA (railway.internal)")
                print("   [WARNING] Necesitas la URL PUBLICA de Railway")
            elif "postgresql://" in content or "postgres://" in content:
                print("   [OK] backend/.env tiene DATABASE_URL configurada")
                # Mostrar primeros caracteres
                for line in content.split('\n'):
                    if 'DATABASE_URL' in line and not line.strip().startswith('#'):
                        db_url = line.split('=')[1].strip() if '=' in line else ''
                        print(f"   [INFO] URL: {db_url[:50]}...")
            else:
                print("   [WARNING] DATABASE_URL no parece ser una URL de PostgreSQL valida")
        else:
            print("   [ERROR] backend/.env NO tiene DATABASE_URL")
            print("   [WARNING] Necesitas agregar DATABASE_URL con la URL publica de Railway")
else:
    print("   [ERROR] backend/.env NO EXISTE")
    print("   [WARNING] Necesitas crear backend/.env con:")
    print("      DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway")
    print("      ALLOWED_ORIGINS=*")

# Verificar que el backend pueda iniciarse
print("\n3. Instrucciones para ejecutar:")
print("   [PASO 1] Inicia el backend local:")
print("      cd backend")
print("      .\\venv\\Scripts\\Activate.ps1")
print("      python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
print("")
print("   [PASO 2] En otra terminal, ejecuta los tests:")
print("      npm test")
print("")
print("   [PASO 3] Verifica que los datos se guarden:")
print("      - Revisa los logs del backend (deberias ver [REQUEST] POST /api/results)")
print("      - Ve a Railway -> PostgreSQL -> Query y ejecuta: SELECT COUNT(*) FROM test_results;")

print("\n" + "=" * 60)
print("VERIFICACION COMPLETA")
print("=" * 60)

