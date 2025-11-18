# Solución para Tests Atascados en "queued"

## Problema
Los tests quedan en estado "queued" y nunca pasan a "running", causando un loop infinito de requests del frontend.

## Soluciones Implementadas

### 1. Mejor Manejo de Errores en Threads
- Agregado wrapper `run_with_error_handling()` que captura excepciones no capturadas
- Si el thread falla, el estado se actualiza a "error" automáticamente
- Verificación de que el thread esté vivo después de iniciarse

### 2. Endpoint de Limpieza
Nuevo endpoint: `POST /api/tests/cleanup-stuck`

Este endpoint:
- Busca tests en estado "queued" por más de 5 minutos
- Los marca como "error" automáticamente
- Los remueve de la lista de tests corriendo

### 3. Logging Mejorado
- Agregado logging al inicio de `run_test_async` para diagnosticar problemas
- Mejor manejo de errores con traceback completo

## Cómo Usar

### Limpiar Tests Atascados Manualmente

Puedes llamar al endpoint de limpieza desde cualquier cliente HTTP:

```bash
curl -X POST https://hackatonsantex-production-d1dc.up.railway.app/api/tests/cleanup-stuck
```

O desde el navegador (si tienes acceso):
```
POST https://hackatonsantex-production-d1dc.up.railway.app/api/tests/cleanup-stuck
```

### Limpiar Tests Atascados desde el Script Python

Puedes agregar esto al script `limpiar_base.py` o crear uno nuevo:

```python
import requests

response = requests.post("https://hackatonsantex-production-d1dc.up.railway.app/api/tests/cleanup-stuck")
print(response.json())
```

## Prevención

Los cambios implementados deberían prevenir que los tests queden atascados:

1. **Mejor manejo de errores**: Si el thread falla, se captura y se actualiza el estado
2. **Verificación de thread**: Se verifica que el thread esté vivo después de iniciarse
3. **Limpieza automática**: Puedes llamar al endpoint de limpieza periódicamente

## Próximos Pasos

1. **Haz push de los cambios** para que se desplieguen en Railway
2. **Llama al endpoint de limpieza** para limpiar el test atascado actual:
   ```bash
   curl -X POST https://hackatonsantex-production-d1dc.up.railway.app/api/tests/cleanup-stuck
   ```
3. **Revisa los logs** después del deploy para ver si hay errores al iniciar threads

## Verificación

Después del deploy, revisa los logs del backend. Deberías ver:
- `[INFO] ===== INICIANDO run_test_async para {test_id} =====` cuando se inicia un test
- Si hay errores, verás el traceback completo
- Si un thread no se inicia, verás `[WARNING] Thread para {test_id} no esta vivo despues de iniciarse`

