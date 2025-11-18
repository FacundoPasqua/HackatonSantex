from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Obtener DATABASE_URL de las variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test_results.db")

# Railway usa postgres:// pero SQLAlchemy necesita postgresql://
# Convertir si es necesario
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URL = DATABASE_URL

# Configurar connect_args solo para SQLite
connect_args = {}
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args = {"check_same_thread": False}

# Crear engine con pool_pre_ping para verificar conexiones
try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,  # Verificar conexiones antes de usarlas
        echo=False
    )
    print(f"[INFO] Database engine created successfully")
    print(f"[INFO] Database URL: {SQLALCHEMY_DATABASE_URL[:50]}...")  # Solo primeros 50 chars por seguridad
except Exception as e:
    print(f"[ERROR] Failed to create database engine: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

