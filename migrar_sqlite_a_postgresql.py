#!/usr/bin/env python3
"""
Script para migrar datos de SQLite local a PostgreSQL en Railway
"""
import sys
import os
from pathlib import Path
from datetime import datetime

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

os.chdir(backend_dir)

from dotenv import load_dotenv
load_dotenv()

print("="*60)
print("MIGRACION DE DATOS: SQLite -> PostgreSQL")
print("="*60)

# Verificar que existe SQLite local
sqlite_path = Path("test_results.db")
if not sqlite_path.exists():
    print("\n[ERROR] No se encuentra test_results.db en backend/")
    print("        No hay datos locales para migrar")
    sys.exit(1)

print(f"\n[OK] Archivo SQLite encontrado: {sqlite_path}")

# Conectar a SQLite local
try:
    from sqlalchemy import create_engine, text, inspect
    import sqlite3
    
    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")
    sqlite_conn = sqlite_engine.connect()
    
    # Contar registros en SQLite
    result = sqlite_conn.execute(text("SELECT COUNT(*) FROM test_results"))
    sqlite_count = result.fetchone()[0]
    print(f"[INFO] Registros en SQLite: {sqlite_count}")
    
    if sqlite_count == 0:
        print("\n[WARNING] No hay registros en SQLite para migrar")
        sqlite_conn.close()
        sys.exit(0)
    
except Exception as e:
    print(f"\n[ERROR] Error conectando a SQLite: {e}")
    import traceback
    print(traceback.format_exc())
    sys.exit(1)

# Conectar a PostgreSQL
try:
    from app.database import engine as pg_engine
    
    pg_conn = pg_engine.connect()
    
    # Contar registros en PostgreSQL antes
    result = pg_conn.execute(text("SELECT COUNT(*) FROM test_results"))
    pg_count_before = result.fetchone()[0]
    print(f"[INFO] Registros en PostgreSQL (antes): {pg_count_before}")
    
except Exception as e:
    print(f"\n[ERROR] Error conectando a PostgreSQL: {e}")
    import traceback
    print(traceback.format_exc())
    sqlite_conn.close()
    sys.exit(1)

# Migrar datos
try:
    print("\n[INFO] Iniciando migracion...")
    
    # Obtener todos los registros de SQLite
    # Nota: PostgreSQL usa 'timestamp' en lugar de 'created_at'
    sqlite_results = sqlite_conn.execute(text("""
        SELECT 
            id, test_id, categoria, pregunta, palabras_clave, 
            respuesta_bot, validacion_correcta, palabras_encontradas,
            resultado_final, tiempo_segundos, error, test_type,
            environment, sheet_name, timestamp
        FROM test_results
        ORDER BY timestamp
    """))
    
    migrated = 0
    skipped = 0
    errors = 0
    
    for row in sqlite_results:
        try:
            # Verificar si ya existe en PostgreSQL (por test_id + pregunta)
            check = pg_conn.execute(
                text("SELECT id FROM test_results WHERE test_id = :test_id AND pregunta = :pregunta"),
                {"test_id": row.test_id, "pregunta": row.pregunta}
            )
            existing = check.fetchone()
            
            if existing:
                skipped += 1
                continue
            
            # Insertar en PostgreSQL
            # Nota: PostgreSQL usa 'timestamp' en lugar de 'created_at'
            pg_conn.execute(
                text("""
                    INSERT INTO test_results (
                        test_id, categoria, pregunta, palabras_clave,
                        respuesta_bot, validacion_correcta, palabras_encontradas,
                        resultado_final, tiempo_segundos, error, test_type,
                        environment, sheet_name, timestamp
                    ) VALUES (
                        :test_id, :categoria, :pregunta, :palabras_clave,
                        :respuesta_bot, :validacion_correcta, :palabras_encontradas,
                        :resultado_final, :tiempo_segundos, :error, :test_type,
                        :environment, :sheet_name, :timestamp
                    )
                """),
                {
                    "test_id": row.test_id,
                    "categoria": row.categoria,
                    "pregunta": row.pregunta,
                    "palabras_clave": row.palabras_clave,
                    "respuesta_bot": row.respuesta_bot,
                    "validacion_correcta": row.validacion_correcta,
                    "palabras_encontradas": row.palabras_encontradas,
                    "resultado_final": row.resultado_final,
                    "tiempo_segundos": float(row.tiempo_segundos) if row.tiempo_segundos else 0.0,
                    "error": row.error,
                    "test_type": row.test_type,
                    "environment": row.environment,
                    "sheet_name": row.sheet_name,
                    "timestamp": row.timestamp if row.timestamp else datetime.utcnow()
                }
            )
            migrated += 1
            
            if migrated % 10 == 0:
                print(f"  Migrados: {migrated} registros...")
                
        except Exception as e:
            errors += 1
            print(f"  [ERROR] Error migrando registro {row.id}: {e}")
            continue
    
    # Commit
    pg_conn.commit()
    
    # Contar registros en PostgreSQL después
    result = pg_conn.execute(text("SELECT COUNT(*) FROM test_results"))
    pg_count_after = result.fetchone()[0]
    
    print("\n" + "="*60)
    print("RESUMEN DE MIGRACION")
    print("="*60)
    print(f"Registros en SQLite: {sqlite_count}")
    print(f"Registros migrados: {migrated}")
    print(f"Registros omitidos (ya existian): {skipped}")
    print(f"Errores: {errors}")
    print(f"Registros en PostgreSQL (antes): {pg_count_before}")
    print(f"Registros en PostgreSQL (despues): {pg_count_after}")
    print("="*60)
    
    if migrated > 0:
        print(f"\n[OK] Migracion completada exitosamente!")
        print(f"     {migrated} registros migrados a PostgreSQL")
    else:
        print("\n[INFO] No se migraron nuevos registros")
        print("       (Todos los registros ya existian en PostgreSQL)")
    
    sqlite_conn.close()
    pg_conn.close()
    
except Exception as e:
    print(f"\n[ERROR] Error durante la migracion: {e}")
    import traceback
    print(traceback.format_exc())
    sqlite_conn.close()
    pg_conn.close()
    sys.exit(1)

