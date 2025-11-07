# 📦 Configuración de Monorepo

Este proyecto está configurado como **monorepo** (un solo repositorio con frontend y backend).

## ✅ Ventajas del Monorepo

- ✅ **Un solo repositorio** - Más fácil de gestionar
- ✅ **Cambios sincronizados** - Frontend y backend siempre en la misma versión
- ✅ **Deployment fácil** - Vercel y Railway pueden desplegar desde subdirectorios
- ✅ **Mejor para demos** - Todo en un solo lugar

## 🚀 Deployment desde Monorepo

### Vercel (Frontend)

1. Conecta tu repositorio
2. En la configuración, busca **"Root Directory"**
3. Cambia a: `frontend`
4. Vercel detectará automáticamente Vite y configurará todo

### Railway (Backend)

1. Conecta tu repositorio
2. En la configuración, busca **"Root Directory"** o **"Source"**
3. Cambia a: `backend`
4. Railway detectará Python y configurará todo

## 📝 Si ya tienes repos separados

Si ya tienes 2 repos separados y quieres unirlos:

### Opción A: Crear nuevo repo monorepo

1. Crea un nuevo repositorio en GitHub
2. Copia el contenido de ambos repos:
   ```bash
   # En el nuevo repo
   git clone <repo-backend>
   mv backend/* <nuevo-repo>/backend/
   git clone <repo-frontend>
   mv frontend/* <nuevo-repo>/frontend/
   ```
3. Haz commit y push

### Opción B: Usar uno de los repos existentes

1. Elige uno de tus repos (por ejemplo, el del backend)
2. Agrega el frontend como subdirectorio:
   ```bash
   # En el repo elegido
   git clone <repo-frontend> temp-frontend
   mv temp-frontend/* frontend/
   rm -rf temp-frontend
   ```
3. Haz commit y push

## 🔧 Verificación

Después de configurar el monorepo, verifica que:

- ✅ `backend/` contiene todos los archivos del backend
- ✅ `frontend/` contiene todos los archivos del frontend
- ✅ `.gitignore` está en la raíz
- ✅ `README.md` está actualizado

## 📦 Estructura Final

```
tu-repo/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── tests/
├── .gitignore
└── README.md
```

