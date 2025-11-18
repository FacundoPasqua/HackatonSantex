# Verificar Configuración de Railway

## ⚠️ IMPORTANTE: Configuración Requerida

Después de quitar el Root Directory `/backend`, necesitas verificar estas configuraciones en Railway:

## 1. Settings → Source

1. **Railway Dashboard** → Tu servicio "HackatonSantex" → **Settings** → **Source**

2. **Verifica:**
   - **Root Directory:** Debe estar **VACÍO** o ser `/` (raíz del proyecto)
   - **NO** debe decir `/backend`

3. **Si dice `/backend`:**
   - Haz clic en el ícono de edición (lápiz)
   - Borra el valor o déjalo vacío
   - Guarda

## 2. Settings → Build

1. **Railway Dashboard** → Tu servicio → **Settings** → Busca "Build" o "Deploy"

2. **Verifica que esté usando Dockerfile:**
   - Debería decir "Using Dockerfile" o similar
   - O debería mostrar `Dockerfile` como path

3. **Si NO está usando Dockerfile:**
   - Busca "Dockerfile Path" o "Build Command"
   - Configura: `Dockerfile` (sin `/backend/`)
   - Guarda

## 3. Variables de Entorno

1. **Railway Dashboard** → Tu servicio → **Variables**

2. **Verifica que existan:**
   - `DATABASE_URL`: Debe estar automáticamente (Railway la agrega cuando conectas Postgres)
   - `ALLOWED_ORIGINS`: Debe incluir tu URL de frontend (ej: `https://tu-frontend.vercel.app,http://localhost:3000`)

3. **NO configures `PORT` manualmente** - Railway la inyecta automáticamente

## 4. Verificar Logs

Después de hacer estos cambios:

1. **Haz un redeploy:**
   - Railway → Tu servicio → **Deploy** → **Redeploy**

2. **Ve a Deploy Logs:**
   - Busca al final los mensajes de inicio
   - Deberías ver:
     ```
     [INFO] Starting FastAPI backend
     [INFO] Working directory: /app/backend
     INFO: Uvicorn running on http://0.0.0.0:XXXX
     ```

3. **Si ves errores, compártelos para diagnosticar**

