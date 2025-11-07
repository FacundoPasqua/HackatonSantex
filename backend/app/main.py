from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta
import os

from app.database import SessionLocal, engine
from app.models import Base, TestResult
from app.schemas import (
    TestResultCreate, TestResultResponse, 
    StatisticsResponse, SummaryResponse
)

# Crear tablas
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not create database tables: {e}")
    print("The server will start but database operations may fail")

app = FastAPI(
    title="Test Results API",
    version="1.0.0",
    description="API para almacenar y consultar resultados de tests automatizados de Playwright"
)

# CORS para permitir frontend y tests
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency para obtener DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "message": "Test Results API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/results": "Guardar un resultado de test",
            "POST /api/results/batch": "Guardar múltiples resultados",
            "GET /api/results": "Obtener resultados con filtros",
            "GET /api/statistics": "Obtener estadísticas",
            "GET /api/summary": "Resumen general",
            "GET /api/results/{id}": "Obtener resultado por ID",
            "GET /api/results/recent/{hours}": "Obtener resultados recientes"
        }
    }

@app.post("/api/results", response_model=TestResultResponse)
def create_result(result: TestResultCreate, db: Session = Depends(get_db)):
    """Guardar un resultado de test"""
    db_result = TestResult(**result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

@app.post("/api/results/batch", response_model=List[TestResultResponse])
def create_results_batch(results: List[TestResultCreate], db: Session = Depends(get_db)):
    """Guardar múltiples resultados de test"""
    db_results = [TestResult(**result.dict()) for result in results]
    db.add_all(db_results)
    db.commit()
    for result in db_results:
        db.refresh(result)
    return db_results

@app.get("/api/results", response_model=List[TestResultResponse])
def get_results(
    test_type: Optional[str] = Query(None, description="Tipo de test: automotor, inmobiliario, embarcaciones"),
    environment: Optional[str] = Query(None, description="Entorno: test, preprod, localhost"),
    resultado_final: Optional[str] = Query(None, description="Resultado: PASS, FAIL"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Obtener resultados con filtros"""
    query = db.query(TestResult)
    
    if test_type:
        query = query.filter(TestResult.test_type == test_type)
    if environment:
        query = query.filter(TestResult.environment == environment)
    if resultado_final:
        if resultado_final == 'PASS':
            query = query.filter(TestResult.resultado_final == 'PASS')
        elif resultado_final == 'FAIL':
            # Incluir todos los tipos de FAIL (FAIL, FAIL (JSON), FAIL general, etc.)
            query = query.filter(TestResult.resultado_final != 'PASS')
        else:
            query = query.filter(TestResult.resultado_final == resultado_final)
    
    results = query.order_by(TestResult.timestamp.desc()).offset(offset).limit(limit).all()
    return results

@app.get("/api/statistics", response_model=List[StatisticsResponse])
def get_statistics(
    test_type: Optional[str] = None,
    environment: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Obtener estadísticas agrupadas"""
    query = db.query(TestResult)
    
    if test_type:
        query = query.filter(TestResult.test_type == test_type)
    if environment:
        query = query.filter(TestResult.environment == environment)
    
    # Obtener todos los resultados
    results = query.all()
    
    # Agrupar manualmente para consolidar todos los FAILs
    # Usar solo test_type como clave para sumar todos los entornos
    stats_dict = {}
    for result in results:
        key = result.test_type
        if key not in stats_dict:
            stats_dict[key] = {'PASS': {'count': 0, 'total_time': 0}, 'FAIL': {'count': 0, 'total_time': 0}}
        
        if result.resultado_final == 'PASS':
            stats_dict[key]['PASS']['count'] += 1
            stats_dict[key]['PASS']['total_time'] += result.tiempo_segundos or 0
        else:
            # Cualquier cosa que no sea PASS es un FAIL
            stats_dict[key]['FAIL']['count'] += 1
            stats_dict[key]['FAIL']['total_time'] += result.tiempo_segundos or 0
    
    # Convertir a formato de respuesta
    response = []
    for test_type_key, data in stats_dict.items():
        if data['PASS']['count'] > 0:
            response.append({
                "test_type": test_type_key,
                "environment": "all",  # Indicar que es la suma de todos los entornos
                "resultado_final": "PASS",
                "count": data['PASS']['count'],
                "avg_time": round(data['PASS']['total_time'] / data['PASS']['count'], 2) if data['PASS']['count'] > 0 else 0
            })
        if data['FAIL']['count'] > 0:
            response.append({
                "test_type": test_type_key,
                "environment": "all",  # Indicar que es la suma de todos los entornos
                "resultado_final": "FAIL",
                "count": data['FAIL']['count'],
                "avg_time": round(data['FAIL']['total_time'] / data['FAIL']['count'], 2) if data['FAIL']['count'] > 0 else 0
            })
    
    return response

@app.get("/api/summary", response_model=SummaryResponse)
def get_summary(
    test_type: Optional[str] = None,
    environment: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Resumen general de todos los tests"""
    query = db.query(TestResult)
    
    if test_type:
        query = query.filter(TestResult.test_type == test_type)
    if environment:
        query = query.filter(TestResult.environment == environment)
    
    total = query.count()
    passed = query.filter(TestResult.resultado_final == 'PASS').count()
    failed = query.filter(TestResult.resultado_final != 'PASS').count()
    
    return {
        "total": total,
        "passed": passed,
        "failed": failed,
        "success_rate": round((passed / total * 100) if total > 0 else 0, 2)
    }

@app.get("/api/results/{result_id}", response_model=TestResultResponse)
def get_result(result_id: int, db: Session = Depends(get_db)):
    """Obtener un resultado específico"""
    result = db.query(TestResult).filter(TestResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

@app.get("/api/results/recent/{hours}")
def get_recent_results(hours: int = 24, db: Session = Depends(get_db)):
    """Obtener resultados de las últimas N horas"""
    since = datetime.utcnow() - timedelta(hours=hours)
    results = db.query(TestResult).filter(
        TestResult.timestamp >= since
    ).order_by(TestResult.timestamp.desc()).all()
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

