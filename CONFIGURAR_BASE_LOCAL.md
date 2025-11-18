# Configurar Base de Datos Local para Usar PostgreSQL de Railway

## Pasos para Configurar

### 1. Obtener la DATABASE_URL de Railway

1. Ve a tu proyecto en Railway: https://railway.app
2. Selecciona tu servicio de backend
3. Ve a la pestaña **Variables**
4. Busca la variable `DATABASE_URL`
5. Copia el valor completo (debe verse algo como: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`)

### 2. Configurar en el Backend Local

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Reemplaza** el valor con la DATABASE_URL que copiaste de Railway.

### 3. Verificar la Configuración

1. Reinicia el backend local:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. Deberías ver en los logs:
   ```
   [INFO] Usando base de datos PostgreSQL (Railway)
   ```

3. Si ves:
   ```
   [INFO] Usando base de datos SQLite local
   ```
   Significa que la variable `DATABASE_URL` no se está cargando correctamente. Verifica:
   - Que el archivo `.env` esté en `backend/.env`
   - Que el archivo tenga el formato correcto
   - Que no haya espacios extra alrededor del `=`

## Nota de Seguridad

⚠️ **IMPORTANTE**: El archivo `.env` contiene credenciales sensibles. **NO** lo subas a Git. Asegúrate de que esté en `.gitignore`.

## Verificar que Funciona

Una vez configurado, cuando ejecutes tests localmente, los resultados se guardarán en la base de datos de Railway (producción). Esto te permitirá:

1. Llenar la tabla con resultados reales desde tu máquina local
2. Ver los resultados en el dashboard desplegado
3. Compartir los datos entre tu entorno local y producción

