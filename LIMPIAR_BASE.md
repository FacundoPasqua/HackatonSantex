# Limpiar Base de Datos de Producción

## ⚠️ ADVERTENCIA

Este script eliminará **TODOS** los datos de las tablas `test_results` y `test_executions` de la base de datos de producción.

## Requisitos Previos

1. Tener configurada la variable `DATABASE_URL` en `backend/.env` apuntando a la base de producción
2. Tener instaladas las dependencias de Python

## Pasos para Limpiar la Base

### 1. Verificar Configuración

Asegúrate de que `backend/.env` tenga la `DATABASE_URL` correcta:

```env
DATABASE_URL=postgresql://postgres:password@host:port/database
```

### 2. Ejecutar el Script

Desde la carpeta `backend/`:

```bash
cd backend
python limpiar_base.py
```

### 3. Confirmar la Operación

El script mostrará:
- Cuántos registros hay en cada tabla
- Te pedirá confirmación escribiendo `SI` (en mayúsculas)

**Ejemplo de salida:**
```
🔗 Conectando a la base de datos...
📍 URL: postgresql://postgres:password@host:port...

📊 Estado actual de la base de datos:
   - test_results: 150 registros
   - test_executions: 10 registros

⚠️  ADVERTENCIA: Se eliminarán TODOS los datos:
   - 150 registros de test_results
   - 10 registros de test_executions

¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): SI

🗑️  Eliminando datos...
   ✅ test_results eliminados
   ✅ test_executions eliminados

✅ Base de datos limpiada exitosamente!
   - Registros restantes en test_results: 0
   - Registros restantes en test_executions: 0
```

## Seguridad

- El script requiere escribir `SI` exactamente para confirmar
- Muestra el estado antes y después de la operación
- Solo elimina datos, no modifica la estructura de las tablas

## Alternativa: Limpiar Solo una Tabla

Si necesitas modificar el script para limpiar solo una tabla, puedes comentar las líneas correspondientes en `limpiar_base.py`.

