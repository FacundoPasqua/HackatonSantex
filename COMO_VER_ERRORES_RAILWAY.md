# Cómo Ver los Errores Reales en Railway

## 🔍 El Problema

Los **HTTP Logs** solo muestran las peticiones HTTP (GET, POST, etc.) que llegan al backend. **NO muestran los errores internos** cuando el backend intenta ejecutar los tests de Playwright.

## 📋 Pasos para Ver los Errores Reales

### Paso 1: Ir a "Deploy Logs" o "Logs"

En Railway Dashboard:

1. **Ve a tu servicio "HackatonSantex"**
2. **Haz click en la pestaña "Deploy Logs"** (no "HTTP Logs")
   - O busca la pestaña "Logs" si está disponible
   - O "Build Logs" si quieres ver el proceso de build

### Paso 2: Buscar Errores de Tests

En los logs, busca estos mensajes:

**Errores comunes:**
- `[ERROR] Error ejecutando test`
- `npm no encontrado`
- `FileNotFoundError`
- `Cannot find module '@playwright/test'`
- `sh: npm: command not found`
- `Traceback (most recent call last):`

**Mensajes de éxito (si funciona):**
- `[INFO] npm encontrado en: /usr/bin/npm`
- `[INFO] Ejecutando desde: /app`
- `[INFO] Test embarcaciones_XXXXX creado y guardado en BD`

### Paso 3: Ejecutar un Test para Generar Logs

1. **Abre tu frontend** (Vercel)
2. **Ejecuta un test** (por ejemplo, "Embarcaciones")
3. **Inmediatamente ve a Railway → Deploy Logs**
4. **Busca los mensajes** que aparecen cuando se ejecuta el test

## 🎯 Qué Buscar Específicamente

Cuando ejecutas un test desde el frontend, deberías ver en los logs:

```
[REQUEST] POST /api/tests/run - test_type: embarcaciones
[INFO] Test embarcaciones_20251118_XXXXX creado y guardado en BD
[INFO] Thread iniciado para test embarcaciones_20251118_XXXXX
[INFO] Iniciando test embarcaciones_20251118_XXXXX: tests/specs/embarcaciones.playwright.spec.js
[INFO] Estado actualizado a 'running' para embarcaciones_20251118_XXXXX
[INFO] Ejecutando desde: /app
[INFO] npm encontrado en: /usr/bin/npm  ← ESTO DEBERÍA APARECER
[INFO] Ejecutando: /usr/bin/npm test -- tests/specs/embarcaciones.playwright.spec.js --project=chromium
```

**Si ves un error aquí, ese es el problema real.**

## 🐛 Errores Más Comunes

### Error 1: "npm no encontrado"
```
[ERROR] Error ejecutando test embarcaciones_XXXXX: npm no encontrado. Asegúrate de que Node.js esté instalado y en el PATH.
```

**Solución:** Necesitas el Dockerfile que creamos. Haz commit y push:
```bash
git add Dockerfile .dockerignore package.json
git commit -m "fix: Agregar Dockerfile con Node.js"
git push origin main
```

### Error 2: "Cannot find module '@playwright/test'"
```
Error: Cannot find module '@playwright/test'
```

**Solución:** El Dockerfile instala las dependencias, pero verifica que `package.json` tenga `@playwright/test` en `dependencies`.

### Error 3: "FileNotFoundError: tests/specs/..."
```
FileNotFoundError: [Errno 2] No such file or directory: 'tests/specs/embarcaciones.playwright.spec.js'
```

**Solución:** Los archivos de tests no están en el repositorio. Verifica:
```bash
git ls-files tests/specs/
```

Si no aparecen, agrégalos:
```bash
git add tests/specs/
git commit -m "fix: Agregar archivos de tests"
git push
```

### Error 4: "Working directory not found"
```
[WARNING] No se encontró package.json, usando: /app
```

**Solución:** El Dockerfile copia todo el código, pero verifica que `package.json` esté en la raíz del proyecto.

## 📸 Cómo Compartir los Logs

Si necesitas ayuda:

1. **Ejecuta un test** desde el frontend
2. **Ve a Railway → Deploy Logs**
3. **Copia los últimos 50-100 líneas** de los logs
4. **Especialmente busca:**
   - Líneas que empiezan con `[ERROR]`
   - Tracebacks de Python
   - Mensajes de npm/node

## ✅ Checklist de Verificación

- [ ] Ve a "Deploy Logs" (no "HTTP Logs")
- [ ] Ejecuta un test desde el frontend
- [ ] Busca mensajes que empiecen con `[INFO]` o `[ERROR]`
- [ ] Verifica si aparece `npm encontrado`
- [ ] Verifica si aparece algún error de ejecución
- [ ] Si hay errores, cópialos y compártelos

## 🚀 Próximos Pasos

Una vez que veas los errores reales en "Deploy Logs":

1. **Identifica el error específico**
2. **Aplica la solución correspondiente** (probablemente necesites el Dockerfile)
3. **Haz commit y push**
4. **Espera el redeploy en Railway**
5. **Vuelve a probar**

