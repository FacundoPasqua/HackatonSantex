"""
Módulo para ejecutar tests de Playwright desde el backend
"""
import subprocess
import threading
import os
import json
from datetime import datetime
from typing import Dict, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import SessionLocal
from app.models import TestExecution, TestResult

# Diccionario para guardar procesos activos (para poder cancelarlos)
active_processes: Dict[str, subprocess.Popen] = {}

def get_test_bases() -> list:
    """
    Obtener información de las bases de datos disponibles
    Retorna lista con información de cada base
    """
    bases = [
        {
            "id": "automotor",
            "name": "Automotor",
            "file": "tests/data/Automotor.xlsx",
            "test_file": "tests/specs/automotor.playwright.spec.js",
            "estimated_time_minutes": 20,
            "questions_count": None  # Se calculará si el archivo existe
        },
        {
            "id": "inmobiliario",
            "name": "Inmobiliario",
            "file": "tests/data/Inmobiliario.xlsx",
            "test_file": "tests/specs/inmobiliario.playwright.spec.js",
            "estimated_time_minutes": 25,
            "questions_count": None
        },
        {
            "id": "embarcaciones",
            "name": "Embarcaciones",
            "file": "tests/data/Embarcaciones.xlsx",
            "test_file": "tests/specs/embarcaciones.playwright.spec.js",
            "estimated_time_minutes": 15,
            "questions_count": None
        }
    ]
    
    # Intentar leer el número de preguntas de cada archivo Excel
    try:
        import openpyxl
        for base in bases:
            file_path = base["file"]
            # Buscar el archivo en diferentes ubicaciones
            possible_paths = [
                file_path,
                os.path.join(os.getcwd(), file_path),
                os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), file_path),
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    try:
                        workbook = openpyxl.load_workbook(path, read_only=True)
                        sheet = workbook.active
                        # Contar filas con datos (excluyendo header)
                        count = sum(1 for row in sheet.iter_rows(min_row=2) if any(cell.value for cell in row))
                        base["questions_count"] = count
                        workbook.close()
                        break
                    except Exception as e:
                        print(f"[WARNING] No se pudo leer {path}: {str(e)}", flush=True)
                        continue
    except ImportError:
        print("[INFO] openpyxl no está instalado, no se puede contar preguntas", flush=True)
    except Exception as e:
        print(f"[WARNING] Error al leer archivos Excel: {str(e)}", flush=True)
    
    return bases

def get_test_status(test_id: str) -> Optional[Dict]:
    """Obtener estado de una ejecución de test desde la base de datos"""
    db = SessionLocal()
    try:
        execution = db.query(TestExecution).filter(TestExecution.test_id == test_id).first()
        if execution:
            logs = []
            if execution.logs:
                try:
                    logs = json.loads(execution.logs)
                except:
                    logs = []
            
            status = {
                "test_id": execution.test_id,
                "test_type": execution.test_type,
                "status": execution.status,
                "created_at": execution.created_at.isoformat() if execution.created_at else None,
                "started_at": execution.started_at.isoformat() if execution.started_at else None,
                "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
                "return_code": execution.return_code,
                "error": execution.error,
                "logs": logs
            }
            print(f"[INFO] Estado encontrado para {test_id}: {execution.status}", flush=True)
            return status
        else:
            print(f"[WARNING] Estado NO encontrado para {test_id}", flush=True)
            return None
    except Exception as e:
        print(f"[ERROR] Error obteniendo estado desde BD: {str(e)}", flush=True)
        return None
    finally:
        db.close()

def get_running_tests() -> List[str]:
    """Obtener lista de test_ids que están corriendo o en cola"""
    db = SessionLocal()
    try:
        running = db.query(TestExecution).filter(
            TestExecution.status.in_(["queued", "running"])
        ).all()
        return [t.test_id for t in running]
    except Exception as e:
        print(f"[ERROR] Error obteniendo tests corriendo: {str(e)}", flush=True)
        return []
    finally:
        db.close()

def update_test_status(test_id: str, status_data: Dict):
    """Actualizar estado de un test en la base de datos"""
    db = SessionLocal()
    try:
        execution = db.query(TestExecution).filter(TestExecution.test_id == test_id).first()
        if not execution:
            # Crear nuevo registro
            execution = TestExecution(
                test_id=test_id,
                test_type=status_data.get("test_type"),
                status=status_data.get("status", "queued"),
                created_at=datetime.utcnow() if not status_data.get("created_at") else datetime.fromisoformat(status_data["created_at"].replace("Z", "+00:00")),
            )
            db.add(execution)
        
        # Actualizar campos
        if "status" in status_data:
            execution.status = status_data["status"]
        if "started_at" in status_data and status_data["started_at"]:
            execution.started_at = datetime.fromisoformat(status_data["started_at"].replace("Z", "+00:00"))
        if "completed_at" in status_data and status_data["completed_at"]:
            execution.completed_at = datetime.fromisoformat(status_data["completed_at"].replace("Z", "+00:00"))
        if "return_code" in status_data:
            execution.return_code = status_data["return_code"]
        if "error" in status_data:
            execution.error = status_data["error"]
        if "logs" in status_data:
            execution.logs = json.dumps(status_data["logs"])
        
        db.commit()
        db.refresh(execution)
    except Exception as e:
        print(f"[ERROR] Error actualizando estado en BD: {str(e)}", flush=True)
        db.rollback()
    finally:
        db.close()

def run_test_async(test_type: str, test_id: str, environment: str = "preprod"):
    """
    Ejecutar test en segundo plano
    """
    try:
        print(f"[INFO] ===== INICIANDO run_test_async para {test_id} =====", flush=True)
        
        # Verificar que el test_id existe en BD
        current_status = get_test_status(test_id)
        if not current_status:
            print(f"[ERROR] Test {test_id} no encontrado en BD al iniciar ejecución", flush=True)
            return
        
        test_file = f"tests/specs/{test_type}.playwright.spec.js"
        print(f"[INFO] Iniciando test {test_id}: {test_file}", flush=True)
        
        # Actualizar estado en BD
        started_at = datetime.utcnow().isoformat()
        update_test_status(test_id, {
            "status": "running",
            "started_at": started_at,
            "logs": []
        })
        
        print(f"[INFO] Estado actualizado a 'running' para {test_id}", flush=True)
        
        # Determinar el directorio de trabajo
        # El backend está en backend/, pero necesitamos la raíz del proyecto
        current_file = os.path.abspath(__file__)  # backend/app/test_executor.py
        backend_dir = os.path.dirname(os.path.dirname(current_file))  # backend/
        project_root = os.path.dirname(backend_dir)  # raíz del proyecto
        
        possible_paths = [
            project_root,  # Raíz del proyecto (preferido)
            os.getcwd(),  # Directorio actual
            "/app",  # Railway default
        ]
        
        work_dir = None
        for path in possible_paths:
            if os.path.exists(path) and os.path.exists(os.path.join(path, "package.json")):
                work_dir = path
                break
        
        if not work_dir:
            # Si no encontramos package.json, usar la raíz del proyecto de todas formas
            work_dir = project_root
            print(f"[WARNING] No se encontró package.json, usando: {work_dir}", flush=True)
        
        print(f"[INFO] Ejecutando desde: {work_dir}", flush=True)
        
        # Obtener API_URL para pasarla a los tests
        # Railway puede tener RAILWAY_PUBLIC_DOMAIN o podemos construirla
        api_url = os.getenv("API_URL")
        if not api_url:
            # Intentar construir desde Railway
            railway_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN")
            if railway_domain:
                api_url = f"https://{railway_domain}"
            else:
                # Fallback: usar localhost en desarrollo
                api_url = "http://localhost:8000"
        
        print(f"[INFO] API_URL para tests: {api_url}", flush=True)
        
        # Determinar el comando npm según el sistema operativo
        import platform
        import shutil
        
        # Buscar npm en el PATH
        npm_path = shutil.which("npm")
        if not npm_path:
            npm_path = shutil.which("npm.cmd")
        
        if not npm_path:
            raise Exception("npm no encontrado. Asegúrate de que Node.js esté instalado y en el PATH.")
        
        print(f"[INFO] npm encontrado en: {npm_path}", flush=True)
        
        # En Windows, a veces es necesario usar shell=True
        use_shell = platform.system() == "Windows"
        
        # Construir el comando
        test_command = f"test -- {test_file} --project=chromium"
        
        print(f"[INFO] Ejecutando: {npm_path} {test_command}", flush=True)
        print(f"[INFO] Usando shell: {use_shell}", flush=True)
        
        # Preparar variables de entorno para el proceso
        env = os.environ.copy()
        env["API_URL"] = api_url
        
        # Obtener BOT_URL desde el parámetro environment o variable de entorno
        # Mapeo de ambientes a URLs
        environment_urls = {
            "test": "https://test.rentascordoba.gob.ar/bot-web",
            "dev": "https://desa.rentascordoba.gob.ar/bot-web",
            "preprod": "https://preprod.rentascordoba.gob.ar/bot-web"
        }
        
        # Usar el environment pasado como parámetro
        bot_url = environment_urls.get(environment, environment_urls["preprod"])
        
        # Si hay BOT_URL en variables de entorno, usarla (tiene prioridad)
        env_bot_url = os.getenv("BOT_URL")
        if env_bot_url:
            bot_url = env_bot_url
        
        env["BOT_URL"] = bot_url
        print(f"[INFO] BOT_URL para tests: {bot_url}", flush=True)
        
        # Ejecutar test
        if use_shell:
            # En Windows, usar shell=True y el comando completo
            full_command = f'"{npm_path}" {test_command}'
            process = subprocess.Popen(
                full_command,
                cwd=work_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                encoding='utf-8',
                errors='replace',  # Reemplazar caracteres inválidos en lugar de fallar
                text=True,
                universal_newlines=True,
                shell=True,
                env=env  # Pasar variables de entorno
            )
        else:
            # En Linux/Mac, usar lista de argumentos
            process = subprocess.Popen(
                [npm_path, "test", "--", test_file, "--project=chromium"],
                cwd=work_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                encoding='utf-8',
                errors='replace',
                text=True,
                universal_newlines=True,
                shell=False,
                env=env  # Pasar variables de entorno
            )
        
        # Guardar proceso para poder cancelarlo
        active_processes[test_id] = process
        
        # Leer output en tiempo real
        # Leer línea por línea
        log_update_counter = 0  # Contador para actualizar BD periódicamente
        check_cancel_counter = 0  # Contador para verificar cancelación periódicamente
        
        while True:
            try:
                # Verificar si el test fue cancelado (cada 3 iteraciones para detectar rápido)
                check_cancel_counter += 1
                if check_cancel_counter % 3 == 0:
                    current_status = get_test_status(test_id)
                    if current_status and current_status.get("status") == "cancelled":
                        print(f"[INFO] Test {test_id} fue cancelado, terminando proceso y sus hijos...", flush=True)
                        # Terminar el proceso y sus hijos
                        try:
                            import platform
                            if platform.system() == "Windows":
                                # En Windows, usar taskkill para matar el árbol
                                try:
                                    import subprocess as sp
                                    sp.run(
                                        ["taskkill", "/F", "/T", "/PID", str(process.pid)],
                                        capture_output=True,
                                        timeout=5
                                    )
                                    print(f"[INFO] Proceso {test_id} y sus hijos terminados con taskkill", flush=True)
                                except Exception as e:
                                    print(f"[WARNING] Error con taskkill: {str(e)}", flush=True)
                                    process.terminate()
                                    try:
                                        process.wait(timeout=2)
                                    except subprocess.TimeoutExpired:
                                        process.kill()
                            else:
                                process.terminate()
                                try:
                                    process.wait(timeout=3)
                                except subprocess.TimeoutExpired:
                                    process.kill()
                        except Exception as e:
                            print(f"[WARNING] Error terminando proceso: {str(e)}", flush=True)
                        break
                
                output = process.stdout.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    line = output.strip()
                    # Obtener logs actuales desde BD
                    current_status = get_test_status(test_id)
                    
                    # Verificar cancelación antes de procesar la línea
                    if current_status and current_status.get("status") == "cancelled":
                        print(f"[INFO] Test {test_id} fue cancelado, deteniendo lectura de logs...", flush=True)
                        try:
                            import platform
                            if platform.system() == "Windows":
                                try:
                                    import subprocess as sp
                                    sp.run(
                                        ["taskkill", "/F", "/T", "/PID", str(process.pid)],
                                        capture_output=True,
                                        timeout=3
                                    )
                                except:
                                    process.terminate()
                                    try:
                                        process.wait(timeout=2)
                                    except subprocess.TimeoutExpired:
                                        process.kill()
                            else:
                                process.terminate()
                                try:
                                    process.wait(timeout=3)
                                except subprocess.TimeoutExpired:
                                    process.kill()
                        except Exception as e:
                            print(f"[WARNING] Error terminando proceso: {str(e)}", flush=True)
                        break
                    
                    logs = current_status["logs"] if current_status else []
                    logs.append(line)
                    # Mantener solo los últimos 100 logs
                    if len(logs) > 100:
                        logs = logs[-100:]
                    
                    log_update_counter += 1
                    # Actualizar logs periódicamente (cada 10 líneas)
                    if log_update_counter % 10 == 0:
                        update_test_status(test_id, {"logs": logs})
                    else:
                        # Solo actualizar logs sin contar preguntas (más rápido)
                        update_test_status(test_id, {"logs": logs})
                    
                    print(f"[TEST {test_id}] {line}", flush=True)
            except UnicodeDecodeError as e:
                # Si hay un error de codificación, intentar leer como bytes y decodificar con errores reemplazados
                print(f"[WARNING] Error de codificación en línea, omitiendo: {str(e)}", flush=True)
                continue
            except Exception as e:
                print(f"[WARNING] Error leyendo output: {str(e)}", flush=True)
                break
        
        # Verificar si fue cancelado antes de actualizar estado final
        final_status_check = get_test_status(test_id)
        if final_status_check and final_status_check.get("status") == "cancelled":
            print(f"[INFO] Test {test_id} fue cancelado, no actualizando estado final", flush=True)
            # Remover proceso de la lista de activos
            if test_id in active_processes:
                del active_processes[test_id]
            return
        
        # Obtener código de retorno
        return_code = process.poll()
        
        # Actualizar estado final en BD
        completed_at = datetime.utcnow().isoformat()
        final_status = "completed" if return_code == 0 else "failed"
        update_test_status(test_id, {
            "status": final_status,
            "completed_at": completed_at,
            "return_code": return_code
        })
        
        # Remover proceso de la lista de activos
        if test_id in active_processes:
            del active_processes[test_id]
        
        if return_code == 0:
            print(f"[INFO] Test {test_id} completado exitosamente", flush=True)
        else:
            print(f"[ERROR] Test {test_id} falló con código {return_code}", flush=True)
            
    except subprocess.TimeoutExpired:
        update_test_status(test_id, {
            "status": "timeout",
            "completed_at": datetime.utcnow().isoformat()
        })
        if test_id in active_processes:
            del active_processes[test_id]
        print(f"[ERROR] Test {test_id} timeout", flush=True)
    except Exception as e:
        # Asegurar que el estado se actualice incluso si hay un error temprano
        try:
            update_test_status(test_id, {
                "status": "error",
                "error": str(e),
                "completed_at": datetime.utcnow().isoformat()
            })
        except Exception as update_error:
            print(f"[ERROR] Error actualizando estado después de excepción: {str(update_error)}", flush=True)
        
        if test_id in active_processes:
            del active_processes[test_id]
        print(f"[ERROR] Error ejecutando test {test_id}: {str(e)}", flush=True)
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}", flush=True)

def cancel_test_execution(test_id: str) -> bool:
    """Cancelar ejecución de un test"""
    try:
        # Verificar que el test esté corriendo
        status = get_test_status(test_id)
        if not status:
            return False
        
        if status["status"] not in ["queued", "running"]:
            return False
        
        # Primero actualizar el estado a cancelado para que el loop lo detecte
        update_test_status(test_id, {
            "status": "cancelled",
            "completed_at": datetime.utcnow().isoformat(),
            "error": "Ejecución cancelada por el usuario"
        })
        
        # Matar el proceso si existe
        if test_id in active_processes:
            process = active_processes[test_id]
            try:
                print(f"[INFO] Terminando proceso {test_id} (PID: {process.pid})...", flush=True)
                
                # En Windows, necesitamos matar el árbol de procesos
                import platform
                if platform.system() == "Windows":
                    try:
                        # Usar taskkill para matar el proceso y sus hijos
                        import subprocess as sp
                        sp.run(
                            ["taskkill", "/F", "/T", "/PID", str(process.pid)],
                            capture_output=True,
                            timeout=5
                        )
                        print(f"[INFO] Proceso {test_id} y sus hijos terminados con taskkill", flush=True)
                    except Exception as e:
                        print(f"[WARNING] Error con taskkill: {str(e)}, intentando terminate/kill...", flush=True)
                        # Fallback a terminate/kill
                        try:
                            process.terminate()
                            process.wait(timeout=3)
                        except subprocess.TimeoutExpired:
                            process.kill()
                            process.wait(timeout=2)
                else:
                    # Linux/Mac: usar terminate/kill normal
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                        print(f"[INFO] Proceso {test_id} terminado correctamente", flush=True)
                    except subprocess.TimeoutExpired:
                        print(f"[INFO] Proceso {test_id} no terminó, forzando kill...", flush=True)
                        process.kill()
                        process.wait(timeout=2)
                
                del active_processes[test_id]
                print(f"[OK] Proceso {test_id} eliminado de active_processes", flush=True)
            except ProcessLookupError:
                # El proceso ya terminó
                print(f"[INFO] Proceso {test_id} ya había terminado", flush=True)
                if test_id in active_processes:
                    del active_processes[test_id]
            except Exception as e:
                print(f"[WARNING] Error terminando proceso: {str(e)}", flush=True)
                # Intentar kill de todas formas
                try:
                    if test_id in active_processes:
                        process = active_processes[test_id]
                        if platform.system() == "Windows":
                            try:
                                sp.run(
                                    ["taskkill", "/F", "/T", "/PID", str(process.pid)],
                                    capture_output=True,
                                    timeout=3
                                )
                            except:
                                process.kill()
                        else:
                            process.kill()
                        del active_processes[test_id]
                except Exception as e2:
                    print(f"[WARNING] Error en fallback kill: {str(e2)}", flush=True)
        
        return True
    except Exception as e:
        print(f"[ERROR] Error cancelando test: {str(e)}", flush=True)
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}", flush=True)
        return False

def start_test_execution(test_type: str, environment: str = "preprod") -> str:
    """
    Iniciar ejecución de un test
    Retorna el ID de la ejecución
    """
    # Verificar si hay algún test corriendo
    running_tests = get_running_tests()
    if running_tests:
        raise Exception(f"Ya hay un test en ejecución. Tests corriendo: {', '.join(running_tests)}")
    
    test_id = f"{test_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    created_at = datetime.utcnow().isoformat()
    
    # Guardar estado inicial en BD
    update_test_status(test_id, {
        "test_id": test_id,
        "test_type": test_type,
        "status": "queued",
        "created_at": created_at,
        "logs": []
    })
    
    print(f"[INFO] Test {test_id} creado y guardado en BD", flush=True)
    
    # Ejecutar en thread separado
    thread = threading.Thread(target=run_test_async, args=(test_type, test_id, environment), daemon=True)
    thread.start()
    
    print(f"[INFO] Thread iniciado para test {test_id}", flush=True)
    
    return test_id

