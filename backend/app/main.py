"""
FastAPI Backend con PostgreSQL
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime
import os
import traceback

from app.database import engine
from app.models import Base
from app.db_models import (
    create_test_result,
    get_test_result,
    get_test_results,
    get_recent_results,
    get_statistics,
    get_summary
)
from app.schemas import (
    TestResultCreate, TestResultResponse, 
    StatisticsResponse, SummaryResponse
)

# Crear tablas en la base de datos
try:
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created successfully")
    db_connected = True
except Exception as e:
    print(f"[WARNING] Could not create database tables: {e}")
    print("The server will start but database operations may fail")
    db_connected = False

app = FastAPI(
    title="Test Results API",
    version="1.0.0",
    description="API para almacenar y consultar resultados de tests automatizados de Playwright"
)

# CORS para permitir frontend y tests
ALLOWED_ORIGINS_STR = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000,https://qaiax.vercel.app"
)

# Procesar los orígenes permitidos
if ALLOWED_ORIGINS_STR.strip() == "*":
    # Si es "*", permitir todos los orígenes pero sin credentials
    ALLOWED_ORIGINS = ["*"]
    ALLOW_CREDENTIALS = False
else:
    # Si hay una lista, procesarla
    ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()]
    ALLOW_CREDENTIALS = True

print(f"[INFO] CORS configured with origins: {ALLOWED_ORIGINS}")
print(f"[INFO] CORS allow_credentials: {ALLOW_CREDENTIALS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para capturar errores
@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        print(f"[REQUEST] {request.method} {request.url.path}", flush=True)
        response = await call_next(request)
        print(f"[OK] {request.method} {request.url.path} - Status: {response.status_code}", flush=True)
        return response
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"[ERROR] Error en {request.method} {request.url.path}: {str(e)}", flush=True)
        print(f"[TRACEBACK]\n{error_trace}", flush=True)
        import sys
        sys.stdout.flush()
        sys.stderr.flush()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        )

@app.get("/")
def read_root():
    try:
        print("[REQUEST] Request recibida en /", flush=True)
        
        response = {
            "message": "Test Results API",
            "version": "1.0.0",
            "status": "running",
            "database": "PostgreSQL",
            "db_status": "connected" if db_connected else "disconnected",
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
        print("[OK] Response enviada desde /", flush=True)
        return response
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"[ERROR] Error en /: {error_msg}", flush=True)
        print(f"[TRACEBACK] {error_trace}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error: {error_msg}")

@app.post("/api/results", response_model=TestResultResponse)
def create_result(result: TestResultCreate):
    """Guardar un resultado de test"""
    try:
        print(f"[REQUEST] Recibiendo resultado: {result.test_id}", flush=True)
        
        # Convertir a diccionario
        data = result.dict()
        data["timestamp"] = datetime.utcnow()
        
        # Crear en Firestore
        created = create_test_result(data)
        
        print(f"[OK] Resultado guardado: ID {created['id']}", flush=True)
        
        # Convertir a TestResultResponse
        return TestResultResponse(**created)
    except Exception as e:
        print(f"[ERROR] Error guardando resultado: {str(e)}", flush=True)
        print(f"[TRACEBACK] {traceback.format_exc()}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error guardando resultado: {str(e)}")

@app.post("/api/results/batch", response_model=List[TestResultResponse])
def create_results_batch(results: List[TestResultCreate]):
    """Guardar múltiples resultados de test"""
    try:
        created_results = []
        for result in results:
            data = result.dict()
            data["timestamp"] = datetime.utcnow()
            created = create_test_result(data)
            created_results.append(TestResultResponse(**created))
        
        print(f"[OK] Guardados {len(created_results)} resultados", flush=True)
        return created_results
    except Exception as e:
        print(f"[ERROR] Error guardando lote: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error guardando lote: {str(e)}")

@app.get("/api/results", response_model=List[TestResultResponse])
def get_results(
    test_type: Optional[str] = Query(None, description="Tipo de test: automotor, inmobiliario, embarcaciones"),
    environment: Optional[str] = Query(None, description="Entorno: test, preprod, localhost"),
    resultado_final: Optional[str] = Query(None, description="Resultado: PASS, FAIL"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """Obtener resultados con filtros"""
    if not db_connected:
        return []
    try:
        results = get_test_results(
            test_type=test_type,
            environment=environment,
            resultado_final=resultado_final,
            limit=limit,
            offset=offset
        )
        
        # Convertir a TestResultResponse
        return [TestResultResponse(**r) for r in results]
    except Exception as e:
        print(f"[ERROR] Error obteniendo resultados: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error obteniendo resultados: {str(e)}")

@app.get("/api/statistics", response_model=List[StatisticsResponse])
def get_statistics_endpoint(
    test_type: Optional[str] = None,
    environment: Optional[str] = None
):
    """Obtener estadísticas agrupadas"""
    if not db_connected:
        return []
    try:
        stats = get_statistics(test_type=test_type, environment=environment)
        return [StatisticsResponse(**s) for s in stats]
    except Exception as e:
        print(f"[ERROR] Error obteniendo estadísticas: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")

@app.get("/api/summary", response_model=SummaryResponse)
def get_summary_endpoint(
    test_type: Optional[str] = None,
    environment: Optional[str] = None
):
    """Resumen general de todos los tests"""
    if not db_connected:
        return SummaryResponse(total=0, passed=0, failed=0, success_rate=0.0)
    try:
        summary = get_summary(test_type=test_type, environment=environment)
        return SummaryResponse(**summary)
    except Exception as e:
        print(f"[ERROR] Error obteniendo resumen: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error obteniendo resumen: {str(e)}")

@app.get("/api/results/{result_id}", response_model=TestResultResponse)
def get_result(result_id: str):
    """Obtener un resultado específico"""
    try:
        result = get_test_result(result_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        return TestResultResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error obteniendo resultado: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error obteniendo resultado: {str(e)}")

@app.get("/api/results/recent/{hours}")
def get_recent_results_endpoint(hours: int = 24):
    """Obtener resultados de las últimas N horas"""
    if not db_connected:
        return []
    try:
        results = get_recent_results(hours=hours)
        return [TestResultResponse(**r) for r in results]
    except Exception as e:
        print(f"[ERROR] Error obteniendo resultados recientes: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"Error obteniendo resultados recientes: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
