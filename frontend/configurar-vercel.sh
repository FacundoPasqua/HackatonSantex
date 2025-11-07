#!/bin/bash

echo "========================================"
echo "Configurar Variable de Entorno en Vercel"
echo "========================================"
echo ""

echo "Paso 1: Instalando Vercel CLI (si no está instalado)..."
npm install -g vercel

echo ""
echo "Paso 2: Iniciando sesión en Vercel..."
vercel login

echo ""
echo "Paso 3: Agregando variable de entorno VITE_API_URL..."
echo "Por favor, ingresa la URL de tu backend en Railway cuando te lo pida"
echo "Ejemplo: https://tu-proyecto-production.up.railway.app"
echo ""
vercel env add VITE_API_URL production

echo ""
echo "Paso 4: Redeployando en producción..."
vercel --prod

echo ""
echo "========================================"
echo "¡Listo! Tu variable de entorno ha sido configurada."
echo "========================================"

