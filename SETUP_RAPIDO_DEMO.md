# Setup Rápido para Demo - Tests Locales → Base de Producción

## ⚡ Configuración en 3 Pasos

### Paso 1: Obtener DATABASE_URL Pública de Railway

1. Ve a https://railway.app
2. Selecciona tu proyecto
3. Haz clic en el servicio **PostgreSQL** (no en el backend)
4. Ve a la pestaña **"Connect"** o **"Settings"**
5. Busca **"Public Network"** o **"Expose Publicly"**
6. **Actívala** si está desactivada
7. Copia la **Connection String** o **Public Network URL**
   - Debe verse como: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`
   - **NO** debe tener `railway.internal`

### Paso 2: Crear backend/.env

Crea el archivo `backend/.env` con este contenido:

```env
# Base de datos de producción (PostgreSQL en Railway)
# PEGA AQUÍ LA URL PÚBLICA QUE COPIaste DE RAILWAY
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# CORS - permite todos los orígenes para desarrollo local
ALLOWED_ORIGINS=*
```

**Reemplaza** `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway` con la URL real que copiaste de Railway.

### Paso 3: Ejecutar

**Terminal 1 - Backend:**
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

**Terminal 2 - Tests:**
```bash
npm test
# O para un test específico:
npm test -- tests/specs/automotor.playwright.spec.js
```

## ✅ Verificación

1. **Revisa los logs del backend** - deberías ver:
   ```
   [REQUEST] POST /api/results
   [OK] POST /api/results - Status: 200
   ```

2. **Verifica en Railway**:
   - Ve a Railway → PostgreSQL → Query
   - Ejecuta: `SELECT COUNT(*) FROM test_results;`
   - Ejecuta un test y vuelve a contar - debería aumentar

## 🚨 Si Algo Falla

### Error: "No se puede conectar a la base de datos"
- Verifica que `DATABASE_URL` use la URL **pública** (no `railway.internal`)
- Verifica que "Public Network" esté habilitado en Railway

### Error: "CORS error"
- Ya está configurado con `ALLOWED_ORIGINS=*` en `backend/.env`
- Reinicia el backend si lo cambiaste

### Los datos no se guardan
- Verifica que el backend local esté corriendo en puerto 8000
- Verifica que `config.env` tenga `API_URL=http://localhost:8000`
- Revisa los logs del backend para ver errores

## 📝 Resumen del Flujo

```
Tests Locales (npm test)
    ↓
API_URL=http://localhost:8000 (config.env) ✅
    ↓
Backend Local (puerto 8000) ✅
    ↓
DATABASE_URL=postgresql://...railway.app (backend/.env) ⚠️ CREAR ESTE ARCHIVO
    ↓
Base de Datos PostgreSQL en Railway (PRODUCCIÓN) ✅
```

