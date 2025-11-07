# 🚀 Deployment Rápido - Guía Paso a Paso

## Opción Recomendada: Frontend en Vercel + Backend en Railway

### Paso 1: Deploy del Backend en Railway

1. **Ve a [railway.app](https://railway.app)** y crea una cuenta (puedes usar GitHub)

2. **Crea un nuevo proyecto**:
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio
   - **IMPORTANTE**: En "Root Directory", especifica: `backend`
   - Railway detectará automáticamente Python

3. **Railway detectará automáticamente**:
   - Python como runtime
   - Instalará dependencias de `requirements.txt`
   - Ejecutará el servidor

4. **Agrega una base de datos PostgreSQL**:
   - En tu proyecto de Railway, click en "New"
   - Selecciona "Database" → "Add PostgreSQL"
   - Railway creará automáticamente la base de datos

5. **Configura variables de entorno**:
   - En la pestaña "Variables" de tu servicio backend:
     - `DATABASE_URL`: Copia el valor de `DATABASE_URL` de la base de datos PostgreSQL que creaste
     - `ALLOWED_ORIGINS`: Por ahora déjalo vacío (lo actualizaremos después)

6. **Obtén la URL de tu backend**:
   - Railway te dará una URL como: `https://tu-proyecto-production.up.railway.app`
   - **Copia esta URL**, la necesitarás para el frontend

### Paso 2: Deploy del Frontend en Vercel

1. **Ve a [vercel.com](https://vercel.com)** y crea una cuenta (puedes usar GitHub)

2. **Importa tu proyecto**:
   - Click en "Add New..." → "Project"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio

3. **Configura el proyecto**:
   - **IMPORTANTE**: En "Root Directory", especifica: `frontend`
   - **Framework Preset**: Vite (debería detectarse automáticamente)
   - **Build Command**: `npm run build` (debería estar automático)
   - **Output Directory**: `dist` (debería estar automático)
   
   Si no ves la opción "Root Directory" inmediatamente:
   - Después de conectar el repo, ve a "Settings"
   - Busca "Root Directory" y cambia a `frontend`

4. **Configura variables de entorno**:
   - Click en "Environment Variables"
   - Agrega:
     - **Name**: `VITE_API_URL`
     - **Value**: La URL de tu backend de Railway (ej: `https://tu-proyecto-production.up.railway.app`)

5. **Deploy**:
   - Click en "Deploy"
   - Espera a que termine el build

6. **Obtén la URL de tu frontend**:
   - Vercel te dará una URL como: `https://tu-proyecto.vercel.app`
   - **Copia esta URL**

### Paso 3: Actualizar CORS en el Backend

1. **Vuelve a Railway** (backend):
   - Ve a la pestaña "Variables"
   - Actualiza `ALLOWED_ORIGINS`:
     - Valor: `https://tu-proyecto.vercel.app,http://localhost:3000`
     - (Reemplaza `tu-proyecto.vercel.app` con tu URL real)

2. **Redeploy el backend**:
   - Railway debería redeployar automáticamente cuando cambias variables
   - O puedes hacer click en "Redeploy"

### Paso 4: Verificar

1. **Visita tu frontend**: `https://tu-proyecto.vercel.app`
2. **Verifica que cargue correctamente**
3. **Prueba la API**: `https://tu-backend.railway.app/docs`

## Alternativa: Todo en Vercel

Si prefieres tener todo en Vercel:

### Backend en Vercel (Serverless Functions)

1. **Crea un archivo `api/index.py`** en la raíz del proyecto:
   ```python
   from backend.app.main import app
   ```

2. **Despliega el backend**:
   - En Vercel, crea otro proyecto
   - Root Directory: `backend`
   - Framework: Other
   - Build Command: (dejar vacío)
   - Output Directory: (dejar vacío)

3. **Configura variables**:
   - `DATABASE_URL`: Necesitarás una base de datos externa (Railway, Supabase, etc.)

## URLs de Ejemplo

Después del deployment tendrás:
- **Frontend**: `https://test-results-dashboard.vercel.app`
- **Backend**: `https://test-results-api.railway.app`
- **API Docs**: `https://test-results-api.railway.app/docs`

## Troubleshooting

**Error: "Cannot connect to API"**
- Verifica que `VITE_API_URL` en Vercel tenga la URL correcta del backend
- Verifica que el backend esté corriendo (visita `/docs` en la URL del backend)
- Verifica CORS en el backend

**Error: "Database connection failed"**
- Verifica que `DATABASE_URL` esté configurada en Railway
- Asegúrate de que la base de datos PostgreSQL esté creada y activa

**Error: "Build failed"**
- Revisa los logs en Vercel/Railway
- Verifica que todas las dependencias estén en `package.json` o `requirements.txt`

## Notas Importantes

- **Railway** ofrece un plan gratuito generoso para empezar
- **Vercel** también tiene un plan gratuito excelente
- Para producción, considera usar PostgreSQL en lugar de SQLite
- Los cambios en el código se deployan automáticamente si conectaste GitHub

