# 🔗 Cómo obtener la URL de tu backend en Railway

## 📍 Método 1: Desde el servicio Backend (Más fácil)

1. Ve a [Railway](https://railway.app) y abre tu proyecto
2. Haz clic en tu servicio **Backend** (el que tiene tu aplicación FastAPI)
3. Ve a la pestaña **"Settings"** o **"Deployments"**
4. Busca la sección **"Domains"** o **"Public URL"**
5. Verás algo como:
   ```
   https://tu-proyecto-production.up.railway.app
   ```
6. **Copia esa URL completa**

## 📍 Método 2: Desde el deployment más reciente

1. Ve a tu servicio Backend en Railway
2. Ve a la pestaña **"Deployments"**
3. Haz clic en el deployment más reciente
4. Busca la sección **"Public URL"** o **"Domain"**
5. Copia la URL

## 📍 Método 3: Si no tienes dominio público

Si no ves una URL pública, necesitas generar un dominio:

1. Ve a tu servicio Backend → **"Settings"**
2. Busca la sección **"Networking"** o **"Domains"**
3. Haz clic en **"Generate Domain"** o **"Add Domain"**
4. Railway generará una URL automáticamente
5. Copia esa URL

## ✅ Una vez que tengas la URL

1. Abre el archivo `config.env`
2. Reemplaza esta línea:
   ```env
   API_URL=https://tu-backend.railway.app
   ```
   
   Por tu URL real:
   ```env
   API_URL=https://tu-proyecto-production.up.railway.app
   ```
   (Usa la URL que copiaste de Railway)

3. Guarda el archivo

4. Prueba la conexión:
   ```bash
   node test-api-connection.js
   ```

## 🧪 Verificar que la URL es correcta

Puedes probar la URL directamente en tu navegador:
- `https://tu-url-railway.app/` → Debería mostrar información de la API
- `https://tu-url-railway.app/docs` → Debería mostrar la documentación de Swagger

Si estas URLs funcionan en el navegador, entonces la URL es correcta.

## ⚠️ Nota importante

La URL debe ser:
- ✅ `https://...` (no `http://`)
- ✅ Terminar con `.railway.app` o tu dominio personalizado
- ✅ No tener `/api` al final (solo la URL base)

Ejemplo correcto:
```
https://hackaton-backend-production.up.railway.app
```

Ejemplo incorrecto:
```
https://hackaton-backend-production.up.railway.app/api  ❌
http://hackaton-backend-production.up.railway.app    ❌ (falta la 's' de https)
```

