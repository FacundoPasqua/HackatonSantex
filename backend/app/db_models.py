"""
Funciones para trabajar con PostgreSQL usando SQLAlchemy
"""
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.database import SessionLocal
from app.models import TestResult

def get_db():
    """Obtener sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_test_result(data: Dict[str, Any]) -> Dict[str, Any]:
    """Crear un nuevo resultado de test en PostgreSQL"""
    db = SessionLocal()
    try:
        # Crear instancia del modelo
        db_result = TestResult(**data)
        
        # Agregar a la sesión y commit
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        
        # Convertir a diccionario
        result = {
            "id": str(db_result.id),  # Convertir a string para compatibilidad con API
            "test_id": db_result.test_id,
            "categoria": db_result.categoria,
            "pregunta": db_result.pregunta,
            "palabras_clave": db_result.palabras_clave,
            "respuesta_bot": db_result.respuesta_bot,
            "validacion_correcta": db_result.validacion_correcta,
            "palabras_encontradas": db_result.palabras_encontradas,
            "resultado_final": db_result.resultado_final,
            "tiempo_segundos": db_result.tiempo_segundos,
            "timestamp": db_result.timestamp,
            "error": db_result.error,
            "test_type": db_result.test_type,
            "environment": db_result.environment,
            "sheet_name": db_result.sheet_name
        }
        
        return result
    finally:
        db.close()

def get_test_result(result_id: str) -> Optional[Dict[str, Any]]:
    """Obtener un resultado por ID"""
    db = SessionLocal()
    try:
        # Intentar convertir a int primero (PostgreSQL usa int)
        try:
            id_int = int(result_id)
        except ValueError:
            return None
        
        db_result = db.query(TestResult).filter(TestResult.id == id_int).first()
        
        if not db_result:
            return None
        
        return {
            "id": str(db_result.id),
            "test_id": db_result.test_id,
            "categoria": db_result.categoria,
            "pregunta": db_result.pregunta,
            "palabras_clave": db_result.palabras_clave,
            "respuesta_bot": db_result.respuesta_bot,
            "validacion_correcta": db_result.validacion_correcta,
            "palabras_encontradas": db_result.palabras_encontradas,
            "resultado_final": db_result.resultado_final,
            "tiempo_segundos": db_result.tiempo_segundos,
            "timestamp": db_result.timestamp,
            "error": db_result.error,
            "test_type": db_result.test_type,
            "environment": db_result.environment,
            "sheet_name": db_result.sheet_name
        }
    finally:
        db.close()

def get_test_results(
    test_type: Optional[str] = None,
    environment: Optional[str] = None,
    resultado_final: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Obtener resultados con filtros"""
    db = SessionLocal()
    try:
        query = db.query(TestResult)
        
        # Aplicar filtros
        if test_type:
            query = query.filter(TestResult.test_type == test_type)
        if environment:
            query = query.filter(TestResult.environment == environment)
        if resultado_final:
            query = query.filter(TestResult.resultado_final == resultado_final)
        
        # Ordenar por timestamp descendente
        query = query.order_by(TestResult.timestamp.desc())
        
        # Aplicar paginación
        results = query.offset(offset).limit(limit).all()
        
        # Convertir a lista de diccionarios
        result_list = []
        for db_result in results:
            result_list.append({
                "id": str(db_result.id),
                "test_id": db_result.test_id,
                "categoria": db_result.categoria,
                "pregunta": db_result.pregunta,
                "palabras_clave": db_result.palabras_clave,
                "respuesta_bot": db_result.respuesta_bot,
                "validacion_correcta": db_result.validacion_correcta,
                "palabras_encontradas": db_result.palabras_encontradas,
                "resultado_final": db_result.resultado_final,
                "tiempo_segundos": db_result.tiempo_segundos,
                "timestamp": db_result.timestamp,
                "error": db_result.error,
                "test_type": db_result.test_type,
                "environment": db_result.environment,
                "sheet_name": db_result.sheet_name
            })
        
        return result_list
    finally:
        db.close()

def get_recent_results(hours: int = 24) -> List[Dict[str, Any]]:
    """Obtener resultados recientes"""
    db = SessionLocal()
    try:
        since = datetime.utcnow() - timedelta(hours=hours)
        
        results = db.query(TestResult)\
            .filter(TestResult.timestamp >= since)\
            .order_by(TestResult.timestamp.desc())\
            .all()
        
        result_list = []
        for db_result in results:
            result_list.append({
                "id": str(db_result.id),
                "test_id": db_result.test_id,
                "categoria": db_result.categoria,
                "pregunta": db_result.pregunta,
                "palabras_clave": db_result.palabras_clave,
                "respuesta_bot": db_result.respuesta_bot,
                "validacion_correcta": db_result.validacion_correcta,
                "palabras_encontradas": db_result.palabras_encontradas,
                "resultado_final": db_result.resultado_final,
                "tiempo_segundos": db_result.tiempo_segundos,
                "timestamp": db_result.timestamp,
                "error": db_result.error,
                "test_type": db_result.test_type,
                "environment": db_result.environment,
                "sheet_name": db_result.sheet_name
            })
        
        return result_list
    finally:
        db.close()

def get_statistics(
    test_type: Optional[str] = None,
    environment: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Obtener estadísticas agrupadas"""
    db = SessionLocal()
    try:
        query = db.query(
            TestResult.test_type,
            TestResult.environment,
            TestResult.resultado_final,
            func.count(TestResult.id).label('count'),
            func.avg(TestResult.tiempo_segundos).label('avg_time')
        )
        
        # Aplicar filtros
        if test_type:
            query = query.filter(TestResult.test_type == test_type)
        if environment:
            query = query.filter(TestResult.environment == environment)
        
        # Agrupar
        query = query.group_by(
            TestResult.test_type,
            TestResult.environment,
            TestResult.resultado_final
        )
        
        results = query.all()
        
        # Convertir a formato de respuesta
        response = []
        for row in results:
            response.append({
                "test_type": row.test_type or "unknown",
                "environment": row.environment or "all",
                "resultado_final": row.resultado_final,
                "count": row.count,
                "avg_time": round(float(row.avg_time or 0), 2)
            })
        
        return response
    finally:
        db.close()

def get_summary(
    test_type: Optional[str] = None,
    environment: Optional[str] = None
) -> Dict[str, Any]:
    """Obtener resumen general"""
    db = SessionLocal()
    try:
        query = db.query(TestResult)
        
        # Aplicar filtros
        if test_type:
            query = query.filter(TestResult.test_type == test_type)
        if environment:
            query = query.filter(TestResult.environment == environment)
        
        total = query.count()
        passed = query.filter(TestResult.resultado_final == "PASS").count()
        failed = total - passed
        
        success_rate = round((passed / total * 100) if total > 0 else 0, 2)
        
        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "success_rate": success_rate
        }
    finally:
        db.close()

