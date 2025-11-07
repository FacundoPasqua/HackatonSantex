# 🔧 Configurar Variables de Entorno en Railway

## Problema Actual

El backend está desplegado pero devuelve **502 Bad Gateway** y errores de **CORS**. Esto se debe a que faltan variables de entorno críticas.

## Variables Necesarias

Necesitas configurar **2 variables de entorno** en Railway:

### 1. `ALLOWED_ORIGINS` (Para CORS)

**Valor:**
```
https://hackaton-santex.vercel.app,http://localhost:3000
```

**Pasos:**
1. Ve a Railway: https://railway.app
2. Selecciona tu proyecto → Servicio "HackatonSantex"
3. Ve a la pestaña **"Variables"**
4. Haz click en **"New Variable"** o busca si ya existe `ALLOWED_ORIGINS`
5. **Key**: `ALLOWED_ORIGINS`
6. **Value**: `https://hackaton-santex.vercel.app,http://localhost:3000`
7. Guarda

### 2. `DATABASE_URL` (Para la Base de Datos)

**Si NO tienes una base de datos PostgreSQL:**

1. En Railway, en tu proyecto, haz click en **"New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. Railway creará automáticamente la variable `DATABASE_URL` en tu servicio backend
5. **No necesitas hacer nada más**, Railway la conecta automáticamente

**Si YA tienes una base de datos:**

1. Ve a tu base de datos PostgreSQL en Railway
2. Ve a la pestaña **"Variables"**
3. Copia el valor de `DATABASE_URL`
4. Ve a tu servicio backend → **"Variables"**
5. Verifica que `DATABASE_URL` exista y tenga el valor correcto
6. Si no existe, agrégalo manualmente con el valor copiado

## Verificar que Está Configurado

Después de configurar las variables:

1. Ve a **"Deployments"** en tu servicio backend
2. Haz click en **"Redeploy"** (o espera a que Railway detecte los cambios)
3. Espera a que termine el deploy (1-2 minutos)
4. Ve a **"Logs"** y verifica que veas:
   - ✅ `Database tables created successfully`
   - ✅ `Uvicorn running on http://0.0.0.0:XXXX`
   - ❌ NO deberías ver errores de conexión a la base de datos

## Probar el Backend

Después del redeploy:

1. Visita: `https://hackatonsantex-production.up.railway.app`
2. Deberías ver un JSON con información de la API
3. Visita: `https://hackatonsantex-production.up.railway.app/docs`
4. Deberías ver la documentación interactiva de FastAPI

## Si Sigue Fallando

### Verificar Logs

1. Ve a **"Logs"** en Railway
2. Busca errores como:
   - `Connection refused` → Falta `DATABASE_URL`
   - `No 'Access-Control-Allow-Origin'` → Falta `ALLOWED_ORIGINS`
   - `ModuleNotFoundError` → Falta una dependencia

### Verificar Variables

1. Ve a **"Variables"**
2. Verifica que ambas variables existan:
   - ✅ `ALLOWED_ORIGINS` = `https://hackaton-santex.vercel.app,http://localhost:3000`
   - ✅ `DATABASE_URL` = `postgresql://...` (debe empezar con postgresql://)

## Resumen Rápido

**Variables necesarias:**
- `ALLOWED_ORIGINS`: `https://hackaton-santex.vercel.app,http://localhost:3000`
- `DATABASE_URL`: Se crea automáticamente cuando agregas PostgreSQL en Railway

**Después de configurar:** Redeploy el servicio backend.

