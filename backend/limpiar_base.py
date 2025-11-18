"""
Script para limpiar la base de datos de producción.
⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de las tablas test_results y test_executions.
"""
import os
import sys

# Intentar cargar dotenv, pero no fallar si no está disponible
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  Advertencia: python-dotenv no está instalado. Usando variables de entorno del sistema.")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Obtener DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL no esta configurada")
    print("Por favor, configura DATABASE_URL en tu archivo .env o como variable de entorno")
    sys.exit(1)

# Railway usa postgres:// pero SQLAlchemy necesita postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"[INFO] Conectando a la base de datos...")
print(f"[INFO] URL: {DATABASE_URL[:50]}...")

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Verificar conexión
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM test_results"))
        test_results_count = result.scalar()
        
        result = conn.execute(text("SELECT COUNT(*) FROM test_executions"))
        test_executions_count = result.scalar()
        
        print(f"\n[INFO] Estado actual de la base de datos:")
        print(f"   - test_results: {test_results_count} registros")
        print(f"   - test_executions: {test_executions_count} registros")
        
        if test_results_count == 0 and test_executions_count == 0:
            print("\n[OK] La base de datos ya esta vacia. No hay nada que limpiar.")
            sys.exit(0)
        
        # Confirmar antes de borrar
        print(f"\n[ADVERTENCIA] Se eliminaran TODOS los datos:")
        print(f"   - {test_results_count} registros de test_results")
        print(f"   - {test_executions_count} registros de test_executions")
        
        respuesta = input("\nEstas seguro de que quieres continuar? (escribe 'SI' para confirmar): ")
        
        if respuesta != "SI":
            print("\n[INFO] Operacion cancelada.")
            sys.exit(0)
        
        print("\n[INFO] Eliminando datos...")
        
        # Eliminar en orden (primero test_results por las foreign keys si las hay)
        conn.execute(text("DELETE FROM test_results"))
        print("   [OK] test_results eliminados")
        
        conn.execute(text("DELETE FROM test_executions"))
        print("   [OK] test_executions eliminados")
        
        # Confirmar cambios
        conn.commit()
        
        # Verificar que se eliminaron
        result = conn.execute(text("SELECT COUNT(*) FROM test_results"))
        remaining_results = result.scalar()
        
        result = conn.execute(text("SELECT COUNT(*) FROM test_executions"))
        remaining_executions = result.scalar()
        
        print(f"\n[OK] Base de datos limpiada exitosamente!")
        print(f"   - Registros restantes en test_results: {remaining_results}")
        print(f"   - Registros restantes en test_executions: {remaining_executions}")
        
except Exception as e:
    print(f"\n[ERROR] {str(e)}")
    import traceback
    print(traceback.format_exc())
    sys.exit(1)

