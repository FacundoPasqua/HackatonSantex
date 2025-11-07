from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TestResultBase(BaseModel):
    test_id: str
    categoria: str
    pregunta: str
    palabras_clave: str
    respuesta_bot: str
    validacion_correcta: bool
    palabras_encontradas: str
    resultado_final: str
    tiempo_segundos: float
    error: Optional[str] = None
    test_type: str
    environment: str
    sheet_name: Optional[str] = None

class TestResultCreate(TestResultBase):
    pass

class TestResultResponse(TestResultBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class StatisticsResponse(BaseModel):
    test_type: str
    environment: str
    resultado_final: str
    count: int
    avg_time: float

class SummaryResponse(BaseModel):
    total: int
    passed: int
    failed: int
    success_rate: float

