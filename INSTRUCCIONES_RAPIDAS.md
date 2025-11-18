# ⚡ INSTRUCCIONES RÁPIDAS - Ejecutar Tests Locales → Guardar en Producción

## 🎯 Objetivo
Ejecutar tests localmente y que los datos se guarden en la base de datos PostgreSQL de producción.

## 📋 Pasos Rápidos

### 1. Obtener DATABASE_URL Pública de Railway

1. Ve a https://railway.app
2. Tu proyecto → Servicio **PostgreSQL** (no el backend)
3. Pestaña **"Connect"** o **"Settings"**
4. Busca **"Public Network"** → **ACTÍVALA** si está desactivada
5. Copia la **Connection String** pública
   - Formato: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`
   - **NO** debe tener `railway.internal`

### 2. Crear backend/.env

**Opción A: Editar el template**
1. Abre `backend/.env.template`
2. Reemplaza la línea `DATABASE_URL=...` con tu URL pública
3. Guarda como `backend/.env`

**Opción B: Crear manualmente**
Crea `backend/.env` con:
```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@TU_HOST.railway.app:5432/railway
ALLOWED_ORIGINS=*
```

### 3. Reiniciar Backend

**Detén el backend actual** (Ctrl+C en la terminal donde corre) y reinícialo:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verifica que veas:**
```
[INFO] Usando base de datos PostgreSQL (Railway)
[INFO] Database engine created successfully
```

Si ves `[INFO] Usando base de datos SQLite local`, significa que `DATABASE_URL` no se está cargando.

### 4. Ejecutar Tests

En otra terminal:
```bash
npm test
# O para un test específico:
npm test -- tests/specs/automotor.playwright.spec.js
```

### 5. Verificar que Funciona

1. **Revisa logs del backend** - deberías ver:
   ```
   [REQUEST] POST /api/results
   [OK] POST /api/results - Status: 200
   ```

2. **Verifica en Railway**:
   - Ve a Railway → PostgreSQL → Query
   - Ejecuta: `SELECT COUNT(*) FROM test_results;`
   - Ejecuta un test y vuelve a contar - debería aumentar

## ✅ Flujo Completo

```
Tests Locales (npm test)
    ↓
config.env: API_URL=http://localhost:8000 ✅
    ↓
Backend Local (puerto 8000) ✅
    ↓
backend/.env: DATABASE_URL=postgresql://...railway.app ⚠️ CREAR ESTE ARCHIVO
    ↓
Base de Datos PostgreSQL en Railway (PRODUCCIÓN) ✅
```

## 🚨 Troubleshooting

### "Usando base de datos SQLite local"
- El archivo `backend/.env` no existe o no tiene `DATABASE_URL`
- Verifica que el archivo esté en `backend/.env` (no `backend.env` o `.env`)

### "No se puede conectar a la base de datos"
- Verifica que uses la URL **pública** (no `railway.internal`)
- Verifica que "Public Network" esté habilitado en Railway

### Los datos no aparecen en el frontend de producción
- Los datos SÍ se están guardando en la base de producción
- El frontend de producción debería leerlos automáticamente
- Verifica en Railway → PostgreSQL → Query que los datos estén ahí

