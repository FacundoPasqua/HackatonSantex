# 🔧 Solución: Error 502 - Application failed to respond

## ❌ Problema identificado

El error **502 "Application failed to respond"** significa que tu backend en Railway **no está respondiendo**. Esto puede ser por varias razones:

1. El backend no está desplegado o se detuvo
2. El backend está crasheando al iniciar
3. Hay un error en el código que impide que el servidor inicie
4. El backend necesita ser reiniciado

## ✅ Solución paso a paso

### Paso 1: Verificar el estado del backend en Railway

1. Ve a [Railway](https://railway.app)
2. Abre tu proyecto
3. Haz clic en tu servicio **Backend**
4. Ve a la pestaña **"Deployments"** o **"Logs"**
5. Revisa:
   - ¿Hay un deployment reciente?
   - ¿Está en estado "Active" o "Failed"?
   - ¿Qué dicen los logs?

### Paso 2: Revisar los logs del backend

En Railway → Backend → **"Logs"**, busca:

**✅ Si ves esto, está bien:**
```
✅ Database tables created successfully
Application startup complete
Uvicorn running on http://0.0.0.0:PORT
```

**❌ Si ves errores, estos son comunes:**

1. **Error de base de datos:**
   ```
   could not connect to server
   ```
   → Verifica que `DATABASE_URL` esté configurada correctamente

2. **Error de dependencias:**
   ```
   ModuleNotFoundError: No module named 'xxx'
   ```
   → Verifica que `requirements.txt` tenga todas las dependencias

3. **Error de puerto:**
   ```
   Address already in use
   ```
   → Railway maneja esto automáticamente, pero verifica el Procfile

4. **Error de sintaxis:**
   ```
   SyntaxError
   ```
   → Hay un error en el código Python

### Paso 3: Reiniciar el backend

1. En Railway → Backend
2. Haz clic en los **tres puntos** (⋯) en la parte superior
3. Selecciona **"Restart"** o **"Redeploy"**
4. Espera a que termine el deployment
5. Revisa los logs para ver si inicia correctamente

### Paso 4: Verificar variables de entorno

En Railway → Backend → **"Variables"**, verifica que tengas:

- ✅ `DATABASE_URL` con el valor `${{ Postgres.DATABASE_URL }}`
- ✅ `ALLOWED_ORIGINS` (opcional, pero recomendado como `*`)

### Paso 5: Verificar el Procfile

El archivo `backend/Procfile` debe tener:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Paso 6: Verificar requirements.txt

Asegúrate de que `backend/requirements.txt` tenga:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
```

## 🔍 Diagnóstico rápido

Ejecuta este comando para ver el estado actual:

```bash
node test-api-simple.js
```

Si sigue dando error 502, el problema está en Railway, no en tu código local.

## 📋 Checklist de verificación

- [ ] El backend está desplegado en Railway
- [ ] El deployment está en estado "Active" (no "Failed")
- [ ] Los logs muestran "Application startup complete"
- [ ] No hay errores en los logs
- [ ] `DATABASE_URL` está configurada correctamente
- [ ] Las tablas se crearon (mensaje "✅ Database tables created successfully")
- [ ] El Procfile es correcto
- [ ] requirements.txt tiene todas las dependencias

## 🆘 Si el backend sigue sin funcionar

1. **Revisa los logs completos** en Railway
2. **Copia el error específico** que aparece
3. **Verifica el último deployment** - ¿cuándo fue la última vez que funcionó?
4. **Intenta hacer un nuevo deployment** desde GitHub si está conectado

## 💡 Próximos pasos

Una vez que el backend esté funcionando (puedes acceder a `/docs` en el navegador), entonces:
1. Los tests podrán conectarse
2. Los datos se guardarán en PostgreSQL
3. Podrás ver los resultados en Railway → PostgreSQL → Database → Data

