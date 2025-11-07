#!/bin/bash

echo "🚀 Deploy Backend a Render.com"
echo "================================"
echo ""

# Verificar si render CLI está instalado
if ! command -v render &> /dev/null; then
    echo "📦 Instalando Render CLI..."
    curl -fsSL https://render.com/install.sh | bash
    echo ""
    echo "⚠️  Por favor, ejecuta 'render login' para autenticarte"
    echo "   Luego ejecuta este script de nuevo"
    exit 1
fi

# Verificar si está logueado
if ! render whoami &> /dev/null; then
    echo "🔐 Necesitas hacer login en Render"
    echo "   Ejecuta: render login"
    exit 1
fi

echo "✅ Render CLI configurado"
echo ""

# Crear servicio
echo "📝 Creando servicio en Render..."
echo "   Esto puede tardar unos minutos..."
echo ""

cd backend

# Crear servicio web
render services create web \
    --name hackaton-backend \
    --repo https://github.com/FacundoPasqua/HackatonSantex \
    --branch main \
    --root-dir backend \
    --build-command "pip install -r requirements.txt" \
    --start-command "uvicorn app.main:app --host 0.0.0.0 --port \$PORT" \
    --plan free

echo ""
echo "✅ Servicio creado!"
echo ""
echo "📋 Próximos pasos manuales:"
echo "   1. Ve a https://dashboard.render.com"
echo "   2. Selecciona tu servicio 'hackaton-backend'"
echo "   3. Ve a 'Environment' → 'Environment Variables'"
echo "   4. Agrega estas variables:"
echo "      - DATABASE_URL: (copia de tu base de datos PostgreSQL)"
echo "      - ALLOWED_ORIGINS: https://hackaton-santex.vercel.app,http://localhost:3000"
echo "   5. Si no tienes PostgreSQL, créala desde el dashboard"
echo ""

