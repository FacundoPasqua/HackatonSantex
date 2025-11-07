# 🔗 Guía de Integración con Lovable.dev

Esta guía explica cómo conectar tu aplicación React con un proyecto de Lovable.dev.

## ¿Qué es Lovable.dev?

Lovable.dev es una plataforma que permite crear aplicaciones web completas usando IA. Puedes generar código React, componentes, y diseños simplemente describiendo lo que necesitas.

## Opciones de Integración

### Opción 1: Exportar código de Lovable.dev e integrarlo

Si ya tienes un proyecto en Lovable.dev y quieres usar sus componentes en este proyecto:

1. **Exportar el código desde Lovable.dev:**
   - Ve a tu proyecto en Lovable.dev
   - Exporta el código (generalmente hay un botón de exportar o puedes clonar el repositorio si está conectado con GitHub)

2. **Copiar componentes relevantes:**
   - Copia los componentes que quieras usar desde el proyecto de Lovable.dev
   - Pégalos en `frontend/src/components/`
   - Ajusta las importaciones y rutas según sea necesario

3. **Conectar con la API:**
   - Los componentes de Lovable.dev pueden usar el servicio API existente en `frontend/src/services/api.js`
   - O puedes crear nuevos servicios específicos para las funcionalidades de Lovable.dev

### Opción 2: Usar Lovable.dev para mejorar el diseño

Si quieres mejorar el diseño de tu dashboard usando Lovable.dev:

1. **Crear un nuevo proyecto en Lovable.dev:**
   - Ve a [Lovable.dev](https://lovable.dev)
   - Crea un nuevo proyecto
   - Describe el dashboard que necesitas, mencionando que debe conectarse a una API FastAPI

2. **Especificar la estructura de la API:**
   - Menciona que la API tiene estos endpoints:
     - `GET /api/summary` - Resumen general
     - `GET /api/statistics` - Estadísticas
     - `GET /api/results` - Resultados con filtros
     - `GET /api/results/recent/{hours}` - Resultados recientes

3. **Exportar y reemplazar:**
   - Una vez que Lovable.dev genere el código, expórtalo
   - Reemplaza los componentes en `frontend/src/components/` con los nuevos
   - Asegúrate de mantener la conexión con `frontend/src/services/api.js`

### Opción 3: Conectar el proyecto completo de Lovable.dev

Si quieres usar tu proyecto de Lovable.dev como base y conectarlo con este backend:

1. **Clonar o exportar el proyecto de Lovable.dev:**
   ```bash
   # Si está en GitHub
   git clone <url-del-repo-lovable>
   ```

2. **Configurar la API:**
   - Crea un archivo `.env` en el proyecto de Lovable.dev:
     ```env
     VITE_API_URL=http://localhost:8000
     ```
   - O modifica la configuración de la API en el proyecto para apuntar a tu backend

3. **Ajustar los endpoints:**
   - Asegúrate de que las llamadas a la API coincidan con los endpoints de tu backend FastAPI
   - Los endpoints están documentados en `http://localhost:8000/docs`

## Estructura de la API

Tu backend FastAPI expone los siguientes endpoints que puedes usar en Lovable.dev:

### Resumen General
```javascript
GET /api/summary?test_type=automotor&environment=test
Response: {
  total: 100,
  passed: 85,
  failed: 15,
  success_rate: 85.0
}
```

### Estadísticas
```javascript
GET /api/statistics?test_type=automotor
Response: [
  {
    test_type: "automotor",
    environment: "test",
    resultado_final: "PASS",
    count: 50,
    avg_time: 2.5
  }
]
```

### Resultados
```javascript
GET /api/results?test_type=automotor&limit=50&offset=0
Response: [
  {
    id: 1,
    test_id: "test-001",
    categoria: "Categoría",
    pregunta: "Pregunta...",
    resultado_final: "PASS",
    tiempo_segundos: 2.5,
    timestamp: "2024-01-01T12:00:00"
  }
]
```

### Resultados Recientes
```javascript
GET /api/results/recent/24
Response: [/* array de resultados de las últimas 24 horas */]
```

## Ejemplo de Integración

Si quieres usar un componente de Lovable.dev en este proyecto:

1. **Copiar el componente:**
   ```bash
   # Copia el componente desde Lovable.dev a este proyecto
   cp lovable-project/src/components/MiComponente.jsx frontend/src/components/
   ```

2. **Actualizar las importaciones:**
   ```javascript
   // En el componente de Lovable.dev, actualiza las importaciones
   import { getSummary } from '../services/api'
   ```

3. **Usar en el Dashboard:**
   ```javascript
   // En Dashboard.jsx
   import MiComponente from './MiComponente'
   
   // Usar en el render
   <MiComponente data={summary} />
   ```

## Configuración de CORS

Tu backend FastAPI ya está configurado para aceptar peticiones desde cualquier origen (CORS). Si despliegas el frontend en un dominio diferente, puedes ajustar esto en `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tu-dominio.com"],
    # ...
)
```

## Despliegue

### Frontend (React/Vite)
```bash
cd frontend
npm run build
# Los archivos estáticos estarán en frontend/dist/
```

### Backend (FastAPI)
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Recursos Adicionales

- [Documentación de Lovable.dev](https://docs.lovable.dev)
- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de FastAPI](https://fastapi.tiangolo.com)

## Notas

- El proyecto actual usa **Vite** como bundler, que es compatible con la mayoría de proyectos generados por Lovable.dev
- Si Lovable.dev genera código con **Create React App**, puedes migrarlo fácilmente a Vite
- Los componentes de Lovable.dev generalmente usan hooks de React estándar, por lo que son compatibles con este proyecto

