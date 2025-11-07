# 🔥 Configuración de Firebase Firestore

## ✅ Ventajas de Firebase

- ✅ **No requiere configuración de base de datos separada** - Todo está en Firebase
- ✅ **Más fácil de desplegar** - Solo necesitas las credenciales
- ✅ **Escalable automáticamente** - Firebase maneja todo
- ✅ **Gratis hasta cierto límite** - Perfecto para proyectos pequeños/medianos

## 📋 Pasos para Configurar Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Add project"** o **"Crear proyecto"**
3. Ingresa un nombre (ej: `hackaton-test-results`)
4. Sigue los pasos para crear el proyecto
5. Una vez creado, haz clic en el proyecto

### Paso 2: Habilitar Firestore

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Create database"** o **"Crear base de datos"**
3. Selecciona **"Start in test mode"** (para desarrollo)
4. Elige una ubicación (ej: `us-central`)
5. Haz clic en **"Enable"**

### Paso 3: Obtener Credenciales

1. Ve a **"Project Settings"** (⚙️ en el menú lateral)
2. Ve a la pestaña **"Service accounts"**
3. Haz clic en **"Generate new private key"**
4. Se descargará un archivo JSON con las credenciales
5. **Guarda este archivo de forma segura** - contiene las credenciales de administrador

### Paso 4: Configurar en Railway

Tienes **dos opciones**:

#### Opción A: Variable de Entorno (Recomendado para Railway)

1. Abre el archivo JSON que descargaste
2. Copia **todo el contenido** del JSON
3. Ve a Railway → Tu servicio Backend → **"Variables"**
4. Agrega una nueva variable:
   - **Nombre**: `FIREBASE_CREDENTIALS`
   - **Valor**: Pega el contenido completo del JSON (como string)
5. Guarda los cambios

#### Opción B: Archivo de Credenciales (Para desarrollo local)

1. Copia el archivo JSON descargado a `backend/firebase-credentials.json`
2. **IMPORTANTE**: Agrega `firebase-credentials.json` a `.gitignore` para no subirlo a GitHub
3. El código lo detectará automáticamente

### Paso 5: Configurar .gitignore

Asegúrate de que `backend/.gitignore` incluya:

```
firebase-credentials.json
*.json
!package.json
__pycache__/
*.pyc
venv/
.env
```

## 🚀 Deployment

Una vez configurado:

1. **Railway detectará automáticamente** que es Python
2. **Instalará las dependencias** de `requirements.txt`
3. **Usará el Procfile** para iniciar el servidor
4. **Leerá las credenciales** desde la variable de entorno `FIREBASE_CREDENTIALS`

## ✅ Verificar que Funciona

### 1. Probar Localmente (Opcional)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Coloca firebase-credentials.json en backend/
uvicorn app.main:app --reload
```

### 2. Probar en Railway

1. Despliega en Railway
2. Ve a `https://tu-backend.railway.app/`
3. Deberías ver: `"database": "Firebase Firestore"` y `"db_status": "connected"`

### 3. Probar Guardar un Resultado

```bash
curl -X POST https://tu-backend.railway.app/api/results \
  -H "Content-Type: application/json" \
  -d '{
    "test_id": "TEST-001",
    "categoria": "Prueba",
    "pregunta": "¿Funciona Firebase?",
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

### 4. Verificar en Firebase Console

1. Ve a Firebase Console → Firestore Database
2. Deberías ver la colección `test_results`
3. Deberías ver los documentos guardados

## 🔒 Seguridad

### Reglas de Firestore (Importante)

Por defecto, Firestore está en "test mode" que permite lectura/escritura a cualquiera. Para producción:

1. Ve a Firestore Database → **"Rules"**
2. Actualiza las reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir solo lectura/escritura desde el servidor (con credenciales de admin)
    match /{document=**} {
      allow read, write: if false; // Solo desde el servidor con credenciales de admin
    }
  }
}
```

**Nota**: Como estás usando Firebase Admin SDK en el servidor, las reglas no se aplican (el Admin SDK tiene acceso completo). Las reglas son para clientes directos.

## 📊 Estructura de Datos en Firestore

Los datos se guardan en la colección `test_results` con esta estructura:

```json
{
  "id": "document-id-auto-generado",
  "test_id": "TEST-001",
  "categoria": "Automotor",
  "pregunta": "...",
  "palabras_clave": "...",
  "respuesta_bot": "...",
  "validacion_correcta": true,
  "palabras_encontradas": "...",
  "resultado_final": "PASS",
  "tiempo_segundos": 1.5,
  "timestamp": "2025-11-07T...",
  "error": null,
  "test_type": "automotor",
  "environment": "test",
  "sheet_name": "..."
}
```

## 🆘 Solución de Problemas

### Error: "Firebase credentials not found"

- Verifica que `FIREBASE_CREDENTIALS` esté configurada en Railway
- O que `firebase-credentials.json` exista en `backend/`
- Verifica que el JSON sea válido

### Error: "Permission denied"

- Verifica que las credenciales sean correctas
- Verifica que Firestore esté habilitado en el proyecto
- Verifica que el proyecto de Firebase sea el correcto

### Los datos no aparecen en Firebase Console

- Espera unos segundos (Firestore puede tener latencia)
- Verifica que estés viendo el proyecto correcto
- Verifica que la colección se llame `test_results`

## 💡 Próximos Pasos

Una vez configurado Firebase:

1. ✅ Los tests podrán guardar datos automáticamente
2. ✅ Podrás ver los datos en Firebase Console
3. ✅ No necesitas configurar PostgreSQL en Railway
4. ✅ El deployment será más simple

## 📚 Recursos

- [Documentación de Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Precios de Firebase](https://firebase.google.com/pricing)

