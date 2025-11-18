from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class TestResult(Base):
    __tablename__ = "test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(String(50), index=True)
    categoria = Column(String(100))
    pregunta = Column(Text)
    palabras_clave = Column(Text)
    respuesta_bot = Column(Text)
    validacion_correcta = Column(Boolean, default=False)
    palabras_encontradas = Column(Text)
    resultado_final = Column(String(50), index=True)  # 'PASS', 'FAIL', 'FAIL (JSON)', etc.
    tiempo_segundos = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    error = Column(Text, nullable=True)
    test_type = Column(String(50), index=True)  # 'automotor', 'inmobiliario', 'embarcaciones'
    environment = Column(String(20), index=True)  # 'test', 'preprod', 'localhost'
    sheet_name = Column(String(200), nullable=True)  # Nombre de la hoja de Google Sheets

