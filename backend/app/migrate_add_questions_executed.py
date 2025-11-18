"""
Script para agregar la columna questions_executed a la tabla test_executions
"""
from app.database import engine, SessionLocal
from sqlalchemy import text, inspect

def migrate():
    """Agregar columna questions_executed si no existe"""
    db = SessionLocal()
    try:
        # Verificar si la tabla existe
        inspector = inspect(engine)
        if 'test_executions' not in inspector.get_table_names():
            print("[INFO] La tabla test_executions no existe, se creará automáticamente")
            return
        
        # Verificar si la columna ya existe
        columns = [col['name'] for col in inspector.get_columns('test_executions')]
        
        if 'questions_executed' not in columns:
            print("[INFO] Agregando columna questions_executed a test_executions...")
            # SQLite no soporta ADD COLUMN IF NOT EXISTS, pero podemos usar try/except
            try:
                db.execute(text("""
                    ALTER TABLE test_executions 
                    ADD COLUMN questions_executed INTEGER DEFAULT 0
                """))
                db.commit()
                print("[OK] Columna questions_executed agregada exitosamente")
            except Exception as e:
                if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                    print("[INFO] La columna questions_executed ya existe")
                else:
                    raise
        else:
            print("[INFO] La columna questions_executed ya existe")
            
    except Exception as e:
        print(f"[ERROR] Error en migración: {str(e)}")
        db.rollback()
        # Si es SQLite y falla, intentar recrear la tabla
        if "sqlite" in str(engine.url).lower():
            print("[INFO] Intentando recrear tabla...")
            try:
                db.execute(text("DROP TABLE IF EXISTS test_executions"))
                db.commit()
                print("[OK] Tabla eliminada. Se recreará automáticamente al iniciar el servidor.")
            except Exception as e2:
                print(f"[ERROR] Error recreando tabla: {str(e2)}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()

