# Frontend React - Dashboard de Tests

Dashboard moderno construido con React y Vite para visualizar resultados de tests automatizados.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Construcción para Producción

```bash
npm run build
```

Los archivos estáticos se generarán en `dist/`

### Vista Previa de Producción

```bash
npm run preview
```

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/        # Componentes React
│   │   ├── Dashboard.jsx  # Componente principal
│   │   ├── Filters.jsx    # Filtros laterales
│   │   ├── Metrics.jsx    # Tarjetas de métricas
│   │   ├── StatisticsChart.jsx  # Gráfico de estadísticas
│   │   ├── ResultsTable.jsx     # Tabla de resultados
│   │   └── TrendsChart.jsx       # Gráfico de tendencias
│   ├── services/
│   │   └── api.js         # Servicio para llamadas a la API
│   ├── App.jsx            # Componente raíz
│   └── main.jsx           # Punto de entrada
├── index.html
├── vite.config.js         # Configuración de Vite
└── package.json
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:8000
```

Si no especificas esta variable, por defecto usará `http://localhost:8000`.

### Proxy de Desarrollo

Vite está configurado para hacer proxy de las peticiones `/api` al backend durante el desarrollo. Esto se configura en `vite.config.js`.

## 🔌 Conectar con Lovable.dev

Si tienes un proyecto en Lovable.dev y quieres integrarlo, consulta `LOVABLE_INTEGRATION.md` en la raíz del proyecto para instrucciones detalladas.

## 📦 Dependencias Principales

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos y visualizaciones
- **date-fns** - Utilidades para fechas

## 🎨 Características

- ✅ Dashboard responsive y moderno
- ✅ Filtros en tiempo real
- ✅ Gráficos interactivos (barras y líneas)
- ✅ Tabla de resultados con paginación
- ✅ Métricas en tiempo real
- ✅ Visualización de tendencias

## 🐛 Solución de Problemas

**Error: Cannot connect to API**
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Verifica la variable `VITE_API_URL` en `.env`
- Revisa la consola del navegador para más detalles

**Error: Module not found**
- Ejecuta `npm install` para instalar las dependencias
- Verifica que estés en el directorio `frontend/`

