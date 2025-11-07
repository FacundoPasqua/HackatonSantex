# 🧪 Configurar Tests para Guardar en Base de Datos

Los tests de Playwright **ya están configurados** para guardar automáticamente los resultados en tu base de datos. Solo necesitas configurar la URL de tu backend.

## ✅ Lo que ya está hecho

- ✅ Los tests llaman automáticamente a `guardarResultadoEnBD()` después de cada pregunta
- ✅ El código está listo para conectarse a tu API
- ✅ Los resultados se guardan en la tabla `test_results` de PostgreSQL

## 🔧 Configuración necesaria

### Opción 1: Actualizar `config.env` (Recomendado para desarrollo)

1. Abre el archivo `config.env` en la raíz del proyecto
2. Actualiza la línea `API_URL` con la URL de tu backend en Railway:

```env
# Configuración del Bot
BOT_URL=https://test.rentascordoba.gob.ar/bot-web

# Configuración de la API
API_URL=https://tu-backend.railway.app
```

**Reemplaza `https://tu-backend.railway.app` con la URL real de tu backend en Railway.**

### Opción 2: Variable de entorno al ejecutar (Recomendado para CI/CD)

Puedes configurar la variable de entorno directamente al ejecutar los tests:

**Windows (PowerShell):**
```powershell
$env:API_URL="https://tu-backend.railway.app"; npm test
```

**Windows (CMD):**
```cmd
set API_URL=https://tu-backend.railway.app && npm test
```

**Linux/Mac:**
```bash
API_URL=https://tu-backend.railway.app npm test
```

## 🚀 Cómo obtener la URL de tu backend

1. Ve a tu proyecto en [Railway](https://railway.app)
2. Haz clic en tu servicio **Backend** (FastAPI)
3. Ve a la pestaña **"Settings"** o **"Deployments"**
4. Busca la sección **"Domains"** o **"Public URL"**
5. Copia la URL (algo como: `https://tu-proyecto-production.up.railway.app`)

## ✅ Verificar que funciona

1. Ejecuta un test:
   ```bash
   npm test -- tests/specs/automotor.playwright.spec.js
   ```

2. Revisa la consola - deberías ver mensajes como:
   ```
   💾 [TEST-001] Resultado guardado en BD: ID 123
   ```

3. Verifica en Railway:
   - Ve a tu servicio PostgreSQL → **"Database"** → **"Data"**
   - Deberías ver registros en la tabla `test_results`

4. O verifica en la API:
   - Ve a `https://tu-backend.railway.app/docs`
   - Prueba el endpoint `GET /api/results`
   - Deberías ver los resultados de tus tests

## 🔍 Solución de problemas

### Los tests no guardan en la BD

**Verifica:**
1. ✅ La URL del backend es correcta (debe ser `https://...`, no `http://localhost`)
2. ✅ El backend está desplegado y funcionando
3. ✅ La variable `API_URL` está configurada correctamente
4. ✅ Revisa los logs de los tests - busca mensajes de error

### Error: "Failed to fetch" o "Network error"

- Verifica que la URL del backend sea accesible desde tu máquina
- Asegúrate de que el backend tenga CORS configurado para permitir requests desde tu IP
- Revisa que el backend esté activo en Railway

### Los resultados no aparecen en la BD

1. Revisa los logs del backend en Railway
2. Verifica que las tablas estén creadas (deberías ver `✅ Database tables created successfully`)
3. Revisa los logs de los tests para ver si hay errores al guardar

## 📝 Notas importantes

- **Los tests guardan automáticamente** después de cada pregunta procesada
- **No necesitas cambiar el código** de los tests - ya está todo configurado
- **Puedes ejecutar los tests localmente** y guardarán en tu base de datos en Railway
- **Los resultados incluyen**: pregunta, respuesta, validación, tiempo, tipo de test, entorno, etc.


