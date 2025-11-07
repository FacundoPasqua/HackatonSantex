# 🗄️ Configuración de PostgreSQL en Railway

Esta guía te ayudará a configurar una base de datos PostgreSQL en Railway para tu proyecto.

## 📋 Pasos para crear la base de datos en Railway

### 1. Crear un nuevo servicio PostgreSQL en Railway

1. Ve a tu proyecto en [Railway](https://railway.app)
2. Haz clic en **"+ New"** o **"New Service"**
3. Selecciona **"Database"** → **"Add PostgreSQL"**
4. Railway creará automáticamente una instancia de PostgreSQL

### 2. Obtener la URL de conexión

Una vez creada la base de datos:

1. Haz clic en el servicio de PostgreSQL que acabas de crear
2. Ve a la pestaña **"Variables"** o **"Connect"**
3. Railway automáticamente creará una variable de entorno llamada `DATABASE_URL` con la URL de conexión
4. La URL tendrá el formato: `postgres://user:password@host:port/database`

### 3. Conectar la base de datos con tu servicio backend

**Método 1: Usar "Add a Variable Reference" (Recomendado)**

1. En la pantalla de **Variables** de tu servicio PostgreSQL, verás un banner morado que dice:
   > "Trying to connect this database to a service? **Add a Variable Reference**"
2. Haz clic en el enlace **"Add a Variable Reference"** (en morado)
3. Se abrirá un diálogo "Connect to Postgres" con instrucciones:
   - **Paso 1**: Crear una nueva variable en tu servicio backend
   - **Paso 2**: Asignarle el valor: `${{ Postgres.DATABASE_URL }}`
   - **Paso 3**: Usar la variable en tu código (ya está hecho ✅)
4. Copia el valor `${{ Postgres.DATABASE_URL }}` usando el ícono de copiar 📋
5. Ve a tu servicio **Backend** (FastAPI) en Railway
6. Ve a la pestaña **"Variables"**
7. Haz clic en **"+ New Variable"** o **"Add Variable"**
8. Crea una nueva variable:
   - **Nombre**: `DATABASE_URL`
   - **Valor**: Pega `${{ Postgres.DATABASE_URL }}` (el valor que copiaste)
9. Guarda los cambios
10. ¡Listo! Railway automáticamente resolverá la referencia y conectará tu backend a PostgreSQL

**Método 2: Desde el menú de tres puntos**

1. En la lista de variables, encuentra `DATABASE_URL`
2. Haz clic en los **tres puntos** (⋯) a la derecha de `DATABASE_URL`
3. Busca la opción **"Add to Service"** o **"Reference"**
4. Selecciona tu servicio backend de la lista
5. Confirma la acción

**Método 3: Configuración manual (si los métodos anteriores no funcionan)**

1. Haz clic en el **ícono del ojo** 👁️ junto a `DATABASE_URL` para ver el valor
2. Haz clic en el **ícono del portapapeles** 📋 para copiar el valor
3. Ve a tu servicio **Backend** (FastAPI) en Railway
4. Ve a la pestaña **"Variables"**
5. Haz clic en **"+ New Variable"**
6. Agrega:
   - **Nombre**: `DATABASE_URL`
   - **Valor**: Pega el valor que copiaste
7. Guarda los cambios

### 4. Verificar la configuración

Tu código ya está preparado para usar PostgreSQL:

- ✅ `database.py` ya convierte `postgres://` a `postgresql://` (necesario para SQLAlchemy)
- ✅ `requirements.txt` ya incluye `psycopg2-binary` (driver de PostgreSQL)
- ✅ `main.py` crea automáticamente las tablas al iniciar

### 5. Desplegar y verificar

1. Railway detectará automáticamente los cambios y desplegará tu aplicación
2. **Reinicia tu servicio backend** (si no se reinició automáticamente):
   - Ve a tu servicio backend en Railway
   - Haz clic en los **tres puntos** (⋯) en la parte superior
   - Selecciona **"Restart"** o **"Redeploy"**
3. Revisa los logs del servicio backend
4. Deberías ver el mensaje: `✅ Database tables created successfully`
5. Si ves este mensaje, las tablas se han creado correctamente

## 🔍 Verificar que funciona

### ⚠️ Si no ves tablas en la base de datos

**Esto es normal** - las tablas se crean automáticamente cuando tu backend se inicia. Si acabas de configurar `DATABASE_URL`, necesitas:

1. **Reiniciar tu servicio backend**:
   - Ve a tu servicio backend en Railway
   - Haz clic en los **tres puntos** (⋯) → **"Restart"** o **"Redeploy"**
   - Esto forzará que la aplicación se inicie y cree las tablas

2. **Verificar los logs**:
   - Ve a la pestaña **"Deployments"** o **"Logs"** de tu servicio backend
   - Busca el mensaje: `✅ Database tables created successfully`
   - Si ves este mensaje, las tablas se crearon correctamente

3. **Verificar en la base de datos**:
   - Vuelve a la pestaña **"Database"** → **"Data"** de PostgreSQL
   - Haz clic en **"Refresh"** o recarga la página
   - Deberías ver la tabla `test_results`

### Opción 1: Revisar los logs

En Railway, ve a los logs de tu servicio backend y busca:
```
✅ Database tables created successfully
```

Si ves este mensaje, las tablas están creadas. Si ves un error, revisa la sección de solución de problemas.

### Opción 2: Probar la API

1. Ve a `https://tu-backend.railway.app/docs`
2. Prueba el endpoint `GET /api/summary`
3. Debería devolver una respuesta (aunque esté vacía si no hay datos)

### Opción 3: Conectarte directamente a la base de datos

1. En Railway, ve a tu servicio PostgreSQL
2. Haz clic en **"Query"** o **"Connect"**
3. Ejecuta:
```sql
SELECT * FROM test_results LIMIT 5;
```

## ⚠️ Notas importantes

1. **No necesitas crear las tablas manualmente**: El código las crea automáticamente al iniciar
2. **La variable DATABASE_URL es automática**: Railway la crea y actualiza automáticamente
3. **El formato de la URL**: Railway usa `postgres://` pero SQLAlchemy necesita `postgresql://` - tu código ya lo maneja
4. **Backups**: Railway hace backups automáticos de las bases de datos PostgreSQL

## 🆘 Solución de problemas

### Error: "could not connect to server"

- Verifica que el servicio PostgreSQL esté **activo** (debería tener un indicador verde)
- Asegúrate de que `DATABASE_URL` esté configurada en tu servicio backend
- Revisa que la variable esté compartida correctamente entre servicios

### Error: "relation does not exist"

- Las tablas se crean al iniciar la aplicación
- Reinicia tu servicio backend para forzar la creación de tablas
- Revisa los logs para ver si hay errores al crear las tablas

### Error: "psycopg2" no encontrado

- Verifica que `psycopg2-binary==2.9.9` esté en `backend/requirements.txt`
- Railway debería instalar las dependencias automáticamente

## 📚 Recursos adicionales

- [Documentación de Railway sobre PostgreSQL](https://docs.railway.app/databases/postgresql)
- [SQLAlchemy con PostgreSQL](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html)

