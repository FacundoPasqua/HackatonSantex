"""
Modelos y funciones para trabajar con Firestore
"""
from typing import Optional, Dict, Any
from datetime import datetime
from app.firebase_db import get_collection

def create_test_result(data: Dict[str, Any]) -> Dict[str, Any]:
    """Crear un nuevo resultado de test en Firestore"""
    collection = get_collection()
    
    # Agregar timestamp si no existe
    if "timestamp" not in data:
        data["timestamp"] = datetime.utcnow()
    
    # Convertir datetime a timestamp para Firestore
    if isinstance(data["timestamp"], datetime):
        data["timestamp"] = data["timestamp"]
    
    # Crear documento
    _, doc_ref = collection.add(data)
    
    # Obtener el documento creado con su ID
    doc = doc_ref.get()
    result = doc.to_dict()
    result["id"] = doc.id
    
    return result

def get_test_result(result_id: str) -> Optional[Dict[str, Any]]:
    """Obtener un resultado por ID"""
    collection = get_collection()
    doc = collection.document(result_id).get()
    
    if doc.exists:
        result = doc.to_dict()
        result["id"] = doc.id
        return result
    return None

def get_test_results(
    test_type: Optional[str] = None,
    environment: Optional[str] = None,
    resultado_final: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> list:
    """Obtener resultados con filtros"""
    collection = get_collection()
    query = collection
    
    # Aplicar filtros
    if test_type:
        query = query.where("test_type", "==", test_type)
    if environment:
        query = query.where("environment", "==", environment)
    if resultado_final:
        if resultado_final == 'PASS':
            query = query.where("resultado_final", "==", "PASS")
        elif resultado_final == 'FAIL':
            # En Firestore no podemos hacer != directamente, así que filtramos después
            pass
    
    # Ordenar por timestamp descendente
    from firebase_admin import firestore
    query = query.order_by("timestamp", direction=firestore.Query.DESCENDING)
    
    # Aplicar paginación
    results = query.limit(limit).offset(offset).stream()
    
    # Convertir a lista de diccionarios
    result_list = []
    for doc in results:
        data = doc.to_dict()
        data["id"] = doc.id
        
        # Filtrar FAIL si es necesario (ya que Firestore no soporta !=)
        if resultado_final == 'FAIL' and data.get("resultado_final") == "PASS":
            continue
            
        result_list.append(data)
    
    return result_list

def get_recent_results(hours: int = 24) -> list:
    """Obtener resultados recientes"""
    from datetime import timedelta
    from firebase_admin import firestore
    since = datetime.utcnow() - timedelta(hours=hours)
    
    collection = get_collection()
    query = collection.where("timestamp", ">=", since).order_by("timestamp", direction=firestore.Query.DESCENDING)
    
    results = query.stream()
    result_list = []
    for doc in results:
        data = doc.to_dict()
        data["id"] = doc.id
        result_list.append(data)
    
    return result_list

def get_statistics(
    test_type: Optional[str] = None,
    environment: Optional[str] = None
) -> list:
    """Obtener estadísticas agrupadas"""
    # Obtener todos los resultados que coincidan
    all_results = get_test_results(
        test_type=test_type,
        environment=environment,
        limit=10000  # Firestore permite hasta 10k documentos en una query
    )
    
    # Agrupar manualmente
    stats_dict = {}
    for result in all_results:
        key = result.get("test_type", "unknown")
        if key not in stats_dict:
            stats_dict[key] = {'PASS': {'count': 0, 'total_time': 0}, 'FAIL': {'count': 0, 'total_time': 0}}
        
        resultado = result.get("resultado_final", "FAIL")
        tiempo = result.get("tiempo_segundos", 0) or 0
        
        if resultado == 'PASS':
            stats_dict[key]['PASS']['count'] += 1
            stats_dict[key]['PASS']['total_time'] += tiempo
        else:
            stats_dict[key]['FAIL']['count'] += 1
            stats_dict[key]['FAIL']['total_time'] += tiempo
    
    # Convertir a formato de respuesta
    response = []
    for test_type_key, data in stats_dict.items():
        if data['PASS']['count'] > 0:
            response.append({
                "test_type": test_type_key,
                "environment": environment or "all",
                "resultado_final": "PASS",
                "count": data['PASS']['count'],
                "avg_time": round(data['PASS']['total_time'] / data['PASS']['count'], 2) if data['PASS']['count'] > 0 else 0
            })
        if data['FAIL']['count'] > 0:
            response.append({
                "test_type": test_type_key,
                "environment": environment or "all",
                "resultado_final": "FAIL",
                "count": data['FAIL']['count'],
                "avg_time": round(data['FAIL']['total_time'] / data['FAIL']['count'], 2) if data['FAIL']['count'] > 0 else 0
            })
    
    return response

def get_summary(
    test_type: Optional[str] = None,
    environment: Optional[str] = None
) -> Dict[str, Any]:
    """Obtener resumen general"""
    all_results = get_test_results(
        test_type=test_type,
        environment=environment,
        limit=10000
    )
    
    total = len(all_results)
    passed = sum(1 for r in all_results if r.get("resultado_final") == "PASS")
    failed = total - passed
    
    return {
        "total": total,
        "passed": passed,
        "failed": failed,
        "success_rate": round((passed / total * 100) if total > 0 else 0, 2)
    }

