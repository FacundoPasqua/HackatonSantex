"""
Script para configurar backend/.env con DATABASE_URL de producción
"""
import os
from pathlib import Path

print("=" * 70)
print("CONFIGURAR BACKEND/.ENV PARA USAR BASE DE PRODUCCION")
print("=" * 70)

print("\n[PASO 1] Necesitas obtener la DATABASE_URL publica de Railway:")
print("   1. Ve a https://railway.app")
print("   2. Selecciona tu proyecto")
print("   3. Haz clic en el servicio PostgreSQL (no en el backend)")
print("   4. Ve a la pestaña 'Connect' o 'Settings'")
print("   5. Busca 'Public Network' o 'Expose Publicly'")
print("   6. Activala si esta desactivada")
print("   7. Copia la Connection String publica")
print("      Debe verse como: postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway")
print("      NO debe tener 'railway.internal'")
print()

# Pedir la URL al usuario
database_url = input("Pega aqui la DATABASE_URL publica de Railway: ").strip()

if not database_url:
    print("\n[ERROR] No se proporciono DATABASE_URL. Saliendo...")
    exit(1)

# Validar que no sea URL interna
if "railway.internal" in database_url:
    print("\n[ERROR] Esta es una URL INTERNA. Necesitas la URL PUBLICA.")
    print("   La URL publica debe tener un host como: containers-us-west-xxx.railway.app")
    exit(1)

# Validar que sea una URL de PostgreSQL
if not (database_url.startswith("postgresql://") or database_url.startswith("postgres://")):
    print("\n[WARNING] La URL no parece ser de PostgreSQL, pero continuando...")

# Convertir postgres:// a postgresql:// si es necesario
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
    print("[INFO] Convertido postgres:// a postgresql://")

# Crear el archivo backend/.env
backend_env_path = Path("backend/.env")

# Crear directorio si no existe
backend_env_path.parent.mkdir(exist_ok=True)

# Escribir el archivo
env_content = f"""# Base de datos de produccion (PostgreSQL en Railway)
DATABASE_URL={database_url}

# CORS - permite todos los origenes para desarrollo local
ALLOWED_ORIGINS=*
"""

with open(backend_env_path, 'w', encoding='utf-8') as f:
    f.write(env_content)

print(f"\n[OK] Archivo creado: {backend_env_path}")
print(f"[INFO] DATABASE_URL configurada: {database_url[:50]}...")
print("\n[PASO 2] Ahora reinicia el backend:")
print("   1. Deten el backend actual (Ctrl+C)")
print("   2. Ejecuta de nuevo:")
print("      cd backend")
print("      .\\venv\\Scripts\\Activate.ps1")
print("      python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
print("\n[PASO 3] Deberias ver en los logs:")
print("   [INFO] Usando base de datos PostgreSQL (Railway)")
print("   [INFO] Database engine created successfully")
print("\n" + "=" * 70)
print("CONFIGURACION COMPLETA")
print("=" * 70)

