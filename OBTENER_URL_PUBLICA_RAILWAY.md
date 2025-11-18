# Cómo Obtener la URL Pública de PostgreSQL en Railway

## Problema

La URL interna de Railway (`postgres.railway.internal`) solo funciona dentro de la red de Railway. Para conectarte desde tu máquina local, necesitas la **URL pública**.

## Solución: Obtener la URL Pública

### Opción 1: Desde el Dashboard de Railway (Recomendado)

1. Ve a https://railway.app
2. Selecciona tu proyecto
3. Haz clic en el servicio de **PostgreSQL** (no en el backend)
4. Ve a la pestaña **"Connect"** o **"Public Network"**
5. Busca la sección **"Public Network"** o **"Connection String"**
6. Copia la URL que tiene un host como: `containers-us-west-xxx.railway.app`
   - Debe verse algo como: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`
   - **NO** debe tener `railway.internal`

### Opción 2: Usar Railway CLI

1. Instala Railway CLI si no lo tienes:
   ```bash
   npm i -g @railway/cli
   ```

2. Inicia sesión:
   ```bash
   railway login
   ```

3. Conecta a tu proyecto:
   ```bash
   railway link
   ```

4. Obtén la URL pública:
   ```bash
   railway connect postgres
   ```
   Esto te dará la URL pública de conexión.

### Opción 3: Habilitar Public Network en Railway

1. Ve a Railway -> Tu proyecto -> Servicio PostgreSQL
2. Ve a la pestaña **"Settings"** o **"Network"**
3. Busca la opción **"Public Network"** o **"Expose Publicly"**
4. Actívala si está desactivada
5. Esto generará una URL pública que puedes usar

## Formato de la URL Correcta

La URL pública debe verse así:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**NO** debe tener:
- `postgres.railway.internal` ❌
- `localhost` ❌

**SÍ** debe tener:
- Un host como `containers-us-west-xxx.railway.app` ✅
- Puerto `5432` (o el que Railway asigne) ✅

## Configurar en el Script

Una vez que tengas la URL pública, configúrala:

```powershell
$env:DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
python limpiar_base.py
```

O en el archivo `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

