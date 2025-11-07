# 🔧 Solución: Los tests no guardan en la base de datos

## 🔍 Problemas comunes y soluciones

### 1. ❌ API_URL apunta a localhost

**Problema:** El archivo `config.env` tiene `API_URL=http://localhost:8000`, pero tu backend está en Railway.

**Solución:**
1. Obtén la URL de tu backend en Railway
2. Actualiza `config.env`:

```env
# Configuración del Bot
BOT_URL=https://preprod.rentascordoba.gob.ar/bot-web

# Configuración de la API - REEMPLAZA CON TU URL DE RAILWAY
API_URL=https://tu-backend.railway.app
```

### 2. ❌ CORS bloqueando las requests

**Problema:** El backend puede estar bloqueando requests desde tu máquina.

**Solución:** Ya actualicé el código para permitir todos los orígenes. Si tu backend ya está desplegado, necesitas:
1. Reiniciar el servicio backend en Railway
2. O agregar manualmente la variable `ALLOWED_ORIGINS=*` en Railway

### 3. ❌ Timeout muy corto

**Problema:** El timeout de 5 segundos puede ser muy corto.

**Solución:** Ya aumenté el timeout a 30 segundos en el código.

## ✅ Pasos para solucionar

### Paso 1: Obtener la URL de tu backend

1. Ve a Railway → Tu servicio Backend
2. Ve a "Settings" o "Deployments"
3. Copia la URL pública (ej: `https://tu-proyecto-production.up.railway.app`)

### Paso 2: Actualizar config.env

Edita el archivo `config.env` y cambia:

```env
API_URL=http://localhost:8000
```

Por:

```env
API_URL=https://tu-backend.railway.app
```

**⚠️ IMPORTANTE:** Reemplaza `https://tu-backend.railway.app` con la URL real de tu backend.

### Paso 3: Verificar CORS en Railway

1. Ve a tu servicio Backend en Railway
2. Ve a "Variables"
3. Verifica que `ALLOWED_ORIGINS` esté configurada como `*` o incluye tu IP/origen
4. Si no existe, agrega:
   - **Nombre:** `ALLOWED_ORIGINS`
   - **Valor:** `*`
5. Reinicia el servicio backend

### Paso 4: Probar la conexión

Ejecuta un test pequeño para verificar:

```bash
npm test -- tests/specs/automotor.playwright.spec.js --grep "primera pregunta"
```

### Paso 5: Revisar los logs

**En los logs de los tests, busca:**
- ✅ `💾 [TEST-001] Resultado guardado en BD: ID 123` → **Funciona!**
- ⚠️ `⚠️ [TEST-001] Error guardando en BD: 404` → URL incorrecta
- ⚠️ `⚠️ [TEST-001] No se pudo guardar en BD: Network error` → Problema de conexión/CORS
- ⚠️ `⚠️ [TEST-001] No se pudo guardar en BD: timeout` → Timeout muy corto (ya solucionado)

**En los logs del backend en Railway, busca:**
- ✅ `POST /api/results` con status 200 → **Funciona!**
- ❌ `POST /api/results` con status 422 → Error de validación
- ❌ `POST /api/results` con status 500 → Error del servidor

## 🧪 Test manual rápido

Puedes probar manualmente si la API funciona:

```bash
# Reemplaza con tu URL real
curl -X POST https://tu-backend.railway.app/api/results \
  -H "Content-Type: application/json" \
  -d '{
    "test_id": "TEST-001",
    "categoria": "Prueba",
    "pregunta": "¿Esto funciona?",
    "palabras_clave": "test",
    "respuesta_bot": "Sí",
    "validacion_correcta": true,
    "palabras_encontradas": "test",
    "resultado_final": "PASS",
    "tiempo_segundos": 1.5,
    "test_type": "automotor",
    "environment": "test"
  }'
```

Si esto funciona, deberías recibir un JSON con el ID del registro creado.

## 📋 Checklist de verificación

- [ ] `config.env` tiene la URL correcta de Railway (no localhost)
- [ ] El backend está desplegado y funcionando en Railway
- [ ] `ALLOWED_ORIGINS=*` está configurado en Railway (o el backend permite todos los orígenes)
- [ ] La base de datos PostgreSQL está conectada al backend
- [ ] Las tablas están creadas (ver mensaje `✅ Database tables created successfully` en logs)
- [ ] Puedes acceder a `https://tu-backend.railway.app/docs` desde tu navegador
- [ ] Los tests muestran mensajes de conexión en la consola

## 🆘 Si aún no funciona

1. **Revisa los logs del backend en Railway** - busca errores al recibir requests
2. **Revisa los logs de los tests** - busca mensajes de error específicos
3. **Prueba la API manualmente** con curl o Postman
4. **Verifica que el backend esté accesible** desde tu navegador


