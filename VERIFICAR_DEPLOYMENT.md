# ✅ Verificar Deployment en Railway

## 📋 Pasos para verificar que el backend está funcionando

### 1. Verificar el Deployment en Railway

1. Ve a [Railway](https://railway.app)
2. Abre tu proyecto **HackatonSantex**
3. Haz clic en tu servicio **Backend**
4. Ve a la pestaña **"Deployments"** o **"Deploy Logs"**
5. Deberías ver un deployment reciente con el commit `cb7140d`
6. Espera a que el estado sea **"Active"** (puede tardar 1-2 minutos)

### 2. Revisar los Logs del Deployment

En **"Deploy Logs"**, busca estos mensajes:

**✅ Si ves esto, está bien:**
```
✅ Database tables created successfully
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8080
```

**❌ Si ves errores:**
- Copia el mensaje de error completo
- Compártelo para diagnosticar

### 3. Probar la API

**Opción A: Desde el navegador**
1. Abre: `https://hackatonsantex-production.up.railway.app/`
2. Deberías ver un JSON con información de la API
3. Prueba también: `https://hackatonsantex-production.up.railway.app/docs`
4. Deberías ver la documentación de Swagger

**Opción B: Desde la terminal**
```bash
node test-api-simple.js
```

**Opción C: Script de espera automática**
```bash
node esperar-y-probar.js
```
Este script espera 30 segundos y luego prueba la conexión.

### 4. Verificar los Logs de Requests

1. En Railway → Backend → **"HTTP Logs"**
2. Haz una request (abre la URL en el navegador)
3. Deberías ver en los logs:
   - `📥 GET /`
   - `✅ GET / - Status: 200`

Si ves estos mensajes, el logging está funcionando correctamente.

### 5. Probar Guardar un Resultado

Ejecuta:
```bash
node test-api-simple.js
```

Deberías ver:
- `✅ GET / funciona!`
- `✅ POST /api/results funciona!`
- `📝 ID creado: [número]`

### 6. Verificar en la Base de Datos

1. Ve a Railway → **PostgreSQL** → **"Database"** → **"Data"**
2. Selecciona la tabla **`test_results`**
3. Deberías ver los registros que se hayan guardado

## 🔍 Diagnóstico de Problemas

### Si sigue dando 502

1. **Revisa los Deploy Logs** - ¿Hay errores al iniciar?
2. **Revisa los HTTP Logs** - ¿Las requests están llegando?
3. **Verifica las Variables de Entorno**:
   - `DATABASE_URL` debe ser `${{ Postgres.DATABASE_URL }}`
   - `ALLOWED_ORIGINS` puede ser `*` (opcional)

### Si ves errores en los logs

Los nuevos logs mostrarán:
- `📥 [METHOD] [PATH]` - Cuando llega una request
- `✅ [METHOD] [PATH] - Status: [CODE]` - Si funciona
- `❌ Error en [METHOD] [PATH]: [ERROR]` - Si hay un error (con traceback completo)

Comparte el error específico para diagnosticar.

### Si el deployment no aparece

1. Verifica que el push a GitHub fue exitoso
2. Verifica que Railway está conectado a tu repositorio
3. Intenta hacer un **"Redeploy"** manual en Railway

## ✅ Checklist Final

- [ ] El deployment está en estado "Active"
- [ ] Los logs muestran "Application startup complete"
- [ ] Puedo acceder a `/` en el navegador
- [ ] Puedo acceder a `/docs` en el navegador
- [ ] `test-api-simple.js` funciona correctamente
- [ ] Los logs muestran `📥` y `✅` cuando hago requests
- [ ] Puedo guardar resultados en la base de datos

## 🎉 Una vez que todo funcione

1. **Ejecuta los tests:**
   ```bash
   npm test
   ```

2. **Verifica que se guardan:**
   - Los tests mostrarán: `💾 [TEST-001] Resultado guardado en BD: ID 123`
   - En Railway → PostgreSQL → Database → Data verás los registros

3. **Revisa el dashboard:**
   - Si tienes el frontend desplegado, deberías ver los resultados allí también

