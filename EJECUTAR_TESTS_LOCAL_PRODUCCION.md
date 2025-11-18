# Ejecutar Tests Locales y Guardar en Producción - Guía Rápida

## Configuración Rápida para Demo

### Paso 1: Configurar Backend Local para Usar Base de Producción

Crea o edita `backend/.env`:

```env
# Base de datos de producción (PostgreSQL en Railway)
# IMPORTANTE: Usa la URL PÚBLICA, no la interna
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# CORS - permite requests desde localhost
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,*
```

**Cómo obtener DATABASE_URL pública:**
1. Ve a Railway → Tu proyecto → Servicio PostgreSQL
2. Ve a "Connect" o "Public Network"
3. Copia la URL que tenga un host como `containers-us-west-xxx.railway.app`
4. **NO** uses `postgres.railway.internal` (esa es interna)

### Paso 2: Verificar config.env

Asegúrate de que `config.env` tenga:
```env
API_URL=http://localhost:8000
```

### Paso 3: Iniciar Backend Local

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Deberías ver:
```
[INFO] Usando base de datos PostgreSQL (Railway)
[INFO] Database engine created successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Paso 4: Ejecutar Tests

En otra terminal (desde la raíz del proyecto):
```bash
npm test -- tests/specs/automotor.playwright.spec.js
# O para todos:
npm test
```

## Verificación Rápida

1. **Verifica que el backend local esté corriendo:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method GET
   ```
   Deberías ver una respuesta JSON.

2. **Verifica que se estén guardando datos:**
   - Revisa los logs del backend local - deberías ver `[REQUEST] POST /api/results`
   - Ve a Railway → PostgreSQL → Query y ejecuta:
     ```sql
     SELECT COUNT(*) FROM test_results;
     ```
   - Ejecuta un test y vuelve a contar - debería aumentar

## Troubleshooting Rápido

### Error: "No se puede conectar a la base de datos"
- Verifica que `DATABASE_URL` use la URL pública (no `railway.internal`)
- Verifica que la base de datos tenga "Public Network" habilitado en Railway

### Error: "CORS error"
- Agrega `*` a `ALLOWED_ORIGINS` en `backend/.env` temporalmente
- Reinicia el backend

### Los datos no se guardan
- Revisa los logs del backend local
- Verifica que `API_URL` en `config.env` sea `http://localhost:8000`
- Verifica que el backend local esté corriendo en el puerto 8000

## Flujo Completo

```
Tests Locales (npm test)
    ↓
API_URL=http://localhost:8000 (config.env)
    ↓
Backend Local (puerto 8000)
    ↓
DATABASE_URL=postgresql://...railway.app (backend/.env)
    ↓
Base de Datos PostgreSQL en Railway (PRODUCCIÓN)
```

