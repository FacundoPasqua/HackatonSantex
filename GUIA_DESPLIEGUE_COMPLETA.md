# 🚀 Guía Completa de Despliegue - Backend y Frontend

Esta guía te ayudará a desplegar tanto el backend como el frontend de forma **gratuita** y accesible desde URLs públicas.

## 📋 Resumen de Opciones Gratuitas

- **Backend**: Railway o Render (ambos tienen planes gratuitos)
- **Frontend**: Vercel (gratis y muy fácil)
- **Base de Datos**: Firebase Firestore (gratis hasta cierto límite)

---

## 🔥 Paso 1: Configurar Firebase Firestore

El backend usa Firebase Firestore como base de datos. Necesitas configurarlo primero:

### 1.1 Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Add project"** o **"Crear proyecto"**
3. Ingresa un nombre (ej: `hackaton-test-results`)
4. Sigue los pasos para crear el proyecto
5. Una vez creado, haz clic en el proyecto

### 1.2 Habilitar Firestore

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Create database"** o **"Crear base de datos"**
3. Selecciona **"Start in test mode"** (para desarrollo)
4. Elige una ubicación (ej: `us-central`)
5. Haz clic en **"Enable"**

### 1.3 Obtener Credenciales

1. Ve a **"Project Settings"** (⚙️ en el menú lateral)
2. Ve a la pestaña **"Service accounts"**
3. Haz clic en **"Generate new private key"**
4. Se descargará un archivo JSON con las credenciales
5. **Guarda este archivo de forma segura** - lo necesitarás para el despliegue

---

## 🚂 Paso 2: Desplegar Backend en Railway (Gratis)

Railway ofrece un plan gratuito con $5 de crédito mensual, suficiente para proyectos pequeños.

### 2.1 Crear Cuenta en Railway

1. Ve a [Railway](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con GitHub (recomendado) o email

### 2.2 Conectar el Repositorio

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Autoriza Railway a acceder a tu repositorio
4. Selecciona tu repositorio `HackatonSantex`
5. Railway detectará automáticamente que es un proyecto Python

### 2.3 Configurar el Backend

1. Railway creará un servicio automáticamente
2. Haz clic en el servicio (probablemente llamado "HackatonSantex")
3. Ve a **"Settings"**
4. Busca **"Root Directory"** y cámbialo a: `backend`
5. Guarda los cambios

### 2.4 Configurar Variables de Entorno

1. En el servicio, ve a la pestaña **"Variables"**
2. Agrega las siguientes variables:

   **FIREBASE_CREDENTIALS** (Importante):
   - Abre el archivo JSON que descargaste de Firebase
   - Copia **todo el contenido** del JSON
   - Pega el contenido completo como valor de la variable
   - Ejemplo del formato:
     ```json
     {"type":"service_account","project_id":"tu-proyecto",...}
     ```

   **ALLOWED_ORIGINS**:
   - Valor: `*` (permite todos los orígenes, útil para desarrollo)
   - O específica: `https://tu-frontend.vercel.app,http://localhost:3000`

### 2.5 Generar Dominio Público

1. En el servicio, ve a **"Settings"**
2. Busca la sección **"Networking"** o **"Domains"**
3. Haz clic en **"Generate Domain"** o **"Add Domain"**
4. Railway generará una URL automáticamente (ej: `https://hackatonsantex-production.up.railway.app`)
5. **Copia esta URL** - la necesitarás para el frontend

### 2.6 Verificar el Despliegue

1. Espera a que el deployment termine (1-2 minutos)
2. Ve a la pestaña **"Deployments"** para ver el progreso
3. Una vez completado, abre la URL en tu navegador
4. Deberías ver un JSON con información de la API
5. Prueba también: `https://tu-url-railway.app/docs` (documentación Swagger)

---

## 🌐 Paso 3: Desplegar Frontend en Vercel (Gratis)

Vercel ofrece un plan gratuito generoso, perfecto para proyectos React.

### 3.1 Crear Cuenta en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Inicia sesión con GitHub (recomendado) o email

### 3.2 Importar el Proyecto

1. En Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio `HackatonSantex`
3. Vercel detectará automáticamente que es un proyecto Vite/React

### 3.3 Configurar el Frontend

1. En la configuración del proyecto, busca **"Root Directory"**
2. Cámbialo a: `frontend`
3. Verifica que:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `dist` (automático)
   - **Install Command**: `npm install` (automático)

### 3.4 Configurar Variables de Entorno

1. En la configuración, ve a **"Environment Variables"**
2. Agrega la siguiente variable:

   **VITE_API_URL**:
   - Valor: La URL de tu backend en Railway (ej: `https://hackatonsantex-production.up.railway.app`)
   - **IMPORTANTE**: No incluyas `/api` al final, solo la URL base
   - Asegúrate de que sea `https://` (no `http://`)

3. Haz clic en **"Add"** para cada variable

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
   - Valor: `https://tu-frontend.vercel.app,http://localhost:3000`
   - Reemplaza `tu-frontend.vercel.app` con tu URL real de Vercel
3. Railway redeployará automáticamente

---

## ✅ Verificación Final

### Backend
- ✅ URL funciona: `https://tu-backend.railway.app/`
- ✅ Documentación funciona: `https://tu-backend.railway.app/docs`
- ✅ Firebase conectado (verifica en los logs de Railway)

### Frontend
- ✅ URL funciona: `https://tu-frontend.vercel.app`
- ✅ Se conecta al backend (abre la consola del navegador)
- ✅ Muestra datos (si hay datos en Firebase)

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
    "environment": "test"
  }'
```

Luego verifica en:
- Firebase Console → Firestore Database → colección `test_results`
- Frontend en Vercel (debería aparecer el nuevo resultado)

---

## 🆘 Solución de Problemas

### Backend no inicia en Railway

1. Verifica que el **Root Directory** esté configurado como `backend`
2. Verifica que el **Procfile** exista en `backend/Procfile`
3. Revisa los logs en Railway → **"Deploy Logs"**
4. Verifica que `FIREBASE_CREDENTIALS` esté configurada correctamente

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

### Firebase no conecta

1. Verifica que `FIREBASE_CREDENTIALS` sea un JSON válido
2. Verifica que Firestore esté habilitado en Firebase Console
3. Verifica que el proyecto de Firebase sea el correcto
4. Revisa los logs de Railway para ver el error específico

---

## 📊 Estructura de URLs Final

Después del despliegue, tendrás:

- **Backend API**: `https://tu-backend.railway.app`
- **API Docs**: `https://tu-backend.railway.app/docs`
- **Frontend**: `https://tu-frontend.vercel.app`
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)

---

## 💰 Costos

- **Railway**: $5 de crédito gratis/mes (suficiente para proyectos pequeños)
- **Vercel**: Plan gratuito generoso (ilimitado para proyectos personales)
- **Firebase**: Plan Spark (gratis) con límites generosos

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
- [Documentación de Firebase](https://firebase.google.com/docs)
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Guía detallada de Firebase

---

¡Listo! Tu aplicación debería estar funcionando en producción. 🚀

