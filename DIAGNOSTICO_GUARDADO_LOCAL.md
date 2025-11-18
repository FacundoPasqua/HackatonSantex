# Diagnóstico: Tests Locales No Guardan en Base de Producción

## Problema
Cuando ejecutas los tests localmente, las preguntas no se están guardando en la base de datos de producción.

## Configuración Actual

### Tests (Playwright)
- Los tests leen `API_URL` desde `config.env`
- `config.env` tiene: `API_URL=https://hackatonsantex-production-d1dc.up.railway.app`
- Los tests envían datos a: `${API_URL}/api/results`

### Backend Local
- El backend local usa `DATABASE_URL` de `backend/.env`
- Si no hay `DATABASE_URL`, usa SQLite local
- **Problema**: El backend local no está configurado para usar la base de producción

## Soluciones

### Opción 1: Usar Backend de Railway (Recomendado)
Los tests ya están configurados para enviar datos al backend de Railway. Esto debería funcionar si:
1. El backend de Railway está funcionando
2. CORS está configurado correctamente en Railway
3. La base de datos de Railway está conectada

**Verificar:**
- Revisa los logs del backend de Railway cuando ejecutas los tests
- Verifica que las requests lleguen al backend
- Revisa si hay errores de CORS o conexión

### Opción 2: Usar Backend Local con Base de Producción
Si prefieres usar el backend local pero guardar en la base de producción:

1. **Configura `backend/.env` con DATABASE_URL de producción:**
   ```env
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```
   (Usa la URL pública, no la interna)

2. **Cambia `config.env` para usar backend local:**
   ```env
   API_URL=http://localhost:8000
   ```

3. **Inicia el backend local:**
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1
   python -m uvicorn app.main:app --reload
   ```

4. **Ejecuta los tests:**
   ```bash
   npm test
   ```

## Debugging

### Verificar qué está pasando:

1. **Revisa los logs de los tests:**
   - Busca mensajes como `🔗 Intentando guardar en:`
   - Busca errores como `❌ Error guardando en BD:`
   - Verifica que `API_URL` esté configurada correctamente

2. **Revisa los logs del backend (Railway o local):**
   - Busca requests a `/api/results`
   - Verifica si hay errores de base de datos
   - Revisa si las requests están llegando

3. **Verifica CORS:**
   - Si hay errores de CORS, agrega `http://localhost:3000` (o el puerto que uses) a `ALLOWED_ORIGINS` en Railway

### Logs Mejorados

He agregado más logging en `utils/api_client.js` para ver:
- El payload completo que se envía
- El status de la respuesta
- Errores detallados si falla

## Próximos Pasos

1. Ejecuta los tests y revisa los logs
2. Verifica qué `API_URL` están usando los tests
3. Revisa si las requests llegan al backend
4. Si usas backend local, asegúrate de tener `DATABASE_URL` configurada

