# Verificar si Railway está usando el Dockerfile

## 🔍 Paso 1: Verificar en Railway Dashboard

1. **Ve a Railway Dashboard:**
   - https://railway.app
   - Tu proyecto → Servicio "HackatonSantex"

2. **Ve a Settings → Build:**
   - Busca la sección "Build Command" o "Dockerfile"
   - Debería decir algo como "Using Dockerfile" o mostrar el path del Dockerfile

3. **Si NO está usando Dockerfile:**
   - Busca "Build Command" o "Dockerfile Path"
   - Configura manualmente:
     - **Dockerfile Path:** `Dockerfile` (o `/Dockerfile`)
     - **Build Command:** (dejar vacío, usar Dockerfile)
     - Guarda los cambios

## 🔧 Paso 2: Forzar uso de Dockerfile

Si Railway sigue usando Nixpacks, puedes forzarlo de estas formas:

### Opción A: Configuración Manual en Railway

1. **Settings → Build:**
   - Cambia "Build Type" a "Dockerfile"
   - O busca "Use Dockerfile" y actívalo

### Opción B: Eliminar archivos que confunden a Railway

Railway puede detectar automáticamente Python y usar Nixpacks. Elimina o renombra:

- `backend/Procfile` (si existe)
- `backend/runtime.txt` (si existe)
- Cualquier archivo que haga que Railway detecte Python automáticamente

### Opción C: Agregar NIXPACKS_TOML para deshabilitar

Crea `nixpacks.toml` en la raíz:

```toml
[phases.setup]
nixPkgs = { nodejs = "20" }

[phases.install]
cmds = ["echo 'Using Dockerfile instead'"]
```

Pero mejor es usar el Dockerfile directamente.

## 🚨 Paso 3: Verificar Build Logs

1. **Ve a "Deploy Logs" o "Build Logs"**
2. **Busca al inicio del build:**
   - Si ves: `Step 1/10 : FROM python:3.11-slim` → ✅ Está usando Dockerfile
   - Si ves: `[Nixpacks]` o `Detected Python` → ❌ Está usando Nixpacks

## ✅ Solución Definitiva: Configurar en Railway

1. **Railway Dashboard → Tu Servicio → Settings**
2. **Busca "Build" o "Deploy"**
3. **Configura:**
   - **Build Command:** (dejar vacío)
   - **Dockerfile Path:** `Dockerfile`
   - O busca un toggle "Use Dockerfile" y actívalo

4. **Guarda y haz redeploy:**
   - Click en "Deploy" → "Redeploy"
   - O haz un commit vacío para forzar rebuild

## 📝 Verificación Final

Después del redeploy, en los Build Logs deberías ver:

```
Step 1/10 : FROM python:3.11-slim
Step 2/10 : RUN apt-get update && apt-get install -y curl gnupg
Step 3/10 : RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
Step 4/10 : RUN apt-get install -y nodejs
Step 5/10 : RUN node --version && npm --version
v20.x.x
10.x.x
```

Si ves esto, el Dockerfile se está usando correctamente.

