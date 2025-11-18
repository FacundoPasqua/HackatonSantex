# Solución: Tests Fallando en Railway

## 🔍 Diagnóstico

Si los tests terminan con estado "error" en Railway, puede ser por varias razones. Sigue estos pasos para diagnosticar:

## 📋 Paso 1: Verificar Logs en Railway

1. **Abre Railway Dashboard:**
   - Ve a https://railway.app
   - Selecciona tu proyecto del backend
   - Ve a la pestaña **"Logs"**

2. **Busca estos mensajes de error:**
   - `[ERROR] Error ejecutando test`
   - `npm no encontrado`
   - `FileNotFoundError`
   - `No such file or directory`
   - Cualquier traceback de Python

3. **Copia los últimos logs** (especialmente los que muestran el error)

## 🛠️ Problemas Comunes y Soluciones

### Problema 1: Node.js/npm no está instalado en Railway

**Síntomas:**
- Error: `npm no encontrado` o `npm: command not found`
- Error: `FileNotFoundError: [Errno 2] No such file or directory`

**Solución:**

Railway necesita tener Node.js instalado para ejecutar los tests. Hay dos formas:

#### Opción A: Agregar Node.js al Dockerfile (Recomendado)

Crea un archivo `Dockerfile` en la raíz del proyecto:

```dockerfile
FROM python:3.11-slim

# Instalar Node.js y npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar dependencias de Node.js (para Playwright)
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production=false

# Instalar Playwright browsers
RUN npx playwright install --with-deps chromium

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para iniciar
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Opción B: Usar Railway Buildpacks

1. En Railway Dashboard → tu servicio → Settings
2. Ve a "Buildpacks"
3. Agrega:
   - `heroku/nodejs` (primero)
   - `heroku/python` (segundo)

### Problema 2: Playwright no está instalado

**Síntomas:**
- Error: `Cannot find module '@playwright/test'`
- Error al ejecutar `npm test`

**Solución:**

Asegúrate de que `package.json` tenga las dependencias correctas:

```json
{
  "dependencies": {
    "@playwright/test": "^1.56.1",
    "dotenv": "^17.2.3",
    "googleapis": "^161.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^24.6.2"
  }
}
```

Y que los browsers de Playwright estén instalados. Agrega esto al `Dockerfile` o crea un script de setup.

### Problema 3: Archivos de tests no encontrados

**Síntomas:**
- Error: `FileNotFoundError: [Errno 2] No such file or directory: 'tests/specs/...'`
- Error: `Cannot find module '../../utils/api_client.js'`

**Solución:**

1. **Verifica que los archivos estén en Git:**
   ```bash
   git ls-files tests/
   git ls-files utils/
   ```

2. **Asegúrate de que no estén en `.gitignore`:**
   - Revisa `.gitignore` y asegúrate de que `tests/` y `utils/` NO estén ignorados

3. **Haz commit y push:**
   ```bash
   git add tests/ utils/
   git commit -m "fix: Agregar archivos de tests al repositorio"
   git push
   ```

### Problema 4: Variables de entorno faltantes

**Síntomas:**
- Error: `BOT_URL is not defined`
- Error: `API_URL is not defined`

**Solución:**

1. **En Railway Dashboard:**
   - Ve a tu servicio → Variables
   - Agrega las variables necesarias:
     - `BOT_URL` (si es necesario para los tests)
     - `DATABASE_URL` (ya debería estar)
     - `ALLOWED_ORIGINS` (ya debería estar)

2. **Verifica `config.env` en el repositorio:**
   - Los tests cargan `config.env` desde la raíz
   - Asegúrate de que exista o que las variables estén en Railway

### Problema 5: Permisos o rutas incorrectas

**Síntomas:**
- Error: `Permission denied`
- Error: `Working directory not found`

**Solución:**

El backend busca el directorio de trabajo automáticamente. Si falla, verifica en los logs:
- `[INFO] Ejecutando desde: /app` (debería ser la raíz del proyecto)

## 🔧 Solución Rápida: Dockerfile Completo

Crea este `Dockerfile` en la **raíz del proyecto**:

```dockerfile
FROM python:3.11-slim

# Instalar Node.js 20.x
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verificar instalación
RUN node --version && npm --version

# Instalar dependencias de Python
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar dependencias de Node.js
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Instalar Playwright y browsers
RUN npx playwright install --with-deps chromium

# Copiar todo el código
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para iniciar
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Y crea un `.dockerignore`:

```
node_modules/
backend/venv/
__pycache__/
*.pyc
.env
*.db
.git/
```

## 📝 Pasos para Aplicar la Solución

1. **Crea el Dockerfile** (usando el de arriba)

2. **Haz commit y push:**
   ```bash
   git add Dockerfile .dockerignore
   git commit -m "fix: Agregar Dockerfile con Node.js para ejecutar tests"
   git push origin main
   ```

3. **En Railway:**
   - Ve a Settings → Build
   - Asegúrate de que "Dockerfile Path" esté configurado (o déjalo en auto)
   - Railway detectará el Dockerfile automáticamente

4. **Espera el redeploy:**
   - Railway hará rebuild automáticamente
   - Puede tardar 5-10 minutos (instala Node.js y Playwright)

5. **Verifica los logs:**
   - Busca: `[INFO] npm encontrado en: /usr/bin/npm`
   - Busca: `[INFO] Ejecutando desde: /app`

6. **Prueba ejecutar un test:**
   - Desde el frontend, ejecuta un test pequeño
   - Verifica que no termine con "error"

## 🧪 Verificación

Después del deploy, verifica:

1. **Logs del backend al iniciar:**
   ```
   [OK] Database tables created successfully
   [INFO] CORS configured with origins: ...
   ```

2. **Al ejecutar un test:**
   ```
   [INFO] Test embarcaciones_20251118_XXXXX creado y guardado en BD
   [INFO] npm encontrado en: /usr/bin/npm
   [INFO] Ejecutando desde: /app
   [INFO] Ejecutando: /usr/bin/npm test -- tests/specs/embarcaciones.playwright.spec.js --project=chromium
   ```

3. **No deberías ver:**
   - `npm no encontrado`
   - `FileNotFoundError`
   - `Cannot find module`

## 🆘 Si Aún No Funciona

1. **Comparte los logs completos** del error desde Railway
2. **Verifica la estructura del proyecto** en Railway:
   - Debería tener `/app/tests/specs/`
   - Debería tener `/app/package.json`
   - Debería tener `/app/utils/api_client.js`

3. **Prueba ejecutar manualmente** desde Railway:
   - Railway → tu servicio → "Shell"
   - Ejecuta: `npm test -- tests/specs/embarcaciones.playwright.spec.js --project=chromium`
   - Verifica qué error aparece

