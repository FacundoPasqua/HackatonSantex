# 🔧 Solución: Error 502 - Verificar Root Directory en Railway

## 🎯 Problema Principal

En proyectos **monorepo** (como el tuyo con `backend/` y `frontend/`), Railway necesita saber en qué directorio está tu backend.

## ✅ Solución: Verificar y Configurar Root Directory

### Paso 1: Verificar Root Directory Actual

1. Ve a [Railway](https://railway.app)
2. Abre tu proyecto **HackatonSantex**
3. Haz clic en tu servicio **Backend**
4. Ve a la pestaña **"Settings"**
5. Busca la sección **"Source"** o **"Build & Deploy"**
6. Busca el campo **"Root Directory"** o **"Working Directory"**

### Paso 2: Configurar Root Directory

**Si el campo está vacío o tiene `/` o `.`:**

1. Haz clic en el campo **"Root Directory"**
2. Escribe: `backend`
3. Guarda los cambios (Railway debería redeployar automáticamente)

**Si el campo ya dice `backend`:**
- El problema puede ser otro. Continúa con el Paso 3.

### Paso 3: Verificar Otras Configuraciones

En la misma sección de Settings, verifica:

1. **Build Command**: Debe estar **vacío** o ser automático
2. **Start Command**: Debe estar **vacío** (Railway usará el Procfile)
3. **Nixpacks Config**: Debe estar en automático

### Paso 4: Verificar el Procfile

Asegúrate de que `backend/Procfile` existe y contiene:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**IMPORTANTE:**
- No debe tener espacios al inicio
- No debe tener líneas en blanco al final
- Debe estar en la raíz del directorio `backend/`

### Paso 5: Reiniciar el Deployment

Después de cambiar el Root Directory:

1. Ve a la pestaña **"Deployments"**
2. Haz clic en los **tres puntos** (⋯) del deployment más reciente
3. Selecciona **"Redeploy"**
4. Espera a que termine (1-2 minutos)

### Paso 6: Verificar que Funciona

1. Espera a que el deployment termine
2. Prueba: `https://hackatonsantex-production.up.railway.app/`
3. Deberías ver un JSON con información de la API

## 🔍 Si el Root Directory Ya Está Configurado Correctamente

Si el Root Directory ya es `backend` y sigue dando 502, prueba:

### Opción A: Verificar Variables de Entorno

1. Ve a Backend → **"Variables"**
2. Verifica:
   - `DATABASE_URL` = `${{ Postgres.DATABASE_URL }}`
   - **NO debe haber** una variable `PORT` (Railway la configura automáticamente)

### Opción B: Probar Versión Simplificada

He creado `backend/app/main_simple.py` que es una versión mínima.

1. Temporalmente, renombra `main.py` a `main_backup.py`
2. Renombra `main_simple.py` a `main.py`
3. Haz commit y push
4. Si funciona, el problema está en el código original
5. Si no funciona, el problema está en la configuración de Railway

### Opción C: Crear Nuevo Servicio en el Mismo Proyecto

1. En Railway → Tu proyecto
2. "+ New" → "GitHub Repo"
3. Selecciona el mismo repositorio
4. En la configuración:
   - **Root Directory**: `backend`
   - **Build Command**: (vacío)
   - **Start Command**: (vacío)
5. Agrega variables de entorno:
   - `DATABASE_URL` = `${{ Postgres.DATABASE_URL }}`
6. Conecta el servicio PostgreSQL existente
7. Deploy

## 📋 Checklist Completo

- [ ] Root Directory = `backend` (NO vacío, NO `/`, NO `.`)
- [ ] Build Command está vacío
- [ ] Start Command está vacío
- [ ] Procfile existe en `backend/Procfile`
- [ ] Procfile tiene el comando correcto
- [ ] `DATABASE_URL` está configurada
- [ ] NO hay variable `PORT` manual
- [ ] Deployment está en estado "Active"

## 🆘 Si Nada Funciona

### Opción 1: Contactar Soporte de Railway

1. Ve a Railway → Tu proyecto
2. Haz clic en "Support" o "Help"
3. Explica:
   - Tienes un monorepo
   - Root Directory está configurado como `backend`
   - El servidor inicia pero da 502 en todas las requests
   - Comparte los Deploy Logs

### Opción 2: Crear Proyecto Nuevo

Si después de todo esto no funciona, crear un proyecto nuevo puede ayudar:

1. Crea un nuevo proyecto en Railway
2. Conecta el mismo repositorio
3. Crea Backend con Root Directory = `backend`
4. Crea PostgreSQL
5. Conecta la base de datos
6. Deploy

A veces Railway tiene problemas con proyectos que se configuraron incorrectamente al inicio.

## 💡 Recomendación Final

**El 90% de los problemas de 502 en monorepos se solucionan configurando el Root Directory correctamente.**

Empieza por verificar eso. Si ya está configurado, entonces el problema puede ser más profundo y crear un nuevo proyecto puede ser la solución más rápida.

