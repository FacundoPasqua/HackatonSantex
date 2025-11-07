# 🚀 Guía de Deployment

Esta guía te ayudará a desplegar el proyecto en Vercel (frontend) y Railway/Render (backend).

## Opción 1: Frontend en Vercel + Backend en Railway (Recomendado)

### Frontend en Vercel

1. **Instalar Vercel CLI** (opcional, también puedes usar la interfaz web):
   ```bash
   npm i -g vercel
   ```

2. **Desde el directorio frontend, ejecutar**:
   ```bash
   cd frontend
   vercel
   ```

3. **O usar la interfaz web de Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Selecciona el directorio `frontend` como raíz del proyecto
   - Configura las variables de entorno:
     - `VITE_API_URL`: URL de tu backend (ej: `https://tu-backend.railway.app`)

4. **Configuración en Vercel**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Backend en Railway

1. **Crear cuenta en Railway**:
   - Ve a [railway.app](https://railway.app)
   - Conecta tu cuenta de GitHub

2. **Crear nuevo proyecto**:
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Selecciona el directorio `backend`

3. **Configurar variables de entorno**:
   - `DATABASE_URL`: Railway te proporcionará una base de datos PostgreSQL automáticamente
   - O usa SQLite para desarrollo (no recomendado para producción)

4. **Railway detectará automáticamente**:
   - Python como runtime
   - Instalará dependencias de `requirements.txt`
   - Ejecutará el servidor

5. **Obtener la URL del backend**:
   - Railway te dará una URL como: `https://tu-proyecto.railway.app`
   - Actualiza `VITE_API_URL` en Vercel con esta URL

## Opción 2: Todo en Vercel (Frontend + Backend)

### Frontend

Sigue los pasos de la Opción 1 para el frontend.

### Backend en Vercel

1. **Crear archivo `api/index.py`** en la raíz del proyecto:
   ```python
   from backend.app.main import app
   ```

2. **Desplegar backend**:
   ```bash
   cd backend
   vercel
   ```

3. **Configurar variables de entorno en Vercel**:
   - `DATABASE_URL`: Para producción, usa una base de datos externa (PostgreSQL)

## Opción 3: Backend en Render

1. **Crear cuenta en Render**:
   - Ve a [render.com](https://render.com)
   - Conecta tu cuenta de GitHub

2. **Crear nuevo Web Service**:
   - Selecciona tu repositorio
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3

3. **Configurar variables de entorno**:
   - `DATABASE_URL`: Render puede crear una base de datos PostgreSQL para ti

4. **Obtener la URL**:
   - Render te dará una URL como: `https://tu-proyecto.onrender.com`
   - Actualiza `VITE_API_URL` en Vercel

## Variables de Entorno

### Frontend (Vercel)
- `VITE_API_URL`: URL completa del backend (ej: `https://tu-backend.railway.app`)

### Backend (Railway/Render)
- `DATABASE_URL`: URL de conexión a PostgreSQL
- Para SQLite en desarrollo: `sqlite:///./test_results.db`

## Verificación Post-Deployment

1. **Verificar Frontend**:
   - Debe cargar correctamente
   - Debe poder conectarse al backend

2. **Verificar Backend**:
   - Visita `https://tu-backend.railway.app/docs` para ver la documentación de la API
   - Prueba el endpoint: `https://tu-backend.railway.app/api/summary`

3. **Verificar CORS**:
   - Asegúrate de que el backend permita el origen del frontend
   - En `backend/app/main.py`, actualiza `allow_origins` con la URL de Vercel

## Actualizar CORS en el Backend

Si despliegas el backend, actualiza el archivo `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-frontend.vercel.app",
        "http://localhost:3000"  # Para desarrollo local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

**Error: "Cannot connect to API"**
- Verifica que `VITE_API_URL` esté configurada correctamente en Vercel
- Verifica que el backend esté corriendo y accesible
- Verifica CORS en el backend

**Error: "Database connection failed"**
- Verifica que `DATABASE_URL` esté configurada correctamente
- Para PostgreSQL, asegúrate de que la base de datos esté creada y accesible

**Error: "Build failed"**
- Verifica que todas las dependencias estén en `package.json` o `requirements.txt`
- Revisa los logs de build en Vercel/Railway/Render

## URLs de Ejemplo

Después del deployment, tendrás:
- Frontend: `https://tu-proyecto.vercel.app`
- Backend: `https://tu-backend.railway.app` o `https://tu-backend.onrender.com`
- API Docs: `https://tu-backend.railway.app/docs`

