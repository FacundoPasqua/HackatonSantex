# Solución: Tests en Loop y API_URL no configurada

## 🔍 El Problema

1. **Tests se quedan en loop** en la primera pregunta, generando muchos requests
2. **API_URL no configurada**: Los tests usan `http://localhost:8000` en lugar de la URL de Railway
3. Los resultados no se guardan en la base de datos

## ✅ Solución Aplicada

### 1. Pasar API_URL como Variable de Entorno

He modificado `backend/app/test_executor.py` para:
- Obtener `API_URL` desde las variables de entorno de Railway
- Si no existe, construirla desde `RAILWAY_PUBLIC_DOMAIN`
- Pasar `API_URL` y `BOT_URL` como variables de entorno a los tests cuando se ejecutan

### 2. Configurar API_URL en Railway

**IMPORTANTE:** Necesitas agregar la variable `API_URL` en Railway:

1. **Railway Dashboard** → Tu servicio "HackatonSantex" → **Settings** → **Variables**

2. **Agrega:**
   - **Name:** `API_URL`
   - **Value:** `https://hackatonsantex-production-d1dc.up.railway.app`
   - Guarda

3. **Opcional - También agrega BOT_URL:**
   - **Name:** `BOT_URL`
   - **Value:** `https://preprod.rentascordoba.gob.ar/bot-web`
   - Guarda

### 3. Verificar que los Tests Usen la Variable

Los tests ahora deberían:
- Recibir `API_URL` como variable de entorno
- Usarla en lugar de intentar cargar desde `config.env`
- Guardar resultados correctamente en la base de datos

## 🔧 Verificación

### 1. Verificar en Logs de Railway

Después de hacer deploy, en los **Deploy Logs** deberías ver:
```
[INFO] API_URL para tests: https://hackatonsantex-production-d1dc.up.railway.app
```

### 2. Verificar en Logs de Tests

Cuando ejecutes un test, en los logs deberías ver:
```
🔍 [api_client] API_URL configurada: https://hackatonsantex-production-d1dc.up.railway.app
```

En lugar de:
```
⚠️ [api_client] API_URL no configurada, usando default: http://localhost:8000
```

### 3. Verificar que los Resultados se Guarden

Después de ejecutar un test:
- Los resultados deberían aparecer en el dashboard
- No deberían quedarse en loop
- Cada pregunta debería ejecutarse una sola vez

## 🚨 Si Aún Hay Loop

Si los tests siguen en loop después de configurar `API_URL`:

1. **Verifica que `API_URL` esté configurada correctamente:**
   - Railway → Variables → Debe ser `https://hackatonsantex-production-d1dc.up.railway.app` (sin `/` al final)

2. **Verifica los logs del test:**
   - Busca errores de conexión o timeout
   - Verifica que los requests a la API estén llegando

3. **Verifica que el backend esté respondiendo:**
   - Abre: `https://hackatonsantex-production-d1dc.up.railway.app/api/results`
   - Deberías ver un JSON (puede ser un error de método, pero debe responder)

4. **Revisa el timeout en `api_client.js`:**
   - Actualmente es 30 segundos para requests individuales
   - Si el backend tarda mucho, puede causar timeouts y retries

## 📝 Checklist

- [ ] `API_URL` configurada en Railway con la URL correcta
- [ ] `BOT_URL` configurada en Railway (opcional pero recomendado)
- [ ] Backend redeployado después de agregar variables
- [ ] Logs muestran `[INFO] API_URL para tests: https://...`
- [ ] Tests muestran `🔍 [api_client] API_URL configurada: https://...`
- [ ] Los resultados se guardan en la base de datos
- [ ] Los tests no se quedan en loop

