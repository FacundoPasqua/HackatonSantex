# 🚀 Guía de Despliegue Paso a Paso - Backend y Frontend

Esta guía te llevará paso a paso para desplegar tu proyecto completo en producción de forma **gratuita**.

---

## 📋 Resumen

- **Backend**: Railway (PostgreSQL incluido gratis)
- **Frontend**: Vercel (gratis)
- **Tiempo estimado**: 30-45 minutos
- **Costo**: $0/mes

---

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Verificar que todo esté en GitHub

```bash
# Verificar estado
git status

# Si hay cambios sin commitear
git add .
git commit -m "Migración a PostgreSQL completada"
git push origin main
```

### 1.2 Verificar estructura del proyecto

Asegúrate de que tu repositorio tenga esta estructura:
```
HackatonSantex/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── db_models.py
│   │   └── schemas.py
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vercel.json
└── README.md
```

---

## 🚂 Paso 2: Desplegar Backend en Railway

### 2.1 Crear cuenta en Railway

1. Ve a [Railway](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con **GitHub** (recomendado)
4. Autoriza Railway a acceder a tus repositorios

### 2.2 Crear nuevo proyecto

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio `HackatonSantex`
4. Railway detectará automáticamente que es Python

### 2.3 Configurar el Backend

1. Railway creará un servicio automáticamente
2. Haz clic en el servicio (probablemente llamado "HackatonSantex")
3. Ve a **"Settings"**
4. Busca **"Root Directory"** y cámbialo a: `backend`
5. Guarda los cambios

### 2.4 Agregar PostgreSQL

1. En tu proyecto de Railway, haz clic en **"New"**
2. Selecciona **"Database"**
3. Selecciona **"Add PostgreSQL"**
4. Railway creará automáticamente una base de datos PostgreSQL
5. **IMPORTANTE**: Railway configurará automáticamente la variable `DATABASE_URL`
   - No necesitas hacer nada, Railway lo hace automáticamente
   - La variable aparecerá en las Variables del servicio Backend

### 2.5 Verificar Variables de Entorno

1. Ve a tu servicio Backend → **"Variables"**
2. Deberías ver automáticamente:
   - `DATABASE_URL` (configurada automáticamente por Railway)
3. Agrega si no existe:
   - **ALLOWED_ORIGINS**: `*` (permite todos los orígenes)
   - O específica: `https://tu-frontend.vercel.app,http://localhost:3000`

### 2.6 Generar Dominio Público

1. En el servicio Backend, ve a **"Settings"**
2. Busca la sección **"Networking"** o **"Domains"**
3. Haz clic en **"Generate Domain"** o **"Add Domain"**
4. Railway generará una URL automáticamente (ej: `https://hackatonsantex-production.up.railway.app`)
5. **Copia esta URL** - la necesitarás para el frontend

### 2.7 Verificar el Despliegue

1. Espera a que el deployment termine (1-2 minutos)
2. Ve a la pestaña **"Deployments"** para ver el progreso
3. Una vez completado, abre la URL en tu navegador
4. Deberías ver un JSON con:
   ```json
   {
     "message": "Test Results API",
     "database": "PostgreSQL",
     "db_status": "connected"
   }
   ```
5. Prueba también: `https://tu-url-railway.app/docs` (documentación Swagger)

### 2.8 Verificar Logs

1. Ve a **"Deploy Logs"** en Railway
2. Deberías ver:
   ```
   [OK] Database tables created successfully
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8080
   ```

---

## 🌐 Paso 3: Desplegar Frontend en Vercel

### 3.1 Crear cuenta en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Inicia sesión con **GitHub** (recomendado)
4. Autoriza Vercel a acceder a tus repositorios

### 3.2 Importar el Proyecto

1. En Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca y selecciona tu repositorio `HackatonSantex`
3. Vercel detectará automáticamente que es un proyecto Vite/React

### 3.3 Configurar el Frontend

1. En la configuración del proyecto, busca **"Root Directory"**
2. Cámbialo a: `frontend`
3. Verifica que:
   - **Framework Preset**: Vite (automático)
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `dist` (automático)
   - **Install Command**: `npm install` (automático)

### 3.4 Configurar Variables de Entorno

1. En la configuración, ve a **"Environment Variables"**
2. Haz clic en **"Add New"**
3. Agrega la siguiente variable:

   **Nombre**: `VITE_API_URL`
   
   **Valor**: La URL de tu backend en Railway
   
   Ejemplo: `https://hackatonsantex-production.up.railway.app`
   
   **IMPORTANTE**: 
   - No incluyas `/api` al final
   - Debe ser `https://` (no `http://`)
   - Usa la URL que copiaste del paso 2.6

4. Haz clic en **"Add"**

### 3.5 Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que el deployment termine (1-2 minutos)
3. Vercel te dará una URL automáticamente (ej: `https://hackatonsantex.vercel.app`)
4. **Copia esta URL**

### 3.6 Verificar el Despliegue

1. Abre la URL de Vercel en tu navegador
2. Deberías ver el dashboard de resultados de tests
3. Si no carga datos, verifica:
   - Que la variable `VITE_API_URL` esté configurada correctamente
   - Que el backend esté funcionando (prueba `/docs` en Railway)
   - Abre la consola del navegador (F12) para ver errores

---

## 🔄 Paso 4: Actualizar CORS en el Backend

Para que el frontend pueda comunicarse con el backend:

1. Ve a Railway → Tu servicio Backend → **"Variables"**
2. Actualiza la variable **ALLOWED_ORIGINS**:
   - **Valor**: `https://tu-frontend.vercel.app,http://localhost:3000`
   - Reemplaza `tu-frontend.vercel.app` con tu URL real de Vercel
3. Railway redeployará automáticamente (espera 1-2 minutos)

---

## ✅ Paso 5: Verificación Final

### Backend
- ✅ URL funciona: `https://tu-backend.railway.app/`
- ✅ Documentación funciona: `https://tu-backend.railway.app/docs`
- ✅ PostgreSQL conectado (verifica en los logs: `db_status: "connected"`)

### Frontend
- ✅ URL funciona: `https://tu-frontend.vercel.app`
- ✅ Se conecta al backend (abre la consola del navegador)
- ✅ Muestra datos (si hay datos en la BD)

### Probar Guardar un Resultado

Puedes probar guardar un resultado desde la terminal:

```bash
curl -X POST https://tu-backend.railway.app/api/results \
  -H "Content-Type: application/json" \
  -d '{
    "test_id": "TEST-001",
    "categoria": "Prueba",
    "pregunta": "¿Funciona el deployment?",
    "palabras_clave": "test",
    "respuesta_bot": "Sí",
    "validacion_correcta": true,
    "palabras_encontradas": "test",
    "resultado_final": "PASS",
    "tiempo_segundos": 1.5,
    "test_type": "automotor",
    "environment": "preprod"
  }'
```

Luego verifica en:
- Frontend en Vercel (debería aparecer el nuevo resultado)
- Backend: `https://tu-backend.railway.app/api/results`

---

## 🆘 Solución de Problemas

### Backend no inicia en Railway

1. Verifica que el **Root Directory** esté configurado como `backend`
2. Verifica que el **Procfile** exista en `backend/Procfile`
3. Revisa los logs en Railway → **"Deploy Logs"**
4. Verifica que `DATABASE_URL` esté configurada (Railway la configura automáticamente)

### Frontend no se conecta al backend

1. Verifica que `VITE_API_URL` esté configurada en Vercel
2. Verifica que la URL sea correcta (sin `/api` al final)
3. Verifica que `ALLOWED_ORIGINS` en Railway incluya la URL de Vercel
4. Abre la consola del navegador (F12) para ver errores específicos

### Error 502 en Railway

1. Verifica que el Root Directory sea `backend`
2. Verifica que el Procfile esté correcto
3. Revisa los logs para ver el error específico
4. Verifica que todas las dependencias estén en `requirements.txt`

### PostgreSQL no conecta

1. Verifica que PostgreSQL esté agregado al proyecto en Railway
2. Verifica que `DATABASE_URL` esté configurada (debería estar automáticamente)
3. Revisa los logs de Railway para ver el error específico
4. Verifica que las tablas se hayan creado (deberías ver en los logs: "Database tables created successfully")

### Los datos no aparecen en el frontend

1. Verifica que el backend esté funcionando
2. Verifica que haya datos en la BD (prueba `/api/results` en el backend)
3. Verifica que `VITE_API_URL` esté correcta
4. Abre la consola del navegador para ver errores

---

## 📊 Estructura de URLs Final

Después del despliegue, tendrás:

- **Backend API**: `https://tu-backend.railway.app`
- **API Docs**: `https://tu-backend.railway.app/docs`
- **Frontend**: `https://tu-frontend.vercel.app`
- **PostgreSQL**: Gestionado automáticamente por Railway

---

## 💰 Costos

- **Railway**: $5 de crédito gratis/mes (suficiente para PostgreSQL y backend)
- **Vercel**: Plan gratuito generoso (ilimitado para proyectos personales)
- **PostgreSQL**: Incluido gratis en Railway

**Total: $0/mes** para proyectos pequeños/medianos 🎉

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas un push a GitHub:

- **Railway**: Desplegará automáticamente el backend
- **Vercel**: Desplegará automáticamente el frontend

No necesitas hacer nada manual, solo hacer commit y push.

---

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)

---

## ✅ Checklist de Despliegue

- [ ] Repositorio en GitHub
- [ ] Cuenta en Railway creada
- [ ] Backend desplegado en Railway
- [ ] PostgreSQL agregado en Railway
- [ ] Root Directory configurado como `backend`
- [ ] Dominio público generado en Railway
- [ ] Cuenta en Vercel creada
- [ ] Frontend desplegado en Vercel
- [ ] Root Directory configurado como `frontend`
- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Variable `ALLOWED_ORIGINS` configurada en Railway
- [ ] Backend funciona (prueba `/docs`)
- [ ] Frontend funciona y muestra datos
- [ ] Tests guardan resultados correctamente

---

¡Listo! Tu aplicación debería estar funcionando en producción. 🚀

Si tienes algún problema durante el despliegue, avísame y te ayudo a resolverlo.

