# 📊 Test Results Dashboard

Sistema completo para almacenar y visualizar resultados de tests automatizados de Playwright.

## 🚀 Características

- ✅ **Backend FastAPI** - API REST para almacenar y consultar resultados
- ✅ **Frontend React** - Dashboard interactivo moderno con gráficos y estadísticas
- ✅ **Base de Datos** - SQLite (desarrollo) o PostgreSQL (producción)
- ✅ **Integración con Tests** - Los tests de Playwright guardan automáticamente en la BD
- ✅ **Múltiples Tipos de Tests** - Automotor, Inmobiliario, Embarcaciones

## 📁 Estructura del Proyecto

```
hackaton/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── main.py      # Aplicación principal
│   │   ├── models.py    # Modelos SQLAlchemy
│   │   ├── schemas.py   # Schemas Pydantic
│   │   └── database.py  # Configuración BD
│   └── requirements.txt
├── frontend/            # Dashboard React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── services/    # Servicios API
│   │   └── App.jsx     # Componente principal
│   ├── package.json
│   └── vite.config.js
├── tests/               # Tests de Playwright
│   ├── specs/
│   └── data/
└── README.md
```

## 🛠️ Instalación Local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deployment

### Opción Recomendada: Monorepo

Este proyecto está configurado como monorepo. Puedes desplegar:

- **Frontend en Vercel**: Configura el Root Directory como `frontend`
- **Backend en Railway**: Configura el Root Directory como `backend`

Ver `QUICK_DEPLOY.md` para instrucciones detalladas.

### URLs después del Deployment

- Frontend: `https://tu-proyecto.vercel.app`
- Backend: `https://tu-backend.railway.app`
- API Docs: `https://tu-backend.railway.app/docs`

## 📝 Variables de Entorno

### Frontend (Vercel)
- `VITE_API_URL`: URL del backend (ej: `https://tu-backend.railway.app`)

### Backend (Railway/Render)
- `DATABASE_URL`: URL de PostgreSQL
- `ALLOWED_ORIGINS`: Orígenes permitidos para CORS (ej: `https://tu-frontend.vercel.app,http://localhost:3000`)

## 📚 Documentación

- `QUICK_DEPLOY.md` - Guía rápida de deployment
- `DEPLOYMENT.md` - Guía detallada con todas las opciones
- `LOVABLE_INTEGRATION.md` - Cómo conectar con Lovable.dev

## 📄 Licencia

ISC
