# Configurar Tests Locales para Usar Backend Local y Base de Producción

## Objetivo
- Ejecutar tests de Playwright localmente (desde tu máquina)
- Usar el backend local (http://localhost:8000)
- Guardar los datos en la base de datos de producción (PostgreSQL en Railway)
- Evitar que se ejecuten tests en producción cuando ejecutas localmente

## Configuración

### 1. Configurar Backend Local para Usar Base de Producción

Crea o edita `backend/.env`:

```env
# Base de datos de producción (PostgreSQL en Railway)
# IMPORTANTE: Usa la URL PÚBLICA, no la interna (railway.internal)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# CORS - permite requests desde localhost
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

**Cómo obtener la URL pública:**
1. Ve a Railway → Tu proyecto → Servicio PostgreSQL
2. Ve a "Connect" o "Public Network"
3. Copia la URL que tenga un host como `containers-us-west-xxx.railway.app`
4. **NO** uses la URL interna (`postgres.railway.internal`)

### 2. Configurar Tests para Usar Backend Local

El archivo `config.env` ya está configurado para usar `http://localhost:8000` cuando ejecutas tests localmente.

**Verifica que `config.env` tenga:**
```env
API_URL=http://localhost:8000
```

### 3. Iniciar Backend Local

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

Deberías ver en los logs:
```
[INFO] Usando base de datos PostgreSQL (Railway)
[INFO] Database engine created successfully
```

### 4. Ejecutar Tests Localmente

En otra terminal:
```bash
npm test
# O para un test específico:
npm test -- tests/specs/automotor.playwright.spec.js
```

## Flujo Completo

1. **Backend Local** (`http://localhost:8000`)
   - Escucha requests de los tests
   - Se conecta a la base de datos de producción en Railway
   - Guarda los resultados en PostgreSQL

2. **Tests de Playwright** (ejecutados localmente)
   - Leen `config.env` → `API_URL=http://localhost:8000`
   - Envían resultados al backend local
   - El backend local los guarda en la base de producción

3. **Frontend** (opcional, si lo ejecutas localmente)
   - Puede conectarse al backend local
   - O al backend de producción (según `VITE_API_URL`)

## Verificación

### Verificar que Funciona:

1. **Inicia el backend local:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **Ejecuta un test pequeño:**
   ```bash
   npm test -- tests/specs/automotor.playwright.spec.js --grep "Lote 1"
   ```

3. **Revisa los logs del backend local:**
   - Deberías ver: `[REQUEST] POST /api/results`
   - Y: `[OK] POST /api/results - Status: 200`

4. **Verifica en Railway:**
   - Ve a tu base de datos PostgreSQL
   - Consulta la tabla `test_results`
   - Deberías ver los nuevos registros

## Separación de Ambientes

### Tests Locales
- Ejecutados desde tu máquina
- Usan backend local (`http://localhost:8000`)
- Guardan en base de producción

### Tests desde Frontend de Producción
- Ejecutados desde Railway (cuando alguien usa el frontend desplegado)
- Usan backend de producción (`https://hackatonsantex-production-d1dc.up.railway.app`)
- Guardan en base de producción

**Los tests NO se ejecutan automáticamente en producción** - solo cuando alguien hace clic en "Ejecutar Tests" desde el frontend desplegado.

## Troubleshooting

### Error: "No se puede conectar a la base de datos"
- Verifica que `DATABASE_URL` use la URL pública (no `railway.internal`)
- Verifica que la base de datos tenga "Public Network" habilitado en Railway

### Error: "CORS error"
- Agrega tu puerto local a `ALLOWED_ORIGINS` en `backend/.env`
- Reinicia el backend local

### Los datos no se guardan
- Revisa los logs del backend local
- Verifica que `API_URL` en `config.env` sea `http://localhost:8000`
- Revisa los logs de los tests para ver errores de conexión

