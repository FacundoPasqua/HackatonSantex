# 🎭 Comandos para Ejecutar Tests de Playwright

## ✅ Instalación (Ya completada)

Las dependencias y navegadores de Playwright ya están instalados. Si necesitas reinstalar:

```bash
# Instalar dependencias npm
npm install

# Instalar navegadores de Playwright
npx playwright install --with-deps
```

## 🚀 Comandos para Ejecutar Tests

### Ejecutar Todos los Tests

```bash
npm test
```

O directamente con Playwright:

```bash
npx playwright test
```

### Ejecutar un Test Específico

**Test de Automotor:**
```bash
npx playwright test tests/specs/automotor.playwright.spec.js
```

**Test de Inmobiliario:**
```bash
npx playwright test tests/specs/inmobiliario.playwright.spec.js
```

**Test de Embarcaciones:**
```bash
npx playwright test tests/specs/embarcaciones.playwright.spec.js
```

### Ejecutar Tests con Interfaz Visual (Modo UI)

```bash
npm run test:ui
```

O:

```bash
npx playwright test --ui
```

Este comando abre una interfaz gráfica donde puedes:
- Ver todos los tests
- Ejecutar tests individuales
- Ver los resultados en tiempo real
- Depurar tests fácilmente

### Ejecutar Tests en Modo Visible (Headed)

Por defecto, Playwright ejecuta los tests en modo headless (sin ventana). Para ver el navegador:

```bash
npm run test:headed
```

O:

```bash
npx playwright test --headed
```

### Ejecutar Tests en Modo Debug

Para depurar un test paso a paso:

```bash
npm run test:debug
```

O:

```bash
npx playwright test --debug
```

### Ver Reporte HTML

Después de ejecutar los tests, puedes ver un reporte HTML detallado:

```bash
npm run test:report
```

O:

```bash
npx playwright show-report
```

### Ejecutar Tests en un Navegador Específico

Por defecto, los tests se ejecutan en Chromium, Firefox y WebKit. Para ejecutar solo en uno:

**Solo Chromium:**
```bash
npx playwright test --project=chromium
```

**Solo Firefox:**
```bash
npx playwright test --project=firefox
```

**Solo WebKit (Safari):**
```bash
npx playwright test --project=webkit
```

### Ejecutar Tests con Filtros

**Por nombre de test:**
```bash
npx playwright test -g "automotor"
```

**Por tag:**
```bash
npx playwright test --grep @smoke
```

## 📋 Configuración

Los tests están configurados para:

- **Guardar resultados en la BD**: Los tests guardan automáticamente los resultados en tu backend (configurado en `config.env`)
- **URL del Bot**: Configurada en `config.env` como `BOT_URL`
- **API URL**: Configurada en `config.env` como `API_URL` (por defecto: `http://localhost:8000`)

### Verificar Configuración

Asegúrate de que:
1. ✅ El backend esté corriendo en `http://localhost:8000`
2. ✅ El archivo `config.env` exista en la raíz del proyecto
3. ✅ La variable `API_URL` apunte a tu backend

## 🔍 Ver Logs Detallados

Para ver más información durante la ejecución:

```bash
npx playwright test --reporter=list
```

Para ver logs en consola:

```bash
DEBUG=pw:api npx playwright test
```

## 📊 Estructura de Tests

Los tests están organizados en:

```
tests/
├── specs/
│   ├── automotor.playwright.spec.js      # Tests de Automotor
│   ├── inmobiliario.playwright.spec.js    # Tests de Inmobiliario
│   └── embarcaciones.playwright.spec.js   # Tests de Embarcaciones
└── data/
    ├── Automotor.xlsx                     # Datos de prueba para Automotor
    ├── Inmobiliario.xlsx                  # Datos de prueba para Inmobiliario
    └── Embarcaciones.xlsx                 # Datos de prueba para Embarcaciones
```

## ⚠️ Notas Importantes

1. **Backend debe estar corriendo**: Los tests necesitan que el backend esté activo para guardar resultados
2. **Tiempo de ejecución**: Los tests pueden tardar varios minutos dependiendo de la cantidad de preguntas
3. **Rate limiting**: Los tests incluyen esperas entre lotes para evitar sobrecargar el servidor

## 🆘 Solución de Problemas

### Error: "Cannot find module '@playwright/test'"

```bash
npm install
```

### Error: "Executable doesn't exist"

```bash
npx playwright install --with-deps
```

### Error: "Backend no responde"

Asegúrate de que el backend esté corriendo:
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Los tests no guardan en la BD

1. Verifica que `API_URL` en `config.env` sea correcta
2. Verifica que el backend esté corriendo
3. Prueba la conexión:
```bash
node test-api-connection.js
```

## 📚 Más Información

- [Documentación de Playwright](https://playwright.dev)
- [Guía de Playwright Test](https://playwright.dev/docs/intro)

